import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import useAuthStore from '../store/useAuthStore';

// STUN servers help browsers discover their public IP address
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ],
};

export const useWebRTC = () => {
  const { socket } = useSocket();
  const { user } = useAuthStore();
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState({
    isReceivingCall: false,
    isCalling: false,
    callAccepted: false,
    callEnded: false,
    caller: null, // { id, displayName }
    receiver: null // id
  });

  const peerConnection = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Initialize RTCPeerConnection
  const initPeerConnection = useCallback(() => {
    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

    // Listen for remote audio stream
    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // Listen for local ICE candidates and send to peer
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: callState.caller?.id || callState.receiver,
          candidate: event.candidate,
          from: user._id
        });
      }
    };
  }, [socket, callState, user]);

  // Request Microphone Access
  const getLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
      return null;
    }
  };

  // 1. Caller: Start a call
  const callUser = async (userToCallId) => {
    const stream = await getLocalMedia();
    if (!stream) return;

    setCallState(prev => ({ ...prev, isCalling: true, receiver: userToCallId, callEnded: false, callAccepted: false }));
    
    socket.emit('call-user', {
      userToCall: userToCallId,
      from: user._id,
      callerDisplayName: user.displayName || user.username
    });
  };

  // 2. Receiver: Accept the call
  const acceptCall = async () => {
    const stream = await getLocalMedia();
    if (!stream) return;

    setCallState(prev => ({ ...prev, callAccepted: true, isReceivingCall: false }));
    
    socket.emit('accept-call', { to: callState.caller.id });
    
    // As the receiver, we wait for the caller to send an Offer. 
    // We don't create the offer ourselves.
  };

  // Receiver: Reject the call
  const rejectCall = () => {
    socket.emit('reject-call', { to: callState.caller.id });
    setCallState(prev => ({ ...prev, isReceivingCall: false, caller: null }));
  };

  // End Call (Either side)
  const endCall = useCallback(() => {
    const target = callState.caller?.id || callState.receiver;
    if (target) {
      socket.emit('end-call', { to: target });
    }
    
    // Cleanup local state and peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    setLocalStream(null);
    setRemoteStream(null);
    setCallState({
      isReceivingCall: false,
      isCalling: false,
      callAccepted: false,
      callEnded: true,
      caller: null,
      receiver: null
    });
  }, [socket, callState, localStream]);


  // ==========================================
  // SOCKET LISTENERS
  // ==========================================
  useEffect(() => {
    if (!socket) return;

    // Incoming ring
    socket.on('incoming-call', ({ from, callerDisplayName }) => {
      setCallState(prev => ({ ...prev, isReceivingCall: true, caller: { id: from, displayName: callerDisplayName } }));
    });

    // Caller: Receiver accepted, now create Offer
    socket.on('call-accepted', async () => {
      setCallState(prev => ({ ...prev, callAccepted: true, isCalling: false }));
      initPeerConnection();

      // Add local tracks to peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream);
      });

      // Create Offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit('offer', {
        to: callState.receiver,
        from: user._id,
        offer
      });
    });

    // Caller: Receiver rejected
    socket.on('call-rejected', () => {
      alert('Call was rejected.');
      endCall();
    });

    // Receiver: Receive Offer -> Create Answer
    socket.on('offer', async ({ from, offer }) => {
      initPeerConnection();
      
      // Add local tracks
      localStream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream);
      });

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit('answer', {
        to: from,
        from: user._id,
        answer
      });
    });

    // Caller: Receive Answer
    socket.on('answer', async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Both: Receive ICE Candidates
    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Error adding ICE candidate', error);
      }
    });

    // Both: Call Ended externally
    socket.on('call-ended', () => {
      endCall();
      alert('Call ended by the other person.');
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-rejected');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('call-ended');
    };
  }, [socket, localStream, callState, user, initPeerConnection, endCall]);


  // Auto-play remote stream when received
  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);


  return {
    callState,
    callUser,
    acceptCall,
    rejectCall,
    endCall,
    remoteAudioRef,
    localStream
  };
};
