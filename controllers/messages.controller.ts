import { Request, Response } from "express";
import Message from "../models/Message";

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.query;
  const messages = await Message.find({ chatId });
  res.status(200).send(messages);
}
