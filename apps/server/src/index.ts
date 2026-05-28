import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { prisma } from "./db/client";
import { handleMessage, handleLeave } from "./ws/handlers";
import { send } from "./ws/broadcast";

const PORT = Number(process.env.PORT) || 4000;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    const words = await prisma.word.count();
    res.json({ status: "ok", db: "connected", words, ts: Date.now() });
  } catch (err) {
    console.error("[health] db error", err);
    res.status(500).json({ status: "error", db: "disconnected", ts: Date.now() });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  console.log(`[ws] connection from ${req.socket.remoteAddress}`);

  ws.on("message", (data) => {
    handleMessage(ws, data.toString()).catch((err) => {
      console.error("[ws] handler error", err);
      send(ws, { type: "error", payload: { code: "INTERNAL", message: "Server error" } });
    });
  });

  ws.on("close", () => {
    handleLeave(ws).catch((err) => console.error("[ws] close error", err));
  });
});

server.listen(PORT, () => {
  console.log(`[http+ws] listening on http://localhost:${PORT}`);
});
