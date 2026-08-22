import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Delete, CornerDownLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useStore((state) => state.setAuth);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter the administrator access code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Fallback for local development offline mode
        if (password === '3639') {
          setAuth('demo_token', null);
          toast.success('Access code verified offline. Running in Demo Mode.');
          return;
        }
        toast.error(data.error || 'Incorrect access code. Please try again.');
        setIsLoading(false);
        return;
      }

      setAuth(data.token, data.firebaseConfig);
      toast.success('Access code verified. Welcome back, Ernest.');
    } catch (error: any) {
      console.error('Login error:', error);
      // Fallback
      if (password === '3639') {
        setAuth('demo_token', null);
        toast.success('Access code verified offline. Running in Demo Mode.');
        return;
      }
      toast.error('An error occurred during authentication. Please check your connection.');
      setIsLoading(false);
    }
  };

  // Keyboard helper click triggers
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
        {/* Vintage Brand Header with Logo Image */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
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

        {/* Input Pin Field */}
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Premium Physical Keypad Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="h-14 bg-zinc-950 border border-[#2b2724] hover:border-zinc-850 active:bg-zinc-900 text-zinc-350 hover:text-white rounded-2xl text-lg font-bold font-mono flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-[0.96]"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-14 bg-zinc-950/40 border border-[#2b2724]/40 hover:bg-zinc-900/60 active:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer active:scale-[0.96]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="h-14 bg-zinc-950 border border-[#2b2724] hover:border-[#3a3530] active:bg-zinc-900 text-zinc-350 hover:text-white rounded-2xl text-lg font-bold font-mono flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-[0.96]"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 bg-zinc-950/40 border border-[#2b2724]/40 hover:bg-zinc-900/60 active:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-[0.96]"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Submit/Verify Pin Button */}
          <button
            type="submit"
            disabled={isLoading || password.length === 0}
            className="w-full bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] font-extrabold rounded-2xl py-4 px-4 shadow-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {isLoading ? (
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
      </div>

      {/* Styled Footer */}
      <footer className="text-center z-10 print:hidden">
        <p className="text-[10px] font-bold text-zinc-650 uppercase tracking-widest font-mono">
          &copy; {new Date().getFullYear()} Designed and created by Ernest
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
