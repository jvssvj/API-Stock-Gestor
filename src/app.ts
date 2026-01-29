import express from 'express'
import cors from "cors";
import authRoutes from './routes/authRoutes';
import userRoutes from "./routes/userRoutes";
import itemRoutes from "./routes/itemRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import errorHandlerMiddleware from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", itemRoutes);
app.use("/api", categoryRoutes);
app.use("/api", dashboardRoutes);
app.use(errorHandlerMiddleware);

export default app;
