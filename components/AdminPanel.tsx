
import React, { useState } from 'react';
import { db } from '../services/db';
import { Flavor, MonsterLog } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  flavors: Flavor[];
  logs: MonsterLog[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, flavors, logs }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'flavors'>('logs');
  const [flavor, setFlavor] = useState('');
  const [datetime, setDatetime] = useState(new Date().toISOString().slice(0, 16));
  const [newFlavorName, setNewFlavorName] = useState('');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  // Flavor Editing State
  const [editingFlavorId, setEditingFlavorId] = useState<string | null>(null);
  const [editingFlavorName, setEditingFlavorName] = useState('');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flavor) return alert('Please select a flavor.');
    
    if (editingLogId) {
      db.updateLog(editingLogId, { flavor, timestamp: new Date(datetime).toISOString() });
      setEditingLogId(null);
    } else {
      db.addLog({
        flavor,
        timestamp: new Date(datetime).toISOString(),
      });
    }
    setFlavor('');
    setDatetime(new Date().toISOString().slice(0, 16));
  };

  const handleAddFlavor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlavorName.trim()) return;
    db.addFlavor(newFlavorName.trim());
    setNewFlavorName('');
  };

  const handleSaveFlavorEdit = (id: string) => {
    if (!editingFlavorName.trim()) return;
    db.updateFlavor(id, editingFlavorName.trim());
    setEditingFlavorId(null);
  };

  const handleEditLog = (log: MonsterLog) => {
    setEditingLogId(log.id);
    setFlavor(log.flavor);
    setDatetime(new Date(log.timestamp).toISOString().slice(0, 16));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <div className="min-h-screen flex items-start justify-center p-4 pt-10">
        <div className="bg-zinc-900 border border-zinc-800 w-full max-w-5xl p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative mb-10">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all hover:rotate-90"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>

          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#71BE44] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">Master Control</span>
              <h2 className="text-3xl font-monster text-white uppercase tracking-tighter">Reuben's Dashboard</h2>
            </div>
            
            <nav className="flex gap-4 mt-6 border-b border-zinc-800">
              <button 
                onClick={() => setActiveTab('logs')}
                className={`pb-4 px-2 font-bold text-sm uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'text-[#71BE44] border-b-2 border-[#71BE44]' : 'text-zinc-500 hover:text-white'}`}
              >
                Consumption Logs
              </button>
              <button 
                onClick={() => setActiveTab('flavors')}
                className={`pb-4 px-2 font-bold text-sm uppercase tracking-widest transition-all ${activeTab === 'flavors' ? 'text-[#71BE44] border-b-2 border-[#71BE44]' : 'text-zinc-500 hover:text-white'}`}
              >
                Flavor Library
              </button>
            </nav>
          </header>

          {activeTab === 'logs' ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-left duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-zinc-800/40 p-6 rounded-3xl border border-zinc-800">
                  <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-white uppercase tracking-tight">
                    <i className="fa-solid fa-plus-circle text-[#71BE44]"></i>
                    {editingLogId ? 'Modify Record' : 'Log Daily Dose'}
                  </h3>
                  <form onSubmit={handleAddLog} className="space-y-4">
                    <select 
                      value={flavor}
                      onChange={(e) => setFlavor(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-[#71BE44] outline-none"
                    >
                      <option value="">Choose your flavor...</option>
                      {flavors.map(f => (
                        <option key={f.id} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                    <input 
                      type="datetime-local" 
                      value={datetime}
                      onChange={(e) => setDatetime(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-[#71BE44] outline-none"
                    />
                    <div className="flex gap-3">
                      <button type="submit" className="flex-1 bg-[#71BE44] text-black font-black py-4 rounded-2xl hover:bg-[#5a9b36] transition-all">
                        {editingLogId ? 'UPDATE LOG' : 'LOG MONSTER'}
                      </button>
                      {editingLogId && (
                        <button type="button" onClick={() => setEditingLogId(null)} className="px-6 bg-zinc-700 rounded-2xl font-bold text-xs uppercase text-white">Cancel</button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="bg-zinc-800/40 p-6 rounded-3xl border border-zinc-800">
                  <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-white uppercase tracking-tight">
                    <i className="fa-solid fa-chart-line text-[#71BE44]"></i>
                    Quick Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50 text-center">
                      <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Total Logs</p>
                      <p className="text-2xl font-monster text-[#71BE44]">{logs.length}</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50 text-center">
                      <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Flavors</p>
                      <p className="text-2xl font-monster text-[#71BE44]">{flavors.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-3xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-zinc-900 border-b border-zinc-800">
                    <tr>
                      <th className="p-5 text-[10px] uppercase font-black text-zinc-500">Flavor</th>
                      <th className="p-5 text-[10px] uppercase font-black text-zinc-500">Timestamp</th>
                      <th className="p-5 text-[10px] uppercase font-black text-zinc-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-zinc-800/10 transition-colors group">
                        <td className="p-5 font-bold text-zinc-200">{log.flavor}</td>
                        <td className="p-5 text-sm text-zinc-500 font-mono">
                          {new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td className="p-5 text-right space-x-2">
                          <button onClick={() => handleEditLog(log)} className="p-2 text-zinc-500 hover:text-[#71BE44]"><i className="fa-solid fa-pen-to-square"></i></button>
                          <button onClick={() => db.deleteLog(log.id)} className="p-2 text-zinc-500 hover:text-red-500"><i className="fa-solid fa-trash"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-right duration-300">
              <div className="bg-zinc-800/40 p-6 rounded-3xl border border-zinc-800">
                <h3 className="text-lg font-bold mb-5 text-white uppercase tracking-tight">Register New Flavor</h3>
                <form onSubmit={handleAddFlavor} className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="e.g. Monster Nitro Cosmic Peaches"
                    value={newFlavorName}
                    onChange={(e) => setNewFlavorName(e.target.value)}
                    className="flex-1 bg-black border border-zinc-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-[#71BE44] outline-none"
                  />
                  <button type="submit" className="bg-[#71BE44] text-black font-black px-8 rounded-2xl hover:bg-[#5a9b36] transition-all">ADD</button>
                </form>
              </div>

              <div className="bg-black/30 rounded-3xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-zinc-900 border-b border-zinc-800">
                    <tr>
                      <th className="p-5 text-[10px] uppercase font-black text-zinc-500">Registered Flavor Name</th>
                      <th className="p-5 text-[10px] uppercase font-black text-zinc-500 text-right">Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {flavors.map(f => (
                      <tr key={f.id} className="hover:bg-zinc-800/10 transition-colors">
                        <td className="p-5">
                          {editingFlavorId === f.id ? (
                            <input 
                              type="text"
                              value={editingFlavorName}
                              onChange={(e) => setEditingFlavorName(e.target.value)}
                              autoFocus
                              className="bg-zinc-800 border border-[#71BE44] rounded-lg px-3 py-1 text-white w-full max-w-md outline-none"
                              onBlur={() => handleSaveFlavorEdit(f.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveFlavorEdit(f.id)}
                            />
                          ) : (
                            <span className="font-bold text-zinc-200">{f.name}</span>
                          )}
                        </td>
                        <td className="p-5 text-right space-x-2">
                          <button 
                            onClick={() => {
                              setEditingFlavorId(f.id);
                              setEditingFlavorName(f.name);
                            }} 
                            className="p-2 text-zinc-500 hover:text-blue-400"
                            title="Edit Spelling"
                          >
                            <i className="fa-solid fa-spell-check"></i>
                          </button>
                          <button onClick={() => { if(confirm('Delete this flavor and its history?')) db.deleteFlavor(f.id) }} className="p-2 text-zinc-500 hover:text-red-500">
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
