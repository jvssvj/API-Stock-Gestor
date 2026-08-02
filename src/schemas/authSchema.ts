import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido."),
  password: z.string().min(1, "A senha é obrigatória."),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Digite um e-mail válido."),
})

export const resetPasswordSchema = z.object({
  email: z.string().email("Digite um e-mail válido."),
  code: z.string().length(6, "O código deve ter 6 dígitos."),
  newPassword: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
})

export const changePasswordSchema = z.object({
  code: z.string().length(6, "O código deve ter 6 dígitos."),
  newPassword: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
})

export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>