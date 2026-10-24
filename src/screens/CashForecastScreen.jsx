import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  ChevronDown,
  Info,
  Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise } from '../utils/money';
import { formatIndianDate } from '../utils/date';
import { CashFlowChart } from '../components/CashFlowChart';

export function CashForecastScreen() {
  const {
    t,
    cashForecast,
    config,
    whatIf,
    toggleWhatIf,
    invoices,
    priorityChaseList,
  } = useApp();

  const {
    weeks,
    lowestPointPaise,
    troughWeekIndex,
    firstBufferBreachWeek,
    safetyBufferPaise,
    maxShortfallPaise,
  } = cashForecast;

  // Invoices that bridge the cash gap
  const gapCoveringInvoices = priorityChaseList.filter(
    (item) => item.invoice.balanceDuePaise >= maxShortfallPaise * 0.7
  ).slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            13-Week Cash Flow Forecast
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate inflows (adjusted by each dealer's avg days late) and shop operating commitments
          </p>
        </div>

        {/* Safety buffer note */}
        <div className="bg-[#0f172a]/70 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-xl text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
            Safety Cash Reserve
          </span>
          <span className="font-mono text-base font-black text-white">
            {formatPaise(safetyBufferPaise)}
          </span>
        </div>
      </div>

      {/* Safety Buffer Alert Banner if breach detected */}
      {firstBufferBreachWeek !== null ? (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-5 text-rose-200 shadow-xl">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-white">
                Safety Buffer Breach Projected in Week {firstBufferBreachWeek}!
              </h2>
              <p className="text-xs text-rose-300 mt-1 leading-relaxed">
                Projected cash dips below the ₹2,00,000 reserve limit reaching a trough of{' '}
                <strong className="text-white">{formatPaise(lowestPointPaise)}</strong> in Week {troughWeekIndex}.
                Estimated cash gap to close: <strong className="text-white">{formatPaise(maxShortfallPaise)}</strong>.
              </p>
              {gapCoveringInvoices.length > 0 && (
                <div className="mt-3.5 text-xs bg-[#090d16]/80 p-3.5 rounded-xl border border-rose-500/30">
                  <span className="font-semibold text-slate-200 block mb-2">
                    Collecting any of these overdue bills immediately closes the deficit:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {gapCoveringInvoices.map((ch) => (
                      <Link
                        key={ch.invoice.id}
                        to={`/invoices/${ch.invoice.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 rounded-lg font-medium text-xs transition-colors"
                      >
                        <span>{ch.customer?.name} ({formatPaise(ch.invoice.balanceDuePaise)})</span>
                        <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-emerald-200 shadow-xl flex items-center gap-3.5">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <strong className="text-sm font-bold block text-white">Healthy Liquidity Horizon</strong>
            Cash reserves stay above the ₹2,00,000 safety buffer throughout the entire 13-week period (Lowest point: {formatPaise(lowestPointPaise)} in Week {troughWeekIndex}).
          </div>
        </div>
      )}

      {/* "What If" Interactive Simulation Toggles */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl space-y-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {t('forecast.whatIfTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Toggle 1: Sahyadri delay */}
          <button
            onClick={() => toggleWhatIf('customerDelay')}
            className={`p-4 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
              whatIf.customerDelay
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                : 'bg-[#090d16]/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="font-bold text-xs block text-white">Key Customer Delays</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Sahyadri Telecom pays 30 days later
              </p>
            </div>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${whatIf.customerDelay ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'}`}>
              {whatIf.customerDelay ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Toggle 2: Big festive order */}
          <button
            onClick={() => toggleWhatIf('bigOrder')}
            className={`p-4 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
              whatIf.bigOrder
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-[#090d16]/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="font-bold text-xs block text-white">Festive Bulk Order</span>
              <p className="text-[11px] text-slate-400 mt-1">
                +₹1,50,000 cash advance received in Week 3
              </p>
            </div>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${whatIf.bigOrder ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
              {whatIf.bigOrder ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Toggle 3: Delay Supplier */}
          <button
            onClick={() => toggleWhatIf('delaySupplier')}
            className={`p-4 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
              whatIf.delaySupplier
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                : 'bg-[#090d16]/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="font-bold text-xs block text-white">Delay Distributor Bill</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Negotiate 2-week grace on Anker/Spigen bill
              </p>
            </div>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${whatIf.delaySupplier ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-500'}`}>
              {whatIf.delaySupplier ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* 13-Week Cash Flow Horizon Curve (SVG Area Line Chart) */}
      <CashFlowChart weeks={weeks} safetyBufferPaise={safetyBufferPaise} />

      {/* Week-by-Week Table (13 Weeks) */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-4 bg-white/[0.03] border-b border-white/10 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            13 Consecutive Rolling Weeks (Opening = Previous Week Closing)
          </span>
          <span className="text-xs text-indigo-400 font-mono">
            Safety Buffer Threshold: ₹2,00,000
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/10">
                <th className="p-3.5 pl-4">Week Period</th>
                <th className="p-3.5 text-right">Opening Cash</th>
                <th className="p-3.5 text-right text-emerald-400">+ Expected In</th>
                <th className="p-3.5 text-right text-rose-400">- Expected Out</th>
                <th className="p-3.5 text-right font-bold text-white">Closing Cash</th>
                <th className="p-3.5 text-center">Buffer Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {weeks.map((w) => {
                const isTrough = w.weekIndex === troughWeekIndex;
                const isBreach = w.isBelowSafetyBuffer;

                return (
                  <tr
                    key={w.weekIndex}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      isBreach ? 'bg-rose-950/20' : isTrough ? 'bg-amber-950/20' : ''
                    }`}
                  >
                    <td className="p-3.5 pl-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{w.label}</span>
                        {isTrough && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Trough
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {w.startDate} to {w.endDate}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-medium text-slate-300">
                      {formatPaise(w.openingCashPaise)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      +{formatPaise(w.inflowPaise)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-rose-400">
                      -{formatPaise(w.outflowPaise)}
                    </td>
                    <td className={`p-3.5 text-right font-mono font-black text-sm ${
                      isBreach ? 'text-rose-400 font-black' : 'text-white'
                    }`}>
                      {formatPaise(w.closingCashPaise)}
                    </td>
                    <td className="p-3.5 text-center">
                      {isBreach ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Below Buffer
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Safe
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
