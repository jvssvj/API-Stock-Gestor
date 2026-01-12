import itemRoutes from "./routes/itemRoutes";
import { errorHandlerMiddleware } from "./middlewares/errorHandler";
import userRoutes from "./routes/userRoutes";
import { authRoutes } from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
// import cors from "cors";

const express = require("express");
const app = express();

// app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", itemRoutes);
app.use("/api", categoryRoutes);
app.use(errorHandlerMiddleware);

export default app;
