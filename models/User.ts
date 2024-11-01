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
  notificationSubscription: {
    type: {
      endpoint: {
        type: String,
        required: true,
      },
      expirationTime: {
        type: Number,
        required: true,
      },
      keys: {
        type: {
          p256dh: {
            type: String,
            required: true,
          },
          auth: {
            type: String,
            required: true,
          },
        },
        required: true,
      },
    },
    default: null,
  },
});

export default mongoose.model("User", UserSchema);
