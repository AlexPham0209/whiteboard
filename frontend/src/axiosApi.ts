import axios from "axios";
import { BACKEND_URL } from "./socket";

const api = axios.create({
  baseURL: BACKEND_URL,
});

export default api;
