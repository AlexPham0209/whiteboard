import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleError } from "../utils";
import { BACKEND_URL, connect, socket } from "../socket";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access_token"),
  );
  const isAuthenticated = accessToken !== null;

  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/auth/login`,
        {
          username: username,
          password: password,
        },
        {
          withCredentials: true,
          validateStatus: (status: number) => {
            return status < 400;
          },
        },
      );

      if (!response.data.success) throw new Error("Login failed");
      if (!response.data.accessToken) throw new Error("Access token not found");

      console.log("Login successful, token stored");
      localStorage.setItem("access_token", response.data.accessToken);
      setUser(username);
      setAccessToken(response.data.accessToken);
      navigate("/create", { replace: true });
    } catch (err) {
      handleError(err, setError);
      logout();
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/auth/register`,
        {
          username: username,
          password: password,
        },
        {
          withCredentials: true,
          validateStatus: (status: number) => {
            return status < 400;
          },
        },
      );

      if (!response.data.success) throw new Error("Registration failed");
      if (!response.data.accessToken) throw new Error("Access token not found");

      console.log("Registration successful, token stored");
      localStorage.setItem("access_token", response.data.accessToken);
      setUser(username);
      setAccessToken(response.data.accessToken);
      navigate("/create", { replace: true });
    } catch (error) {
      handleError(error, setError);
      logout();
    }
  };

  const logout = useCallback(async () => {
    setAccessToken(null);
    setUser("");
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  }, [navigate]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          validateStatus: (status: number) => {
            return status < 400;
          },
        },
      );

      if (!response.data.success) throw new Error("Token refresh failed");
      if (!response.data.accessToken) throw new Error("Access token not found");

      localStorage.setItem("access_token", response.data.accessToken);
      setAccessToken(response.data.accessToken);
    } catch (error) {
      console.log("Token refresh failed:", error);
      logout();
    }
  }, [logout]);

  // Auto-connect socket if token exists on initial load or when token changes
  useEffect(() => {
    console.log(accessToken ? "Logged in" : "Logged out");
    if (accessToken) connect();
    else socket.disconnect();
  }, [accessToken, refreshToken]);

  // Socket.io events
  useEffect(() => {
    const handleDisconnect = () => {
      console.log("Socket disconnected");
      logout();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleConnectError = async (err: Error | any) => {
      console.log(
        `Connection error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );

      if (err.data && err.data.status === 401) {
        console.log("Unauthorized error, attempting token refresh");
        await refreshToken();
      } else {
        console.log("Non-authentication error, disconnecting socket");
        socket.disconnect();
      }
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [logout, refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
