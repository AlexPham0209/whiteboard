import { io } from "socket.io-client";

export const PORT = import.meta.env.VITE_SERVER_PORT;
export const SOCKET_URL = import.meta.env.PROD
  ? `${import.meta.env.BASE_URL}`
  : `http://localhost:${PORT}`;

export const socket = io(SOCKET_URL, { autoConnect: false });

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
