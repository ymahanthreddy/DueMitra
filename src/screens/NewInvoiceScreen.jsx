import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Printer,
  Save,
  Send,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Mail,
  Landmark,
  Truck,
  FileText,
  CreditCard,
  Zap,
  Banknote,
  Calendar,
  Camera,
  UploadCloud,
  FileSearch,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { validateGstin, calculateInvoiceTotals, STATE_CODES } from '../utils/gst';
import { formatPaise, paiseToRupees, rupeesToPaise } from '../utils/money';
import { addDays } from '../utils/date';
import { PrintInvoiceModal } from '../components/PrintInvoiceModal';

export function NewInvoiceScreen() {
  const navigate = useNavigate();
  const { customers, business, config, demoDate, addInvoice, updateCustomer } = useApp();

  // Advanced Commercial & Dispatch Meta
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [eWayBillNumber, setEWayBillNumber] = useState('');
  const [deliveryChallan, setDeliveryChallan] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  // Initial Advance / Immediate Payment
  const [hasAdvancePayment, setHasAdvancePayment] = useState(false);
  const [advanceMode, setAdvanceMode] = useState('bank_transfer');
  const [advanceAmountRupees, setAdvanceAmountRupees] = useState('');
  const [advanceRefNumber, setAdvanceRefNumber] = useState('');
  const [advanceBankName, setAdvanceBankName] = useState('HDFC Bank');
  const [advanceNotes, setAdvanceNotes] = useState('');

  // Selected customer or new customer mode
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(customers.length === 0);

  // Quick GSTIN attach state for selected customer without GSTIN
  const [quickGstin, setQuickGstin] = useState('');
  const [quickGstinFeedback, setQuickGstinFeedback] = useState(null);

  // Sync selected customer if business workspace changes
  useEffect(() => {
    if (customers.length === 0) {
      setIsAddingNewCustomer(true);
      setSelectedCustomerId('');
    } else if (!customers.some((c) => c.id === selectedCustomerId)) {
      setSelectedCustomerId(customers[0]?.id || '');
      setIsAddingNewCustomer(false);
    }
  }, [customers, selectedCustomerId]);

  // New customer form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustCreditDays, setNewCustCreditDays] = useState(30);
  const [gstinValidation, setGstinValidation] = useState({ valid: true });

  // Invoice parameters
  const [invoiceDate, setInvoiceDate] = useState(demoDate || '2026-10-23');

  // AI OCR Invoice Scanner state
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrValidation, setOcrValidation] = useState(null);
  const [ocrFilename, setOcrFilename] = useState('');
  const [aiUnsureFieldNames, setAiUnsureFieldNames] = useState([]);
  const [showOcrWalkthrough, setShowOcrWalkthrough] = useState(false);

  const handleOcrFileSelected = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5 MB limit. Please upload a JPG, PNG, or PDF up to 5 MB.');
      return;
    }

    setIsScanningOcr(true);
    setOcrValidation(null);
    setOcrFilename(file.name);

    try {
      const formData = new FormData();
      formData.append('invoiceFile', file);

      const resp = await fetch('/api/ocr-invoice', {
        method: 'POST',
        body: formData,
      });

      const data = await resp.json();
      if (data.success && data.invoice) {
        const inv = data.invoice;
        setOcrValidation(data.validation || {});
        setAiUnsureFieldNames(data.validation?.aiUnsureFields || []);

        if (inv.invoiceDate) setInvoiceDate(inv.invoiceDate);
        if (inv.dueDate) setDueDate(inv.dueDate);

        const matchedCust = customers.find(
          (c) =>
            (c.gstin && inv.customerGstin && c.gstin.toUpperCase() === inv.customerGstin.toUpperCase()) ||
            (c.name && inv.customerName && c.name.toLowerCase().includes(inv.customerName.toLowerCase()))
        );

        if (matchedCust) {
          setSelectedCustomerId(matchedCust.id);
          setIsAddingNewCustomer(false);
        } else if (inv.customerName) {
          setIsAddingNewCustomer(true);
          setNewCustName(inv.customerName);
          setNewCustGstin(inv.customerGstin || '');
          setNewCustPhone(inv.customerPhone || '');
          setNewCustAddress(inv.customerAddress || '');
          if (inv.customerStateCode) {
            setNewCustState(inv.customerState || 'Maharashtra');
            setNewCustStateCode(inv.customerStateCode);
          }
        }

        if (inv.items && inv.items.length > 0) {
          const mappedItems = inv.items.map((it, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            description: it.description || 'Accessory Item',
            hsnSac: it.hsnSac || '85044090',
            quantity: Number(it.quantity) || 1,
            unit: it.unit || 'pcs',
            rateRupees: Number(it.rateRupees) || 0,
            discountRupees: Number(it.discountRupees) || 0,
            gstRate: Number(it.gstRate) || 18,
            unsure: Boolean(it.unsure),
          }));
          setItems(mappedItems);
        }
      } else {
        alert(data.error || 'Failed to parse invoice file via OCR.');
      }
    } catch (err) {
      console.warn('OCR error:', err);
      alert(`OCR scan failed: ${err.message}`);
    } finally {
      setIsScanningOcr(false);
    }
  };

  // Line items state
  const [items, setItems] = useState([
    {
      id: 'LINE-1',
      description: '65W GaN Dual-Port Fast Charger (Type-C + USB-A)',
      hsnSac: '8504',
      quantity: 10,
      unit: 'PCS',
      rateRupees: 650,
      discountRupees: 0,
      gstRate: 18,
    },
    {
      id: 'LINE-2',
      description: 'Matte Frosted Anti-Drop Shockproof Phone Case',
      hsnSac: '3926',
      quantity: 25,
      unit: 'PCS',
      rateRupees: 160,
      discountRupees: 0,
      gstRate: 18,
    },
  ]);

  const [previewInvoice, setPreviewInvoice] = useState(null);

  // Determine current active customer info
  const activeCustomer = useMemo(() => {
    if (isAddingNewCustomer) {
      let stateCode = '27';
      let stateName = 'Maharashtra';
      if (newCustGstin && newCustGstin.length >= 2) {
        const code = newCustGstin.substring(0, 2);
        if (STATE_CODES[code]) {
          stateCode = code;
          stateName = STATE_CODES[code];
        }
      }
      return {
        id: 'NEW-CUST',
        name: newCustName || 'New Trade Customer',
        tradeName: newCustName,
        gstin: newCustGstin,
        phone: newCustPhone,
        address: newCustAddress || 'Pune, Maharashtra',
        state: stateName,
        stateCode,
        creditDays: Number(newCustCreditDays) || 30,
      };
    }

    return customers.find((c) => c.id === selectedCustomerId) || customers[0] || {
      id: 'CUST-NEW',
      name: newCustName || 'Customer / Buyer',
      tradeName: newCustName || 'Customer / Buyer',
      gstin: newCustGstin || '',
      phone: newCustPhone || '',
      address: newCustAddress || 'Pune, Maharashtra',
      state: business.state || 'Maharashtra',
      stateCode: business.stateCode || '27',
      creditDays: Number(newCustCreditDays) || 30,
    };
  }, [
    isAddingNewCustomer,
    selectedCustomerId,
    customers,
    newCustName,
    newCustGstin,
    newCustPhone,
    newCustAddress,
    newCustCreditDays,
  ]);

  // Handle GSTIN input for new customer
  const handleGstinChange = (e) => {
    const val = e.target.value.toUpperCase();
    setNewCustGstin(val);
    if (!val) {
      setGstinValidation({ valid: true });
    } else {
      const res = validateGstin(val);
      setGstinValidation(res);
    }
  };

  const handleQuickGstinChange = (val) => {
    const clean = val.toUpperCase().trim();
    setQuickGstin(clean);
    if (!clean) {
      setQuickGstinFeedback(null);
    } else {
      setQuickGstinFeedback(validateGstin(clean));
    }
  };

  const handleAttachQuickGstin = () => {
    if (!quickGstin) {
      alert('Please enter a 15-character GSTIN');
      return;
    }
    const res = validateGstin(quickGstin);
    if (!res.valid) {
      alert(res.error);
      return;
    }
    if (activeCustomer?.id && updateCustomer) {
      updateCustomer(activeCustomer.id, {
        gstin: res.gstin,
        state: res.stateName,
        stateCode: res.stateCode,
      });
      setQuickGstin('');
      setQuickGstinFeedback(null);
    }
  };

  // Due date automatically calculated from invoiceDate + creditDays
  const dueDate = useMemo(() => {
    const credit = activeCustomer?.creditDays || 30;
    return addDays(invoiceDate, credit);
  }, [invoiceDate, activeCustomer]);

  // Live Tax and Total calculations
  const calculatedTotals = useMemo(() => {
    const preparedItems = items.map((it) => ({
      ...it,
      ratePaise: rupeesToPaise(it.rateRupees),
      discountPaise: rupeesToPaise(it.discountRupees),
    }));

    return calculateInvoiceTotals(
      preparedItems,
      business.stateCode,
      activeCustomer?.stateCode || '27'
    );
  }, [items, business.stateCode, activeCustomer]);

  const isIntraState = (activeCustomer?.stateCode || '27') === business.stateCode;

  // Add Item Line
  const handleAddItem = (preset) => {
    const newItem = preset || {
      id: `LINE-${Date.now()}`,
      description: '',
      hsnSac: '8504',
      quantity: 1,
      unit: 'PCS',
      rateRupees: 500,
      discountRupees: 0,
      gstRate: 18,
    };
    setItems([...items, newItem]);
  };

  // Remove Line Item
  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item field
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Build Invoice Payload
  const buildPayload = (status = 'sent') => {
    const advancePaise = Math.round((parseFloat(advanceAmountRupees) || 0) * 100);

    return {
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      customerTradeName: activeCustomer.tradeName || activeCustomer.name,
      customerGstin: activeCustomer.gstin,
      customerState: activeCustomer.state,
      customerStateCode: activeCustomer.stateCode,
      customerAddress: activeCustomer.address,
      customerPhone: activeCustomer.phone,
      customerEmail: activeCustomer.email || '',
      invoiceDate,
      dueDate,
      status,
      poNumber: poNumber.trim(),
      poDate: poDate || null,
      eWayBillNumber: eWayBillNumber.trim(),
      deliveryChallan: deliveryChallan.trim(),
      transporterName: transporterName.trim(),
      vehicleNumber: vehicleNumber.trim(),
      initialPayment:
        hasAdvancePayment && advancePaise > 0
          ? {
              amountPaise: advancePaise,
              paymentMode: advanceMode,
              modeLabel:
                {
                  bank_transfer: 'Bank Transfer (NEFT/RTGS)',
                  cheque: 'Cheque Payment',
                  demand_draft: 'Demand Draft (DD)',
                  upi: 'Bharat UPI Transfer',
                  cash: 'Cash Receipt',
                }[advanceMode] || 'Bank Settlement',
              referenceNumber: advanceRefNumber.trim() || 'N/A',
              bankName: advanceBankName.trim() || '',
              notes: advanceNotes.trim() || 'Advance settlement recorded at creation',
            }
          : null,
      items: items.map((it) => ({
        ...it,
        ratePaise: rupeesToPaise(it.rateRupees),
        discountPaise: rupeesToPaise(it.discountRupees),
      })),
    };
  };

  // Save as Draft
  const handleSaveDraft = () => {
    const payload = buildPayload('draft');
    const created = addInvoice(payload);
    navigate(`/invoices/${created.id}`);
  };

  // Generate & Send
  const handleSendInvoice = () => {
    const payload = buildPayload('sent');
    const created = addInvoice(payload);
    navigate(`/invoices/${created.id}`);
  };

  // Preview Print-ready Tax Invoice
  const handlePreview = () => {
    const payload = buildPayload('sent');
    const mockInvoice = {
      ...payload,
      id: 'PREVIEW-INV',
      invoiceNumber: 'KVC/26-27/DRAFT',
      ...calculatedTotals,
      placeOfSupply: `${activeCustomer.state} (${activeCustomer.stateCode})`,
      isReverseCharge: false,
      token: 'preview_tok',
      timeline: [],
    };
    setPreviewInvoice(mockInvoice);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create Tax Invoice
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Issue GST-compliant B2B invoice with live CGST/SGST/IGST tax calculation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePreview}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-semibold rounded-xl cursor-pointer min-h-[44px] transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Preview Invoice</span>
          </button>
          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#090d16] border border-slate-700 hover:border-slate-600 text-slate-300 text-sm font-semibold rounded-xl cursor-pointer min-h-[44px] transition-all"
          >
            <Save className="w-4 h-4 text-slate-400" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={handleSendInvoice}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/20 cursor-pointer min-h-[44px] transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Generate & Send</span>
          </button>
        </div>
      </div>

      {/* Automated Email Notification Advisory */}
      <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-200">
        <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-semibold mb-0.5">Automated Customer Dispatch Notice:</strong>
          <span>
            Creating this invoice or making any change will automatically trigger an email containing the complete GST tax invoice and digital payment link to the registered email address of this consumer ({activeCustomer.email || 'active buyer'}).
          </span>
        </div>
      </div>

      {/* AI Invoice Photo & PDF Scanner (Gemini Vision OCR) Card */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-[#0f172a] to-cyan-950/30 border border-indigo-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Scan Paper Invoice / Upload Photo or PDF (AI OCR)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase font-mono">
                  Gemini Vision
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automatically extracts customer, GSTIN, dates, item rows & rates, and recalculates statutory GST
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowOcrWalkthrough(true)}
            className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 underline cursor-pointer self-start sm:self-auto"
          >
            How to test this &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select or Take a Photo of Paper Invoice (JPG, PNG, or PDF up to 5 MB):
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer transition-all">
                <UploadCloud className="w-4 h-4" />
                <span>{isScanningOcr ? 'Scanning with AI...' : 'Choose Invoice Photo / PDF'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  disabled={isScanningOcr}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleOcrFileSelected(file);
                  }}
                />
              </label>

              {ocrFilename && (
                <span className="text-xs text-slate-300 font-mono truncate max-w-xs">
                  📄 {ocrFilename}
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#090d16] p-3 rounded-xl border border-white/5 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">🔒 Privacy & Compliance Assurance:</span>
            <p>• API keys are secured strictly on the backend daemon and never exposed in the browser.</p>
            <p>• Uploaded images are parsed in-memory and discarded immediately after OCR analysis.</p>
            <p>• Invoices are never auto-saved without your explicit review and verification.</p>
          </div>
        </div>

        {/* OCR Validation & Discrepancy Warnings */}
        {ocrValidation && (
          <div className="pt-3 border-t border-white/10 space-y-2">
            {ocrValidation.gstMismatch ? (
              <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block font-bold">⚠️ GST Recalculation Discrepancy Detected:</strong>
                  <span>
                    Extracted items recalculate to ₹{ocrValidation.recalculatedTotalTax} GST, but printed invoice shows ₹{ocrValidation.printedTotalTax}. Please verify the tax rates and item values below.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ GST Math Verified: Recalculated tax precisely matches printed invoice totals.</span>
              </div>
            )}

            {!ocrValidation.checkDigitValid && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-300 block font-bold">⚠️ Invalid GSTIN Check Digit:</strong>
                  <span>
                    The extracted customer GST number does not satisfy the official Indian Modulo-36 GST checksum. Please confirm the number.
                  </span>
                </div>
              </div>
            )}

            {aiUnsureFieldNames.length > 0 && (
              <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-[11px] text-indigo-300">
                <strong>Notice: </strong>
                AI was unsure of field(s): <span className="font-mono text-white">{aiUnsureFieldNames.join(', ')}</span>. Please review them before saving.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Selection Card */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            1. Customer / Bill Receiver
          </h2>
          <button
            onClick={() => setIsAddingNewCustomer(!isAddingNewCustomer)}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
          >
            {isAddingNewCustomer ? '← Select Existing Customer' : '+ Add New Customer / Dealer'}
          </button>
        </div>

        {!isAddingNewCustomer ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Registered Customer
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.stateCode !== '27' ? `[Inter-State: ${c.state}]` : `[Pune, MH]`} ({c.creditDays}d terms)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Place of Supply
              </label>
              <div className="px-3.5 py-2.5 bg-[#090d16]/80 rounded-xl border border-slate-800 text-sm font-semibold text-slate-200">
                {activeCustomer.state} ({activeCustomer.stateCode})
                <span className="block text-[11px] text-indigo-400 font-normal mt-0.5">
                  {isIntraState ? 'Intra-State: CGST (9%) + SGST (9%) apply' : 'Inter-State: IGST (18%) applies'}
                </span>
              </div>
            </div>

            {/* Dedicated Customer GST Number Space */}
            <div className="sm:col-span-2 pt-1">
              {activeCustomer.gstin ? (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-300">Registered B2B Customer GSTIN:</span>{' '}
                      <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">{activeCustomer.gstin}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">Eligible for Full Tax Invoice & ITC</span>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>Customer GST Number Not Added (Unregistered / B2C)</span>
                      </div>
                      <p className="text-[11px] text-amber-200/70 mt-0.5">
                        Add customer GSTIN below to upgrade this bill to a B2B Tax Invoice with input tax credit.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={15}
                        value={quickGstin}
                        onChange={(e) => handleQuickGstinChange(e.target.value)}
                        placeholder="e.g. 27AAPCS1001A1ZY"
                        className="w-44 px-3 py-1.5 bg-[#090d16] border border-amber-500/40 rounded-lg text-xs font-mono uppercase text-white focus:outline-hidden focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={handleAttachQuickGstin}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                      >
                        + Add GSTIN
                      </button>
                    </div>
                  </div>

                  {quickGstinFeedback && (
                    <div className="text-[11px] pt-0.5">
                      {quickGstinFeedback.valid ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Valid GSTIN: {quickGstinFeedback.stateName} ({quickGstinFeedback.stateCode})
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {quickGstinFeedback.error}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-[#090d16]/80 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Customer / Firm Name *
              </label>
              <input
                type="text"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="e.g. Pune Gadget Care"
                className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GSTIN (15 Alphanumeric)
              </label>
              <input
                type="text"
                value={newCustGstin}
                onChange={handleGstinChange}
                placeholder="e.g. 27AAPCS1001A1ZY"
                maxLength={15}
                className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-sm font-mono uppercase text-white focus:outline-hidden focus:border-indigo-500"
              />
              {newCustGstin && (
                <div className="mt-1 text-[11px]">
                  {gstinValidation.valid ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Valid: {gstinValidation.stateName} ({gstinValidation.stateCode})
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {gstinValidation.error}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Credit Days
              </label>
              <input
                type="number"
                value={newCustCreditDays}
                onChange={(e) => setNewCustCreditDays(e.target.value)}
                className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Invoice Dates Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/[0.08]">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Invoice Date (IST)
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Payment Due Date ({activeCustomer.creditDays} Days Credit)
            </label>
            <div className="px-3.5 py-2.5 bg-[#090d16] rounded-xl border border-slate-700/80 text-sm font-bold text-slate-200 font-mono">
              {dueDate}
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Card */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            2. Mobile Accessories Line Items
          </h2>

          {/* Quick presets for common mobile accessories */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">Quick Add:</span>
            <button
              onClick={() =>
                handleAddItem({
                  id: `LINE-${Date.now()}`,
                  description: '9H Full Glue HD Tempered Glass Screen Protector (Pack of 10)',
                  hsnSac: '7007',
                  quantity: 15,
                  unit: 'PKT',
                  rateRupees: 750,
                  discountRupees: 0,
                  gstRate: 18,
                })
              }
              className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg text-slate-300 text-xs font-medium cursor-pointer transition-colors"
            >
              + Tempered Glass
            </button>
            <button
              onClick={() =>
                handleAddItem({
                  id: `LINE-${Date.now()}`,
                  description: 'Braided 60W Type-C Fast Charging Cable 1.5m',
                  hsnSac: '8544',
                  quantity: 30,
                  unit: 'PCS',
                  rateRupees: 120,
                  discountRupees: 0,
                  gstRate: 18,
                })
              }
              className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg text-slate-300 text-xs font-medium cursor-pointer transition-colors"
            >
              + Type-C Cable
            </button>
            <button
              onClick={() =>
                handleAddItem({
                  id: `LINE-${Date.now()}`,
                  description: 'True Wireless Stereo Earbuds with ANC',
                  hsnSac: '8518',
                  quantity: 8,
                  unit: 'SET',
                  rateRupees: 1400,
                  discountRupees: 0,
                  gstRate: 18,
                })
              }
              className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg text-slate-300 text-xs font-medium cursor-pointer transition-colors"
            >
              + TWS Earbuds
            </button>
          </div>
        </div>

        {/* Responsive Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-slate-400 font-semibold border-b border-white/10">
                <th className="p-3">Description</th>
                <th className="p-3 w-20 text-center">HSN</th>
                <th className="p-3 w-16 text-center">Qty</th>
                <th className="p-3 w-16 text-center">Unit</th>
                <th className="p-3 w-24 text-right">Rate (₹)</th>
                <th className="p-3 w-20 text-right">Disc (₹)</th>
                <th className="p-3 w-24 text-right">GST Rate</th>
                <th className="p-3 w-28 text-right">Taxable</th>
                <th className="p-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {items.map((it, idx) => (
                <tr key={it.id || idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-2">
                    <input
                      type="text"
                      value={it.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Product Description"
                      className="w-full px-2.5 py-1.5 bg-[#090d16] border border-slate-700/80 rounded-lg font-medium text-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={it.hsnSac}
                      onChange={(e) => handleItemChange(idx, 'hsnSac', e.target.value)}
                      placeholder="HSN"
                      className="w-full px-1.5 py-1.5 bg-[#090d16] border border-slate-700/80 rounded-lg text-center font-mono text-slate-300 focus:outline-hidden focus:border-indigo-500 text-xs"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full px-1.5 py-1.5 bg-[#090d16] border border-slate-700/80 rounded-lg text-center font-bold text-white focus:outline-hidden focus:border-indigo-500 text-xs"
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={it.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-1 py-1.5 bg-[#090d16] border border-slate-700/80 rounded-lg text-center text-slate-300 text-xs focus:outline-hidden"
                    >
                      <option value="PCS">PCS</option>
                      <option value="PKT">PKT</option>
                      <option value="SET">SET</option>
                      <option value="BOX">BOX</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      value={it.rateRupees}
                      onChange={(e) => handleItemChange(idx, 'rateRupees', e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#090d16] border border-slate-700/80 rounded-lg text-right font-mono text-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      value={it.discountRupees}
                      onChange={(e) => handleItemChange(idx, 'discountRupees', e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#090d16] border border-slate-700/80 rounded-lg text-right font-mono text-slate-400 focus:outline-hidden focus:border-indigo-500 text-xs"
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={it.gstRate}
                      onChange={(e) => handleItemChange(idx, 'gstRate', Number(e.target.value))}
                      className="w-full px-1 py-1.5 bg-[#090d16] border border-slate-700/80 rounded-lg text-right font-semibold text-indigo-400 text-xs focus:outline-hidden"
                    >
                      {config.gstRates.map((r) => (
                        <option key={r.rate} value={r.rate}>
                          {r.rate}%
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 text-right font-mono font-bold text-slate-200 text-xs">
                    ₹{((Number(it.quantity) || 0) * (Number(it.rateRupees) || 0) - (Number(it.discountRupees) || 0)).toLocaleString('en-IN')}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-30 cursor-pointer transition-colors"
                      title="Remove line item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => handleAddItem()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Line Item</span>
        </button>

        {/* Live Calculation Summary Breakdown */}
        <div className="border-t border-white/10 pt-4 flex flex-col items-end">
          <div className="w-full max-w-sm space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Total Taxable Value:</span>
              <span className="font-mono font-bold text-slate-200">
                {formatPaise(calculatedTotals.taxableTotalPaise)}
              </span>
            </div>

            {isIntraState ? (
              <>
                <div className="flex justify-between py-0.5 text-slate-400">
                  <span>Central GST (CGST):</span>
                  <span className="font-mono font-medium text-slate-300">
                    {formatPaise(calculatedTotals.cgstTotalPaise)}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 text-slate-400">
                  <span>State GST (SGST):</span>
                  <span className="font-mono font-medium text-slate-300">
                    {formatPaise(calculatedTotals.sgstTotalPaise)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between py-0.5 text-emerald-400 font-semibold">
                <span>Integrated GST (IGST - Inter-State):</span>
                <span className="font-mono font-bold">
                  {formatPaise(calculatedTotals.igstTotalPaise)}
                </span>
              </div>
            )}

            {calculatedTotals.roundOffPaise !== 0 && (
              <div className="flex justify-between py-0.5 text-slate-500">
                <span>Round Off:</span>
                <span className="font-mono">
                  {formatPaise(calculatedTotals.roundOffPaise)}
                </span>
              </div>
            )}

            <div className="flex justify-between py-3 border-t border-white/15 text-sm font-black text-white">
              <span className="uppercase tracking-wider">Grand Total:</span>
              <span className="font-mono text-base text-emerald-400">
                {formatPaise(calculatedTotals.grandTotalPaise)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Advanced Commercial Terms & Initial Settlement Card */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          3. Advanced Commercial Settlement & Dispatch Details (Optional)
        </h2>

        {/* PO & Dispatch Transport Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Buyer Purchase Order (PO) Number
            </label>
            <input
              type="text"
              placeholder="e.g. PO/2026/089"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="w-full px-3 py-2 bg-[#090d16] border border-slate-700/80 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              E-Way Bill Number (12 Digits)
            </label>
            <input
              type="text"
              placeholder="e.g. 241088492019"
              value={eWayBillNumber}
              onChange={(e) => setEWayBillNumber(e.target.value)}
              className="w-full px-3 py-2 bg-[#090d16] border border-slate-700/80 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Delivery Challan / LR No
            </label>
            <input
              type="text"
              placeholder="e.g. DC-9921"
              value={deliveryChallan}
              onChange={(e) => setDeliveryChallan(e.target.value)}
              className="w-full px-3 py-2 bg-[#090d16] border border-slate-700/80 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Advance Payment Settlement Accordion */}
        <div className="pt-3 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasAdvancePayment}
                onChange={(e) => {
                  setHasAdvancePayment(e.target.checked);
                  if (e.target.checked && !advanceAmountRupees) {
                    setAdvanceAmountRupees((calculatedTotals.grandTotalPaise / 200).toFixed(0)); // 50% default
                    setAdvanceRefNumber(`UTR${Date.now().toString().slice(-8)}`);
                  }
                }}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-900"
              />
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                <span>Record Initial Settlement / Advance Payment Received Today</span>
              </span>
            </label>
            {hasAdvancePayment && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Partially or Fully Paid on Issue
              </span>
            )}
          </div>

          {hasAdvancePayment && (
            <div className="mt-3.5 p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-4">
              {/* Payment Mode Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Payment Mode:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'bank_transfer', label: 'Bank Transfer (NEFT/RTGS)' },
                    { id: 'cheque', label: 'Cheque Payment' },
                    { id: 'demand_draft', label: 'Demand Draft (DD)' },
                    { id: 'upi', label: 'Bharat UPI' },
                    { id: 'cash', label: 'Cash Receipt' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setAdvanceMode(m.id)}
                      className={`p-2 rounded-lg border text-xs font-semibold text-center cursor-pointer transition-all ${
                        advanceMode === m.id
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount & Reference Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Advance Amount Received (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 50000"
                    value={advanceAmountRupees}
                    onChange={(e) => setAdvanceAmountRupees(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-xs font-mono font-bold text-emerald-400 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Reference / UTR / Cheque / DD No *
                  </label>
                  <input
                    type="text"
                    placeholder={
                      advanceMode === 'bank_transfer'
                        ? 'e.g. HDFCN261024'
                        : advanceMode === 'cheque'
                        ? 'e.g. 482910'
                        : advanceMode === 'demand_draft'
                        ? 'e.g. DD-847291'
                        : 'e.g. UPI Ref / Cash Voucher'
                    }
                    value={advanceRefNumber}
                    onChange={(e) => setAdvanceRefNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-xs font-mono uppercase text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Remitting Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                    value={advanceBankName}
                    onChange={(e) => setAdvanceBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Settlement Preview */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Net Credit Status: </span>
                  <span className="font-bold text-emerald-400">
                    {parseFloat(advanceAmountRupees) >= calculatedTotals.grandTotalPaise / 100
                      ? 'Fully Cleared on Creation (Paid)'
                      : `Partially Paid (${formatPaise(
                          Math.round((parseFloat(advanceAmountRupees) || 0) * 100)
                        )} Paid)`}
                  </span>
                </div>
                <div className="font-mono text-rose-400 font-bold">
                  Remaining Due: {formatPaise(
                    Math.max(
                      0,
                      calculatedTotals.grandTotalPaise -
                        Math.round((parseFloat(advanceAmountRupees) || 0) * 100)
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tax Invoice Preview Modal */}
      {previewInvoice && (
        <PrintInvoiceModal
          invoice={previewInvoice}
          business={business}
          onClose={() => setPreviewInvoice(null)}
        />
      )}

      {/* AI Invoice OCR Testing Walkthrough Modal */}
      {showOcrWalkthrough && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">How to Test AI Invoice OCR</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOcrWalkthrough(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="flex gap-3 p-3 bg-[#090d16] rounded-xl border border-white/5">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-white block font-semibold mb-0.5">Print or Preview Any Invoice:</strong>
                  <span>Go to <strong className="text-slate-200">Invoices</strong> in the left sidebar, click the printer icon or &quot;Preview Invoice&quot; on any invoice to display a clean Tax Invoice on your screen.</span>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-[#090d16] rounded-xl border border-white/5">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-white block font-semibold mb-0.5">Take a Photo or Screenshot:</strong>
                  <span>Photograph the printed invoice with your mobile camera or take a desktop screenshot (PNG/JPG/PDF).</span>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-[#090d16] rounded-xl border border-white/5">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-white block font-semibold mb-0.5">Upload and Watch AI OCR Work:</strong>
                  <span>Click <strong className="text-indigo-300">&quot;Choose Invoice Photo / PDF&quot;</strong> above. The backend daemon parses the image in-memory, recalculates statutory GST, checks the check digit, flags any unsure numbers, and pre-populates your draft invoice without auto-saving.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowOcrWalkthrough(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Got It, Let&apos;s Test!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
