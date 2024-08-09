import mongoose, { Types } from 'mongoose';

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    password: String,
    age: Number,
    email: String,
    username: String,
    chats: Array<Types.ObjectId>,
    lastSeen: Date,
});

export default mongoose.model('User', UserSchema);