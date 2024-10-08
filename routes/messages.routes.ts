import { Express } from "express";
import verifyToken from "../middlewares/authJwt";
import { getMessages } from "../controllers/messages.controller";

/**
 * Mounts user routes on the Express app.
 * @param app - The Express application.
 * @returns void
 */
export default function (app: Express): void {
  app.get("/api/messages", verifyToken, getMessages);
}
