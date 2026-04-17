import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import { NavLink } from "./NavLink";

export default function NavBar() {
  const { isAuthenticated, logout } = useAuth();
  const { isRoomJoined } = useRoom();

  if (isRoomJoined) return null;

  return (
    <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Whiteboard
          </h1>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-4">
            <ul className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <NavLink to="/create">Create</NavLink>
                  <NavLink to="/join">Join</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/register">Register</NavLink>
                  <NavLink to="/login">Login</NavLink>
                </>
              )}
            </ul>

            {/* Action Section */}
            {isAuthenticated && (
              <div className="ml-4 pl-4">
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                  onClick={logout}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
