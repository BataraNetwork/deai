// @ts-nocheck
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { selectBestNode } from "./node";
import { handleInferenceRequest, handleInferenceResult } from "./inference";

export function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const clientId = uuidv4();
    // ... rest of the WebSocket connection logic
  });

  return wss;
}
