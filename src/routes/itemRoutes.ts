import itemControllers from "../controllers/itemControllers";

const { Router } = require("express");
const itemRoutes = Router();

itemRoutes.get("/", itemControllers.items);
itemRoutes.post("/stocks/:stockId/items", itemControllers.create);
itemRoutes.get("/:id", itemControllers.findById);
itemRoutes.put("/:id", itemControllers.update);
itemRoutes.delete("/:id", itemControllers.delete);

export default itemRoutes;
