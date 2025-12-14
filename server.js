import http from 'http';
import { Server } from 'socket.io';
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://manwellstore.com",
      "https://www.manwellstore.com",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST"]
  }
});

// Make io accessible to our router
app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
