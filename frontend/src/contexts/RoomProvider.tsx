import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleError } from "../utils";
import { RoomContext } from "./RoomContext";
import { socket } from "../socket";
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
      if (!token)
        throw new Error("Authentication token not found");

      // Creating room
      console.log("Creating room...");
      const response = await axios.post(
        "http://localhost:3000/api/create",
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
            return;
          }
          
          console.log("Joined room successfully after creation");
          sessionStorage.setItem("room_code", roomCode);
          setRoomCode(roomCode);
          navigate("/draw", { replace: true });
        },
      );
    },
    [navigate],
  );

  useEffect(() => {
    socket.on("connect", () => {
      if (roomCode) joinRoom(roomCode);
    });

    return () => {
      socket.off("connect");
    };
  }, [joinRoom, roomCode]);

  return (
    <RoomContext.Provider
      value={{ isRoomJoined, roomCode, error, createRoom, joinRoom }}
    >
      {children}
    </RoomContext.Provider>
  );
};
