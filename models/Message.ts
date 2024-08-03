import mongoose, { Types } from 'mongoose';

const MessageSchema = new mongoose.Schema({
    _id: Types.ObjectId,
    text: String,
    date: { type: Date, default: Date.now },
    sender: {
      type: Types.ObjectId,
      ref: "User",
    },
    isRead: Boolean,
    chatId: {
      type: Types.ObjectId,
      ref: "Chat",
    }
});

export default mongoose.model('Message', MessageSchema);