export interface Member {
  username: string;
  joined_at: string;
}

export function MemberList({ members }: { members: Member[] }) {
  return (
    <div className="absolute flex flex-col right-10 t-0 m-10 z-10 text-2xl font-bold text-black">
      {members.map(Member)}
    </div>
  );
}

function Member(user: Member) {
  return (
    <div className="font-bold text-white drop-shadow-[0_2.2px_1.2px_rgba(0,0,0,0.8)]">
      {user.username}
    </div>
  );
}
