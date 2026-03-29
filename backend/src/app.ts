import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import AppError from "./utils/error.js";
import authRoute from "./routes/auth.js";
import apiRoute from "./routes/api.js";

// Environment variables
export const CORS_CONFIG = {
  origin: process.env.CORS_ORIGINS,
};

// Setting up Express App
export const app = express();

// Express Middleware
app.use(cors(CORS_CONFIG));
app.use(express.json());

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

