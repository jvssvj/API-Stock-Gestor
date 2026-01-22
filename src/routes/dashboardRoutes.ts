import { dashboardController } from "../controllers/dashboardController"
import { authMiddleware } from "../middlewares/authMiddleware"
const { Router } = require('express')
const dashboardRoutes = Router()

dashboardRoutes.get('/dashboard', authMiddleware, dashboardController.getStats)


export default dashboardRoutes