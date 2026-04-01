export function RoomCode({ roomCode }: { roomCode: string }) {
  return (
    <div className="absolute m-auto mt-10 z-10 text-3xl font-bold text-white drop-shadow-[0_2.2px_1.2px_rgba(0,0,0,0.8)]">
      {roomCode}
    </div>
  );
}
