import React, { useState } from 'react';
import { Search, UserPlus, Users, X, MessageSquare, Plus, Sparkles, User as UserIcon, AlertCircle, Check } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { User, Chat } from '../types';
import { normalizeUsername } from '../utils/userAuth';

interface NewChatModalProps {
  onClose: () => void;
  onSelectChat: (chat: Chat) => void;
  initialMode?: 'chat' | 'group' | 'contact';
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  onClose,
  onSelectChat,
  initialMode = 'contact',
}) => {
  const {
    users,
    currentUser,
    createChat,
    createGroup,
    addContactByUsername,
    theme,
    language,
  } = useChat();

  const otherContacts = users.filter(
    (u) => u.id !== currentUser?.id && u.isProfileCompleted
  );

  const [mode, setMode] = useState<'contact' | 'chat' | 'group'>(
    otherContacts.length === 0 ? 'contact' : initialMode
  );

  // Search by username
  const [usernameSearch, setUsernameSearch] = useState('');
  const [addUsernameInput, setAddUsernameInput] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group states
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  // Filter contacts strictly by username or display name (NO email)
  const filteredContacts = otherContacts.filter((u) => {
    const cleanQuery = usernameSearch.trim().toLowerCase().replace(/^@+/, '');
    const cleanUsername = (u.username || '').toLowerCase();
    const cleanName = (u.name || '').toLowerCase();
    return cleanUsername.includes(cleanQuery) || cleanName.includes(cleanQuery);
  });

  const handleStartDirectChat = (user: User) => {
    const chat = createChat(user.id);
    onSelectChat(chat);
    onClose();
  };

  const handleAddByUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const clean = normalizeUsername(addUsernameInput);
    if (!clean) {
      setFormError('Please enter a username to search.');
      return;
    }

    if (currentUser?.username && normalizeUsername(currentUser.username) === clean) {
      setFormError('You cannot add your own username as a contact.');
      return;
    }

    setIsSubmitting(true);
    const result = addContactByUsername(clean);

    if (!result.success) {
      setFormError(result.error || `No user found with username @${clean}.`);
      setIsSubmitting(false);
      return;
    }

    setFormSuccess(`Connected with @${clean}! Opening chat...`);
    setTimeout(() => {
      if (result.chat) {
        onSelectChat(result.chat);
      }
      onClose();
    }, 400);
  };

  const handleToggleSelectUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    } else {
      setSelectedUserIds((prev) => [...prev, userId]);
    }
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUserIds.length === 0) return;
    const groupChat = createGroup(groupName.trim(), selectedUserIds, groupDescription.trim());
    onSelectChat(groupChat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col ${
          theme === 'dark'
            ? 'bg-[#111b21] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">
              {mode === 'contact'
                ? language === 'ur'
                  ? 'یوزرنیم سے رابطہ تلاش کریں'
                  : 'Add Contact by Username'
                : mode === 'group'
                ? language === 'ur'
                  ? 'نیا گروپ بنائیں'
                  : 'Create New Group'
                : language === 'ur'
                ? 'رابطے منتخب کریں'
                : 'Select Contact'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Way Mode Switcher */}
        <div className="p-2 border-b border-slate-800/60 flex gap-1.5 bg-black/10">
          <button
            type="button"
            onClick={() => {
              setMode('contact');
              setFormError('');
              setFormSuccess('');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'contact'
                ? 'bg-emerald-600 text-white shadow'
                : theme === 'dark'
                ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'یوزرنیم تلاش' : 'Find by @Username'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('chat')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'chat'
                ? 'bg-emerald-600 text-white shadow'
                : theme === 'dark'
                ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>
              {language === 'ur' ? 'رابطے' : 'Contacts'} ({otherContacts.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode('group')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'group'
                ? 'bg-emerald-600 text-white shadow'
                : theme === 'dark'
                ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'نیا گروپ' : '+ Group'}</span>
          </button>
        </div>

        {/* MODE 1: SEARCH & ADD BY UNIQUE USERNAME ONLY */}
        {mode === 'contact' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-xs text-emerald-400 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {language === 'ur'
                  ? 'صارفین کی پرائیویسی کے تحفظ کے لیے، رابطے صرف ان کے منفرد @یوزرنیم کے ذریعے تلاش اور شامل کیے جا سکتے ہیں۔'
                  : 'For privacy, users can only be discovered and added via their Unique @Username. Gmail addresses remain completely private.'}
              </span>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddByUsernameSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Enter Unique Username <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="username"
                    value={addUsernameInput}
                    onChange={(e) => {
                      setAddUsernameInput(e.target.value);
                      setFormError('');
                      setFormSuccess('');
                    }}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#202c33] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ask your friend or colleague for their MyChat @username.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !addUsernameInput.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{isSubmitting ? 'Searching...' : 'Find User & Start Chat'}</span>
              </button>
            </form>

            {/* Existing contacts quick picker */}
            {otherContacts.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                  Already in your contacts
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {otherContacts.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleStartDirectChat(user)}
                      className="p-2 rounded-xl bg-[#202c33]/70 hover:bg-[#202c33] border border-slate-700/40 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-200 truncate">
                            {user.name}
                          </div>
                          <div className="text-[11px] font-mono text-emerald-400 truncate">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">Chat &rarr;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: CONTACTS DIRECTORY (USERNAME ONLY, NO EMAIL) */}
        {mode === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search by username input */}
            <div className="p-3 border-b border-slate-800/40">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by @username or name..."
                  value={usernameSearch}
                  onChange={(e) => setUsernameSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#202c33] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center mb-2">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">No contacts found</p>
                  <p className="text-[11px] text-slate-400 mt-1 mb-3">
                    Search someone by their unique @username to start messaging!
                  </p>
                  <button
                    onClick={() => setMode('contact')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Find by @Username</span>
                  </button>
                </div>
              ) : (
                filteredContacts.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleStartDirectChat(user)}
                    className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      theme === 'dark' ? 'hover:bg-[#202c33]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold flex items-center gap-1.5 truncate">
                          <span className="truncate">{user.name}</span>
                          {user.role === 'business' && (
                            <span className="text-[9px] bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded font-bold shrink-0">
                              Business
                            </span>
                          )}
                        </div>
                        {/* Display ONLY username, strictly no email */}
                        <div className="text-[11px] font-mono text-emerald-400 truncate">
                          @{user.username}
                        </div>
                        {user.bio && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {user.bio}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartDirectChat(user);
                      }}
                      className="px-2.5 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-colors font-medium ml-2 shrink-0"
                    >
                      Chat
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MODE 3: CREATE NEW GROUP */}
        {mode === 'group' && (
          <form onSubmit={handleCreateGroupSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 space-y-3 border-b border-slate-800">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Group Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project Discussion"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#202c33] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Group purpose or guidelines"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#202c33] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="text-[11px] font-semibold text-slate-300">
                Select Participants ({selectedUserIds.length} selected)
              </div>
            </div>

            {/* Selectable participants */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {otherContacts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No contacts available yet. Add contacts by username first!
                </div>
              ) : (
                otherContacts.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleToggleSelectUser(user.id)}
                      className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer border transition-colors ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500/60'
                          : 'bg-[#182229] border-transparent hover:bg-[#202c33]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-200 truncate">
                            {user.name}
                          </div>
                          {/* ONLY username, strictly NO email */}
                          <div className="text-[10px] font-mono text-emerald-400 truncate">
                            @{user.username}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-slate-800">
              <button
                type="submit"
                disabled={!groupName.trim() || selectedUserIds.length === 0}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Create Group ({selectedUserIds.length} Members)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
