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
import { useEffect, useState } from "react";
import axios from "axios";

function Pages() {
  const location = useLocation();
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!joined) return;

    const config = {
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    };

    axios
      .post(
        "http://localhost:3000/api/test",
        {
          validateStatus: (status: number) => {
            return status < 500;
          },
        },
        config,
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err.response.data.message);
        setJoined(false);
      });
  }, [joined]);

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
