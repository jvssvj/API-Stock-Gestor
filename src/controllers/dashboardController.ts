import { NextFunction, Request, Response } from "express";
import { dashboardService } from "../services/dashboardService";

export const dashboardController = {
    getStats: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await dashboardService.getStats(req.stockId)
            return res.status(200).json({ data: stats })
        } catch (error) {
            next(error)
        }
    }
}