import { prisma } from "../database"
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyOtpSchema } from "../schemas/authSchema"
import { HttpError } from "../errors/HttpError"
import { otpService } from "./otpService"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"
import { z } from "zod"

const sendEmailChangeOtpSchema = z.object({
  newEmail: z.string().email("Digite um e-mail válido."),
})

const confirmEmailChangeSchema = z.object({
  currentEmailCode: z.string().length(6, "Código inválido."),
  newEmail: z.string().email("Digite um e-mail válido."),
  newEmailCode: z.string().length(6, "Código inválido."),
})

export const authService = {
  login: async (data: unknown) => {
    const { email, password } = loginSchema.parse(data)

    const user = await prisma.user.findUnique({
      where: { email },
      include: { stock: true },
    })

    if (!user) throw new HttpError(401, "E-mail ou senha inválidos")

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) throw new HttpError(401, "E-mail ou senha inválidos")

    if (!user.emailVerified) {
      await otpService.generate(user.id, user.email, user.firstName)
      throw new HttpError(403, "E-mail não verificado. Reenviamos o código para o seu e-mail.")
    }

    const secret = process.env.JWT_SECRET!
    const token = jwt.sign(
      { userId: user.id, firstName: user.firstName, lastName: user.lastName, stockId: user.stock?.id },
      secret,
      { expiresIn: "1d", algorithm: "HS256" }
    )

    return {
      token,
      user: {
        userId: user.id,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        stockId: user.stock?.id,
      },
    }
  },

  // OTP pro email atual (troca de senha, etc)
  requestOtp: async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new HttpError(404, "Usuário não encontrado.")
    await otpService.generate(user.id, user.email, user.firstName)
  },

  forgotPassword: async (data: unknown) => {
    const { email } = forgotPasswordSchema.parse(data)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return
    await otpService.generate(user.id, user.email, user.firstName)
  },

  resetPassword: async (data: unknown) => {
    const { email, code, newPassword } = resetPasswordSchema.parse(data)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new HttpError(400, "Código inválido ou expirado.")
    await otpService.validate(user.id, code)
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } })
  },

  verifyOtp: async (data: unknown) => {
    const { email, code } = verifyOtpSchema.parse(data)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new HttpError(400, "Código inválido ou expirado.")
    await otpService.validateOnly(user.id, code)
  },

  // Verificação de email no registro
  verifyEmail: async (data: unknown) => {
    const { email, code } = verifyOtpSchema.parse(data)
    const user = await prisma.user.findUnique({ where: { email }, include: { stock: true } })
    if (!user) throw new HttpError(400, "Código inválido ou expirado.")
    if (user.emailVerified) throw new HttpError(400, "E-mail já verificado.")

    await otpService.validate(user.id, code)
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } })

    const secret = process.env.JWT_SECRET!
    const token = jwt.sign(
      { userId: user.id, firstName: user.firstName, lastName: user.lastName, stockId: user.stock?.id },
      secret,
      { expiresIn: "1d", algorithm: "HS256" }
    )

    return {
      token,
      user: {
        userId: user.id,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        stockId: user.stock?.id,
      },
    }
  },

  // Step 1 da troca de email: envia OTP pro email ATUAL e pro NOVO email
  requestEmailChangeOtp: async (userId: string, data: unknown) => {
    const { newEmail } = sendEmailChangeOtpSchema.parse(data)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new HttpError(404, "Usuário não encontrado.")

    // Verifica se novo email já está em uso
    const emailInUse = await prisma.user.findUnique({ where: { email: newEmail } })
    if (emailInUse) {
      throw new HttpError(400, "Este e-mail já está sendo usado por outro usuário.")
    }

    // Envia OTP pro email ATUAL (confirmar identidade)
    await otpService.generate(user.id, user.email, user.firstName)

    // Envia OTP pro email NOVO (confirmar acesso)
    // Usa um prefixo no código pra diferenciar — armazena com email temporário
    await otpService.generateForEmail(newEmail, user.firstName)

    return { currentEmail: user.email, newEmail }
  },

  // Step 2: valida os dois códigos e troca o email
  confirmEmailChange: async (userId: string, data: unknown) => {
    const { currentEmailCode, newEmail, newEmailCode } = confirmEmailChangeSchema.parse(data)

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { stock: true } })
    if (!user) throw new HttpError(404, "Usuário não encontrado.")

    // Valida OTP do email atual
    await otpService.validate(userId, currentEmailCode)

    // Valida OTP do email novo
    await otpService.validateForEmail(newEmail, newEmailCode)

    // Atualiza o email
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
      include: { stock: true },
    })

    // Retorna novo token com email atualizado
    const secret = process.env.JWT_SECRET!
    const token = jwt.sign(
      { userId: updatedUser.id, firstName: updatedUser.firstName, lastName: updatedUser.lastName, stockId: updatedUser.stock?.id },
      secret,
      { expiresIn: "1d", algorithm: "HS256" }
    )

    return {
      token,
      user: {
        userId: updatedUser.id,
        avatarUrl: updatedUser.avatarUrl,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        stockId: updatedUser.stock?.id,
      },
    }
  },
}