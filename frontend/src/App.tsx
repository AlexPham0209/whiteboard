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
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="*" element={<Navigate to="/join" />} />
      <Route path="/join" element={<Join />} />
      <Route path="/create" element={<Create />} />
      <Route
        path="/draw"
        element={
          sessionStorage.getItem("test") ? (
            <Whiteboard />
          ) : (
            <Navigate to="/join" />
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
