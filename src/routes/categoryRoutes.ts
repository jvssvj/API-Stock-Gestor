import { categoryController } from "../controllers/categoryController";
import { authMiddleware } from "../middlewares/authMiddleware";

const { Router } = require("express");
const categoryRoutes = Router();

categoryRoutes.get("/categories", authMiddleware, categoryController.findAll);
categoryRoutes.post("/categories", authMiddleware, categoryController.create);
categoryRoutes.get("/categories/:id", authMiddleware, categoryController.findById);
categoryRoutes.put("/categories/:id", authMiddleware, categoryController.update);
categoryRoutes.delete("/categories/:id", authMiddleware, categoryController.delete);

export default categoryRoutes;
