import { Router } from 'express';
import itemControllers from "../controllers/itemControllers";
import { authMiddleware } from "../middlewares/authMiddleware";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";


const itemRoutes = Router();

itemRoutes.get("/items", authMiddleware, itemControllers.items);
itemRoutes.post("/items", authMiddleware, uploadMiddleware.single('image'), itemControllers.create);
itemRoutes.get("/items/:id", authMiddleware, itemControllers.findById);
itemRoutes.put("/items/:id", authMiddleware, uploadMiddleware.single('image'), itemControllers.update);
itemRoutes.delete("/items/:id", authMiddleware, itemControllers.delete);

export default itemRoutes;
