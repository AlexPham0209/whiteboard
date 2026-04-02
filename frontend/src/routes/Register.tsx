import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { register } = useAuth();
  
  const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    register(username, password);
  };
  
  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-200">
      <form
        onSubmit={onSubmit}
        className="w-1/4 h-1/3 min-w-80 min-h-60 bg-white rounded-2xl shadow-xl p-2 flex flex-col items-center justify-evenly"
      >
        <input
          name="username"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          required={true}
          placeholder="Username"
          className="border-2 border-gray-300 rounded-2xl w-50 h-12 text-center"
          type="text"
        />
        <input
          name="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          required={true}
          placeholder="Password"
          className="border-2 border-gray-300 rounded-2xl w-50 h-12 text-center"
          type="password"
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
