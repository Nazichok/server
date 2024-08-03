import { Request, Response } from "express";
import db from "../models";

const Message = db.message

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.query;
  console.log(chatId);
  const messages = await Message.find({ chatId });
  console.log(messages);
  res.status(200).send(messages);
}

export const sendMessage = async (req: Request, res: Response) => {
  const { chatId, text } = req.body;
  const { userId: sender } = req;
  const message = new Message({
    chatId,
    sender,
    text
  });
  await message.save();
  res.status(200).send(message);
}