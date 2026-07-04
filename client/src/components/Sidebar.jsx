import React from 'react';
import { User, Phone } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Sidebar = ({ onlineUsers, selectedUser, setSelectedUser }) => {
  const { user: currentUser, logout } = useAuthStore();

  // In a real app, you'd fetch all users from DB. 
  // For this tutorial, we are just showing users who are currently online.
  // We filter out the current user so they don't chat with themselves.
  const otherOnlineUsers = onlineUsers.filter(id => id !== currentUser?._id);

  return (
    <div className="w-80 border-r border-gray-700 bg-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Chats</h2>
        <button 
          onClick={logout}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Online Users ({otherOnlineUsers.length})
        </h3>
        
        {otherOnlineUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">No one is online right now.</p>
        ) : (
          otherOnlineUsers.map((userId) => (
            <div
              key={userId}
              onClick={() => setSelectedUser(userId)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedUser === userId ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
                    <User size={20} className="text-gray-300" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                </div>
                <div className="text-white font-medium">User ID: {userId.substring(0,6)}...</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
