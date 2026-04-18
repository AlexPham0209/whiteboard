import { createContext, useContext } from "react";

interface AuthProps {
  user: string;
  accessToken: string | null;
  error: string;
  isAuthenticated: boolean;
  login(username: string, password: string): void;
  register(username: string, password: string): void;
  refreshToken(): void;
  logout(): void;
}

export const AuthContext = createContext<AuthProps>({
  user: "",
  accessToken: null,
  error: "",
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshToken: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};
