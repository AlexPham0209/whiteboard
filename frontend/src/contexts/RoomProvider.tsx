import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { handleError } from "../utils";
import { RoomContext } from "./RoomContext";
import { socket } from "../socket";
import { useAuth } from "./AuthContext";
import type { Line } from "../routes/whiteboard/line";
import type { Member } from "../routes/whiteboard/Member";
import api from "../axiosApi";

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [roomCode, setRoomCode] = useState<string | null>(
    sessionStorage.getItem("room_code"),
  );
  const { accessToken, refreshToken } = useAuth();

  const [error, setError] = useState<string>("");
  const [isRoomJoined, setRoomJoined] = useState<boolean>(false);

  // Room States
  const [lines, setLines] = useState<Line[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  const clearRoomState = () => {
    sessionStorage.removeItem("room_code");
    setRoomCode(null);
    setRoomJoined(false);
    setMembers([]);
    setLines([]);
  };

  const joinRoom = useCallback(
    (roomCode: string) => {
      if (!socket.connected || isRoomJoined) return;

      // Join room after creating
      socket.emit(
        "join_room",
        roomCode,
        (res: {
          success: boolean;
          message: string;
          lines?: Line[];
          members?: Member[];
        }) => {
          if (!res.success) {
            handleError(
              new Error(res.message || "Failed to join room"),
              setError,
            );
            clearRoomState();
            return;
          }

          console.log("Joined room successfully after creation");
          sessionStorage.setItem("room_code", roomCode);
          setRoomJoined(true);

          // Set room states
          setRoomCode(roomCode);
          setLines(res.lines || []);
          setMembers(res.members || []);

          // Go to whiteboard
          navigate("/draw", { replace: true });
        },
      );
    },
    [isRoomJoined, navigate],
  );

  const createRoom = async () => {
    try {
      if (!accessToken) throw new Error("Authentication token not found");

      // Creating room
      console.log("Creating room...");
      const response = await api.post(
        `/api/create`,
      );
    
      if (!response.data.room_code) throw new Error("Room code not received");

      console.log(
        "Room created successfully, code: " + response.data.room_code,
      );

      // Join rooms automatically after creating
      setRoomCode(response.data.room_code);
      setRoomJoined(false);
    } catch (error) {
      handleError(error, setError);
    }
  };
  
  const leaveRoom = useCallback(() => {
    clearRoomState();

    socket.emit("leave_room", (res: { success: boolean; message?: string }) => {
      if (!res.success) {
        handleError(new Error(res.message || "Failed to leave room"), setError);
        return;
      }

      console.log("Left room successfully");
    });

    if (location.pathname === "/draw")
      navigate(accessToken ? "/join" : "/login", { replace: true });
  }, [navigate, accessToken, location]);

  // Reset on page transition
  useEffect(() => {
    setError("");
  }, [location]);

  useEffect(() => {
    const onConnect = () => {
      if (roomCode && !isRoomJoined) joinRoom(roomCode);
    };

    // If already connected, attempt to join room immediately (e.g., on page refresh)
    if (socket.connected && roomCode && !isRoomJoined) joinRoom(roomCode);

    socket.on("connect", onConnect);
    return () => {
      socket.off("connect");
    };
  }, [joinRoom, roomCode, isRoomJoined, refreshToken]);

  return (
    <RoomContext.Provider
      value={{
        roomCode,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
        members,
        setMembers,
        lines,
        setLines,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
