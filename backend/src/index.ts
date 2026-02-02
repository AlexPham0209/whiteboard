import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// Setting up Express App
const app = express();
app.use(cors({
  origin: "http://localhost:2904"
}));

// Setting up websocket connection
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:2904"]
  }
});
const PORT = process.env.SERVER_PORT;

app.get('/', (req, res) => {
  res.status(200);
});

app.get('/api', (req, res) => {
  res.json({
    data: "hello"
  });
});

io.on('connection', (socket) => {
  console.log('A user connected');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});