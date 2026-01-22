
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const clickCount = useRef(0);
  const clickTimer = useRef<number | null>(null);

  const fetchData = useCallback(() => {
    setLogs(db.getLogs());
    setFlavors(db.getFlavors());
  }, []);

  useEffect(() => {
    fetchData();
    const unsubscribe = db.subscribe(fetchData);
    return () => unsubscribe();
  }, [fetchData]);

  const handleLogoClick = () => {
    clickCount.current += 1;
    
    // Clear existing timer
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    
    // Reset count if user stops clicking for 1 second
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
      alert('Access Denied');
    }
  };

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
            <h2 className="text-3xl font-monster text-white neon-text">Consumption Feed</h2>
            <p className="text-zinc-500 mt-1">Real-time tracker of fueled adventures</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-sm">
              <span className="text-zinc-500">Total: </span>
              <span className="font-bold text-[#71BE44]">{logs.length}</span>
            </div>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
              <i className="fa-solid fa-mug-hot text-4xl text-zinc-700"></i>
            </div>
            <h3 className="text-2xl font-bold text-zinc-300">No Monsters Tracked Yet</h3>
            <p className="text-zinc-500 mt-2 max-w-xs">Waiting for Reuben to crack open a cold one. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {logs.map(log => (
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

      <footer className="bg-black border-t border-zinc-900 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#71BE44] rounded flex items-center justify-center text-black font-black">M</div>
            <div>
              <p className="font-bold text-white leading-none">Monster Tracker</p>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest text-zinc-600">Fueled by Caffeine</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-zinc-600 text-sm flex items-center justify-center md:justify-end gap-2">
              <i className="fa-solid fa-database text-[#71BE44]"></i>
              This website uses Firebase Realtime Database
            </p>
            <p className="text-zinc-800 text-[10px] mt-2 uppercase tracking-[0.2em]">
              Handcrafted for Reuben • 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
