// @ts-nocheck
import express from "express";
import bodyParser from "body-parser";
import { setupRoutes } from "./routes";

export function setupExpressApp() {
  const app = express();
  app.use(bodyParser.json());

  setupRoutes(app);

  return app;
}
