import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { handleError } from "../utils";
import { connect, socket } from "../socket";
import { AuthContext } from "./AuthContext";
import api from "../axiosApi";

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
      const response = await api.post(
        `/auth/login`,
        {
          username: username,
          password: password,
        },
        {
          withCredentials: true,
          validateStatus: (status: number) => {
            return status < 500;
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
      const response = await api.post(
        `/auth/register`,
        {
          username: username,
          password: password,
        },
        {
          withCredentials: true,
          validateStatus: (status: number) => {
            return status < 500;
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

    if (location.pathname !== "/login" && location.pathname !== "/register")
      navigate("/login", { replace: true });
  }, [navigate, location]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post(
        `/auth/refresh`,
        {},
        {
          withCredentials: true,
        },
      );

      if (!response.data.success) throw new Error("Token refresh failed");
      if (!response.data.accessToken) throw new Error("Access token not found");

      console.log("Refreshed");
      localStorage.setItem("access_token", response.data.accessToken);
      setAccessToken(response.data.accessToken);
      setError("");
      
      return response.data.accessToken;

    } catch (error) {
      console.log(error);
      logout();
      return null;
    }
  }, [logout]);

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
      // logout();
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
      }
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [logout, refreshToken]);

  // Handles refresh token upon 401 request errors
  useLayoutEffect(() => {
    const requestIntercept = api.interceptors.request.use((config) => {
      if (!config.headers.Authorization && accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true; // prevent infinite loops

          try {
            const newAccessToken = await refreshToken();
            
            // Retry original request
            prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(prevRequest); 
              
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptors if the component unmounts
    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, logout, refreshToken]);

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
