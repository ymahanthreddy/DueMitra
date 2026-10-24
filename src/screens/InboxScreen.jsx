import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox as InboxIcon,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise } from '../utils/money';
import { formatIndianDate } from '../utils/date';

export function InboxScreen() {
  const { inboxClaims, invoices, resolveInboxClaim } = useApp();

  const [activeClaimId, setActiveClaimId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredClaims = inboxClaims.filter((c) => {
    if (filterType === 'pending') return c.status === 'pending';
    if (filterType === 'resolved') return c.status === 'resolved' || c.status === 'rejected';
    return true;
  });

  const handleResolve = (claimId, action) => {
    resolveInboxClaim(claimId, action, resolutionNotes);
    setActiveClaimId(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Customer Claims & Disputes Inbox
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              {inboxClaims.filter((c) => c.status === 'pending').length} Pending
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Review customer payment claims and transit disputes. Resolving automatically updates the escalation ladder.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center bg-[#090d16] p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-white/[0.08] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Claims ({inboxClaims.length})
          </button>
          <button
            onClick={() => setFilterType('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'pending' ? 'bg-white/[0.08] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterType('resolved')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'resolved' ? 'bg-white/[0.08] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Claims List */}
      {filteredClaims.length > 0 ? (
        <div className="space-y-4">
          {filteredClaims.map((claim) => {
            const underlyingInv = invoices.find(
              (i) => i.id === claim.invoiceId || i.invoiceNumber === claim.invoiceNumber
            );
            const isPending = claim.status === 'pending';
            const isDispute = claim.claimType === 'dispute';

            return (
              <div
                key={claim.id}
                className={`bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border p-5 shadow-xl transition-all ${
                  isPending ? 'border-amber-500/40 bg-amber-950/15' : 'border-white/10 hover:border-indigo-500/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3.5 border-b border-white/[0.08]">
                  <div className="flex items-start gap-3.5">
                    <span className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
                      isDispute ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    }`}>
                      {isDispute ? <AlertTriangle className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base">
                          {claim.customerName}
                        </span>
                        <Link
                          to={`/invoices/${claim.invoiceId}`}
                          className="font-mono text-xs text-indigo-400 font-bold hover:underline"
                        >
                          {claim.invoiceNumber}
                        </Link>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          isDispute ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {isDispute ? 'Transit / Quality Dispute' : 'Already Paid Claim'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          claim.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : claim.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {claim.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Claim logged on {formatIndianDate(claim.date)} • Ladder status: <strong className="text-amber-400">Paused</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Bill Balance</span>
                    <div className="text-lg font-black font-mono text-white mt-0.5">
                      {formatPaise(underlyingInv?.balanceDuePaise || claim.amountPaise)}
                    </div>
                  </div>
                </div>

                {/* Reason & Content */}
                <div className="mt-3.5 p-3.5 bg-[#090d16]/90 rounded-xl border border-slate-800 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Customer Statement:
                  </span>
                  <p className="text-slate-200 font-medium leading-relaxed">
                    &quot;{claim.reason || `Payment Ref: ${claim.referenceNumber} on ${claim.paidDate}`}&quot;
                  </p>
                  {claim.referenceNumber && (
                    <div className="mt-2 text-indigo-400 font-mono text-[11px] font-bold">
                      Bank Ref / UTR: {claim.referenceNumber}
                    </div>
                  )}
                </div>

                {/* Resolution note if already resolved */}
                {claim.resolutionNotes && (
                  <div className="mt-2.5 text-xs text-slate-300 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30">
                    <strong className="text-emerald-300">Resolution Note:</strong> {claim.resolutionNotes}
                  </div>
                )}

                {/* Actions for Pending Claim */}
                {isPending && (
                  <div className="mt-4 pt-3.5 border-t border-white/[0.08]">
                    {activeClaimId !== claim.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {isDispute ? (
                          <button
                            onClick={() => setActiveClaimId(claim.id)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                          >
                            Resolve Dispute & Issue Credit Note
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveClaimId(claim.id)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                          >
                            Verify & Mark as Paid
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveClaimId(claim.id);
                          }}
                          className="px-3.5 py-2 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer transition-all"
                        >
                          Reject Claim (Resume Ladder)
                        </button>

                        <Link
                          to={`/invoices/${claim.invoiceId}`}
                          className="px-3 py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Inspect Invoice
                        </Link>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#090d16] rounded-xl border border-slate-700 space-y-3">
                        <span className="text-xs font-bold text-slate-200">
                          Enter Resolution Notes & Confirm Action:
                        </span>
                        <input
                          type="text"
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="e.g. Credit Note CN-26-27-01 approved for transit breakage, or UTR verified in bank"
                          className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-indigo-500"
                        />

                        <div className="flex items-center gap-2">
                          {isDispute ? (
                            <button
                              onClick={() => handleResolve(claim.id, 'accept_credit_note')}
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                            >
                              Issue Credit Note & Close Bill
                            </button>
                          ) : (
                            <button
                              onClick={() => handleResolve(claim.id, 'accept_paid')}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                            >
                              Confirm Bank Credit & Mark Paid
                            </button>
                          )}

                          <button
                            onClick={() => handleResolve(claim.id, 'reject')}
                            className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Reject & Resume Ladder
                          </button>

                          <button
                            onClick={() => setActiveClaimId(null)}
                            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
          <InboxIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white">No Claims in Inbox</h2>
          <p className="text-xs text-slate-400 mt-1">
            Customer inquiries, dispute reports, and &quot;already paid&quot; receipts submitted via public pay links will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
