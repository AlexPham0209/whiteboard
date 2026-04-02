// import { useEffect, useState } from "react";
// import { socket, connect } from "./socket";
// import Whiteboard from "./routes/whiteboard/Whiteboard";
// import Join from "./routes/Join";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Register from "./routes/Register";
import Login from "./routes/Login";
import { useEffect, useState } from "react";
import { socket } from "./socket";
import Create from "./routes/Create";
import Whiteboard from "./routes/whiteboard/Whiteboard";
import { AuthProvider } from "./contexts/AuthProvider";
import { useAuth } from "./contexts/AuthContext";


function Pages() {
  const location = useLocation();
  const [, setJoinedRoom] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);

    console.log(isAuthenticated);
    return (
      <Routes location={location} key={location.pathname}>
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/create" : "/login"} />}
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/create" />}
        />
        
        <Route
          path="/create"
          element={isAuthenticated ? <Create setJoinedRoom={setJoinedRoom} /> : <Navigate to="/login" />}
        />

        <Route
          path="/draw"
          element={
            isAuthenticated ? (
              <Whiteboard />
            ) : (
              <Navigate to={isAuthenticated ? "/join" : "/login"} />
            )
          }
        />
      </Routes>
  );
}
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Pages />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
