import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Database,
  Radio,
  FileText,
  Mail,
  Phone,
  MapPin,
  Landmark,
  CreditCard,
  RefreshCw,
  Edit2,
  Save,
  Check,
  AtSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIndianDate } from '../utils/date';

export function PlatformAdminScreen() {
  const navigate = useNavigate();
  const {
    businesses = [],
    approveBusiness,
    rejectBusiness,
    seedApplicantDemo,
    switchBusiness,
    currentUser,
    isPlatformAdmin,
    n8nStatus,
    activeToast,
    updateBusinessById
  } = useApp();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [inspectBiz, setInspectBiz] = useState(null);
  const [editingBizEmails, setEditingBizEmails] = useState({});
  const [savedBizEmailId, setSavedBizEmailId] = useState(null);

  const handleSaveBizEmail = (bizId, newEmail) => {
    if (!newEmail || !newEmail.trim()) return;
    if (updateBusinessById) {
      updateBusinessById(bizId, {
        notificationEmail: newEmail.trim(),
        email: newEmail.trim(),
      });
    }
    setSavedBizEmailId(bizId);
    setEditingBizEmails((prev) => ({ ...prev, [bizId]: undefined }));
    setTimeout(() => setSavedBizEmailId(null), 3000);
  };

  const pendingList = businesses.filter((b) => b.status === 'pending_approval');
  const approvedList = businesses.filter((b) => b.status === 'approved' || (!b.status && b.id === 'BIZ-KAVACH'));
  const rejectedList = businesses.filter((b) => b.status === 'rejected');

  const displayedList = (activeTab === 'pending'
    ? pendingList
    : activeTab === 'approved'
    ? approvedList
    : businesses
  ).filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.gstin?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q) ||
      b.loginEmail?.toLowerCase().includes(q)
    );
  });

  const handleApprove = (bizId) => {
    approveBusiness(bizId);
  };

  const handleConfirmReject = (bizId) => {
    rejectBusiness(bizId, rejectReason || 'Documentation or GSTIN verification could not be validated.');
    setRejectingId(null);
    setRejectReason('');
  };

  const handleSeedApplicant = () => {
    const names = [
      'Sahyadri Electronics & Spares',
      'Apex Microtech & Hardware',
      'Mahalaxmi Telecom Distributors',
      'Trimurti Mobile Wholesale'
    ];
    const chosen = names[Math.floor(Math.random() * names.length)];
    seedApplicantDemo(chosen);
    setActiveTab('pending');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Governance Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#161f30] to-[#101623] border border-slate-700/60 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>DueMitra Platform HQ</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Radio className="w-3 h-3 text-emerald-400" />
                <span>Supabase Cloud Storage</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Merchant Approval & Platform Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Review and approve newly registered B2B stores before granting them autonomous invoicing,
              escalation ladders, and MSME Samadhaan recovery privileges.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleSeedApplicant}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm border border-blue-400/30 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>+ Simulate New Applicant</span>
            </button>
          </div>
        </div>

        {/* Platform Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-[#0a0f1d]/70 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Pending Approvals
            </span>
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-black ${pendingList.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                {pendingList.length}
              </span>
              <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                <Clock className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="bg-[#0a0f1d]/70 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active / Approved Stores
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-400">
                {approvedList.length}
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="bg-[#0a0f1d]/70 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Declined Registrations
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-rose-400">
                {rejectedList.length}
              </span>
              <span className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
                <XCircle className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="bg-[#0a0f1d]/70 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Platform Tenants
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-indigo-300">
                {businesses.length}
              </span>
              <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                <Building2 className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#090e1a]/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Review</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-500/30 text-amber-200">
              {pendingList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Approved Stores</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/30 text-emerald-200">
              {approvedList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>All Registered Stores</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-white/10 text-slate-300">
              {businesses.length}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search stores or GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* Main List Area */}
      {displayedList.length === 0 ? (
        <div className="bg-[#0f172a]/80 border border-white/10 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-slate-400">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white">
            {activeTab === 'pending' ? 'All clear! No pending applications.' : 'No stores match your search.'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {activeTab === 'pending'
              ? 'All registered stores have been reviewed. Click "+ Simulate New Applicant" above to test the approval flow.'
              : 'Try clearing the search query to see all registered businesses.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedList.map((biz) => {
            const isPending = biz.status === 'pending_approval';
            const isApproved = biz.status === 'approved' || (!biz.status && biz.id === 'BIZ-KAVACH');
            const isRejected = biz.status === 'rejected';

            return (
              <div
                key={biz.id}
                className={`relative bg-[#090e1a]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border transition-all ${
                  isPending
                    ? 'border-amber-500/40 shadow-xl shadow-amber-950/20'
                    : isApproved
                    ? 'border-emerald-500/25 shadow-lg shadow-emerald-950/15'
                    : 'border-rose-500/30'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left: Store Profile & Details */}
                  <div className="space-y-3.5 flex-1 min-w-0">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-700 flex items-center justify-center font-black text-sm text-white shadow-sm ring-1 ring-white/15 shrink-0">
                        {biz.name ? biz.name.slice(0, 2).toUpperCase() : 'ST'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            {biz.name}
                          </h3>

                          {/* Status Badge */}
                          {isPending && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Pending Verification</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Approved & Active</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40 flex items-center gap-1.5">
                              <XCircle className="w-3 h-3 text-rose-400" />
                              <span>Declined</span>
                            </span>
                          )}

                          {biz.id === 'BIZ-KAVACH' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                              Primary Store
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 mt-0.5">
                          {biz.tradeName || biz.category} • {biz.city || 'India'}, {biz.state || 'Maharashtra'}
                        </p>
                      </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                      <div className="bg-[#0a0f1d]/60 border border-white/5 rounded-xl p-2.5">
                        <span className="text-[10px] text-slate-400 block font-semibold">GSTIN</span>
                        <span className="font-mono text-cyan-300 font-bold text-xs truncate block">
                          {biz.gstin || '27AABCS9876P1Z3'}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-semibold block mt-0.5">
                          ✓ State {biz.stateCode || '27'} Regular
                        </span>
                      </div>

                      <div className="bg-[#0a0f1d]/60 border border-white/5 rounded-xl p-2.5">
                        <span className="text-[10px] text-slate-400 block font-semibold">Store Login Email</span>
                        <span className="font-mono text-slate-200 text-xs truncate block">
                          {biz.loginEmail || biz.email}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Pass: {biz.loginPassword || '••••••••'}
                        </span>
                      </div>

                      <div className="bg-[#0a0f1d]/60 border border-white/5 rounded-xl p-2.5">
                        <span className="text-[10px] text-slate-400 block font-semibold">Phone & Contact</span>
                        <span className="text-slate-200 text-xs truncate block">
                          {biz.phone || '+91 98901 23456'}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          {biz.address ? biz.address.slice(0, 24) + '...' : 'Verified address'}
                        </span>
                      </div>

                      <div className="bg-[#0a0f1d]/60 border border-white/5 rounded-xl p-2.5">
                        <span className="text-[10px] text-slate-400 block font-semibold">Bank & Settlement UPI</span>
                        <span className="font-mono text-slate-200 text-xs truncate block">
                          {biz.upiId || 'store@okhdfcbank'}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          {biz.bankName || 'HDFC Bank'}
                        </span>
                      </div>
                    </div>

                    {/* Alerts & Messages Recipient Email (Editable Field) */}
                    <div className="bg-[#0f172a] border border-cyan-500/25 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-xs text-slate-300 font-semibold">
                          Alerts & Reminders Receiving Email:
                        </span>
                      </div>

                      {editingBizEmails[biz.id] !== undefined ? (
                        <div className="flex items-center gap-1.5 flex-1 max-w-md">
                          <input
                            type="email"
                            value={editingBizEmails[biz.id]}
                            onChange={(e) =>
                              setEditingBizEmails({
                                ...editingBizEmails,
                                [biz.id]: e.target.value,
                              })
                            }
                            placeholder="e.g. accounts@company.com or yourname@gmail.com"
                            className="flex-1 px-2.5 py-1 bg-[#090d16] border border-cyan-500/50 rounded-lg text-xs font-mono text-white focus:outline-hidden"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveBizEmail(biz.id, editingBizEmails[biz.id])}
                            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingBizEmails({
                                ...editingBizEmails,
                                [biz.id]: undefined,
                              })
                            }
                            className="px-2 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          {biz.notificationEmail && !biz.notificationEmail.includes('kavachaccessories.in') ? (
                            <strong className="font-mono text-cyan-300 text-xs bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                              {biz.notificationEmail}
                            </strong>
                          ) : biz.email && !biz.email.includes('kavachaccessories.in') ? (
                            <strong className="font-mono text-cyan-300 text-xs bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                              {biz.email}
                            </strong>
                          ) : (
                            <span className="font-mono text-amber-400 text-xs bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                              ⚠️ No receiving email set (Click Edit to add)
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const existing = biz.notificationEmail || biz.email || '';
                              setEditingBizEmails({
                                ...editingBizEmails,
                                [biz.id]: existing.includes('kavachaccessories.in') ? '' : existing,
                              });
                            }}
                            title="Edit receiving email"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-white/10 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                          >
                            <Edit2 className="w-3 h-3 text-cyan-400" />
                            <span>Edit Email</span>
                          </button>
                          {savedBizEmailId === biz.id && (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Updated</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Application Timestamp */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span>
                        Applied: <span className="font-mono text-slate-300">{biz.appliedAt ? formatIndianDate(biz.appliedAt.slice(0, 10)) : 'Today'}</span>
                      </span>
                      {biz.approvedAt && (
                        <span>
                          Approved: <span className="font-mono text-emerald-400">{formatIndianDate(biz.approvedAt.slice(0, 10))}</span>
                        </span>
                      )}
                      {biz.rejectionReason && (
                        <span className="text-rose-400">
                          Decline Reason: {biz.rejectionReason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Platform Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(biz.id)}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 border border-emerald-400/30 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[40px]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Store</span>
                        </button>

                        {rejectingId === biz.id ? (
                          <div className="space-y-2 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl max-w-xs text-xs animate-fade-in">
                            <span className="font-bold text-rose-300 block">Decline Reason:</span>
                            <input
                              type="text"
                              placeholder="e.g. Incomplete GST credentials"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="w-full bg-[#0a0f1d] border border-rose-500/40 rounded-lg px-2.5 py-1 text-xs text-white"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleConfirmReject(biz.id)}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                              >
                                Confirm Decline
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingId(null)}
                                className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRejectingId(biz.id)}
                            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Decline Application</span>
                          </button>
                        )}
                      </>
                    )}

                    {isApproved && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved Merchant</span>
                        </span>
                        {biz.id !== 'BIZ-KAVACH' && (
                          <button
                            type="button"
                            onClick={() => {
                              rejectBusiness(biz.id, 'Approval revoked by Platform Admin.');
                            }}
                            className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    )}

                    {isRejected && (
                      <button
                        type="button"
                        onClick={() => handleApprove(biz.id)}
                        className="px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Re-evaluate & Approve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Real-time n8n & Supabase Governance Stream Footer */}
      <div className="bg-[#090e1a]/70 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Autonomous Platform Dispatch Active</span>
            <span>All approval actions stream via webhook to n8n Pro Cloud and replicate to PostgreSQL Supabase Cloud.</span>
          </div>
        </div>

        <span className="font-mono text-[11px] text-cyan-300/80 px-2.5 py-1 bg-white/[0.03] rounded-lg border border-white/10">
          admin@duemitra.in (Super Admin)
        </span>
      </div>
    </div>
  );
}

