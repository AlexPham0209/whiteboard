import { io } from "socket.io-client";

export const PORT = import.meta.env.VITE_SERVER_PORT;
export const BACKEND_URL = import.meta.env.PROD ? `${import.meta.env.BASE_URL}:${PORT}` : `http://localhost:${PORT}`;

export const socket = io(BACKEND_URL, { autoConnect: false });

export const connect = () => {
  const token = sessionStorage.getItem("token");
  if (token) {
    if (socket.connected) socket.disconnect();

    socket.auth = {
      token: token,
    };

    socket.connect();
  }
};
