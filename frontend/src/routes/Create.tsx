import { useState } from "react";
import { useRoom } from "../contexts/RoomContext";

export default function Create() {
  const [roomName, setRoomName] = useState<string>("");
  const { createRoom } = useRoom();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRoom();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 p-4">
      <form
        onSubmit={onSubmit}
        className="w-80 h-60 bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center justify-evenly"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
            Room Name
          </label>
          <input
            name="room-name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
            placeholder="room_name"
            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50/50"
            type="text"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-400 hover:bg-purple-500 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 transition-all flex justify-center items-center mt-10"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Create Room"
          )}
        </button>
      </form>
    </div>
  );
}
