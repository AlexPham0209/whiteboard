import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { CORS_CONFIG } from "./config.js";
import pool from "./db/db.js";
import { addUser, removeUser, userExists } from "./db/users.js";
import { createRoom, getUserCountInRoom, getUsersInRoom } from "./db/rooms.js";
import { addLine, getCanvas, type Line } from "./db/lines.js";

import jwt from 'jsonwebtoken'; 
const { sign, verify, decode } = jwt;

const PORT = process.env.SERVER_PORT;
const SECRET = process.env.SECRET;

// Setting up Express App
const app = express();
app.use(cors(CORS_CONFIG));

// Setting up Socket.io server
const server = createServer(app);
const io = new Server(server, {
  cors: CORS_CONFIG,
});

// app.post("/create", (req, res) => {

// });

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (token) {
    try {
      const decoded = verify(token, SECRET!);

      if (typeof decoded === 'string')
        return new Error("Invalid decoded output");
      
      const user = await userExists(decoded.data.username, decoded.data.room_code);
      if (user) 
        return new Error("User exists");

      socket.data.username = decoded.data.username;
      socket.data.room_code = decoded.data.room_code;
      socket.join(decoded.data.room_code);
      return next();

    } catch (e) {
      return next(new Error("Unable to refresh"));
    }
  }

  const username = socket.handshake.auth.username;
  const room_code = socket.handshake.auth.room_code;
  const user = await userExists(username, room_code);
  if (user)
    return next(new Error("User already exists"));

  socket.data.username = username;
  socket.data.room_code = room_code;
  socket.join(room_code);
  next();
});

io.on("connection", async (socket) => {
  const { id } = await addUser(socket.data.username, socket.data.room_code);
  socket.data.user_id = id;

  const data = {
    user_id: socket.data.user_id,
    username: socket.data.username,
    room_code: socket.data.room_code,
  };

  const token = sign({
    data: data,
  },
    SECRET!,
  {
    expiresIn: "1h",
  });

  socket.emit("session", token);
  socket.on("leave", (data) => {});

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

