
import React, { useState, useEffect, useRef } from 'react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-zinc-900 border-2 border-[#71BE44] w-full max-w-sm p-8 rounded-[2rem] shadow-[0_0_50px_rgba(113,190,68,0.15)] relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#71BE44]/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-[#71BE44]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#71BE44]/20">
            <i className="fa-solid fa-user-secret text-[#71BE44] text-2xl"></i>
          </div>
          <h2 className="font-monster text-white text-xl uppercase tracking-tighter mb-2">Identify Yourself</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-8">Verification Required for Reuben</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-2xl p-4 text-white text-center focus:outline-none focus:border-[#71BE44] transition-all placeholder:text-zinc-700"
            />
            
            <div className="grid grid-cols-1 gap-2 pt-2">
              <button
                type="submit"
                className="w-full px-4 py-4 rounded-2xl bg-[#71BE44] text-black hover:bg-[#5a9b36] transition-all font-black uppercase tracking-widest shadow-[0_4px_20px_rgba(113,190,68,0.3)] active:scale-95"
              >
                AUTHORIZE
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-3 rounded-xl text-zinc-600 hover:text-zinc-400 transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                Abort Access
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
