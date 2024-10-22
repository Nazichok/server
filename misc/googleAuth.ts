import express from "express";
import jwt, { Secret } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";

const googleAuth = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Please define the GOOGLE_CLIENT_ID environment variable.");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Please define the GOOGLE_CLIENT_SECRET environment variable."
  );
}

googleAuth.post("/api/auth/google-login", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // @ts-ignore
    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: name,
        email,
        img: picture,
        verified: true,
        isGoogleUser: true,
      });
      await user.save();
    }

    const sessionTokent = jwt.sign({ id: user.id }, process.env.AUTH_SECRET as Secret, {
      expiresIn: process.env.JWT_EXP,
    });

    let refreshToken = await RefreshToken.createToken(user);

    if (req.session) {
      req.session.token = sessionTokent;
      req.session.refreshToken = refreshToken;
    }

    res.status(200).send({
      _id: user._id,
      username: user.username,
      email: user.email,
      img: user.img,
      isGoogleUser: true,
    });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong" });
  }
});

export default googleAuth;
