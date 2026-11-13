import React from 'react';
import { User } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Sidebar = ({ onlineUsers, selectedUser, setSelectedUser }) => {
  const { user: currentUser, logout } = useAuthStore();

  // In a real app, you'd fetch all users from DB. 
  // For this tutorial, we are just showing users who are currently online.
  // We filter out the current user so they don't chat with themselves.
  const otherOnlineUsers = onlineUsers.filter(user => user.id !== currentUser?._id);

  return (
    <div className="flex h-full w-full flex-col border-r border-gray-700 bg-gray-800 lg:w-80">
      <div className="flex items-center justify-between border-b border-gray-700 p-4 sm:p-5">
        <h2 className="text-xl font-bold text-white">Chats</h2>
        <button 
          onClick={logout}
          className="min-h-11 rounded-lg px-3 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3 sm:p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Online Users ({otherOnlineUsers.length})
        </h3>
        
        {otherOnlineUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">No one is online right now.</p>
        ) : (
          otherOnlineUsers.map((onlineUser) => (
            <button
              type="button"
              key={onlineUser.id}
              onClick={() => setSelectedUser(onlineUser)}
              className={`flex min-h-16 w-full items-center rounded-xl p-3 text-left transition-colors ${
                selectedUser?.id === onlineUser.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="flex min-w-0 items-center space-x-3">
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-600 text-lg font-semibold text-white">
                    {onlineUser.displayName?.charAt(0).toUpperCase() || <User size={20} />}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                </div>
                <span className="truncate text-base font-medium text-white">{onlineUser.displayName}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
