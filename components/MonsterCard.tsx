import React, { useState, useEffect } from 'react';
import { MonsterLog } from '../types';

interface MonsterCardProps {
  log: MonsterLog;
}

const MonsterCard: React.FC<MonsterCardProps> = ({ log }) => {
  const date = new Date(log.timestamp);
  const [isRecent, setIsRecent] = useState(false);

  useEffect(() => {
    const checkIfRecent = () => {
      const now = new Date();
      const diffMinutes = (now.getTime() - date.getTime()) / 60000;
      setIsRecent(diffMinutes >= 0 && diffMinutes < 60); // Highlight if added in the last hour
    };

    checkIfRecent();
    const interval = setInterval(checkIfRecent, 30000);
    return () => clearInterval(interval);
  }, [log.timestamp]);
  
  const getBadgeColor = (flavor: string) => {
    const f = flavor.toLowerCase();
    if (f.includes('ultra')) return 'border-white text-white bg-white/5';
    if (f.includes('java')) return 'border-[#5C4033] text-[#D2B48C] bg-[#5C4033]/5';
    if (f.includes('juice')) return 'border-orange-500 text-orange-500 bg-orange-500/5';
    if (f.includes('rehab')) return 'border-yellow-400 text-yellow-400 bg-yellow-400/5';
    return 'border-[#71BE44] text-[#71BE44] bg-[#71BE44]/5';
  };

  return (
    <div className={`group bg-zinc-900 border ${isRecent ? 'border-[#71BE44]' : 'border-zinc-800'} p-5 rounded-2xl hover:border-[#71BE44] transition-all duration-500 hover:transform hover:scale-[1.02] shadow-lg flex flex-col justify-between relative overflow-hidden`}>
      {isRecent && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-[#71BE44] text-black text-[8px] font-black uppercase rounded-full animate-pulse z-10">
          <i className="fa-solid fa-bolt-lightning text-[6px]"></i>
          Real-time New
        </div>
      )}

      <div>
        <div className={`inline-block px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase mb-4 ${getBadgeColor(log.flavor)}`}>
          {log.flavor.split(' ')[0]}
        </div>
        <h3 className="text-xl font-bold leading-tight mb-2 text-zinc-100 group-hover:text-[#71BE44] transition-colors">
          {log.flavor}
        </h3>
      </div>
      
      <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Logged</span>
          <span className="text-xs font-semibold text-zinc-300">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Time</span>
          <span className="text-xs font-semibold text-[#71BE44]">{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

export default MonsterCard;