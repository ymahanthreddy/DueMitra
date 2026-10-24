import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  Plus,
  Edit2,
  Edit3,
  X,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise } from '../utils/money';
import { validateGstin, STATE_CODES } from '../utils/gst';

export function CustomersScreen() {
  const { customers, invoices, business, addCustomer, updateCustomer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Inline GSTIN editing state
  const [editingGstinCustId, setEditingGstinCustId] = useState(null);
  const [gstinInput, setGstinInput] = useState('');
  const [gstinFeedback, setGstinFeedback] = useState(null);

  // Add Customer Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    tradeName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    stateCode: '27',
    gstin: '',
    creditDays: 30,
  });
  const [modalGstinFeedback, setModalGstinFeedback] = useState(null);

  // Full Edit Customer Modal state
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editGstinFeedback, setEditGstinFeedback] = useState(null);

  const filtered = customers.filter((c) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      c.name.toLowerCase().includes(searchLower) ||
      (c.tradeName && c.tradeName.toLowerCase().includes(searchLower)) ||
      (c.email && c.email.toLowerCase().includes(searchLower)) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchLower)) ||
      (c.phone && c.phone.includes(searchTerm));

    if (!matchSearch) return false;

    if (activeFilter === 'outstanding') {
      const openCount = invoices.filter(
        (inv) => inv.customerId === c.id && inv.status !== 'paid' && inv.balanceDuePaise > 0
      ).length;
      return openCount > 0;
    }
    if (activeFilter === 'gst') {
      return Boolean(c.gstin && c.gstin.trim().length === 15);
    }

    return true;
  });

  const handleStartEditGstin = (cust) => {
    setEditingGstinCustId(cust.id);
    setGstinInput(cust.gstin || '');
    if (cust.gstin) {
      setGstinFeedback(validateGstin(cust.gstin));
    } else {
      setGstinFeedback(null);
    }
  };

  const handleGstinInputChange = (val) => {
    const clean = val.toUpperCase().trim();
    setGstinInput(clean);
    if (!clean) {
      setGstinFeedback(null);
      return;
    }
    const result = validateGstin(clean);
    setGstinFeedback(result);
  };

  const handleSaveCustomerGstin = (custId) => {
    if (gstinInput) {
      const result = validateGstin(gstinInput);
      if (!result.valid) {
        alert(result.error);
        return;
      }
      updateCustomer(custId, {
        gstin: result.gstin,
        state: result.stateName,
        stateCode: result.stateCode,
      });
    } else {
      updateCustomer(custId, { gstin: '' });
    }
    setEditingGstinCustId(null);
    setGstinInput('');
    setGstinFeedback(null);
  };

  const handleModalGstinChange = (val) => {
    const clean = val.toUpperCase().trim();
    const updated = { ...addForm, gstin: clean };
    if (clean.length >= 2) {
      const code = clean.substring(0, 2);
      if (STATE_CODES[code]) {
        updated.stateCode = code;
        updated.state = STATE_CODES[code];
      }
    }
    setAddForm(updated);
    if (clean) {
      setModalGstinFeedback(validateGstin(clean));
    } else {
      setModalGstinFeedback(null);
    }
  };

  const handleEditModalGstinChange = (val) => {
    const clean = val.toUpperCase().trim();
    const updated = { ...editingCustomer, gstin: clean };
    if (clean.length >= 2) {
      const code = clean.substring(0, 2);
      if (STATE_CODES[code]) {
        updated.stateCode = code;
        updated.state = STATE_CODES[code];
      }
    }
    setEditingCustomer(updated);
    if (clean) {
      setEditGstinFeedback(validateGstin(clean));
    } else {
      setEditGstinFeedback(null);
    }
  };

  const handleCreateCustomerSubmit = (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      alert('Please enter a customer or firm name');
      return;
    }
    if (addForm.gstin) {
      const check = validateGstin(addForm.gstin);
      if (!check.valid) {
        alert(check.error);
        return;
      }
    }
    addCustomer(addForm);
    setIsAddModalOpen(false);
    setAddForm({
      name: '',
      tradeName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: 'Pune',
      state: 'Maharashtra',
      stateCode: '27',
      gstin: '',
      creditDays: 30,
    });
    setModalGstinFeedback(null);
  };

  const handleEditCustomerSubmit = (e) => {
    e.preventDefault();
    if (!editingCustomer || !editingCustomer.name?.trim()) return;

    if (editingCustomer.gstin) {
      const check = validateGstin(editingCustomer.gstin);
      if (!check.valid) {
        alert(check.error);
        return;
      }
      editingCustomer.state = check.stateName;
      editingCustomer.stateCode = check.stateCode;
    }

    updateCustomer(editingCustomer.id, {
      name: editingCustomer.name.trim(),
      tradeName: editingCustomer.tradeName?.trim() || editingCustomer.name.trim(),
      contactPerson: editingCustomer.contactPerson?.trim() || '',
      phone: editingCustomer.phone?.trim() || '',
      email: editingCustomer.email?.trim() || '',
      address: editingCustomer.address?.trim() || '',
      city: editingCustomer.city?.trim() || 'Pune',
      state: editingCustomer.state || 'Maharashtra',
      stateCode: editingCustomer.stateCode || '27',
      gstin: editingCustomer.gstin?.toUpperCase().trim() || '',
      creditDays: Number(editingCustomer.creditDays) || 30,
    });

    setEditingCustomer(null);
  };

  const getGradeBadge = (grade) => {
    switch (grade) {
      case 'A':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Grade A
          </span>
        );
      case 'B':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Grade B
          </span>
        );
      case 'C':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black bg-rose-500/15 text-rose-300 border border-rose-500/30">
            Grade C
          </span>
        );
    }
  };

  const getTradeBadge = (c) => {
    if (c.gstin && c.gstin.trim().length === 15) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          GST Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-300 border border-slate-500/30">
        {c.creditDays || 30}d Terms
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Trade Accounts & Customers</span>
            <span className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-bold">
              {customers.length} Accounts
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Commercial trade buyers, verified GSTIN numbers, contact details, and automated payment histories
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trade Customer</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, trade name, GSTIN, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#090d16] border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <span className="text-xs text-slate-400 font-medium hidden sm:block">Filter:</span>
          {[
            { id: 'all', label: 'All Buyers' },
            { id: 'outstanding', label: 'Open Dues' },
            { id: 'gst', label: 'GST Registered' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {customers.length === 0 ? `Welcome to ${business?.name || 'Your Store'}!` : 'No Trade Customers Found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {customers.length === 0
              ? 'This store account is verified and ready. Add your first trade customer or retail buyer below to start generating GST invoices and tracking trade credit.'
              : 'Try adjusting your search query or add a new trade customer to get started.'}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <span>+ Add Your First Customer</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const openInvoicesCount = invoices.filter(
              (inv) => inv.customerId === c.id && inv.status !== 'paid' && inv.balanceDuePaise > 0
            ).length;

            return (
              <div
                key={c.id}
                className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl hover:border-indigo-500/30 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h2 className="text-base font-bold text-white">{c.name}</h2>
                      {c.tradeName && (
                        <p className="text-xs text-slate-400 italic">Trade: {c.tradeName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {getGradeBadge(c.reliabilityGrade || 'B')}
                      {getTradeBadge(c)}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                        {c.preferredLanguage === 'mr' ? 'मराठी' : c.preferredLanguage === 'hi' ? 'हिंदी' : 'EN'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCustomer({ ...c });
                          if (c.gstin) setEditGstinFeedback(validateGstin(c.gstin));
                          else setEditGstinFeedback(null);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Edit Customer Profile & Contact"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact, Email and Location */}
                  <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                    {c.address && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.address}, {c.city || 'Pune'} ({c.state || 'Maharashtra'})</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`tel:${c.phone}`} className="hover:text-indigo-400 font-mono text-slate-300 transition-colors">
                          {c.phone}
                        </a>
                        {c.contactPerson && <span className="text-slate-500">({c.contactPerson})</span>}
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`mailto:${c.email}`} className="hover:text-indigo-400 font-mono text-slate-300 transition-colors">
                          {c.email}
                        </a>
                      </div>
                    )}

                    {/* Customer GSTIN Display & Space to Add/Edit if Not Added */}
                    <div className="pt-1 pb-1">
                      {editingGstinCustId === c.id ? (
                        <div className="p-2.5 bg-[#090d16] border border-indigo-500/50 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-indigo-300">Enter Customer GSTIN (15 chars):</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGstinCustId(null);
                                setGstinInput('');
                                setGstinFeedback(null);
                              }}
                              className="text-slate-400 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={gstinInput}
                            onChange={(e) => handleGstinInputChange(e.target.value)}
                            maxLength={15}
                            placeholder="e.g. 27AAPCS1001A1ZY"
                            className="w-full px-2.5 py-1.5 bg-[#0f172a] border border-slate-700 rounded-lg text-xs font-mono uppercase text-white focus:outline-hidden focus:border-indigo-400"
                          />
                          {gstinFeedback && (
                            <div className="text-[10px]">
                              {gstinFeedback.valid ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Valid: {gstinFeedback.stateName} ({gstinFeedback.stateCode})
                                </span>
                              ) : (
                                <span className="text-rose-400 font-bold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {gstinFeedback.error}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGstinCustId(null);
                                setGstinInput('');
                                setGstinFeedback(null);
                              }}
                              className="px-2.5 py-1 text-slate-400 hover:text-white text-[11px] rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveCustomerGstin(c.id)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg shadow-md transition-colors"
                            >
                              Save GSTIN
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-slate-400 font-semibold text-xs">GSTIN:</span>
                          {c.gstin ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-100 font-bold bg-white/[0.06] px-2 py-0.5 rounded border border-white/10 text-xs">
                                {c.gstin}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStartEditGstin(c)}
                                title="Edit Customer GSTIN"
                                className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-amber-300 font-semibold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded text-[11px]">
                                Not Added (Unregistered)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStartEditGstin(c)}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add GST Number</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Plain-English Reliability Reason Box */}
                  <div className="p-3 bg-[#090d16]/90 border border-slate-800 rounded-xl text-xs mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">
                        Grade {c.reliabilityGrade || 'B'} Assessment:
                      </span>
                      <span className="text-[10px] text-indigo-400 font-mono">
                        Prefers: {c.preferredLanguage === 'mr' ? 'मराठी' : c.preferredLanguage === 'hi' ? 'हिंदी' : 'English'}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{c.reliabilityReason || 'Active registered customer account'}</p>
                  </div>

                  {/* Metrics Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-white/[0.08] text-center mb-4">
                    <div className="p-2 bg-white/[0.03] rounded-xl border border-white/5">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Credit</span>
                      <span className="font-bold text-xs text-white">{c.creditDays || 30} Days</span>
                    </div>
                    <div className="p-2 bg-white/[0.03] rounded-xl border border-white/5">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Avg Delay</span>
                      <span className={`font-bold text-xs ${c.avgDaysLate > 15 ? 'text-rose-400' : 'text-slate-200'}`}>
                        +{c.avgDaysLate || 0} Days
                      </span>
                    </div>
                    <div className="p-2 bg-white/[0.03] rounded-xl border border-white/5">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">On-Time %</span>
                      <span className="font-bold text-xs text-emerald-400">{c.onTimePaymentRate || 100}%</span>
                    </div>
                  </div>
                </div>

                {/* Outstanding Balance Footer */}
                <div className="pt-2 flex items-center justify-between border-t border-white/[0.05]">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Total Owed</span>
                    <span className="text-base font-black font-mono text-white">
                      {formatPaise(c.outstandingPaise || 0)}
                    </span>
                  </div>

                  <Link
                    to={`/invoices?customer=${c.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold rounded-xl transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{openInvoicesCount} Open Bills</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Add New Trade Customer</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Customer / Firm Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Swastik Mobile Hub"
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Trade Name
                  </label>
                  <input
                    type="text"
                    value={addForm.tradeName}
                    onChange={(e) => setAddForm({ ...addForm, tradeName: e.target.value })}
                    placeholder="e.g. Swastik Telecom"
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Dedicated Customer GST Number Space */}
              <div className="p-3 bg-[#090d16] border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-indigo-300">
                    Customer GSTIN (15 Characters)
                  </label>
                  <span className="text-[10px] text-slate-400">Leave blank if unregistered consumer</span>
                </div>
                <input
                  type="text"
                  maxLength={15}
                  value={addForm.gstin}
                  onChange={(e) => handleModalGstinChange(e.target.value)}
                  placeholder="e.g. 27AAPCS1001A1ZY"
                  className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-xs font-mono uppercase text-white focus:outline-hidden focus:border-indigo-500"
                />
                {modalGstinFeedback && (
                  <div className="text-[11px] pt-0.5">
                    {modalGstinFeedback.valid ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Valid GSTIN: {modalGstinFeedback.stateName} ({modalGstinFeedback.stateCode})
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {modalGstinFeedback.error}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98220 12345"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. accounts@dealer.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Shop Address & City
                  </label>
                  <input
                    type="text"
                    value={addForm.address}
                    onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                    placeholder="Address, Pune"
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Credit Terms (Days)
                  </label>
                  <input
                    type="number"
                    value={addForm.creditDays}
                    onChange={(e) => setAddForm({ ...addForm, creditDays: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-white text-xs text-right font-mono font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30"
                >
                  Save & Persist to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Edit Customer Account</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCustomerSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Customer / Firm Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.name || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Trade Name
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.tradeName || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, tradeName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* GSTIN Field */}
              <div className="p-3 bg-[#090d16] border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-indigo-300">
                    Customer GSTIN (15 Characters)
                  </label>
                  <span className="text-[10px] text-slate-400">Leave blank if unregistered</span>
                </div>
                <input
                  type="text"
                  maxLength={15}
                  value={editingCustomer.gstin || ''}
                  onChange={(e) => handleEditModalGstinChange(e.target.value)}
                  placeholder="e.g. 27AAPCS1001A1ZY"
                  className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-xs font-mono uppercase text-white focus:outline-hidden focus:border-indigo-500"
                />
                {editGstinFeedback && (
                  <div className="text-[11px] pt-0.5">
                    {editGstinFeedback.valid ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Valid GSTIN: {editGstinFeedback.stateName} ({editGstinFeedback.stateCode})
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {editGstinFeedback.error}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Email (Invoice Target)
                  </label>
                  <input
                    type="email"
                    value={editingCustomer.email || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Shop Address & City
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.address || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Credit Terms (Days)
                  </label>
                  <input
                    type="number"
                    value={editingCustomer.creditDays || 30}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, creditDays: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-white text-xs text-right font-mono font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30"
                >
                  Update & Save to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
