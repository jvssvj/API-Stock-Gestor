import { prisma } from "../database"
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyOtpSchema } from "../schemas/authSchema"
import { HttpError } from "../errors/HttpError"
import { otpService } from "./otpService"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"

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

    // Bloqueia login se email não verificado
    if (!user.emailVerified) {
      // Reenvia OTP pra facilitar
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
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })
  },

  // Verifica OTP sem consumi-lo (usado no forgot password step 2)
  verifyOtp: async (data: unknown) => {
    const { email, code } = verifyOtpSchema.parse(data)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new HttpError(400, "Código inválido ou expirado.")
    await otpService.validateOnly(user.id, code)
  },

  // Verifica email no registro (consome o OTP e marca emailVerified)
  verifyEmail: async (data: unknown) => {
    const { email, code } = verifyOtpSchema.parse(data)

    const user = await prisma.user.findUnique({ where: { email }, include: { stock: true } })
    if (!user) throw new HttpError(400, "Código inválido ou expirado.")

    if (user.emailVerified) throw new HttpError(400, "E-mail já verificado.")

    await otpService.validate(user.id, code)

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    })

    // Faz login automático após verificar
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
}