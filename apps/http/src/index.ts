import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend/config";
import { middleware } from "./middleware.js";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types";

const app = express();


app.post("/signin", (req, res) => {

    const data = SigninSchema.safeParse(req.body);
    if (!data.success) {
        return res.status(411).json({
            message: "Invalid input"
        })
    }
    const userId = "1";
    const token = jwt.sign(
        { userId: "123" },
        JWT_SECRET
    );

    res.json({ token });
});


app.post("/signup", (req, res) => {
    const data = CreateUserSchema.safeParse(req.body);
    if (!data.success) {
        return res.status(411).json({
            message: "Invalid input"
        })
    }
    res.json({
        data
    })
});


app.post("/room", middleware, (req, res) => {
    const data = CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
        return res.status(411).json({
            message: "Invalid input"
        })
    }
    res.json({
        roomId: 12312
    })
});

app.listen(3000, () => {
    console.log('HTTP server is running on http://localhost:3000');
});