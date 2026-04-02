import { createContext, useContext } from "react";

interface RoomProps {
  isRoomJoined: boolean;
  roomCode: string | null;
  error: string;
  createRoom(): void;
  joinRoom(roomCode: string): void;
}

export const RoomContext = createContext<RoomProps>({
  roomCode: null,
  isRoomJoined: false,
  error: "",
  createRoom: async () => {},
  joinRoom: async () => {},
});

export const useRoom = () => {
  return useContext(RoomContext);
};
