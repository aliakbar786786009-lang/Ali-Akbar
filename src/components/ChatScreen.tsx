import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
  Check,
  CheckCheck,
  Star,
  Trash2,
  Reply,
  Copy,
  Play,
  Pause,
  ShoppingBag,
  BarChart2,
  FileText,
  Camera,
  Image as ImageIcon,
  MapPin,
  Lock,
  X,
  Plus,
  Clock,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { Chat, Message, User, CatalogItemData } from '../types';

interface ChatScreenProps {
  chat: Chat;
  onBack: () => void;
  onStartVoiceCall: (user: User) => void;
  onStartVideoCall: (user: User) => void;
  onViewBusinessCatalog?: (user: User) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  chat,
  onBack,
  onStartVoiceCall,
  onStartVideoCall,
  onViewBusinessCatalog,
}) => {
  const {
    currentUser,
    users,
    messages,
    sendMessage,
    addReaction,
    starMessage,
    deleteMessage,
    votePoll,
    theme,
    language,
    isOnline,
    isSyncingQueue,
    pendingOfflineCount,
    toggleSimulatedOffline,
    syncOfflineQueue,
  } = useChat();

  const chatMessages = messages[chat.id] || [];

  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<number | null>(null);

  // Audio playback state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Poll creation form
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find recipient user if direct chat
  const otherUserId = chat.participants.find((p) => p !== currentUser?.id);
  const otherUser = users.find((u) => u.id === otherUserId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  // Voice recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const handleSendText = () => {
    if (!inputText.trim()) return;
    sendMessage(chat.id, inputText.trim(), 'text', {
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.text,
          }
        : undefined,
    });
    setInputText('');
    setReplyingTo(null);
  };

  const handleSendVoice = () => {
    setIsRecording(false);
    const duration = Math.max(recordingTime, 1);
    sendMessage(chat.id, `Voice message (${duration}s)`, 'voice', {
      duration,
    });
    setRecordingTime(0);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = pollOptions.filter((opt) => opt.trim().length > 0);
    if (!pollQuestion.trim() || validOptions.length < 2) return;

    sendMessage(chat.id, `Poll: ${pollQuestion}`, 'poll', {
      pollData: {
        question: pollQuestion,
        allowMultiple: false,
        options: validOptions.map((opt, idx) => ({
          id: `opt_${Date.now()}_${idx}`,
          text: opt,
          votes: [],
        })),
      },
    });

    setShowPollCreator(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  // Mock File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (isImage) {
        sendMessage(chat.id, file.name, 'image', {
          mediaUrl: dataUrl,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        });
      } else {
        sendMessage(chat.id, file.name, 'document', {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        });
      }
    };
    reader.readAsDataURL(file);
    setShowAttachments(false);
  };

  const toggleVoicePlayback = (msgId: string) => {
    if (playingVoiceId === msgId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(msgId);
      // Auto stop after 4 seconds for simulation
      setTimeout(() => {
        setPlayingVoiceId(null);
      }, 4000);
    }
  };

  return (
    <div
      id="chat-screen"
      className={`relative flex-1 flex flex-col h-full overflow-hidden ${
        theme === 'dark' ? 'bg-[#0b141a]' : 'bg-[#efeae2]'
      }`}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Header */}
      <header
        className={`px-3 py-2.5 flex items-center justify-between shadow-sm z-20 ${
          theme === 'dark' ? 'bg-[#202c33] text-slate-100' : 'bg-[#008069] text-white'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            id="btn-chat-back"
            onClick={onBack}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
            title="Back to chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative shrink-0">
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-700/50"
            />
            {chat.type === 'direct' && otherUser?.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#202c33] rounded-full" />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate leading-tight flex items-center gap-1.5">
              <span>{chat.name}</span>
              {chat.businessUserId && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded">
                  Verified
                </span>
              )}
            </h2>
            <p className={`text-[11px] truncate ${theme === 'dark' ? 'text-slate-400' : 'text-emerald-100'}`}>
              {chat.type === 'group'
                ? `${chat.participants.length} members`
                : otherUser?.isOnline
                ? 'Online'
                : 'Last seen recently'}
            </p>
          </div>
        </div>

        {/* Header action buttons */}
        <div className="flex items-center gap-1">
          {/* Voice Call */}
          <button
            id="btn-header-voice-call"
            onClick={() => otherUser && onStartVoiceCall(otherUser)}
            title="Voice Call"
            className="p-2 rounded-full hover:bg-black/10 transition-colors"
          >
            <Phone className="w-4.5 h-4.5" />
          </button>

          {/* Video Call */}
          <button
            id="btn-header-video-call"
            onClick={() => otherUser && onStartVideoCall(otherUser)}
            title="Video Call"
            className="p-2 rounded-full hover:bg-black/10 transition-colors"
          >
            <Video className="w-4.5 h-4.5" />
          </button>

          {/* Business Catalog Quick Button */}
          {chat.businessUserId && otherUser && onViewBusinessCatalog && (
            <button
              id="btn-header-catalog"
              onClick={() => onViewBusinessCatalog(otherUser)}
              title="View Products Catalog"
              className="p-2 rounded-full hover:bg-black/10 text-amber-300 transition-colors"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
            </button>
          )}

          <button
            id="btn-header-chat-menu"
            title="More Options"
            onClick={() => {
              if (chat.businessUserId && otherUser && onViewBusinessCatalog) {
                onViewBusinessCatalog(otherUser);
              }
            }}
            className="p-2 rounded-full hover:bg-black/10 transition-colors"
          >
            <MoreVertical className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Offline Status & IndexedDB Queue Banner */}
      {!isOnline && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 px-3.5 py-2 text-xs flex items-center justify-between font-mono animate-fadeIn shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-amber-300">Offline Mode:</span> Messages queued in local IndexedDB
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {pendingOfflineCount > 0 && (
              <span className="bg-amber-500/30 text-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                {pendingOfflineCount} queued
              </span>
            )}
            <button
              onClick={toggleSimulatedOffline}
              title="Switch to Online & sync queued messages"
              className="px-2 py-0.5 rounded bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-200 text-[10px] font-sans font-medium transition-colors"
            >
              Go Online
            </button>
          </div>
        </div>
      )}

      {/* Syncing Queue Notification */}
      {isSyncingQueue && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 px-4 py-1.5 text-xs flex items-center justify-center gap-2 font-mono shrink-0">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span>Syncing IndexedDB offline messages with Firebase Cloud...</span>
        </div>
      )}

      {/* Messages Stream with WhatsApp Wallpaper Pattern */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 relative"
        style={{
          backgroundImage:
            theme === 'dark'
              ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.015) 1px, transparent 1px)'
              : 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* End-to-End Encryption Banner */}
        <div className="flex justify-center my-2">
          <div
            className={`max-w-xs sm:max-w-md px-3 py-1.5 rounded-lg text-center text-[11px] leading-relaxed shadow-sm border flex items-center gap-2 ${
              theme === 'dark'
                ? 'bg-[#182229] text-amber-300/80 border-amber-500/20'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>
              Messages & calls are end-to-end encrypted. No one outside of this chat, not even MyChat or Admins, can read or listen to them.
            </span>
          </div>
        </div>

        {/* Render messages */}
        {chatMessages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          const isSystem = msg.type === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="px-3 py-1 bg-[#182229]/80 border border-slate-700/40 text-slate-300 text-[11px] rounded-full">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
            >
              {/* Message Bubble Container */}
              <div
                onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-2.5 shadow-sm text-sm relative transition-all cursor-pointer ${
                  isMe
                    ? 'bg-[#005c4b] text-slate-100 rounded-tr-xs'
                    : theme === 'dark'
                    ? 'bg-[#202c33] text-slate-100 rounded-tl-xs'
                    : 'bg-white text-slate-900 rounded-tl-xs'
                }`}
              >
                {/* Sender Name in Group Chat */}
                {!isMe && chat.type === 'group' && (
                  <div className="text-[11px] font-bold text-teal-400 mb-0.5">
                    {msg.senderName}
                  </div>
                )}

                {/* Reply To Preview */}
                {msg.replyTo && (
                  <div
                    className={`mb-2 p-2 rounded-lg border-l-4 text-xs ${
                      isMe
                        ? 'bg-[#025142] border-emerald-300 text-emerald-100'
                        : theme === 'dark'
                        ? 'bg-[#182229] border-teal-500 text-slate-300'
                        : 'bg-slate-100 border-teal-600 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-[10px] text-teal-300">
                      {msg.replyTo.senderName}
                    </div>
                    <div className="truncate opacity-85">{msg.replyTo.text}</div>
                  </div>
                )}

                {/* Content: Photo / Media */}
                {msg.type === 'image' && msg.mediaUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden max-h-64">
                    <img
                      src={msg.mediaUrl}
                      alt="Uploaded media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content: Voice Note */}
                {msg.type === 'voice' && (
                  <div className="flex items-center gap-3 py-1 min-w-[200px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVoicePlayback(msg.id);
                      }}
                      className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow active:scale-95 transition-transform"
                    >
                      {playingVoiceId === msg.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Waveform graphic representation */}
                    <div className="flex-1 flex items-center gap-0.5 h-6">
                      {[40, 70, 90, 60, 30, 80, 100, 50, 70, 90, 40, 60, 80, 50].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`w-1 rounded-full transition-all ${
                            playingVoiceId === msg.id
                              ? 'bg-emerald-400 animate-pulse'
                              : isMe
                              ? 'bg-emerald-200/60'
                              : 'bg-slate-400/60'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1));
                      }}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/20 text-slate-200"
                    >
                      {playbackSpeed}x
                    </button>
                  </div>
                )}

                {/* Content: Business Catalog Item */}
                {msg.type === 'catalog_item' && msg.catalogData && (
                  <div className="my-1 p-2.5 rounded-xl bg-black/20 border border-slate-700/50 space-y-2">
                    <img
                      src={msg.catalogData.imageUrl}
                      alt={msg.catalogData.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div>
                      <div className="font-semibold text-xs text-white">
                        {msg.catalogData.name}
                      </div>
                      <div className="text-emerald-400 font-bold text-sm">
                        ${msg.catalogData.price} {msg.catalogData.currency}
                      </div>
                      <div className="text-[11px] text-slate-300 line-clamp-2">
                        {msg.catalogData.description}
                      </div>
                    </div>
                  </div>
                )}

                {/* Content: Interactive Poll */}
                {msg.type === 'poll' && msg.pollData && (
                  <div className="my-1 p-3 rounded-xl bg-black/20 border border-slate-700/50 space-y-2.5 min-w-[220px]">
                    <div className="font-semibold text-xs text-amber-300 flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4" />
                      <span>{msg.pollData.question}</span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.pollData.options.map((opt) => {
                        const totalVotes = msg.pollData!.options.reduce(
                          (acc, o) => acc + o.votes.length,
                          0
                        );
                        const percent = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                        const hasVoted = currentUser && opt.votes.includes(currentUser.id);

                        return (
                          <button
                            key={opt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              votePoll(chat.id, msg.id, opt.id);
                            }}
                            className={`w-full text-left p-2 rounded-lg relative overflow-hidden text-xs border transition-all ${
                              hasVoted
                                ? 'border-emerald-400 bg-emerald-900/30'
                                : 'border-slate-700 bg-black/20 hover:bg-black/30'
                            }`}
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-emerald-500/20 transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                            <div className="relative flex items-center justify-between">
                              <span className="font-medium text-slate-200">{opt.text}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {opt.votes.length} ({percent}%)
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Content: Document */}
                {msg.type === 'document' && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-slate-700/40">
                    <FileText className="w-7 h-7 text-emerald-400 shrink-0" />
                    <div className="min-w-0 text-xs">
                      <div className="font-medium truncate">{msg.fileName || 'Document'}</div>
                      <div className="text-[10px] text-slate-400">{msg.fileSize || 'PDF'}</div>
                    </div>
                  </div>
                )}

                {/* Text Message */}
                {msg.type === 'text' && (
                  <p className="whitespace-pre-wrap break-words leading-relaxed text-[13.5px]">
                    {msg.text}
                  </p>
                )}

                {/* Bubble Footer: Star, Timestamp & Checkmark */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-75">
                  {msg.isStarred && <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />}
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {isMe && (
                    <span className="ml-0.5">
                      {msg.status === 'pending' ? (
                        <span title="Offline - Queued in IndexedDB (syncs automatically when online)">
                          <Clock className="w-3 h-3 text-amber-300 animate-pulse" />
                        </span>
                      ) : msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-slate-300" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </span>
                  )}
                </div>

                {/* Message Reactions display */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="absolute -bottom-2.5 right-2 flex items-center gap-0.5 bg-[#202c33] border border-slate-700/60 rounded-full px-1.5 py-0.5 shadow-md">
                    {Object.entries(msg.reactions).map(([emoji, usersArr]) => {
                      const count = Array.isArray(usersArr) ? usersArr.length : 0;
                      return (
                        <span key={emoji} className="text-xs flex items-center gap-0.5">
                          {emoji}
                          {count > 1 && (
                            <span className="text-[10px] text-slate-300">{count}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Message Action Menu (appears on selection) */}
              {selectedMessage?.id === msg.id && (
                <div className="flex items-center gap-1 mt-1 p-1 bg-[#202c33] border border-slate-700 rounded-full shadow-lg z-10 animate-in fade-in zoom-in-95 duration-150">
                  {/* Emojis strip */}
                  {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        addReaction(chat.id, msg.id, emoji);
                        setSelectedMessage(null);
                      }}
                      className="w-7 h-7 flex items-center justify-center text-sm hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}

                  <div className="w-px h-4 bg-slate-700 mx-0.5" />

                  {/* Reply */}
                  <button
                    onClick={() => {
                      setReplyingTo(msg);
                      setSelectedMessage(null);
                    }}
                    title="Reply"
                    className="p-1.5 hover:bg-slate-700 rounded-full text-slate-300"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>

                  {/* Star */}
                  <button
                    onClick={() => {
                      starMessage(chat.id, msg.id);
                      setSelectedMessage(null);
                    }}
                    title="Star message"
                    className="p-1.5 hover:bg-slate-700 rounded-full text-amber-300"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy */}
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(msg.text);
                      setSelectedMessage(null);
                    }}
                    title="Copy text"
                    className="p-1.5 hover:bg-slate-700 rounded-full text-slate-300"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      deleteMessage(chat.id, msg.id, isMe);
                      setSelectedMessage(null);
                    }}
                    title="Delete"
                    className="p-1.5 hover:bg-slate-700 rounded-full text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview Banner */}
      {replyingTo && (
        <div
          className={`px-4 py-2 flex items-center justify-between border-t border-l-4 border-l-emerald-500 ${
            theme === 'dark' ? 'bg-[#182229] border-t-slate-800' : 'bg-slate-100 border-t-slate-300'
          }`}
        >
          <div className="text-xs truncate">
            <span className="font-semibold text-emerald-400 block">
              Replying to {replyingTo.senderName}
            </span>
            <span className="text-slate-400 truncate block">{replyingTo.text}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachments Menu Popover */}
      {showAttachments && (
        <div
          className={`absolute bottom-16 left-4 z-30 p-3 rounded-2xl shadow-2xl border grid grid-cols-3 gap-3 w-64 ${
            theme === 'dark'
              ? 'bg-[#202c33] border-slate-700 text-slate-200'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {/* Gallery / Photo */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-emerald-500/10 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Gallery</span>
          </button>

          {/* Document */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-emerald-500/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Document</span>
          </button>

          {/* Poll */}
          <button
            onClick={() => {
              setShowAttachments(false);
              setShowPollCreator(true);
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-emerald-500/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Poll</span>
          </button>

          {/* Business Catalog (if available) */}
          {chat.businessUserId && otherUser && onViewBusinessCatalog && (
            <button
              onClick={() => {
                setShowAttachments(false);
                onViewBusinessCatalog(otherUser);
              }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-emerald-500/10 transition-colors col-span-3 border-t border-slate-700/40 pt-2"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Products Catalog</span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div
          className={`absolute bottom-16 left-2 z-30 p-2.5 rounded-2xl shadow-2xl border max-w-xs ${
            theme === 'dark' ? 'bg-[#202c33] border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className="grid grid-cols-7 gap-1 text-xl">
            {[
              '😀', '😂', '😍', '🔥', '👍', '🙏', '🎉',
              '😎', '🥳', '❤️', '✨', '🚀', '💯', '🤔',
              '🤝', '👏', '🙌', '🌟', '⚡', '☕', '💡',
            ].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setInputText((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="p-1 hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Poll Creation Modal */}
      {showPollCreator && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl border ${
              theme === 'dark'
                ? 'bg-[#111b21] border-slate-700 text-slate-100'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Create a Poll</h3>
              <button
                onClick={() => setShowPollCreator(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Question</label>
                <input
                  type="text"
                  required
                  placeholder="Ask a question..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#202c33] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Options</label>
                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[idx] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-[#202c33] border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  ))}
                </div>
                {pollOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add option</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
                >
                  Create Poll
                </button>
                <button
                  type="button"
                  onClick={() => setShowPollCreator(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Composer Bar */}
      <footer
        className={`p-2.5 flex items-center gap-2 border-t z-20 ${
          theme === 'dark' ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-[#f0f2f5] border-slate-200'
        }`}
      >
        {isRecording ? (
          /* Live Voice Recording Bar */
          <div className="flex-1 flex items-center justify-between px-3 py-1 bg-red-950/40 border border-red-800/40 rounded-full animate-pulse">
            <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Recording voice ({recordingTime}s)</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={cancelRecording}
                className="text-xs text-slate-400 hover:text-rose-400 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendVoice}
                className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Standard Input Bar */
          <>
            <div
              className={`flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border ${
                theme === 'dark'
                  ? 'bg-[#2a3942] border-slate-700/60 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowAttachments(false);
                }}
                className="text-slate-400 hover:text-amber-400 transition-colors"
                title="Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Text Input */}
              <input
                id="input-chat-message"
                type="text"
                placeholder={language === 'ur' ? 'پیغام لکھیں...' : 'Type a message...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendText();
                  }
                }}
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
              />

              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => {
                  setShowAttachments(!showAttachments);
                  setShowEmojiPicker(false);
                }}
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                title="Attach files"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Camera Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                title="Camera"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* Mic or Send Button */}
            {inputText.trim() ? (
              <button
                id="btn-send-message"
                onClick={handleSendText}
                className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-md active:scale-95 transition-transform shrink-0"
                title="Send message"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            ) : (
              <button
                id="btn-record-voice"
                onClick={() => setIsRecording(true)}
                className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-md active:scale-95 transition-transform shrink-0"
                title="Record voice note"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </footer>
    </div>
  );
};
