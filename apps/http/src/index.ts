import express from "express";

const app = express();

app.listen(3000, () => {
    console.log('HTTP server is running on http://localhost:3000');
});