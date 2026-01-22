import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import MonsterCard from './components/MonsterCard';
import AdminPanel from './components/AdminPanel';
import PasswordModal from './components/PasswordModal';
import { db } from './services/db';
import { MonsterLog, Flavor } from './types';

const App: React.FC = () => {
  const [logs, setLogs] = useState<MonsterLog[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const clickCount = useRef(0);
  const clickTimer = useRef<number | null>(null);

  const fetchData = useCallback(() => {
    setLogs(db.getLogs());
    setFlavors(db.getFlavors());
    setIsConnected(db.isConnected());
  }, []);

  useEffect(() => {
    fetchData();
    const unsubscribe = db.subscribe(fetchData);
    return () => {
      unsubscribe();
    };
  }, [fetchData]);

  const handleLogoClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => {
      clickCount.current = 0;
    }, 1000);

    if (clickCount.current >= 3) {
      setShowPasswordModal(true);
      clickCount.current = 0;
    }
  };

  const handlePasswordSubmit = (password: string) => {
    if (password === 'monster') {
      setIsAdmin(true);
      setShowAdminPanel(true);
      setShowPasswordModal(false);
    } else {
      alert('Access Denied: Incorrect Password');
    }
  };

  // Sort logs by newest first for the display
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header 
        onLogoClick={handleLogoClick} 
        isAdmin={isAdmin} 
        onToggleAdmin={() => setShowAdminPanel(true)} 
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#71BE44] animate-pulse' : 'bg-zinc-700'}`}></span>
              <p className="text-zinc-500 text-xs uppercase font-bold tracking-[0.2em]">
                {isConnected ? 'Live Feed Active' : 'Connecting...'}
              </p>
            </div>
            <h2 className="text-4xl font-monster text-white neon-text uppercase tracking-tighter">Reuben's Feed</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
              <span className="text-zinc-500 text-xs uppercase font-black tracking-widest">Total Fuel</span>
              <span className="font-monster text-3xl text-[#71BE44] leading-none">{logs.length}</span>
            </div>
          </div>
        </div>

        {sortedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
            <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800 animate-bounce">
              <i className="fa-solid fa-bolt text-[#71BE44] text-4xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-zinc-300 uppercase tracking-tight">Zero Activity Detected</h3>
            <p className="text-zinc-500 mt-2 max-w-xs text-sm">Waiting for Reuben to crack open a fresh can. All updates will appear here in real-time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedLogs.map(log => (
              <MonsterCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </main>

      {showAdminPanel && (
        <AdminPanel 
          onClose={() => setShowAdminPanel(false)} 
          flavors={flavors}
          logs={logs}
        />
      )}

      <PasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
      />

      <footer className="bg-black border-t border-zinc-900 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#71BE44] rounded-xl flex items-center justify-center text-black font-black text-2xl shadow-[0_0_20px_rgba(113,190,68,0.3)]">R</div>
            <div>
              <p className="font-monster text-lg text-white leading-none uppercase tracking-tighter">Reuben's <span className="text-[#71BE44]">Monster</span></p>
              <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest font-bold">Official Consumption Log Station</p>
            </div>
          </div>

          <div className="text-center md:text-right space-y-2">
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center md:justify-end gap-2">
              <i className="fa-solid fa-cloud-bolt text-[#71BE44]"></i>
              Real-time synchronization active
            </p>
            <p className="text-zinc-800 text-[9px] uppercase tracking-[0.3em] font-black">
              Property of Reuben • All Rights Reserved 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;