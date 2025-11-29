// @ts-nocheck
import "dotenv/config";
import http from "http";
import { setupExpressApp } from "./services/express";
import { setupWebSocketServer } from "./services/websocket";
import { setupGrpcServer } from "./services/grpc";

const app = setupExpressApp();
const server = http.createServer(app);
const wss = setupWebSocketServer(server);
const grpcServer = setupGrpcServer();

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
