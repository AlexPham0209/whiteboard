import type { Server, Socket } from "socket.io";

const registerRoomHandlers = (io: Server, socket: Socket) => {
  socket.on("join_room", () => {});
  socket.on("leave_room", () => {});
};

export default registerRoomHandlers;