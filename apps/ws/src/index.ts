import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend/config";
import { prismaClient } from "@repo/db";

// 1. Create HTTP server (with simple health check response and CORS for probes)
const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("WebSocket Server is running");
});

// 2. Attach WebSocketServer to the HTTP server with open origin verification
const wss = new WebSocketServer({
    server,
    verifyClient: () => true
});

interface User {
    ws: WebSocket;
    userId: string;
    rooms: string[];
}

const users: User[] = [];

function checkUser(token: string): string | false {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        if (!decoded || !decoded.userId) {
            return false;
        }
        return decoded.userId;
    } catch (e) {
        return false;
    }
}

async function ensureUserExists(userId: string) {
    try {
        await prismaClient.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                email: `${userId}@picasso.app`,
                name: "Picasso Collaborator",
                password: "oauth_or_guest"
            }
        });
    } catch (e) {
        console.error("Error ensuring user exists:", e);
    }
}

async function getOrCreateRoomId(roomIdentifier: string, adminId: string): Promise<number | null> {
    try {
        await ensureUserExists(adminId);
        const numericId = Number(roomIdentifier);
        if (!isNaN(numericId) && numericId > 0 && Number.isInteger(numericId)) {
            const existing = await prismaClient.room.findUnique({
                where: { id: numericId }
            });
            if (existing) return existing.id;
            const created = await prismaClient.room.create({
                data: {
                    id: numericId,
                    slug: `room-${numericId}`,
                    adminId
                }
            });
            return created.id;
        } else {
            // Slug string
            const existing = await prismaClient.room.findUnique({
                where: { slug: roomIdentifier }
            });
            if (existing) return existing.id;
            const created = await prismaClient.room.create({
                data: {
                    slug: roomIdentifier,
                    adminId
                }
            });
            return created.id;
        }
    } catch (e) {
        console.error("Error in getOrCreateRoomId:", e);
        return null;
    }
}

