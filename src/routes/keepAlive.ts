// src/routes/keepalive.ts
import { Router } from "express";
import { prisma } from "../database";


const keepAliveRoutes = Router();

keepAliveRoutes.get("/keepalive", async (req, res) => {
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        await prisma.$queryRaw`SELECT 1`;
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ ok: false });
    }
});

export default keepAliveRoutes;