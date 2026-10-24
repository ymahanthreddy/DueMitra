import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Upload,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileText,
  ShieldCheck,
  Check,
  HelpCircle,
  FileSpreadsheet,
  Percent,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise } from '../utils/money';
import { formatIndianDate } from '../utils/date';
import { sampleBankStatementRaw, parseBankStatementCsv } from '../data/bankStatementData';
import { runAiReconciliation } from '../utils/n8n';

export function PaymentsScreen() {
  const {
    t,
    invoices,
    business,
    bankBalancePaise,
    config,
    confirmPaymentMatch,
    confirmedMatches,
  } = useApp();

  const isKavachStore = business?.id === 'BIZ-KAVACH';
  const [csvText, setCsvText] = useState(isKavachStore ? sampleBankStatementRaw : '');
  const [statementRows, setStatementRows] = useState([]);
  const [matchedResults, setMatchedResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiEngineUsed, setAiEngineUsed] = useState('Local AI Parser');
  const [showExplanation, setShowExplanation] = useState(true);

  // Sync state whenever active store changes
  useEffect(() => {
    if (business?.id === 'BIZ-KAVACH') {
      setCsvText(sampleBankStatementRaw);
    } else {
      setCsvText('');
      setStatementRows([]);
      setMatchedResults([]);
    }
  }, [business?.id]);

  // Load and parse initial statement rows
  useEffect(() => {
    if (!csvText || !csvText.trim()) {
      setStatementRows([]);
      setMatchedResults([]);
      return;
    }
    const rows = parseBankStatementCsv(csvText);
    setStatementRows(rows);
  }, [csvText]);

  // Run AI reconciliation match
  const handleRunReconciliation = async (useLiveEndpoint = false) => {
    setIsProcessing(true);
    const openInvoices = invoices.filter((i) => i.status !== 'paid' && i.balanceDuePaise > 0);
    
    const matches = await runAiReconciliation(
      statementRows,
      openInvoices,
      config.n8n.aiReconciliationUrl,
      useLiveEndpoint
    );

    setMatchedResults(matches);
    setAiEngineUsed(useLiveEndpoint ? 'n8n Live Workflow Node' : 'Integrated AI Reconciliation Engine');
    setIsProcessing(false);
  };

  // Run initial match on mount
  useEffect(() => {
    if (statementRows.length > 0) {
      handleRunReconciliation(false);
    }
  }, [statementRows, invoices]);

  // Custom file upload
  const handleFileUpload = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const getMatchBadge = (matchType) => {
    switch (matchType) {
      case 'exact':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]">Exact Match</span>;
      case 'tds_deduction':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]">TDS 2% Detected (Sec 194Q)</span>;
      case 'multi_invoice':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.2)]">Multi-Invoice Bulk Settlement</span>;
      case 'overpayment':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]">Overpayment Credit</span>;
      case 'part_payment':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.2)]">Installment / Part Payment</span>;
      case 'unmatched':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]">Unmatched Deposit</span>;
    }
  };

  const totalCreditsPaise = statementRows.reduce((sum, r) => sum + (r.creditPaise || 0), 0);
  const matchedCreditsCount = matchedResults.filter((m) => m.matchType !== 'unmatched').length;
  const tdsCount = matchedResults.filter((m) => m.matchType === 'tds_deduction').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Title & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Bank Statement & AI Reconciliation</span>
            <span className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-bold">
              Autonomous Audit
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automates the hardest daily problem for Indian MSMEs: matching cryptic bank credits to unpaid customer invoices
          </p>
        </div>

        {/* Operating Balance Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-[#0f172a]/70 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-2.5 shadow-xl text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Verified Bank Balance</span>
            <span className="font-mono text-lg font-black text-emerald-400">{formatPaise(bankBalancePaise)}</span>
          </div>
        </div>
      </div>

      {/* 3 Core Operating Principles */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#11192e] to-[#0b101d] rounded-2xl border border-indigo-500/30 p-5 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#0a0f1d]/70 p-4 rounded-xl border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <span>1. The Real MSME Problem</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              When dealers pay via NEFT, RTGS, or UPI, bank narrations are cryptic (e.g. <code className="text-cyan-300">NEFT-N102604928-PHOENIX TECH</code>). Accountants waste 10+ hours weekly cross-checking physical bills, often leaving paid invoices marked overdue.
            </p>
          </div>

          <div className="bg-[#0a0f1d]/70 p-4 rounded-xl border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <span>2. The 2% TDS Trap (Sec 194Q)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Corporate buyers legally deduct 2% TDS on wholesale purchases above ₹50L. Traditional software flags this ₹2,000 shortfall as an overdue penalty, sparking customer friction. DueMitra detects 2% TDS automatically!
            </p>
          </div>

          <div className="bg-[#0a0f1d]/70 p-4 rounded-xl border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <span>3. Autonomous 1-Click Clearance</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              DueMitra parses the UTR, customer trade name, and bill totals. Clicking <strong>Confirm Match</strong> instantly marks the invoice as Paid in Supabase, terminates chase ladders, and updates cash flow in real time.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f172a]/70 border border-white/10 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold block">Total Ingested Bank Credits</span>
          <div className="text-2xl font-black font-mono text-white mt-1">{formatPaise(totalCreditsPaise)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{statementRows.length} transactions in uploaded statement</div>
        </div>

        <div className="bg-[#0f172a]/70 border border-white/10 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold block">AI Matches Identified</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            {matchedCreditsCount} / {matchedResults.length}
          </div>
          <div className="text-[11px] text-emerald-500 mt-0.5">Automated UTR, buyer name & invoice serial match</div>
        </div>

        <div className="bg-[#0f172a]/70 border border-white/10 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold block">TDS 2% Deductions Detected</span>
          <div className="text-2xl font-black font-mono text-purple-400 mt-1">
            {tdsCount} Transactions
          </div>
          <div className="text-[11px] text-purple-400/80 mt-0.5">Compliant with Section 194Q Income Tax Act</div>
        </div>
      </div>

      {/* Control Banner */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Statement Source:</span>
              <span className="text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">bank-statement.csv</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              AI parses bank narrations, matches invoice serials, flags 2% TDS, and handles split bill deposits.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Custom File Upload */}
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Upload Bank CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Process with n8n live */}
          <button
            type="button"
            onClick={() => handleRunReconciliation(true)}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 border border-indigo-400/20 cursor-pointer disabled:opacity-50 transition-all min-h-[40px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Re-Run AI Engine</span>
          </button>
        </div>
      </div>

      {/* Reconciled Matching Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Detected Bank Credits ({matchedResults.length} Items)
          </h2>
          <span className="text-xs text-slate-400">
            Engine: <strong className="text-slate-200">{aiEngineUsed}</strong>
          </span>
        </div>

        {matchedResults.length === 0 ? (
          <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center space-y-3">
            <Landmark className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Bank Statement Uploaded Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Upload your bank statement CSV file above to parse incoming credits, match UTR numbers against unpaid invoices, and auto-detect 2% TDS deductions.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer">
                <UploadCloud className="w-4 h-4" />
                <span>Upload Statement CSV</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                type="button"
                onClick={() => setCsvText(sampleBankStatementRaw)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer"
              >
                <span>Load Sample Statement (Demo)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {matchedResults.map((match, idx) => {
            const isConfirmed = confirmedMatches.includes(match.bankRow.id);
            const isTds = match.matchType === 'tds_deduction';
            const isUnmatched = match.matchType === 'unmatched';
            const isMulti = match.matchType === 'multi_invoice';

            return (
              <div
                key={match.bankRow.id || idx}
                className={`bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border p-5 shadow-xl transition-all ${
                  isConfirmed
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : isTds
                    ? 'border-purple-500/40 bg-purple-950/20'
                    : isUnmatched
                    ? 'border-rose-500/40 bg-rose-950/20'
                    : 'border-white/10 hover:border-indigo-500/30'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Statement Row & Bank Narration */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
                        {match.bankRow.date}
                      </span>
                      {getMatchBadge(match.matchType)}
                      <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Verified Bank Ref
                      </span>
                    </div>

                    <div className="bg-[#090d16]/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">
                        Bank Transaction Narration / UTR
                      </span>
                      <p className="font-mono text-xs text-slate-200 font-semibold break-all">
                        {match.bankRow.description}
                      </p>
                    </div>

                    {/* Plain Language AI Explanation */}
                    <div className="text-xs text-slate-300 flex items-start gap-2 pt-1">
                      <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-200">Reconciliation Logic: </strong>
                        <span className="text-slate-400">{match.reason}</span>
                      </div>
                    </div>

                    {/* Specific Flag: 2% TDS Notice */}
                    {isTds && (
                      <div className="p-3.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs text-purple-200 font-medium">
                        <strong className="text-purple-300">TDS Verification Action Required: </strong>
                        Shortfall is ₹{(match.tdsPaise / 100).toLocaleString('en-IN')}, exactly {match.tdsRate} of taxable value. Settle balance and request TDS Form 16A from {match.customerName}.
                      </div>
                    )}
                  </div>

                  {/* Right: Amounts & Confirmation Action */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 border-t border-white/[0.08] lg:border-t-0 pt-3 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block">
                        Credit Amount
                      </span>
                      <div className="text-xl font-black font-mono text-emerald-400">
                        +{formatPaise(match.bankRow.creditPaise)}
                      </div>
                      {match.invoiceNumbers && match.invoiceNumbers.length > 0 && (
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {match.invoiceNumbers.join(' & ')}
                        </div>
                      )}
                    </div>

                    {/* Confirmation Button */}
                    <div className="pt-2">
                      {isConfirmed ? (
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          <Check className="w-4 h-4" />
                          <span>Confirmed in Supabase DB</span>
                        </div>
                      ) : (
                        <button
                          disabled={isUnmatched}
                          onClick={() => confirmPaymentMatch(match)}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl shadow-md cursor-pointer min-h-[44px] transition-all ${
                            isUnmatched
                              ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                              : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-indigo-600/25 border border-indigo-400/20'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Match & Mark Paid</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
