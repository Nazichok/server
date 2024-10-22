import mongoose, { Types } from "mongoose";

const UserSchema = new mongoose.Schema({
  password: String,
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  img: String,
  chats: Array<Types.ObjectId>,
  lastSeen: Number,
  verified: Boolean,
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("User", UserSchema);
