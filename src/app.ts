import itemRoutes from "./routes/itemRoutes";
import { errorHandlerMiddleware } from "./middlewares/errorHandler";
// import cors from "cors";

const express = require("express");
const app = express();

// app.use(cors());
app.use(express.json());
app.use("/api/items", itemRoutes);
app.use(errorHandlerMiddleware);

export default app;
