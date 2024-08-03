import { Express } from "express";
import {
  signup,
  signin,
  signout,
  refreshToken,
} from "../controllers/auth.controller";
import verifySignIn from "../middlewares/verifySignIn";
import verifyToken from "../middlewares/authJwt";

export default function (app: Express) {
  app.post(
    "/api/auth/signup",
    [verifySignIn.checkDuplicateUsernameOrEmail],
    signup
  );

  app.post("/api/auth/signin", signin);

  app.post("/api/auth/signout", verifyToken, signout);

  app.post("/api/auth/refreshtoken", refreshToken);
}
