import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

const ChatBox = ({ selectedUserId, callUser }) => {
  const { socket } = useSocket();
  const { user: currentUser } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch history when selected user changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/messages/${selectedUserId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages', error);
      }
    };

    if (selectedUserId) {
      fetchMessages();
    }
  }, [selectedUserId]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      // Only append if the message is from the currently selected user
      if (message.senderId === selectedUserId || message.receiverId === selectedUserId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTyping = (data) => {
      if (data.senderId === selectedUserId) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('typing', handleTyping);
    };
  }, [socket, selectedUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: selectedUserId,
      content: newMessage,
    };

    // Optimistically add to UI
    setMessages((prev) => [...prev, { ...messageData, _id: Date.now().toString(), createdAt: new Date() }]);
    
    // Send to server
    socket.emit('send-message', messageData);
    setNewMessage('');
    
    // Stop typing indicator
    socket.emit('typing', { receiverId: selectedUserId, senderId: currentUser._id, isTyping: false });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && selectedUserId) {
      socket.emit('typing', { receiverId: selectedUserId, senderId: currentUser._id, isTyping: e.target.value.length > 0 });
    }
  };

  if (!selectedUserId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-500">
        Select a user from the sidebar to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Header */}
      <div className="h-16 border-b border-gray-700 bg-gray-800 flex items-center justify-between px-6">
        <div className="text-white font-medium">Chatting with User: {selectedUserId.substring(0,6)}...</div>
        <button 
          onClick={() => callUser(selectedUserId)}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          title="Start Voice Call"
        >
          <Phone size={18} />
          <span>Call</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser._id;
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-700 text-gray-200 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-400 rounded-2xl rounded-tl-none px-4 py-2 text-sm italic">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-full px-4 py-2 outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
