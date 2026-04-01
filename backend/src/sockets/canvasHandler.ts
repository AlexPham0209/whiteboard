import { addLine, getCanvas, type Line } from "../models/lines.js";
import type { Server, Socket } from "socket.io";

const registerCanvasHandlers = (io: Server, socket: Socket) => {
  socket.on("get_canvas", async () => {
    try {
      if (!socket.data.room_id) throw new Error("Invalid room id");

      const canvas = await getCanvas(socket.data.room_id);
      socket.emit("update_canvas", canvas);
    } catch (err) {
      throw err;
    }
  });

  socket.on("add_line", async (line: Line) => {
    try {
      if (!socket.data.room_id || !socket.data.user_id)
        throw new Error("Invalid user id or room id");

      await addLine(socket.data.user_id, line);
      socket.broadcast.to(socket.data.room_id).emit("update", line);
    } catch (err) {
      throw err;
    }
  });
};

export default registerCanvasHandlers;
