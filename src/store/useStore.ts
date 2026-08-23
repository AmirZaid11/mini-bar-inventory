import { create } from 'zustand';
import { initializeApp, getApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { DBService } from '../services/dbService';

export interface UserProfile {
  username: string;
  email?: string;
  role: 'admin' | 'viewer';
}

interface AuthState {
  token: string | null;
  firebaseConfig: string | null;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  db: DBService;
  activeTab: 'dashboard' | 'inventory' | 'transactions' | 'shortages' | 'bulk_adjust' | 'audits';
  theme: 'dark' | 'light';
  user: UserProfile | null;
  telegramBotToken: string | null;
  telegramChatId: string | null;
  enableTelegramAlerts: boolean;
  setAuth: (token: string, firebaseConfig: any, user: UserProfile) => void;
  logout: () => void;
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'transactions' | 'shortages' | 'bulk_adjust' | 'audits') => void;
  toggleTheme: () => void;
  initTheme: () => void;
  setTelegramSettings: (token: string, chatId: string, enabled: boolean) => void;
}

export const useStore = create<AuthState>((set, get) => {
  // Restore session from localStorage
  const savedToken = localStorage.getItem('amir_token');
  const savedConfigStr = localStorage.getItem('firebase_config');
  const savedUserStr = localStorage.getItem('amir_user_profile');
  let initialApp: FirebaseApp | null = null;
  let initialFirestore: Firestore | null = null;
  let initialUser: UserProfile | null = null;

  if (savedUserStr) {
    try {
      initialUser = JSON.parse(savedUserStr);
    } catch (e) {
      console.error('Failed to parse saved user profile', e);
    }
  }
  
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

  // Restore Telegram configurations
  const savedTelegramToken = localStorage.getItem('amir_telegram_token');
  const savedTelegramChatId = localStorage.getItem('amir_telegram_chat_id');
  const savedTelegramEnabled = localStorage.getItem('amir_telegram_enabled') === 'true';

  return {
    token: savedToken || null,
    firebaseConfig: savedConfigStr || null,
    firebaseApp: initialApp,
    firestore: initialFirestore,
    db: initialDb,
    activeTab: 'dashboard',
    theme: savedTheme,
    user: initialUser,
    telegramBotToken: savedTelegramToken || null,
    telegramChatId: savedTelegramChatId || null,
    enableTelegramAlerts: savedTelegramEnabled,

    setAuth: (token, firebaseConfig, user) => {
      const configStr = JSON.stringify(firebaseConfig);
      localStorage.setItem('amir_token', token);
      localStorage.setItem('firebase_config', configStr);
      localStorage.setItem('amir_user_profile', JSON.stringify(user));
      
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
      set({ token, firebaseConfig: configStr, firebaseApp: app, firestore: dbInstance, db: dbService, user });
    },

    logout: () => {
      localStorage.removeItem('amir_token');
      localStorage.removeItem('firebase_config');
      localStorage.removeItem('amir_user_profile');
      const demoDb = new DBService(null);
      set({ token: null, firebaseConfig: null, firebaseApp: null, firestore: null, db: demoDb, activeTab: 'dashboard', user: null });
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
    },

    setTelegramSettings: (token, chatId, enabled) => {
      localStorage.setItem('amir_telegram_token', token);
      localStorage.setItem('amir_telegram_chat_id', chatId);
      localStorage.setItem('amir_telegram_enabled', enabled ? 'true' : 'false');
      set({ telegramBotToken: token || null, telegramChatId: chatId || null, enableTelegramAlerts: enabled });
    }
  };
});
