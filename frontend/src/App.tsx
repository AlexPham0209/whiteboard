import { useEffect, useState } from "react";
import socket from "./socket";
import axios from "axios";
import Whiteboard from "./pages/Whiteboard";
import Join from "./pages/Join";
import { BrowserRouter, HashRouter, Navigate, Route, Router, Routes, useLocation } from "react-router-dom";
import Create from "./pages/Create";

function Pages() {
  return (
    <Routes location={useLocation()} key={useLocation().pathname}>
      <Route path="*" element={<Navigate to="/join" />} />
      <Route path="/join" element={<Join />} />
      <Route path="/create" element={<Create />} />
      <Route path="/:code" element={<Whiteboard />} />
    </Routes>
  )
}
function App() {
  return (
    <HashRouter>
      <Pages/>
    </HashRouter>
  );
}

export default App;
