import { Request, Response } from "express";
import User from "../models/User";
import Chat from "../models/Chat";
import Message from "../models/Message";

export const searchUsers = async (req: Request, res: Response) => {
  const searchTerm = req.query.query;
  const users = await User.find({
    $or: [
      { username: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
    ],
  }).limit(15);
  res.status(200).send(
    users.map((user) => ({
      _id: user._id,
      username: user.username,
    }))
  );
};

export const getChats = async (req: Request, res: Response) => {
  const { userId } = req;
  const chats = await Chat.find().or([{ user1: userId }, { user2: userId }]);
  const responseChats = await Promise.all(
    chats.map(async (chat) => {
      const anotherUser = String(chat.user1) === userId ? chat.user2 : chat.user1;
      const user = await User.findById(anotherUser).select("-password");
      const lastMessage = await Message.findOne({ chatId: chat._id }).sort({
        date: "desc",
      }).limit(1);
      const unreadCount = await Message.countDocuments({ chatId: chat._id, isRead: false, sender: String(anotherUser) });
      return {
        _id: chat._id,
        user: user,
        lastMessage: lastMessage,
        unreadCount: unreadCount
      };
    })
  );
  res.status(200).send(responseChats.sort((a, b) => (b.lastMessage?.date || 0) - (a.lastMessage?.date || 0)));
};

export const createChat = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const user1 = req.userId;
  const user2 = userId;

  const chat = new Chat({
    user1,
    user2,
  });
  await chat.save();
  res.status(200).send(chat);
};
