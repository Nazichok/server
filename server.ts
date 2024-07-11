import express, { Application, Response } from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import db from "./models/index";
import dbConfig from "./config/db.config";
import authConfig from "./config/auth.config";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import { Server } from "socket.io";

const app = express();

var corsOptions = {
  credentials: true,
  origin: ["http://localhost:4200"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "chat-app",
    keys: [authConfig.cookieSecret],
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// simple route
app.get("/", (_, res) => {
  res.json({ message: "Welcome to chat-app." });
});

authRoutes(app);
userRoutes(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;

async function run() {
  await db.mongoose.connect(dbConfig.URL);
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("message", (msg) => {
      console.log(msg);
      socket.broadcast.emit("message-broadcast", msg);
    });
  });
}

try {
  run();
} catch (error) {
  console.error("Connection error", error);
  process.exit();
}
