import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Phone } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

const ChatBox = ({ selectedUser, callUser, onBack }) => {
  const { socket } = useSocket();
  const { user: currentUser } = useAuthStore();
  const selectedUserId = selectedUser?.id;
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

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-500">
        Select a user from the sidebar to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex h-16 flex-none items-center justify-between gap-2 border-b border-gray-700 bg-gray-800 px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-gray-200 hover:bg-gray-700 lg:hidden"
            aria-label="Back to chats"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="truncate font-medium text-white">{selectedUser.displayName}</div>
        </div>
        <button 
          onClick={() => callUser(selectedUserId)}
          className="flex h-11 flex-none items-center space-x-2 rounded-lg bg-green-600 px-3 text-white transition-colors hover:bg-green-700 sm:px-4"
          title="Start Voice Call"
        >
          <Phone size={18} />
          <span className="hidden sm:inline">Call</span>
        </button>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3 sm:p-6">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser._id;
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] break-words rounded-2xl px-4 py-2 sm:max-w-[70%] ${
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
      <div className="flex-none border-t border-gray-700 bg-gray-800 p-3 sm:p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="h-11 min-w-0 flex-1 rounded-full border border-gray-600 bg-gray-700 px-4 text-base text-white outline-none transition-colors focus:border-blue-500"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
