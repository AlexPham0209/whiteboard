import { type ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

// Socket & Contexts
import { AuthProvider } from "./contexts/AuthProvider";
import { useAuth } from "./contexts/AuthContext";
import { RoomProvider } from "./contexts/RoomProvider";
import { useRoom } from "./contexts/RoomContext";

// Components
import Register from "./routes/Register";
import Login from "./routes/Login";
import Create from "./routes/Create";
import Whiteboard from "./routes/whiteboard/Whiteboard";

/**
 * Higher-Order Components for Route Protection
 */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/create" replace />;
};

const RoomRoute = ({ children }: { children: ReactNode }) => {
  const { isRoomJoined } = useRoom();
  // If authenticated but no room, send to create.
  // (Assuming ProtectedRoute handles the auth part)
  return isRoomJoined ? children : <Navigate to="/create" replace />;
};

function Pages() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <Routes location={location} key={location.pathname}>
      {/* Public/Guest Routes */}
      <Route path="/register" element={<Register />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      {/* Protected Routes (Require Auth) */}
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <Create />
          </ProtectedRoute>
        }
      />

      {/* Room Routes (Require Auth + Room) */}
      <Route
        path="/draw"
        element={
          <ProtectedRoute>
            <RoomRoute>
              <Whiteboard />
            </RoomRoute>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/create" : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoomProvider>
          <Pages />
        </RoomProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
