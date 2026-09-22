import { WebSocket, WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend/config";
import { prismaClient, PrismaClient } from "@repo/db";
interface User {
    ws: WebSocket;
    userId: string;
    rooms: string[];

}

const users: User[] = [];


console.log('WebSocket server is running on ws://localhost:8080');


function checkUser(token: string) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        if (!decoded.userId) {
            return false;
        }
        return decoded.userId;
    } catch (e) {
        return false;
    }
}


wss.on('connection', (ws, request) => {
    console.log('A new client connected!');
    const url = request.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token');
    const userId = checkUser(token ?? "")
    if (!userId) {
        ws.send(JSON.stringify({ message: "You are not authenticated" }))
        ws.close()
        return;
    }


    const currentUser: User = {
        userId,
        rooms: [],
        ws
    };
    users.push(currentUser);

    ws.on('message', async (message) => {
        try {
            console.log(`Received from client: ${message}`);
            const parsedMessage = JSON.parse(message.toString());

            if (parsedMessage.type === 'join_room') {
                const roomId = parsedMessage.roomId?.toString();
                if (roomId && !currentUser.rooms.includes(roomId)) {
                    currentUser.rooms.push(roomId);
                }
            }

            if (parsedMessage.type === "leave_room") {
                const roomId = parsedMessage.roomId?.toString();
                currentUser.rooms = currentUser.rooms.filter(r => r !== roomId);
            }

            if (parsedMessage.type === "chat") {
                const roomId = parsedMessage.roomId;
                const messageText = parsedMessage.message;
                const numericRoomId = Number(roomId);

                if (isNaN(numericRoomId)) {
                    console.error("Invalid roomId provided:", roomId);
                    return;
                }

                // Ensure room exists in DB to prevent foreign key violations
                const existingRoom = await prismaClient.room.findUnique({
                    where: { id: numericRoomId }
                });

                if (!existingRoom) {
                    await prismaClient.room.create({
                        data: {
                            id: numericRoomId,
                            slug: `room-${numericRoomId}-${Date.now()}`,
                            adminId: userId
                        }
                    });
                }

                const chat = await prismaClient.chat.create({
                    data: {
                        roomId: numericRoomId,
                        userId: userId,
                        message: messageText
                    }
                });
                console.log("Chat saved to DB successfully:", chat);

                users.forEach(u => {
                    if (u.rooms.includes(roomId.toString())) {
                        u.ws.send(JSON.stringify({
                            type: "chat",
                            message: messageText,
                            userId,
                            roomId
                        }));
                    }
                });
            }
        } catch (e) {
            console.error("Failed to process message:", e);
        }
    });

    ws.on('close', () => {
        console.log('Client has disconnected');
        const index = users.findIndex(u => u.ws === ws);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });
});