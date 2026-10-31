import React, { useState } from 'react';
import { Car, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

export const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('dealer@autify.com');
  const [password, setPassword] = useState('autify2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    onLogin({
      id: 'usr-01',
      name: 'John Doe',
      email: email.trim(),
      role: 'Fleet Manager & Auction Specialist',
      dealership: 'Autify Motors LLC (Miami, FL)',
      avatarInitials: 'JD'
    }, rememberMe);
  };

  const handleQuickDemoAccess = () => {
    setEmail('dealer@autify.com');
    setPassword('autify2026');
    setIsLoading(true);

    onLogin({
      id: 'usr-01',
      name: 'John Doe',
      email: 'dealer@autify.com',
      role: 'Fleet Manager & Auction Specialist',
      dealership: 'Autify Motors LLC (Miami, FL)',
      avatarInitials: 'JD'
    }, true);
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative selection:bg-emerald-500/20 selection:text-emerald-400">
      
      {/* Background ambient lighting (subtle industrial glow) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card - Strict Anti-IA Rule: Unified surface, NO border-t-4 or border-l-4 */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#141619] shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-3">
            <img
              src="/images/autify-logo.png"
              alt="Autify"
              className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            />
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Acceso al Sistema de Arbitraje y Taller de Reacondicionamiento
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email / User */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Correo Corporativo / Dealer ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operaciones@dealer.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#1E2025] border border-white/5 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Contraseña / PIN
              </label>
              <button
                type="button"
                onClick={() => alert('Para este demo usa la contraseña por defecto: autify2026')}
                className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                ¿Olvidaste tu PIN?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#1E2025] border border-white/5 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono tracking-wider transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#1E2025] border-white/10 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0 focus:ring-1 transition-all"
              />
              <span className="text-xs text-slate-400">
                Mantener sesión en este dispositivo
              </span>
            </label>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 shadow-glow-emerald active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Verificando credenciales...</span>
              </span>
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

        </form>

        {/* 1-Click Quick Demo Box */}
        <div className="mt-6 pt-5 border-t border-white/[0.06]">
          <div className="rounded-xl bg-[#1E2025] border border-white/5 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Acceso Rápido de Prueba (Demo)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                1-Click
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ingresa instantáneamente como <span className="text-slate-200 font-semibold font-mono">Fleet Manager</span> con datos precargados.
            </p>

            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="w-full py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Entrar como Administrador Demo</span>
            </button>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Conexión cifrada • Copart/IAAI & NHTSA Gateway</span>
        </div>

      </div>

      {/* App Version Info */}
      <div className="mt-6 text-center text-xs text-slate-500 font-mono">
        Autify Flip OS v1.0 • PWA Mobile & Tablet First
      </div>

    </div>
  );
};
