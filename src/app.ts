import { Request, Response } from "express";
import cors from "cors";
const express = require("express");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "funcionando" });
});

export default app;
