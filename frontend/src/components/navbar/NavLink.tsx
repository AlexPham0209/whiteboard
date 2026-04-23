import { NavLink as RouterNavLink } from "react-router-dom";

export function NavLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <RouterNavLink
        to={to}
        className={({ isActive }) => `
          px-5 py-2.5 flex items-center justify-center 
          text-sm font-semibold rounded-xl transition-all duration-200
          ${
            isActive
              ? "bg-purple-400 text-white shadow-md shadow-purple-200 scale-105"
              : "text-gray-600 hover:bg-purple-50 hover:text-purple-500"
          }
        `}
      >
        {children}
      </RouterNavLink>
    </li>
  );
}
