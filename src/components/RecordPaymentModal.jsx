import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileCheck,
  Landmark,
  FileText,
  DollarSign,
  AlertCircle,
  Zap,
  Banknote
} from 'lucide-react';
import { formatPaise, rupeesToPaise, paiseToRupees } from '../utils/money.js';
import { formatIndianDate } from '../utils/date.js';

export function RecordPaymentModal({ invoice, business, onClose, onPaymentRecorded }) {
  const balancePaise = invoice.balanceDuePaise || 0;
  const grandTotalPaise = invoice.grandTotalPaise || 0;
  const alreadyPaidPaise = invoice.amountPaidPaise || 0;

  // Payment Mode
  const [paymentMode, setPaymentMode] = useState('bank_transfer'); // bank_transfer | cheque | demand_draft | upi | cash

  // Amount in Rupees string
  const defaultRupees = paiseToRupees(balancePaise).toString();
  const [amountRupees, setAmountRupees] = useState(defaultRupees);

  // Common and specific fields
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [referenceNumber, setReferenceNumber] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [chequeDate, setChequeDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Lock body scroll on mount
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Set default sample reference when switching modes
  useEffect(() => {
    if (paymentMode === 'bank_transfer') {
      setReferenceNumber(`UTR${Date.now().toString().slice(-8)}`);
      setBankName('HDFC Bank');
    } else if (paymentMode === 'cheque') {
      setReferenceNumber(Math.floor(100000 + Math.random() * 900000).toString());
      setBankName('State Bank of India');
    } else if (paymentMode === 'demand_draft') {
      setReferenceNumber(`DD-${Math.floor(100000 + Math.random() * 900000)}`);
      setBankName('ICICI Bank');
    } else if (paymentMode === 'upi') {
      setReferenceNumber(`UPI${Date.now().toString().slice(-10)}`);
      setBankName('Bharat UPI');
    } else if (paymentMode === 'cash') {
      setReferenceNumber(`CR-${Math.floor(1000 + Math.random() * 9000)}`);
      setBankName('Cash In Hand');
    }
  }, [paymentMode]);

  const currentEnteredPaise = Math.round((parseFloat(amountRupees) || 0) * 100);
  const remainingAfterPaymentPaise = Math.max(0, balancePaise - currentEnteredPaise);
  const isFullPayment = currentEnteredPaise >= balancePaise;
  const isPartialPayment = currentEnteredPaise > 0 && currentEnteredPaise < balancePaise;

  const handleQuickPercent = (percent) => {
    const targetPaise = Math.round((balancePaise * percent) / 100);
    setAmountRupees(paiseToRupees(targetPaise).toString());
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (currentEnteredPaise <= 0) {
      setError('Please enter a valid payment amount greater than ₹0.');
      return;
    }
    if (currentEnteredPaise > balancePaise) {
      setError(`Payment amount cannot exceed the balance due of ${formatPaise(balancePaise)}.`);
      return;
    }

    onPaymentRecorded({
      invoiceId: invoice.id,
      amountPaise: currentEnteredPaise,
      paymentMode,
      referenceNumber: referenceNumber.trim(),
      bankName: bankName.trim(),
      chequeDate: paymentMode === 'cheque' || paymentMode === 'demand_draft' ? chequeDate : null,
      paymentDate,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-fade-in text-slate-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Record Invoice Settlement</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-indigo-300 font-bold">
                  {invoice.invoiceNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Customer: <strong className="text-slate-200">{invoice.customerName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Outstanding Balance Banner */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Current Outstanding Balance
              </span>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {formatPaise(balancePaise)}
              </div>
              <span className="text-[11px] text-slate-400">
                Grand Total: {formatPaise(grandTotalPaise)} • Previously Paid: {formatPaise(alreadyPaidPaise)}
              </span>
            </div>

            {/* Quick Percentage Presets */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickPercent(100)}
                className="px-3 py-1.5 rounded-lg font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer text-xs"
              >
                100% Full
              </button>
              <button
                type="button"
                onClick={() => handleQuickPercent(50)}
                className="px-3 py-1.5 rounded-lg font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 transition-all cursor-pointer text-xs"
              >
                50% Partial
              </button>
              <button
                type="button"
                onClick={() => handleQuickPercent(25)}
                className="px-3 py-1.5 rounded-lg font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all cursor-pointer text-xs"
              >
                25% Partial
              </button>
            </div>
          </div>

          {/* 1. Payment Instrument / Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Select Payment Instrument / Mode:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'bank_transfer', label: 'Bank Transfer', sub: 'NEFT / RTGS', icon: Landmark },
                { id: 'cheque', label: 'Cheque', sub: 'Bank Cheque', icon: FileCheck },
                { id: 'demand_draft', label: 'Demand Draft', sub: 'Bank DD', icon: FileText },
                { id: 'upi', label: 'Bharat UPI', sub: 'GPay / PhonePe', icon: Zap },
                { id: 'cash', label: 'Cash Receipt', sub: 'Petty Cash', icon: Banknote },
              ].map((item) => {
                const IconComponent = item.icon;
                const active = paymentMode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaymentMode(item.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      active
                        ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs leading-tight">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Amount and Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Amount Received (₹ Rupees) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountRupees}
                  onChange={(e) => {
                    setAmountRupees(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-8 pr-4 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-base font-bold font-mono text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Payment / Realization Date</span>
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 3. Instrument-Specific Details (UTR / Cheque No / DD No / Bank) */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
            <h4 className="font-bold text-indigo-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>Instrument Verification & Reference Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentMode === 'bank_transfer' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Bank Transfer UTR / Transaction No *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFCN26102488921"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs font-mono uppercase text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Remitting / Receiving Bank
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {paymentMode === 'cheque' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Cheque Number (6 digits) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      placeholder="e.g. 482910"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs font-mono uppercase text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Drawn on Bank & Branch
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India, Pune Branch"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Cheque Date
                    </label>
                    <input
                      type="date"
                      value={chequeDate}
                      onChange={(e) => setChequeDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {paymentMode === 'demand_draft' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Demand Draft (DD) Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DD-847291"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs font-mono uppercase text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Issuing Bank & Branch
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ICICI Bank, FC Road Branch"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      DD Issue Date
                    </label>
                    <input
                      type="date"
                      value={chequeDate}
                      onChange={(e) => setChequeDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {paymentMode === 'upi' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      UPI Ref / RRN (12 digits) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 429810394821"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs font-mono uppercase text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Payer VPA / App Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. buyer@okaxis / Google Pay"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {paymentMode === 'cash' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Cash Receipt / Voucher Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CR-1049"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs font-mono uppercase text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Collected By / Counter
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Accounts Desk / Cashier"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Notes / Remarks */}
            <div className="pt-1">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Accountant Remarks / Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Received partial advance via NEFT, balance promised next week"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 4. Live Settlement Calculation & Impact Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Post-Payment Status:</span>
              <div className="mt-1 flex items-center gap-2">
                {isFullPayment ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Paid in Full (Zero Balance)
                  </span>
                ) : isPartialPayment ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                    Partially Paid (Part Payment Recorded)
                  </span>
                ) : (
                  <span className="text-slate-500">Enter payment amount</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-slate-400 block">Balance Remaining:</span>
              <span className="font-mono text-base font-black text-rose-400">
                {formatPaise(remainingAfterPaymentPaise)}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Payment & Credit Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

