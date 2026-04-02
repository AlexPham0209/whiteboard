import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleError } from "../utils";
import { connect, socket } from "../socket";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode}) => {
    const [user, setUser] = useState<string>("");
    const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));
    const [error, setError] = useState<string>("");
    const [isAuthenticated, setAuthenticated] = useState<boolean>(sessionStorage.getItem('token') !== null);
    const navigate = useNavigate();

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post("http://localhost:3000/auth/login", {
                username: username,
                password: password,
                validateStatus: (status: number) => {
                    return status < 400;
                },
            });
            
            if (!response.data.success) throw new Error("Login failed");
            if(!response.data.token) throw new Error("Token not found");

            console.log("Login successful, token stored");
            sessionStorage.setItem("token", response.data.token);
            setUser(username);
            setToken(response.data.token);
            navigate("/create", {replace: true});

        } catch (error) {
            handleError(error, setError);
        }
    }

    const register = async (username: string, password: string) => {
        try {
            const response = await axios.post("http://localhost:3000/auth/register", {
                username: username,
                password: password,
                validateStatus: (status: number) => {
                return status < 400;
                },
            });

            if (!response.data.success) throw new Error("Registration failed");
            if(!response.data.token) throw new Error("Token not found");
            
            console.log("Registration successful, token stored");
            sessionStorage.setItem("token", response.data.token);
            setUser(username);
            setToken(response.data.token);
            navigate("/create", {replace: true});

        } catch (error) {
            handleError(error, setError);
        }
    };

    const logout = async () => {
        setToken(null);
        setError("");
        setUser("");
        setAuthenticated(false);
        sessionStorage.removeItem("token");
        navigate("/login", {replace: true});
    };

    useEffect(() => {
        console.log(token ? "Logged in" : "Logged out");
        setAuthenticated(token !== null);
        if (token) {
            connect();
        } else {
            socket.disconnect();
        }
    }, [token, navigate]);

    return (
        <AuthContext.Provider value={{ user, token, error, isAuthenticated, login, register, logout }}>
            { children }
        </AuthContext.Provider>
    )
}