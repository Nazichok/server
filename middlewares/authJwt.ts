import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/auth.config";

declare global {
  namespace Express {
    interface Request {
      userId: string; //or can be anythin
    }
  }
}

/**
 * Verify the authentication token.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns void
 */
const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let token = req.session?.token;

  if (!token) {
    res.status(403).send({ message: "No token provided!" });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.secret) as JwtPayload;

    req.userId = decoded.id;
    next();

  } catch (error) {
    res.status(401).send({
      message: "Unauthorized!",
    });
  }
};

export default verifyToken;
