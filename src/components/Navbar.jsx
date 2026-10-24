import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  Users,
  BellRing,
  GitCommit,
  Inbox,
  Landmark,
  TrendingUp,
  Target,
  FolderArchive,
  Settings as SettingsIcon,
  RotateCcw,
  Languages,
  Menu,
  X,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { N8nStatusBadge } from './N8nStatusBadge';
import { formatIndianDate } from '../utils/date';

export function Navbar() {
  const {
    t,
    lang,
    toggleLanguage,
    resetDemoData,
    demoDate,
    advanceDemoDays,
    followupsDueToday,
    inboxClaims,
    business,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingClaimsCount = inboxClaims.filter((c) => c.status === 'pending').length;
  const followupsCount = followupsDueToday.length;

  const navLinks = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/invoices', label: t('nav.invoices'), icon: FileSpreadsheet },
    { to: '/invoices/new', label: t('nav.newInvoice'), icon: PlusCircle, isAction: true },
    { to: '/customers', label: t('nav.customers'), icon: Users },
    {
      to: '/followups',
      label: t('nav.followups'),
      icon: BellRing,
      badge: followupsCount,
      badgeColor: 'bg-rose-500 text-white shadow-xs shadow-rose-500/50',
    },
    { to: '/ladder', label: t('nav.ladder'), icon: GitCommit },
    {
      to: '/inbox',
      label: t('nav.inbox'),
      icon: Inbox,
      badge: pendingClaimsCount,
      badgeColor: 'bg-amber-500 text-slate-950 font-black shadow-xs shadow-amber-500/50',
    },
    { to: '/payments', label: t('nav.payments'), icon: Landmark },
    { to: '/forecast', label: t('nav.forecast'), icon: TrendingUp },
    { to: '/chase', label: t('nav.chase'), icon: Target },
    { to: '/documents', label: t('nav.documents'), icon: FolderArchive },
    { to: '/settings', label: t('nav.settings'), icon: SettingsIcon },
  ];

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to default initial state?')) {
      resetDemoData();
    }
  };

  return (
    <>
      {/* Top Banner & Control Bar */}
      <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md text-white shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-[#090e1a] border border-cyan-500/30 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ring-1 ring-white/15 overflow-hidden p-0.5">
                  <img src="/logo.png" alt="DueMitra Logo" className="w-full h-full object-contain rounded-lg" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-tight text-white">
                      DueMitra
                    </span>
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                      Pune
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xs">
                    Kavach Mobile Accessories • Cash Flow & Credit
                  </p>
                </div>
              </Link>
            </div>

            {/* Middle: Date Control and Live n8n status */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Demo Date Controller */}
              <div className="flex items-center bg-[#131b2e] border border-slate-700/80 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-inner">
                <Calendar className="w-3.5 h-3.5 text-indigo-400 mr-1.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-400 hidden md:inline">Demo: </span>
                  <span className="font-semibold text-slate-100 font-mono">
                    {formatIndianDate(demoDate, { month: 'short' })}
                  </span>
                </div>
                <div className="flex items-center ml-2 border-l border-slate-700 pl-1.5 gap-1">
                  <button
                    onClick={() => advanceDemoDays(1)}
                    title="Advance demo date by 1 day"
                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-indigo-600 text-[11px] font-medium rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    +1d
                  </button>
                  <button
                    onClick={() => advanceDemoDays(7)}
                    title="Advance demo date by 7 days"
                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-indigo-600 text-[11px] font-medium rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    +7d
                  </button>
                </div>
              </div>

              {/* n8n Status Indicator */}
              <N8nStatusBadge />

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                title="Switch Language (English / हिंदी)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#131b2e] hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/80 transition-colors cursor-pointer"
              >
                <Languages className="w-4 h-4 text-indigo-400" />
                <span className="uppercase font-bold">{lang === 'en' ? 'हिंदी' : 'EN'}</span>
              </button>

              {/* Reset Demo Button */}
              <button
                onClick={handleReset}
                title={t('actions.resetDemo')}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-rose-300 hover:text-white hover:bg-rose-950/40 rounded-xl border border-rose-900/40 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Secondary Navigation Bar */}
        <nav aria-label="Main navigation" className="hidden lg:block bg-[#0a0f1d]/90 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <div className="flex items-center flex-wrap gap-1.5 py-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30'
                          : link.isAction
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{link.label}</span>
                    {link.badge > 0 && (
                      <span
                        className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          link.badgeColor || 'bg-indigo-500 text-white'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/80 backdrop-blur-md flex">
          <div className="bg-[#0b0f19] w-4/5 max-w-xs h-full flex flex-col p-4 shadow-2xl border-r border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-base">Kavach Mobile</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </div>
                    {link.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          link.badgeColor || 'bg-indigo-500 text-white'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  handleReset();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-950/40 text-rose-300 text-xs font-semibold border border-rose-900/50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}
