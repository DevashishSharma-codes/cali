import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";
import { middleware } from "./middleware.js";


const app = express();


app.post("/signin", (req, res) => {
    const userId = "1";
    const token = jwt.sign(
        { userId: "123" },
        JWT_SECRET
    );

    res.json({ token });
});


app.post("/signup", (req, res) => {

});


app.post("/room", middleware, (req, res) => {
    res.json({
        roomId: 12312
    })
});

app.listen(3000, () => {
    console.log('HTTP server is running on http://localhost:3000');
});