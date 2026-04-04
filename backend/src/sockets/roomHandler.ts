import { getCanvas } from "@/models/lines.js";
import { addMember, getMember, getRoomFromMember, removeMember, removeMemberFromUserID } from "../models/members.js";
import { deleteRoom, getMembersInRoom, roomExistsFromCode } from "../models/rooms.js";
import type { Server, Socket } from "socket.io";
import { getRoomFromUser } from "@/models/users.js";

const registerRoomHandlers = (io: Server, socket: Socket) => {
  const joinRoom = async (
    room_code: string,
    callback: (response: { success: boolean; message?: string }) => void,
  ) => {
    try {
      if (!socket.data.user_id) throw new Error("Missing user ID");

      const userId = socket.data.user_id;
      
      await leaveRoom();
      
      // If room doesn't exist, return error
      const exists = await roomExistsFromCode(room_code);
      if (!exists) throw new Error("Room does not exist");

      const { id, room_id } = await addMember(userId, room_code);

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
        return;
      
      console.log( `User with ID ${socket.data.user_id} is leaving room ${socket.data.room_id}` );
      await removeMemberFromUserID(socket.data.user_id);

      if (!socket.data.room_id) 
        return;

      socket.leave(socket.data.room_id);

      // Update members list for remaining members in room
      const members = await getMembersInRoom(socket.data.room_id);

      // Delete if no members left in room
      if (members.length === 0) {
        // Give the user 5 seconds to reconnect before deleting the room
        setTimeout(async () => {
          const members = await getMembersInRoom(socket.data.room_id);
          
          if (members.length === 0) {
            await deleteRoom(socket.data.room_id);
            console.log("Deleted empty room with ID:", socket.data.room_id);
          }
        }, 5000);

        return;
      }
      
      socket.broadcast.to(socket.data.room_id).emit("update_members", members);
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

  socket.on("disconnect", () => {
    if (socket.data.user_id && socket.data.room_id)
      leaveRoom();
  });
};

export default registerRoomHandlers;
