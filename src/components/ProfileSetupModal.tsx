import React, { useState, useRef } from 'react';
import { Camera, Check, AlertCircle, Sparkles, ArrowRight, User as UserIcon, Shield, RefreshCw } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { validateUsernameFormat } from '../utils/userAuth';

export const ProfileSetupModal: React.FC = () => {
  const { currentUser, completeProfileSetup, checkUsernameAvailable, suggestUsernames } = useChat();

  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || 'Hey there! I am using MyChat.');
  const [avatar, setAvatar] = useState(
    currentUser?.avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser?.email || 'mychat')}`
  );
  const [usernameError, setUsernameError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time username validation
  const handleUsernameChange = (val: string) => {
    // strip spaces and leading @
    const clean = val.toLowerCase().replace(/\s+/g, '_').replace(/^@+/, '');
    setUsername(clean);
    setGeneralError('');

    if (!clean) {
      setUsernameError('Username is required.');
      setSuggestions([]);
      return;
    }

    const formatCheck = validateUsernameFormat(clean);
    if (!formatCheck.isValid) {
      setUsernameError(formatCheck.error || 'Invalid username format.');
      setSuggestions([]);
      return;
    }

    // Check if taken (excluding own user id)
    const isAvailable = checkUsernameAvailable(clean, currentUser?.id);
    if (!isAvailable) {
      setUsernameError(
        `Username already taken. Please try adding numbers or characters (e.g., ${clean}123 or ${clean}_ali).`
      );
      setSuggestions(suggestUsernames(clean));
    } else {
      setUsernameError('');
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggested: string) => {
    setUsername(suggested);
    setUsernameError('');
    setSuggestions([]);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setGeneralError('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setGeneralError('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateNewAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9);
    setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!displayName.trim()) {
      setGeneralError('Please enter your display name.');
      return;
    }

    if (!username.trim()) {
      setUsernameError('Please choose a unique username.');
      return;
    }

    const formatCheck = validateUsernameFormat(username);
    if (!formatCheck.isValid) {
      setUsernameError(formatCheck.error || 'Invalid username format.');
      return;
    }

    const isAvailable = checkUsernameAvailable(username, currentUser?.id);
    if (!isAvailable) {
      setUsernameError(
        `Username already taken. Please try adding numbers or characters (e.g., ${username}123 or ${username}_ali).`
      );
      setSuggestions(suggestUsernames(username));
      return;
    }

    setIsSubmitting(true);
    const result = completeProfileSetup({
      name: displayName.trim(),
      username: username.trim(),
      avatar,
      bio: bio.trim(),
    });

    if (!result.success) {
      setGeneralError(result.error || 'Failed to complete profile setup.');
      setIsSubmitting(false);
    }
  };

  const isUsernameValid = username.length >= 3 && !usernameError;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b141a]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#111b21] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 relative my-8">
        {/* Header decoration */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Complete Your Profile</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Setup your display identity and choose a unique username. Other users will connect with you using your username.
          </p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar / Profile Picture Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={avatar}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500/60 shadow-xl bg-slate-800"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center hover:bg-emerald-400 shadow-md transition-transform active:scale-95"
                title="Upload Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="flex items-center gap-3 mt-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Upload Photo
              </button>
              <span className="text-slate-600 text-xs">•</span>
              <button
                type="button"
                onClick={handleGenerateNewAvatar}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Randomize Avatar</span>
              </button>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Display Name <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                maxLength={40}
                placeholder="e.g. Ali Akbar"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-[#202c33] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Unique Username */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Unique Username <span className="text-emerald-400">*</span>
              </label>
              {isUsernameValid && (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Available
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                @
              </span>
              <input
                type="text"
                required
                maxLength={24}
                placeholder="choose_username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={`w-full pl-8 pr-3 py-2.5 bg-[#202c33] border rounded-xl text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none transition-colors ${
                  usernameError
                    ? 'border-rose-500 focus:border-rose-400'
                    : isUsernameValid
                    ? 'border-emerald-500/80 focus:border-emerald-400'
                    : 'border-slate-700/80 focus:border-emerald-500'
                }`}
              />
            </div>

            {/* Username Error Notification with exact specified error text */}
            {usernameError && (
              <div className="mt-1.5 text-xs text-rose-400 leading-relaxed flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{usernameError}</span>
              </div>
            )}

            {/* Smart Suggestions Chips */}
            {suggestions.length > 0 && (
              <div className="mt-2.5">
                <span className="text-[11px] text-slate-400 block mb-1.5">Available suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono hover:bg-emerald-900/60 transition-colors"
                    >
                      @{sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Usernames must be unique. Only letters, numbers, dots, and underscores allowed.
            </p>
          </div>

          {/* Bio / About */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">About / Bio</label>
            <textarea
              rows={2}
              maxLength={120}
              placeholder="Hey there! I am using MyChat."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-[#202c33] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Your Gmail address ({currentUser?.email}) will remain 100% private and invisible to all regular users.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !displayName.trim() || !isUsernameValid}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.99]"
          >
            <span>{isSubmitting ? 'Saving Profile...' : 'Complete Profile & Enter MyChat'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
