import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter the administrator password.');
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
        // Fallback if the Netlify Functions returns 404 or fails, but user input is correct
        if (password === '3639') {
          setAuth('demo_token', '', '');
          toast.success('Offline verification successful. Running in Demo Mode.');
          return;
        }
        toast.error(data.error || 'Authentication failed. Please check the password.');
        setIsLoading(false);
        return;
      }

      setAuth(data.token, data.supabaseUrl, data.supabaseAnonKey);
      toast.success('Access granted. Welcome back, Amir.');
    } catch (error: any) {
      console.error('Login error:', error);
      // Fallback if functions offline
      if (password === '3639') {
        setAuth('demo_token', '', '');
        toast.success('Offline verification successful. Running in Demo Mode.');
        return;
      }
      toast.error('An error occurred during authentication. Please check your connection.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-obsidian px-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10 shadow-lg border border-[#282421]">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-center shadow-inner mb-4 group hover:border-[#c06c3c]/50 transition-all duration-300">
            <Lock className="w-5 h-5 text-zinc-400 group-hover:text-[#c06c3c] transition-colors" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#faf8f5] flex items-center gap-1.5 font-sans">
            Amir Stock <span className="text-accent-ochre font-extrabold">Warehouse</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1.5 font-mono">
            SECURED DATABASE • SYSTEM PORTAL
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="password">
              Admin Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter access code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-650 transition-all duration-200 outline-none pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] font-bold rounded-xl py-3 px-4 shadow-sm active:translate-y-[1px] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-zinc-200" />
                <span>Authorizing Security Key...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Verify Access Code</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-zinc-900/60 pt-6">
          <p className="text-zinc-600 text-[11px] font-mono">
            SECURE SYSTEM • IPS PROTECTED
          </p>
        </div>
      </div>
    </div>
  );
};
