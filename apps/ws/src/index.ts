import ws, { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend/config";


console.log('WebSocket server is running on ws://localhost:8080');

wss.on('connection', (ws, request) => {
    console.log('A new client connected!');
    const url = request.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token');
    if (!token) {
        return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded.userId) {
        ws.close();
        return;
    }

    ws.on('message', (message) => {
        console.log(`Received from client: ${message}`);
        ws.send(`Server received: ${message}`);
    });
    ws.on('close', () => {
        console.log('Client has disconnected');
    });
});