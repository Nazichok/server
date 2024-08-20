import { Express } from "express";
import verifyToken from "../middlewares/authJwt";
import {
  allAccess,
  updateUserImg,
  updateUserInfo,
  updateUserPassword,
} from "../controllers/user.controller";
import { upload } from "../misc/multer";

/**
 * Mounts user routes on the Express app.
 * @param app - The Express application.
 * @returns void
 */
export default function (app: Express): void {
  app.get("/api/test/all", verifyToken, allAccess);
  app.patch("/api/user", verifyToken, updateUserInfo);
  app.post("/api/user/img", verifyToken, upload.single("img"), updateUserImg);
  app.post("/api/user/password", verifyToken, updateUserPassword);
}
