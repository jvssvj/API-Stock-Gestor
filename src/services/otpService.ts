import { prisma } from "../database"
import { HttpError } from "../errors/HttpError"
import { emailService } from "./emailService"

const OTP_EXPIRY_MINUTES = 10

const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString()

export const otpService = {
    // Gera e envia um OTP para o usuário
    generate: async (userId: string, email: string, firstName: string) => {
        // Invalida OTPs anteriores não usados do mesmo usuário
        await prisma.otpCode.updateMany({
            where: { userId, used: false },
            data: { used: true },
        })

        const code = generateCode()
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

        await prisma.otpCode.create({
            data: { userId, code, expiresAt },
        })

        await emailService.sendOtp(email, firstName, code)
    },

    // Valida o OTP — lança erro se inválido ou expirado
    validate: async (userId: string, code: string) => {
        const otp = await prisma.otpCode.findFirst({
            where: {
                userId,
                code,
                used: false,
                expiresAt: { gt: new Date() },
            },
        })

        if (!otp) {
            throw new HttpError(400, "Código inválido ou expirado.")
        }

        // Marca como usado
        await prisma.otpCode.update({
            where: { id: otp.id },
            data: { used: true },
        })
    },

    validateOnly: async (userId: string, code: string) => {
        const otp = await prisma.otpCode.findFirst({
            where: {
                userId,
                code,
                used: false,
                expiresAt: { gt: new Date() },
            },
        })

        if (!otp) throw new HttpError(400, "Código inválido ou expirado.")
    },
}