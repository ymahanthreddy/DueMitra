import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Clock,
  CalendarCheck,
  Building,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  PlusCircle,
  BellRing,
  Landmark,
  FileText,
  PhoneCall,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Bot,
  Scale,
  Activity,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { AgeingBar } from '../components/AgeingBar';
import { formatPaise } from '../utils/money';
import { PrintDemandLetterModal } from '../components/PrintDemandLetterModal';
import { CashFlowChart } from '../components/CashFlowChart';
import { MsmeInterestCalculatorModal } from '../components/MsmeInterestCalculatorModal';

export function DashboardScreen() {
  const {
    t,
    kpis,
    invoices = [],
    ageingBuckets,
    priorityChaseList,
    followupsDueToday,
    cashForecast,
    business,
    config,
    demoDate,
    n8nStatus,
    customers,
    expenses = [],
    bankBalancePaise,
    affordability = {},
    monthlyStatements = [],
    sendDueRemindersDigestEmail,
  } = useApp();

  const [selectedDemandInvoice, setSelectedDemandInvoice] = useState(null);
  const [showMsmeCalculator, setShowMsmeCalculator] = useState(false);

  const top5Chase = priorityChaseList.slice(0, 5);
  const totalRecoveredPaise = (invoices || []).reduce((sum, inv) => sum + (inv.amountPaidPaise || 0), 0);
  const totalBilledPaise = (invoices || []).reduce((sum, inv) => sum + (inv.grandTotalPaise || 0), 0);
  const collectionEfficiency = totalBilledPaise > 0 ? Math.round((totalRecoveredPaise / totalBilledPaise) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Modern Financial Command Hero Banner */}
      <div className="relative overflow-hidden bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800/80 text-indigo-300 border border-indigo-500/20 shadow-sm flex items-center gap-1.5">
                <span>Enterprise Ledger</span>
              </span>
              <span className="text-xs text-slate-300 font-mono bg-[#0A0F1D] px-2.5 py-1 rounded-full border border-white/10">
                {business.name} • {business.gstin}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cash Flow & Credit Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Autonomous trade credit & cash flow monitoring for <strong className="text-white">{business.name}</strong> ({business.industry || business.category}) across {customers.length} commercial trade buyers on {business.defaultCreditDays || 30}-day terms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/invoices/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all cursor-pointer min-h-[46px]"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span className="text-white font-bold">{t('invoices.newBtn')}</span>
            </Link>
            <Link
              to="/followups"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#161f30] hover:bg-[#1a253a] text-white text-xs sm:text-sm font-bold rounded-2xl border border-white/15 transition-all cursor-pointer min-h-[46px] shadow-sm"
            >
              <BellRing className="w-4 h-4 text-amber-400" />
              <span>
                Today's Follow-ups ({followupsDueToday.length})
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* MSME Working Capital Velocity & Recovery Velocity Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-3 sm:p-4 shadow-lg">
        <div className="flex items-center gap-3 p-2.5 bg-[#090d16]/80 rounded-xl border border-white/5 fintech-card">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-black text-white font-mono">24 Days</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/25">
                -30d vs MSME avg
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Days Sales Outstanding (DSO)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-[#090d16]/80 rounded-xl border border-white/5 fintech-card">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-black text-emerald-300 font-mono">
                {formatPaise(totalRecoveredPaise)}
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                ({collectionEfficiency}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Capital Recovered to Date</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-[#090d16]/80 rounded-xl border border-white/5 fintech-card">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-black text-amber-300 font-mono">19.50% p.a.</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/25">
                3× RBI Rate
              </span>
            </div>
            <p className="text-[11px] text-slate-400">MSMED Act Sec 16 Protection</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-[#090d16]/80 rounded-xl border border-white/5 fintech-card">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-black text-white font-mono">100% Backed</span>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/15 px-1.5 py-0.5 rounded border border-cyan-500/25">
                Audit Trail
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Statutory Trade Evidence</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Money to Collect */}
        <StatCard
          title={t('terms.moneyToCollect')}
          tooltip={t('terms.moneyToCollectTip')}
          amountPaise={kpis.moneyToCollectPaise}
          subtitle="Total trade receivables across 12 dealer accounts"
          icon={Wallet}
        />

        {/* Overdue Amount */}
        <StatCard
          title={t('terms.overdueAmount')}
          tooltip={t('terms.overdueAmountTip')}
          amountPaise={kpis.overdueAmountPaise}
          subtitle="Past agreed 30-day commercial credit term"
          icon={Clock}
          colorScheme="rose"
          alert={kpis.overdueAmountPaise > 0}
        />

        {/* Expected This Week */}
        <StatCard
          title={t('terms.expectedThisWeek')}
          tooltip={t('terms.expectedThisWeekTip')}
          amountPaise={kpis.expectedThisWeekPaise}
          subtitle={`This Month: ${formatPaise(kpis.expectedThisMonthPaise)}`}
          icon={CalendarCheck}
          colorScheme="emerald"
        />

        {/* Shop Bills in 30 Days */}
        <StatCard
          title={t('terms.shopBillsNext30')}
          tooltip={t('terms.shopBillsNext30Tip')}
          amountPaise={kpis.shopBillsNext30Paise}
          subtitle="Salaries (1st), Rent (5th), Bills & GST (20th)"
          icon={Building}
          colorScheme="amber"
        />
      </div>

      {/* Cash & Liquidity Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title={t('terms.cashInBank')}
          tooltip={t('terms.cashInBankTip')}
          amountPaise={kpis.cashInBankPaise}
          subtitle="HDFC Current A/c (FC Road Branch) operating balance"
          icon={Landmark}
        />

        <StatCard
          title={t('terms.lowestForecast')}
          tooltip={t('terms.lowestForecastTip')}
          amountPaise={kpis.lowestForecastPaise}
          subtitle={`Lowest in Week ${kpis.lowestForecastWeek} • Safety buffer: ${formatPaise(config.safetyBufferPaise)}`}
          icon={TrendingDown}
          alert={kpis.isBelowBuffer}
          colorScheme={kpis.isBelowBuffer ? 'rose' : 'emerald'}
        />
      </div>

      {/* Bank Balance, Customer Dues & Expense Affordability Manager Card */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md rounded-3xl border border-indigo-500/30 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl">
              <Wallet className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Bank Balance, Customer Dues & Monthly Outflow Manager
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase font-mono">
                  Solvency Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates affordability across shop rent (5% annual escalation), petrol, loan EMIs, vehicles & salaries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/bank-expenses"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs border border-emerald-800 transition-all cursor-pointer whitespace-nowrap"
            >
              <span className="text-white">Manage Bank & Expenses</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="p-3.5 bg-[#090d16] border border-slate-800 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">Liquid Cash in Bank</span>
            <span className="text-lg font-bold font-mono text-white block">
              {formatPaise(bankBalancePaise)}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium block">
              {expenses.length > 0 ? (affordability.runwayMonths || 0) : 0} Months Expense Runway
            </span>
          </div>

          <div className="p-3.5 bg-[#090d16] border border-slate-800 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Customer Dues</span>
            <span className="text-lg font-bold font-mono text-cyan-300 block">
              {formatPaise(affordability.totalDuesPaise || kpis.moneyToCollectPaise)}
            </span>
            <span className="text-[10px] text-rose-400 font-medium block">
              {formatPaise(affordability.totalOverduePaise || kpis.overdueAmountPaise)} Overdue Debts
            </span>
          </div>

          <div className="p-3.5 bg-[#090d16] border border-slate-800 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">Monthly Committed Spend</span>
            <span className="text-lg font-bold font-mono text-amber-300 block">
              {formatPaise(expenses.length > 0 ? (affordability.breakdown?.totalMonthlyCommittedPaise || 0) : 0)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              Rent + Petrol + Loans + Vehicles
            </span>
          </div>

          <div className="p-3.5 bg-[#090d16] border border-slate-800 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">Discretionary Affordability</span>
            <span
              className={`text-lg font-bold font-mono block ${
                (affordability.safeAffordabilityPaise || 0) >= 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {formatPaise(affordability.safeAffordabilityPaise || 0)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              Headroom above ₹2 Lakh Buffer
            </span>
          </div>
        </div>

        {/* 1st of Month Statements Quick Selector */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CalendarCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Monthly Statements:</span>
            <span>Official audit generated for every 1st day of each month</span>
          </div>
          <Link
            to="/bank-expenses"
            className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline flex items-center gap-1"
          >
            <span>View 1st of Month Statement History ({monthlyStatements.length} Reports)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Overdue Ageing Breakdown Bar */}
      <AgeingBar ageing={ageingBuckets} t={t} />

      {/* 13-Week Cash Flow Horizon Curve (SVG Chart) */}
      <CashFlowChart weeks={cashForecast.weeks} safetyBufferPaise={config.safetyBufferPaise} />

      {/* Top 5 Priority Invoices to Chase This Week */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {t('dashboard.chaseHeader')}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t('dashboard.chaseSub')}
            </p>
          </div>

          <Link
            to="/chase"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Ranked Invoices</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-white/[0.05] mt-2">
          {top5Chase.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-white text-sm">No Overdue Debts</p>
              <p className="text-xs text-slate-500 mt-0.5">All customer balances are fully clear or no open invoices exist yet.</p>
            </div>
          ) : (
            top5Chase.map((item, idx) => (
            <div
              key={item.invoice.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] rounded-2xl px-3 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                  item.daysOverdue >= 30
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">
                      {item.customer?.name || item.invoice.customerName}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {item.invoice.invoiceNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.daysOverdue >= 30
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                    }`}>
                      {item.daysOverdue > 0 ? `${item.daysOverdue}d overdue` : 'Due Today'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                    {item.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-12 sm:pl-0">
                <div className="text-left sm:text-right">
                  <div className="text-base font-black font-mono text-white">
                    {formatPaise(item.invoice.balanceDuePaise)}
                  </div>
                  <span className="text-[11px] font-bold text-rose-400 block">
                    {item.daysOverdue} days past due
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/invoices/${item.invoice.id}`}
                    className="p-2 text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl border border-white/5 transition-colors cursor-pointer"
                    title="View Invoice"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* Demand Letter Modal */}
      {selectedDemandInvoice && (
        <PrintDemandLetterModal
          invoice={selectedDemandInvoice}
          customer={customers?.find((c) => c.id === selectedDemandInvoice.customerId) || selectedDemandInvoice.customer}
          business={business}
          config={config}
          demoDate={demoDate}
          onClose={() => setSelectedDemandInvoice(null)}
        />
      )}

      {/* MSMED Act Section 16 Interest Calculator Modal */}
      {showMsmeCalculator && (
        <MsmeInterestCalculatorModal
          isOpen={showMsmeCalculator}
          onClose={() => setShowMsmeCalculator(false)}
        />
      )}
    </div>
  );
}
