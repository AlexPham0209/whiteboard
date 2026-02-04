import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { CORS_CONFIG } from "./config.js";
("./config.js");

const PORT = process.env.SERVER_PORT;

// Setting up Express App
const app = express();
app.use(cors(CORS_CONFIG));

// Setting up Socket.io server
const server = createServer(app);
const io = new Server(server, {
  cors: CORS_CONFIG,
});

app.get("/", (req, res) => {
  res.status(200);
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("", (data) => {});

  socket.on("join_room", (data) => {});

  socket.on("leave_room", (data) => {});

  socket.on("get_canvas", (data) => {});

  socket.on("add_line", (data) => {
    io.emit("update", data);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
