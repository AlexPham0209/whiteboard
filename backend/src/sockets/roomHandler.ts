import { addMember, removeMember } from "../models/members.js";
import { getMembersInRoom, roomExists } from "../models/rooms.js";
import type { Server, Socket } from "socket.io";

const registerRoomHandlers = (io: Server, socket: Socket) => {
  socket.on("join_room", async (room_code: string) => {
    try {
      const exists = await roomExists(room_code);

      if (!exists)
        throw new Error("Room doesn't exist");

      if (!socket.data.username) throw new Error("Invalid username");

      const { member_id, room_id } = await addMember(socket.data.username, room_code);
      
      socket.data.member_id = member_id;
      socket.data.room_id = room_id;
      socket.join(socket.data.room_id);

      const members = await getMembersInRoom(socket.data.room_id);
      socket.broadcast.to(socket.data.room_id).emit("update_members", members);

    } catch(err) {
      throw err;
    }
  });

  socket.on("leave_room", async () => {
    try {
      await removeMember(socket.data.user_id);
      socket.data.member_id = undefined;
      socket.data.room_id = undefined;
    } catch(err) {
      throw err;
    }
  });
};

export default registerRoomHandlers;