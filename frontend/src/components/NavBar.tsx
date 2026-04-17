import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import { NavLink } from "./NavLink";

export default function NavBar() {
    const { isAuthenticated, logout } = useAuth();
    const { isRoomJoined } = useRoom();
    if (isRoomJoined) 
        return null;

    return (
        <nav className="flex flex-row justify-between fixed top-0 h-20 w-full text-black text-sm font-medium z-20 bg-white shadow-2xs p-6">
            <h1 className="flex px-2 py-3 justify-center items-center text-center">Whiteboard</h1>
            <ul className="flex flex-row gap-4">
                {/* <NavLink to="/">Home</NavLink> */}
                {isAuthenticated && <NavLink to="/create">Create</NavLink>}
                {isAuthenticated && <NavLink to="/join">Join</NavLink>}
                {!isAuthenticated && <NavLink to="/register">Register</NavLink>}
                {!isAuthenticated && <NavLink to="/login">Login</NavLink>}
                {isAuthenticated && 
                    <button className="px-2 py-3 flex justify-center items-center rounded-md hover:bg-gray-700 hover:text-white" 
                    onClick={logout}>
                        Log out
                    </button>
                }
            </ul>
        </nav>
    );
}