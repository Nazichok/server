import mongoose, { Model, Mongoose } from 'mongoose';
import user from './User';
import chat from './Chat';
import message from './Message';
import refreshToken from './RefreshToken';

export type DBType  = {
  mongoose: Mongoose,
  user: Model<any>,
  chat: Model<any>,
  message: Model<any>
  refreshToken: Model<any>
}

mongoose.Promise = global.Promise;

const db: DBType = {
  mongoose,
  user,
  chat,
  message,
  refreshToken
};

export default db;