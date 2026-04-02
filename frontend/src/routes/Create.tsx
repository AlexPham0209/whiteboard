import { useState } from "react";
import { useRoom } from "../contexts/RoomContext";

export default function Create() {
  const [roomName, setRoomName] = useState<string>("");
  const { createRoom } = useRoom();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createRoom();
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
          onChange={(e) => setRoomName(e.currentTarget.value)}
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
