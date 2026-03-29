import type { Server, Socket } from "socket.io";

const registerCanvasHandlers = (io: Server, socket: Socket) => {
  socket.on("get_canvas", () => {})
  socket.on("add_line", () => {});
};

export default registerCanvasHandlers;