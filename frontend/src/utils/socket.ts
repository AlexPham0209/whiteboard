import { io } from "socket.io-client";

export const PORT = import.meta.env.VITE_SERVER_PORT;
export const BACKEND_URL = import.meta.env.PROD
  ? `${import.meta.env.BASE_URL}:${PORT}`
  : `http://localhost:80`;

export const socket = io(BACKEND_URL, { path: '/backend/socket.io/', autoConnect: false });

export const connect = () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    if (socket.connected) socket.disconnect();

    socket.auth = {
      token: token,
    };

    // console.log("Connecting to socket with token:", token);
    socket.connect();
  }
};
