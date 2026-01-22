
import React from 'react';
import { MonsterLog } from '../types';

interface MonsterCardProps {
  log: MonsterLog;
}

const MonsterCard: React.FC<MonsterCardProps> = ({ log }) => {
  const date = new Date(log.timestamp);
  
  // Deterministic color helper based on flavor name
  const getBadgeColor = (flavor: string) => {
    if (flavor.toLowerCase().includes('ultra')) return 'border-white text-white bg-white/5';
    if (flavor.toLowerCase().includes('java')) return 'border-[#5C4033] text-[#D2B48C] bg-[#5C4033]/5';
    if (flavor.toLowerCase().includes('juice')) return 'border-orange-500 text-orange-500 bg-orange-500/5';
    if (flavor.toLowerCase().includes('rehab')) return 'border-yellow-400 text-yellow-400 bg-yellow-400/5';
    return 'border-[#71BE44] text-[#71BE44] bg-[#71BE44]/5';
  };

  return (
    <div className="group bg-zinc-900 border border-zinc-800 p-5 rounded-2xl hover:border-[#71BE44]/50 transition-all duration-300 hover:transform hover:scale-[1.02] shadow-lg flex flex-col justify-between">
      <div>
        <div className={`inline-block px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase mb-4 ${getBadgeColor(log.flavor)}`}>
          {log.flavor.split(' ')[0]}
        </div>
        <h3 className="text-xl font-bold leading-tight mb-2 text-zinc-100 group-hover:text-[#71BE44] transition-colors">
          {log.flavor}
        </h3>
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 uppercase tracking-tighter">Consumed On</span>
          <span className="text-sm font-semibold text-zinc-300">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs text-zinc-500 uppercase tracking-tighter">At Time</span>
          <span className="text-sm font-semibold text-[#71BE44]">{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

export default MonsterCard;
