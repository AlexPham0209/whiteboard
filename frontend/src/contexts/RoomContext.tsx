import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Line } from "../routes/whiteboard/line";
import type { Member } from "../routes/whiteboard/Member";

interface RoomProps {
  roomCode: string | null;
  error: string;
  createRoom(): void;
  joinRoom(roomCode: string): void;
  leaveRoom(): void;
  members: Member[];
  lines: Line[];
  setMembers: Dispatch<SetStateAction<Member[]>>;
  setLines: Dispatch<SetStateAction<Line[]>>;
}

export const RoomContext = createContext<RoomProps>({
  roomCode: null,
  error: "",
  createRoom: async () => {},
  joinRoom: async () => {},
  leaveRoom: async () => {},
  lines: [],
  setLines: () => {},
  members: [],
  setMembers: () => {},
});

export const useRoom = () => {
  return useContext(RoomContext);
};
