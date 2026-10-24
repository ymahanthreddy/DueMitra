import React, { useEffect, useRef } from 'react';
import { Printer, X, ShieldCheck, Download, Calendar, Landmark, ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatPaise } from '../utils/money';
import { formatIndianDate } from '../utils/date';

export function MonthlyStatementModal({ statement, business = {}, onClose }) {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!statement) return null;

  const handlePrint = () => {
    const el = document.getElementById('printable-monthly-statement');
    if (!el) {
      window.print();
      return;
    }
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Monthly_Statement_${statement.periodName || 'Statement'}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            * { box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff !important; color: #000000 !important; margin: 0; padding: 20px; font-size: 12px; line-height: 1.5; }
            h1, h2, h3, h4, h5, h6, strong, b, th { color: #000000 !important; font-weight: bold; }
            p, span, div, td { color: #0f172a !important; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; color: #000000 !important; }
            th, td { border: 1px solid #94a3b8 !important; padding: 6px 8px; font-size: 11px; color: #000000 !important; }
            th { background-color: #f1f5f9 !important; font-weight: bold; }
            .grid { display: flex; flex-direction: row; gap: 12px; }
            .grid > div { flex: 1; }
            .border { border: 1px solid #94a3b8 !important; }
            .border-b-2 { border-bottom: 2px solid #000000 !important; }
            .border-b { border-bottom: 1px solid #cbd5e1 !important; }
            .border-r { border-right: 1px solid #cbd5e1 !important; }
            .border-t { border-top: 1px solid #cbd5e1 !important; }
            .p-2 { padding: 8px; }
            .p-2\.5 { padding: 10px; }
            .p-3 { padding: 10px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .font-mono { font-family: monospace; }
            .uppercase { text-transform: uppercase; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .bg-slate-50 { background-color: #f8fafc !important; }
            .bg-slate-100 { background-color: #f1f5f9 !important; }
            .bg-emerald-50 { background-color: #ecfdf5 !important; }
            .bg-rose-50 { background-color: #fff1f2 !important; }
            .bg-indigo-50 { background-color: #eef2ff !important; }
            .bg-slate-900 { background-color: #0f172a !important; color: #ffffff !important; }
            .bg-slate-900 td { color: #ffffff !important; }
            .text-white { color: #ffffff !important; }
            .text-amber-300 { color: #fde047 !important; }
            .text-rose-700 { color: #be123c !important; }
          </style>
        </head>
        <body>
          ${el.innerHTML}
          <script>
            setTimeout(() => {
              window.print();
            }, 350);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exp = statement.expenseBreakdown || {};

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-4xl h-[94vh] max-h-[94vh] flex flex-col overflow-hidden border border-white/10 text-white relative">
        {/* Controls Toolbar (hidden during print) */}
        <div className="no-print shrink-0 flex items-center justify-between px-5 py-3.5 bg-[#090d16] text-white border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <Landmark className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Monthly Business Cash Statement • {statement.periodName}
              </h2>
              <p className="text-xs text-slate-400">
                Official 1st of the Month Financial Statement & Expenditure Audit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all cursor-pointer min-h-[38px]"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close monthly statement"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Container */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-2 sm:p-6 bg-slate-900/60 flex justify-center items-start">
          <div
            id="printable-monthly-statement"
            className="print-container bg-white text-slate-900 w-full max-w-3xl min-h-[297mm] h-auto p-6 sm:p-10 shadow-2xl border border-slate-300 text-xs leading-relaxed relative flex flex-col justify-between rounded-sm font-sans my-4 mb-12 shrink-0"
          >
            <div>
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-950">
                    Monthly Cash Flow & Spending Statement
                  </h1>
                  <p className="text-xs font-bold text-indigo-700 mt-0.5">
                    Generated on {formatIndianDate(statement.statementDate)} (Official 1st of Month Record)
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Accounting Period: <strong>{statement.periodName}</strong> ({formatIndianDate(statement.startDate)} to {formatIndianDate(statement.endDate)})
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-slate-300 sm:pl-4">
                  <h3 className="font-bold text-sm text-slate-950">{business?.name || 'Kavach Mobile Accessories'}</h3>
                  <p className="text-[11px] text-slate-600 font-mono">GSTIN: {business?.gstin || '27AABCU9603R1ZM'}</p>
                  <p className="text-[11px] text-slate-600">{business?.city || 'Pune'}, {business?.state || 'Maharashtra'}</p>
                </div>
              </div>

              {/* Solvency Summary 4-Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Opening Bank Cash</span>
                  <span className="text-sm font-black font-mono text-slate-900 mt-0.5 block">
                    {formatPaise(statement.openingBalancePaise)}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                    <span>Inflows Collected</span>
                  </span>
                  <span className="text-sm font-black font-mono text-emerald-900 mt-0.5 block">
                    {formatPaise(statement.totalInflowsPaise)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">({statement.invoicesCollectedCount} Invoices Cleared)</span>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-rose-600" />
                    <span>Total Outflows Spent</span>
                  </span>
                  <span className="text-sm font-black font-mono text-rose-900 mt-0.5 block">
                    {formatPaise(statement.totalOutflowsPaise)}
                  </span>
                  <span className="text-[10px] text-rose-700 font-medium">(OpEx + EMIs + Fleet)</span>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block">Closing Bank Balance</span>
                  <span className="text-sm font-black font-mono text-indigo-950 mt-0.5 block">
                    {formatPaise(statement.closingBalancePaise)}
                  </span>
                  <span className="text-[10px] text-indigo-700 font-medium">
                    {statement.netMonthSurplusPaise >= 0 ? `+${formatPaise(statement.netMonthSurplusPaise)} Net Surplus` : `-${formatPaise(Math.abs(statement.netMonthSurplusPaise))} Net Deficit`}
                  </span>
                </div>
              </div>

              {/* Itemized Spending Breakdown Table */}
              <div className="mb-6">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-200 pb-1">
                  Itemized Monthly Business Outflows (Expenses Breakdown)
                </h3>
                <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300">Expense Category</th>
                      <th className="p-2 border-r border-slate-300">Description & Contractual Terms</th>
                      <th className="p-2 text-right w-32">Amount Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                        1. Shop Premises Rent
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        Commercial Shop Lease (Contractual 5% Annual Compounding Escalation)
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-950">
                        {formatPaise(exp.rentPaise || 4725000)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                        2. Petrol & Delivery Fuel
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        Fleet fuel allocation for dispatch riders, wholesale pickups & store deliveries
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-950">
                        {formatPaise(exp.petrolPaise || 1250000)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                        3. Business Loan EMIs
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        HDFC Bank MSME Working Capital Term Loan (Principal + 11.5% Interest)
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-950">
                        {formatPaise(exp.loansPaise || 3200000)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                        4. Company-Owned Vehicles
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        Tata Ace Delivery Van EMI (₹14,500) + Fleet Maintenance (₹8,000) + Delivery 2-Wheeler Fleet (₹4,500)
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-950">
                        {formatPaise(exp.vehiclesPaise || 2700000)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                        5. Staff Salaries & Payroll
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        4 Full-time staff members (Retail store executives, inventory clerk & dispatch rider)
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-950">
                        {formatPaise(exp.salariesPaise || 9500000)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                        6. Electricity & Utilities
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        MSEDCL Shop Electricity (₹8,500) + Airtel Commercial High-Speed Fiber (₹2,500)
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-950">
                        {formatPaise(exp.utilitiesPaise || 1100000)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                        7. Statutory Taxes (GST)
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        Net GSTR-3B Monthly Tax Liability (after ITC adjustment)
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-950">
                        {formatPaise(exp.taxesPaise || 3800000)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white font-bold">
                      <td colSpan={2} className="p-2.5 text-right uppercase tracking-wider text-xs">
                        Total Monthly Expenditure:
                      </td>
                      <td className="p-2.5 text-right font-mono text-sm text-amber-300">
                        {formatPaise(statement.totalOutflowsPaise)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Receivables & Outstanding Dues Position */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Month-End Customer Receivables & Dues
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Total uncollected balance owed by dealers at the close of {statement.periodName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-rose-700">
                      {formatPaise(statement.outstandingDuesAtMonthEndPaise)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Pending Inflow Recovery</span>
                  </div>
                </div>
              </div>

              {/* Solvency & Affordability Verdict */}
              <div className="border border-indigo-200 bg-indigo-50/60 rounded-lg p-3 text-[11px] text-indigo-950">
                <strong>Executive Liquidity Assessment: </strong>
                The closing balance of {formatPaise(statement.closingBalancePaise)} provides approximately{' '}
                <strong>{Number((statement.closingBalancePaise / statement.totalOutflowsPaise).toFixed(1))} months</strong> of complete operational expense runway without relying on new inventory credit.
              </div>
            </div>

            {/* Signature & Verification */}
            <div className="border-t border-slate-300 pt-4 mt-6 flex justify-between items-end text-[11px] text-slate-500">
              <div>
                <p>Generated by DueMitra Financial Engine</p>
                <p>System Timestamp: {new Date().toISOString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">For {business?.name || 'Kavach Mobile Accessories'}</p>
                <div className="h-8" />
                <p className="border-t border-slate-400 pt-1">Authorized Proprietor / Partner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

