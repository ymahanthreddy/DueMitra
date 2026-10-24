import React from 'react';
import { HelpCircle } from 'lucide-react';
import { formatPaise } from '../utils/money';

export function StatCard({
  title,
  tooltip,
  amountPaise,
  amountText,
  subtitle,
  icon: Icon,
  colorScheme = 'indigo',
  alert = false,
}) {
  const colorMap = {
    indigo: {
      bg: 'bg-[#0F172A] border-white/10 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20',
      textGlow: 'text-white',
    },
    rose: {
      bg: 'bg-[#0F172A] border-white/10 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20',
      textGlow: 'text-rose-400',
    },
    amber: {
      bg: 'bg-[#0F172A] border-white/10 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
      textGlow: 'text-amber-400',
    },
    emerald: {
      bg: 'bg-[#0F172A] border-white/10 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
      textGlow: 'text-emerald-400',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.indigo;
  const formattedAmount = amountText || formatPaise(amountPaise);

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 relative overflow-hidden shadow-lg fintech-card ${scheme.bg} ${
        alert ? 'ring-2 ring-rose-500/60 border-rose-500' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-semibold text-slate-400 tracking-wide">{title}</span>
            {tooltip && (
              <span title={tooltip} className="cursor-help text-slate-500 hover:text-slate-300 transition-colors">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div className={`mt-2.5 text-2xl sm:text-3xl font-black font-mono tracking-tight ${scheme.textGlow}`}>
            {formattedAmount}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-2.5 text-xs text-slate-400 font-medium leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
