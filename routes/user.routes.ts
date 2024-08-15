import { Express } from "express";
import verifyToken from "../middlewares/authJwt";
import { allAccess, updateUserImg } from "../controllers/user.controller";

/**
 * Mounts user routes on the Express app.
 * @param app - The Express application.
 * @returns void
 */
export default function (app: Express): void {
  app.get("/api/test/all", verifyToken, allAccess);
  app.post("/api/user/img", verifyToken, updateUserImg);
}
