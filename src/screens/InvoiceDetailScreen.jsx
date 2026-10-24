import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Printer,
  FolderArchive,
  ShieldAlert,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Bot,
  PhoneCall,
  Landmark,
  CreditCard,
  FileCheck,
  Zap,
  Banknote,
  QrCode
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise, numberToWordsIndian } from '../utils/money';
import { formatIndianDate, getDaysDiff } from '../utils/date';
import { PrintInvoiceModal } from '../components/PrintInvoiceModal';
import { PrintDemandLetterModal } from '../components/PrintDemandLetterModal';
import { EvidencePackModal } from '../components/EvidencePackModal';
import { ElevenLabsCallModal } from '../components/ElevenLabsCallModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';

export function InvoiceDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, customers, business, config, demoDate, recordInvoicePayment } = useApp();

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showElevenLabsModal, setShowElevenLabsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const invoice = invoices.find((inv) => inv.id === id || inv.invoiceNumber === id);

  if (!invoice) {
    return (
      <div className="p-12 text-center bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white">Invoice not found</h2>
        <Link to="/invoices" className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block font-medium">
          Return to Invoices List
        </Link>
      </div>
    );
  }

  const customer = customers.find((c) => c.id === invoice.customerId);
  const daysOverdue = Math.max(0, getDaysDiff(demoDate, invoice.dueDate));
  const payUrl = `${window.location.origin}/pay/${invoice.token || invoice.id}`;

  const grandTotalRupees = (invoice.balanceDuePaise / 100).toFixed(2);
  const upiUrl = `upi://pay?pa=${encodeURIComponent(business?.upiId || 'kavach@okhdfcbank')}&pn=${encodeURIComponent(
    business?.name || 'Kavach Mobile Accessories'
  )}&am=${grandTotalRupees}&tn=${encodeURIComponent(invoice.invoiceNumber)}&cu=INR`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(payUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSimulateInstantUpi = () => {
    if (invoice.balanceDuePaise <= 0) return;
    recordInvoicePayment({
      invoiceId: invoice.id,
      amountPaise: invoice.balanceDuePaise,
      paymentMode: 'upi',
      referenceNumber: `UPI/RRN${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`,
      bankName: 'Bharat UPI (Instant)',
      paymentDate: demoDate || new Date().toISOString().split('T')[0],
      notes: 'Customer scanned Bharat UPI QR code for instant settlement',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
      case 'overdue':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
      case 'disputed':
        return 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]';
      default:
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2.5 bg-slate-900/80 border border-slate-700/70 hover:border-indigo-500/50 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
            aria-label="Back to Invoices"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white font-mono tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Issued <strong className="text-slate-300">{formatIndianDate(invoice.invoiceDate)}</strong></span>
              <span>•</span>
              <span>Due <strong className="text-slate-300">{formatIndianDate(invoice.dueDate)}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 border border-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
          >
            <Landmark className="w-4 h-4 text-emerald-200" />
            <span>Record Payment / Settlement</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer min-h-[44px]"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Tax Invoice (PDF)</span>
          </button>

          <button
            onClick={() => setShowEvidenceModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/20 transition-all cursor-pointer min-h-[44px]"
          >
            <FolderArchive className="w-4 h-4 text-indigo-200" />
            <span>Evidence Pack</span>
          </button>

          {daysOverdue >= 30 && invoice.balanceDuePaise > 0 && (
            <button
              onClick={() => setShowDemandModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-500/20 border border-rose-400/20 transition-all cursor-pointer min-h-[44px]"
            >
              <ShieldAlert className="w-4 h-4 text-rose-200" />
              <span>Demand Letter</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            title="Copy Public Customer Pay Link"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl shadow-sm transition-all cursor-pointer min-h-[44px]"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedLink ? 'Copied Link' : 'Customer Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Details Left, Timeline Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Customer & Bill Itemization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Summary Card */}
          <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Buyer Details
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">{invoice.customerName}</h3>
                <p className="text-xs text-slate-400 mt-1">{invoice.customerAddress || 'Pune, Maharashtra'}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
                  <span className="font-mono bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
                    GSTIN: <strong className="text-slate-200">{invoice.customerGstin || 'Unregistered'}</strong>
                  </span>
                  <span className="font-mono bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
                    State: <strong className="text-slate-200">{invoice.customerStateCode}</strong>
                  </span>
                </div>
              </div>

              {customer && (
                <div className="bg-[#090d16]/80 border border-slate-800/90 rounded-xl p-3.5 text-xs space-y-1.5 min-w-[210px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-400">Credit Terms:</span>
                    <span className="font-bold px-2 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {customer.creditDays || 30} Days
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Avg Delay:</span>
                    <strong className="text-slate-200">{customer.avgDaysLate} days</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>On-Time Rate:</span>
                    <strong className="text-emerald-400">{customer.onTimePaymentRate}%</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-white/[0.03] border-b border-white/10 font-bold text-sm text-white flex items-center justify-between">
              <span>Supplied Mobile Accessories Items</span>
              <span className="text-xs text-slate-400 font-normal">{invoice.items.length} items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/10">
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">Item Description</th>
                    <th className="p-3.5 text-center">HSN</th>
                    <th className="p-3.5 text-center">Qty</th>
                    <th className="p-3.5 text-right">Rate</th>
                    <th className="p-3.5 text-right">Taxable</th>
                    <th className="p-3.5 text-right">GST</th>
                    <th className="p-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {invoice.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-3.5 font-medium text-slate-200">{it.description}</td>
                      <td className="p-3.5 text-center font-mono text-slate-400">{it.hsnSac || it.hsn}</td>
                      <td className="p-3.5 text-center font-bold text-white">{it.quantity}</td>
                      <td className="p-3.5 text-right font-mono text-slate-300">{formatPaise(it.ratePaise)}</td>
                      <td className="p-3.5 text-right font-mono text-slate-300">{formatPaise(it.taxablePaise)}</td>
                      <td className="p-3.5 text-right font-mono text-indigo-400">{it.gstRate}%</td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">
                        {formatPaise(it.lineTotalPaise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-white/[0.02] border-t-2 border-white/10 text-xs">
                  <tr>
                    <td colSpan={7} className="p-2.5 text-right text-slate-400 font-medium">Taxable Value:</td>
                    <td className="p-2.5 text-right font-mono text-slate-200 font-bold">{formatPaise(invoice.taxableTotalPaise)}</td>
                  </tr>
                  <tr>
                    <td colSpan={7} className="p-2 text-right text-slate-400 font-medium">Total GST:</td>
                    <td className="p-2 text-right font-mono text-indigo-300 font-bold">{formatPaise(invoice.totalTaxPaise)}</td>
                  </tr>
                  {invoice.roundOffPaise !== 0 && (
                    <tr>
                      <td colSpan={7} className="p-1.5 text-right text-slate-500 font-medium">Round Off:</td>
                      <td className="p-1.5 text-right font-mono text-slate-400">{formatPaise(invoice.roundOffPaise)}</td>
                    </tr>
                  )}
                  <tr className="bg-white/[0.04] border-t border-b border-white/10 text-white font-black text-sm">
                    <td colSpan={7} className="p-3.5 text-right uppercase tracking-wider text-slate-300">Grand Total:</td>
                    <td className="p-3.5 text-right font-mono text-base text-white">{formatPaise(invoice.grandTotalPaise)}</td>
                  </tr>
                  <tr className="bg-emerald-500/10 text-emerald-300 font-semibold border-b border-emerald-500/20">
                    <td colSpan={7} className="p-2.5 text-right">Amount Received:</td>
                    <td className="p-2.5 text-right font-mono text-emerald-400 font-bold">{formatPaise(invoice.amountPaidPaise || 0)}</td>
                  </tr>
                  <tr className="bg-rose-500/10 text-rose-300 font-black">
                    <td colSpan={7} className="p-3 text-right uppercase tracking-wider">Balance Remaining:</td>
                    <td className="p-3 text-right font-mono text-rose-400 text-base">{formatPaise(invoice.balanceDuePaise)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-3.5 bg-white/[0.02] text-xs text-slate-400 border-t border-white/10">
              <span className="text-slate-500">Amount in Words: </span>
              <span className="font-serif italic font-bold text-slate-300">{numberToWordsIndian(invoice.grandTotalPaise)}</span>
            </div>
          </div>

          {/* Payment Receipts & Instrument Ledger */}
          <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-b border-white/10 font-bold text-sm text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Payment Receipts & Instrument Ledger</span>
              </div>
              <div className="flex items-center gap-2">
                {invoice.status === 'paid' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Paid in Full (₹0 Balance)
                  </span>
                ) : invoice.amountPaidPaise > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    Partially Paid ({formatPaise(invoice.amountPaidPaise)} Cleared)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    Unpaid (Full Balance Due)
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  + Add Payment
                </button>
              </div>
            </div>

            {invoice.payments && invoice.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/10">
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Payment Instrument</th>
                      <th className="p-3.5">Reference / UTR / Cheque #</th>
                      <th className="p-3.5">Drawn Bank / Details</th>
                      <th className="p-3.5">Notes</th>
                      <th className="p-3.5 text-right">Amount Credited</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {invoice.payments.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 font-mono text-slate-300">
                          {formatIndianDate(p.date)}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            p.paymentMode === 'bank_transfer'
                              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                              : p.paymentMode === 'cheque'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : p.paymentMode === 'demand_draft'
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                              : p.paymentMode === 'upi'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
                          }`}>
                            {p.modeLabel || p.paymentMode}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">
                          {p.referenceNumber || 'N/A'}
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {p.bankName || 'Direct'}
                          {p.chequeDate ? ` (Dated ${formatIndianDate(p.chequeDate)})` : ''}
                        </td>
                        <td className="p-3.5 text-slate-400 max-w-xs truncate">
                          {p.notes || '-'}
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-emerald-400 text-sm">
                          +{formatPaise(p.amountPaise)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-2">
                <Landmark className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">
                  No payment instruments recorded yet on this invoice.
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Click <strong>&quot;Record Payment / Settlement&quot;</strong> above to record NEFT/RTGS UTR transfers, Cheques, Demand Drafts, Bharat UPI, or Cash partial settlements.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Comprehensive Timeline of Events */}
        <div className="space-y-6">
          <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Invoice Timeline & History</span>
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700/80">
              {invoice.timeline && invoice.timeline.length > 0 ? (
                invoice.timeline.map((event, idx) => (
                  <div key={event.id || idx} className="relative">
                    {/* Glowing bullet */}
                    <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 ring-4 ring-[#0f172a] shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="text-xs font-bold text-slate-200">{event.title}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatIndianDate(event.date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed bg-[#090d16]/80 p-2.5 rounded-xl border border-slate-800">
                        {event.detail}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No events logged yet.</p>
              )}
            </div>
          </div>

          {/* Dynamic Bharat UPI QR & Instant Settlement */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-[#0e1629] via-[#0f172a] to-[#090d16] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Bharat UPI Instant Pay
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    VPA: {business?.upiId || 'kavach@okhdfcbank'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                0% MDR
              </span>
            </div>

            {invoice.balanceDuePaise > 0 ? (
              <div className="bg-white p-3.5 rounded-xl flex flex-col items-center justify-center shadow-inner my-3">
                <QRCodeSVG
                  value={upiUrl}
                  size={150}
                  level="M"
                  includeMargin={false}
                  className="rounded"
                />
                <div className="text-center mt-2.5">
                  <span className="text-[11px] font-bold text-slate-800 font-mono">
                    ₹{grandTotalRupees}
                  </span>
                  <p className="text-[9px] text-slate-500 font-medium">
                    Scan via PhonePe, GPay, Paytm, or BHIM
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center my-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-emerald-300">Invoice Fully Settled</p>
                <p className="text-[11px] text-slate-400">Zero outstanding balance remaining.</p>
              </div>
            )}

            {invoice.balanceDuePaise > 0 && (
              <button
                type="button"
                onClick={handleSimulateInstantUpi}
                className="w-full mb-3 flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span>Simulate Instant UPI Settlement</span>
              </button>
            )}

            {/* Public Customer View Link */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 text-[11px]">Customer Payment Link</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px] font-medium"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <a
                href={payUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Open Public Pay Portal</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPrintModal && (
        <PrintInvoiceModal
          invoice={invoice}
          business={business}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {showDemandModal && (
        <PrintDemandLetterModal
          invoice={invoice}
          customer={customer}
          business={business}
          config={config}
          demoDate={demoDate}
          onClose={() => setShowDemandModal(false)}
        />
      )}

      {showEvidenceModal && (
        <EvidencePackModal
          invoice={invoice}
          customer={customer}
          business={business}
          demoDate={demoDate}
          onClose={() => setShowEvidenceModal(false)}
        />
      )}

      {/* ElevenLabs AI Voice Call Modal */}
      {showElevenLabsModal && (
        <ElevenLabsCallModal
          isOpen={showElevenLabsModal}
          onClose={() => setShowElevenLabsModal(false)}
          customer={customer || { name: invoice.customerName, phone: invoice.customerPhone || '+91 94834 10461' }}
          invoice={invoice}
          business={business}
          onCallCompleted={() => setShowElevenLabsModal(false)}
        />
      )}

      {/* Record Payment / Settlement Modal */}
      {showPaymentModal && (
        <RecordPaymentModal
          invoice={invoice}
          business={business}
          onClose={() => setShowPaymentModal(false)}
          onPaymentRecorded={(paymentData) => {
            recordInvoicePayment(paymentData);
          }}
        />
      )}
    </div>
  );
}
