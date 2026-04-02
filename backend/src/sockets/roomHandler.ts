import { addMember, getMember, removeMember } from "../models/members.js";
import { getMembersInRoom, roomExists } from "../models/rooms.js";
import type { Server, Socket } from "socket.io";

const registerRoomHandlers = (io: Server, socket: Socket) => {
  const joinRoom = async (
    room_code: string,
    callback: (response: { success: boolean; message?: string }) => void,
  ) => {
    try {
      if (!socket.data.user_id) throw new Error("Missing user ID");

      const userId = socket.data.user_id;
      const { id, room_id } =
        (await getMember(userId)) ?? (await addMember(userId, room_code));

      socket.data.member_id = id;
      socket.data.room_id = room_id;
      socket.data.room_code = room_code;
      socket.join(socket.data.room_id);

      const members = await getMembersInRoom(socket.data.room_id);
      socket.broadcast.to(socket.data.room_id).emit("update_members", members);
      
      callback({ success: true, message: "Joined room successfully" });
      socket.emit("on_room_connect");
    } catch (err) {
      if (err instanceof Error)
        callback({ success: false, message: err.message });
      else callback({ success: false, message: "An unknown error occurred" });
    }
  };
  
  const leaveRoom = async () => {
    try {
      if (!socket.data.user_id)
        throw new Error("User not associated with socket");

      await removeMember(socket.data.user_id);
      socket.data.member_id = undefined;
      socket.data.room_id = undefined;
    } catch (err) {
      throw err;
    }
  };

  const getCode = async () => {
    try {
      if (!socket.data.room_code) throw new Error("Room code not saved");
      socket.emit("update_code", socket.data.room_code);
    } catch (err) {
      throw err;
    }
  };

  socket.on("join_room", joinRoom);
  socket.on("leave_room", leaveRoom);
  socket.on("disconnect", leaveRoom);
  socket.on("get_code", getCode);
};

export default registerRoomHandlers;
