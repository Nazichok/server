import { Request, Response } from "express";
import { supabase } from "../misc/supabase";
import { decode } from "base64-arraybuffer";
import User from "../models/User";

export const allAccess = (_req: Request, res: Response): void => {
  res.status(200).send("Public Content.");
};

export const updateUserImg = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req;
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "Please upload a file" });
      return;
    }

    // decode file buffer to base64
    const fileBase64 = decode(file.buffer.toString("base64"));
    const user = await User.findById(userId);

    // delete old profile picture; not using replacing to avoid caching images
    if (user?.img) {
      supabase.storage
        .from("profile-pictures")
        .remove([user.img.split("/").slice(-1)[0]])
        .then(({ error }) => {
          if (error) {
            throw error;
          }
        });
    }

    // upload the file to supabase
    const { data, error } = await supabase.storage
      .from("profile-pictures")
      .upload(file.originalname + Date.now(), fileBase64, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // get public url of the uploaded file
    const { data: image } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(data.path);

    User.findByIdAndUpdate(userId, { img: image.publicUrl }).exec();

    res.status(200).json({ img: image.publicUrl });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
