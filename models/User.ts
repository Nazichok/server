import mongoose, { Types } from 'mongoose';

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    password: String,
    age: Number,
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
});

export default mongoose.model('User', UserSchema);