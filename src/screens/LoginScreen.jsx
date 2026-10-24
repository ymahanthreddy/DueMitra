import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Layers,
  ChevronRight,
  Clock,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RegisterBusinessModal } from '../components/RegisterBusinessModal';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, businesses = [] } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPendingNotice, setIsPendingNotice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsPendingNotice(false);
    setLoading(true);

    const res = login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.isPlatformAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
      if (res.isPending) {
        setIsPendingNotice(true);
      }
    }
  };

  const handleAdminQuickFill = () => {
    setEmail('admin@duemitra.in');
    setPassword('admin@duemitra123');
    setError('');
    setIsPendingNotice(false);
  };

  const handleStoreQuickFill = () => {
    setEmail('billing@kavachaccessories.in');
    setPassword('kavach@123');
    setError('');
    setIsPendingNotice(false);
  };

  const handlePendingStoreQuickFill = () => {
    setEmail('accounts@balajitelecom.in');
    setPassword('balaji@123');
    setError('');
    setIsPendingNotice(false);
  };

  const handleDirectAdminLogin = () => {
    const res = login('admin@duemitra.in', 'admin@duemitra123');
    if (res.success) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      {/* Top Simple Bar */}
      <header className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#0b1329] border border-cyan-500/30 flex items-center justify-center overflow-hidden shadow-md shadow-indigo-500/25 ring-1 ring-white/10 p-0.5">
            <img src="/logo.png" alt="DueMitra Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white">DueMitra</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 uppercase">
                Cloud
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDirectAdminLogin}
            className="text-xs font-bold text-indigo-300 hover:text-white px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/30 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>HQ Admin Portal</span>
          </button>

          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-white transition-colors hidden sm:inline"
          >
            &larr; Platform Home
          </Link>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md space-y-5 animate-fade-in">
          {/* Card Wrapper */}
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <div className="text-center space-y-2 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0b1329] border border-cyan-500/30 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/15 ring-1 ring-white/10 mb-3 overflow-hidden p-1">
                <img src="/logo.png" alt="DueMitra Logo" className="w-full h-full object-contain rounded-xl" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Single Sign-In Portal
              </h1>
              <p className="text-xs text-slate-400">
                Sign in with your verified store email or platform admin credentials.
              </p>
            </div>

            {/* Error / Pending Notice */}
            {error && (
              <div className={`mb-4 p-3.5 rounded-2xl text-xs flex flex-col gap-2 shadow-lg ${
                isPendingNotice
                  ? 'bg-amber-950/70 border border-amber-500/50 text-amber-200'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
              }`}>
                <div className="flex items-start gap-2.5">
                  {isPendingNotice ? (
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{error}</span>
                </div>

                {isPendingNotice && (
                  <button
                    type="button"
                    onClick={handleDirectAdminLogin}
                    className="self-start mt-1 px-3 py-1.5 bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 border border-amber-400/30 rounded-xl font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Sign In as Platform Admin to Approve this Store &rarr;</span>
                  </button>
                )}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="billing@kavachaccessories.in or admin@duemitra.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0A0F1D] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    demo: see quick-fill
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0A0F1D] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sample 2FA OTP Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    One-Time Password (OTP / 2FA)
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Sample 2FA
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter any 6 digits (e.g. 123456)"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0A0F1D] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono tracking-widest transition-colors"
                  />
                </div>
                <div className="mt-1.5 p-2 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-cyan-300">Note:</strong> Any OTP works (e.g. <span className="font-mono text-white">123456</span>)! This is for sample 2-Factor Authentication simulation.
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-white/[0.08] text-center">
              <button
                type="button"
                onClick={() => setRegisterModalOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>New store? Register here for approval &rarr;</span>
              </button>
            </div>
          </div>

          {/* Quick-Fill Cards for Sandbox Access */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block">
              Quick Login Profiles:
            </span>

            {/* Store Account */}
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-3 shadow-md flex items-center justify-between text-xs hover:border-indigo-500/40 transition-colors">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 block flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>Approved Store (Kavach Mobile)</span>
                </span>
                <span className="font-mono text-slate-300 text-[11px] block mt-0.5">
                  billing@kavachaccessories.in • kavach@123
                </span>
              </div>
              <button
                type="button"
                onClick={handleStoreQuickFill}
                className="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 hover:text-white rounded-xl border border-indigo-500/30 font-bold text-xs transition-colors cursor-pointer"
              >
                Fill
              </button>
            </div>

            {/* Platform Admin Account */}
            <div className="bg-[#0F172A] border border-indigo-500/30 rounded-2xl p-3 shadow-md flex items-center justify-between text-xs hover:border-indigo-400/50 transition-colors">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 block flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>DueMitra Platform Admin</span>
                </span>
                <span className="font-mono text-slate-300 text-[11px] block mt-0.5">
                  admin@duemitra.in • admin@duemitra123
                </span>
              </div>
              <button
                type="button"
                onClick={handleAdminQuickFill}
                className="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 hover:text-white rounded-xl border border-indigo-500/30 font-bold text-xs transition-colors cursor-pointer"
              >
                Fill
              </button>
            </div>

            {/* Pending Applicant Demo */}
            <div className="bg-[#0F172A] border border-amber-500/30 rounded-2xl p-3 shadow-md flex items-center justify-between text-xs hover:border-amber-400/50 transition-colors">
              <div>
                <span className="text-[10px] font-bold text-amber-400 block flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Pending Store Applicant (Balaji Telecom)</span>
                </span>
                <span className="font-mono text-slate-300 text-[11px] block mt-0.5">
                  accounts@balajitelecom.in • balaji@123
                </span>
              </div>
              <button
                type="button"
                onClick={handlePendingStoreQuickFill}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white rounded-xl border border-amber-500/30 font-bold text-xs transition-colors cursor-pointer"
              >
                Fill
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="px-6 py-4 border-t border-white/[0.08] text-center text-[11px] text-slate-500 max-w-7xl mx-auto w-full">
        <span>© 2026 DueMitra Cloud SaaS • Autonomous Multi-Tenant Trade Credit Platform</span>
      </footer>

      {/* SaaS Business Registration Modal */}
      <RegisterBusinessModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
}
