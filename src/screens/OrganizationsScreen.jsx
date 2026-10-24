import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Layers,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Download,
  Landmark,
  Scale,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise } from '../utils/money';
import { RegisterBusinessModal } from '../components/RegisterBusinessModal';

export function OrganizationsScreen() {
  const {
    business,
    businesses = [],
    currentBusinessId,
    switchBusiness,
    deleteBusiness,
    updateBusiness,
    tenantsData = {},
    notifyN8nEvent,
  } = useApp();

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [editingBizId, setEditingBizId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const togglePasswordReveal = (bizId) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [bizId]: !prev[bizId],
    }));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (biz) => {
    setEditingBizId(biz.id);
    setEditForm({ ...biz });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateBusiness(editForm);
    setEditingBizId(null);
    notifyN8nEvent('Organization Profile Updated', editForm.name);
  };

  const handleExportData = (biz) => {
    const dataSlice = tenantsData[biz.id] || {};
    const exportPayload = {
      business: biz,
      ledger: dataSlice,
      exportedAt: new Date().toISOString(),
      platform: 'DueMitra Cloud SaaS v2.4',
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duemitra-ledger-${biz.id.toLowerCase()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notifyN8nEvent('Ledger Backup Exported', `${biz.name} (JSON)`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 bg-blue-600 rounded-xl text-white shadow-sm ring-1 ring-white/15">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Manage Organizations & Businesses
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Multi-tenant portfolio management, organization credentials, GST profiles, and credit policies
          </p>
        </div>

        <button
          onClick={() => setRegisterModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm border border-blue-400/30 transition-all cursor-pointer self-start sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Business</span>
        </button>
      </div>

      {/* Top Portfolio Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Registered Businesses
          </span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {businesses.length} Stores
          </div>
          <span className="text-xs text-indigo-400 mt-0.5 block">
            {businesses.filter((b) => b.isPreset).length} Pre-configured • {businesses.filter((b) => !b.isPreset).length} Custom
          </span>
        </div>

        <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Current Business Profile
          </span>
          <div className="text-lg font-bold text-emerald-400 truncate mt-1">
            {business?.name}
          </div>
          <span className="text-xs text-slate-400 font-mono mt-0.5 block">
            GSTIN: {business?.gstin} [{business?.stateCode}]
          </span>
        </div>

        <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            MSMED Legal Protection
          </span>
          <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
            100% Protected
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Section 15/16 Statutory Non-Litigation Requisitions
          </span>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {businesses.map((biz) => {
          const isActive = biz.id === currentBusinessId;
          const tenantSlice = tenantsData[biz.id] || {};
          const invoiceCount = tenantSlice.invoices?.length || 0;
          const customerCount = tenantSlice.customers?.length || 0;
          const totalAr = (tenantSlice.invoices || []).reduce(
            (sum, inv) => sum + (inv.status !== 'paid' ? inv.balanceDuePaise || 0 : 0),
            0
          );
          const isRevealed = revealedPasswords[biz.id];

          return (
            <div
              key={biz.id}
              className={`bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-6 border transition-all flex flex-col justify-between shadow-xl ${
                isActive
                  ? 'border-indigo-500/70 shadow-2xl shadow-indigo-950/50 ring-1 ring-indigo-500/40'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-sm text-white shadow-sm ring-1 ring-white/15 shrink-0">
                      {biz.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-white truncate">
                          {biz.name}
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 font-mono shrink-0">
                          [{biz.stateCode}]
                        </span>
                      </div>
                      <p className="text-xs text-cyan-400 truncate font-semibold">
                        {biz.industry || biz.category}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Current Store</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => switchBusiness(biz.id)}
                      className="px-3 py-1 bg-white/5 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/10 transition-colors cursor-pointer shrink-0"
                    >
                      Select Store &rarr;
                    </button>
                  )}
                </div>

                {/* Ledger Metrics Snapshot */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#0a0f1d] border border-white/5 rounded-2xl text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Outstanding AR</span>
                    <span className="text-xs font-bold font-mono text-rose-400 mt-0.5 block truncate">
                      {formatPaise(totalAr)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Invoices</span>
                    <span className="text-xs font-bold font-mono text-white mt-0.5 block">
                      {invoiceCount} bills
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Trade Buyers</span>
                    <span className="text-xs font-bold font-mono text-cyan-300 mt-0.5 block">
                      {customerCount} accounts
                    </span>
                  </div>
                </div>

                {/* Credentials & Access Box */}
                <div className="p-4 bg-[#0a0f1d] border border-indigo-500/20 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Admin Login Credentials:</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      User: {biz.userName || biz.authorizedSignatory}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="flex items-center justify-between bg-white/[0.03] p-2 rounded-xl border border-white/5">
                      <span className="text-slate-400 text-[11px] truncate pr-1">
                        {biz.loginEmail || biz.email}
                      </span>
                      <button
                        onClick={() => handleCopy(biz.loginEmail || biz.email, `email-${biz.id}`)}
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Copy Login Email"
                      >
                        {copiedId === `email-${biz.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-white/[0.03] p-2 rounded-xl border border-white/5">
                      <span className="text-indigo-300 text-[11px] truncate pr-1">
                        {isRevealed ? biz.loginPassword || 'admin123' : '••••••••••••'}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => togglePasswordReveal(biz.id)}
                          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title={isRevealed ? 'Hide Password' : 'Show Password'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(biz.loginPassword || 'admin123', `pass-${biz.id}`)}
                          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy Password"
                        >
                          {copiedId === `pass-${biz.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Details List */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">GSTIN:</span>
                    <span className="font-mono text-white font-bold">{biz.gstin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MSMED Registration:</span>
                    <span className="text-amber-300 font-bold">
                      {biz.isUdyamRegistered ? `${biz.udyamNumber} (${biz.enterpriseType})` : 'Unregistered'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Credit Terms / Prefix:</span>
                    <span className="text-slate-300 font-mono">
                      {biz.defaultCreditDays || 30} Days • Prefix: {biz.invoicePrefix}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bank & UPI VPA:</span>
                    <span className="text-indigo-300 font-mono">
                      {biz.bankName} • {biz.upiId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-6 border-t border-white/[0.08] mt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportData(biz)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer"
                    title="Export full store data as JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    onClick={() => handleStartEdit(biz)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer"
                  >
                    <span>Edit Profile</span>
                  </button>
                </div>

                {!biz.isPreset && !isActive && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete organization profile "${biz.name}"?`)) {
                        deleteBusiness(biz.id);
                      }
                    }}
                    className="p-2 text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer"
                    title="Delete Organization"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Organization Modal */}
      {editingBizId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 text-white space-y-4">
            <h3 className="text-lg font-bold text-white">Edit Organization Profile</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Legal Entity Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trade / Brand Name</label>
                <input
                  type="text"
                  value={editForm.tradeName || ''}
                  onChange={(e) => setEditForm({ ...editForm, tradeName: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Login Email</label>
                  <input
                    type="email"
                    value={editForm.loginEmail || ''}
                    onChange={(e) => setEditForm({ ...editForm, loginEmail: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password</label>
                  <input
                    type="text"
                    value={editForm.loginPassword || ''}
                    onChange={(e) => setEditForm({ ...editForm, loginPassword: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">UPI ID / VPA</label>
                  <input
                    type="text"
                    value={editForm.upiId || ''}
                    onChange={(e) => setEditForm({ ...editForm, upiId: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Default Terms (Days)</label>
                  <input
                    type="number"
                    value={editForm.defaultCreditDays || 30}
                    onChange={(e) => setEditForm({ ...editForm, defaultCreditDays: Number(e.target.value) })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingBizId(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SaaS Business Registration Modal */}
      <RegisterBusinessModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
}

