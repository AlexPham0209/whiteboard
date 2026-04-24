import { type ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

// Socket & Contexts
import { AuthProvider } from "./hooks/AuthProvider";
import { useAuth } from "./hooks/AuthContext";
import { RoomProvider } from "./hooks/RoomProvider";
import { useRoom } from "./hooks/RoomContext";

// Components
import Register from "./pages/Register";
import Login from "./pages/Login";
import Create from "./pages/Create";
import Whiteboard from "./pages/Whiteboard";
import Join from "./pages/Join";
import NavBar from "./components/navbar/NavBar";
import { RefreshHandler } from "./hooks/RefreshHandler";

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
  const { roomCode } = useRoom();
  // If authenticated but no room, send to create.
  // (Assuming ProtectedRoute handles the auth part)
  return roomCode ? children : <Navigate to="/create" replace />;
};

function Pages() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes location={location} key={location.pathname}>
      {/* Public/Guest Routes */}

      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

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

      <Route
        path="/join"
        element={
          <ProtectedRoute>
            <Join />
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
        <RefreshHandler>
          <RoomProvider>
            <NavBar />
            <Pages />
          </RoomProvider>
        </RefreshHandler>
      </AuthProvider>
    </BrowserRouter>
  );
}
