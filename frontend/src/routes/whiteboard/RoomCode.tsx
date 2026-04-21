export function RoomCode({ roomCode }: { roomCode: string }) {
  return (
    <span className="text-3xl text-center flex flex-col justify-center font-bold text-white drop-shadow-[0_2.2px_1.2px_rgba(0,0,0,0.8)]">
      {roomCode}
    </span>
  );
}
