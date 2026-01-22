import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, push, remove, update, Database } from "firebase/database";
import { MonsterLog, Flavor } from '../types';
import { INITIAL_FLAVORS } from '../constants';

const firebaseConfig = {
  apiKey: process.env.API_KEY, 
  authDomain: "reubens-monster-tracker.firebaseapp.com",
  databaseURL: "https://reubens-monster-tracker-default-rtdb.firebaseio.com",
  projectId: "reubens-monster-tracker",
  storageBucket: "reubens-monster-tracker.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const fireDb: Database = getDatabase(app);

class FirebaseDB {
  private logs: MonsterLog[] = [];
  private flavors: Flavor[] = [];
  private connected: boolean = false;
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Monitor Connection Status
      const connectedRef = ref(fireDb, '.info/connected');
      onValue(connectedRef, (snap) => {
        this.connected = snap.val() === true;
        this.notify();
      });

      // Real-time Logs Sync
      const logsRef = ref(fireDb, 'logs');
      onValue(logsRef, (snapshot) => {
        const data = snapshot.val();
        this.logs = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        this.notify();
      });

      // Real-time Flavors Sync
      const flavorsRef = ref(fireDb, 'flavors');
      onValue(flavorsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          this.flavors = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        } else {
          this.seedFlavors();
        }
        this.notify();
      });
    } catch (error) {
      console.error("Firebase Database Initialization Error:", error);
    }
  }

  private seedFlavors() {
    const flavorsRef = ref(fireDb, 'flavors');
    INITIAL_FLAVORS.forEach(name => {
      push(flavorsRef, { name, isCustom: false });
    });
  }

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  // API Methods
  getLogs() { return this.logs; }
  getFlavors() { return this.flavors; }
  isConnected() { return this.connected; }

  addLog(log: Omit<MonsterLog, 'id'>) {
    push(ref(fireDb, 'logs'), log);
  }

  deleteLog(id: string) {
    remove(ref(fireDb, `logs/${id}`));
  }

  updateLog(id: string, log: Partial<MonsterLog>) {
    update(ref(fireDb, `logs/${id}`), log);
  }

  addFlavor(name: string) {
    push(ref(fireDb, 'flavors'), { name, isCustom: true });
  }

  updateFlavor(id: string, newName: string) {
    const oldFlavor = this.flavors.find(f => f.id === id);
    if (!oldFlavor) return;
    
    update(ref(fireDb, `flavors/${id}`), { name: newName });
    
    // Cascade update to logs using this flavor
    this.logs.forEach(log => {
      if (log.flavor === oldFlavor.name) {
        update(ref(fireDb, `logs/${log.id}`), { flavor: newName });
      }
    });
  }

  deleteFlavor(id: string) {
    remove(ref(fireDb, `flavors/${id}`));
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
}

export const db = new FirebaseDB();