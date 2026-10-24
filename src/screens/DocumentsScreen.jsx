import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  FileText,
  Printer,
  ShieldAlert,
  Clock,
  Eye,
  ChevronRight,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise } from '../utils/money';
import { formatIndianDate, getDaysDiff } from '../utils/date';
import { PrintInvoiceModal } from '../components/PrintInvoiceModal';
import { PrintDemandLetterModal } from '../components/PrintDemandLetterModal';
import { EvidencePackModal } from '../components/EvidencePackModal';

export function DocumentsScreen() {
  const { invoices, customers, business, config, demoDate } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [selectedDemandInvoice, setSelectedDemandInvoice] = useState(null);
  const [selectedEvidenceInvoice, setSelectedEvidenceInvoice] = useState(null);

  const filtered = invoices.filter((inv) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      inv.invoiceNumber.toLowerCase().includes(searchLower) ||
      inv.customerName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Documents & Evidence Dossiers
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Access complete print-ready A4 documentation: Tax Invoices, Payment Demand Letters, and full Evidence Packs
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents by invoice number or customer name..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#090d16] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((inv) => {
          const daysOverdue = Math.max(0, getDaysDiff(demoDate, inv.dueDate));
          const customer = customers.find((c) => c.id === inv.customerId);
          const eventsCount = inv.timeline?.length || 1;

          return (
            <div
              key={inv.id}
              className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col justify-between hover:border-indigo-500/30 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {inv.invoiceNumber}
                    </span>
                    <h2 className="text-base font-bold text-white mt-0.5">{inv.customerName}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">Total</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {formatPaise(inv.grandTotalPaise)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1.5 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span>Issued: <strong className="text-slate-300">{formatIndianDate(inv.invoiceDate)}</strong></span>
                    <span>•</span>
                    <span>Due: <strong className="text-slate-300">{formatIndianDate(inv.dueDate)}</strong></span>
                  </div>
                  <div>
                    Timeline Events: <strong className="text-indigo-300">{eventsCount} logged entries</strong> (Reminders, Notices, Payments)
                  </div>
                  {daysOverdue > 0 && inv.balanceDuePaise > 0 && (
                    <div className="text-rose-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Outstanding: <strong className="text-white font-mono">{formatPaise(inv.balanceDuePaise)}</strong> ({daysOverdue} days overdue)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Documents */}
              <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
                {/* 1. Tax Invoice Print */}
                <button
                  onClick={() => setSelectedInvoiceForPrint(inv)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-all min-h-[38px]"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tax Invoice</span>
                </button>

                {/* 2. Download Evidence Pack */}
                <button
                  onClick={() => setSelectedEvidenceInvoice(inv)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 border border-indigo-400/20 cursor-pointer transition-all min-h-[38px]"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Evidence Pack (PDF)</span>
                </button>

                {/* 3. Payment Demand Letter */}
                {daysOverdue >= 30 && inv.balanceDuePaise > 0 && (
                  <button
                    onClick={() => setSelectedDemandInvoice(inv)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 border border-rose-400/20 cursor-pointer transition-all min-h-[38px]"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Demand Letter</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tax Invoice Modal */}
      {selectedInvoiceForPrint && (
        <PrintInvoiceModal
          invoice={selectedInvoiceForPrint}
          business={business}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}

      {/* Demand Letter Modal */}
      {selectedDemandInvoice && (
        <PrintDemandLetterModal
          invoice={selectedDemandInvoice}
          customer={customers.find((c) => c.id === selectedDemandInvoice.customerId)}
          business={business}
          config={config}
          demoDate={demoDate}
          onClose={() => setSelectedDemandInvoice(null)}
        />
      )}

      {/* Evidence Pack Modal */}
      {selectedEvidenceInvoice && (
        <EvidencePackModal
          invoice={selectedEvidenceInvoice}
          customer={customers.find((c) => c.id === selectedEvidenceInvoice.customerId)}
          business={business}
          demoDate={demoDate}
          onClose={() => setSelectedEvidenceInvoice(null)}
        />
      )}
    </div>
  );
}
