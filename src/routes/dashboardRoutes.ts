import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authMiddleware } from "../middlewares/authMiddleware";

const dashboardRoutes = Router()

dashboardRoutes.get('/dashboard', authMiddleware, dashboardController.getStats)

export default dashboardRoutes