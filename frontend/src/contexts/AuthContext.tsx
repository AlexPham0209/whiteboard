import { createContext, useContext } from "react";
// import { useNavigate } from "react-router-dom";

interface AuthProps {
    token: string | undefined,
    isAuthenticated: false,
    login(): void,
    logout() :void,
}

const AuthContext = createContext<AuthProps>({
    token: undefined,
    isAuthenticated: false,
    login: () => {},
    logout: () => {}
}); 

// const AuthProvider = ({ children }: { children: React.ReactNode}) => {
    
// };

export const useAuth = () => {
    return useContext(AuthContext);
}