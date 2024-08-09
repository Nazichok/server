import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import db from "./models/index";
import dbConfig from "./config/db.config";
import authConfig from "./config/auth.config";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error";
import chatRoutes from "./routes/chat.routes";
import messagesRoutes from "./routes/messages.routes";
import { runSocket } from "./socket";

const app = express();

var corsOptions = {
  credentials: true,
  origin: ["http://localhost:4200"],
};

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
    keys: [authConfig.cookieSecret],
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  })
);

authRoutes(app);
userRoutes(app);
chatRoutes(app);
messagesRoutes(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;

async function run() {
  await db.mongoose.connect(dbConfig.URL);
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
