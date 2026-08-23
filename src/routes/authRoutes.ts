import { Router } from "express"
import { authControllers } from "../controllers/authController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { authRateLimiter } from "../middlewares/rateLimitMiddleware"

const authRoutes = Router()

authRoutes.post("/login", authRateLimiter, authControllers.login)

// OTP pra trocar senha (logado)
authRoutes.post("/auth/request-otp", authMiddleware, authControllers.requestOtp)

// Esqueci minha senha
authRoutes.post("/auth/forgot-password", authRateLimiter, authControllers.forgotPassword)
authRoutes.post("/auth/reset-password", authControllers.resetPassword)
authRoutes.post("/auth/verify-otp", authControllers.verifyOtp)

// Verificação de email no registro
authRoutes.post("/auth/verify-email", authRateLimiter, authControllers.verifyEmail)

// Troca de email (logado) — fluxo duplo OTP
authRoutes.post("/auth/request-email-change", authMiddleware, authControllers.requestEmailChangeOtp)
authRoutes.post("/auth/confirm-email-change", authMiddleware, authControllers.confirmEmailChange)

export default authRoutes