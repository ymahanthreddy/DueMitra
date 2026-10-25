import React, { useState } from 'react';
import {
  Landmark,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Printer,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Truck,
  Building,
  Fuel,
  CreditCard,
  Users,
  Zap,
  Droplets,
  ShieldCheck,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise, rupeesToPaise, paiseToRupees } from '../utils/money';
import { formatIndianDate } from '../utils/date';
import { calculateEscalatedRent } from '../utils/affordability';
import { MonthlyStatementModal } from '../components/MonthlyStatementModal';

function getCategoryIcon(cat) {
  switch (cat) {
    case 'Rent':
      return <Building className="w-4 h-4 text-amber-400" />;
    case 'Water & Utilities':
    case 'Water':
      return <Droplets className="w-4 h-4 text-cyan-400" />;
    case 'Petrol & Logistics':
      return <Fuel className="w-4 h-4 text-orange-400" />;
    case 'Loans & EMIs':
    case 'Business Loans':
      return <CreditCard className="w-4 h-4 text-rose-400" />;
    case 'Vehicles':
    case 'Company Vehicles':
      return <Truck className="w-4 h-4 text-blue-400" />;
    case 'Salaries':
      return <Users className="w-4 h-4 text-emerald-400" />;
    case 'Utilities':
      return <Zap className="w-4 h-4 text-yellow-400" />;
    default:
      return <DollarSign className="w-4 h-4 text-indigo-400" />;
  }
}

