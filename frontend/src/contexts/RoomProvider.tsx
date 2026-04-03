import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleError } from "../utils";
import { RoomContext } from "./RoomContext";
import { BACKEND_URL, socket } from "../socket";
import { useAuth } from "./AuthContext";

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [roomCode, setRoomCode] = useState<string | null>(
    sessionStorage.getItem("room_code"),
  );
  const isRoomJoined = sessionStorage.getItem("room_code") !== null;
  const { token } = useAuth();

  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      if (!token) throw new Error("Authentication token not found");

      // Creating room
      console.log("Creating room...");
      const response = await axios.post(
        `${BACKEND_URL}/api/create`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          validateStatus: (status: number) => {
            return status < 400;
          },
        },
      );

      if (!response.data.success) throw new Error("Unauthorized");
      if (!response.data.room_code) throw new Error("Room code not received");

      console.log(
        "Room created successfully, code: " + response.data.room_code,
      );

      // Ensures users is connected
      if (!socket.connected) throw new Error("Socket is not connected");

      // Join room
      if (!isRoomJoined) joinRoom(response.data.room_code);
    } catch (error) {
      handleError(error, setError);
    }
  };

  const leaveRoom = useCallback(() => {
    sessionStorage.removeItem("room_code");
    setRoomCode(null);

    socket.emit("leave_room", (res: { success: boolean; message?: string }) => {
      if (!res.success) {
        handleError(new Error(res.message || "Failed to leave room"), setError);
        return;
      }

      console.log("Left room successfully");
    });

    if (window.location.pathname === "/draw")
      navigate(token ? "/join" : "/login", { replace: true });
  }, [navigate, token]);

  const joinRoom = useCallback(
    (roomCode: string) => {
      // Join room after creating
      socket.emit(
        "join_room",
        roomCode,
        (res: { success: boolean; message?: string }) => {
          if (!res.success) {
            handleError(
              new Error(res.message || "Failed to join room"),
              setError,
            );
            leaveRoom();
            return;
          }

          console.log("Joined room successfully after creation");
          sessionStorage.setItem("room_code", roomCode);
          setRoomCode(roomCode);
          navigate("/draw", { replace: true });
        },
      );
    },
    [navigate, leaveRoom],
  );

  useEffect(() => {
    const onConnect = () => {
      if (roomCode) joinRoom(roomCode);
    };

    const onConnectError = (err: Error) => {
      console.log("Connection error:", err);
      handleError(err, setError);
      sessionStorage.removeItem("room_code");
      setRoomCode(null);
    };

    // If already connected, attempt to join room immediately (e.g., on page refresh)
    if (socket && socket.connected) onConnect();
    else if (!token) {
      sessionStorage.removeItem("room_code");
      setRoomCode(null);
    }

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [joinRoom, roomCode, token]);

  return (
    <RoomContext.Provider
      value={{ isRoomJoined, roomCode, error, createRoom, joinRoom, leaveRoom }}
    >
      {children}
    </RoomContext.Provider>
  );
};
