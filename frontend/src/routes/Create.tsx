import axios from "axios";
import { socket } from "../socket";
import { useState } from "react";
import { handleError } from "../utils";

export default function Create({ setJoinedRoom }: { setJoinedRoom: (joined: boolean) => void }) {
  const [roomName, setRoomName] = useState<string>("");
  const [, setError] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Creating room
      console.log("Creating room...");
      const response = await axios.post("http://localhost:3000/api/create", {}, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },

        validateStatus: (status: number) => {
          return status < 400;
        },
      });
      
      if (!response.data.success) throw new Error("Unauthorized");
      if (!response.data.room_code) throw new Error("Room code not received");
      
      console.log("Room created successfully, code: " + response.data.room_code);
      
      // Ensures users is connected
      if (!socket.connected) throw new Error("Socket is not connected");
        
      // Join room after creating
      socket.emit("join_room", response.data.room_code, (res: { success: boolean; message?: string }) => {
        if (!res.success) {
          handleError(new Error(res.message || "Failed to join room"), setError);
          return;
        }
        
        console.log("Joined room successfully after creation");
        setJoinedRoom(true);
      });

    } catch (error) {
      handleError(error, setError);
    }
  };

  const onRoomNameChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setRoomName((e.target as HTMLInputElement).value);
  };

  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-200">
      <form
        onSubmit={onSubmit}
        className="w-1/4 h-1/3 min-w-80 min-h-60 bg-white rounded-2xl shadow-xl p-2 flex flex-col items-center justify-evenly"
      >
        <input
          name="Room Name"
          value={roomName}
          onChange={onRoomNameChange}
          required={true}
          placeholder="Room Name"
          className="border-2 border-gray-300 rounded-2xl w-50 h-12 text-center"
          type="text"
        />
        <button
          type="submit"
          className="bg-purple-300 p-4 rounded-2xl text-1xl"
        >
          Create
        </button>
      </form>
    </div>
  );
}
