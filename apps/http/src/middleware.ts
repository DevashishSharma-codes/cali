import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend/config";

// Extend the Express Request interface to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

interface CustomJwtPayload extends JwtPayload {
    userId: string;
}

export function middleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["authorization"] ?? "";

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
        if (decoded && decoded.userId) {
            req.userId = decoded.userId;
            next();
        } else {
            res.status(403).json({ message: "You are not authenticated" });
        }
    } catch (e) {
        res.status(403).json({ message: "You are not authenticated" });
    }
}