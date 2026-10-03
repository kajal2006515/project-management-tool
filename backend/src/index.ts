import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Route imports
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import boardRoutes from './routes/boards';
import taskRoutes from './routes/tasks';
import commentRoutes from './routes/comments';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend development server
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Routes registration
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.io Integration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

const JWT_SECRET = process.env.JWT_SECRET || 'flowboard_super_secret_jwt_key_12345!';

// Store active users and their sockets for direct notifications
const userSockets = new Map<string, string>(); // userId -> socketId
const boardPresence = new Map<string, Set<{ id: string; name: string; avatarUrl: string | null }>>(); // boardId -> set of users

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return next(new Error('Authentication error: Invalid token'));
    socket.data.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  const userId = socket.data.user?.id;
  if (userId) {
    userSockets.set(userId, socket.id);
  }

  // Join a specific Kanban board room
  socket.on('join-board', ({ boardId, user }) => {
    socket.join(`board:${boardId}`);
    
    // Add to presence list
    if (!boardPresence.has(boardId)) {
      boardPresence.set(boardId, new Set());
    }
    const currentUsers = boardPresence.get(boardId)!;
    
    // Remove old presence entry for this user if exists, then add updated
    const userList = Array.from(currentUsers);
    const existing = userList.find(u => u.id === user.id);
    if (!existing) {
      currentUsers.add({ id: user.id, name: user.name, avatarUrl: user.avatarUrl });
    }

    // Broadcast updated presence list
    io.to(`board:${boardId}`).emit('presence-update', Array.from(currentUsers));
  });

  // Leave a Kanban board room
  socket.on('leave-board', ({ boardId, userId }) => {
    socket.leave(`board:${boardId}`);
    const currentUsers = boardPresence.get(boardId);
    if (currentUsers) {
      const userList = Array.from(currentUsers);
      const filtered = userList.filter(u => u.id !== userId);
      boardPresence.set(boardId, new Set(filtered));
      io.to(`board:${boardId}`).emit('presence-update', filtered);
    }
  });

  // Broadcast a real-time board mutation event (e.g., task drag-and-drop movement)
  socket.on('board-mutation', ({ boardId, event, data }) => {
    // Broadcast to everyone else on this board
    socket.to(`board:${boardId}`).emit('board-mutated', { event, data });
  });

  // Typing indicator
  socket.on('typing', ({ boardId, user, isTyping }) => {
    socket.to(`board:${boardId}`).emit('user-typing', { user, isTyping });
  });

  // Direct notifications dispatching
  socket.on('send-notification', ({ targetUserId, notification }) => {
    const socketId = userSockets.get(targetUserId);
    if (socketId) {
      io.to(socketId).emit('notification-received', notification);
    }
  });

  socket.on('disconnect', () => {
    if (userId) {
      userSockets.delete(userId);
      // Remove user from all boards presence tracking
      boardPresence.forEach((usersSet, boardId) => {
        const userList = Array.from(usersSet);
        const exists = userList.some(u => u.id === userId);
        if (exists) {
          const filtered = userList.filter(u => u.id !== userId);
          boardPresence.set(boardId, new Set(filtered));
          io.to(`board:${boardId}`).emit('presence-update', filtered);
        }
      });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`FlowBoard Server is running on port ${PORT}`);
});
