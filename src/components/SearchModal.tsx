import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  MessageSquare,
  Users,
  User,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { Chat, Message, User as UserType } from '../types';

interface SearchModalProps {
  onClose: () => void;
  onSelectChat: (chat: Chat) => void;
}

type SearchCategory = 'all' | 'chats' | 'messages' | 'contacts';

export const SearchModal: React.FC<SearchModalProps> = ({ onClose, onSelectChat }) => {
  const { chats, messages, users, currentUser, createChat, theme, language } = useChat();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const cleanQuery = query.trim().toLowerCase();

  // 1. Search Chats (Direct, Groups, Communities)
  const matchingChats = useMemo(() => {
    if (!cleanQuery) return chats;
    return chats.filter((chat) => {
      const nameMatch = (chat.name || '').toLowerCase().includes(cleanQuery);
      const descMatch = (chat.description || '').toLowerCase().includes(cleanQuery);
      return nameMatch || descMatch;
    });
  }, [chats, cleanQuery]);

  // 2. Search Messages Content Across All Chats
  const matchingMessages = useMemo(() => {
    if (!cleanQuery) return [];
    const results: { chat: Chat; message: Message }[] = [];

    for (const chat of chats) {
      const chatMsgs = messages[chat.id] || [];
      for (const msg of chatMsgs) {
        if (msg.text && msg.text.toLowerCase().includes(cleanQuery)) {
          results.push({ chat, message: msg });
        }
      }
    }
    // Return newest matched messages first
    return results.sort((a, b) => b.message.timestamp - a.message.timestamp);
  }, [chats, messages, cleanQuery]);

  // 3. Search Contacts / Users
  const matchingContacts = useMemo(() => {
    const otherUsers = users.filter((u) => u.id !== currentUser?.id);
    if (!cleanQuery) return otherUsers.slice(0, 10);
    return otherUsers.filter((u) => {
      const nameMatch = (u.name || '').toLowerCase().includes(cleanQuery);
      const usernameMatch = (u.username || '').toLowerCase().includes(cleanQuery.replace(/^@/, ''));
      const phoneMatch = Boolean(u.phone && u.phone.includes(cleanQuery));
      return nameMatch || usernameMatch || phoneMatch;
    });
  }, [users, currentUser, cleanQuery]);

  const handleSelectContact = (targetUser: UserType) => {
    // Check if direct chat already exists
    const existingChat = chats.find(
      (c) => c.type === 'direct' && c.participants.includes(targetUser.id)
    );
    if (existingChat) {
      onSelectChat(existingChat);
    } else {
      const newChat = createChat(targetUser.id);
      onSelectChat(newChat);
    }
    onClose();
  };

  const highlightMatch = (text: string, search: string) => {
    if (!search || !text) return text;
    const parts = text.split(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <span key={i} className="bg-emerald-500/30 text-emerald-300 font-semibold px-0.5 rounded">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const formatMessageTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const totalResultsCount =
    (cleanQuery ? matchingChats.length : 0) +
    matchingMessages.length +
    (cleanQuery ? matchingContacts.length : 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[88vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          theme === 'dark' ? 'bg-[#111b21] border-[#222e35] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Search Header Bar */}
        <div className={`p-4 border-b flex items-center gap-3 ${theme === 'dark' ? 'border-[#222e35]' : 'border-slate-100'}`}>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                language === 'ur'
                  ? 'چیٹس، پیغامات اور رابطے تلاش کریں...'
                  : 'Search chats, messages, and contacts...'
              }
              className={`w-full py-2.5 px-3.5 pr-9 rounded-2xl text-sm font-medium focus:outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-[#202c33] text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/50'
                  : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/50'
              }`}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className={`p-2.5 rounded-2xl transition-colors shrink-0 ${
              theme === 'dark' ? 'hover:bg-[#202c33] text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500'
            }`}
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className={`px-4 py-2 border-b flex items-center gap-2 overflow-x-auto scrollbar-none ${
          theme === 'dark' ? 'border-[#222e35] bg-[#0c1317]' : 'border-slate-100 bg-slate-50'
        }`}>
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : theme === 'dark'
                ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {language === 'ur' ? 'تمام' : 'All'}
          </button>

          <button
            onClick={() => setActiveCategory('chats')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeCategory === 'chats'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : theme === 'dark'
                ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'چیٹس' : 'Chats'}</span>
            <span className="opacity-75">({matchingChats.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('messages')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeCategory === 'messages'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : theme === 'dark'
                ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'پیغامات' : 'Messages'}</span>
            <span className="opacity-75">({matchingMessages.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('contacts')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeCategory === 'contacts'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : theme === 'dark'
                ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'رابطے' : 'Contacts'}</span>
            <span className="opacity-75">({matchingContacts.length})</span>
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Empty query guide */}
          {!cleanQuery && (
            <div className="py-2 text-xs text-slate-400 font-mono flex items-center justify-between">
              <span>{language === 'ur' ? 'حالیہ گفتگو اور رابطے' : 'RECENT CHATS & QUICK CONTACTS'}</span>
              <span>{chats.length} active chats</span>
            </div>
          )}

          {/* Section: Chats */}
          {(activeCategory === 'all' || activeCategory === 'chats') && matchingChats.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'گفتگو اور گروپس' : 'Chats & Groups'} ({matchingChats.length})</span>
              </div>

              <div className="space-y-1.5">
                {matchingChats.slice(0, 8).map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      onSelectChat(chat);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all border ${
                      theme === 'dark'
                        ? 'bg-[#182229] border-slate-800/80 hover:bg-[#202c33] hover:border-emerald-500/40'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={chat.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                        alt={chat.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-emerald-500/30"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">
                          {highlightMatch(chat.name, cleanQuery)}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {chat.lastMessage?.text || chat.description || (chat.type === 'group' ? 'Group Chat' : 'Encrypted Chat')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 ml-2">
                      {chat.type === 'group' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                          Group
                        </span>
                      ) : chat.type === 'community' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20">
                          Community
                        </span>
                      ) : null}
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Messages Content Matching */}
          {(activeCategory === 'all' || activeCategory === 'messages') && cleanQuery && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'پیغامات کے نتائج' : 'Message Matches'} ({matchingMessages.length})</span>
              </div>

              {matchingMessages.length === 0 ? (
                <div className={`p-4 rounded-2xl text-xs text-slate-400 text-center border ${
                  theme === 'dark' ? 'bg-[#182229]/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  No messages matched "{query}"
                </div>
              ) : (
                <div className="space-y-1.5">
                  {matchingMessages.slice(0, 10).map(({ chat, message }) => (
                    <button
                      key={message.id}
                      onClick={() => {
                        onSelectChat(chat);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all border ${
                        theme === 'dark'
                          ? 'bg-[#182229] border-slate-800/80 hover:bg-[#202c33] hover:border-cyan-500/40'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2 text-xs font-semibold mb-0.5">
                          <span className="text-slate-200">{chat.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">•</span>
                          <span className="text-[11px] text-emerald-400 font-medium">{message.senderName}</span>
                        </div>
                        <div className="text-xs text-slate-300 break-words line-clamp-2">
                          "{highlightMatch(message.text, cleanQuery)}"
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 shrink-0">
                        {formatMessageTime(message.timestamp)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: Contacts */}
          {(activeCategory === 'all' || activeCategory === 'contacts') && matchingContacts.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase font-bold tracking-wider text-purple-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'رابطے اور صارفین' : 'Contacts & Users'} ({matchingContacts.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchingContacts.slice(0, 8).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectContact(user)}
                    className={`p-3 rounded-2xl flex items-center gap-3 text-left transition-all border ${
                      theme === 'dark'
                        ? 'bg-[#182229] border-slate-800/80 hover:bg-[#202c33] hover:border-purple-500/40'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-purple-500/40'
                    }`}
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">
                        {highlightMatch(user.name, cleanQuery)}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 truncate">
                        @{highlightMatch(user.username || 'user', cleanQuery.replace(/^@/, ''))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results at all */}
          {cleanQuery && totalResultsCount === 0 && (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-7 h-7" />
              </div>
              <div className="text-sm font-bold text-slate-300">
                {language === 'ur' ? 'کوئی نتیجہ نہیں ملا' : 'No results found'}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {language === 'ur'
                  ? `"${query}" سے ملتا جلتا کوئی چیٹ، پیغام یا صارف نہیں ملا۔`
                  : `We couldn't find any chats, message texts, or usernames matching "${query}".`}
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className={`px-4 py-3 border-t flex items-center justify-between text-[11px] font-mono text-slate-400 ${
          theme === 'dark' ? 'border-[#222e35] bg-[#0c1317]' : 'border-slate-100 bg-slate-50'
        }`}>
          <span>
            {language === 'ur' ? 'Enter دبائیں یا کلک کریں' : 'Press ESC to close'}
          </span>
          <span className="text-emerald-400">
            {cleanQuery ? `${totalResultsCount} matches found` : 'Live Real-time Search'}
          </span>
        </div>
      </div>
    </div>
  );
};
