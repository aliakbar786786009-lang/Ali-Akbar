import React, { useState, useRef } from 'react';
import { Plus, Camera, Edit3, X, Eye } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { StatusUpdate } from '../types';
import { StatusViewerModal } from './StatusViewerModal';

export const UpdatesTab: React.FC = () => {
  const { currentUser, statuses, addStatus, theme, language } = useChat();
  const [activeViewerStatus, setActiveViewerStatus] = useState<StatusUpdate | null>(null);
  const [showTextStatusCreator, setShowTextStatusCreator] = useState(false);
  const [textStatusContent, setTextStatusContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('from-teal-700 to-emerald-900');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gradients = [
    'from-teal-700 to-emerald-900',
    'from-purple-700 to-indigo-900',
    'from-rose-600 to-pink-900',
    'from-amber-600 to-orange-900',
    'from-slate-700 to-zinc-900',
  ];

  // My Status
  const myStatuses = statuses.filter((s) => s.userId === currentUser?.id);
  const contactStatuses = statuses.filter((s) => s.userId !== currentUser?.id);

  const handleCreateTextStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textStatusContent.trim()) return;
    addStatus('text', textStatusContent.trim(), undefined, selectedGradient);
    setTextStatusContent('');
    setShowTextStatusCreator(false);
  };

  const handlePhotoStatusUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addStatus('image', 'New Photo Story', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-6">
      {/* Hidden file input for photo status */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handlePhotoStatusUpload}
        className="hidden"
      />

      {/* Section: My Status */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {language === 'ur' ? 'میرا اسٹیٹس' : 'Status'}
        </div>

        <div className="flex items-center justify-between">
          <div
            onClick={() => {
              if (myStatuses.length > 0) {
                setActiveViewerStatus(myStatuses[0]);
              } else {
                setShowTextStatusCreator(true);
              }
            }}
            className="flex items-center gap-3 cursor-pointer group flex-1"
          >
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt="My status"
                className={`w-13 h-13 rounded-full object-cover p-0.5 ${
                  myStatuses.length > 0 ? 'ring-2 ring-emerald-500' : ''
                }`}
              />
              {myStatuses.length === 0 && (
                <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 border-2 border-[#111b21]">
                  <Plus className="w-3 h-3 font-bold" />
                </div>
              )}
            </div>

            <div>
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                {language === 'ur' ? 'میرا اسٹیٹس' : 'My Status'}
              </h3>
              <p className="text-xs text-slate-400">
                {myStatuses.length > 0
                  ? `${myStatuses[0].viewers.length} views • Tap to view`
                  : language === 'ur'
                  ? 'اسٹیٹس اپ ڈیٹ شامل کریں'
                  : 'Tap to add status update'}
              </p>
            </div>
          </div>

          {/* Quick Buttons for Text / Photo status */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTextStatusCreator(true)}
              title="Text Status"
              className={`p-2.5 rounded-full shadow-sm transition-colors ${
                theme === 'dark' ? 'bg-[#202c33] text-emerald-400 hover:bg-[#2a3942]' : 'bg-slate-100 text-emerald-600 hover:bg-slate-200'
              }`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Camera/Photo Status"
              className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Section: Recent Updates from Contacts */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {language === 'ur' ? 'حالیہ اپ ڈیٹس' : 'Recent Updates'}
        </div>

        {contactStatuses.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No recent updates from contacts</p>
        ) : (
          <div className="space-y-3">
            {contactStatuses.map((status) => (
              <button
                key={status.id}
                onClick={() => setActiveViewerStatus(status)}
                className={`w-full flex items-center gap-3 text-left p-2 rounded-xl transition-colors ${
                  theme === 'dark' ? 'hover:bg-[#202c33]/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="p-0.5 rounded-full ring-2 ring-emerald-500">
                  <img
                    src={status.userAvatar}
                    alt={status.userName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                    {status.userName}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {new Date(status.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text Status Creation Modal */}
      {showTextStatusCreator && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between text-white">
            <button
              onClick={() => setShowTextStatusCreator(false)}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Gradient Selector */}
            <div className="flex items-center gap-2">
              {gradients.map((grad) => (
                <button
                  key={grad}
                  onClick={() => setSelectedGradient(grad)}
                  className={`w-6 h-6 rounded-full bg-gradient-to-tr ${grad} border-2 ${
                    selectedGradient === grad ? 'border-white scale-110' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          <div
            className={`flex-1 flex items-center justify-center p-6 rounded-3xl bg-gradient-to-tr ${selectedGradient} my-6`}
          >
            <textarea
              autoFocus
              rows={4}
              maxLength={200}
              placeholder="Type a status..."
              value={textStatusContent}
              onChange={(e) => setTextStatusContent(e.target.value)}
              className="w-full bg-transparent text-white text-2xl sm:text-3xl font-bold text-center focus:outline-none placeholder:text-white/50 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreateTextStatus}
              className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl"
            >
              Post Status
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Status Viewer */}
      {activeViewerStatus && (
        <StatusViewerModal
          status={activeViewerStatus}
          onClose={() => setActiveViewerStatus(null)}
        />
      )}
    </div>
  );
};
