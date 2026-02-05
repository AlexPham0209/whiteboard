import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { CORS_CONFIG } from "./config.js";
import pool from "./db/db.js";
import { addUser, userExists } from "./db/users.js";
import { createRoom, getUserCountInRoom, getUsersInRoom } from "./db/rooms.js";
import { addLine, getCanvas, type Line } from "./db/lines.js";

const PORT = process.env.SERVER_PORT;

// Setting up Express App
const app = express();
app.use(cors(CORS_CONFIG));

// Setting up Socket.io server
const server = createServer(app);
const io = new Server(server, {
  cors: CORS_CONFIG,
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join_room", async (data, callback) => {
    const { username, room_code } = data;
    let exist = await userExists(username, room_code);

    if (exist) {
      callback({
        status: "failed",
        err: "User already exists in room",
      });
    }

    try {
      await addUser(username, room_code);
      socket.data.username = username;
      socket.data.room_code = room_code;
      socket.join(room_code);
      callback({
        status: "success",
      });
    } catch (e) {
      callback({
        status: "failed",
        err: e,
      });
    }
  });

  socket.on("leave_room", (data) => {});

  socket.on("add_line", async (line: Line) => {
    if (socket.data.room_code === undefined || socket.data.username === undefined)
      return;
    
    await addLine(socket.data.username, socket.data.room_code, line);
    io.to(socket.data.room_code).emit("update", line);
  });

  socket.on("get_canvas", async () => {
    if (socket.data.room_code === undefined)
      return;

    const canvas = await getCanvas(socket.data.room_code);
    socket.emit("update_canvas", canvas);
  });

  socket.on("disconnect", () => {});
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
