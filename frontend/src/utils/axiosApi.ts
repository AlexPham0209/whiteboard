import axios from "axios";
export const PORT = import.meta.env.VITE_SERVER_PORT;
export const BACKEND_URL = import.meta.env.PROD
  ? `${import.meta.env.BASE_URL}:${PORT}/backend`
  : `http://localhost:80/backend`;

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

export default api;
