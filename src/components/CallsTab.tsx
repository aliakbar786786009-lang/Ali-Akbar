import React, { useState } from 'react';
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Trash2,
  PhoneCall,
  X,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { User } from '../types';

export const CallsTab: React.FC = () => {
  const { calls, users, currentUser, startCall, clearCallHistory, theme, language } = useChat();
  const [showNewCallModal, setShowNewCallModal] = useState(false);

  const formatDuration = (sec: number) => {
    if (sec === 0) return 'Missed';
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const handleStartCall = (targetUser: User, type: 'voice' | 'video') => {
    setShowNewCallModal(false);
    startCall(targetUser, type);
  };

  const availableContacts = users.filter((u) => u.id !== currentUser?.id);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Top action bar */}
      <div
        className={`px-4 py-2.5 flex items-center justify-between border-b ${
          theme === 'dark' ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-slate-200'
        }`}
      >
        <span className="text-xs font-semibold uppercase text-slate-400">
          {language === 'ur' ? 'کال لاگ' : 'Recent Calls'} ({calls.length})
        </span>

        {calls.length > 0 && (
          <button
            onClick={clearCallHistory}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            title="Clear Call History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/40">
        {calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
              <PhoneCall className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              {language === 'ur' ? 'ابھی کوئی کال نہیں ہے' : 'No call history yet'}
            </p>
            <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
              {language === 'ur'
                ? 'اپنے رابطوں کے ساتھ ہائی کوالٹی اینڈ ٹو اینڈ اینکرپٹڈ آڈیو اور ویڈیو کالز شروع کریں۔'
                : 'Connect with your contacts using crystal clear, end-to-end encrypted voice and video calling.'}
            </p>
            <button
              onClick={() => setShowNewCallModal(true)}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'نئی کال شروع کریں' : 'Start a Call'}</span>
            </button>
          </div>
        ) : (
          calls.map((call) => {
            const isOutgoing = call.callerId === currentUser?.id;
            const otherName = isOutgoing ? call.receiverName : call.callerName;
            const otherAvatar = isOutgoing ? call.receiverAvatar : call.callerAvatar;
            const otherUser = users.find((u) => u.name === otherName);

            return (
              <div
                key={call.id}
                className={`px-4 py-3 flex items-center justify-between transition-colors ${
                  theme === 'dark' ? 'hover:bg-[#202c33]/60' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={otherAvatar}
                    alt={otherName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700/50"
                  />

                  <div>
                    <h4
                      className={`text-sm font-semibold ${
                        call.status === 'missed' ? 'text-rose-400' : theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                      }`}
                    >
                      {otherName}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      {call.direction === 'incoming' && call.status === 'missed' ? (
                        <PhoneMissed className="w-3.5 h-3.5 text-rose-500" />
                      ) : call.direction === 'incoming' ? (
                        <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <PhoneOutgoing className="w-3.5 h-3.5 text-blue-400" />
                      )}

                      <span>
                        {new Date(call.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        • {formatDuration(call.duration)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Call Back Button */}
                <button
                  onClick={() => {
                    if (otherUser) {
                      startCall(otherUser, call.type);
                    }
                  }}
                  className={`p-2.5 rounded-full transition-colors ${
                    theme === 'dark'
                      ? 'text-emerald-400 hover:bg-[#202c33]'
                      : 'text-emerald-600 hover:bg-slate-100'
                  }`}
                  title={`Call back with ${call.type}`}
                >
                  {call.type === 'video' ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <Phone className="w-5 h-5" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Button: Start New Call */}
      <div className="absolute bottom-5 right-5 z-20">
        <button
          onClick={() => setShowNewCallModal(true)}
          className="w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center justify-center active:scale-95 transition-transform"
          title="Start a Call"
        >
          <PhoneCall className="w-6 h-6" />
        </button>
      </div>

      {/* Start Call Contact Picker Modal */}
      {showNewCallModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-5 border shadow-2xl ${
              theme === 'dark'
                ? 'bg-[#111b21] border-slate-700 text-slate-100'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Start New Call</h3>
              <button
                onClick={() => setShowNewCallModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto divide-y divide-slate-800">
              {availableContacts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <p className="font-semibold text-slate-300 mb-1">
                    {language === 'ur' ? 'کوئی رابطہ موجود نہیں ہے' : 'No contacts available'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ur'
                      ? 'کال شروع کرنے کے لیے چیٹ اسکرین سے پہلے رابطہ شامل کریں۔'
                      : 'Add a contact from the Chats screen first to start voice or video calling.'}
                  </p>
                </div>
              ) : (
                availableContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="py-2.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{contact.name}</div>
                        <div className="text-[10px] font-mono text-emerald-400 truncate">
                          @{contact.username}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartCall(contact, 'voice')}
                        className="p-2 rounded-full text-emerald-400 hover:bg-emerald-500/10"
                        title="Voice Call"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStartCall(contact, 'video')}
                        className="p-2 rounded-full text-emerald-400 hover:bg-emerald-500/10"
                        title="Video Call"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
