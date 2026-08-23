import { prisma } from "../database"
import { HttpError } from "../errors/HttpError"
import { emailService } from "./emailService"

const OTP_EXPIRY_MINUTES = 10

const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString()

export const otpService = {
    // Gera OTP vinculado a um userId (usuário já cadastrado)
    generate: async (userId: string, email: string, firstName: string) => {
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

    // Gera OTP vinculado a um email externo (ex: novo email antes de ser cadastrado)
    generateForEmail: async (email: string, firstName: string) => {
        // Invalida OTPs anteriores pro mesmo email externo
        await prisma.emailOtpCode.updateMany({
            where: { email, used: false },
            data: { used: true },
        })

        const code = generateCode()
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

        await prisma.emailOtpCode.create({
            data: { email, code, expiresAt },
        })

        await emailService.sendOtp(email, firstName, code)
    },

    // Valida e consome OTP de userId
    validate: async (userId: string, code: string) => {
        const otp = await prisma.otpCode.findFirst({
            where: { userId, code, used: false, expiresAt: { gt: new Date() } },
        })

        if (!otp) throw new HttpError(400, "Código inválido ou expirado.")

        await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })
    },

    // Valida sem consumir (usado no forgot password step 2)
    validateOnly: async (userId: string, code: string) => {
        const otp = await prisma.otpCode.findFirst({
            where: { userId, code, used: false, expiresAt: { gt: new Date() } },
        })

        if (!otp) throw new HttpError(400, "Código inválido ou expirado.")
    },

    // Valida e consome OTP de email externo
    validateForEmail: async (email: string, code: string) => {
        const otp = await prisma.emailOtpCode.findFirst({
            where: { email, code, used: false, expiresAt: { gt: new Date() } },
        })

        if (!otp) throw new HttpError(400, "Código do novo e-mail inválido ou expirado.")

        await prisma.emailOtpCode.update({ where: { id: otp.id }, data: { used: true } })
    },
}