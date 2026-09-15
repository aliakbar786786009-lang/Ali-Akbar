import React, { useState, useEffect } from 'react';
import { X, Eye, Heart, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusUpdate } from '../types';
import { useChat } from '../context/ChatContext';

interface StatusViewerModalProps {
  status: StatusUpdate;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({
  status,
  onClose,
  onNext,
  onPrev,
}) => {
  const { currentUser, viewStatus, sendMessage } = useChat();
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [showViewers, setShowViewers] = useState(false);

  // Mark as viewed
  useEffect(() => {
    viewStatus(status.id);
  }, [status.id]);

  // Auto progression timer (5 seconds)
  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onNext) onNext();
          else onClose();
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [status.id]);

  const isMyStatus = status.userId === currentUser?.id;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isMyStatus) return;
    // Find or create chat with status owner and send message
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none">
      {/* Top progress bar */}
      <div className="p-3 z-20">
        <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* User Info Header */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <img
              src={status.userAvatar}
              alt={status.userName}
              className="w-10 h-10 rounded-full object-cover border border-white/40"
            />
            <div>
              <h4 className="font-semibold text-sm leading-tight">{status.userName}</h4>
              <span className="text-xs text-white/70">
                {new Date(status.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex items-center justify-center p-6">
        {/* Navigation tap areas */}
        {onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-2 z-10 p-2 text-white/50 hover:text-white"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-2 z-10 p-2 text-white/50 hover:text-white"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        {status.type === 'image' && status.mediaUrl ? (
          <div className="max-w-md w-full max-h-[75vh] flex flex-col items-center">
            <img
              src={status.mediaUrl}
              alt="Status"
              className="w-full h-auto max-h-[60vh] object-contain rounded-2xl shadow-2xl"
            />
            {status.content && (
              <p className="mt-4 text-white text-base font-medium text-center bg-black/50 px-4 py-2 rounded-full">
                {status.content}
              </p>
            )}
          </div>
        ) : (
          <div
            className={`w-full max-w-md h-96 rounded-3xl bg-gradient-to-tr ${
              status.bgColor || 'from-teal-700 to-emerald-900'
            } p-8 flex items-center justify-center shadow-2xl text-center`}
          >
            <p className="text-white text-xl sm:text-2xl font-bold leading-relaxed">
              {status.content}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer: Reply or Viewers count */}
      <div className="p-4 z-20">
        {isMyStatus ? (
          <div className="flex flex-col items-center text-white">
            <button
              onClick={() => setShowViewers(!showViewers)}
              className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>{status.viewers.length} views</span>
            </button>

            {showViewers && (
              <div className="mt-3 w-full max-w-xs bg-slate-900/90 border border-slate-700 rounded-xl p-3 max-h-40 overflow-y-auto">
                <div className="text-xs font-semibold mb-2 text-slate-300">Viewed by</div>
                {status.viewers.length === 0 ? (
                  <div className="text-xs text-slate-500">No views yet</div>
                ) : (
                  status.viewers.map((v) => (
                    <div key={v.userId} className="flex items-center gap-2 py-1 text-xs text-slate-200">
                      <img src={v.avatar} className="w-5 h-5 rounded-full" alt="" />
                      <span>{v.name}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSendReply} className="flex items-center gap-2 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Reply to status..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-full bg-white/20 border border-white/30 text-white placeholder:text-white/60 text-sm focus:outline-none backdrop-blur-md"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
