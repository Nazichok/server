import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import cookieSession from "cookie-session";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error";
import chatRoutes from "./routes/chat.routes";
import messagesRoutes from "./routes/messages.routes";
import { runSocket } from "./socket";
import mongoose from "mongoose";
import morgan from "morgan";
import googleAuth from "./misc/googleAuth";

const app = express();

if (!process.env.CLIENT_URL) {
  throw new Error("Please define the CLIENT_URL environment variable.");
}

var corsOptions = {
  credentials: true,
  origin: [process.env.CLIENT_URL],
};

app.enable("trust proxy");
app.use(
  morgan("combined", {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
  })
);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(errorHandler);

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
});

app.use(
  cookieSession({
    name: "chat-app",
    keys: [process.env.COOKIE_SECRET || "genericSecret"],
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.NODE_ENV === "production" ? process.env.DOMAIN_NAME : undefined,
  })
);

authRoutes(app);
userRoutes(app);
chatRoutes(app);
messagesRoutes(app);

app.use(googleAuth);

// set port, listen for requests
const PORT = process.env.PORT || 8080;

async function run() {
  if (!process.env.DB_URL) {
    throw new Error("Please define the DB_URL environment variable.");
  }
  await mongoose.connect(process.env.DB_URL);
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
  runSocket(server);
}

try {
  run();
} catch (error) {
  console.error("Connection error", error);
  process.exit();
}
