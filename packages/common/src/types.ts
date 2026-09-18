import { z } from "zod";

export const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string(),
    photo: z.string().optional()
});

export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const CreateRoomSchema = z.object({
    slug: z.string().min(3).max(20)
});

export const CreateChatSchema = z.object({
    roomId: z.number(),
    message: z.string()
});

export type CreateUserType = z.infer<typeof CreateUserSchema>;
export type SigninType = z.infer<typeof SigninSchema>;
export type CreateRoomType = z.infer<typeof CreateRoomSchema>;
export type CreateChatType = z.infer<typeof CreateChatSchema>;

