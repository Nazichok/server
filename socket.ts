import { Server } from "socket.io";
import db from "./models";
import { randomBytes } from "crypto";
import { connected } from "process";

export enum SocketEvents {
  USER_CONNECTED = "user connected",
  USER_DISCONNECTED = "user disconnected",
  PRIVATE_MESSAGE = "private message",
  USER_IDS = "userIds",
  SESSION = "session",
  CONNECT_ERROR = "connect error",
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  CONNECT = "connect",
}

const randomId = () => randomBytes(8).toString("hex");

const Message = db.message;
const Session = db.session;

declare module "socket.io" {
  interface Socket {
    userId: string;
    sessionId?: string;
  }
}

export const runSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use(async (socket, next) => {
    const sessionId = socket.handshake.auth.sessionId;
    if (sessionId) {
      // find existing session
      const session = await Session.findById(sessionId);
      if (session) {
        socket.sessionId = sessionId;
        socket.userId = String(session.userId);
        return next();
      }
    }
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error("User error"));
    }

    const session = new Session({
      userId,
      connected: true
    });
    const savedSession = await session.save();
    socket.sessionId = savedSession._id;
    socket.userId = userId;
    next();
  });

  io.on(SocketEvents.CONNECTION, async (socket) => {
    Session.findByIdAndUpdate(
      socket.sessionId,
      {
        userId: socket.userId,
        connected: true,
      },
      {
        upsert: true,
      }
    ).exec();

    socket.emit(SocketEvents.SESSION, {
      sessionId: socket.sessionId,
      userId: socket.userId,
    });

    socket.join(socket.userId);

    const userIds = [];
    for (let [_, socket] of io.of("/").sockets) {
      userIds.push(socket.userId);
    }
    socket.emit(SocketEvents.USER_IDS, userIds);

    socket.broadcast.emit(SocketEvents.USER_CONNECTED, socket.userId);

    socket.on(SocketEvents.PRIVATE_MESSAGE, async ({ text, chatId, to }) => {
      const message = new Message({
        chatId,
        sender: socket.userId,
        text,
      });
      const savedMessage = await message.save();
      socket
        .to(to)
        .to(socket.userId)
        .emit(SocketEvents.PRIVATE_MESSAGE, savedMessage);
    });

    // notify users upon disconnection
    socket.on(SocketEvents.DISCONNECT, async () => {
      const matchingSockets = await io.in(socket.userId).fetchSockets();
      const isDisconnected = matchingSockets.length === 0;
      if (isDisconnected) {
        // notify other users
        socket.broadcast.emit(SocketEvents.USER_DISCONNECTED, socket.userId);
        // update the connection status of the session
        Session.findByIdAndUpdate(
          socket.sessionId,
          {
            userId: socket.userId,
            connected: false,
          },
          {
            upsert: true,
          }
        ).exec();
      }
    });
  });
};
