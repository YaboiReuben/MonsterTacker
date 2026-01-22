
export interface MonsterLog {
  id: string;
  flavor: string;
  timestamp: string; // ISO format
  notes?: string;
}

export interface Flavor {
  id: string;
  name: string;
  isCustom?: boolean;
}

export interface AppState {
  logs: MonsterLog[];
  flavors: Flavor[];
  isAdmin: boolean;
}
