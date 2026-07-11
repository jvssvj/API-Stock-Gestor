import express from 'express';
import "express-async-errors";
import cors from "cors";
import authRoutes from './routes/authRoutes';
import userRoutes from "./routes/userRoutes";
import itemRoutes from "./routes/itemRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import errorHandlerMiddleware from "./middlewares/errorHandlerMiddleware";
import { securityHeadersMiddleware } from './middlewares/securityHeadersMiddleware';
import { generalRateLimiter } from './middlewares/rateLimitMiddleware';
import { validateEnv } from './config/env';

validateEnv()
const app = express()

app.set("trust proxy", 1)
app.use(securityHeadersMiddleware)
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }))
app.use(generalRateLimiter)
app.use(express.json({ limit: "1mb" }))
app.use("/api", authRoutes)
app.use("/api", userRoutes)
app.use("/api", itemRoutes)
app.use("/api", categoryRoutes)
app.use("/api", dashboardRoutes)
app.use(errorHandlerMiddleware)

export default app
