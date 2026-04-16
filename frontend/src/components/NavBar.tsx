import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";

export default function NavBar() {
    const { isAuthenticated } = useAuth();
    const { isRoomJoined } = useRoom();
    if (!isRoomJoined) 
        return null;

    return (
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
                {isAuthenticated && <li><a href="/about">Create</a></li>}
                {isAuthenticated && <li><a href="/join">Join</a></li>}
                {!isAuthenticated && <li><a href="/register">Register</a></li>}
                {!isAuthenticated && <li><a href="/login">Login</a></li>}
            </ul>
        </nav>
    );
}