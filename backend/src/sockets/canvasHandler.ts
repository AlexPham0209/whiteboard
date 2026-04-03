import { addLine, getCanvas, type Line } from "../models/lines.js";
import type { Server, Socket } from "socket.io";

const registerCanvasHandlers = (io: Server, socket: Socket) => {
  socket.on("get_canvas", async () => {
    try {
      if (!socket.data.room_id) throw new Error("Invalid room id");

      const canvas = await getCanvas(socket.data.room_id);
      socket.emit("update_canvas", canvas);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on(
    "add_line",
    async (line: {
      draw_mode: string;
      color: string;
      brush_size: number;
      points: number[];
    }) => {
      try {
        if (!socket.data.room_id || !socket.data.user_id)
          throw new Error("Invalid user id or room id");

        const newLine: Line = {
          ...line,
          user_id: socket.data.user_id,
        };
        await addLine(newLine);
        socket.broadcast.to(socket.data.room_id).emit("update", line);
      } catch (err) {
        console.log(err);
      }
    },
  );
};

export default registerCanvasHandlers;
