import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  ShieldAlert,
  ArrowRight,
  BellRing,
  FileText,
  PhoneCall,
  Bot,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Info,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise } from '../utils/money';
import { formatIndianDate } from '../utils/date';
import { PrintDemandLetterModal } from '../components/PrintDemandLetterModal';

export function ChaseScreen() {
  const { priorityChaseList, business, config, demoDate, customers } = useApp();
  const [selectedDemandInvoice, setSelectedDemandInvoice] = useState(null);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <div className="flex items-center gap-3">
          <span className="p-3 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <Target className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Chase These First
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Receivables requiring direct attention based on overdue duration and working capital impact
            </p>
          </div>
        </div>
      </div>

      {/* Action Guidance Banner */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-xs text-slate-300 shadow-xl flex items-start gap-3.5">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-sm font-bold text-white mb-1">
            Receivables Action Queue:
          </strong>
          <p className="leading-relaxed text-slate-400">
            Invoices listed below have exceeded standard agreed trade terms. Directly engaging these accounts secures incoming capital to comfortably meet upcoming shop expenditures, vendor settlements, and rent obligations without incurring bank overdraft costs.
          </p>
        </div>
      </div>

      {/* Overdue Action Cards List */}
      <div className="space-y-4">
        {priorityChaseList.map((item) => {
          const is30Plus = item.daysOverdue >= 30;

          return (
            <div
              key={item.invoice.id}
              className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl transition-all hover:border-indigo-500/30"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Urgency Indicator, Customer & Reason */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    is30Plus
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {is30Plus ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-white">
                        {item.customer?.name || item.invoice.customerName}
                      </h2>
                      <Link
                        to={`/invoices/${item.invoice.id}`}
                        className="font-mono text-xs text-indigo-400 font-bold hover:underline"
                      >
                        {item.invoice.invoiceNumber}
                      </Link>
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        is30Plus
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.daysOverdue > 0 ? `${item.daysOverdue} Days Overdue` : 'Due Today'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono" title="Calculated Priority Score based on balance amount and days overdue">
                        Score: {Math.round(item.score)}
                      </span>
                    </div>

                    {/* Plain Language Reason in Words */}
                    <p className="text-xs font-medium text-slate-200 leading-relaxed bg-[#090d16]/90 p-3 rounded-xl border border-slate-800">
                      &quot;{item.reason}&quot;
                    </p>

                    <div className="text-[11px] text-slate-400 pt-0.5">
                      Contact: <strong className="text-slate-300">{item.customer?.contactPerson}</strong> • Phone: <span className="font-mono text-slate-300">{item.customer?.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amounts & Quick Escalation Triggers */}
                <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 border-t border-white/[0.08] lg:border-t-0 pt-3 lg:pt-0">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                      Balance Owed
                    </span>
                    <div className="text-xl font-black font-mono text-white mt-0.5">
                      {formatPaise(item.invoice.balanceDuePaise)}
                    </div>
                    <span className="text-xs font-bold text-rose-400 mt-0.5 block">
                      {item.daysOverdue} days past due
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {is30Plus ? (
                      <button
                        onClick={() => setSelectedDemandInvoice(item.invoice)}
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 border border-rose-400/20 cursor-pointer min-h-[44px] transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Demand Letter</span>
                      </button>
                    ) : (
                      <Link
                        to="/followups"
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 border border-indigo-400/20 cursor-pointer min-h-[44px] transition-all"
                      >
                        <BellRing className="w-4 h-4" />
                        <span>Send Reminder</span>
                      </Link>
                    )}

                    <Link
                      to={`/invoices/${item.invoice.id}`}
                      className="p-2.5 text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl transition-all"
                      title="Inspect Invoice"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
    </div>
  );
}
