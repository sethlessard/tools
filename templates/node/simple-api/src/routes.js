import { Router } from "express";

const routes = Router();

routes.get("/", (req, res) => {
  res.send("GET /");
});

routes.put("/", (req, res) => {
  res.send("PUT /");
});

routes.post("/", (req, res) => {
  res.send("POST /");
});

routes.delete("/", (req, res) => {
  res.send("DELETE /");
});

export default routes;
