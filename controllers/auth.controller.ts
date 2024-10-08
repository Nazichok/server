import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import EmailToken from "../models/EmailToken";
import crypto from "crypto";
import { sendEmail } from "../misc/email";

export const signup = async (req: Request, res: Response) => {
  if (!process.env.BCRYPT_SALT) {
    throw new Error("Please define the BCRYPT_SALT environment variable.");
  }

  try {
    const user = await new User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(
        req.body.password,
        Number(process.env.BCRYPT_SALT)
      ),
    }).save();

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(process.env.BCRYPT_SALT));

    const token = await new EmailToken({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const link = `${ process.env.CLIENT_URL }/confirm-email?id=${user._id}&token=${resetToken}`;
    await sendEmail(
      user.email,
      "Registration Successful",
      { name: user.username, link },
      "../template/confirmEmail.handlebars"
    );

    return res.status(200).send({ message: "Registration Successful! Check your email" });
  } catch (err) {
    return res.status(500).send({ message: JSON.stringify(err) });
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

    if (!user.password) {
      return res.status(401).send({ message: "Invalid Password!" });
    }

    if (!user.verified) {
      return res.status(401).send({ message: "Please verify your email!" });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid Password!" });
    }

    if (!process.env.AUTH_SECRET) {
      throw new Error("Please define the AUTH_SECRET environment variable.");
    }

    const token = jwt.sign({ id: user.id }, process.env.AUTH_SECRET as Secret, {
      expiresIn: process.env.JWT_EXP,
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
      img: user.img,
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
      return res
        .status(403)
        .json({ message: "Refresh token is not in database!" });
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndDelete(refreshToken._id, {
        useFindAndModify: false,
      }).exec();

      return res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
    }

    if (!process.env.AUTH_SECRET) {
      throw new Error("Please define the AUTH_SECRET environment variable.");
    }

    if (!process.env.JWT_EXP) {
      throw new Error("Please define the JWT_EXP environment variable.");
    }

    let newAccessToken = jwt.sign(
      { id: refreshToken.user._id },
      process.env.AUTH_SECRET,
      {
        expiresIn: parseInt(process.env.JWT_EXP),
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
    const token = req?.session?.refreshToken;
    req.session = null;
    await RefreshToken.findOneAndDelete({ token, user: userId });
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    return next(err);
  }
};

export const resetPasswordRequest = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const token = await EmailToken.findOne({ userId: user._id });
    if (token) {
      await token.deleteOne();
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    if (!process.env.BCRYPT_SALT) {
      throw new Error("Please define the BCRYPT_SALT environment variable.");
    }

    const hash = await bcrypt.hash(resetToken, Number(process.env.BCRYPT_SALT));

    await new EmailToken({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    if (!process.env.CLIENT_URL) {
      throw new Error("Please define the CLIENT_URL environment variable.");
    }

    const link = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`;
    await sendEmail(
      user.email,
      "Password Reset Request",
      { name: user.username, link: link },
      "../template/requestResetPassword.handlebars"
    );

    return res
      .status(200)
      .send({ message: "Password reset link sent to your email" });
  } catch (err) {
    return res.status(500).send({ message: JSON.stringify(err) });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { userId, token, password } = req.body;
    if (!userId || !password) {
      return res.status(400).send({ message: "All fields are required" });
    }
    if (!token) {
      return res.status(400).send({ message: "No token provided" });
    }
    const user = await User.findById({ _id: userId });
    if (!user) {
      throw new Error("User not found");
    }
    let passwordResetToken = await EmailToken.findOne({ userId });
    if (!passwordResetToken) {
      throw new Error("Invalid or expired password reset token");
    }
    const isValid = bcrypt.compareSync(token, passwordResetToken.token);
    if (!isValid) {
      throw new Error("Invalid or expired password reset token");
    }

    if (!process.env.BCRYPT_SALT) {
      throw new Error("Please define the BCRYPT_SALT environment variable.");
    }
    const hash = bcrypt.hashSync(password, Number(process.env.BCRYPT_SALT));
    await user.updateOne({ password: hash });
    passwordResetToken.deleteOne().exec();

    await sendEmail(
      user.email,
      "Password Reset Successfully",
      {
        name: user.username,
      },
      "../template/resetPassword.handlebars"
    );

    return res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).send({ message: JSON.stringify(error) });
  }
};

export const confirmEmail = async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const user = await User.findById({ _id: userId });
    if (!user) {
      throw new Error("User not found");
    }

    let emailToken = await EmailToken.findOne({ userId });
    if (!emailToken) {
      throw new Error("Invalid or expired email token");
    }

    const isValid = bcrypt.compareSync(token, emailToken.token);

    if (!isValid) {
      throw new Error("Invalid or expired email token");
    }

    await user.updateOne({ verified: true });
    emailToken.deleteOne().exec();
    return res.status(200).send({ message: "Email confirmed successfully" });
  } catch (error: Error | any) {
    return res.status(500).send({ message: JSON.stringify(error?.message) });
  }
};