export function BankExpensesScreen() {
  const {
    business,
    bankBalancePaise,
    expenses = [],
    affordability,
    monthlyStatements = [],
    updateBankBalance,
    updateExpense,
    addExpense,
    deleteExpense,
    demoDate,
  } = useApp();

  const [editingBalance, setEditingBalance] = useState(false);
  const [newBalanceRupees, setNewBalanceRupees] = useState(paiseToRupees(bankBalancePaise));
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [rentEscalationYears, setRentEscalationYears] = useState(2); // 2026 vs 2025 base
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExp, setEditingExp] = useState(null);

  // New expense form state
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpCategory, setNewExpCategory] = useState('Water & Utilities');
  const [newExpRecipient, setNewExpRecipient] = useState('');
  const [newExpRupees, setNewExpRupees] = useState(3500);
  const [newExpDay, setNewExpDay] = useState(12);
  const [newExpDesc, setNewExpDesc] = useState('');

  const handleSaveBalance = (e) => {
    e.preventDefault();
    const paise = rupeesToPaise(Number(newBalanceRupees) || 0);
    updateBankBalance(paise);
    setEditingBalance(false);
  };

  const handleSaveEditedExpense = (e) => {
    e.preventDefault();
    if (!editingExp || !editingExp.title?.trim()) return;

    updateExpense(editingExp.id, {
      title: editingExp.title.trim(),
      category: editingExp.category,
      recipient: editingExp.recipient?.trim() || 'Vendor',
      amountPaise: rupeesToPaise(Number(editingExp.amountRupees) || 0),
      dayOfMonth: Number(editingExp.dayOfMonth) || 1,
      description: editingExp.description?.trim() || '',
    });

    setEditingExp(null);
  };

  const handleCreateExpense = (e) => {
    e.preventDefault();
    if (!newExpTitle.trim()) return;

    addExpense({
      title: newExpTitle.trim(),
      category: newExpCategory,
      recipient: newExpRecipient.trim() || 'Vendor',
      amountPaise: rupeesToPaise(Number(newExpRupees) || 0),
      dayOfMonth: Number(newExpDay) || 1,
      isRecurring: true,
      description: newExpDesc.trim() || `${newExpCategory} monthly commitment`,
    });

    setNewExpTitle('');
    setNewExpRupees(3500);
    setNewExpRecipient('');
    setNewExpDesc('');
    setShowAddModal(false);
  };

  const totalMonthlyExpensePaise = expenses.reduce((sum, e) => sum + (e.amountPaise || 0), 0);
  const rentExp = expenses.find((e) => e.category === 'Rent');
  const hasRent = Boolean(rentExp);
  const baseRentPaise = rentExp ? (rentExp.baseAmountPaise || rentExp.amountPaise || 0) : 0;
  const projectedRentPaise = hasRent
    ? calculateEscalatedRent(
        baseRentPaise,
        rentExp.leaseStartYear || 2025,
        2025 + rentEscalationYears,
        (rentExp.annualEscalationPercent || 5) / 100
      )
    : 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <Landmark className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bank Balance, Dues & Operating Outflow
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time cash reserves, water/electricity utilities, recurring lease escalations, and official monthly statements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense / Bill</span>
          </button>

          {monthlyStatements.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedStatement(monthlyStatements[0])}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Latest Statement</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Bank Balance (Editable) */}
        <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              Current Bank Balance
            </span>
            {!editingBalance ? (
              <button
                type="button"
                onClick={() => {
                  setNewBalanceRupees(paiseToRupees(bankBalancePaise));
                  setEditingBalance(true);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            ) : null}
          </div>

          {!editingBalance ? (
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                {formatPaise(bankBalancePaise)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified in Supabase Database</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveBalance} className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={newBalanceRupees}
                  onChange={(e) => setNewBalanceRupees(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-indigo-500 rounded-lg px-2.5 py-1 text-sm font-mono text-white font-bold focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-md"
                >
                  Save to DB
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBalance(false)}
                  className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-white text-[11px] rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Card 2: Total Monthly Commitments */}
        <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Monthly Commitments
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
              {expenses.length} Scheduled Items
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
            {formatPaise(totalMonthlyExpensePaise)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Shop Rent, Water Cess, Salaries, Fuel & EMIs
          </div>
        </div>

        {/* Card 3: Financial Health & Runway */}
        <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Financial Health & Safety Buffer
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
              Floor: {formatPaise(business?.safetyBufferPaise || 20000000)}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
            {expenses.length > 0 ? (affordability?.estimatedRunwayDays || 0) : 0} <span className="text-sm font-medium text-slate-400">days runway</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {bankBalancePaise >= (business?.safetyBufferPaise || 20000000)
              ? 'Operating liquidity comfortably covers emergency floor'
              : 'Caution: Bank balance is below configured safety threshold'}
          </div>
        </div>
      </div>

      {/* 3. Rent Escalation Simulator */}
      <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <Building className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Shop Rent Clause & 5% Escalation Tracker
              </h3>
              <p className="text-xs text-slate-400">
                Registered 3-year commercial lease with mandatory 5% annual compounding escalation clause
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0a0f1d] border border-slate-700 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400">Forecast Year:</span>
            <select
              value={rentEscalationYears}
              onChange={(e) => setRentEscalationYears(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
            >
              <option value={0} className="bg-[#0b101d]">Year 1 (2025 Base - ₹45,000)</option>
              <option value={1} className="bg-[#0b101d]">Year 2 (2026 Active - ₹47,250)</option>
              <option value={2} className="bg-[#0b101d]">Year 3 (2027 Escalated - ₹49,612)</option>
              <option value={3} className="bg-[#0b101d]">Year 4 (2028 Escalated - ₹52,093)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#0a0f1d] p-3.5 rounded-xl border border-white/5">
            <div className="text-slate-400">Base Rent {hasRent ? `(${rentExp?.leaseStartYear || 2025})` : ''}</div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {hasRent ? `${formatPaise(baseRentPaise)} / mo` : '₹0 / mo (None)'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {hasRent ? 'Lease starting point' : 'No rent expense added'}
            </div>
          </div>
          <div className="bg-[#0a0f1d] p-3.5 rounded-xl border border-white/5">
            <div className="text-slate-400">Projected Month Cost</div>
            <div className="text-base font-bold font-mono text-amber-400 mt-1">
              {formatPaise(projectedRentPaise)} / mo
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">+5% compounding rate</div>
          </div>
          <div className="bg-[#0a0f1d] p-3.5 rounded-xl border border-white/5">
            <div className="text-slate-400">Annual Outflow Total</div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {formatPaise(projectedRentPaise * 12)} / yr
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Full year lease obligation</div>
          </div>
        </div>
      </div>

      {/* 4. Operating Expenses & Recurring Bills List (Editable & Deletable) */}
      <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>All Operating Expenses, Water & Utility Commitments</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Editable expenses saved directly to Supabase cloud database
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 bg-[#0a0f1d] rounded-2xl border border-white/5 text-center space-y-2">
            <Building className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">No Operating Expenses Recorded Yet</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Add your recurring shop rent, utility bills, fuel, and loan EMIs to forecast working capital and compute runway.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add First Expense</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expenses.map((item) => (
            <div
              key={item.id}
              className="bg-[#0a0f1d] border border-white/5 hover:border-white/10 rounded-xl p-4 flex flex-col justify-between transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="p-2.5 bg-white/5 border border-white/10 rounded-xl mt-0.5">
                    {getCategoryIcon(item.category)}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{item.title}</span>
                      <span className="text-[10px] font-normal text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Payee: <span className="text-slate-200 font-medium">{item.recipient || 'Vendor'}</span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="text-base font-black font-mono text-white">
                    {formatPaise(item.amountPaise)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Due on <span className="text-indigo-400 font-bold">{item.dayOfMonth || 1}st/mo</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-xs text-slate-500">
                <span>Recurring Monthly</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingExp({
                        ...item,
                        amountRupees: paiseToRupees(item.amountPaise),
                      })
                    }
                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Edit expense"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete expense "${item.title}"? This will sync to DB.`)) {
                        deleteExpense(item.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Remove expense"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

      {/* 5. Historical Monthly Statements Archive (View & Print any past month) */}
      <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Historical Monthly Statements Archive</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Official 1st-of-the-month financial statements generated across past operating periods
            </p>
          </div>
        </div>

        {monthlyStatements.length === 0 ? (
          <div className="p-4 bg-[#0a0f1d] rounded-xl border border-white/5 text-xs text-slate-500 italic text-center">
            No historical statements generated yet. Statements are automatically compiled on the 1st of each calendar month.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthlyStatements.map((stmt, idx) => (
              <div
                key={stmt.id || idx}
                className="bg-[#0a0f1d] border border-white/5 hover:border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {stmt.periodName}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">
                        Statement #{monthlyStatements.length - idx}
                      </h3>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Dated: {formatIndianDate(stmt.statementDate)}
                      </div>
                    </div>
                    <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                      <Landmark className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Total Collections</span>
                      <span className="font-mono font-bold text-emerald-400">{formatPaise(stmt.totalCollectionsPaise ?? stmt.totalInflowsPaise ?? 0)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Total Expenses</span>
                      <span className="font-mono font-bold text-rose-400">{formatPaise(stmt.totalExpensesPaise ?? stmt.totalOutflowsPaise ?? 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Closing Cash</span>
                    <span className="font-mono font-bold text-white">{formatPaise(stmt.closingBankPaise ?? stmt.closingBalancePaise ?? bankBalancePaise)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedStatement(stmt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View & Print</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Statement Printouts Modal */}
      {selectedStatement && (
        <MonthlyStatementModal
          statement={selectedStatement}
          business={business}
          onClose={() => setSelectedStatement(null)}
        />
      )}

      {/* 7. Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Add Operating Expense (DB Sync)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expense Name / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PMC Water Bill, Electricity, Salaries"
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newExpCategory}
                    onChange={(e) => setNewExpCategory(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-400"
                  >
                    <option value="Water & Utilities">Water & Municipal Cess</option>
                    <option value="Rent">Shop Rent</option>
                    <option value="Petrol & Logistics">Petrol & Logistics</option>
                    <option value="Loans & EMIs">Business Loans & EMIs</option>
                    <option value="Vehicles">Company Vehicles</option>
                    <option value="Salaries">Staff Salaries</option>
                    <option value="Utilities">Electricity & Broadband</option>
                    <option value="Other">Other Operating Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payee / Recipient</label>
                  <input
                    type="text"
                    placeholder="e.g. Pune Municipal Corp"
                    value={newExpRecipient}
                    onChange={(e) => setNewExpRecipient(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newExpRupees}
                    onChange={(e) => setNewExpRupees(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newExpDay}
                    onChange={(e) => setNewExpDay(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or terms"
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Save & Persist to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Edit Expense Modal */}
      {editingExp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0b101d] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                <span>Edit Operating Expense</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingExp(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expense Name / Title *</label>
                <input
                  type="text"
                  required
                  value={editingExp.title || ''}
                  onChange={(e) => setEditingExp({ ...editingExp, title: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={editingExp.category || 'Water & Utilities'}
                    onChange={(e) => setEditingExp({ ...editingExp, category: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-400"
                  >
                    <option value="Water & Utilities">Water & Municipal Cess</option>
                    <option value="Rent">Shop Rent (5% Escalation)</option>
                    <option value="Petrol & Logistics">Petrol & Logistics Fuel</option>
                    <option value="Loans & EMIs">Business Loans & EMIs</option>
                    <option value="Vehicles">Company Vehicles</option>
                    <option value="Salaries">Staff Salaries</option>
                    <option value="Utilities">Electricity & Broadband</option>
                    <option value="Other">Other Operating Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payee / Recipient</label>
                  <input
                    type="text"
                    value={editingExp.recipient || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, recipient: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingExp.amountRupees || 0}
                    onChange={(e) => setEditingExp({ ...editingExp, amountRupees: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editingExp.dayOfMonth || 1}
                    onChange={(e) => setEditingExp({ ...editingExp, dayOfMonth: Number(e.target.value) })}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={editingExp.description || ''}
                  onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
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
