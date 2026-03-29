import { getMembersInRoom } from "@/models/rooms.js";
import type { Server, Socket } from "socket.io";

const registerUserHandlers = (io: Server, socket: Socket) => {
  socket.on("get_members", async () => {
    try {
      if (!socket.data.room_id) throw new Error("Missing room id");
        
      const users = await getMembersInRoom(socket.data.room_id);
      socket.emit("update_users", users);
    } catch(err) {
      throw err;
    }
  });
};

export default registerUserHandlers;