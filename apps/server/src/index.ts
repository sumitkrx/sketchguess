import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import type { ServerMessage } from '@sketchguess/shared-types';

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  console.log(`[ws] connection from ${req.socket.remoteAddress}`);
  const hello: ServerMessage = {
    type: 'error',
    payload: { code: 'NOT_IMPLEMENTED', message: 'protocol wired, handlers pending' },
  };
  ws.send(JSON.stringify(hello));
  ws.on('close', () => console.log('[ws] closed'));
});

server.listen(PORT, () => {
  console.log(`[http+ws] listening on http://localhost:${PORT}`);
});
