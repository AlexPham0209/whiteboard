import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import AppError from "./utils/error.js";
import authRoute from "./routes/auth.js";
import apiRoute from "./routes/api.js";
import { deleteAllRooms } from "./models/rooms.js";
import { removeAllMembers } from "./models/members.js";
import CookieParser from "cookie-parser";

// Delete All Rooms on Server Startup (for development/testing purposes)
if (process.env.NODE_ENV === "development") {
  deleteAllRooms().then(() =>
    console.log("Cleared all rooms on server startup (development mode)"),
  );
} else {
  console.warn(
    "WARNING: Server started in production mode without clearing rooms. Make sure this is intentional.",
  );
}

removeAllMembers().then(() =>
  console.log("Cleared all members on server startup"),
);

console.log(process.env.NODE_ENV);

// Environment variables
export const CORS_CONFIG = {
  origin: process.env.CORS_ORIGINS,
  credentials: true,
};

// Setting up Express App
export const app = express();

// Express Middleware
app.use(cors(CORS_CONFIG));
app.use(express.json());
app.use(CookieParser());

// Routes
app.use("/auth", authRoute);
app.use("/api", apiRoute);

// Custom Error Handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);

  if (err instanceof AppError)
    res.status(err.status).json({ success: false, message: err.message });
  else
    res.status(500).json({ success: false, message: "Internal server error" });
});
