import { Request, Response } from "express";
import db from "../models";

const Message = db.message

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.query;
  const messages = await Message.find({ chatId });
  res.status(200).send(messages);
}
