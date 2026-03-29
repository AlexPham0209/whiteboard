import express, {
  type Request,
  type Response,
  type Express,
  type NextFunction,
} from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import {
  createRoom,
  deleteRoom,
  getUserCountInRoom,
  getUsersInRoom,
  roomExists,
} from "./models/rooms.js";
import { addLine, getCanvas, type Line } from "./models/lines.js";

import jwt, { type VerifyErrors } from "jsonwebtoken";
import { AppError } from "./utils/error.js";
import authRoute from "./routes/auth.js";
import apiRoute from "./routes/api.js";

// Environment variables
const PORT = process.env.SERVER_PORT;
const SECRET = process.env.SECRET;
const CORS_CONFIG = {
  origin: process.env.CORS_ORIGINS,
};

// Setting up Express App
const app = express();
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

// io.use(async (socket, next) => {
//   const token = socket.handshake.auth.token;

//   if (!token) return next(new Error("No authentication token"));

//   verify(token, SECRET!, async (err: VerifyErrors | null, decoded: any) => {
//     if (err) return next(new Error("Authentication Error"));

//     // Check if rooms exists before joining
//     const room = await roomExists(decoded.data.room_code);
//     if (!room) return next(new Error("Room doesn't exist"));

//     // Check if there are no users with the same name
//     const user = await userExists(
//       decoded.data.username,
//       decoded.data.room_code,
//     );
//     if (user) return next(new Error("User already exist"));

//     socket.data.username = decoded.data.username;
//     socket.data.room_code = decoded.data.room_code;
//     next();
//   });
// });

// io.on("connection", async (socket) => {
//   // On connection, add newly connected user to users table
//   const data = await addUser(socket.data.username, socket.data.room_code).catch(
//     (e) => {
//       socket.disconnect(true);
//       return undefined;
//     },
//   );

//   if (data === undefined) return;

//   socket.data.user_id = data.id;
//   socket.join(socket.data.room_code);

//   const users = await getUsersInRoom(socket.data.room_code);
//   socket.broadcast.to(socket.data.room_code).emit("update_users", users);

//   socket.on("add_line", async (line: Line) => {
//     await addLine(socket.data.user_id, line);
//     socket.broadcast.to(socket.data.room_code).emit("update", line);
//   });

//   socket.on("get_canvas", async () => {
//     if (socket.data.room_code === undefined) return;

//     const canvas = await getCanvas(socket.data.room_code);
//     socket.emit("update_canvas", canvas);
//   });

//   socket.on("get_code", () => {
//     if (socket.data.room_code === undefined) return;

//     socket.emit("update_code", socket.data.room_code);
//   });

//   socket.on("get_users", async () => {
//     const users = await getUsersInRoom(socket.data.room_code);
//     socket.emit("update_users", users);
//   });

//   socket.on("disconnect", async () => {
//     await removeUser(socket.data.user_id);

//     // Delete if there are no new users after 5 seconds
//     await setTimeout(async () => {
//       const users = await getUsersInRoom(socket.data.room_code);
//       if (users.length === 0) await deleteRoom(socket.data.room_code);
//       else
//         socket.broadcast.to(socket.data.room_code).emit("update_users", users);
//     }, 5000);
//   });
// });

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
