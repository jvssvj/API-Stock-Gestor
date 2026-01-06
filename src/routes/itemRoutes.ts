import itemControllers from "../controllers/itemControllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const { Router } = require("express");
const itemRoutes = Router();

itemRoutes.get("/items", authMiddleware, itemControllers.items);
itemRoutes.post("/items", authMiddleware, itemControllers.create);
itemRoutes.get("/items/:id", authMiddleware, itemControllers.findById);
itemRoutes.put("/items/:id", authMiddleware, itemControllers.update);
itemRoutes.delete("/items/:id", authMiddleware, itemControllers.delete);

export default itemRoutes;
