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
  // useNavigate,
} from "react-router-dom";
// import Create from "./routes/Create";
import SignUp from "./routes/Signup";
import Login from "./routes/Login";
import { useState } from "react";

function Pages() {
  const location = useLocation();
  const [, setJoined] = useState(false);
  // const navigate = useNavigate();

  // useEffect(() => {
  //   const onConnect = () => {
  //     setJoined(true);
  //     navigate("/draw");
  //   };

  //   const onError = (error: Error) => {
  //     console.log(error.message);
  //     setJoined(false);
  //     sessionStorage.removeItem("token");
  //   };

  //   const onDisconnect = () => {
  //     setJoined(false);
  //     sessionStorage.removeItem("token");
  //     socket.disconnect();
  //     window.location.reload();
  //   };

  //   socket.on("connect", onConnect);
  //   socket.on("connect_error", onError);
  //   socket.on("disconnect", onDisconnect);
  //   connect();

  //   return () => {
  //     socket.off("connect", onConnect);
  //     socket.off("disconnect", onDisconnect);
  //     socket.off("connect_error", onError);
  //   };
  // }, [navigate]);

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="*" element={<Navigate to={"/signup"} />} />
      <Route path="/register" element={<SignUp setJoined={setJoined} />} />
      <Route path="/login" element={<Login setJoined={setJoined} />} />
      {/* <Route
        path="/draw"
        element={joined ? <Whiteboard /> : <Navigate to="/join" />}
      /> */}
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
