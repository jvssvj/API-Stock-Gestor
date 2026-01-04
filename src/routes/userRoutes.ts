import { userControllers } from "../controllers/userControllers";

const { Router } = require("express");
const userRoutes = Router();

userRoutes.get("/users", userControllers.findAll);
userRoutes.post("/users", userControllers.create);
userRoutes.get("/users/:id", userControllers.findById);
userRoutes.put("/users/:id", userControllers.update);
userRoutes.delete("/users/:id", userControllers.delete);

export default userRoutes;
