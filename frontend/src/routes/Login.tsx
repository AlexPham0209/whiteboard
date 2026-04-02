import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login } = useAuth();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(username, password);
  };

  const onUsernameChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUsername((e.target as HTMLInputElement).value);
  };

  const onPasswordChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPassword((e.target as HTMLInputElement).value);
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
          onChange={onUsernameChange}
          required={true}
          placeholder="Username"
          className="border-2 border-gray-300 rounded-2xl w-50 h-12 text-center"
          type="text"
        />
        <input
          name="password"
          value={password}
          onChange={onPasswordChange}
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
