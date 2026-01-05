import { authControllers } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import itemControllers from "../controllers/itemControllers";

const { Router } = require("express");
export const authRoutes = Router();

authRoutes.post("/login", authControllers.login);
authRoutes.post("/items", authMiddleware, itemControllers.create);
