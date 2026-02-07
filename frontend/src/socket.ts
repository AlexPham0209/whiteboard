import { io } from "socket.io-client";

const PORT = import.meta.env.VITE_SERVER_PORT;
const URL = import.meta.env.PROD ? undefined : `http://localhost:${PORT}`;
export const socket = io(URL, { autoConnect: false });

export const connect = () => {
  const token = sessionStorage.getItem("token");
  if (token) {
    socket.auth = {
      token: token,
    };

    socket.connect();
  }
};
