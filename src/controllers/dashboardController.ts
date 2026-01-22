import { NextFunction, Request, Response } from "express";
import { dashboardService } from "../services/dashboardService";

export const dashboardController = {
    getStats: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await dashboardService.getStats(req.userId)
            return res.status(200).json({ stats })
        } catch (error) {
            next()
        }
    }
}