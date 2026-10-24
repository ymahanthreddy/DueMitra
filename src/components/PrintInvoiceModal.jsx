import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Download, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatPaise, paiseToRupees, numberToWordsIndian } from '../utils/money.js';
import { formatIndianDate } from '../utils/date.js';
import { useApp } from '../context/AppContext';

export function PrintInvoiceModal({ invoice, business, onClose }) {
  const scrollContainerRef = useRef(null);
  const { autoReminderSettings } = useApp();
  const isBilingual = Boolean(autoReminderSettings?.bilingualMarathi);

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

  if (!invoice) return null;

  const isComposition = business.registrationType === 'composition';
  const isUnregistered = business.registrationType === 'unregistered';
  const isRegular = !isComposition && !isUnregistered;

  // Invoice Title
  let invoiceTitle = 'TAX INVOICE';
  let subHeading = '';
  if (isComposition) {
    invoiceTitle = 'BILL OF SUPPLY';
    subHeading = 'Composition taxable person, not eligible to collect tax on supplies';
  } else if (isUnregistered) {
    invoiceTitle = 'INVOICE';
  }

  const isIntraState = invoice.customerStateCode === business.stateCode;
  const grandTotalRupees = (invoice.grandTotalPaise / 100).toFixed(2);

  // UPI payment deep link
  const upiUrl = `upi://pay?pa=${encodeURIComponent(business.upiId)}&pn=${encodeURIComponent(
    business.name
  )}&am=${grandTotalRupees}&tn=${encodeURIComponent(invoice.invoiceNumber)}&cu=INR`;

  const isOverTurnoverThreshold = (business.turnoverPaise || 0) > 500000000; // ₹5 Crore

  const handlePrint = () => {
    const el = document.getElementById('printable-tax-invoice');
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
          <title>${invoice.invoiceNumber || 'Tax_Invoice'}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            * { box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff !important; color: #000000 !important; margin: 0; padding: 15px; font-size: 12px; line-height: 1.5; }
            h1, h2, h3, h4, h5, h6, strong, b, th { color: #000000 !important; font-weight: bold; }
            p, span, div, td { color: #0f172a !important; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; color: #000000 !important; }
            th, td { border: 1px solid #94a3b8 !important; padding: 6px 8px; font-size: 11px; color: #000000 !important; }
            th { background-color: #f1f5f9 !important; font-weight: bold; }
            .grid { display: flex; flex-direction: row; gap: 16px; }
            .grid > div { flex: 1; }
            .border { border: 1px solid #94a3b8 !important; }
            .border-b-2 { border-bottom: 2px solid #000000 !important; }
            .border-b { border-bottom: 1px solid #cbd5e1 !important; }
            .border-r { border-right: 1px solid #cbd5e1 !important; }
            .border-t { border-top: 1px solid #cbd5e1 !important; }
            .p-3 { padding: 12px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .font-mono { font-family: monospace; }
            .uppercase { text-transform: uppercase; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .bg-slate-50 { background-color: #f8fafc !important; }
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

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-4xl h-[94vh] max-h-[94vh] flex flex-col overflow-hidden border border-white/10 text-white relative">
        {/* Modal Toolbar (hidden in print) */}
        <div className="no-print shrink-0 flex items-center justify-between px-5 py-3.5 bg-[#090d16] text-white border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-indigo-600 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {invoiceTitle} • {invoice.invoiceNumber}
              </h2>
              <p className="text-xs text-slate-400">GST-compliant A4 Print & Clean PDF Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all cursor-pointer min-h-[38px]"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close invoice preview"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-2 sm:p-6 bg-slate-900/60 flex justify-center items-start">
          <div
            id="printable-tax-invoice"
            className="print-container bg-white text-slate-900 w-full max-w-3xl min-h-[297mm] h-auto p-6 sm:p-10 shadow-2xl rounded-sm border border-slate-300 text-[13px] leading-relaxed relative flex flex-col justify-between my-4 mb-12 shrink-0"
          >
            {/* Header Block */}
            <div>
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                <h1 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-slate-950">
                  {invoiceTitle}
                </h1>
                {isBilingual && (
                  <p className="text-xs font-bold text-slate-600 mt-0.5">
                    {isComposition ? 'पुरवठा बिल (BILL OF SUPPLY)' : isUnregistered ? 'बीजक (INVOICE)' : 'कर बीजक (TAX INVOICE)'}
                  </p>
                )}
                {subHeading && (
                  <p className="text-xs font-semibold text-rose-700 mt-0.5 uppercase tracking-wide">
                    {subHeading}
                  </p>
                )}
                {isOverTurnoverThreshold ? (
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-medium border border-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>e-Invoicing (IRN) mandatory above ₹5 Crore turnover. Generate IRN on GST Portal.</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    (Issued under Rule 46 of Central Goods and Services Tax Rules, 2017)
                  </p>
                )}
              </div>

              {/* Two Column Supplier & Invoice Meta Grid */}
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 mb-4 rounded-xs bg-slate-50/50">
                {/* Supplier Info */}
                <div className="border-r border-slate-200 pr-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier (Taxpayer)</p>
                  <h2 className="text-base font-black text-slate-900 mt-0.5">{business.name}</h2>
                  <p className="text-slate-700">{business.address}</p>
                  <p className="text-slate-700">
                    {business.city}, {business.state} - {business.pincode}
                  </p>
                  <div className="mt-2 space-y-0.5 text-xs">
                    <p>
                      <strong className="text-slate-900">GSTIN:</strong>{' '}
                      <span className="font-mono font-bold text-indigo-900">{business.gstin}</span>
                    </p>
                    <p>
                      <strong className="text-slate-900">State Code:</strong> {business.stateCode} ({business.state})
                    </p>
                    <p>
                      <strong className="text-slate-900">Phone:</strong> {business.phone} |{' '}
                      <strong className="text-slate-900">Email:</strong> {business.email}
                    </p>
                    {business.isUdyamRegistered && (
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Udyam MSME: {business.udyamNumber} ({business.enterpriseType})
                      </p>
                    )}
                  </div>
                </div>

                {/* Invoice Meta */}
                <div className="pl-2 flex flex-col justify-between">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-0.5 border-b border-slate-200">
                      <span className="text-slate-600 font-semibold">Invoice No:</span>
                      <span className="font-mono font-black text-slate-950 text-sm">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-200">
                      <span className="text-slate-600 font-semibold">Invoice Date:</span>
                      <span className="font-medium">{formatIndianDate(invoice.invoiceDate)}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-200">
                      <span className="text-slate-600 font-semibold">Payment Due Date:</span>
                      <span className="font-bold text-rose-700">{formatIndianDate(invoice.dueDate)}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-200">
                      <span className="text-slate-600 font-semibold">Place of Supply:</span>
                      <span className="font-semibold">{invoice.placeOfSupply}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600 font-semibold">Reverse Charge Applicable:</span>
                      <span className="font-bold">{invoice.isReverseCharge ? 'YES' : 'NO'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billed To / Shipped To Grid */}
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 mb-4 rounded-xs">
                {/* Billed To */}
                <div className="border-r border-slate-200 pr-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Details of Receiver (Billed To)</p>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{invoice.customerName}</h3>
                  {invoice.customerTradeName && (
                    <p className="text-xs text-slate-600 italic">Trade: {invoice.customerTradeName}</p>
                  )}
                  <p className="text-slate-700 mt-1">{invoice.customerAddress || 'Pune, Maharashtra'}</p>
                  <p className="text-slate-700">
                    State: {invoice.customerState} (Code: {invoice.customerStateCode})
                  </p>
                  <div className="mt-1.5 text-xs space-y-0.5">
                    <p>
                      <strong className="text-slate-900">GSTIN / UIN:</strong>{' '}
                      <span className="font-mono font-bold text-slate-950">
                        {invoice.customerGstin || 'Unregistered Dealer (URP)'}
                      </span>
                    </p>
                    <p>
                      <strong className="text-slate-900">Contact:</strong> {invoice.customerPhone || '-'}
                    </p>
                  </div>
                </div>

                {/* Shipped To */}
                <div className="pl-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Details of Consignee (Shipped To)</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{invoice.customerName}</p>
                  <p className="text-slate-700 text-xs mt-1">
                    Delivery Address: Same as Billing Address ({invoice.customerAddress || 'Pune, Maharashtra'})
                  </p>
                  <p className="text-slate-700 text-xs mt-1">
                    Place of Delivery: {invoice.customerState} ({invoice.customerStateCode})
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-300 rounded-xs overflow-hidden mb-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 w-8 text-center">#</th>
                      <th className="p-2 border-r border-slate-300">Description of Goods</th>
                      <th className="p-2 border-r border-slate-300 w-16 text-center">HSN</th>
                      <th className="p-2 border-r border-slate-300 w-12 text-center">Qty</th>
                      <th className="p-2 border-r border-slate-300 w-12 text-center">Unit</th>
                      <th className="p-2 border-r border-slate-300 w-20 text-right">Rate</th>
                      <th className="p-2 border-r border-slate-300 w-24 text-right">Taxable Val</th>
                      {isRegular && isIntraState && (
                        <>
                          <th className="p-2 border-r border-slate-300 w-16 text-right">CGST</th>
                          <th className="p-2 border-r border-slate-300 w-16 text-right">SGST</th>
                        </>
                      )}
                      {isRegular && !isIntraState && (
                        <th className="p-2 border-r border-slate-300 w-20 text-right">IGST</th>
                      )}
                      <th className="p-2 text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((it, idx) => (
                      <tr key={it.id || idx} className="hover:bg-slate-50/50">
                        <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-300 font-medium text-slate-900">
                          {it.description}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">{it.hsnSac || it.hsn}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-semibold">{it.quantity}</td>
                        <td className="p-2 border-r border-slate-300 text-center text-slate-600">{it.unit || 'PCS'}</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">
                          {formatPaise(it.ratePaise, { showSymbol: false })}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono font-medium">
                          {formatPaise(it.taxablePaise, { showSymbol: false })}
                        </td>

                        {/* GST Breakdown */}
                        {isRegular && isIntraState && (
                          <>
                            <td className="p-2 border-r border-slate-300 text-right font-mono text-[11px]">
                              {formatPaise(it.cgstPaise, { showSymbol: false })}
                              <span className="block text-[10px] text-slate-500">({it.cgstRate}%)</span>
                            </td>
                            <td className="p-2 border-r border-slate-300 text-right font-mono text-[11px]">
                              {formatPaise(it.sgstPaise, { showSymbol: false })}
                              <span className="block text-[10px] text-slate-500">({it.sgstRate}%)</span>
                            </td>
                          </>
                        )}
                        {isRegular && !isIntraState && (
                          <td className="p-2 border-r border-slate-300 text-right font-mono text-[11px]">
                            {formatPaise(it.igstPaise, { showSymbol: false })}
                            <span className="block text-[10px] text-slate-500">({it.igstRate}%)</span>
                          </td>
                        )}

                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          {formatPaise(it.lineTotalPaise, { showSymbol: false })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Totals Sub-table */}
                  <tfoot className="border-t-2 border-slate-400 bg-slate-50 font-semibold text-xs">
                    <tr>
                      <td colSpan={6} className="p-2 text-right border-r border-slate-300">
                        Sub Total (Taxable Value):
                      </td>
                      <td className="p-2 text-right font-mono font-bold border-r border-slate-300">
                        {formatPaise(invoice.taxableTotalPaise, { showSymbol: false })}
                      </td>
                      {isRegular && isIntraState && (
                        <>
                          <td className="p-2 text-right font-mono border-r border-slate-300">
                            {formatPaise(invoice.cgstTotalPaise, { showSymbol: false })}
                          </td>
                          <td className="p-2 text-right font-mono border-r border-slate-300">
                            {formatPaise(invoice.sgstTotalPaise, { showSymbol: false })}
                          </td>
                        </>
                      )}
                      {isRegular && !isIntraState && (
                        <td className="p-2 text-right font-mono border-r border-slate-300">
                          {formatPaise(invoice.igstTotalPaise, { showSymbol: false })}
                        </td>
                      )}
                      <td className="p-2 text-right font-mono font-bold">
                        {formatPaise(
                          invoice.taxableTotalPaise +
                            (invoice.cgstTotalPaise || 0) +
                            (invoice.sgstTotalPaise || 0) +
                            (invoice.igstTotalPaise || 0),
                          { showSymbol: false }
                        )}
                      </td>
                    </tr>
                    {invoice.roundOffPaise !== 0 && (
                      <tr>
                        <td colSpan={isRegular && isIntraState ? 9 : isRegular ? 8 : 7} className="p-1.5 text-right border-r border-slate-300 text-slate-600">
                          Round Off:
                        </td>
                        <td className="p-1.5 text-right font-mono text-slate-700">
                          {formatPaise(invoice.roundOffPaise, { showSymbol: false })}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-900 text-white font-black text-sm">
                      <td colSpan={isRegular && isIntraState ? 9 : isRegular ? 8 : 7} className="p-2.5 text-right uppercase tracking-wider">
                        Grand Total:
                      </td>
                      <td className="p-2.5 text-right font-mono text-base">
                        {formatPaise(invoice.grandTotalPaise)}
                      </td>
                    </tr>
                    {invoice.amountPaidPaise > 0 && (
                      <>
                        <tr className="bg-emerald-50 text-emerald-900 font-bold border-t border-emerald-200">
                          <td colSpan={isRegular && isIntraState ? 9 : isRegular ? 8 : 7} className="p-2 text-right">
                            Less Amount Paid / Advance Settled:
                          </td>
                          <td className="p-2 text-right font-mono text-emerald-700">
                            - {formatPaise(invoice.amountPaidPaise)}
                          </td>
                        </tr>
                        <tr className="bg-rose-50 text-rose-950 font-black border-t border-rose-200">
                          <td colSpan={isRegular && isIntraState ? 9 : isRegular ? 8 : 7} className="p-2 text-right uppercase">
                            Net Balance Payable:
                          </td>
                          <td className="p-2 text-right font-mono text-rose-700">
                            {formatPaise(invoice.balanceDuePaise)}
                          </td>
                        </tr>
                      </>
                    )}
                  </tfoot>
                </table>
              </div>

              {/* Total in Words */}
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-xs mb-4">
                <span className="text-xs font-bold text-slate-600 uppercase">Amount in Words: </span>
                <span className="text-xs font-bold text-slate-950 font-serif italic">
                  {numberToWordsIndian(invoice.grandTotalPaise)}
                </span>
              </div>

              {/* Bank Details & UPI QR Code Block */}
              <div className="grid grid-cols-3 gap-4 border border-slate-300 p-3 rounded-xs mb-4">
                {/* Bank Account */}
                <div className="col-span-2 border-r border-slate-200 pr-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Bank Transfer Settlement Details
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-800">
                    <p>
                      <strong>Bank:</strong> {business.bankName}
                    </p>
                    <p>
                      <strong>A/C No:</strong> <span className="font-mono font-bold">{business.accountNumber}</span>
                    </p>
                    <p>
                      <strong>IFSC:</strong> <span className="font-mono font-bold">{business.ifscCode}</span>
                    </p>
                    <p>
                      <strong>Branch:</strong> {business.branch}
                    </p>
                    <p className="col-span-2 mt-1">
                      <strong>UPI ID:</strong>{' '}
                      <span className="font-mono font-bold text-indigo-900">{business.upiId}</span>
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    * Please mention invoice number <strong>{invoice.invoiceNumber}</strong> in transfer remarks.
                  </p>
                </div>

                {/* Live UPI QR Code */}
                <div className="flex flex-col items-center justify-center text-center pl-2">
                  <div className="p-1.5 bg-white border border-slate-300 rounded shadow-xs">
                    <QRCodeSVG value={upiUrl} size={88} level="M" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-800 mt-1 uppercase tracking-tight">
                    Scan with any UPI App
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">GPay / PhonePe / Paytm</p>
                </div>
              </div>
            </div>

            {/* Footer & Signature Line */}
            <div className="pt-4 border-t border-slate-300">
              <div className="flex justify-between items-end">
                <div className="text-[11px] text-slate-600 space-y-0.5 max-w-sm">
                  <p className="font-bold text-slate-800 uppercase">Terms & Conditions:</p>
                  <p>1. Goods once sold are subject to standard manufacturer warranty terms.</p>
                  <p>2. Payment due strictly within 30 days from date of supply.</p>
                  <p>3. Subject to Pune jurisdiction.</p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 mb-8">
                    For {business.name}
                  </p>
                  <div className="border-t border-slate-800 pt-1 text-xs">
                    <p className="font-bold text-slate-950">{business.authorizedSignatory}</p>
                    <p className="text-slate-600 text-[11px]">{business.designation} / Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

