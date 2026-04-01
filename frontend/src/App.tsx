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
  useNavigate,
} from "react-router-dom";
import Register from "./routes/Register";
import Login from "./routes/Login";
import { useEffect, useState } from "react";
import { connect, socket } from "./socket";
import Create from "./routes/Create";
import Whiteboard from "./routes/whiteboard/Whiteboard";


function Pages() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState<boolean>(sessionStorage.getItem("token") !== null);
  const [joinedRoom, setJoinedRoom] = useState<boolean>(false);

  useEffect(() => {
    socket.on("connect", () => {
      navigate("/create");
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      navigate("/login");
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
  }, [navigate]);

  useEffect(() => {
    console.log(loggedIn ? "User is logged in" : "User is not logged in");
    if (loggedIn) 
      connect();
    else 
      socket.disconnect();
  }, [loggedIn]);

  
  return (
    <Routes location={location} key={location.pathname}>
      <Route
        path="*"
        element={<Navigate to={loggedIn ? "/create" : "/login"} />}
      />
      <Route path="/register" element={<Register setLoggedIn={setLoggedIn} />} />
      <Route
        path="/login"
        element={!loggedIn ? <Login setLoggedIn={setLoggedIn} /> : <Navigate to="/create" />}
      />
    
      <Route
        path="/create"
        element={loggedIn ? <Create setJoinedRoom={setJoinedRoom} /> : <Navigate to="/login" />}
      />

      <Route
        path="/draw"
        element={
          joinedRoom ? (
            <Whiteboard />
          ) : (
            <Navigate to={loggedIn ? "/join" : "/login"} />
          )
        }
      />
    </Routes>
  );
}
function App() {
  return (
    <BrowserRouter>
      <Pages />
    </BrowserRouter>
  );
}

export default App;
