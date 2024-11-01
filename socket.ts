import { Server } from "socket.io";
import Message from "./models/Message";
import User from "./models/User";
import webpush from "web-push";

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error("Please define the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.");
}

webpush.setVapidDetails(
  "mailto:" + process.env.EMAIL_USERNAME,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export enum SocketEvents {
  USER_CONNECTED = "user connected",
  USER_DISCONNECTED = "user disconnected",
  PRIVATE_MESSAGE = "private message",
  USER_IDS = "userIds",
  CONNECT_ERROR = "connect error",
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  DISCONNECTING = "disconnecting",
  CONNECT = "connect",
  MESSAGE_READ = "message read",
  USER_UPDATED = "user updated",
  CHAT_CREATED = "chat created",
}

export const runSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
    },
  });

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error("User error"));
    }

    socket.data.userId = userId;
    next();
  });

  io.on(SocketEvents.CONNECTION, async (socket) => {
    socket.join(socket.data.userId);

    const chats = socket.handshake.auth.rooms;
    if (chats?.length) {
      await socket.join(chats);
    }

    const userIds = await Promise.all(
      chats.map(async (chatId: string) => {
        let resultUserId = "";
        const matchingSockets = await io.in(chatId).fetchSockets();
        const anotherUserIds = matchingSockets.filter(
          (s: any) => s.data.userId !== socket.data.userId
        );
        if (anotherUserIds.length) {
          resultUserId = anotherUserIds[0].data.userId;
        }
        return resultUserId;
      })
    );

    socket.emit(SocketEvents.USER_IDS, userIds);

    socket.rooms.forEach((room) => {
      socket.to(room).emit(SocketEvents.USER_CONNECTED, socket.data.userId);
    });

    socket.on(SocketEvents.PRIVATE_MESSAGE, async (messageObj) => {
      const message = new Message(messageObj);
      const savedMessage = await message.save();
      socket
        .to(messageObj.chatId)
        .emit(SocketEvents.PRIVATE_MESSAGE, savedMessage);
      socket.emit(SocketEvents.PRIVATE_MESSAGE, savedMessage);

      const anotherUser = await User.findById(messageObj.to);

      if (anotherUser?.notificationSubscription) {
        const notificationPayload = {
          notification: {
            title: messageObj.senderName,
            body: messageObj.text,
            icon: "/assets/icon-192x192.png",
            vibrate: [100, 50, 100],
            data: {
              onActionClick: {
                default: {
                  operation: "navigateLastFocusedOrOpen",
                  url: `${process.env.CLIENT_URL}/chats/${messageObj.chatId}`,
                }
              }
            },
          },
        };
        webpush
          .sendNotification(
            anotherUser.notificationSubscription,
            JSON.stringify(notificationPayload)
          )
          .then(() => console.log("Successfully sent notification"))
          .catch((err) => console.log(err));
      }
    });

    // notify users upon disconnection
    socket.on(SocketEvents.DISCONNECTING, async () => {
      const rooms = new Set(socket.rooms);
      io.in(socket.data.userId)
        .fetchSockets()
        .then((sockets) => {
          if (sockets.length === 1) {
            rooms.forEach((room) => {
              socket
                .to(room)
                .emit(SocketEvents.USER_DISCONNECTED, socket.data.userId);
            });
            User.findByIdAndUpdate(socket.data.userId, {
              lastSeen: Date.now(),
            }).exec();
          }
        });
    });

    socket.on(SocketEvents.MESSAGE_READ, ({ chatId, messageId }) => {
      Message.findByIdAndUpdate(messageId, { isRead: true }).exec();
      socket.to(chatId).emit(SocketEvents.MESSAGE_READ, { messageId, chatId });
    });

    socket.on(SocketEvents.USER_UPDATED, ({ _id, ...rest }) => {
      socket.rooms.forEach((room) => {
        socket.to(room).emit(SocketEvents.USER_UPDATED, { _id, ...rest });
      });
      socket.emit(SocketEvents.USER_UPDATED, { _id, ...rest });
    });

    socket.on(SocketEvents.CHAT_CREATED, async ({ chatId, anotherUserId }) => {
      socket.join(chatId);
      socket.in(anotherUserId).socketsJoin(chatId);
      socket.to(chatId).emit(SocketEvents.USER_CONNECTED, socket.data.userId);
      socket.to(chatId).emit(SocketEvents.USER_CONNECTED, anotherUserId);
    });
  });
};
