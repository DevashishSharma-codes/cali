import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend/config";
import { middleware } from "./middleware.js";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db";
const app = express();
app.use(cors());
app.use(express.json());


app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "Invalid input"
        });
    }

    try {
        const existingUser = await prismaClient.user.findFirst({
            where: {
                email: parsedData.data.email,
            }
        });

        if (existingUser) {
            return res.status(411).json({
                message: "User already exists with this email"
            });
        }

        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.email,
                password: parsedData.data.password,
                name: parsedData.data.name,
                photo: parsedData.data.photo,
            }
        });

        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET
        );

        res.json({
            userId: user.id,
            token
        });
    } catch (e) {
        res.status(500).json({
            message: "Error signing up"
        });
    }
});

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "Invalid input"
        });
    }

    try {
        const user = await prismaClient.user.findFirst({
            where: {
                email: parsedData.data.email,
                password: parsedData.data.password,
            }
        });

        if (!user) {
            return res.status(403).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET
        );

        res.json({
            userId: user.id,
            token
        });
    } catch (e) {
        res.status(500).json({
            message: "Error signing in"
        });
    }
});

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "Invalid input"
        });
    }
    const userId = req.userId;
    if (!userId) {
        return res.status(403).json({
            message: "Unauthorized"
        });
    }
    try {
        const room = await prismaClient.room.create({
            data: {
                adminId: userId,
                slug: parsedData.data.slug,
            }
        });
        res.json({
            roomId: room.id
        });
    } catch (e) {
        res.status(411).json({
            message: "Room already exists or error creating room"
        });
    }
});

app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug: slug
        }
    });

    if (!room) {
        return res.status(404).json({
            message: "Room not found"
        });
    }

    res.json({
        room
    });
});

app.get("/chats/:roomId", async (req, res) => {
    const roomId = Number(req.params.roomId);
    const messages = await prismaClient.chat.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            id: 'desc'
        },
        take: 100
    });

    res.json({ messages });
});


app.listen(3001, () => {
    console.log('HTTP server is running on http://localhost:3001');
});