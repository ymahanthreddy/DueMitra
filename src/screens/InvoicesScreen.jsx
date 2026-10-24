import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Clock,
  Printer,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  Landmark
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise } from '../utils/money';
import { formatIndianDate, getDaysDiff } from '../utils/date';
import { PrintInvoiceModal } from '../components/PrintInvoiceModal';
import { PrintDemandLetterModal } from '../components/PrintDemandLetterModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';

export function InvoicesScreen() {
  const { t, invoices, customers, business, config, demoDate, recordInvoicePayment } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [selectedDemandInvoice, setSelectedDemandInvoice] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  // Status badge styling in Apex Fintech Navy
  const getStatusBadge = (status, daysOverdue = 0) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Paid in Full</span>;
      case 'part_paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">Part Paid</span>;
      case 'overdue':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Overdue ({daysOverdue}d)</span>;
      case 'due_soon':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Due Soon</span>;
      case 'disputed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Disputed</span>;
      case 'sent':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/[0.05] text-slate-300 border border-white/10">Sent</span>;
      case 'draft':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/[0.05] text-slate-400 border border-white/10">Draft</span>;
    }
  };

  // Filtered and searched invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.customerName.toLowerCase().includes(searchLower) ||
        (inv.customerGstin && inv.customerGstin.toLowerCase().includes(searchLower));

      const matchesCust = selectedCustomer === 'all' || inv.customerId === selectedCustomer;

      let matchesStatus = selectedStatus === 'all' || inv.status === selectedStatus;
      if (selectedStatus === 'overdue') {
        const days = getDaysDiff(demoDate, inv.dueDate);
        matchesStatus = inv.status === 'overdue' || (inv.balanceDuePaise > 0 && days > 0);
      }

      return matchesSearch && matchesCust && matchesStatus;
    });
  }, [invoices, searchTerm, selectedCustomer, selectedStatus, demoDate]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('invoices.title')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('invoices.subtitle')} ({filteredInvoices.length} total bills)
          </p>
        </div>

        <Link
          to="/invoices/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all self-start sm:self-auto cursor-pointer min-h-[48px]"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          <span className="text-white font-bold">{t('invoices.newBtn')}</span>
        </Link>
      </div>

      {/* Filters & Search Bar in Slate Navy Card */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/10 p-4 shadow-lg grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('invoices.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-[#090d16] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Customer Select */}
        <div>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            aria-label="Filter by customer"
            className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t('invoices.filterCustomer')}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.stateCode !== business?.stateCode ? `(${c.state})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Status Select */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by invoice status"
            className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t('status.all')}</option>
            <option value="overdue">{t('status.overdue')}</option>
            <option value="due_soon">{t('status.due_soon')}</option>
            <option value="part_paid">{t('status.part_paid')}</option>
            <option value="paid">{t('status.paid')}</option>
            <option value="disputed">{t('status.disputed')}</option>
            <option value="sent">{t('status.sent')}</option>
            <option value="draft">{t('status.draft')}</option>
          </select>
        </div>
      </div>

      {/* Table for Laptop, Card List for Mobile */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 font-bold border-b border-white/10 text-xs uppercase tracking-wider">
                <th className="p-3.5 pl-5">{t('invoices.invoiceCol')}</th>
                <th className="p-3.5">{t('invoices.customerCol')}</th>
                <th className="p-3.5">{t('invoices.dateCol')}</th>
                <th className="p-3.5">{t('invoices.dueDateCol')}</th>
                <th className="p-3.5 text-right">{t('invoices.totalCol')}</th>
                <th className="p-3.5 text-right">{t('invoices.balanceCol')}</th>
                <th className="p-3.5 text-center">{t('invoices.statusCol')}</th>
                <th className="p-3.5 text-right pr-5">{t('invoices.actionsCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInvoices.map((inv) => {
                const daysOverdue = Math.max(0, getDaysDiff(demoDate, inv.dueDate));
                return (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-emerald-400">
                      <Link to={`/invoices/${inv.id}`} className="hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{inv.customerName}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {inv.customerGstin ? inv.customerGstin : 'Unregistered'} • {inv.customerState}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-400 text-xs">
                      {formatIndianDate(inv.invoiceDate)}
                    </td>
                    <td className="p-3.5 text-xs">
                      <span className={daysOverdue > 0 && inv.balanceDuePaise > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {formatIndianDate(inv.dueDate)}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      {formatPaise(inv.grandTotalPaise)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      {formatPaise(inv.balanceDuePaise)}
                    </td>
                    <td className="p-3.5 text-center">
                      {getStatusBadge(inv.status, daysOverdue)}
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.balanceDuePaise > 0 && (
                          <button
                            onClick={() => setSelectedInvoiceForPayment(inv)}
                            title="Record Bank Transfer / Cheque / DD / Partial Payment"
                            className="p-2 text-emerald-400 hover:text-white hover:bg-emerald-600/30 rounded-lg transition-colors cursor-pointer"
                          >
                            <Landmark className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          title="Print / Save PDF"
                          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/invoices/${inv.id}`}
                          title="View Invoice Timeline"
                          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {daysOverdue >= 30 && inv.balanceDuePaise > 0 && (
                          <button
                            onClick={() => setSelectedDemandInvoice(inv)}
                            title="Generate Payment Demand Letter"
                            className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Dark Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {filteredInvoices.map((inv) => {
            const daysOverdue = Math.max(0, getDaysDiff(demoDate, inv.dueDate));
            return (
              <div key={inv.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="font-mono font-bold text-indigo-400 text-sm hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                    <p className="font-bold text-white text-sm">{inv.customerName}</p>
                  </div>
                  <div>{getStatusBadge(inv.status, daysOverdue)}</div>
                </div>

                <div className="flex justify-between items-baseline text-xs text-slate-400 pt-1 border-t border-white/5">
                  <div>
                    <span>Due: </span>
                    <strong className={daysOverdue > 0 && inv.balanceDuePaise > 0 ? 'text-rose-400' : 'text-slate-200'}>
                      {formatIndianDate(inv.dueDate)}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Balance: </span>
                    <strong className="font-mono text-white text-sm">{formatPaise(inv.balanceDuePaise)}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setSelectedInvoiceForPrint(inv)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer min-h-[40px]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print PDF</span>
                  </button>
                  <Link
                    to={`/invoices/${inv.id}`}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer min-h-[40px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Timeline</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <p className="font-bold text-base text-slate-200">
              {invoices.length === 0 ? 'No Invoices Created Yet' : 'No invoices matched your filters'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {invoices.length === 0
                ? 'Create and dispatch your first GST-compliant B2B tax invoice with dynamic UPI QR code.'
                : 'Try resetting the search keyword or status filter.'}
            </p>
            {invoices.length === 0 && (
              <Link
                to="/invoices/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Create First Invoice</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Print Tax Invoice Modal */}
      {selectedInvoiceForPrint && (
        <PrintInvoiceModal
          invoice={selectedInvoiceForPrint}
          business={business}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}

      {/* Demand Letter Modal */}
      {selectedDemandInvoice && (
        <PrintDemandLetterModal
          invoice={selectedDemandInvoice}
          customer={customers.find(c => c.id === selectedDemandInvoice.customerId)}
          business={business}
          config={config}
          demoDate={demoDate}
          onClose={() => setSelectedDemandInvoice(null)}
        />
      )}

      {/* Record Payment / Settlement Modal */}
      {selectedInvoiceForPayment && (
        <RecordPaymentModal
          invoice={selectedInvoiceForPayment}
          business={business}
          onClose={() => setSelectedInvoiceForPayment(null)}
          onPaymentRecorded={(paymentData) => {
            recordInvoicePayment(paymentData);
          }}
        />
      )}
    </div>
  );
}
