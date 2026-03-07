import { Router } from "express";
import { authControllers } from "../controllers/authController";

const authRoutes = Router()

authRoutes.post("/login", authControllers.login)

export default authRoutes