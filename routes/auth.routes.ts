import { Express } from "express";
import {
  signup,
  signin,
  signout,
  refreshToken,
  resetPasswordRequest,
  resetPassword,
} from "../controllers/auth.controller";
import verifySignIn from "../middlewares/verifySignIn";

export default function (app: Express) {
  app.post(
    "/api/auth/signup",
    [verifySignIn.checkDuplicateUsernameOrEmail],
    signup
  );

  app.post("/api/auth/signin", signin);

  app.post("/api/auth/signout", signout);

  app.post("/api/auth/refreshtoken", refreshToken);

  app.post("/api/auth/resetpasswordrequest", resetPasswordRequest);

  app.post("/api/auth/resetpassword", resetPassword);
}
