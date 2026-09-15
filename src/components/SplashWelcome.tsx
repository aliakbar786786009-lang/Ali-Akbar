import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useChat } from '../context/ChatContext';

interface SplashWelcomeProps {
  onComplete?: () => void;
}

export const SplashWelcome: React.FC<SplashWelcomeProps> = ({ onComplete }) => {
  const { signIn, signUp, language, toggleLanguage } = useChat();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both Email and Password.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        const result = signUp(email.trim(), password);
        if (!result.success) {
          setErrorMsg(result.error || 'Sign up failed.');
          setIsLoading(false);
          return;
        }
        setSuccessMsg('Account created successfully! Loading profile setup...');
        setTimeout(() => {
          setIsLoading(false);
          onComplete?.();
        }, 500);
      } else {
        const result = signIn(email.trim(), password);
        if (!result.success) {
          setErrorMsg(result.error || 'Sign in failed. Check your email and password.');
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
        onComplete?.();
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a] text-white select-none overflow-y-auto p-4 sm:p-6">
      <div className="w-full max-w-md my-auto">
        {/* Language switch at top right */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
              End-to-End Encrypted
            </span>
          </div>
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-1 text-xs rounded-full bg-[#182229] border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1.5"
          >
            <span>🌐</span>
            <span>{language === 'ur' ? 'English' : 'اردو (Urdu)'}</span>
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-[#111b21] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/20">
          {/* Logo & Headline */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-3.5">
              <svg
                className="w-9 h-9 text-slate-950"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="9" cy="11" r="1.2" fill="currentColor" />
                <circle cx="12" cy="11" r="1.2" fill="currentColor" />
                <circle cx="15" cy="11" r="1.2" fill="currentColor" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">MyChat</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {language === 'ur'
                ? 'محفوظ اور تیز رفتار میسجنگ پلیٹ فارم۔'
                : 'Simple, private, and secure messaging with username-based privacy.'}
            </p>
          </div>

          {/* Mode Tabs: Sign In / Sign Up */}
          <div className="grid grid-cols-2 p-1 bg-[#202c33] rounded-xl mb-6">
            <button
              type="button"
              id="tab-btn-signin"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'signin'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ur' ? 'سائن اِن' : 'Sign In'}
            </button>
            <button
              type="button"
              id="tab-btn-signup"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'signup'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ur' ? 'نیا اکاؤنٹ بنائیں' : 'Sign Up'}
            </button>
          </div>

          {/* Error / Success Notifications */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Authentication Form (Two fields: Email & Password) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Email Address <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  id="auth-input-email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#202c33] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Password <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="auth-input-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#202c33] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Minimum 6 characters.</p>
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              id="auth-submit-button"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-50"
            >
              <span>
                {isLoading
                  ? authMode === 'signup'
                    ? 'Creating Account...'
                    : 'Signing In...'
                  : authMode === 'signup'
                  ? 'Sign Up & Continue'
                  : 'Sign In to MyChat'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Your email is strictly used for authentication and admin auditing. Other users can only search and identify you via your unique @username.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
