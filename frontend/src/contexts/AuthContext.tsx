import { createContext, useContext } from "react";

interface AuthProps {
    user: string,
    token: string | null,
    error: string,
    isAuthenticated: boolean,
    login(username: string, password: string): void,
    register(username: string, password: string): void,
    logout(): void,
}

export const AuthContext = createContext<AuthProps>({
    user: "",
    token: null,
    error: "",
    isAuthenticated: false,
    login: async () => {},
    register: async () => {},
    logout: async () => {}
}); 


export const useAuth = () => {
    return useContext(AuthContext);
}