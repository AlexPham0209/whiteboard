import type { Server, Socket } from "socket.io";

const registerMessageHandlers = (io: Server, socket: Socket) => {
  socket.on("get_messages", () => {});
  socket.on("send_messages", () => {});
  socket.on("receive_messages", () => {});
};

export default registerMessageHandlers;