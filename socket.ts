import { Server } from "socket.io";
import Message from "./models/Message";
import User from "./models/User";

export enum SocketEvents {
  USER_CONNECTED = "user connected",
  USER_DISCONNECTED = "user disconnected",
  PRIVATE_MESSAGE = "private message",
  USER_IDS = "userIds",
  CONNECT_ERROR = "connect error",
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  CONNECT = "connect",
  MESSAGE_READ = "message read",
}

declare module "socket.io" {
  interface Socket {
    userId: string;
  }
}

export const runSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error("User error"));
    }

    socket.userId = userId;
    next();
  });

  io.on(SocketEvents.CONNECTION, async (socket) => {
    socket.join(socket.userId);

    const userIds = [];
    for (let [_, socket] of io.of("/").sockets) {
      userIds.push(socket.userId);
    }
    socket.emit(SocketEvents.USER_IDS, userIds);

    socket.broadcast.emit(SocketEvents.USER_CONNECTED, socket.userId);

    socket.on(
      SocketEvents.PRIVATE_MESSAGE,
      async ({ text, chatId, to, date }) => {
        const message = new Message({
          chatId,
          date,
          sender: socket.userId,
          text,
        });
        const savedMessage = await message.save();
        socket
          .to(to)
          .to(socket.userId)
          .emit(SocketEvents.PRIVATE_MESSAGE, savedMessage);
        socket.emit(SocketEvents.PRIVATE_MESSAGE, savedMessage);
      }
    );

    // notify users upon disconnection
    socket.on(SocketEvents.DISCONNECT, async () => {
      const matchingSockets = await io.in(socket.userId).fetchSockets();
      const isDisconnected = matchingSockets.length === 0;
      if (isDisconnected) {
        // notify other users
        socket.broadcast.emit(SocketEvents.USER_DISCONNECTED, socket.userId);
        User.findByIdAndUpdate(socket.userId, { lastSeen: Date.now() }).exec();
      }
    });

    socket.on(
      SocketEvents.MESSAGE_READ,
      ({ chatId, messageId, anotherUserId }) => {
        Message.findByIdAndUpdate(messageId, { isRead: true }).exec();
        socket
          .to(anotherUserId)
          .to(socket.userId)
          .emit(SocketEvents.MESSAGE_READ, { messageId, chatId });
      }
    );
  });
};
