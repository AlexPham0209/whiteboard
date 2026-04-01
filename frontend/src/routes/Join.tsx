import { useEffect, useState } from "react";
import { socket, connect } from "../socket";
import axios from "axios";

export default function Join({
  setJoinedRoom,
}: {
  setJoinedRoom: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [roomCode, setRoomCode] = useState<string>("");

  useEffect(() => {
    const connectError = (err: Error) => {
      console.log(`error due to ${err.message}`);
      setJoinedRoom(false);
      setRoomCode("");
    };

    socket.on("connect_error", connectError);
    return () => {
      socket.off("update_canvas", connectError);
    };
  }, [setJoinedRoom]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/join", {
        room_code: roomCode,
        validateStatus: (status: number) => {
          return status < 500;
        },
      })
      .then((res) => {
        sessionStorage.setItem("token", res.data);
        connect();
      })
      .catch((err) => {
        console.log(err.response.data.message);
        setRoomCode("");
      });
  };

  // const onUserNameChange = (e: React.FormEvent<HTMLInputElement>) => {
  //   e.preventDefault();
  //   setUserName((e.target as HTMLInputElement).value);
  // };

  const onRoomCodeChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setRoomCode((e.target as HTMLInputElement).value);
  };

  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-200">
      <form
        onSubmit={onSubmit}
        className="w-1/4 h-1/3 min-w-80 min-h-60 bg-white rounded-2xl shadow-xl p-2 flex flex-col items-center justify-evenly"
      >
        <input
          name="room-code"
          value={roomCode}
          onChange={onRoomCodeChange}
          required={true}
          placeholder="Room Code"
          className="border-2 border-gray-300 rounded-2xl w-50 h-12 text-center"
          type="text"
        />
        <button
          type="submit"
          className="bg-purple-300 p-4 rounded-2xl text-1xl"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
