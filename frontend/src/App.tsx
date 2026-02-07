import { useEffect, useState } from "react";
import socket from "./socket";
import axios from "axios";
import Whiteboard from "./pages/Whiteboard";
import Join from "./pages/Join";
import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Router,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Create from "./pages/Create";

function Pages() {
  const location = useLocation();
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      socket.auth = {
        token: token
      };

      if (socket.disconnected)
        socket.connect();
    }

    const onSession = (token) => {
      socket.auth = { 
        token: token 
      };
      sessionStorage.setItem("token", token);
      setJoined(true);
      navigate("/draw");
    } 

    const onError = (error: Error) => {
      setJoined(false);
      sessionStorage.removeItem("token");
      socket.disconnect();
    }

    socket.on("session", onSession);
    socket.on("connect_error", onError);
    return (() => {
      socket.off("session", onSession);
      socket.off("connect_error", onError);
    });
  }, []);

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="*" element={<Navigate to={joined ? "/draw" : "/join"} />} />
      <Route path="/join" element={<Join setJoined={setJoined} />} />
      <Route path="/create" element={<Create />} />
      <Route
        path="/draw"
        element={joined ? <Whiteboard /> : <Navigate to="/join" />}
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
