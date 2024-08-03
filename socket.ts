import { Server, Socket } from "socket.io";

export const runSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("a user connected", socket.handshake.auth);

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("message", (msg) => {
      console.log(msg);
      socket.broadcast.emit("message-broadcast", msg);
    });
  });
};
