import mongoose, { Model, Mongoose } from "mongoose";
import user from "./User";
import chat from "./Chat";
import message from "./Message";
import RefreshToken, { RefreshTokentModel } from "./RefreshToken";

export type DBType = {
  mongoose: Mongoose;
  user: Model<any>;
  chat: Model<any>;
  message: Model<any>;
  refreshToken: RefreshTokentModel;
};

mongoose.Promise = global.Promise;

const db: DBType = {
  mongoose,
  user,
  chat,
  message,
  refreshToken: RefreshToken,
};

export default db;
