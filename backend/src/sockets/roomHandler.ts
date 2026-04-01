import { addMember, removeMember } from "../models/members.js";
import { getMembersInRoom, roomExists } from "../models/rooms.js";
import type { Server, Socket } from "socket.io";

const registerRoomHandlers = (io: Server, socket: Socket) => {
  socket.on(
    "join_room",
    async (
      room_code: string,
      callback: (response: { success: boolean; message?: string }) => void,
    ) => {
      try {
        if (!socket.data.user_id) throw new Error("Missing user ID");

        const { id, room_id } = await addMember(
          socket.data.user_id,
          room_code,
        );

        socket.data.member_id = id;
        socket.data.room_id = room_id;
        socket.join(socket.data.room_id);

        const members = await getMembersInRoom(socket.data.room_id);
        socket.broadcast
          .to(socket.data.room_id)
          .emit("update_members", members);
        callback({ success: true, message: "Joined room successfully" });
      } catch (err) {
        if (err instanceof Error)
          callback({ success: false, message: err.message });
        else callback({ success: false, message: "An unknown error occurred" });
      }
    },
  );

  socket.on("leave_room", async () => {
    try {
      await removeMember(socket.data.user_id);
      socket.data.member_id = undefined;
      socket.data.room_id = undefined;
    } catch (err) {
      throw err;
    }
  });
};

export default registerRoomHandlers;
