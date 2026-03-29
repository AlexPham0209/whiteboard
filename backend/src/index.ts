import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import AppError from "./utils/error.js";
import authRoute from "./routes/auth.js";
import apiRoute from "./routes/api.js";
import { authenticateSocket } from "./middleware/authMiddleware.js";
import registerRoomHandlers from "./sockets/roomHandler.js";
import registerCanvasHandlers from "./sockets/canvasHandler.js";
import registerMessageHandlers from "./sockets/messageHandler.js";
import registerUserHandlers from "./sockets/userHandler.js";


// Environment variables
const PORT = process.env.SERVER_PORT;
const CORS_CONFIG = {
  origin: process.env.CORS_ORIGINS,
};

// Setting up Express App
const app = express();

// Express Middleware
app.use(cors(CORS_CONFIG));
app.use(express.json());

// Setting up Socket.io server
const server = createServer(app);
const io = new Server(server, {
  cors: CORS_CONFIG,
});

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

// Socket middleware
io.use(authenticateSocket);

// Socket connection
io.on("connection", (socket) => {
  registerRoomHandlers(io, socket);
  registerCanvasHandlers(io, socket);
  registerUserHandlers(io, socket);
  registerMessageHandlers(io, socket);

  socket.on("disconnect", () => {


  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
