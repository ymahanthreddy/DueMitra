import React, { useState, useEffect } from 'react';
import {
  X,
  Scale,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Printer,
  Sparkles,
  Info,
  Calendar,
  Landmark,
  ExternalLink
} from 'lucide-react';
import { formatPaise, rupeesToPaise, paiseToRupees } from '../utils/money.js';
import { formatIndianDate } from '../utils/date.js';

export function MsmeInterestCalculatorModal({ isOpen, onClose, defaultAmountRupees = 245000, defaultDaysOverdue = 45 }) {
  const [principalRupees, setPrincipalRupees] = useState(defaultAmountRupees.toString());
  const [daysDelayed, setDaysDelayed] = useState(defaultDaysOverdue.toString());
  const [rbiBankRate, setRbiBankRate] = useState(6.5);
  const [multiplier, setMultiplier] = useState(3);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!isOpen) return null;

  const P = Math.max(0, parseFloat(principalRupees) || 0);
  const days = Math.max(0, parseInt(daysDelayed, 10) || 0);
  const statutoryRatePercent = rbiBankRate * multiplier; // 19.50%
  const annualRate = statutoryRatePercent / 100;

  // Monthly rests compounding under Section 16 of MSMED Act 2006
  // A = P * (1 + r/12)^(days / 30.416)
  const months = days / 30.4166;
  const totalClaimAmount = P * Math.pow(1 + annualRate / 12, months);
  const interestAccrued = Math.max(0, totalClaimAmount - P);
  const dailyInterest = (P * annualRate) / 365;

  const handlePrintCertificate = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>MSMED_Act_Section16_Interest_Certificate</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; line-height: 1.5; padding: 20px; font-size: 13px; }
            h1 { font-size: 18px; margin-bottom: 4px; color: #1e1b4b; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            th { background: #f8fafc; font-weight: bold; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .statutory-box { background: #f1f5f9; border-left: 4px solid #4f46e5; padding: 12px; margin: 16px 0; font-size: 12px; }
            .seal { margin-top: 40px; border-top: 1px dashed #94a3b8; padding-top: 10px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: bold; color: #4338ca; text-transform: uppercase;">Statutory Interest Computation Certificate</div>
            <h1>Under Section 16, Micro, Small & Medium Enterprises Development (MSMED) Act, 2006</h1>
            <div style="font-size: 12px; color: #64748b;">Issued via DueMitra Receivables Protection Engine • Date: ${new Date().toLocaleDateString('en-IN')}</div>
          </div>

          <div class="statutory-box">
            <strong>LEGAL STATUTORY PROVISION:</strong><br/>
            Section 16 of the MSMED Act 2006 states: <em>"Where any buyer fails to make payment of the amount to the supplier, he shall be liable to pay compound interest with monthly rests to the supplier on that amount from the appointed day at three times of the bank rate notified by the Reserve Bank."</em>
          </div>

          <table>
            <tr><th>Parameter</th><th class="right">Statutory Value</th></tr>
            <tr><td>Principal Invoiced Trade Debt:</td><td class="right bold">₹${P.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
            <tr><td>Benchmark RBI Bank Rate (Notified):</td><td class="right">6.50% p.a.</td></tr>
            <tr><td>MSMED Act Statutory Multiplier:</td><td class="right">3x of Bank Rate</td></tr>
            <tr><td>Applicable Penal Compound Interest Rate:</td><td class="right bold" style="color: #4338ca;">19.50% per annum</td></tr>
            <tr><td>Interest Compounding Cycle:</td><td class="right">Monthly Rests (Compounded Monthly)</td></tr>
            <tr><td>Total Days Delayed Beyond Appointed Day:</td><td class="right bold">${days} Days</td></tr>
            <tr><td>Accrued Penal Interest under Section 16:</td><td class="right bold" style="color: #b91c1c;">₹${interestAccrued.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
            <tr style="background: #f8fafc; font-size: 15px;"><td class="bold">TOTAL LEGALLY CLAIMABLE AMOUNT:</td><td class="right bold" style="color: #0f172a;">₹${totalClaimAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
          </table>

          <div style="font-size: 11px; color: #475569; margin-top: 20px;">
            <strong>Note for MSME Facilitation Council (MSEFC):</strong> This computation forms prima facie documentary evidence for claims submitted under Section 18 of the MSMED Act on the MSME Samadhaan portal.
          </div>

          <div class="seal">
            <div>
              <small>Verified by DueMitra ERP</small><br/>
              <strong>Autonomous Compliance Engine</strong>
            </div>
            <div style="text-align: right;">
              <small>Authorized MSME Supplier Signature</small><br/>
              <strong>Kavach Mobile Accessories</strong>
            </div>
          </div>

          <script>
            setTimeout(() => window.print(), 350);
          </script>
        </body>
      </html>
    `);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-fade-in text-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>MSMED Act Sec 16 Penal Interest Engine</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  19.5% p.a.
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Statutory compound interest with monthly rests under Indian MSME law
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

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Statutory Law Notice Card */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-white font-bold">
                Section 16, MSMED Act 2006 (Statutory Right of Recovery):
              </strong>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Where buyer payments exceed the agreed term (max 45 days), the buyer is legally mandated to pay compound interest with monthly rests at <strong>3× the RBI Bank Rate (3 × 6.50% = 19.50% per annum)</strong>. This rate overrides any contrary agreement in contracts.
              </p>
            </div>
          </div>

          {/* Interactive Calculator Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Overdue Invoice Amount (₹ Principal)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="1000"
                  value={principalRupees}
                  onChange={(e) => setPrincipalRupees(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-base font-mono font-bold text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Days Delayed Past Due Date
              </label>
              <input
                type="number"
                value={daysDelayed}
                onChange={(e) => setDaysDelayed(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-base font-mono font-bold text-amber-300 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold">Test Real Scenarios:</span>
            {[
              { label: '30 Days Delay', days: 30, amt: 150000 },
              { label: '45 Days Statutory Breach', days: 45, amt: 245000 },
              { label: '90 Days Critical MSME Case', days: 90, amt: 480000 },
            ].map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrincipalRupees(sc.amt.toString());
                  setDaysDelayed(sc.days.toString());
                }}
                className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 rounded-lg text-[11px] font-semibold cursor-pointer transition-all"
              >
                {sc.label}
              </button>
            ))}
          </div>

          {/* Results Display Grid */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-white/10 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Statutory Annual Rate</span>
                <span className="font-mono text-base font-black text-indigo-400">19.50% p.a.</span>
                <span className="text-[10px] text-slate-500 block">3x RBI Rate (6.5%)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Daily Accrual</span>
                <span className="font-mono text-base font-black text-slate-200">₹{dailyInterest.toFixed(0)}/day</span>
                <span className="text-[10px] text-slate-500 block">Accrues daily</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Compound Penalty Accrued</span>
                <span className="font-mono text-base font-black text-rose-400">
                  +₹{interestAccrued.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-rose-400/80 block">Legally claimable</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">
                  Total Legal Recovery Claim under Section 16:
                </span>
                <span className="text-[11px] text-slate-500">
                  Principal (₹{P.toLocaleString('en-IN')}) + 19.5% Monthly Compound Interest
                </span>
              </div>
              <div className="font-mono text-2xl font-black text-emerald-400 sm:text-right">
                ₹{totalClaimAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-white/[0.08] flex items-center justify-between">
          <a
            href="https://samadhaan.msme.gov.in"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>MSME Samadhaan Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrintCertificate}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Legal Interest Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

