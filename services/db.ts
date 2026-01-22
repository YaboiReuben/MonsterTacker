
import { MonsterLog, Flavor } from '../types';
import { INITIAL_FLAVORS } from '../constants';

const LOGS_KEY = 'monster_tracker_logs';
const FLAVORS_KEY = 'monster_tracker_flavors';
const DB_UPDATE_EVENT = 'monster_db_update';

class MockDB {
  private notify() {
    window.dispatchEvent(new CustomEvent(DB_UPDATE_EVENT));
  }

  getLogs(): MonsterLog[] {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
  }

  addLog(log: Omit<MonsterLog, 'id'>): string {
    const logs = this.getLogs();
    const newLog = { ...log, id: Math.random().toString(36).substr(2, 9) };
    logs.unshift(newLog);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    this.notify();
    return newLog.id;
  }

  updateLog(id: string, updatedLog: Partial<MonsterLog>): void {
    const logs = this.getLogs();
    const index = logs.findIndex(l => l.id === id);
    if (index !== -1) {
      logs[index] = { ...logs[index], ...updatedLog };
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
      this.notify();
    }
  }

  deleteLog(id: string): void {
    const logs = this.getLogs();
    const filtered = logs.filter(l => l.id !== id);
    localStorage.setItem(LOGS_KEY, JSON.stringify(filtered));
    this.notify();
  }

  getFlavors(): Flavor[] {
    const data = localStorage.getItem(FLAVORS_KEY);
    if (!data) {
      const initial = INITIAL_FLAVORS.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name,
        isCustom: false
      }));
      localStorage.setItem(FLAVORS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  addFlavor(name: string): void {
    const flavors = this.getFlavors();
    if (flavors.some(f => f.name.toLowerCase() === name.toLowerCase())) return;
    
    flavors.push({
      id: Math.random().toString(36).substr(2, 9),
      name,
      isCustom: true
    });
    localStorage.setItem(FLAVORS_KEY, JSON.stringify(flavors));
    this.notify();
  }

  updateFlavor(id: string, newName: string): void {
    const flavors = this.getFlavors();
    const index = flavors.findIndex(f => f.id === id);
    if (index !== -1) {
      const oldName = flavors[index].name;
      flavors[index].name = newName;
      localStorage.setItem(FLAVORS_KEY, JSON.stringify(flavors));

      // Cascade update to all logs that use this flavor name
      const logs = this.getLogs();
      const updatedLogs = logs.map(log => 
        log.flavor === oldName ? { ...log, flavor: newName } : log
      );
      localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
      
      this.notify();
    }
  }

  deleteFlavor(id: string): void {
    const flavors = this.getFlavors();
    const filtered = flavors.filter(f => f.id !== id);
    localStorage.setItem(FLAVORS_KEY, JSON.stringify(filtered));
    this.notify();
  }

  subscribe(callback: () => void) {
    window.addEventListener(DB_UPDATE_EVENT, callback);
    return () => window.removeEventListener(DB_UPDATE_EVENT, callback);
  }
}

export const db = new MockDB();
