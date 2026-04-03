import { getCanvas } from "@/models/lines.js";
import { addMember, getMember, removeMember } from "../models/members.js";
import { deleteRoom, getMembersInRoom, roomExists } from "../models/rooms.js";
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

      if (!room_id) throw new Error("Invalid Room ID");

      socket.data.member_id = id;
      socket.data.room_id = room_id;
      socket.data.room_code = room_code;
      socket.join(socket.data.room_id);


      //Retrieving necessary resources
      const members = await getMembersInRoom(socket.data.room_id);
      const lines = await getCanvas(room_id);

      // Update members list for all members in room
      socket.broadcast.to(socket.data.room_id).emit("update_members", members);

      callback({ success: true, message: "Joined room successfully" });
      socket.emit("init_state", {
        lines: lines,
        members: members,
        code: room_code,
      });
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

      if (!socket.data.room_id) throw new Error("Room ID not saved");
      socket.leave(socket.data.room_id);

      // Update members list for remaining members in room
      const members = await getMembersInRoom(socket.data.room_id);
      socket.broadcast.to(socket.data.room_id).emit("update_members", members);

      // If room is empty after leaving, delete it
      setTimeout(async () => {
        if (socket.data.room_id && !(await roomExists(socket.data.room_id))) return;
        
        const membersAfterTimeout = await getMembersInRoom(socket.data.room_id);
        if (membersAfterTimeout.length === 0) {
          await deleteRoom(socket.data.room_id);
          console.log(
            `Room ${socket.data.room_id} is empty after timeout and has been deleted.`,
          );
        }
      }, 60000); 

      socket.data.member_id = undefined;
      socket.data.room_id = undefined;
      socket.data.room_code = undefined;
    } catch (err) {
      console.log(err);
    }
  };

  socket.on("join_room", joinRoom);
  socket.on(
    "leave_room",
    async (
      callback: (response: { success: boolean; message?: string }) => void,
    ) => {
      try {
        await leaveRoom();
        callback({ success: true, message: "Left room successfully" });
      } catch (err) {
        callback({ success: false, message: "Failed to leave room" });
      }
    },
  );

  socket.on("disconnect", leaveRoom);
};

export default registerRoomHandlers;
