import mongoose, { Model, Mongoose } from 'mongoose';
import user from './User';
import chat from './Chat';
import message from './Message';

export type DBType  = {
  mongoose: Mongoose,
  user: Model<any>,
  chat: Model<any>,
  message: Model<any>
}

mongoose.Promise = global.Promise;

const db: DBType = {
  mongoose,
  user,
  chat,
  message,
};

export default db;