import mongoose, { Types } from 'mongoose';

const ChatSchema = new mongoose.Schema({
    messages: Array<Types.ObjectId>
});

export default mongoose.model('Chat', ChatSchema);