import mongoose, { Types } from "mongoose";

const MessageSchema = new mongoose.Schema({
  text: String,
  date: { type: Number, default: Date.now },
  sender: {
    type: Types.ObjectId,
    ref: "User",
  },
  isRead: { type: Boolean, default: false },
  chatId: {
    type: Types.ObjectId,
    ref: "Chat",
  },
});

export default mongoose.model("Message", MessageSchema);
