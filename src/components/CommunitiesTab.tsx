import React, { useState } from 'react';
import { Building2, Users, Plus, ChevronRight, Bell, Shield, X } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export const CommunitiesTab: React.FC = () => {
  const { chats, currentUser, createCommunity, theme, language } = useChat();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [commName, setCommName] = useState('');
  const [commDesc, setCommDesc] = useState('');
  const [channels, setChannels] = useState(['General Discussions', 'Project Updates']);

  // Filter community chats
  const communities = chats.filter((c) => c.type === 'community');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName.trim()) return;
    createCommunity(commName.trim(), commDesc.trim(), channels);
    setCommName('');
    setCommDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-6">
      {/* Intro banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
          theme === 'dark' ? 'bg-[#182229] border-slate-700/60' : 'bg-emerald-50 border-emerald-200'
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
            {language === 'ur' ? 'کمیونٹیز بنائیں اور جوڑیں' : 'Stay connected with a Community'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Communities bring related groups together. Easily organize topic channels and broadcast announcements.
          </p>
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>{language === 'ur' ? 'نئی کمیونٹی بنائیں' : 'New Community'}</span>
      </button>

      {/* Existing Communities List */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {language === 'ur' ? 'آپ کی کمیونٹیز' : 'Your Communities'} ({communities.length})
        </div>

        <div className="space-y-4">
          {communities.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-700/60 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-300">
                {language === 'ur' ? 'ابھی کوئی کمیونٹی نہیں ہے' : 'No communities created yet'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                {language === 'ur'
                  ? 'اپنے محلے، اسکول یا کام کی جگہ کے مختلف گروپس کو ایک کمیونٹی کے تحت یکجا کریں۔'
                  : 'Organize your related neighborhood, school, or work groups in one centralized space.'}
              </p>
            </div>
          ) : (
            communities.map((comm) => (
              <div
                key={comm.id}
                className={`rounded-2xl border overflow-hidden p-4 ${
                  theme === 'dark'
                    ? 'bg-[#182229] border-[#222e35]'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800/60">
                  <img
                    src={comm.avatar}
                    alt={comm.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                      {comm.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{comm.description}</p>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      {comm.participants.length} members
                    </span>
                  </div>
                </div>

                {/* Community Channels */}
                <div className="mt-3 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    Channels
                  </div>
                  {comm.communityChannels?.map((chan) => (
                    <div
                      key={chan.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-[#202c33] hover:bg-[#2a3942] text-slate-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {chan.isAnnouncement ? (
                          <Bell className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span className="font-medium">{chan.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl ${
              theme === 'dark'
                ? 'bg-[#111b21] border-slate-700 text-slate-100'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Create New Community</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Community Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flutter & Android Developers"
                  value={commName}
                  onChange={(e) => setCommName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#202c33] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="What is this community about?"
                  value={commDesc}
                  onChange={(e) => setCommDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#202c33] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
                >
                  Create Community
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
