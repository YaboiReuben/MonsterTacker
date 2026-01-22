
import React from 'react';

interface HeaderProps {
  onLogoClick: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, isAdmin, onToggleAdmin }) => {
  return (
    <header className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl w-full mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            onClick={onLogoClick}
            className="group relative cursor-pointer select-none"
          >
            <div className="w-12 h-12 bg-black border-2 border-[#71BE44] rounded-xl flex items-center justify-center transform transition-transform group-active:scale-95 neon-border">
              <i className="fa-solid fa-bolt-lightning text-[#71BE44] text-2xl group-hover:animate-pulse"></i>
            </div>
            {/* Hidden hint for devs/admins */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#71BE44] rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </div>
          
          <div>
            <h1 className="text-xl md:text-2xl font-monster font-black text-white leading-none uppercase tracking-tighter">
              Reuben's <span className="text-[#71BE44]">Monster</span> Tracker
            </h1>
            <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest mt-1">Track every Monster you've had</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <button 
              onClick={onToggleAdmin}
              className="bg-[#71BE44]/10 border border-[#71BE44]/30 text-[#71BE44] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#71BE44]/20 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-user-shield"></i>
              Admin Panel
            </button>
          )}
          
          {!isAdmin && (
            <div className="hidden sm:flex items-center gap-2 text-zinc-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Live Syncing</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
