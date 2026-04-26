import { createServer } from "http";
import { Server } from "socket.io";
import { authenticateSocket } from "./middleware/authMiddleware.js";
import registerRoomHandlers from "./sockets/roomHandler.js";
import registerCanvasHandlers from "./sockets/canvasHandler.js";
import registerMessageHandlers from "./sockets/messageHandler.js";
import registerMemberHandlers from "./sockets/memberHandler.js";
import { app, CORS_CONFIG } from "./app.js";
import { createAdapter } from "@socket.io/postgres-adapter";
import pool from "./db/db.js";

export const PORT = process.env.BACKEND_PORT;
export const server = createServer(app);
export const io = new Server(server, {
  cors: CORS_CONFIG,
});

// Helps broadcast events to all servers
io.adapter(createAdapter(pool));

// Socket middleware
io.use(authenticateSocket);

// Socket connection
io.on("connection", (socket) => {
  console.log(
    "New client connected:",
    socket.data.username,
    socket.data.user_id,
  );
  registerRoomHandlers(io, socket);
  registerCanvasHandlers(io, socket);
  registerMemberHandlers(io, socket);
  registerMessageHandlers(io, socket);

  socket.on("disconnect", () => {});
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
