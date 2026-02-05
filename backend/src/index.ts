import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { CORS_CONFIG } from "./config.js";
import pool from "./db/db.js";
import { addUser } from "./db/users.js";
import { createRoom, getUserCountInRoom, getUsersInRoom } from "./db/rooms.js";
import { addLine, type Line } from "./db/lines.js";

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

app.get("/create", async (req, res) => {
  let code = await createRoom();
  res.json(code);
});

app.get("/add_line", async (req, res) => {
  const line: Line = {
    draw_mode: "draw",
    color: "black",
    brush_size: 5,
    points: [5.5, 13.0, 2],
  };
  const result = await addLine("gamer", "CQIFB", line);
  res.json(result);
});

app.get("/add/:name/:code", async (req, res) => {
  const username = req.params.name;
  const code = req.params.code;

  try {
    let user = await addUser(username, code);
    res.status(200).json(user);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.get("/users/:code", async (req, res) => {
  const code = req.params.code;
  let users = await getUserCountInRoom(code);
  res.json(users);
});

app.get("/lines/:name", async (req, res) => {
  const username = req.params.name;
  const result = await pool.query(
    "SELECT users.username, lines.mode, lines.color, lines.brush_size, lines.points FROM lines JOIN users ON lines.user_id = users.id WHERE users.username = $1 ORDER BY lines.created_at ASC",
    [username],
  );
  res.json(result.rows);
});

app.get("/api/join", (req, res) => {
  res.status(200);
});

app.get("/api/create", (req, res) => {
  res.status(200);
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join_room", (data) => {
    const { username, room_code } = data;

    socket.data.username = username;
    socket.data.room_code = room_code;
    socket.join(room_code);
  });

  socket.on("leave_room", (data) => {});

  socket.on("add_line", (data) => {
    io.emit("update", data);
  });

  socket.on("get_canvas", async () => {});

  socket.on("disconnect", () => {});
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
