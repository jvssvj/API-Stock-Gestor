import { Router } from "express";
import { userControllers } from "../controllers/userControllers";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

const userRoutes = Router();

userRoutes.get("/users", authMiddleware, userControllers.findAll);
userRoutes.post("/users", userControllers.create);
userRoutes.get("/users/:id", authMiddleware, userControllers.findById);
userRoutes.put("/users/:id", uploadMiddleware.single('image'), authMiddleware, userControllers.update);
userRoutes.delete("/users/:id", authMiddleware, userControllers.delete);

export default userRoutes;