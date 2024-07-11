import { Document } from "mongoose";
import mongoose from "mongoose";
import config from "../config/auth.config";
import { v4 as uuidv4 } from "uuid";

const RefreshTokenSchema = new mongoose.Schema(
  {
    token: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    expiryDate: Date,
  },
  {
    statics: {
      createToken: async function (user: Document) {
        let expiredAt = new Date();

        expiredAt.setSeconds(
          expiredAt.getSeconds() + config.jwtRefreshExpiration
        );

        let _token = uuidv4();

        let _object = new this({
          token: _token,
          user: user._id,
          expiryDate: expiredAt.getTime(),
        });

        let refreshToken = await _object.save();

        return refreshToken.token;
      },
      verifyExpiration: (token) => {
        return token.expiryDate.getTime() < new Date().getTime();
      },
    },
  }
);

export interface RefreshTokenDocument {
  token: string;
  user: any;
  expiryDate: Date;
}

export interface RefreshTokentModel
  extends mongoose.Model<RefreshTokenDocument> {
  createToken(user: Document): Promise<string>;
  verifyExpiration(token: RefreshTokenDocument): boolean;
}

export default mongoose.model<RefreshTokenDocument, RefreshTokentModel>(
  "RefreshToken",
  RefreshTokenSchema
);
