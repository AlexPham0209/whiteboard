import { useState, type FormEvent } from "react";

export default function Join() {
  const [userName, setUserName] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(userName);
    console.log(roomCode);
    sessionStorage.setItem("test", "YEAH");
  };

  const onUserNameChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUserName((e.target as HTMLInputElement).value);
  };

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
          name="username"
          value={userName}
          onChange={onUserNameChange}
          required={true}
          placeholder="Username"
          className="border-2 border-gray-300 rounded-2xl w-50 h-12 text-center"
          type="text"
        />
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
function setState<T>(arg0: string): [any, any] {
  throw new Error("Function not implemented.");
}
