import React, { useRef, useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
  UserPlus,
  Shield,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';

export const CallScreenModal: React.FC = () => {
  const {
    activeCall,
    endCall,
    toggleCallMute,
    toggleCallCamera,
    toggleCallSpeaker,
    currentUser,
  } = useChat();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [streamError, setStreamError] = useState(false);

  // If video call and camera enabled, attempt to mount local webcam
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (activeCall?.record.type === 'video' && !activeCall.isCameraOff) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setStreamError(true);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeCall?.record.type, activeCall?.isCameraOff]);

  if (!activeCall) return null;

  const isVideo = activeCall.record.type === 'video';
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b141a] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header info */}
      <div className="p-6 text-center z-20">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-slate-700/50 text-[11px] text-emerald-400 font-medium mb-3 backdrop-blur-sm">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>End-to-End Encrypted</span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          {activeCall.record.receiverName}
        </h2>

        <p className="text-xs text-slate-300 font-medium">
          {activeCall.isConnected ? formatDuration(activeCall.duration) : 'Ringing...'}
        </p>
      </div>

      {/* Main Visual Center: Remote Caller or Video stream */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        {isVideo ? (
          /* Video Call View */
          <div className="relative w-full max-w-lg h-full max-h-[520px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* Simulated Remote Partner Video */}
            <img
              src={activeCall.record.receiverAvatar}
              alt={activeCall.record.receiverName}
              className="w-full h-full object-cover filter brightness-90"
            />

            {/* Remote Participant Label */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold">
              {activeCall.record.receiverName}
            </div>

            {/* PiP: Local Camera Preview */}
            <div className="absolute top-4 right-4 w-28 h-38 rounded-2xl overflow-hidden bg-black border-2 border-emerald-500 shadow-xl">
              {!activeCall.isCameraOff && !streamError ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-center p-2">
                  <img
                    src={currentUser?.avatar}
                    alt="You"
                    className="w-10 h-10 rounded-full mb-1 object-cover"
                  />
                  <span className="text-[9px] text-slate-400">Camera Off</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Voice Call View: Large Avatar with Ambient Audio Waves */
          <div className="flex flex-col items-center">
            <div className="relative">
              {activeCall.isConnected && (
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              )}
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-emerald-500 shadow-2xl">
                <img
                  src={activeCall.record.receiverAvatar}
                  alt={activeCall.record.receiverName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-slate-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>HD Audio Stream Connected</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Calling Control Bar */}
      <div className="p-8 pb-12 flex items-center justify-center gap-5 z-20">
        {/* Toggle Mute Mic */}
        <button
          onClick={toggleCallMute}
          className={`w-13 h-13 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 ${
            activeCall.isMuted ? 'bg-red-500/90 text-white' : 'bg-slate-800/80 hover:bg-slate-700'
          }`}
          title={activeCall.isMuted ? 'Unmute' : 'Mute'}
        >
          {activeCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Toggle Video Camera (if video call) */}
        {isVideo && (
          <button
            onClick={toggleCallCamera}
            className={`w-13 h-13 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 ${
              activeCall.isCameraOff ? 'bg-red-500/90 text-white' : 'bg-slate-800/80 hover:bg-slate-700'
            }`}
            title={activeCall.isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {activeCall.isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}

        {/* Speaker switch */}
        <button
          onClick={toggleCallSpeaker}
          className={`w-13 h-13 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 ${
            activeCall.isSpeakerOn ? 'bg-emerald-600/90' : 'bg-slate-800/80 hover:bg-slate-700'
          }`}
          title="Speaker"
        >
          {activeCall.isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        {/* End Call Button */}
        <button
          id="btn-end-call"
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 active:scale-90 transition-transform"
          title="End Call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
