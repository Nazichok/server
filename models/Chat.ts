import mongoose, { Types } from 'mongoose';

const ChatSchema = new mongoose.Schema({
    user1: {
      type: Types.ObjectId,
      ref: "User",
    },
    user2: {
      type: Types.ObjectId,
      ref: "User",
    },
});

export default mongoose.model('Chat', ChatSchema);