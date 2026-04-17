import { Link } from "react-router-dom";

export function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li className="px-2 py-3 flex justify-center items-center rounded-md hover:bg-gray-700 hover:text-white">
      <Link to={to}>
        {children}
      </Link>
    </li>
  );
}