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

const { TokenExpiredError } = jwt;

const catchError = (err: Error, res: Response) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.sendStatus(401).send({ message: "Unauthorized!" });
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
) => {
  let token = req.headers["x-access-token"] as string;

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  try {
    const decoded = jwt.verify(token, config.secret) as JwtPayload;

    req.userId = decoded.id;
    next();

  } catch (error: Error | any) {
    return catchError(error, res);
  }
};

export default verifyToken;
