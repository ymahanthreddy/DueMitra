import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Landmark,
  FileSpreadsheet,
  Zap,
  Scale,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getStateFromGstin } from '../utils/gst';

export function RegisterBusinessModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { registerBusiness, login } = useApp();

  const [step, setStep] = useState(1);
  const [submittedBiz, setSubmittedBiz] = useState(null);

  const [form, setForm] = useState({
    name: '',
    tradeName: '',
    industry: 'Electronics',
    category: 'Electronics & Hardware Wholesale',
    gstin: '',
    state: 'Maharashtra',
    stateCode: '27',
    city: 'Mumbai',
    address: '',
    pincode: '',
    phone: '',
    email: '',
    isUdyamRegistered: true,
    udyamNumber: '',
    enterpriseType: 'Micro',
    defaultCreditDays: 30,
    invoicePrefix: 'INV/26-27/',
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    upiId: '',
    authorizedSignatory: '',
    designation: 'Store Account',
    themeColor: 'indigo',
    loginEmail: '',
    loginPassword: '',
    userName: '',
    userRole: 'Store Account',
  });

  if (!isOpen) return null;

  const handleGstinChange = (e) => {
    const val = e.target.value.toUpperCase();
    const stateInfo = getStateFromGstin(val);
    setForm(prev => ({
      ...prev,
      gstin: val,
      state: stateInfo.state || prev.state,
      stateCode: stateInfo.code || prev.stateCode,
    }));
  };

  const handleIndustryChange = (e) => {
    const ind = e.target.value;
    let cat = `${ind} Wholesale & Supplies`;
    let prefix = `${ind.slice(0, 3).toUpperCase()}/26-27/`;
    let color = 'indigo';

    if (ind === 'Manufacturing') {
      cat = 'Precision CNC & Automotive Engineering';
      prefix = 'MFG/26-27/';
      color = 'cyan';
    } else if (ind === 'Pharmaceuticals') {
      cat = 'B2B Pharmaceuticals & Hospital Distribution';
      prefix = 'PHR/26-27/';
      color = 'emerald';
    } else if (ind === 'Textiles') {
      cat = 'Apparel & Fabric Wholesale Distribution';
      prefix = 'TXT/26-27/';
      color = 'amber';
    } else if (ind === 'IT Services') {
      cat = 'Software, Cloud & IT Consulting Services';
      prefix = 'ITS/26-27/';
      color = 'violet';
    } else if (ind === 'FMCG') {
      cat = 'Packaged Consumer Goods & Food Distribution';
      prefix = 'FMCG/26-27/';
      color = 'rose';
    }

    setForm(prev => ({
      ...prev,
      industry: ind,
      category: cat,
      invoicePrefix: prefix,
      themeColor: color,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const safeEmail = form.loginEmail.trim() || form.email.trim() || `${form.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@store.in`;
    const safePass = form.loginPassword.trim() || `${form.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4) || 'user'}@123`;
    const safeUser = form.userName.trim() || form.authorizedSignatory.trim() || 'Store Account';

    const finalData = {
      ...form,
      loginEmail: safeEmail,
      loginPassword: safePass,
      userName: safeUser,
      userRole: 'Store Account',
    };

    const res = registerBusiness(finalData);
    setSubmittedBiz(res?.business || finalData);
  };

  const handleCloseSubmitted = () => {
    setSubmittedBiz(null);
    setStep(1);
    onClose();
  };

  const handleDirectApproveAsAdmin = () => {
    const res = login('admin@duemitra.in', 'admin@duemitra123');
    setSubmittedBiz(null);
    setStep(1);
    onClose();
    if (res.success) {
      navigate('/admin');
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (submittedBiz) handleCloseSubmitted();
          else onClose();
        }
      }}
    >
      <div className="bg-[#0f172a] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-white/10 text-white relative">
        {submittedBiz ? (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/10">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider inline-block">
                Pending Platform Admin Approval
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Application Received for {submittedBiz.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Your B2B store application has been logged and synced to Supabase Cloud.
                DueMitra Platform Admin reviews all merchant GSTINs and profiles before unlocking store access.
              </p>
            </div>

            <div className="bg-[#090e1a] border border-white/10 rounded-2xl p-4 text-xs text-left max-w-md mx-auto space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Application ID:</span>
                <span className="text-cyan-300 font-bold">{submittedBiz.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Store Login Email:</span>
                <span className="text-slate-200">{submittedBiz.loginEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GSTIN:</span>
                <span className="text-slate-200">{submittedBiz.gstin || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="text-amber-400 font-bold">Awaiting Platform HQ Review</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCloseSubmitted}
                className="w-full sm:w-auto px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-white/10 transition-colors cursor-pointer"
              >
                Return to Login
              </button>

              <button
                type="button"
                onClick={handleDirectApproveAsAdmin}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm border border-blue-400/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-200" />
                <span>Open Platform Admin to Approve Store &rarr;</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-[#090d16] border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-600 rounded-xl shadow-sm ring-1 ring-white/15 text-white">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Register New Business Workspace</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Cloud SaaS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Setup your active tenant for autonomous trade credit, GST invoicing & MSME recovery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="shrink-0 bg-[#0c1220] px-6 py-3 border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'font-bold text-white' : 'text-slate-400'}>
              Identity & GST
            </span>
          </div>
          <div className="w-8 h-0.5 bg-white/10" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'font-bold text-white' : 'text-slate-400'}>
              MSME & Credit Terms
            </span>
          </div>
          <div className="w-8 h-0.5 bg-white/10" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              3
            </span>
            <span className={step === 3 ? 'font-bold text-white' : 'text-slate-400'}>
              Banking & UPI
            </span>
          </div>
        </div>

        {/* Form Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Legal Entity Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Precision Tools Private Limited"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Trade / Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Hardware Hub"
                    value={form.tradeName}
                    onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={form.industry}
                    onChange={handleIndustryChange}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="Electronics">Electronics & Hardware Wholesale</option>
                    <option value="Manufacturing">Precision Engineering & Auto Ancillary</option>
                    <option value="Pharmaceuticals">B2B Pharmaceuticals & Health Supplies</option>
                    <option value="Textiles">Textiles, Garments & Apparel</option>
                    <option value="IT Services">B2B SaaS & IT Software Services</option>
                    <option value="FMCG">FMCG & Consumer Goods Wholesale</option>
                    <option value="General Trade">General B2B Commercial Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GSTIN (15 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 27AABCK1234F1ZZ"
                    value={form.gstin}
                    onChange={handleGstinChange}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    State (Code)
                  </label>
                  <input
                    type="text"
                    value={`${form.state} (${form.stateCode})`}
                    disabled
                    className="w-full bg-[#0a0f1d]/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    City <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 560058"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot 42-B, Peenya Industrial Area, Phase 3"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Billing Email
                  </label>
                  <input
                    type="email"
                    placeholder="billing@apexprecision.in"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Support / WhatsApp Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98450 78901"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <strong className="block text-amber-300 font-bold mb-0.5">
                    MSMED Act 2006 Statutory Debt Protection
                  </strong>
                  <p className="leading-relaxed">
                    Registering your Udyam MSME number enables statutory 45-day payment ceilings and automatic calculation of Section 16 compound interest (3x RBI Bank Rate) on demand letters.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#0a0f1d] border border-white/10 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-white block">Udyam MSME Registered?</span>
                  <span className="text-[11px] text-slate-400">Activate statutory non-litigation recovery badges</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.isUdyamRegistered}
                  onChange={(e) => setForm({ ...form, isUdyamRegistered: e.target.checked })}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {form.isUdyamRegistered && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Udyam Registration Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UDYAM-KR-03-0045678"
                      value={form.udyamNumber}
                      onChange={(e) => setForm({ ...form, udyamNumber: e.target.value.toUpperCase() })}
                      className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Enterprise Category
                    </label>
                    <select
                      value={form.enterpriseType}
                      onChange={(e) => setForm({ ...form, enterpriseType: e.target.value })}
                      className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <option value="Micro">Micro (Turnover up to ₹5 Crore)</option>
                      <option value="Small">Small (Turnover up to ₹50 Crore)</option>
                      <option value="Medium">Medium (Turnover up to ₹250 Crore)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Standard Credit Period
                  </label>
                  <select
                    value={form.defaultCreditDays}
                    onChange={(e) => setForm({ ...form, defaultCreditDays: Number(e.target.value) })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value={15}>15 Days (Fast Moving Trade)</option>
                    <option value={30}>30 Days (Standard B2B Terms)</option>
                    <option value={45}>45 Days (Max Legal MSMED Limit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Invoice Series Prefix
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. APX/26-27/"
                    value={form.invoicePrefix}
                    onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value.toUpperCase() })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ICICI Bank"
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 000205012345"
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ICIC0000002"
                    value={form.ifscCode}
                    onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Business UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. acmetools@icici"
                    value={form.upiId}
                    onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Authorized Signatory Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={form.authorizedSignatory}
                    onChange={(e) => setForm({ ...form, authorizedSignatory: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Signatory Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Managing Director / Partner"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Login Credentials for this Tenant */}
              <div className="p-4 bg-[#0a0f1d] border border-cyan-500/30 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Business Admin Login Credentials</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Login Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. admin@acmetools.in"
                      value={form.loginEmail}
                      onChange={(e) => setForm({ ...form, loginEmail: e.target.value })}
                      className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Password
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. acme@123"
                      value={form.loginPassword}
                      onChange={(e) => setForm({ ...form, loginPassword: e.target.value })}
                      className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-[#090d16] border-t border-white/10">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 && !form.name.trim()}
                onClick={() => setStep(s => s + 1)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all cursor-pointer min-h-[38px]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!form.name.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 border border-emerald-400/25 transition-all cursor-pointer min-h-[38px]"
              >
                <Zap className="w-4 h-4" />
                <span>Submit for Admin Approval</span>
              </button>
            )}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

