import axios from "axios";
import { useState } from "react";

export default function SignUp({
  setJoined,
}: {
  setJoined: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/auth/register", {
        username: userName,
        password: password,
        validateStatus: (status: number) => {
          return status < 500;
        },
      })
      .then((res) => {
        sessionStorage.setItem("token", res.data.token);
      })
      .catch((err) => {
        console.log(err.response.data.message);
        setJoined(false);
        setUserName("");
      });
  };

  const onUserNameChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUserName((e.target as HTMLInputElement).value);
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
          value={userName}
          onChange={onUserNameChange}
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
