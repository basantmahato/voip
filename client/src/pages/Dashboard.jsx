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
    <div className="relative flex h-screen h-[100dvh] w-full overflow-hidden bg-gray-900">
      <div className={`${selectedUser ? 'hidden' : 'flex'} h-full min-h-0 w-full flex-col lg:flex lg:w-80 lg:flex-none`}>
        <Sidebar
          onlineUsers={onlineUsers}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      </div>
      <div className={`${selectedUser ? 'flex' : 'hidden'} min-h-0 min-w-0 flex-1 lg:flex`}>
        <ChatBox
          selectedUser={selectedUser}
          callUser={callUser}
          onBack={() => setSelectedUser(null)}
        />
      </div>
      
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
