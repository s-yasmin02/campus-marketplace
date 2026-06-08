import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import followRoutes from './routes/followRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io Logic
const userSockets = new Map(); // Map userId to socketId
app.set('io', io);
app.set('userSockets', userSockets);

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    if (userId) {
      userSockets.set(userId, socket.id);
      io.emit('get_online_users', Array.from(userSockets.keys()));
    }
  });

  socket.on('send_message', (data) => {
    // data should contain { sender, receiver, content, listing, createdAt, ... }
    const receiverSocketId = userSockets.get(data.receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', data);
    }
  });

  socket.on('typing', ({ receiverId, senderId }) => {
    const receiverSocketId = userSockets.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', senderId);
    }
  });

  socket.on('stop_typing', ({ receiverId, senderId }) => {
    const receiverSocketId = userSockets.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_stop_typing', senderId);
    }
  });

  socket.on('mark_as_read', async ({ receiverId, senderId }) => {
    const receiverSocketId = userSockets.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('messages_read', senderId);
    }
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        io.emit('get_online_users', Array.from(userSockets.keys()));
        break;
      }
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);

const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, '/uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // Drop the unique review index if it exists, to allow multiple reviews
    mongoose.connection.collection('reviews').dropIndex('reviewer_1_seller_1')
      .catch((err) => {
        // Ignore error if index doesn't exist
      });
      
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} with Socket.io`);
    });
  })
  .catch((error) => console.log(error.message));
