import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  Users,
  BellRing,
  GitCommit,
  Inbox,
  Landmark,
  Wallet,
  TrendingUp,
  Target,
  FolderArchive,
  Settings as SettingsIcon,
  RotateCcw,
  Languages,
  X,
  ExternalLink,
  Sparkles,
  Building2,
  LogOut,
  User,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const {
    t,
    lang,
    toggleLanguage,
    resetDemoData,
    followupsDueToday,
    inboxClaims,
    business,
    currentUser,
    isPlatformAdmin,
    pendingBusinessesCount = 0,
    logout
  } = useApp();

  const location = useLocation();

  const pendingClaimsCount = inboxClaims.filter((c) => c.status === 'pending').length;
  const followupsCount = followupsDueToday.length;

  const navSections = [
    {
      group: 'Core Finance',
      links: [
        { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
        { to: '/invoices', label: t('nav.invoices'), icon: FileSpreadsheet },
        { to: '/invoices/new', label: t('nav.newInvoice'), icon: PlusCircle, isCreate: true },
        { to: '/customers', label: t('nav.customers'), icon: Users },
      ]
    },
    {
      group: 'Recovery & Escalation',
      links: [
        {
          to: '/followups',
          label: t('nav.followups'),
          icon: BellRing,
          badge: followupsCount,
          badgeColor: 'bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.4)]',
        },
        { to: '/chase', label: t('nav.chase'), icon: Target },
        { to: '/ladder', label: t('nav.ladder'), icon: GitCommit },
        {
          to: '/inbox',
          label: t('nav.inbox'),
          icon: Inbox,
          badge: pendingClaimsCount,
          badgeColor: 'bg-amber-500 text-slate-950 font-black shadow-[0_0_8px_rgba(245,158,11,0.4)]',
        },
      ]
    },
    {
      group: 'Cash & Planning',
      links: [
        { to: '/forecast', label: t('nav.forecast'), icon: TrendingUp },
        { to: '/bank-expenses', label: t('nav.bankExpenses') || 'Bank & Expenses', icon: Wallet },
        { to: '/payments', label: t('nav.payments'), icon: Landmark },
        { to: '/documents', label: t('nav.documents'), icon: FolderArchive },
      ]
    },
    {
      group: 'System & Cloud',
      links: [
        { to: '/settings', label: t('nav.settings'), icon: SettingsIcon },
      ]
    }
  ];

  const handleReset = () => {
    if (window.confirm('Reset all demo workspaces back to default initial SaaS state?')) {
      resetDemoData();
      if (onCloseMobile) onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F172A] border-r border-white/[0.08] text-slate-300">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
        <Link to="/" onClick={onCloseMobile} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#090e1a] border border-cyan-500/30 flex items-center justify-center shadow-md shadow-indigo-500/25 ring-1 ring-white/10 group-hover:scale-105 transition-transform shrink-0 overflow-hidden p-0.5">
            <img src="/logo.png" alt="DueMitra Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">
                DueMitra
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                Cloud OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
              B2B Trade Credit & Cash SaaS
            </p>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] cursor-pointer"
            aria-label="Close Navigation Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Active Identity Banner */}
      <div className="px-4 py-3 border-b border-white/[0.08] bg-[#0A0F1D]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white bg-indigo-600 shadow-md shadow-indigo-500/20 shrink-0">
            {isPlatformAdmin ? 'HQ' : (business?.name ? business.name.slice(0, 2).toUpperCase() : 'KV')}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white truncate block">
              {isPlatformAdmin ? 'DueMitra Governance' : (business?.name || 'Kavach Mobile Accessories')}
            </span>
            <span className="text-[10px] text-slate-400 truncate block font-mono">
              {isPlatformAdmin ? 'Super Admin • admin@duemitra.in' : `GSTIN: ${business?.gstin || '27AABCK1234F1ZZ'}`}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              {section.group}
            </span>
            <div className="space-y-1">
              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive = link.to === '/dashboard' ? (location.pathname === '/dashboard' || location.pathname === '/') : location.pathname.startsWith(link.to);

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30 border border-indigo-400/30'
                        : link.isCreate
                        ? 'text-indigo-300 hover:text-white hover:bg-indigo-500/10 border border-indigo-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : link.isCreate ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{link.label}</span>
                    </div>

                    {link.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${link.badgeColor}`}>
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/[0.08] space-y-3 bg-[#0A0F1D]/50">
        {/* User Session Profile Card */}
        <div className="p-2.5 bg-[#0F172A] border border-white/10 rounded-2xl flex items-center justify-between gap-2.5 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs bg-indigo-600 shadow-md shadow-indigo-500/20 shrink-0">
              {isPlatformAdmin ? 'HQ' : 'KV'}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-bold truncate">
                <span>{isPlatformAdmin ? 'DueMitra Admin' : (business?.name || 'Kavach Mobile Accessories')}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <span className="text-indigo-300 font-semibold">{isPlatformAdmin ? 'Platform Admin' : 'Store Account'}</span>
                <span>•</span>
                <span className="font-mono text-[9px] text-slate-500 truncate max-w-[100px]">
                  {isPlatformAdmin ? 'admin@duemitra.in' : (business?.loginEmail || 'billing@kavachaccessories.in')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              if (onCloseMobile) onCloseMobile();
            }}
            title="Sign out of store account"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Language & Reset Toolbar */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={toggleLanguage}
            title="Switch Language: English / हिंदी / मराठी"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}</span>
          </button>

          <button
            onClick={handleReset}
            title={t('actions.resetDemo')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/20 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-md flex">
          <div className="w-4/5 max-w-xs h-full">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
