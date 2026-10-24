import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Zap,
  Building2,
  Calendar,
  RotateCcw,
  Languages,
  Plus,
  Scale,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  Landmark,
  Target,
  Users,
  Activity,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise } from '../utils/money';
import { formatIndianDate } from '../utils/date';
import { RegisterBusinessModal } from './RegisterBusinessModal';

export function Footer() {
  const {
    business,
    businesses = [],
    currentBusinessId,
    switchBusiness,
    demoDate,
    advanceDemoDays,
    resetDemoData,
    lang,
    toggleLanguage,
    kpis,
    invoices = [],
    customers = [],
    inboxClaims = [],
    n8nStatus,
    testN8n
  } = useApp();

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [pingingN8n, setPingingN8n] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  const handlePingN8n = async () => {
    setPingingN8n(true);
    try {
      const res = await testN8n();
      if (res.mode === 'live_n8n') {
        setPingSuccess(true);
        setTimeout(() => setPingSuccess(false), 3000);
      }
    } finally {
      setPingingN8n(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo workspaces back to default initial SaaS state?')) {
      resetDemoData();
      window.location.reload();
    }
  };

  return (
    <footer className="mt-12 pt-8 pb-12 border-t border-white/[0.08] bg-[#0A0F1D] text-slate-400">
      {/* 1. Quick Interactive "DO" Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-8 pb-8 border-b border-white/[0.08]">
        <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Active Business Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-500/20 ring-1 ring-white/10">
              {business?.name ? business.name.slice(0, 2).toUpperCase() : 'KV'}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {business?.name || 'Kavach Mobile Accessories'}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                GSTIN: {business?.gstin || '27AABCK1234F1ZZ'} • {business?.enterpriseType || 'Micro'} MSME
              </span>
            </div>
          </div>

          {/* Quick Simulation & Language Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Time Machine Quick Advance */}
            <div className="flex items-center bg-[#0A0F1D] border border-white/10 rounded-xl px-2.5 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 mr-2 shrink-0" />
              <span className="text-slate-400 mr-2 font-mono text-[11px]">
                {formatIndianDate(demoDate, { month: 'short' })}
              </span>
              <div className="flex items-center gap-1 pl-1.5 border-l border-white/10">
                <button
                  onClick={() => advanceDemoDays(1)}
                  className="px-2 py-0.5 bg-white/[0.05] hover:bg-indigo-600 hover:text-white text-[10px] font-bold rounded text-slate-300 transition-colors cursor-pointer"
                  title="Advance 1 day"
                >
                  +1d
                </button>
                <button
                  onClick={() => advanceDemoDays(7)}
                  className="px-2 py-0.5 bg-white/[0.05] hover:bg-indigo-600 hover:text-white text-[10px] font-bold rounded text-slate-300 transition-colors cursor-pointer"
                  title="Advance 7 days"
                >
                  +7d
                </button>
              </div>
            </div>

            {/* n8n Live Ping */}
            <button
              onClick={handlePingN8n}
              disabled={pingingN8n}
              title="Test webhook dispatch to ymahanthreddy.app.n8n.cloud"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer shadow-xs"
            >
              <Zap className={`w-3.5 h-3.5 ${pingSuccess ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>{pingingN8n ? 'Testing...' : pingSuccess ? 'n8n Ready 200' : 'Ping n8n'}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer shadow-xs"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* Reset Demo */}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/20 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Comprehensive "SEE" Information & Live Status Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-xs">
        {/* Col 1: Platform Brand & Current Tenant Identity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#090e1a] border border-cyan-500/30 flex items-center justify-center shadow-md shadow-indigo-500/20 overflow-hidden p-0.5">
              <img src="/logo.png" alt="DueMitra Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <span className="font-black text-base text-white tracking-tight">DueMitra</span>
              <span className="text-[10px] text-indigo-400 font-mono block">Autonomous Trade Credit SaaS</span>
            </div>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Autonomous receivables engine with statutory MSMED Act 2006 legal debt protection, AI bank reconciliation, and real-time n8n automation for Indian MSMEs.
          </p>

          <div className="p-3 bg-[#0A0F1D] border border-white/10 rounded-xl space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Compliance Standard</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                Statutory Grade
              </span>
            </div>
            <p className="text-white font-semibold">MSMED Act 2006 & CGST Rules 2017</p>
            <p className="text-[10px] text-slate-400">Deterministic Whole-Paise Financial Precision</p>
          </div>
        </div>

        {/* Col 2: Receivables Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Receivables Overview</span>
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-[#0A0F1D] border border-white/5 rounded-lg">
              <span className="text-slate-400">Total Receivables:</span>
              <span className="font-mono font-bold text-white">
                {formatPaise(kpis?.totalToCollectPaise || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#0A0F1D] border border-white/5 rounded-lg">
              <span className="text-slate-400">Overdue Balance:</span>
              <span className="font-mono font-bold text-rose-400">
                {formatPaise(kpis?.totalOverduePaise || 0)} ({kpis?.overduePercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#0A0F1D] border border-white/5 rounded-lg">
              <span className="text-slate-400">Bank Liquidity:</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatPaise(kpis?.bankBalancePaise || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#0A0F1D] border border-white/5 rounded-lg">
              <span className="text-slate-400">Ledger Count:</span>
              <span className="font-mono font-bold text-slate-200">
                {invoices.length} bills • {customers.length} buyers
              </span>
            </div>
          </div>
        </div>

        {/* Col 3: Statutory Standards & Frameworks */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Frameworks & Rails</span>
          </h4>
          <ul className="space-y-2 text-[11px]">
            <li className="flex items-center justify-between p-2 bg-[#0A0F1D] border border-white/5 rounded-lg">
              <span className="text-slate-400">MSMED Act 2006:</span>
              <span className="text-amber-300 font-bold">Sec 15/16 3× RBI Rate</span>
            </li>
            <li className="flex items-center justify-between p-2 bg-[#0A0F1D] border border-white/5 rounded-lg">
              <span className="text-slate-400">GST Compliance:</span>
              <span className="text-emerald-300 font-bold">Rule 46 Tax Invoicing</span>
            </li>
            <li className="flex items-center justify-between p-2 bg-[#0A0F1D] border border-white/5 rounded-lg">
              <span className="text-slate-400">TDS Detection:</span>
              <span className="font-mono text-indigo-300 font-bold">Sec 194C / 194Q (2%)</span>
            </li>
            <li className="flex items-center justify-between p-2 bg-[#0A0F1D] border border-white/5 rounded-lg">
              <span className="text-slate-400">Payment Rail:</span>
              <span className="text-cyan-300 font-bold">NPCI UPI 2.0 Dynamic QR</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Statutory Legal Links & Quick Jumps */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>Statutory Portals & Legal</span>
          </h4>
          <div className="space-y-1.5 text-[11px]">
            <a
              href="https://samadhaan.msme.gov.in"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 text-slate-300 hover:text-white bg-[#0A0F1D] hover:bg-white/5 border border-white/5 rounded-lg transition-colors group"
            >
              <span>MSME Samadhaan Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
            </a>
            <a
              href="https://udyamregistration.gov.in"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 text-slate-300 hover:text-white bg-[#0A0F1D] hover:bg-white/5 border border-white/5 rounded-lg transition-colors group"
            >
              <span>Udyam MSME Registry</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
            </a>
            <a
              href="https://www.gst.gov.in"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 text-slate-300 hover:text-white bg-[#0A0F1D] hover:bg-white/5 border border-white/5 rounded-lg transition-colors group"
            >
              <span>GST Portal (Rule 46 / 138)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
            </a>
            <Link
              to="/documents"
              className="flex items-center justify-between p-2 text-indigo-300 hover:text-white bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-500/20 rounded-lg transition-colors"
            >
              <span>View Demand Letters & Dossiers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal Disclaimer & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div>
          <span>© 2026 DueMitra Cloud SaaS • Autonomous B2B Trade Credit & Recovery Platform.</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            Platform Home
          </Link>
          <span className="text-white/20">•</span>
          <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <span className="text-white/20">•</span>
          <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            App Dashboard
          </Link>
          <span className="text-white/20">•</span>
          <Link to="/settings" className="text-slate-400 hover:text-white transition-colors">
            Cloud Settings
          </Link>
          <span className="text-white/20">•</span>
          <span className="text-slate-400">Strictly Non-Litigation Requisitions</span>
        </div>
      </div>

      {/* SaaS Business Registration Modal */}
      <RegisterBusinessModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </footer>
  );
}

