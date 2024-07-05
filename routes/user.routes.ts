import { Express, Request, Response, NextFunction } from "express";
import verifyToken from "../middlewares/authJwt";
import { allAccess, userBoard } from "../controllers/user.controller";

/**
 * Mounts user routes on the Express app.
 * @param app - The Express application.
 * @returns void
 */
export default function(app: Express): void {
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", allAccess);

  app.get("/api/test/user", [verifyToken], userBoard);
}
