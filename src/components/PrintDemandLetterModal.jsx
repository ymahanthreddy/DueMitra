import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, ShieldAlert, PhoneCall, ExternalLink, Scale, Activity, CheckCircle2 } from 'lucide-react';
import { formatPaise, paiseToRupees, numberToWordsIndian, calculateMsmeInterestPaise } from '../utils/money.js';
import { formatIndianDate, addDays, getDaysDiff } from '../utils/date.js';
import { sendN8nWebhook } from '../utils/n8n.js';
import { useApp } from '../context/AppContext';

export function PrintDemandLetterModal({ invoice, invoices = [], customer, business = {}, config, demoDate, onClose }) {
  const { notifyN8nEvent, autoReminderSettings } = useApp();
  const isBilingual = Boolean(autoReminderSettings?.bilingualMarathi);
  const [includeInterest, setIncludeInterest] = useState(false);
  const [n8nDispatched, setN8nDispatched] = useState(false);
  const scrollContainerRef = useRef(null);

  // Lock body scroll and listen for Escape key to close
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Allow single invoice or list of overdue invoices for this customer
  const targetInvoices = invoices.length > 0 ? invoices : (invoice ? [invoice] : []);

  const letterDate = demoDate || '2026-10-23';
  const graceDays = config?.demandLetterGraceDays || 7;
  const deadlineDate = addDays(letterDate, graceDays);

  // Compute principal owed across listed invoices
  const totalPrincipalOwedPaise = targetInvoices.reduce((sum, inv) => sum + (inv.balanceDuePaise || 0), 0);

  // Max overdue days among listed invoices
  const maxDaysOverdue = targetInvoices.length > 0
    ? Math.max(...targetInvoices.map(inv => Math.max(0, getDaysDiff(letterDate, inv.dueDate))))
    : 0;

  // Calculate MSMED Act interest (3x RBI Bank Rate with monthly rests)
  const annualInterestRate = (config?.rbiBankRatePercent || 6.5) * (config?.msmeInterestMultiplier || 3); // 19.5%
  const totalMsmeInterestPaise = targetInvoices.reduce((sum, inv) => {
    const overdueDays = Math.max(0, getDaysDiff(letterDate, inv.dueDate));
    return sum + calculateMsmeInterestPaise(inv.balanceDuePaise, overdueDays, annualInterestRate);
  }, 0);

  const grandTotalDemandedPaise = totalPrincipalOwedPaise + (includeInterest ? totalMsmeInterestPaise : 0);

  const upiUrl = `upi://pay?pa=${encodeURIComponent(business?.upiId || '')}&pn=${encodeURIComponent(
    business?.name || ''
  )}&am=${(grandTotalDemandedPaise / 100).toFixed(2)}&tn=${encodeURIComponent(
    `Demand ${targetInvoices[0]?.invoiceNumber || ''}`
  )}&cu=INR`;

  const is45DaysPlus = maxDaysOverdue >= 45;

  // Real-time n8n alert trigger on Demand Letter generation
  useEffect(() => {
    if (targetInvoices.length === 0) return;
    if (config?.n8n?.webhookUrl) {
      const payload = {
        event: 'demand_letter_issued',
        invoiceNumber: targetInvoices[0]?.invoiceNumber,
        customerName: customer?.name || targetInvoices[0]?.customerName,
        principalOwedPaise: totalPrincipalOwedPaise,
        msmeInterestIncluded: includeInterest,
        msmeInterestPaise: includeInterest ? totalMsmeInterestPaise : 0,
        grandTotalDemandedPaise,
        deadlineDate,
        maxDaysOverdue,
        timestamp: new Date().toISOString()
      };

      sendN8nWebhook(config.n8n.webhookUrl, 'demand_letter_issued', payload)
        .then(() => {
          setN8nDispatched(true);
          if (notifyN8nEvent) {
            notifyN8nEvent('Demand Letter Alert Dispatched to n8n', `${customer?.name || 'Customer'} (₹${(grandTotalDemandedPaise / 100).toLocaleString('en-IN')})`);
          }
        })
        .catch(() => {});
    }
  }, [includeInterest]);

  if (targetInvoices.length === 0) return null;

  const handlePrint = () => {
    const el = document.getElementById('printable-demand-letter');
    if (!el) {
      window.print();
      return;
    }
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment_Demand_Letter_${customer?.name || 'Customer'}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            * { box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff !important; color: #000000 !important; margin: 0; padding: 20px; font-size: 13px; line-height: 1.6; }
            h1, h2, h3, h4, h5, h6, strong, b, th { color: #000000 !important; font-weight: bold; }
            p, span, div, td { color: #0f172a !important; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; color: #000000 !important; }
            th, td { border: 1px solid #94a3b8 !important; padding: 7px 10px; font-size: 12px; color: #000000 !important; }
            th { background-color: #f1f5f9 !important; font-weight: bold; }
            .border { border: 1px solid #94a3b8 !important; }
            .border-b-2 { border-bottom: 2px solid #000000 !important; }
            .border-b { border-bottom: 1px solid #cbd5e1 !important; }
            .border-r { border-right: 1px solid #cbd5e1 !important; }
            .border-t { border-top: 1px solid #cbd5e1 !important; }
            .p-3 { padding: 12px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .font-mono { font-family: monospace; }
            .uppercase { text-transform: uppercase; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .bg-slate-50 { background-color: #f8fafc !important; }
          </style>
        </head>
        <body>
          ${el.innerHTML}
          <script>
            setTimeout(() => {
              window.print();
            }, 350);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-4xl h-[94vh] max-h-[94vh] flex flex-col overflow-hidden border border-white/10 text-white relative">
        {/* Controls Toolbar (hidden during print) */}
        <div className="no-print shrink-0 flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#090d16] text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-xl shadow-[0_0_12px_rgba(244,63,94,0.25)]">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white leading-tight">Payment Demand Letter</h2>
                {n8nDispatched && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>n8n Alert Dispatched</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Official B2B Commercial Demand (Non-Litigation • 7-day cure period)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {business?.isUdyamRegistered && (
              <label className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/25 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeInterest}
                  onChange={(e) => setIncludeInterest(e.target.checked)}
                  className="rounded text-indigo-500 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span>Include MSME Interest ({formatPaise(totalMsmeInterestPaise)})</span>
              </label>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all cursor-pointer min-h-[38px]"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close demand letter"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 45+ Days Next Steps Banner (Owner Advice - hidden in print) */}
        {is45DaysPlus && (
          <div className="no-print shrink-0 bg-amber-950/40 border-b border-amber-500/30 px-6 py-3">
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200">
                <p className="font-bold text-sm text-amber-300">
                  Recommended Owner Next Steps ({maxDaysOverdue} Days Overdue - Beyond 45-day statutory limit)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  <a
                    href={`tel:${customer?.phone || targetInvoices[0]?.customerPhone || ''}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#090d16] border border-amber-500/30 rounded-lg text-amber-200 font-semibold hover:border-amber-400 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                    <span>1. Direct Call ({customer?.phone || targetInvoices[0]?.customerPhone || 'N/A'})</span>
                  </a>
                  <div className="px-3 py-1.5 bg-[#090d16] border border-amber-500/30 rounded-lg text-amber-200 font-semibold">
                    <span>2. Consult Legal Practitioner</span>
                  </div>
                  <a
                    href="https://samadhaan.msme.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-indigo-300 font-semibold hover:border-indigo-400 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                    <span>3. MSME Samadhaan Portal</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Printable Demand Letter Container */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-2 sm:p-6 bg-slate-900/60 flex justify-center items-start">
          <div
            id="printable-demand-letter"
            className="print-container bg-white text-slate-900 w-full max-w-3xl min-h-[297mm] h-auto p-6 sm:p-10 shadow-2xl border border-slate-300 text-[13px] leading-relaxed relative flex flex-col justify-between rounded-sm my-4 mb-12 shrink-0"
          >
            <div>
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-950">
                  Payment Demand Letter
                </h1>
                {isBilingual && (
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    थकीत रक्कम मागणी पत्र (PAYMENT DEMAND LETTER)
                  </p>
                )}
                <p className="text-[11px] text-slate-600 font-medium mt-1">
                  Commercial Credit Recovery Notice • Strictly Non-Litigation Requisition
                </p>
              </div>

              {/* Mandatory Non-Legal Notice Disclaimer */}
              <div className="bg-amber-50/80 border border-amber-300 p-3 rounded-md text-xs text-amber-950 mb-5 font-medium leading-relaxed">
                <strong>Important Notice: </strong>
                This letter is from <strong>{business?.name || 'Kavach Mobile Accessories'}</strong> about money owed for the invoices listed below. It is not a notice from the GST department and not a legal notice from a lawyer.
              </div>

              {/* Sender & Receiver Meta Grid */}
              <div className="grid grid-cols-2 gap-6 pb-4 border-b border-slate-200 text-xs mb-4">
                <div>
                  <span className="font-bold uppercase text-slate-500 block mb-0.5">From (Creditor):</span>
                  <p className="font-bold text-sm text-slate-900">{business?.name}</p>
                  <p className="text-slate-600">{business?.address}</p>
                  <p className="text-slate-600">{business?.city}, {business?.state} - {business?.pincode}</p>
                  <p className="text-slate-600 mt-1"><strong>GSTIN:</strong> {business?.gstin}</p>
                  {business?.isUdyamRegistered && (
                    <p className="text-slate-600"><strong>Udyam Reg:</strong> {business?.udyamNumber} ({business?.enterpriseType} Enterprise)</p>
                  )}
                  <p className="text-slate-600"><strong>Contact:</strong> {business?.phone} • {business?.email}</p>
                </div>

                <div className="text-right">
                  <span className="font-bold uppercase text-slate-500 block mb-0.5">To (Debtor / Trade Buyer):</span>
                  <p className="font-bold text-sm text-slate-900">{customer?.name || targetInvoices[0]?.customerName}</p>
                  <p className="text-slate-600">{customer?.address || targetInvoices[0]?.customerAddress || 'Pune, Maharashtra'}</p>
                  <p className="text-slate-600"><strong>GSTIN:</strong> {customer?.gstin || targetInvoices[0]?.customerGstin || 'Unregistered'}</p>
                  <p className="text-slate-600"><strong>Contact Person:</strong> {customer?.contactPerson || 'Proprietor'}</p>
                  <p className="text-slate-600"><strong>Phone:</strong> {customer?.phone || targetInvoices[0]?.customerPhone}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200 text-slate-700">
                    <p><strong>Letter Date:</strong> {formatIndianDate(letterDate)}</p>
                    <p className="text-rose-700 font-bold"><strong>Pay Deadline:</strong> {formatIndianDate(deadlineDate)} (7 Days)</p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-4 text-xs font-bold text-slate-900">
                SUBJECT: DEMAND FOR IMMEDIATE SETTLEMENT OF OVERDUE COMMERCIAL INVOICE(S) — ₹{(grandTotalDemandedPaise / 100).toLocaleString('en-IN')}
              </div>

              {/* Body Letter Content */}
              <div className="space-y-3 text-xs text-slate-800 leading-relaxed mb-5">
                <p>Dear {customer?.contactPerson || 'Sir / Madam'},</p>
                <p>
                  We are writing from <strong>{business?.name || 'Kavach Creditor'}</strong> regarding your trade credit account. Our records show that payment for the accessory consignment(s) detailed below has crossed the agreed 30-day credit period and remains unpaid despite earlier reminders.
                </p>

                {/* Overdue Invoices Table */}
                <table className="w-full text-left text-xs border border-slate-300 border-collapse my-3">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300">Invoice No.</th>
                      <th className="p-2 border-r border-slate-300">Invoice Date</th>
                      <th className="p-2 border-r border-slate-300">Due Date</th>
                      <th className="p-2 text-right border-r border-slate-300">Total Billed</th>
                      <th className="p-2 text-right border-r border-slate-300">Part Paid</th>
                      <th className="p-2 text-right">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {targetInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="p-2 font-mono font-bold border-r border-slate-200">{inv.invoiceNumber}</td>
                        <td className="p-2 border-r border-slate-200">{formatIndianDate(inv.invoiceDate)}</td>
                        <td className="p-2 border-r border-slate-200 font-bold text-rose-700">{formatIndianDate(inv.dueDate)}</td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">{formatPaise(inv.grandTotalPaise)}</td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">{formatPaise(inv.amountPaidPaise || 0)}</td>
                        <td className="p-2 text-right font-mono font-black text-rose-700">{formatPaise(inv.balanceDuePaise)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <td colSpan={5} className="p-2 text-right">Total Principal Overdue:</td>
                      <td className="p-2 text-right font-mono font-black text-slate-900">{formatPaise(totalPrincipalOwedPaise)}</td>
                    </tr>
                    {includeInterest && (
                      <tr className="bg-amber-50/70 text-amber-950 font-semibold border-t border-amber-200">
                        <td colSpan={5} className="p-2 text-right">
                          Statutory MSMED Act Interest (at 3x RBI Bank Rate = {annualInterestRate}% compound):
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-amber-900">{formatPaise(totalMsmeInterestPaise)}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-900 text-white font-black text-sm">
                      <td colSpan={5} className="p-2.5 text-right uppercase">Total Amount Demanded:</td>
                      <td className="p-2.5 text-right font-mono">{formatPaise(grandTotalDemandedPaise)}</td>
                    </tr>
                  </tfoot>
                </table>

                <p>
                  <strong>Amount in Words: </strong>
                  <span className="font-serif italic font-bold">{numberToWordsIndian(grandTotalDemandedPaise)}</span>
                </p>

                {/* MSMED Statutory Statement if Udyam registered */}
                {business?.isUdyamRegistered && (
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded text-[12px] leading-relaxed text-slate-800">
                    <strong>Statutory Factual Statement: </strong>
                    Under the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006, buyers are required to make payment to micro and small suppliers within the agreed period (which cannot legally exceed 45 days). Section 16 of the Act mandates compound interest with monthly rests at three times the RBI bank rate on delayed payments.
                  </div>
                )}

                <p>
                  Please clear this balance on or before <strong>{formatIndianDate(deadlineDate)}</strong>. Uninterrupted accessory supplies to your store depend on timely settlement so we can maintain our commitments to our distributors.
                </p>
              </div>

              {/* Payment Instructions & Live UPI QR */}
              <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 grid grid-cols-3 gap-4 items-center mb-6">
                <div className="col-span-2 text-xs space-y-1">
                  <h3 className="font-black text-slate-950 uppercase mb-1">How to Settle this Bill:</h3>
                  <p><strong>Bank:</strong> HDFC Bank Ltd (FC Road Branch, Pune)</p>
                  <p><strong>A/C Name:</strong> {business?.name}</p>
                  <p><strong>A/C No:</strong> <span className="font-mono font-bold">{business?.accountNumber}</span></p>
                  <p><strong>IFSC:</strong> <span className="font-mono font-bold">{business?.ifscCode}</span></p>
                  <p><strong>UPI ID / VPA:</strong> <span className="font-mono font-bold text-indigo-700">{business?.upiId}</span></p>
                  <p className="text-[11px] text-slate-500 pt-1">
                    *After remitting, please reply with your UTR / transaction receipt.
                  </p>
                </div>

                <div className="text-center flex flex-col items-center border-l border-slate-300 pl-4">
                  <div className="p-2 bg-white border border-slate-300 rounded-md shadow-xs">
                    <QRCodeSVG value={upiUrl} size={90} level="M" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 mt-1 uppercase">Scan with Any UPI App</span>
                </div>
              </div>

              {/* Disputed Invoices Contact */}
              <div className="text-xs text-slate-600 border-t border-slate-200 pt-3">
                <p>
                  <strong>Disputes or Inquiries: </strong>
                  If there is any transit damage, discrepancy in item counts, or return credit pending, please contact our accounts desk directly at <strong>{business?.phone}</strong> or <strong>{business?.email}</strong> within 3 days so we can review and rectify before the payment deadline.
                </p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs">
              <div>
                <p className="text-slate-500">Authorized Commercial Signatory</p>
                <p className="font-bold text-slate-900 mt-6">{business?.name || 'Kavach Mobile Accessories'} (Store Account)</p>
                <p className="text-slate-600">{business?.city}, {business?.state}</p>
              </div>
              <div className="text-right text-[11px] text-slate-400 font-mono">
                System Generated via DueMitra ERP • Ref: DEMAND-{targetInvoices[0]?.invoiceNumber?.replace(/[^a-zA-Z0-9]/g, '')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
