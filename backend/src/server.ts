import { createServer } from "http";
import { Server } from "socket.io";
import { authenticateSocket } from "./middleware/authMiddleware.js";
import registerRoomHandlers from "./sockets/roomHandler.js";
import registerCanvasHandlers from "./sockets/canvasHandler.js";
import registerMessageHandlers from "./sockets/messageHandler.js";
import registerUserHandlers from "./sockets/memberHandler.js";
import { app, CORS_CONFIG } from "./app.js";

export const PORT = process.env.SERVER_PORT;
export const server = createServer(app);
export const io = new Server(server, {
  cors: CORS_CONFIG,
});

// Socket middleware
io.use(authenticateSocket);

// Socket connection
io.on("connection", (socket) => {
  registerRoomHandlers(io, socket);
  registerCanvasHandlers(io, socket);
  registerUserHandlers(io, socket);
  registerMessageHandlers(io, socket);

  socket.on("disconnect", () => {});
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
