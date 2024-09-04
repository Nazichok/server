import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { Response } from "express";

export const sendEmail = (
  email: string,
  subject: string,
  payload: {
    name: string;
    link?: string;
  },
  template: string,
  res: Response
) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD, // naturally, replace both with your real credentials or an application-specific password
      },
    });

    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);
    const options = () => {
      return {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      };
    };

    // Send email
    transporter.sendMail(options(), (error) => {
      if (error) {
        return res.status(500).send("Error sending email");
      } else {
        return res.status(200).json({
          success: true,
        });
      }
    });
  } catch (error) {
    return res.status(500).send({ message: JSON.stringify(error) });
  }
};