wss.on('connection', (ws, request) => {
    console.log('A new client connected to WebSocket!');
    const url = request.url;
    const queryParams = url ? new URLSearchParams(url.split('?')[1]) : new URLSearchParams();
    const token = queryParams.get('token');
    const requestedUserId = queryParams.get('userId');

    let userId: string = "";
    if (token) {
        const verified = checkUser(token);
        if (verified) {
            userId = verified;
        }
    }

    if (!userId) {
        userId = requestedUserId || `guest_${Math.random().toString(36).substring(2, 9)}`;
    }

    // Ensure user exists in Postgres database
    ensureUserExists(userId);

    const currentUser: User = {
        userId,
        rooms: [],
        ws
    };
    users.push(currentUser);

    ws.on('message', async (message) => {
        try {
            console.log(`Received from client [${userId}]: ${message}`);
            const parsedMessage = JSON.parse(message.toString());

            if (parsedMessage.type === 'join_room') {
                const roomId = parsedMessage.roomId?.toString();
                if (roomId && !currentUser.rooms.includes(roomId)) {
                    currentUser.rooms.push(roomId);
                    console.log(`User [${userId}] joined room [${roomId}] (Total users in room: ${users.filter(u => u.rooms.includes(roomId)).length})`);
                }
            }

            if (parsedMessage.type === "leave_room") {
                const roomId = parsedMessage.roomId?.toString();
                currentUser.rooms = currentUser.rooms.filter(r => r !== roomId);
            }

            if (parsedMessage.type === "chat") {
                const roomId = parsedMessage.roomId?.toString();
                const messageText = parsedMessage.message;

                if (!roomId || !messageText) {
                    return;
                }

                // Get or create room ID in database
                const dbRoomId = await getOrCreateRoomId(roomId, userId);
                let savedChatId: number | undefined;

                if (dbRoomId) {
                    try {
                        const chat = await prismaClient.chat.create({
                            data: {
                                roomId: dbRoomId,
                                userId: userId,
                                message: typeof messageText === 'string' ? messageText : JSON.stringify(messageText)
                            }
                        });
                        savedChatId = chat.id;
                        console.log("Chat saved to DB successfully, ID:", savedChatId);
                    } catch (dbErr) {
                        console.error("DB chat create error:", dbErr);
                    }
                }

                let outboundMessage = messageText;
                try {
                    const parsedShape = typeof messageText === 'string' ? JSON.parse(messageText) : messageText;
                    if (savedChatId) {
                        parsedShape.id = savedChatId;
                    }
                    outboundMessage = JSON.stringify(parsedShape);
                } catch (err) {}

                // Broadcast immediately to ALL users in the same room
                users.forEach(u => {
                    if (u.rooms.includes(roomId) && u.ws.readyState === WebSocket.OPEN) {
                        u.ws.send(JSON.stringify({
                            type: "chat",
                            message: outboundMessage,
                            userId,
                            senderId: parsedMessage.senderId,
                            roomId,
                            id: savedChatId
                        }));
                    }
                });
            }

            if (parsedMessage.type === "delete_shape") {
                const roomId = parsedMessage.roomId?.toString();
                const shapeId = Number(parsedMessage.shapeId);
                if (!isNaN(shapeId)) {
                    try {
                        await prismaClient.chat.deleteMany({
                            where: { id: shapeId }
                        });
                        console.log(`Deleted chat/shape ${shapeId} from DB`);
                    } catch (e) {
                        console.error(`Failed to delete chat ${shapeId} from DB:`, e);
                    }
                }

                users.forEach(u => {
                    if (roomId && u.rooms.includes(roomId) && u.ws.readyState === WebSocket.OPEN) {
                        u.ws.send(JSON.stringify({
                            type: "delete_shape",
                            shapeId: parsedMessage.shapeId,
                            senderId: parsedMessage.senderId,
                            roomId
                        }));
                    }
                });
            }

            if (parsedMessage.type === "update_shape") {
                const roomId = parsedMessage.roomId?.toString();
                const messageText = typeof parsedMessage.message === 'string' ? parsedMessage.message : JSON.stringify(parsedMessage.message);
                const shapeId = Number(parsedMessage.shapeId);

                if (!isNaN(shapeId) && messageText) {
                    try {
                        await prismaClient.chat.updateMany({
                            where: { id: shapeId },
                            data: { message: messageText }
                        });
                        console.log(`Updated chat/shape ${shapeId} in DB`);
                    } catch (e) {
                        console.error(`Failed to update chat ${shapeId} in DB:`, e);
                    }
                }

                users.forEach(u => {
                    if (roomId && u.rooms.includes(roomId) && u.ws.readyState === WebSocket.OPEN) {
                        u.ws.send(JSON.stringify({
                            type: "update_shape",
                            shapeId,
                            message: messageText,
                            senderId: parsedMessage.senderId,
                            roomId
                        }));
                    }
                });
            }

            // In-Memory Ephemeral Live Dragging (Zero DB writes, sub-1ms RAM broadcast to peers)
            if (parsedMessage.type === "peer_drag") {
                const roomId = parsedMessage.roomId?.toString();
                const senderId = parsedMessage.senderId;
                const shapes = parsedMessage.shapes;

                if (roomId && shapes) {
                    users.forEach(u => {
                        if (u.ws !== ws && u.rooms.includes(roomId) && u.ws.readyState === WebSocket.OPEN) {
                            u.ws.send(JSON.stringify({
                                type: "peer_drag",
                                roomId,
                                senderId,
                                shapes
                            }));
                        }
                    });
                }
            }

            // In-Memory Ephemeral Live Cursor Stream
            if (parsedMessage.type === "peer_cursor") {
                const roomId = parsedMessage.roomId?.toString();
                if (roomId) {
                    users.forEach(u => {
                        if (u.ws !== ws && u.rooms.includes(roomId) && u.ws.readyState === WebSocket.OPEN) {
                            u.ws.send(JSON.stringify({
                                type: "peer_cursor",
                                userId,
                                senderId: parsedMessage.senderId,
                                x: parsedMessage.x,
                                y: parsedMessage.y,
                                roomId
                            }));
                        }
                    });
                }
            }
        } catch (e) {
            console.error("Failed to process message:", e);
        }
    });

    ws.on('close', () => {
        console.log(`Client [${userId}] has disconnected`);
        const index = users.findIndex(u => u.ws === ws);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });

    ws.on('error', (err) => {
        console.error(`WebSocket error for user [${userId}]:`, err);
    });
});

// 3. Start the HTTP server with Render / local port support
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`);
});