import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config/auth.config";
import db from "../models";

const User = db.user;
const RefreshToken = db.refreshToken;

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
    res.status(500).send({ message: JSON.stringify(err) });
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
      expiresIn: config.jwtExpiration,
    });

    let refreshToken = await RefreshToken.createToken(user);

    if (req.session) {
      req.session.token = token;
      req.session.refreshToken = refreshToken;
    }

    res.status(200).send({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    res.status(500).send({ message: JSON.stringify(err) });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const requestToken = req?.session?.refreshToken;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token is not in database!" });
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {

      RefreshToken.findByIdAndDelete(refreshToken._id, {
        useFindAndModify: false,
      }).exec();

      return res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
    }

    let newAccessToken = jwt.sign(
      { id: refreshToken.user._id },
      config.secret,
      {
        expiresIn: config.jwtExpiration,
      }
    );

    if (req.session) {
      req.session.token = newAccessToken;
    }

    return res.status(200).send({});
  } catch (err) {
    return res.status(500).send({ message: JSON.stringify(err) });
  }
};

export const signout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;
    req.session = null;
    await RefreshToken.deleteMany({ user: { $eq: userId } });
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    return next(err);
  }
};
