import { Request, Response } from "express";
import { supabase } from "../misc/supabase";
import { decode } from "base64-arraybuffer";
import User from "../models/User";
import sharp from "sharp";
import bcrypt from "bcrypt";

export const allAccess = (_req: Request, res: Response): void => {
  res.status(200).send("Public Content.");
};

export const updateUserInfo = async (req: Request, res: Response) => {
  const updatedFields = req.body;

  try {
    const user = await User.findOne({
      $or: Object.keys(updatedFields).map((key) => ({
        [key]: updatedFields[key],
      })),
    });

    if (user && user.id !== req.userId) {
      let message = "";
      Object.entries(updatedFields).forEach(([key, value]) => {
        if (value === user[key as keyof typeof user]) {
          message += `${key}, `;
        }
      });
      return res.status(400).send({ message: `${message} already exists!` });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updatedFields,
      { new: true }
    );
    if (updatedUser) {
      res.status(200).send({
        _id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
      });
    } else {
      res.status(400).send({ message: "Failed to update user!" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Failed to update user!" });
  }
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
      const filename = user.img.split("/").slice(-1)[0];
      supabase.storage
        .from("profile-pictures")
        .remove([filename, filename + "thumbnail"])
        .then(({ error }) => {
          if (error) {
            throw error;
          }
        });
    }

    // upload the file to supabase
    const filename = file.originalname + Date.now();
    let imageData: any;
    await Promise.all([
      (async () => {
        const { data, error } = await supabase.storage
          .from("profile-pictures")
          .upload(filename, fileBase64, {
            contentType: "image/png",
            upsert: true,
          });

        imageData = data;
        if (error) {
          console.log(error);
          throw error;
        }
      })(),

      (async () => {
        const thumbnailBuffer = await sharp(file.buffer)
          .resize(100, 100)
          .toBuffer();
        const { data, error } = await supabase.storage
          .from("profile-pictures")
          .upload(
            filename + "thumbnail",
            decode(thumbnailBuffer.toString("base64")),
            {
              contentType: "image/png",
              upsert: true,
            }
          );
        if (error) {
          console.log(error);
          throw error;
        }
      })(),
    ]);

    // get public url of the uploaded file
    const { data: image } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(imageData.path);

    User.findByIdAndUpdate(userId, { img: image.publicUrl }).exec();

    res.status(200).json({ img: image.publicUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

export const updateUserPassword = async (
  req: Request,
  res: Response
) => {
  const { userId } = req;
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (!user.password) {
    return res.status(401).send({ message: "User has no current password" });
  }

  const isMatch = bcrypt.compareSync(oldPassword, user.password);

  if (!isMatch) {
    return res.status(401).send({ message: "Invalid password" });
  }

  try {
    if (!process.env.BCRYPT_SALT) {
      throw new Error("Please define the BCRYPT_SALT environment variable.");
    }
    await user.updateOne({ password: bcrypt.hashSync(newPassword, Number(process.env.BCRYPT_SALT)) });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Failed to update user password!" });
  }

  return res.status(204).send("Successfully updated user password!");
};
