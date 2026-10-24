import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, FolderArchive, FileText, CheckCircle2, Clock, Scale, ShieldCheck, Download } from 'lucide-react';
import { formatPaise, numberToWordsIndian } from '../utils/money.js';
import { formatIndianDate, getDaysDiff } from '../utils/date.js';

export function EvidencePackModal({ invoice, customer, business = {}, demoDate, onClose }) {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!invoice) return null;

  const daysOverdue = Math.max(0, getDaysDiff(demoDate, invoice.dueDate));
  const contractRef = `TC-AGR/${invoice.invoiceNumber || '2026'}`;

  const handlePrint = () => {
    const el = document.getElementById('printable-evidence-pack');
    if (!el) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=950,height=1050');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>B2B_Trade_Credit_Contract_Evidence_${invoice.invoiceNumber || 'PACK'}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm 12mm; }
            *, *::before, *::after { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #ffffff !important; color: #000000 !important; margin: 0; padding: 15px; font-size: 11.5px; line-height: 1.5; }
            h1, h2, h3, h4, h5, h6, strong, b, th { color: #000000 !important; font-weight: bold; }
            p, span, td, div { color: #0f172a !important; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; font-size: 11px; color: #000000 !important; }
            th, td { border: 1px solid #94a3b8 !important; padding: 6px 8px; font-size: 11px; text-align: left; color: #000000 !important; }
            th { background-color: #f1f5f9 !important; font-weight: bold; color: #000000 !important; }
            .grid { display: flex; flex-direction: row; gap: 16px; }
            .grid > div { flex: 1; }
            .contract-header { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; text-align: center; }
            .contract-badge { display: inline-block; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #4338ca; }
            .contract-title { font-size: 18px; font-weight: 900; text-transform: uppercase; margin: 4px 0; color: #020617; }
            .contract-box { border: 1px solid #cbd5e1; padding: 10px; margin-bottom: 12px; background: #f8fafc; border-radius: 4px; }
            .clause-title { font-weight: bold; color: #0f172a; text-transform: uppercase; font-size: 11px; margin-top: 8px; margin-bottom: 2px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .font-mono { font-family: monospace; }
            .stamp-box { border: 2px dashed #94a3b8; width: 150px; height: 65px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #64748b; text-align: center; margin-top: 6px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .items-end { align-items: flex-end; }
            .divide-y > * + * { border-top: 1px solid #e2e8f0; }
            .bg-slate-50 { background-color: #f8fafc !important; }
            .bg-slate-100 { background-color: #f1f5f9 !important; }
            .bg-slate-900 { background-color: #0f172a !important; color: #ffffff !important; }
            .text-white { color: #ffffff !important; }
            .border { border: 1px solid #cbd5e1; }
            .border-b-2 { border-bottom: 2px solid #0f172a; }
            .border-t-2 { border-top: 2px solid #0f172a; }
          </style>
        </head>
        <body>
          ${el.innerHTML}
          <script>
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.print();
              }, 250);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-4xl h-[92vh] max-h-[92vh] flex flex-col overflow-hidden border border-white/10 text-white relative">
        {/* Controls Bar */}
        <div className="no-print shrink-0 flex items-center justify-between px-6 py-4 bg-[#090d16] text-white border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-indigo-600 rounded-lg">
              <Scale className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Commercial Trade Contract & Evidence Pack • {invoice.invoiceNumber}
              </h2>
              <p className="text-xs text-slate-400">
                Statutory B2B trade credit contract, itemized schedule & recovery audit dossier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all cursor-pointer min-h-[38px]"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close evidence pack"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Dossier Container */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-900/60 flex justify-center items-start">
          <div
            id="printable-evidence-pack"
            className="print-container bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] h-auto p-6 sm:p-10 shadow-md border border-slate-300 text-[12px] leading-relaxed relative flex flex-col justify-between my-4 mb-12 shrink-0"
          >
            <div>
              {/* Official Contract Header */}
              <div className="contract-header border-b-2 border-slate-900 pb-3 mb-4 text-center">
                <span className="contract-badge text-[11px] font-bold uppercase tracking-widest text-indigo-700 block">
                  B2B Trade Credit Agreement & Evidentiary Claim Dossier
                </span>
                <h1 className="contract-title text-xl sm:text-2xl font-black uppercase text-slate-950 mt-1">
                  Commercial Trade Contract & Debt Recovery Pack
                </h1>
                <p className="text-xs text-slate-600">
                  Executed under the Indian Contract Act, 1872 & Micro, Small and Medium Enterprises Development (MSMED) Act, 2006
                </p>
                <div className="mt-2 text-xs font-mono text-slate-500 flex justify-between px-2">
                  <span>Contract Ref: <strong>{contractRef}</strong></span>
                  <span>Invoice: <strong>{invoice.invoiceNumber}</strong></span>
                  <span>Execution Date: <strong>{formatIndianDate(demoDate)}</strong></span>
                </div>
              </div>

              {/* Contracting Parties Matrix */}
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3.5 mb-4 rounded-xs bg-slate-50/80">
                <div className="border-r border-slate-200 pr-3 space-y-1 text-xs">
                  <p className="font-bold text-indigo-900 uppercase text-[11px] tracking-wider">Party of the First Part (Creditor / Supplier):</p>
                  <p className="font-bold text-sm text-slate-950">{business.name || 'Kavach Mobile Accessories'}</p>
                  <p className="text-slate-700">{business.address || 'FC Road, Pune, Maharashtra'}</p>
                  <p className="text-slate-800">
                    <strong>GSTIN:</strong> <span className="font-mono">{business.gstin || '27AABCK1234F1ZZ'}</span>
                  </p>
                  <p className="text-slate-800">
                    <strong>Contact / Email:</strong> {business.phone || '+91 98230 12345'} • {business.email || 'accounts@duemitra.in'}
                  </p>
                </div>

                <div className="pl-2 space-y-1 text-xs">
                  <p className="font-bold text-indigo-900 uppercase text-[11px] tracking-wider">Party of the Second Part (Debtor / Wholesale Buyer):</p>
                  <p className="font-bold text-sm text-slate-950">{customer?.name || invoice.customerName}</p>
                  <p className="text-slate-700">{customer?.address || invoice.customerAddress || 'Wholesale Electronics Hub'}</p>
                  <p className="text-slate-800">
                    <strong>GSTIN:</strong> <span className="font-mono">{customer?.gstin || invoice.customerGstin || 'Unregistered / B2C'}</span>
                  </p>
                  <p className="text-slate-800">
                    <strong>Credit Profile:</strong> Agreed Trade Terms: {customer?.creditDays || 30} Days Maturity
                  </p>
                </div>
              </div>

              {/* Formal Trade Agreement Clauses */}
              <div className="border border-slate-300 p-3.5 mb-4 rounded-xs bg-white text-[11px] space-y-2">
                <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 text-xs">
                  Terms of Trade & Credit Covenant
                </h3>
                <div>
                  <p className="clause-title">1. Supply of Wholesale Inventory & Acceptance:</p>
                  <p className="text-slate-700 leading-normal">
                    The Supplier has sold, delivered, and transferred title of the commercial inventory listed in Schedule A below to the Buyer. The Buyer acknowledged receipt without defect under Invoice <strong>{invoice.invoiceNumber}</strong>.
                  </p>
                </div>
                <div>
                  <p className="clause-title">2. Mandatory Maturity & Statutory Ceiling:</p>
                  <p className="text-slate-700 leading-normal">
                    The agreed credit maturity period is 30 calendar days, concluding on <strong>{formatIndianDate(invoice.dueDate)}</strong>. Under Section 15 of the MSMED Act 2006, the maximum period for payment cannot exceed 45 days.
                  </p>
                </div>
                <div>
                  <p className="clause-title">3. Statutory Penal Interest (Section 16, MSMED Act 2006):</p>
                  <p className="text-slate-700 leading-normal">
                    Failure to settle on or before maturity attracts mandatory compound interest with monthly rests at <strong>three times the RBI Bank Rate (19.50% p.a.)</strong> from the appointed day until full real-time settlement.
                  </p>
                </div>
              </div>

              {/* Schedule A: Itemized Underlying Goods Schedule */}
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5 flex justify-between items-center">
                  <span>Schedule A: Underlying Invoiced Goods & Valuation</span>
                  <span className="font-mono text-[11px] text-slate-500 font-normal">Currency: INR (₹)</span>
                </h3>
                <table className="w-full text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 text-center w-8">#</th>
                      <th className="p-2 border-r border-slate-300">Goods Description</th>
                      <th className="p-2 border-r border-slate-300 text-center w-16">HSN/SAC</th>
                      <th className="p-2 border-r border-slate-300 text-center w-12">Qty</th>
                      <th className="p-2 border-r border-slate-300 text-right w-20">Rate</th>
                      <th className="p-2 border-r border-slate-300 text-right w-20">Taxable</th>
                      <th className="p-2 text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-1.5 border-r border-slate-300 text-center">{idx + 1}</td>
                          <td className="p-1.5 border-r border-slate-300 font-medium">{it.description}</td>
                          <td className="p-1.5 border-r border-slate-300 text-center font-mono">{it.hsnSac || it.hsn || '8504'}</td>
                          <td className="p-1.5 border-r border-slate-300 text-center font-semibold">{it.quantity}</td>
                          <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                            {formatPaise(it.ratePaise)}
                          </td>
                          <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                            {formatPaise(it.taxablePaise || it.lineTotalPaise * 0.85)}
                          </td>
                          <td className="p-1.5 text-right font-mono font-bold">
                            {formatPaise(it.lineTotalPaise)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-2 text-center text-slate-500">
                          Wholesale Mobile & Electronic Accessories Contract Schedule
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="border-t border-slate-400 bg-slate-50 font-bold">
                    <tr>
                      <td colSpan={6} className="p-1.5 text-right border-r border-slate-300">
                        Invoice Total Value:
                      </td>
                      <td className="p-1.5 text-right font-mono">{formatPaise(invoice.grandTotalPaise)}</td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="p-1.5 text-right border-r border-slate-300 text-slate-600">
                        Verified Credits / Partial Receipts:
                      </td>
                      <td className="p-1.5 text-right font-mono text-slate-700">{formatPaise(invoice.amountPaidPaise || 0)}</td>
                    </tr>
                    <tr className="bg-slate-900 text-white font-black">
                      <td colSpan={6} className="p-2 text-right uppercase">
                        Current Outstanding Balance Claimed:
                      </td>
                      <td className="p-2 text-right font-mono text-sm">{formatPaise(invoice.balanceDuePaise)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Schedule B: Chronological Audit Trail of Communications */}
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                  Schedule B: Evidentiary Audit Trail of Notices & Demands
                </h3>
                <div className="border border-slate-300 rounded-xs divide-y divide-slate-200">
                  {invoice.timeline && invoice.timeline.length > 0 ? (
                    invoice.timeline.map((entry, idx) => (
                      <div key={entry.id || idx} className="p-2.5 text-xs flex items-start gap-2.5">
                        <span className="p-1 bg-slate-100 text-slate-700 rounded-full shrink-0 mt-0.5 border border-slate-300">
                          <CheckCircle2 className="w-3 h-3 text-indigo-700" />
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className="font-bold text-slate-900 text-xs">{entry.title}</span>
                            <span className="text-slate-500 font-mono text-[11px]">{formatIndianDate(entry.date)}</span>
                          </div>
                          <p className="text-slate-700 text-[11px] leading-tight">{entry.detail}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-slate-500 text-xs">
                      Primary Invoicing Notice issued. Pre-demand heads-up communications active on record.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Execution Signatures & Affirmation Block */}
            <div className="pt-3 border-t-2 border-slate-900 mt-4 text-xs">
              <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2">
                Execution & Legal Affirmation under Information Technology Act, 2000:
              </p>
              <div className="grid grid-cols-2 gap-8 items-end">
                <div>
                  <p className="font-bold text-slate-900">Signed on behalf of Supplier (Creditor):</p>
                  <div className="stamp-box">
                    <span>OFFICIAL SEAL & SIGNATURE<br/>{business.name || 'Creditor'}</span>
                  </div>
                  <p className="font-bold text-slate-900 mt-2">{business.authorizedSignatory || 'Authorized Officer'}</p>
                  <p className="text-slate-600 text-[11px]">{business.designation || 'Proprietor'} • {business.name}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900">Wholesale Buyer Acknowledgment (Debtor):</p>
                  <div className="stamp-box ml-auto">
                    <span>TRADE ACCEPTANCE STAMP<br/>{customer?.name || invoice.customerName}</span>
                  </div>
                  <p className="font-bold text-slate-900 mt-2">{customer?.contactPerson || 'Authorized Representative'}</p>
                  <p className="text-slate-600 text-[11px]">Trade Receiver • GSTIN: {customer?.gstin || 'B2B Client'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
