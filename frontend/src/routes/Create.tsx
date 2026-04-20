import { useState } from "react";
import { useRoom } from "../contexts/RoomContext";


export default function Create() {
  const [roomName, setRoomName] = useState<string>("");
  const { createRoom, error } = useRoom();
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
    <div className="background">
      <form
        onSubmit={onSubmit}
        className="w-80 h-60 bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center justify-evenly"
      >
        <div className="space-y-1.5">
          <label className="input-label">Room Name</label>
          <input
            name="room-name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
            placeholder="room_name"
            className="input-field"
            type="text"
          />
        </div>

        {error && <div className="text-center text-red-500 mt-4">{error}</div>}

        <button type="submit" disabled={loading} className="button">
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
