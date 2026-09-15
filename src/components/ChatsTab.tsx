import React, { useState } from 'react';
import {
  Pin,
  Check,
  CheckCheck,
  VolumeX,
  MessageSquarePlus,
  Users,
  Building2,
  Mic,
  Image as ImageIcon,
  HelpCircle,
  ShoppingBag,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { Chat } from '../types';

interface ChatsTabProps {
  onSelectChat: (chat: Chat) => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onOpenNewCommunity?: () => void;
}

export const ChatsTab: React.FC<ChatsTabProps> = ({
  onSelectChat,
  onOpenNewChat,
  onOpenNewGroup,
  onOpenNewCommunity,
}) => {
  const { chats, currentUser, users, theme, language } = useChat();
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups' | 'business'>('all');
  const [showFabMenu, setShowFabMenu] = useState(false);

  // Filter chats based on tag
  const filteredChats = chats.filter((chat) => {
    if (filter === 'unread') {
      return (currentUser && chat.unreadCount[currentUser.id] > 0);
    }
    if (filter === 'groups') {
      return chat.type === 'group';
    }
    if (filter === 'business') {
      return !!chat.businessUserId || chat.labels?.includes('Verified') || chat.labels?.includes('Official Business');
    }
    return true;
  });

  // Sort pinned chats first, then by last message timestamp
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const timeA = a.lastMessage?.timestamp || a.createdAt;
    const timeB = b.lastMessage?.timestamp || b.createdAt;
    return timeB - timeA;
  });

  const formatTime = (ts?: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden">
      {/* Filter category pills */}
      <div className={`flex items-center gap-2 px-4 py-2 border-b overflow-x-auto scrollbar-none ${
        theme === 'dark' ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-slate-200'
      }`}>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-emerald-600 text-white'
              : theme === 'dark'
              ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {language === 'ur' ? 'تمام' : 'All'}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === 'unread'
              ? 'bg-emerald-600 text-white'
              : theme === 'dark'
              ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {language === 'ur' ? 'غیر پڑھے ہوئے' : 'Unread'}
        </button>
        <button
          onClick={() => setFilter('groups')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === 'groups'
              ? 'bg-emerald-600 text-white'
              : theme === 'dark'
              ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {language === 'ur' ? 'گروپس' : 'Groups'}
        </button>
        <button
          onClick={() => setFilter('business')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === 'business'
              ? 'bg-emerald-600 text-white'
              : theme === 'dark'
              ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {language === 'ur' ? 'بزنس' : 'Business'}
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/40">
        {sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center h-full max-h-[480px]">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
              <MessageSquarePlus className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {language === 'ur' ? 'ابھی کوئی چیٹ نہیں ہے' : 'No chats yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
              {language === 'ur'
                ? 'جیسے نیا واٹس ایپ بالکل صاف ہوتا ہے، اب آپ اپنی مرضی سے کوئی بھی نیا رابطہ شامل کر کے بات چیت شروع کر سکتے ہیں۔'
                : 'Your MyChat is completely fresh. Add any contact or group to begin your conversations.'}
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
              <button
                type="button"
                id="btn-add-first-contact"
                onClick={onOpenNewChat}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>{language === 'ur' ? '+ نیا رابطہ شامل کریں' : '+ Add Contact'}</span>
              </button>
              <button
                type="button"
                id="btn-add-first-group"
                onClick={onOpenNewGroup}
                className="py-2.5 px-3 bg-[#202c33] hover:bg-[#2a3942] border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span>{language === 'ur' ? '+ نیا گروپ' : '+ New Group'}</span>
              </button>
            </div>
          </div>
        ) : (
          sortedChats.map((chat) => {
            const unread = (currentUser && chat.unreadCount[currentUser.id]) || 0;
            const otherUserId = chat.participants.find((p) => p !== currentUser?.id);
            const otherUser = users.find((u) => u.id === otherUserId);
            const isOnline = otherUser?.isOnline;

            return (
              <button
                key={chat.id}
                id={`chat-item-${chat.id}`}
                onClick={() => onSelectChat(chat)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-[#202c33]/70 active:bg-[#222e35]'
                    : 'hover:bg-slate-50 active:bg-slate-100'
                }`}
              >
                {/* Avatar with status indicator */}
                <div className="relative shrink-0">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700/50"
                  />
                  {chat.type === 'direct' && isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#111b21] rounded-full" />
                  )}
                  {chat.type === 'group' && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-teal-600 rounded-full flex items-center justify-center text-[10px] text-white">
                      <Users className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Chat details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <h3
                        className={`text-sm font-semibold truncate ${
                          theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                        }`}
                      >
                        {chat.name}
                      </h3>
                      {chat.businessUserId && (
                        <span className="shrink-0 text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-1.5 py-0.2 rounded">
                          Business
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] shrink-0 ${
                        unread > 0
                          ? 'text-emerald-400 font-semibold'
                          : theme === 'dark'
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {formatTime(chat.lastMessage?.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {/* Last message with checkmark / icon */}
                    <div className="flex items-center gap-1 text-xs truncate">
                      {chat.lastMessage?.senderId === currentUser?.id && (
                        <span className="shrink-0">
                          {chat.lastMessage.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                          ) : chat.lastMessage.status === 'delivered' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </span>
                      )}

                      {/* Content icon preview */}
                      {chat.lastMessage?.type === 'voice' && (
                        <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      {chat.lastMessage?.type === 'image' && (
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      {chat.lastMessage?.type === 'poll' && (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      {chat.lastMessage?.type === 'catalog_item' && (
                        <ShoppingBag className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      )}

                      <span
                        className={`truncate ${
                          unread > 0
                            ? theme === 'dark'
                              ? 'text-slate-200 font-medium'
                              : 'text-slate-900 font-medium'
                            : 'text-slate-400'
                        }`}
                      >
                        {chat.lastMessage?.text || 'No messages yet'}
                      </span>
                    </div>

                    {/* Meta badges: pinned, unread count */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {chat.isMuted && <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                      {chat.isPinned && <Pin className="w-3 h-3 text-slate-400 rotate-45" />}
                      {unread > 0 && (
                        <span className="min-w-4.5 h-4.5 px-1 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Floating Action Button & Menu */}
      {showFabMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowFabMenu(false)}
        />
      )}

      <div className="absolute bottom-5 right-5 z-40">
        {showFabMenu && (
          <div className="flex flex-col items-end gap-2.5 mb-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Option 1: New Community */}
            <button
              id="fab-btn-new-community"
              onClick={() => {
                setShowFabMenu(false);
                if (onOpenNewCommunity) {
                  onOpenNewCommunity();
                }
              }}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#1f2c34] text-emerald-400 text-xs font-semibold shadow-xl border border-slate-700/80 hover:bg-[#2a3942] hover:border-emerald-500/40 transition-all active:scale-95 group"
            >
              <span className="text-slate-200 group-hover:text-emerald-400 transition-colors">
                {language === 'ur' ? 'نئی کمیونٹی' : 'New Community'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
            </button>

            {/* Option 2: New Group */}
            <button
              id="fab-btn-new-group"
              onClick={() => {
                setShowFabMenu(false);
                onOpenNewGroup();
              }}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#1f2c34] text-emerald-400 text-xs font-semibold shadow-xl border border-slate-700/80 hover:bg-[#2a3942] hover:border-emerald-500/40 transition-all active:scale-95 group"
            >
              <span className="text-slate-200 group-hover:text-emerald-400 transition-colors">
                {language === 'ur' ? 'نیا گروپ' : 'New Group'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </button>

            {/* Option 3: New Chat */}
            <button
              id="fab-btn-new-chat-option"
              onClick={() => {
                setShowFabMenu(false);
                onOpenNewChat();
              }}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#1f2c34] text-emerald-400 text-xs font-semibold shadow-xl border border-slate-700/80 hover:bg-[#2a3942] hover:border-emerald-500/40 transition-all active:scale-95 group"
            >
              <span className="text-slate-200 group-hover:text-emerald-400 transition-colors">
                {language === 'ur' ? 'نیا چیٹ' : 'New Chat'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <MessageSquarePlus className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        <button
          id="btn-fab-actions"
          onClick={() => setShowFabMenu((prev) => !prev)}
          className={`w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center justify-center transition-all duration-200 active:scale-95 ${
            showFabMenu ? 'rotate-45 bg-emerald-400 shadow-emerald-500/40' : ''
          }`}
          title={showFabMenu ? 'Close Actions' : 'New Chat Actions'}
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
