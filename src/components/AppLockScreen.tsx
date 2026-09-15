import React, { useState } from 'react';
import { Lock, Delete, AlertCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export const AppLockScreen: React.FC = () => {
  const { unlockApp, currentUser } = useChat();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = unlockApp(nextPin);
          if (!success) {
            setError(true);
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b141a] text-white flex flex-col items-center justify-between p-8 select-none">
      <div className="flex flex-col items-center mt-12">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">MyChat Locked</h2>
        <p className="text-xs text-slate-400 mt-1">Enter your 4-digit security PIN to unlock</p>

        {/* PIN dots */}
        <div className="flex items-center gap-4 mt-8">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                index < pin.length
                  ? 'bg-emerald-400 border-emerald-400 scale-110'
                  : 'border-slate-600 bg-transparent'
              } ${error ? 'border-rose-500 bg-rose-500/30 animate-shake' : ''}`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-3">
            <AlertCircle className="w-4 h-4" />
            <span>Incorrect PIN code. Try again.</span>
          </div>
        )}
      </div>

      {/* Number Pad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-4 mb-8">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="w-18 h-18 mx-auto rounded-full bg-[#182229] border border-slate-700/60 hover:bg-[#22303a] active:scale-95 text-2xl font-bold flex items-center justify-center transition-all shadow"
          >
            {digit}
          </button>
        ))}

        <div />

        <button
          onClick={() => handleDigit('0')}
          className="w-18 h-18 mx-auto rounded-full bg-[#182229] border border-slate-700/60 hover:bg-[#22303a] active:scale-95 text-2xl font-bold flex items-center justify-center transition-all shadow"
        >
          0
        </button>

        <button
          onClick={handleDelete}
          className="w-18 h-18 mx-auto rounded-full bg-[#182229] border border-slate-700/60 hover:bg-[#22303a] active:scale-95 text-slate-300 flex items-center justify-center transition-all shadow"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
