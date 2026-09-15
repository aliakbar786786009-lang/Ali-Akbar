import React, { useState } from 'react';
import { ShieldAlert, Lock, Eye, EyeOff, X, ArrowRight, KeyRound, CheckCircle, AlertOctagon } from 'lucide-react';
import { verifyAdminPasscode, MASTER_ADMIN_EMAIL } from '../utils/adminAuth';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the security passcode');
      return;
    }

    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      if (verifyAdminPasscode(passcode)) {
        setIsVerifying(false);
        setPasscode('');
        onSuccess();
      } else {
        setIsVerifying(false);
        setError('Access Denied: Incorrect admin passcode');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[#070d12] border border-emerald-500/30 text-slate-100 shadow-[0_0_50px_-10px_rgba(16,185,129,0.2)] overflow-hidden relative">
        {/* Top Cyber Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 animate-pulse" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-5 text-center">
          {/* Futuristic Shield Icon with glowing ring */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-teal-900/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold mb-2">
              <span>SECURITY LEVEL 5 // RESTRICTED</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">
              Admin Terminal Access
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Authorized Account: <br />
              <span className="font-mono text-emerald-300 font-semibold">{MASTER_ADMIN_EMAIL}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Master Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  placeholder="Enter security passcode..."
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-10 py-3 bg-[#0d161d] border border-emerald-500/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm font-mono text-emerald-200 placeholder:text-slate-500 focus:outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                  <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-2 text-[11px] text-slate-400">
                Default Master Passcode: <span className="font-mono text-emerald-400">admin786</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <span>Verifying Biometric Key...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate & Launch Console</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
