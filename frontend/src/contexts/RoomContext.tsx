import { createContext, useContext } from "react";

interface RoomProps {
  roomCode: string | null;
  error: string;
  createRoom(): void;
  joinRoom(roomCode: string): void;
  leaveRoom(): void;
}

export const RoomContext = createContext<RoomProps>({
  roomCode: null,
  error: "",
  createRoom: async () => {},
  joinRoom: async () => {},
  leaveRoom: async () => {},
});

export const useRoom = () => {
  return useContext(RoomContext);
};
