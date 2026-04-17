import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleError } from "../utils";
import { BACKEND_URL, connect, socket } from "../socket";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string>("");
  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem("token"),
  );
  const isAuthenticated = token !== null;

  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/login`, {
        username: username,
        password: password,
        validateStatus: (status: number) => {
          return status < 400;
        },
      });

      if (!response.data.success) throw new Error("Login failed");
      if (!response.data.token) throw new Error("Token not found");

      console.log("Login successful, token stored");
      sessionStorage.setItem("token", response.data.token);
      setUser(username);
      setToken(response.data.token);
      navigate("/create", { replace: true });
    } catch (err) {
      handleError(err, setError);
      logout();
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/register`, {
        username: username,
        password: password,
        validateStatus: (status: number) => {
          return status < 400;
        },
      });

      if (!response.data.success) throw new Error("Registration failed");
      if (!response.data.token) throw new Error("Token not found");

      console.log("Registration successful, token stored");
      sessionStorage.setItem("token", response.data.token);
      setUser(username);
      setToken(response.data.token);
      navigate("/create", { replace: true });
    } catch (error) {
      handleError(error, setError);
      logout();
    }
  };

  const logout = useCallback(async () => {
    setToken(null);
    setUser("");
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  }, [navigate]);

  // Auto-connect socket if token exists on initial load or when token changes
  useEffect(() => {
    console.log(token ? "Logged in" : "Logged out");
    if (token) connect();
    else socket.disconnect();
  }, [token]);

  // Socket.io events
  useEffect(() => {
    const handleDisconnect = () => {
      console.log("Socket disconnected");
      logout();
    };

    const handleConnectError = (err: Error) => {
      console.log(`Connection error: ${err.message}`);
      logout();
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{ user, token, error, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
