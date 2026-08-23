import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Delete, CornerDownLeft, User, Lock, Mail, Building } from 'lucide-react';
import { DBService } from '../services/dbService';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const LoginPage: React.FC = () => {
  const setAuth = useStore((state) => state.setAuth);

  // Portal tabs: 'admin' | 'staff'
  const [activePortal, setActivePortal] = useState<'admin' | 'staff'>('admin');
  
  // Staff Portal mode: 'signin' | 'signup'
  const [staffMode, setStaffMode] = useState<'signin' | 'signup'>('signin');

  // Common Admin PIN states
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // Staff Portal states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // --- ADMIN LOGIN SUBMIT ---
  const handleAdminSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter the administrator access code.');
      return;
    }

    setIsAdminLoading(true);
    try {
      const response = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Fallback for local offline demo mode
        if (password === '3639') {
          setAuth('demo_token', null, { username: 'Ernest', role: 'admin' });
          toast.success('Access code verified offline. Running in Demo Mode.');
          return;
        }
        toast.error(data.error || 'Incorrect access code. Please try again.');
        setIsAdminLoading(false);
        return;
      }

      setAuth(data.token, data.firebaseConfig, { username: 'Ernest', role: 'admin' });
      toast.success('Access code verified. Welcome back, Ernest.');
    } catch (error: any) {
      console.error('Login error:', error);
      if (password === '3639') {
        setAuth('demo_token', null, { username: 'Ernest', role: 'admin' });
        toast.success('Access code verified offline. Running in Demo Mode.');
        return;
      }
      toast.error('An error occurred during authentication. Please check your connection.');
      setIsAdminLoading(false);
    }
  };

  // Helper function to initialize database dynamic config
  const fetchDbService = async (wId: string): Promise<{ dbService: DBService; config: any; isDemo: boolean }> => {
    try {
      const response = await fetch('/.netlify/functions/verify_warehouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warehouseId: wId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid Warehouse ID');
      }

      const firebaseConfig = data.firebaseConfig;
      let app = null;
      let dbInstance = null;
      if (firebaseConfig && firebaseConfig.projectId) {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        dbInstance = getFirestore(app);
      }
      return { dbService: new DBService(dbInstance), config: firebaseConfig, isDemo: !dbInstance };
    } catch (err: any) {
      // Fallback for offline demo mode
      if (wId.trim().toUpperCase() === 'ERNEST') {
        return { dbService: new DBService(null), config: null, isDemo: true };
      }
      throw new Error(err.message || 'Verification failed. Please check internet connection.');
    }
  };

  // --- STAFF SUBMIT (SIGN IN OR SIGN UP) ---
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!warehouseId.trim()) {
      toast.error('Warehouse ID is required (e.g. ERNEST).');
      return;
    }
    if (!email.trim() || !staffPassword.trim()) {
      toast.error('Email and password are required.');
      return;
    }
    if (staffMode === 'signup' && !username.trim()) {
      toast.error('Username is required for new accounts.');
      return;
    }

    setIsStaffLoading(true);

    try {
      // 1. Verify warehouse ID and get DB Service
      const { dbService, config, isDemo } = await fetchDbService(warehouseId);

      if (staffMode === 'signin') {
        // 2. Sign In Check
        const user = await dbService.findUser(email);
        if (!user || user.password !== staffPassword) {
          toast.error('Invalid email or password.');
          setIsStaffLoading(false);
          return;
        }

        const token = isDemo ? 'demo_staff_token' : `staff_session_${btoa(email + '_salt')}`;
        setAuth(token, config, { username: user.username, email: user.email, role: user.role || 'viewer' });
        toast.success(`Welcome back, ${user.username}!`);
      } else {
        // 3. Sign Up Check
        const existing = await dbService.findUser(email);
        if (existing) {
          toast.error('This email is already registered.');
          setIsStaffLoading(false);
          return;
        }

        const newUser = {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password: staffPassword,
          role: 'viewer' as const
        };

        const createdUser = await dbService.createUser(newUser);
        const token = isDemo ? 'demo_staff_token' : `staff_session_${btoa(email + '_salt')}`;
        setAuth(token, config, { username: createdUser.username, email: createdUser.email, role: 'viewer' });
        toast.success(`Account registered! Welcome to the warehouse, ${createdUser.username}.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Staff authentication failed. Check credentials and try again.');
    } finally {
      setIsStaffLoading(false);
    }
  };

  // Keyboard helper click triggers (PIN Keypad)
  const handleKeypadPress = (num: string) => {
    if (password.length < 10) {
      setPassword(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPassword('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-obsidian py-12 px-4 relative overflow-hidden">
      {/* Decorative Elegant Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#c06c3c]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-[#c06c3c]/5 rounded-full pointer-events-none z-0"></div>

      {/* Spacer */}
      <div></div>

      {/* Center Safe Entry Card */}
      <div className="w-full max-w-sm glass-card bg-[#191715]/40 backdrop-blur-md rounded-3xl p-8 relative z-10 shadow-2xl border border-[#2b2724] animate-scaleUp">
        {/* Vintage Brand Header */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-[#2b2724] flex items-center justify-center shadow-inner mb-3.5 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-zinc-100 font-sans">
            Amir Stock <span className="text-[#c06c3c]">Manager</span>
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest mt-1.5 font-bold">
            Secure Warehouse Terminal
          </p>
        </div>

        {/* Portal Tabs */}
        <div className="flex border-b border-[#2b2724] mb-6">
          <button
            type="button"
            onClick={() => setActivePortal('admin')}
            className={`flex-1 pb-3 text-[10px] font-extrabold uppercase tracking-wider transition-all relative cursor-pointer text-center ${
              activePortal === 'admin' ? 'text-[#c06c3c]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Admin PIN
            {activePortal === 'admin' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c06c3c] rounded-full"></div>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActivePortal('staff')}
            className={`flex-1 pb-3 text-[10px] font-extrabold uppercase tracking-wider transition-all relative cursor-pointer text-center ${
              activePortal === 'staff' ? 'text-[#c06c3c]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Staff Portal
            {activePortal === 'staff' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c06c3c] rounded-full"></div>
            )}
          </button>
        </div>

        {/* PORTAL 1: ADMIN PIN TERMINAL */}
        {activePortal === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-wider text-center font-mono">
                Enter Administrator Access Pin
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  readOnly 
                  placeholder="••••"
                  value={password}
                  className="w-full bg-[#100e0d] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-2xl py-4 text-center font-mono text-2xl tracking-[0.4em] text-zinc-100 placeholder-zinc-800 outline-none transition-all duration-200 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="h-14 bg-zinc-950 border border-[#2b2724] hover:border-zinc-800 active:bg-zinc-900 text-zinc-300 hover:text-white rounded-2xl text-lg font-bold font-mono flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-[0.96]"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-14 bg-zinc-950/40 border border-[#2b2724]/40 hover:bg-zinc-900/60 active:bg-zinc-900 text-zinc-500 hover:text-zinc-350 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer active:scale-[0.96]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-14 bg-zinc-950 border border-[#2b2724] hover:border-zinc-800 active:bg-zinc-900 text-zinc-300 hover:text-white rounded-2xl text-lg font-bold font-mono flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-[0.96]"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-14 bg-zinc-950/40 border border-[#2b2724]/40 hover:bg-zinc-900/60 active:bg-zinc-900 text-zinc-500 hover:text-zinc-350 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-[0.96]"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={isAdminLoading || password.length === 0}
              className="w-full bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] font-extrabold rounded-2xl py-4 px-4 shadow-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {isAdminLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Unlocking Terminal...</span>
                </>
              ) : (
                <>
                  <CornerDownLeft className="w-4 h-4" />
                  <span>Verify Access Pin</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* PORTAL 2: STAFF PORTAL (EMAIL / PASSWORD) */}
        {activePortal === 'staff' && (
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            {/* Mode Switcher */}
            <div className="flex bg-[#100e0d] border border-[#2b2724] p-1.5 rounded-xl gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStaffMode('signin')}
                className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center ${
                  staffMode === 'signin' ? 'bg-[#c06c3c] text-white font-black' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setStaffMode('signup')}
                className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center ${
                  staffMode === 'signup' ? 'bg-[#c06c3c] text-white font-black' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Warehouse ID Field */}
            <div className="space-y-1.5">
              <label className="block text-zinc-550 text-[9px] font-bold uppercase tracking-wider font-mono">
                Warehouse ID (Tenant)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-550">
                  <Building className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. ERNEST"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full bg-[#100e0d] border border-[#2b2724] focus:border-[#c06c3c] rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-200 outline-none placeholder-zinc-700 uppercase"
                />
              </div>
            </div>

            {/* Username Field (Sign up only) */}
            {staffMode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-zinc-550 text-[9px] font-bold uppercase tracking-wider font-mono">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-550">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#100e0d] border border-[#2b2724] focus:border-[#c06c3c] rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-200 outline-none placeholder-zinc-700"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-zinc-550 text-[9px] font-bold uppercase tracking-wider font-mono">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-550">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="e.g. name@warehouse.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#100e0d] border border-[#2b2724] focus:border-[#c06c3c] rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-200 outline-none placeholder-zinc-700"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-zinc-550 text-[9px] font-bold uppercase tracking-wider font-mono">
                Preferred Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-550">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showStaffPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full bg-[#100e0d] border border-[#2b2724] focus:border-[#c06c3c] rounded-xl pl-10 pr-10 py-3 text-xs text-zinc-200 outline-none placeholder-zinc-700 tracking-[0.1em]"
                />
                <button
                  type="button"
                  onClick={() => setShowStaffPassword(!showStaffPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-550 hover:text-zinc-350 transition-colors"
                >
                  {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isStaffLoading}
              className="w-full bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] font-extrabold rounded-xl py-3.5 px-4 shadow-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
            >
              {isStaffLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{staffMode === 'signin' ? 'Sign In to Warehouse' : 'Register Account'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Styled Footer */}
      <footer className="text-center z-10 print:hidden">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
          &copy; {new Date().getFullYear()} Designed and created by Ernest
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
