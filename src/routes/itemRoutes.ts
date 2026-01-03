import itemControllers from "../controllers/itemControllers";

const { Router } = require("express");
const itemRoutes = Router();

itemRoutes.get("/items", itemControllers.items);
itemRoutes.post("/stocks/:stockId/items", itemControllers.create);
itemRoutes.get("/items/:id", itemControllers.findById);
itemRoutes.put("/items/:id", itemControllers.update);
itemRoutes.delete("/items/:id", itemControllers.delete);

export default itemRoutes;
