import { getMembersInRoom } from "../models/rooms.js";
import type { Server, Socket } from "socket.io";

const registerUserHandlers = (io: Server, socket: Socket) => {
  const getMembers = async () => {
    try {
      if (!socket.data.room_id) throw new Error("Missing room id");

      const users = await getMembersInRoom(socket.data.room_id);
      socket.emit("update_users", users);
    } catch (err) {
      console.log(err);
    }
  };
  socket.on("get_members", getMembers);
};

export default registerUserHandlers;
