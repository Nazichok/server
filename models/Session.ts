import mongoose, { Types } from 'mongoose';

const SeesionSchema = new mongoose.Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
  },
  connected: Boolean
});

export default mongoose.model('Session', SeesionSchema);