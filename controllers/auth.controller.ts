import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config/auth.config";
import db from "../models";

const User = db.user;

export const signup = async (req: Request, res: Response) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  try {
    await user.save();

    res.status(200).send({ message: "User was registered successfully!" });
  } catch (err) {
    console.log("user save error", err);
    res.status(500).send({ message: err });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    });

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid Password!" });
    }

    const token = jwt.sign({ id: user.id }, config.secret, {
      algorithm: "HS256",
      allowInsecureKeySizes: true,
      expiresIn: 86400, // 24 hours
    });

    if (req.session) {
      req.session.token = token;
    }

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

export const signout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.session = null;
    res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    next(err);
  }
};
