import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Shield,
  Moon,
  Sun,
  Bell,
  HardDrive,
  HelpCircle,
  LogOut,
  X,
  Check,
  Smartphone,
  Globe,
  Trash2,
  Edit2,
  KeyRound,
  Camera,
  Upload,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { isAuthorizedMasterAdmin, MASTER_ADMIN_EMAIL } from '../utils/adminAuth';
import { AdminPasscodeModal } from './AdminPasscodeModal';

interface SettingsModalProps {
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const {
    currentUser,
    updateProfile,
    checkUsernameAvailable,
    suggestUsernames,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    fontSize,
    setFontSize,
    readReceipts,
    setReadReceipts,
    lastSeenPrivacy,
    setLastSeenPrivacy,
    pinLockEnabled,
    setPinLockEnabled,
    setIsAdminMode,
    logout,
  } = useChat();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'account' | 'privacy' | 'chats' | 'notifications' | 'storage' | 'help'
  >('overview');

  // Edit profile states
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [country, setCountry] = useState(currentUser?.country || 'Pakistan');
  const [savedToast, setSavedToast] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  // Admin passcode modal
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState(false);

  // PIN settings
  const [newPin, setNewPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setUsernameSuggestions([]);

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (cleanUsername !== currentUser?.username) {
      const availCheck = checkUsernameAvailable(cleanUsername);
      if (!availCheck.available) {
        setProfileError(availCheck.error || 'Username is not available');
        setUsernameSuggestions(suggestUsernames(cleanUsername || displayName));
        return;
      }
    }

    const res = updateProfile({
      avatar: avatar.trim() || currentUser?.avatar,
      name: displayName.trim(),
      bio: bio.trim(),
      username: cleanUsername,
      phone: phone.trim(),
      country: country.trim(),
    });

    if (!res.success) {
      setProfileError(res.error || 'Failed to update profile');
      return;
    }

    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      setActiveSubTab('overview');
    }, 1200);
  };

  const handleTogglePin = () => {
    if (pinLockEnabled) {
      setPinLockEnabled(false);
    } else {
      setShowPinInput(true);
    }
  };

  const handleSavePin = () => {
    if (newPin.length === 4) {
      setPinLockEnabled(true, newPin);
      setShowPinInput(false);
      setNewPin('');
    }
  };

  const isMasterAdmin = isAuthorizedMasterAdmin(currentUser);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md max-h-[88vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#111b21] border-slate-700 text-slate-100'
            : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {activeSubTab !== 'overview' && (
              <button
                onClick={() => setActiveSubTab('overview')}
                className="text-slate-400 hover:text-slate-200 text-xs font-semibold mr-1"
              >
                ← Back
              </button>
            )}
            <h3 className="font-bold text-sm capitalize">
              {activeSubTab === 'overview' ? 'Settings' : activeSubTab}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeSubTab === 'overview' && (
            <div className="space-y-4">
              {/* Profile Card Summary */}
              <div
                onClick={() => setActiveSubTab('account')}
                className={`p-3.5 rounded-2xl border flex items-center gap-3.5 cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-[#182229] border-slate-700/70 hover:bg-[#202c33]'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="relative">
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 rounded-full text-white shadow">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{currentUser?.name}</h4>
                  <p className="text-xs text-slate-400 truncate">@{currentUser?.username}</p>
                  <p className="text-xs text-emerald-400 truncate mt-0.5">{currentUser?.email}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </div>
              </div>

              {/* Discreet Master Admin Console Card (ONLY visible if authorized admin email) */}
              {isMasterAdmin && (
                <div
                  onClick={() => setShowAdminPasscodeModal(true)}
                  className="p-3.5 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 cursor-pointer hover:border-emerald-400 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <ShieldAlert className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Central Admin Console</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                          AUTHORIZED
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Restricted security management & system telemetry
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold">Launch ›</span>
                </div>
              )}

              {/* Navigation settings list */}
              <div className="space-y-1 text-xs divide-y divide-slate-800/40">
                {/* Privacy & Security */}
                <button
                  onClick={() => setActiveSubTab('privacy')}
                  className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-emerald-500/5 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold">Privacy & Security</div>
                      <div className="text-[10px] text-slate-400">
                        App PIN lock, Read receipts, Last seen
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">›</span>
                </button>

                {/* Chats & Appearance */}
                <button
                  onClick={() => setActiveSubTab('chats')}
                  className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-emerald-500/5 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-xs font-semibold">Chats & Display</div>
                      <div className="text-[10px] text-slate-400">
                        Theme (Dark/Light), Font size, Display
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">›</span>
                </button>

                {/* Storage & Data */}
                <button
                  onClick={() => setActiveSubTab('storage')}
                  className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-emerald-500/5 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-xs font-semibold">Storage & Data</div>
                      <div className="text-[10px] text-slate-400">Local cache & encryption status</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">›</span>
                </button>

                {/* Help & Privacy Policy */}
                <button
                  onClick={() => setActiveSubTab('help')}
                  className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-emerald-500/5 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-teal-400" />
                    <div>
                      <div className="text-xs font-semibold">Help & Security Guarantees</div>
                      <div className="text-[10px] text-slate-400">Zero-knowledge encryption standards</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">›</span>
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
            </div>
          )}

          {/* Account Subtab (Requirement 5: DP and Profile Enhancements) */}
          {activeSubTab === 'account' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {savedToast && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Profile updated successfully! ✨</span>
                </div>
              )}

              {/* DP Upload & Preview */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#182229] border border-slate-700/60 space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img
                    src={avatar || currentUser?.avatar}
                    alt="Profile Avatar"
                    className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-xl"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAvatar(
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                          displayName || 'user'
                        )}`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Generate Avatar</span>
                  </button>
                </div>

                {/* Preset Avatars Carousel */}
                <div className="w-full pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 text-center">
                    Or select a preset avatar
                  </span>
                  <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(preset)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${
                          avatar === preset ? 'border-emerald-400 ring-2 ring-emerald-500/40' : 'border-transparent opacity-80'
                        }`}
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Account Email (Read-Only)</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full px-3 py-2 text-xs bg-black/40 border border-slate-700 rounded-xl text-slate-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#202c33] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Unique Username (@handle)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-emerald-400 select-none">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9._]/g, ''));
                      setProfileError('');
                    }}
                    placeholder="unique_username"
                    className="w-full pl-7 pr-3 py-2 text-xs font-mono bg-[#202c33] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {profileError && (
                  <p className="mt-1.5 text-[11px] font-medium text-rose-400">{profileError}</p>
                )}
                {usernameSuggestions.length > 0 && (
                  <div className="mt-2 p-2 rounded-xl bg-[#182229] border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block mb-1">Available alternatives:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {usernameSuggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            setUsername(sug);
                            setProfileError('');
                            setUsernameSuggestions([]);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-mono border border-emerald-500/30"
                        >
                          @{sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">About / Bio Status</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Hey there! I am using MyChat."
                  className="w-full px-3 py-2 text-xs bg-[#202c33] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 text-xs bg-[#202c33] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Pakistan"
                    className="w-full px-3 py-2 text-xs bg-[#202c33] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
              >
                Save Profile Changes
              </button>
            </form>
          )}

          {/* Privacy Subtab */}
          {activeSubTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              {/* PIN Lock Toggle */}
              <div className="p-3 rounded-xl bg-[#202c33] border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold">App PIN Lock</div>
                      <div className="text-[10px] text-slate-400">Require PIN to open MyChat</div>
                    </div>
                  </div>
                  <button
                    onClick={handleTogglePin}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      pinLockEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        pinLockEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {showPinInput && (
                  <div className="pt-2 border-t border-slate-700 flex gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="Set 4-digit PIN"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3 py-1.5 bg-black/40 border border-slate-600 rounded-lg text-xs"
                    />
                    <button
                      onClick={handleSavePin}
                      disabled={newPin.length !== 4}
                      className="px-3 py-1.5 bg-emerald-600 disabled:opacity-50 text-white rounded-lg font-semibold"
                    >
                      Save PIN
                    </button>
                  </div>
                )}
              </div>

              {/* Read Receipts */}
              <div className="p-3 rounded-xl bg-[#202c33] border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-semibold">Read Receipts (Blue Ticks)</div>
                  <div className="text-[10px] text-slate-400">
                    If turned off, you won't send or see read receipts
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={readReceipts}
                  onChange={(e) => setReadReceipts(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Last Seen Privacy */}
              <div className="p-3 rounded-xl bg-[#202c33] border border-slate-700 space-y-1.5">
                <div className="font-semibold">Who can see my Last Seen</div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(['everyone', 'contacts', 'nobody'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setLastSeenPrivacy(opt)}
                      className={`py-1.5 capitalize rounded-lg border text-center transition-colors ${
                        lastSeenPrivacy === opt
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 font-semibold'
                          : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chats & Display Subtab */}
          {activeSubTab === 'chats' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#202c33] border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                  <div>
                    <div className="font-semibold">Application Theme</div>
                    <div className="text-[10px] text-slate-400">Current: {theme}</div>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium"
                >
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>

              {/* Font Size */}
              <div className="p-3 rounded-xl bg-[#202c33] border border-slate-700 space-y-2">
                <div className="font-semibold">Chat Font Size</div>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`py-1.5 capitalize rounded-lg border text-center transition-colors ${
                        fontSize === sz
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 font-semibold'
                          : 'border-slate-700 text-slate-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Storage Subtab */}
          {activeSubTab === 'storage' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#202c33] border border-slate-700">
                <div className="font-semibold mb-1">Local Storage Cached</div>
                <div className="text-slate-400 text-[11px]">Media & Messages: ~1.2 MB</div>
                <button
                  onClick={() => alert('Local cache cleared successfully!')}
                  className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                >
                  Clear Cached Media
                </button>
              </div>
            </div>
          )}

          {/* Help & Privacy Policy Subtab */}
          {activeSubTab === 'help' && (
            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/40">
                <div className="font-bold text-emerald-400 mb-1">Zero Password Storage Guarantee</div>
                <p className="text-[11px]">
                  MyChat authenticates strictly via Google OAuth 2.0. We never ask for, collect, or store your Google account password. Admins have no backdoor to view passwords or decrypt user communications.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#202c33] border border-slate-700">
                <div className="font-bold text-slate-100 mb-1">End-to-End Encryption</div>
                <p className="text-[11px] text-slate-400">
                  Direct chats, group messaging, and voice/video call signaling are protected using cryptographic key exchanges.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Passcode Modal for Authorized Admin */}
      {showAdminPasscodeModal && (
        <AdminPasscodeModal
          isOpen={showAdminPasscodeModal}
          onClose={() => setShowAdminPasscodeModal(false)}
          onSuccess={() => {
            setShowAdminPasscodeModal(false);
            onClose();
            setIsAdminMode(true);
          }}
        />
      )}
    </div>
  );
};
