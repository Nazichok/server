import { Express } from "express";
import verifyToken from "../middlewares/authJwt";
import { createChat, getChat, getChats, searchUsers } from "../controllers/chat.controller";

/**
 * Mounts user routes on the Express app.
 * @param app - The Express application.
 * @returns void
 */
export default function (app: Express): void {
  app.get("/api/users/search", verifyToken, searchUsers);

  app.get("/api/chats", verifyToken, getChats);
  app.get("/api/chats/:id", verifyToken, getChat);
  app.post("/api/chats", verifyToken, createChat);
}
