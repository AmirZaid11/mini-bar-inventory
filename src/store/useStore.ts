import { create } from 'zustand';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DBService } from '../services/dbService';

interface AuthState {
  token: string | null;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabase: SupabaseClient | null;
  db: DBService;
  activeTab: 'dashboard' | 'inventory' | 'transactions' | 'shortages' | 'bulk_adjust' | 'audits';
  theme: 'dark' | 'light';
  setAuth: (token: string, supabaseUrl: string, supabaseAnonKey: string) => void;
  logout: () => void;
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'transactions' | 'shortages' | 'bulk_adjust' | 'audits') => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useStore = create<AuthState>((set, get) => {
  // Restore session from sessionStorage
  const savedToken = sessionStorage.getItem('amir_token');
  const savedUrl = sessionStorage.getItem('supabase_url');
  const savedKey = sessionStorage.getItem('supabase_key');
  let initialSupabase: SupabaseClient | null = null;
  
  if (savedToken && savedUrl && savedKey) {
    try {
      initialSupabase = createClient(savedUrl, savedKey);
    } catch (e) {
      console.error('Failed to initialize restored Supabase client', e);
    }
  }

  const initialDb = new DBService(initialSupabase);
  const savedTheme = (localStorage.getItem('amir_theme') as 'dark' | 'light') || 'dark';

  return {
    token: savedToken || null,
    supabaseUrl: savedUrl || null,
    supabaseAnonKey: savedKey || null,
    supabase: initialSupabase,
    db: initialDb,
    activeTab: 'dashboard',
    theme: savedTheme,

    setAuth: (token, supabaseUrl, supabaseAnonKey) => {
      sessionStorage.setItem('amir_token', token);
      sessionStorage.setItem('supabase_url', supabaseUrl);
      sessionStorage.setItem('supabase_key', supabaseAnonKey);
      
      let client: SupabaseClient | null = null;
      if (supabaseUrl && supabaseAnonKey) {
        try {
          client = createClient(supabaseUrl, supabaseAnonKey);
        } catch (e) {
          console.error('Failed to create Supabase client during login:', e);
        }
      }
      
      const dbService = new DBService(client);
      set({ token, supabaseUrl, supabaseAnonKey, supabase: client, db: dbService });
    },

    logout: () => {
      sessionStorage.removeItem('amir_token');
      sessionStorage.removeItem('supabase_url');
      sessionStorage.removeItem('supabase_key');
      const demoDb = new DBService(null);
      set({ token: null, supabaseUrl: null, supabaseAnonKey: null, supabase: null, db: demoDb, activeTab: 'dashboard' });
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
