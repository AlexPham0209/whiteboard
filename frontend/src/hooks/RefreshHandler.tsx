import { useEffect, useLayoutEffect } from "react";
import api from "../utils/axiosApi";
import { useAuth } from "./AuthContext";
import { socket } from "../utils/socket";

export function RefreshHandler({ children }: { children: React.ReactNode }) {
  const { accessToken, logout, refreshToken } = useAuth();

  // Handle HTTP request refreshes
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

        // Doesn't trigger refresh for requests to the refresh endpoint
        if (prevRequest?.url === "/auth/refresh") return Promise.reject(error);

        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true; // prevent infinite loops

          try {
            const newAccessToken = await refreshToken();
            if (!newAccessToken) throw error;

            // Retry original request
            prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(prevRequest);
          } catch (refreshError) {
            await logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );

    // Clean up interceptors if the component unmounts
    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, logout, refreshToken]);


  // Handles Socket.io Refreshes
  useEffect(() => {      
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
  
      socket.on("connect_error", handleConnectError);
      return () => {
        socket.off("connect_error", handleConnectError);
      };
    }, [logout, refreshToken]);

  return children;
}
