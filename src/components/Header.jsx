import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Calendar,
  PlusCircle,
  BellRing,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Layers,
  LogOut,
  Building2,
  Clock,
  Scale
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { N8nStatusBadge } from './N8nStatusBadge';
import { formatIndianDate } from '../utils/date';
import { MsmeInterestCalculatorModal } from './MsmeInterestCalculatorModal';

export function Header({ onOpenMobile }) {
  const {
    business,
    demoDate,
    advanceDemoDays,
    followupsDueToday,
    inboxClaims,
    currentUser,
    isPlatformAdmin,
    pendingBusinessesCount = 0,
    sendDueRemindersDigestEmail,
    logout,
    t
  } = useApp();

  const [showMsmeCalculator, setShowMsmeCalculator] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const followupsCount = followupsDueToday.length;

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/admin') return { title: 'Platform Admin Console', sub: 'Merchant approvals, GSTIN verification & platform governance' };
    if (path === '/' || path === '/dashboard') return { title: 'Dashboard', sub: 'Cash flow health & daily recovery overview' };
    if (path === '/invoices') return { title: 'Tax Invoices', sub: 'GST invoices, credit terms & dispatch tracking' };
    if (path === '/invoices/new') return { title: 'Create Tax Invoice', sub: 'B2B GST compliant invoice with live tax math' };
    if (path.startsWith('/invoices/')) return { title: 'Invoice Details', sub: 'Breakdown, audit history & evidence pack' };
    if (path === '/customers') return { title: 'Trade Accounts', sub: 'B2B dealer directory, GST verification & trade credit terms' };
    if (path === '/followups') return { title: "Today's Follow-ups", sub: 'Automated escalation ladder reminders for today' };
    if (path === '/ladder') return { title: 'Escalation Ladder', sub: '6-stage commercial debt recovery protocol' };
    if (path === '/inbox') return { title: 'Claims & Disputes Inbox', sub: 'Customer payment claims, transit issues & UTRs' };
    if (path === '/payments') return { title: 'Bank Reconciliation', sub: 'AI bank statement parsing, 2% TDS & split credits' };
    if (path === '/forecast') return { title: '13-Week Cash Forecast', sub: 'Liquidity horizon, what-if scenarios & safety buffer' };
    if (path === '/chase') return { title: 'Priority Chase', sub: 'Smart ranked collection list by cash impact' };
    if (path === '/documents') return { title: 'Evidence Dossiers', sub: 'Print-ready A4 Tax Invoices & Demand Letters' };
    if (path === '/settings') return { title: 'Settings & Cloud', sub: 'n8n endpoints, database & business profile' };
    return { title: 'DueMitra Cloud OS', sub: 'Autonomous MSME Trade Credit Platform' };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-30 bg-[#0F172A]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 bg-[#0A0F1D] border border-white/10 rounded-xl text-slate-300 hover:text-white cursor-pointer shadow-xs"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{pageInfo.title}</span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            {pageInfo.sub}
          </p>
        </div>
      </div>

      {/* Right: Time Machine, n8n badge, Quick Actions, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">

        {/* Simulated Date Time Machine */}
        <div className="flex items-center bg-[#0A0F1D] border border-white/10 rounded-2xl px-2.5 sm:px-3 py-1.5 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-indigo-400 mr-2 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400 hidden xl:inline">Simulated Date: </span>
            <span className="font-bold text-white font-mono">
              {formatIndianDate(demoDate, { month: 'short' })}
            </span>
          </div>
          <div className="flex items-center ml-2.5 border-l border-white/10 pl-2 gap-1">
            <button
              onClick={() => advanceDemoDays(1)}
              title="Advance simulated date by 1 day"
              className="px-2 py-0.5 bg-white/[0.05] hover:bg-indigo-600 hover:text-white text-[11px] font-semibold rounded-lg text-slate-300 border border-white/10 transition-colors cursor-pointer"
            >
              +1d
            </button>
            <button
              onClick={() => advanceDemoDays(7)}
              title="Advance simulated date by 7 days (1 week)"
              className="px-2 py-0.5 bg-white/[0.05] hover:bg-indigo-600 hover:text-white text-[11px] font-semibold rounded-lg text-slate-300 border border-white/10 transition-colors cursor-pointer"
            >
              +7d
            </button>
          </div>
        </div>

        {/* n8n Status Badge */}
        <N8nStatusBadge />

        {/* Follow-ups Quick Bell */}
        {followupsCount > 0 && (
          <Link
            to="/followups"
            title={`${followupsCount} follow-ups due today`}
            className="relative p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl transition-all shadow-sm hidden sm:flex items-center justify-center cursor-pointer"
          >
            <BellRing className="w-4 h-4 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)]">
              {followupsCount}
            </span>
          </Link>
        )}

        {/* MSME Sec 16 Interest Calculator Pill */}
        <button
          type="button"
          onClick={() => setShowMsmeCalculator(true)}
          title="Open MSMED Act Section 16 Penal Interest Calculator"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 text-xs font-bold rounded-xl border border-amber-500/30 transition-all shadow-sm cursor-pointer"
        >
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <span>MSME Penal Calculator</span>
        </button>

        {/* Public SaaS Home Page Link */}
        <Link
          to="/"
          title="View Public SaaS Landing Page"
          className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Landing Page</span>
        </Link>

        {/* Primary "+ New Invoice" Button */}
        <Link
          to="/invoices/new"
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">New Invoice</span>
        </Link>

        {/* User Account / Role & Quick Logout */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/10">
          <div
            title={isPlatformAdmin ? 'DueMitra Super Admin' : `${business?.name || 'Kavach Mobile'} • Store Account`}
            className="flex items-center gap-2 p-1.5 pr-2.5 bg-[#0A0F1D] border border-white/10 rounded-xl shadow-xs"
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black bg-indigo-600 shadow-md shadow-indigo-500/20">
              {isPlatformAdmin ? 'HQ' : (business?.name ? business.name.slice(0, 2).toUpperCase() : 'KV')}
            </div>
            <div className="text-left text-xs leading-none">
              <span className="font-bold text-white block truncate max-w-[140px]">
                {isPlatformAdmin ? 'Platform Admin' : (business?.name || 'Kavach Mobile')}
              </span>
              <span className="text-[9px] text-indigo-400 font-semibold">
                {isPlatformAdmin ? 'Super Admin' : 'Store Account'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Sign out of current session"
            className="p-2 bg-[#0A0F1D] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MSMED Act Section 16 Interest Calculator Modal */}
      {showMsmeCalculator && (
        <MsmeInterestCalculatorModal
          isOpen={showMsmeCalculator}
          onClose={() => setShowMsmeCalculator(false)}
        />
      )}
    </header>
  );
}
