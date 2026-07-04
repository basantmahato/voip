import React from 'react';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';

const CallModal = ({ callState, endCall, remoteAudioRef }) => {
  const [isMuted, setIsMuted] = React.useState(false);

  if (!callState.isCalling && !callState.callAccepted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-80 rounded-2xl bg-gray-800 p-6 flex flex-col items-center shadow-2xl">
        
        {/* Hidden Audio Element for remote sound */}
        <audio ref={remoteAudioRef} autoPlay />

        <div className="mb-6 h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
          <Phone size={40} className="text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          {callState.isCalling ? 'Calling...' : 'In Call'}
        </h3>
        
        <p className="text-gray-400 mb-8">
          {callState.isCalling ? 'Waiting for answer' : 'Connected securely via WebRTC'}
        </p>

        <div className="flex space-x-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-700 text-white'} hover:bg-gray-600 transition-colors`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button 
            onClick={endCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="End Call"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
