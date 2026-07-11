import { Router } from "express";
import { authControllers } from "../controllers/authController";
import { authRateLimiter } from "../middlewares/rateLimitMiddleware";

const authRoutes = Router()

authRoutes.post("/login", authRateLimiter, authControllers.login)

export default authRoutes
