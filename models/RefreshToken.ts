import { Document } from "mongoose";
import mongoose, { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const RefreshTokenSchema = new mongoose.Schema(
  {
    token: String,
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
    expiryDate: Date,
  },
  {
    statics: {
      createToken: async function (user: Document) {
        let expiredAt = new Date();

        if (!process.env.JWT_REFRESH_EXP) {
          throw new Error("Please define the JWT_REFRESH_EXP environment variable.");
        }

        expiredAt.setSeconds(
          expiredAt.getSeconds() + parseInt(process.env.JWT_REFRESH_EXP)
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
