import { useEffect, useState } from "react";
import { socket, connect } from "./socket";
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
    const onConnect = () => {
      console.log("On connect");
      setJoined(true);
      navigate("/draw");
    };

    const onError = (error: Error) => {
      console.log(error.message);
      onDisconnect();
      
    };

    const onDisconnect = () => {
      console.log("disconnect");
      setJoined(false);
      sessionStorage.removeItem("token");
      socket.disconnect();
      window.location.reload();
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onError);
    socket.on("disconnect", onDisconnect);
    connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
    };
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
