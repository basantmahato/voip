import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';

const IncomingCallModal = ({ callState, acceptCall, rejectCall }) => {
  if (!callState.isReceivingCall) return null;

  return (
    <div className="fixed top-10 right-10 z-50 animate-bounce">
      <div className="w-72 rounded-xl bg-gray-800 p-4 shadow-2xl border border-gray-700">
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
            <Phone size={24} className="text-white" />
          </div>
          <div>
            <h4 className="text-white font-bold">{callState.caller?.username}</h4>
            <p className="text-sm text-gray-400">Incoming Voice Call...</p>
          </div>
        </div>
        
        <div className="flex justify-between space-x-2">
          <button 
            onClick={rejectCall}
            className="flex-1 flex justify-center items-center py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
          >
            <PhoneOff size={18} className="mr-2" />
            Decline
          </button>
          <button 
            onClick={acceptCall}
            className="flex-1 flex justify-center items-center py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
          >
            <Phone size={18} className="mr-2" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
