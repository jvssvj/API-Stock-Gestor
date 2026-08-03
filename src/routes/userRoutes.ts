import { Router } from "express";
import { userControllers } from "../controllers/userControllers";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authRateLimiter } from "../middlewares/rateLimitMiddleware";

const userRoutes = Router()

userRoutes.post("/register", authRateLimiter, userControllers.create)
userRoutes.get("/users/me", authMiddleware, userControllers.findById)
userRoutes.put("/users/me", authMiddleware, uploadMiddleware.single('image'), userControllers.update)
userRoutes.delete("/users/me", authMiddleware, userControllers.delete)
userRoutes.post("/users/me/password", authMiddleware, userControllers.changePassword)

export default userRoutes
