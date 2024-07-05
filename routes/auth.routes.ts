import { Request, Response, NextFunction, Express } from "express";
import { signup, signin, signout, refreshToken } from "../controllers/auth.controller";
import verifySignIn from "../middlewares/verifySignIn";

export default function (app: Express) {
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });

  app.post(
    "/api/auth/signup",
    [ verifySignIn.checkDuplicateUsernameOrEmail ],
    signup
  );

  app.post("/api/auth/signin", signin);

  app.post("/api/auth/signout", signout);

  app.post("/api/auth/refreshtoken", refreshToken);
}
