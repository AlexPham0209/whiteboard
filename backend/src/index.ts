import express, {
  type Request,
  type Response,
  type Express,
  type NextFunction,
} from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { CORS_CONFIG } from "./config.js";
import pool from "./db/db.js";
import { addUser, removeAllUsers, removeUser, userExists } from "./db/users.js";
import { createRoom, getUserCountInRoom, getUsersInRoom } from "./db/rooms.js";
import { addLine, getCanvas, type Line } from "./db/lines.js";

import jwt, { type VerifyErrors } from "jsonwebtoken";
const { sign, verify } = jwt;

const PORT = process.env.SERVER_PORT;
const SECRET = process.env.SECRET;

// Setting up Express App
const app = express();
app.use(cors(CORS_CONFIG));
app.use(express.json());

// Setting up Socket.io server
const server = createServer(app);
const io = new Server(server, {
  cors: CORS_CONFIG,
});

// Disconnect all previous users
removeAllUsers();

app.post("/create", (req, res) => {


});

app.post("/join", async (req, res) => {
  const username = req.body.username;
  const room_code = req.body.room_code;
  
  const user = await userExists(username, room_code);
  if (user) throw new Error("User already exists in room");

  const data = {
    username: username,
    room_code: room_code,
  };

  const token = sign(
    {
      data: data,
    },
    SECRET!,
    {
      expiresIn: "1h",
    },
  );

  res.status(201).json(token);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json(err.message);
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("No authentication token"));

  verify(token, SECRET!, async (err: VerifyErrors | null, decoded: any) => {
    if (err) return next(new Error("Authentication Error"));

    const user = await userExists(
      decoded.data.username,
      decoded.data.room_code,
    );
    if (user) return new Error("User already exists");

    socket.data.username = decoded.data.username;
    socket.data.room_code = decoded.data.room_code;
    socket.join(decoded.data.room_code);
    next();
  });
});

io.on("connection", async (socket) => {
  const { id } = await addUser(
    socket.data.username,
    socket.data.room_code,
  ).catch((e) => {
    socket.disconnect(true);
  });

  socket.data.user_id = id;

  socket.on("add_line", async (line: Line) => {
    await addLine(socket.data.user_id, line);
    socket.broadcast.to(socket.data.room_code).emit("update", line);
  });

  socket.on("get_canvas", async () => {
    if (socket.data.room_code === undefined) return;

    const canvas = await getCanvas(socket.data.room_code);
    socket.emit("update_canvas", canvas);
  });

  socket.on("disconnect", async () => {
    await removeUser(socket.data.user_id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
