import mongoose, { Types } from 'mongoose';

const MessageSchema = new mongoose.Schema({
    _id: Types.ObjectId,
    message: String,
    user: Types.ObjectId,
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Message', MessageSchema);