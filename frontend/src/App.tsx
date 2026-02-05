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
} from "react-router-dom";
import Create from "./pages/Create";

function Pages() {
  const location = useLocation();
  const [joined, setJoined] = useState(false);

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
