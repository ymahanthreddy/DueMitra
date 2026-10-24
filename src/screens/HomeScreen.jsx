import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Zap,
  Building2,
  TrendingUp,
  Landmark,
  Scale,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Layers,
  Users,
  FileText,
  Clock,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  Check,
  MessageSquare,
  ShieldCheck,
  FileCheck,
  QrCode,
  ArrowUpRight,
  Send,
  CheckCheck,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise, calculateMsmeInterestPaise } from '../utils/money';
import { RegisterBusinessModal } from '../components/RegisterBusinessModal';
import { Footer } from '../components/Footer';

export function HomeScreen() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    currentUser,
    kpis,
    invoices = [],
    customers = [],
    demoDate
  } = useApp();

  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Interactive MSME Calculator State
  const [calcPrincipalRupees, setCalcPrincipalRupees] = useState(250000);
  const [calcDaysOverdue, setCalcDaysOverdue] = useState(45);
  const [rbiRate, setRbiRate] = useState(6.5);

  const annualRate = rbiRate * 3; // 19.5%
  const principalPaise = (calcPrincipalRupees || 0) * 100;
  const calculatedInterestPaise = calculateMsmeInterestPaise(
    principalPaise,
    calcDaysOverdue || 0,
    annualRate
  );
  const calculatedTotalDemandedPaise = principalPaise + calculatedInterestPaise;

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 selection:bg-indigo-600 selection:text-white flex flex-col justify-between">
      {/* 1. Public Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#090e1a] border border-cyan-500/30 flex items-center justify-center shadow-md shadow-indigo-500/25 ring-1 ring-white/10 group-hover:scale-105 transition-transform overflow-hidden p-0.5">
              <img src="/logo.png" alt="DueMitra Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">
                  DueMitra
                </span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                  Cloud SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Autonomous B2B Trade Credit & Cash Flow
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#capabilities" className="hover:text-white transition-colors">
              Capabilities
            </a>
            <a href="#msme-calculator" className="hover:text-white transition-colors">
              MSME Calculator
            </a>
            <Link to="/documents" className="hover:text-white transition-colors">
              Payment Demand Letters
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors"
              >
                Sign In
              </Link>
            ) : null}

            <button
              onClick={() => setRegisterModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Register Business</span>
            </button>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all cursor-pointer"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Launch Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-8 border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Autonomous MSME Trade Credit & Cash Flow Protection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
            The Autonomous <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">B2B Trade Credit</span> & Cash Flow SaaS
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminate overdue invoices and cash flow anxiety. DueMitra automates 6-stage escalation ladders, calculates Section 16 statutory MSMED Act interest (3x RBI rate), reconciles bank statements with AI, and protects your business from cash shortfalls.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all cursor-pointer min-h-[50px]"
            >
              <Zap className="w-4 h-4 text-white" />
              <span>Open Cloud App Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#161F30] hover:bg-[#1a253a] text-white text-sm font-bold rounded-2xl border border-white/15 transition-all cursor-pointer min-h-[50px] shadow-sm"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Register Your Business (60s)</span>
            </button>
          </div>

          {/* Core Framework Pillars (No Workspace or Live Telemetry) */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-4 bg-[#0F172A] border border-white/10 rounded-2xl shadow-lg fintech-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Credit Ceiling</span>
              <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                45 Days Max
              </div>
              <span className="text-[11px] text-indigo-400 mt-0.5 block">Section 15 Statutory Limit</span>
            </div>

            <div className="p-4 bg-[#0F172A] border border-white/10 rounded-2xl shadow-lg fintech-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">MSMED Act 2006</span>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
                19.5% p.a.
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">3× RBI Bank Rate Interest</span>
            </div>

            <div className="p-4 bg-[#0F172A] border border-white/10 rounded-2xl shadow-lg fintech-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Escalation Ladder</span>
              <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400 mt-1">
                6 Stages
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">WhatsApp, Email & Demand Notices</span>
            </div>

            <div className="p-4 bg-[#0F172A] border border-white/10 rounded-2xl shadow-lg fintech-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cash Forecast</span>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-1">
                13 Weeks
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Trough & Buffer Breach Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Enterprise Platform Features */}
      <section id="features" className="py-16 px-4 sm:px-8 border-b border-white/[0.08] bg-[#0f172a]/40">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                Platform Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Enterprise Receivables & Cash Protection
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                DueMitra combines statutory legal protections, autonomous telecommunication agents, and real-time bank reconciliation into a unified operating system.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm border border-blue-400/30 cursor-pointer self-start sm:self-auto transition-all"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#090e1a]/90 rounded-2xl p-6 border border-white/10 hover:border-cyan-500/40 shadow-xl transition-all space-y-3 fintech-card group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">Autonomous Escalation Ladder</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                6-stage progressive follow-up workflow starting from gentle WhatsApp reminders to formal Section 16 demand notices and legal caveats.
              </p>
            </div>

            {/* Feature 2: Evidence & Commercial Claims Dossier (Replaced Voice Engine) */}
            <div className="bg-[#090e1a]/90 rounded-2xl p-6 border border-white/10 hover:border-indigo-500/40 shadow-xl transition-all space-y-3 fintech-card group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">Evidence & Claim Dossiers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compile audit-ready evidence packs pairing signed delivery receipts, GST tax invoices, reminder history, and communication logs to substantiate unpaid receivables.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#090e1a]/90 rounded-2xl p-6 border border-white/10 hover:border-amber-500/40 shadow-xl transition-all space-y-3 fintech-card group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">Section 16 MSMED Act Interest</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated statutory interest calculation at 3x RBI bank rate compounded monthly. Generates court-admissible Demand Notices and MSME Samadhan filings.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#090e1a]/90 rounded-2xl p-6 border border-white/10 hover:border-emerald-500/40 shadow-xl transition-all space-y-3 fintech-card group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Smart AI Bank Reconciliation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instantly parses bank statements with AI to match open invoices, automatically detecting Section 194C 2% TDS deductions and GST rounding discrepancies.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#090e1a]/90 rounded-2xl p-6 border border-white/10 hover:border-rose-500/40 shadow-xl transition-all space-y-3 fintech-card group">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">13-Week Cash Flow Forecast</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Predictive weekly cash trajectory simulation factoring in scheduled receivables, vendor payouts, rent commitments, and safety buffer breach warnings.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#090e1a]/90 rounded-2xl p-6 border border-white/10 hover:border-purple-500/40 shadow-xl transition-all space-y-3 fintech-card group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">Multi-Tenant KYC Governance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bank-grade isolated data architecture with strict merchant verification and super-admin approval controls before enterprise activation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive MSMED Act Interest Calculator */}
      <section id="msme-calculator" className="py-16 px-4 sm:px-8 border-b border-white/[0.08]">
        <div className="max-w-4xl mx-auto bg-[#111827] border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl">
              <Scale className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Section 16 MSMED Act Interest Calculator
              </h2>
              <p className="text-xs text-slate-400">
                Statutory compound interest at 3x RBI Bank Rate with monthly rests on delayed B2B payments
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Input Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Overdue Invoice Amount (₹)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={calcPrincipalRupees}
                  onChange={(e) => setCalcPrincipalRupees(Number(e.target.value))}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Days Overdue Past Agreed Terms
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={calcDaysOverdue}
                  onChange={(e) => setCalcDaysOverdue(Number(e.target.value))}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  RBI Bank Rate (% p.a.)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.25"
                    value={rbiRate}
                    onChange={(e) => setRbiRate(Number(e.target.value))}
                    className="w-24 bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-slate-400">
                    &times; 3 Multiplier = <strong className="text-amber-300">{annualRate}% Statutory Compound Rate</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="p-6 bg-[#0f172a] border border-amber-500/20 rounded-2xl space-y-4">
              <div className="flex justify-between items-center text-xs pb-3 border-b border-white/10 text-slate-400">
                <span>Principal Balance Due:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {formatPaise(principalPaise)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pb-3 border-b border-white/10 text-amber-300">
                <span>Statutory MSME Interest ({annualRate}% p.a.):</span>
                <span className="font-mono font-black text-amber-400 text-base">
                  + {formatPaise(calculatedInterestPaise)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm pt-1 font-bold text-white">
                <span>Total Legally Demanded:</span>
                <span className="font-mono font-black text-emerald-400 text-lg">
                  {formatPaise(calculatedTotalDemandedPaise)}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
                Under Section 16 of the MSMED Act, this interest is mandatory and cannot be waived by the buyer. DueMitra automatically embeds this into your non-litigation demand letters.
              </p>

              <Link
                to="/documents"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>View Demand Letter Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Platform Capabilities Grid */}
      <section id="capabilities" className="py-16 px-4 sm:px-8 border-b border-white/[0.08] bg-[#0f172a]/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block">
              Autonomous Debt Engine
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Built for High-Velocity Indian B2B Commerce
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Replace awkward phone calls and endless Excel tracking with automated compliance and cash flow certainty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 bg-[#090e1a]/90 border border-white/10 rounded-2xl space-y-3 shadow-lg">
              <span className="p-2.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-xl inline-block">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-white">6-Stage Escalation Ladder</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Progressive debt recovery starting from courteous payment courtesy reminders, credit-freeze warnings, up to formal commercial demand requisitions.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-[#090e1a]/90 border border-white/10 rounded-2xl space-y-3 shadow-lg">
              <span className="p-2.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl inline-block">
                <Landmark className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-white">AI Bank Statement Reconciliation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instantly parses bank statements with OCR/n8n AI, matching customer UTRs, split credit payments, and automatic 2% Section 194Q TDS deductions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-[#090e1a]/90 border border-white/10 rounded-2xl space-y-3 shadow-lg">
              <span className="p-2.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-xl inline-block">
                <Calendar className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-white">13-Week Cash Forecast & What-If</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time liquidity forecasting with a safety buffer floor. Test what happens if top trade buyers delay payments by 15 days before making inventory orders.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-[#090e1a]/90 border border-white/10 rounded-2xl space-y-3 shadow-lg">
              <span className="p-2.5 bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded-xl inline-block">
                <FileText className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-white">Court-Ready Evidence Dossiers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate A4 print-ready Tax Invoices, e-Way bill summaries, WhatsApp delivery logs, and demand letters with live UPI QR payment codes.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 bg-[#090e1a]/90 border border-white/10 rounded-2xl space-y-3 shadow-lg">
              <span className="p-2.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-xl inline-block">
                <Scale className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-white">MSME Samadhaan Protection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Statutory 45-day payment ceiling under Section 15 of MSMED Act. Ready export packages for direct submission to the MSME Facilitation Council.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 bg-[#090e1a]/90 border border-white/10 rounded-2xl space-y-3 shadow-lg">
              <span className="p-2.5 bg-violet-500/15 text-violet-400 border border-violet-500/30 rounded-xl inline-block">
                <Zap className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-white">Automated Dispatch Webhooks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connected directly to ymahanthreddy.app.n8n.cloud to dispatch instant WhatsApp reminders, morning digest check notifications, and audit webhooks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Ready to Launch CTA */}
      <section className="py-16 px-4 sm:px-8 border-b border-white/[0.08] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Take Control of Your B2B Receivables?
          </h2>
          <p className="text-sm text-slate-400">
            Join Indian manufacturers, distributors, and wholesalers using DueMitra for autonomous cash flow certainty.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <span>Enter Cloud Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/15 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Register Your Business (60s)</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7. Comprehensive Interactive Footer (Do & See) */}
      <Footer />

      {/* SaaS Business Registration Modal */}
      <RegisterBusinessModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
}

