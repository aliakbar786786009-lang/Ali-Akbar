import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  Send,
  Sparkles,
  Upload,
  Check,
  MessageSquare,
  AlertCircle,
  Image as ImageIcon,
  Flame,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { Chat } from '../types';

interface CameraModalProps {
  onClose: () => void;
  onSelectChat: (chat: Chat) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ onClose, onSelectChat }) => {
  const { chats, activeChat, sendMessage, addStatus, theme, language, currentUser } = useChat();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [selectedChatId, setSelectedChatId] = useState<string>(activeChat?.id || (chats[0]?.id || ''));
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let isMounted = true;

    async function startCamera() {
      setIsLoadingCamera(true);
      setCameraError(null);

      // Stop previous stream if any
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported on this browser or platform.');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        currentStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsLoadingCamera(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('Camera initialization notice:', err?.message || err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in your browser settings or select an image file directly.'
            : 'Camera device unavailable in this preview container. You can choose a photo from your gallery or files.'
        );
        setIsLoadingCamera(false);
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Clean up stream on modal unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Shutter click: capture current video frame
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontal if user-facing camera for natural selfie look
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);
  };

  // Upload photo from device/files
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Flip front/back camera
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Discard & Retake
  const handleRetake = () => {
    setCapturedPhoto(null);
    setCaption('');
  };

  // Share to My Status
  const handlePostToStatus = () => {
    if (!capturedPhoto) return;
    addStatus('image', caption.trim() || 'Camera Story', capturedPhoto);
    setActionSuccessToast(language === 'ur' ? 'اسٹیٹس کامیابی سے اپلوڈ ہو گیا!' : 'Status posted successfully! ✨');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  // Send photo to selected chat
  const handleSendToChat = () => {
    if (!capturedPhoto || !selectedChatId) return;
    sendMessage(selectedChatId, caption.trim() || '📷 Photo', 'image', {
      mediaUrl: capturedPhoto,
    });

    const targetChat = chats.find((c) => c.id === selectedChatId);
    if (targetChat) {
      onSelectChat(targetChat);
    }

    setActionSuccessToast(language === 'ur' ? 'تصویر بھیج دی گئی!' : 'Photo sent to chat! 📨');
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Hidden elements for capturing and selecting */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        className={`w-full max-w-xl max-h-[95vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden relative ${
          theme === 'dark' ? 'bg-[#0f171d] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header bar */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between z-10 bg-black/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {language === 'ur' ? 'مائی چیٹ کیمرہ' : 'MyChat Camera'}
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">
                {capturedPhoto ? 'Review & Share' : 'Live Capture & Story'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!capturedPhoto && !cameraError && (
              <button
                onClick={handleToggleFacingMode}
                title="Switch front/back camera"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder / Preview Section */}
        <div className="relative flex-1 min-h-[360px] sm:min-h-[420px] bg-black flex items-center justify-center overflow-hidden">
          {capturedPhoto ? (
            /* Captured Photo Preview */
            <img
              src={capturedPhoto}
              alt="Captured frame"
              className="w-full h-full object-contain max-h-[55vh]"
            />
          ) : cameraError ? (
            /* Fallback when camera device is denied/blocked */
            <div className="p-6 text-center max-w-sm space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-200 mb-1">
                  {language === 'ur' ? 'کیمرہ رسائی یا فائل اپلوڈ' : 'Camera or File Upload'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {cameraError}
                </p>
              </div>

              <button
                id="btn-camera-file-select"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>{language === 'ur' ? 'گیلری سے تصویر منتخب کریں' : 'Choose Photo from Device'}</span>
              </button>
            </div>
          ) : (
            /* Live Camera Feed */
            <div className="w-full h-full relative flex items-center justify-center">
              {isLoadingCamera && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 text-xs font-mono text-emerald-400 gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Accessing camera hardware...</span>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
            </div>
          )}

          {/* Shutter bar overlay when not yet captured */}
          {!capturedPhoto && !cameraError && (
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-around px-6 z-20">
              {/* Gallery upload alternative */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Choose from Gallery"
                className="w-11 h-11 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <Upload className="w-5 h-5" />
              </button>

              {/* Shutter Capture Button */}
              <button
                id="btn-camera-shutter"
                onClick={handleCapturePhoto}
                title="Take Photo"
                className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm active:scale-90 transition-transform shadow-[0_0_25px_rgba(255,255,255,0.4)]"
              >
                <div className="w-14 h-14 rounded-full bg-white hover:bg-slate-100 transition-colors" />
              </button>

              {/* Camera flip */}
              <button
                onClick={handleToggleFacingMode}
                title="Flip Camera"
                className="w-11 h-11 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Post-Capture Editing & Action Controls */}
        {capturedPhoto && (
          <div className="p-4 bg-[#111c24] border-t border-slate-800 space-y-3.5 animate-in slide-in-from-bottom-2 duration-200">
            {/* Caption Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={language === 'ur' ? 'کیپشن شامل کریں...' : 'Add a caption...'}
                className="flex-1 py-2.5 px-3.5 rounded-2xl bg-[#1f2c34] border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleRetake}
                className="py-2.5 px-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                {language === 'ur' ? 'دوبارہ لیں' : 'Retake'}
              </button>
            </div>

            {/* Chat Target Selector */}
            {chats.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium shrink-0">
                  {language === 'ur' ? 'چیٹ منتخب کریں:' : 'Target Chat:'}
                </span>
                <select
                  value={selectedChatId}
                  onChange={(e) => setSelectedChatId(e.target.value)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#1f2c34] border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
                >
                  {chats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.type === 'group' ? '(Group)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons: 1. Status, 2. Send to Chat */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                id="btn-camera-share-status"
                onClick={handlePostToStatus}
                className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'ur' ? 'اسٹیٹس لگائیں' : 'Post to Status'}</span>
              </button>

              <button
                id="btn-camera-send-chat"
                onClick={handleSendToChat}
                disabled={!selectedChatId}
                className="py-2.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'ur' ? 'چیٹ میں بھیجیں' : 'Send to Chat'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {actionSuccessToast && (
          <div className="absolute top-4 inset-x-4 p-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-2xl z-30 animate-in fade-in duration-200">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{actionSuccessToast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
