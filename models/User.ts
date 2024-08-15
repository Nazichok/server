import mongoose, { Types } from 'mongoose';

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    password: String,
    age: Number,
    email: String,
    username: String,
    img: String,
    chats: Array<Types.ObjectId>,
    lastSeen: Number,
});

export default mongoose.model('User', UserSchema);