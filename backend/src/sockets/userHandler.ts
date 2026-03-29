import type { Server, Socket } from "socket.io";

const registerUserHandlers = (io: Server, socket: Socket) => {
  socket.on("get_users", () => {});
};

export default registerUserHandlers;