import { Router } from "express"
import { authControllers } from "../controllers/authController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { authRateLimiter } from "../middlewares/rateLimitMiddleware"

const authRoutes = Router()

authRoutes.post("/login", authRateLimiter, authControllers.login)

// Usuário LOGADO — solicita OTP para trocar senha
authRoutes.post("/auth/request-otp", authMiddleware, authControllers.requestOtp)

// Esqueci minha senha
authRoutes.post("/auth/forgot-password", authRateLimiter, authControllers.forgotPassword)
authRoutes.post("/auth/reset-password", authControllers.resetPassword)
authRoutes.post("/auth/verify-otp", authControllers.verifyOtp)

// Verificação de email no registro
authRoutes.post("/auth/verify-email", authRateLimiter, authControllers.verifyEmail)

export default authRoutes