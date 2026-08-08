import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useStore } from './store/useStore';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { InventoryPage } from './components/InventoryPage';
import { TransactionsPage } from './components/TransactionsPage';
import { ShortagesPage } from './components/ShortagesPage';
import { BulkAdjustPage } from './components/BulkAdjustPage';
import { AuditsPage } from './components/AuditsPage';
import { format } from 'date-fns';
import { 
  LayoutDashboard, 
  Boxes, 
  History, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Wine,
  AlertTriangle,
  ListChecks,
  Sun,
  Moon,
  ClipboardList
} from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const HeaderBar: React.FC = () => {
  const toggleTheme = useStore((state) => state.toggleTheme);
  const theme = useStore((state) => state.theme);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#282421] pb-4 mb-6 print:hidden gap-3">
      <div className="min-w-0">
        <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Warehouse Dashboard • Active Session</p>
        <h2 className="text-sm font-bold text-zinc-100 mt-0.5">Welcome back, Ernest</h2>
      </div>
      <div className="flex items-center gap-4">
        {/* Live Date / Time */}
        <div className="text-right text-xs font-mono text-zinc-500 bg-[#181615] border border-[#2b2724] px-3.5 py-1.5 rounded-xl">
          {format(time, 'yyyy-MM-dd HH:mm:ss')}
        </div>
        {/* Clean Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Color Scheme"
          className="p-2 hover:bg-[#23201e] border border-[#2b2724] hover:border-zinc-800 rounded-xl text-zinc-400 hover:text-[#c06c3c] transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const token = useStore((state) => state.token);
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const logout = useStore((state) => state.logout);
  const initTheme = useStore((state) => state.initTheme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize theme class
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // If not authenticated, force login screen
  if (!token) {
    return <LoginPage />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory Hub', icon: Boxes },
    { id: 'bulk_adjust', label: 'Bulk Adjust', icon: ListChecks },
    { id: 'shortages', label: 'Shortages List', icon: AlertTriangle },
    { id: 'audits', label: 'Discrepancy Audits', icon: ClipboardList },
    { id: 'transactions', label: 'Audit Log', icon: History },
  ] as const;

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'bulk_adjust':
        return <BulkAdjustPage />;
      case 'shortages':
        return <ShortagesPage />;
      case 'audits':
        return <AuditsPage />;
      case 'transactions':
        return <TransactionsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-zinc-100 flex flex-col md:flex-row relative">
      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#191715] border-b border-[#282421] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Wine className="w-5 h-5 text-[#c06c3c]" />
          <span className="font-extrabold text-md tracking-tight">Amir Warehouse</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-zinc-400 hover:text-white rounded-lg focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* SIDEBAR SIDE PANEL */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#191715] md:bg-[#191715] border-r border-[#282421] p-6 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-[#c06c3c] flex items-center justify-center shadow-sm">
              <Wine className="w-4.5 h-4.5 text-[#faf8f5]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[#faf8f5]">
              Amir Warehouse
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer
                    ${isActive 
                      ? 'bg-[#23201e] text-[#c06c3c] border border-[#2e2a27]' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#23201e]/60'
                    }
                  `}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="space-y-4 pt-6 border-t border-[#282421]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center">
              <User className="w-4 h-4 text-[#c06c3c]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-300 truncate">Ernest</p>
              <p className="text-[10px] text-zinc-500 truncate">Warehouse Admin</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
        ></div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 md:h-screen md:overflow-y-auto px-6 py-8 md:px-10">
        <div className="max-w-6xl mx-auto pb-10">
          <HeaderBar />
          {renderActivePage()}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster position="top-right" theme="dark" closeButton />
    </QueryClientProvider>
  );
}
