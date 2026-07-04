import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import CallModal from '../components/CallModal';
import IncomingCallModal from '../components/IncomingCallModal';
import { useSocket } from '../context/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';

const Dashboard = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { onlineUsers } = useSocket();
  const { 
    callState, 
    callUser, 
    acceptCall, 
    rejectCall, 
    endCall, 
    remoteAudioRef 
  } = useWebRTC();

  return (
    <div className="flex h-screen w-full bg-gray-900 overflow-hidden relative">
      <Sidebar 
        onlineUsers={onlineUsers} 
        selectedUser={selectedUser} 
        setSelectedUser={setSelectedUser} 
      />
      <ChatBox selectedUserId={selectedUser} callUser={callUser} />
      
      <CallModal 
        callState={callState} 
        endCall={endCall} 
        remoteAudioRef={remoteAudioRef} 
      />
      
      <IncomingCallModal 
        callState={callState} 
        acceptCall={acceptCall} 
        rejectCall={rejectCall} 
      />
    </div>
  );
};

export default Dashboard;
