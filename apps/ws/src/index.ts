import ws, { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket server is running on ws://localhost:8080');

wss.on('connection', (ws) => {
    console.log('A new client connected!');
    ws.on('message', (message) => {
        console.log(`Received from client: ${message}`);
        ws.send(`Server received: ${message}`);
    });
    ws.on('close', () => {
        console.log('Client has disconnected');
    });
});