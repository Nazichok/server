import { NextFunction, Request, Response } from 'express';
import db from '../models';
import { Error } from 'mongoose';

const User = db.user;

/**
 * Check if the provided username or email is already in use.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns void
 */
const checkDuplicateUsernameOrEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Username
    const user1 = await User.findOne({
      username: req.body.username
    });

    if (user1) {
      res.status(400).send({ message: "Failed! Username is already in use!" });
      return;
    }

    // Email
    const user2 = await User.findOne({
      email: req.body.email
    });

    if (user2) {
      res.status(400).send({ message: "Failed! Email is already in use!" });
      return;
    }

    next();
  } catch (err: Error | any) {
    res.status(500).send({ message: err.message || "Couldn't sign up" });
  }
};

const verifySignIn = {
  checkDuplicateUsernameOrEmail,
};

export default verifySignIn;