import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppError, handleError } from "../utils";
import { RoomContext } from "./RoomContext";
import { BACKEND_URL, socket } from "../socket";
import { useAuth } from "./AuthContext";

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [roomCode, setRoomCode] = useState<string | null>(
    sessionStorage.getItem("room_code"),
  );
  const { accessToken, refreshToken } = useAuth();

  const [error, setError] = useState<string>("");
  const [isRoomJoined, setRoomJoined] = useState<boolean>(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      if (!accessToken) throw new Error("Authentication token not found");

      // Creating room
      console.log("Creating room...");
      const response = await axios.post(
        `${BACKEND_URL}/api/create`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },

          validateStatus: (status: number) => {
            return status < 400;
          },
        },
      );

      if (!response.data.success) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Please log in again");
        }
      }
      if (!response.data.room_code) throw new Error("Room code not received");

      console.log(
        "Room created successfully, code: " + response.data.room_code,
      );

      // Ensures users is connected
      if (!socket.connected) throw new Error("Socket is not connected");

      // Join rooms automatically after creating
      sessionStorage.setItem("room_code", response.data.room_code);
      setRoomCode(response.data.room_code);
    } catch (error) {
      handleError(error, setError);

      if (error instanceof AppError && error.status === 401)
        await refreshToken();
    }
  };

  const leaveRoom = useCallback(() => {
    sessionStorage.removeItem("room_code");
    setRoomCode(null);
    setRoomJoined(false);
    setError("");

    socket.emit("leave_room", (res: { success: boolean; message?: string }) => {
      if (!res.success) {
        handleError(new Error(res.message || "Failed to leave room"), setError);
        return;
      }

      console.log("Left room successfully");
    });

    if (window.location.pathname === "/draw")
      navigate(accessToken ? "/join" : "/login", { replace: true });
  }, [navigate, accessToken]);

  const joinRoom = useCallback(
    (roomCode: string) => {
      if (!socket.connected || isRoomJoined) return;
      
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
            setRoomCode(null);
            return;
          }

          console.log("Joined room successfully after creation");
          sessionStorage.setItem("room_code", roomCode);
          setRoomCode(roomCode);
          setRoomJoined(true);
          navigate("/draw", { replace: true });
        },
      );
    },
    [navigate, isRoomJoined],
  );

  useEffect(() => {
    const onConnect = () => {
      if (roomCode && !isRoomJoined) joinRoom(roomCode);
    };

    if (!accessToken) {
      sessionStorage.removeItem("room_code");
      setRoomCode(null);
    }

    const onConnectError = (err: Error) => {
      console.log("Connection error:", err);
      handleError(err, setError);
      sessionStorage.removeItem("room_code");
      setRoomCode(null);
    };

    // If already connected, attempt to join room immediately (e.g., on page refresh)
    if (socket && socket.connected && roomCode && !isRoomJoined) 
      joinRoom(roomCode);
    

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [joinRoom, roomCode, accessToken, isRoomJoined]);

  return (
    <RoomContext.Provider
      value={{ roomCode, error, createRoom, joinRoom, leaveRoom }}
    >
      {children}
    </RoomContext.Provider>
  );
};
