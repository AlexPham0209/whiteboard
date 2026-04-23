import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { handleError } from "../utils/utils";
import { connect, socket } from "../utils/socket";
import { AuthContext } from "./AuthContext";
import api from "../utils/axiosApi";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access_token"),
  );
  const isAuthenticated = accessToken !== null;

  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post(`/auth/login`, {
        username: username,
        password: password,
      });

      if (!response.data.success) throw new Error("Login failed");
      if (!response.data.accessToken) throw new Error("Access token not found");

      console.log("Login successful, token stored");
      localStorage.setItem("access_token", response.data.accessToken);
      setUser(username);
      setAccessToken(response.data.accessToken);
      navigate("/create", { replace: true });
    } catch (err) {
      handleError(err, setError);
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await api.post(`/auth/register`, {
        username: username,
        password: password,
      });

      if (!response.data.success) throw new Error("Registration failed");
      if (!response.data.accessToken) throw new Error("Access token not found");

      console.log("Registration successful, token stored");
      localStorage.setItem("access_token", response.data.accessToken);
      setUser(username);
      setAccessToken(response.data.accessToken);
      navigate("/create", { replace: true });
    } catch (error) {
      handleError(error, setError);
    }
  };

  const logout = useCallback(async () => {
    try {
      console.log("Logout");
      const response = await api.post(`/auth/logout`);
      if (!response.data.success) throw new Error("Logout failed");

      setAccessToken(null);
      setUser("");
      localStorage.removeItem("access_token");

      if (location.pathname !== "/login" && location.pathname !== "/register")
        navigate("/login", { replace: true });
    } catch (err) {
      handleError(err, setError);
    }
  }, [setUser, setAccessToken, location, navigate]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post(`/auth/refresh`);

      if (!response.data.success) throw new Error("Token refresh failed");
      if (!response.data.accessToken) throw new Error("Access token not found");

      console.log("Refreshed");
      localStorage.setItem("access_token", response.data.accessToken);
      setAccessToken(response.data.accessToken);
      setError("");

      return response.data.accessToken;
    } catch (error) {
      console.log(error);
      return null;
    }
  }, []);

  // When the access token is missing in local storage, we try to refresh the token and if we can't, we log out
  useEffect(() => {
    const localChanged = async () => {
      if (localStorage.getItem("access_token")) return;

      const token = await refreshToken();
      if (!token) logout();
    };

    window.addEventListener("storage", localChanged);

    return () => {
      window.removeEventListener("storage", localChanged);
    };
  }, [refreshToken, logout]);

  // Auto-connect socket if token exists on initial load or when token changes
  useEffect(() => {
    console.log(accessToken ? "Logged in" : "Logged out");
    if (accessToken) connect();
    else socket.disconnect();
  }, [accessToken]);

  // Reset on page transition
  useEffect(() => {
    setError("");
  }, [location]);

  // Socket.io events
  useEffect(() => {
    const handleDisconnect = () => {
      console.log("Socket disconnected");
      logout();
    };

    socket.on("disconnect", handleDisconnect);
    return () => {
      socket.off("disconnect", handleDisconnect);
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
