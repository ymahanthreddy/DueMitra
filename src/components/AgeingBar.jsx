import React from 'react';
import { formatPaise } from '../utils/money';

export function AgeingBar({ ageing, t }) {
  const total = ageing.totalToCollectPaise || 1;

  const segments = [
    {
      key: 'notYetDue',
      label: t ? t('dashboard.notYetDue') : 'Not Yet Due',
      paise: ageing.notYetDuePaise,
      count: ageing.counts.notYetDue,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/20',
      borderColor: 'border-emerald-500/30',
      dotColor: 'bg-emerald-400',
    },
    {
      key: 'd1_30',
      label: t ? t('dashboard.days1_30') : '1-30 Days Overdue',
      paise: ageing.days1_30Paise,
      count: ageing.counts.d1_30,
      color: 'bg-sky-500',
      textColor: 'text-sky-400',
      bgColor: 'bg-sky-950/20',
      borderColor: 'border-sky-500/30',
      dotColor: 'bg-sky-400',
    },
    {
      key: 'd31_60',
      label: t ? t('dashboard.days31_60') : '31-60 Days Overdue',
      paise: ageing.days31_60Paise,
      count: ageing.counts.d31_60,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-950/20',
      borderColor: 'border-amber-500/30',
      dotColor: 'bg-amber-400',
    },
    {
      key: 'd61_90',
      label: t ? t('dashboard.days61_90') : '61-90 Days Overdue',
      paise: ageing.days61_90Paise,
      count: ageing.counts.d61_90,
      color: 'bg-orange-500',
      textColor: 'text-orange-400',
      bgColor: 'bg-orange-950/20',
      borderColor: 'border-orange-500/30',
      dotColor: 'bg-orange-400',
    },
    {
      key: 'd90Plus',
      label: t ? t('dashboard.days90Plus') : '90+ Days Overdue',
      paise: ageing.days90PlusPaise,
      count: ageing.counts.d90Plus,
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-950/20',
      borderColor: 'border-rose-500/30',
      dotColor: 'bg-rose-400',
    },
  ];

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
            {t ? t('dashboard.ageingTitle') : 'Overdue Ageing Breakdown'}
          </h2>
          <p className="text-xs text-slate-400">
            Total Outstanding: <span className="font-mono font-bold text-slate-100">{formatPaise(ageing.totalToCollectPaise)}</span>
          </p>
        </div>
        <div className="text-xs font-semibold text-rose-300 bg-rose-950/50 px-3 py-1 rounded-lg border border-rose-800/60 self-start sm:self-auto shadow-sm">
          Total Overdue: <span className="font-mono font-bold">{formatPaise(ageing.totalOverduePaise)}</span>
        </div>
      </div>

      {/* Progress Bar with accessible segments */}
      <div className="h-4 w-full bg-slate-900/90 rounded-full flex overflow-hidden my-3 border border-slate-800">
        {segments.map((seg) => {
          const pct = Math.max(0, (seg.paise / total) * 100);
          if (pct === 0) return null;
          return (
            <div
              key={seg.key}
              style={{ width: `${pct}%` }}
              title={`${seg.label}: ${formatPaise(seg.paise)} (${pct.toFixed(1)}%)`}
              className={`${seg.color} transition-all duration-300 relative group`}
            />
          );
        })}
      </div>

      {/* Legend Grid - explicitly showing status word, count, and amount */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2">
        {segments.map((seg) => {
          const pct = ((seg.paise / total) * 100).toFixed(1);
          return (
            <div
              key={seg.key}
              className={`p-3 rounded-xl border ${seg.bgColor} ${seg.borderColor} flex flex-col justify-between`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`w-2 h-2 rounded-full ${seg.dotColor} shrink-0`} />
                <span className="text-[11px] font-bold text-slate-200 truncate" title={seg.label}>
                  {seg.label}
                </span>
              </div>
              <div className="font-mono font-black text-xs sm:text-sm text-white">
                {formatPaise(seg.paise)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between font-mono">
                <span>{seg.count} bills</span>
                <span>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
