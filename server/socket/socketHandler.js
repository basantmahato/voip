const Message = require('../models/Message');
const User = require('../models/User');

// Track online users. Map of userId -> socketId
const onlineUsers = new Map();

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // When a user logs in / connects, they send their userId
    socket.on('add-user', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`👤 User ${userId} is online (Socket: ${socket.id})`);
      
      // Broadcast to everyone the updated list of online users
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });

    // Handle sending text messages
    socket.on('send-message', async (data) => {
      const { senderId, receiverId, content } = data;
      
      try {
        // 1. Save to Database
        const newMessage = await Message.create({
          senderId,
          receiverId,
          content
        });

        // 2. Check if receiver is online
        const receiverSocketId = onlineUsers.get(receiverId);
        
        if (receiverSocketId) {
          // Send to specific user
          io.to(receiverSocketId).emit('receive-message', newMessage);
        }
      } catch (error) {
        console.error('Error saving/sending message:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        // Send typing status to the specific user along with the sender's ID
        io.to(receiverSocketId).emit('typing', {
          senderId: data.senderId,
          isTyping
        });
      }
    });

    // ==========================================
    // WebRTC SIGNALING LOGIC
    // ==========================================

    // 1. Caller initiates a call
    socket.on('call-user', (data) => {
      const { userToCall, from, callerUsername } = data;
      const receiverSocketId = onlineUsers.get(userToCall);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incoming-call', {
          from,
          callerUsername
        });
      }
    });

    // 2. Receiver accepts the call
    socket.on('accept-call', (data) => {
      const { to } = data;
      const callerSocketId = onlineUsers.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-accepted');
      }
    });

    // 3. Receiver rejects the call
    socket.on('reject-call', (data) => {
      const { to } = data;
      const callerSocketId = onlineUsers.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-rejected');
      }
    });

    // 4. WebRTC SDP Offer
    socket.on('offer', (data) => {
      const { to, offer } = data;
      const receiverSocketId = onlineUsers.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('offer', {
          from: data.from,
          offer
        });
      }
    });

    // 5. WebRTC SDP Answer
    socket.on('answer', (data) => {
      const { to, answer } = data;
      const callerSocketId = onlineUsers.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('answer', {
          from: data.from,
          answer
        });
      }
    });

    // 6. ICE Candidates (Network routing info)
    socket.on('ice-candidate', (data) => {
      const { to, candidate } = data;
      const receiverSocketId = onlineUsers.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('ice-candidate', {
          from: data.from,
          candidate
        });
      }
    });

    // 7. End Call
    socket.on('end-call', (data) => {
      const { to } = data;
      const receiverSocketId = onlineUsers.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call-ended');
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      
      // Find which user disconnected
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        console.log(`🔌 User ${disconnectedUserId} disconnected`);
        io.emit('online-users', Array.from(onlineUsers.keys()));
      }
    });
  });
};

module.exports = setupSocket;
