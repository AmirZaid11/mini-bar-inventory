import { create } from 'zustand';
import { initializeApp, getApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { DBService } from '../services/dbService';

interface AuthState {
  token: string | null;
  firebaseConfig: string | null;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  db: DBService;
  activeTab: 'dashboard' | 'inventory' | 'transactions' | 'shortages' | 'bulk_adjust' | 'audits';
  theme: 'dark' | 'light';
  setAuth: (token: string, firebaseConfig: any) => void;
  logout: () => void;
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'transactions' | 'shortages' | 'bulk_adjust' | 'audits') => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useStore = create<AuthState>((set, get) => {
  // Restore session from localStorage
  const savedToken = localStorage.getItem('amir_token');
  const savedConfigStr = localStorage.getItem('firebase_config');
  let initialApp: FirebaseApp | null = null;
  let initialFirestore: Firestore | null = null;
  
  if (savedToken && savedConfigStr) {
    try {
      const config = JSON.parse(savedConfigStr);
      if (config && config.projectId) {
        initialApp = getApps().length === 0 ? initializeApp(config) : getApp();
        initialFirestore = getFirestore(initialApp);
      }
    } catch (e) {
      console.error('Failed to initialize restored Firebase client', e);
    }
  }

  const initialDb = new DBService(initialFirestore);
  const savedTheme = (localStorage.getItem('amir_theme') as 'dark' | 'light') || 'dark';

  return {
    token: savedToken || null,
    firebaseConfig: savedConfigStr || null,
    firebaseApp: initialApp,
    firestore: initialFirestore,
    db: initialDb,
    activeTab: 'dashboard',
    theme: savedTheme,

    setAuth: (token, firebaseConfig) => {
      const configStr = JSON.stringify(firebaseConfig);
      localStorage.setItem('amir_token', token);
      localStorage.setItem('firebase_config', configStr);
      
      let app: FirebaseApp | null = null;
      let dbInstance: Firestore | null = null;
      if (firebaseConfig && firebaseConfig.projectId) {
        try {
          app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
          dbInstance = getFirestore(app);
        } catch (e) {
          console.error('Failed to create Firebase client during login:', e);
        }
      }
      
      const dbService = new DBService(dbInstance);
      set({ token, firebaseConfig: configStr, firebaseApp: app, firestore: dbInstance, db: dbService });
    },

    logout: () => {
      localStorage.removeItem('amir_token');
      localStorage.removeItem('firebase_config');
      const demoDb = new DBService(null);
      set({ token: null, firebaseConfig: null, firebaseApp: null, firestore: null, db: demoDb, activeTab: 'dashboard' });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),

    toggleTheme: () => {
      const currentTheme = get().theme;
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      localStorage.setItem('amir_theme', nextTheme);
      
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      set({ theme: nextTheme });
    },

    initTheme: () => {
      const currentTheme = get().theme;
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
});
