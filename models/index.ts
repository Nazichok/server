import mongoose, { Model, Mongoose } from "mongoose";
import user from "./User";
import chat from "./Chat";
import message from "./Message";
import session from "./Session";
import RefreshToken, { RefreshTokentModel } from "./RefreshToken";

export type DBType = {
  mongoose: Mongoose;
  user: Model<any>;
  chat: Model<any>;
  message: Model<any>;
  refreshToken: RefreshTokentModel;
  session: Model<any>
};

mongoose.Promise = global.Promise;

const db: DBType = {
  mongoose,
  user,
  chat,
  message,
  refreshToken: RefreshToken,
  session
};

export default db;
