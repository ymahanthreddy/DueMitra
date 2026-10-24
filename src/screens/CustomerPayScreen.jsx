import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  CreditCard,
  MessageSquareWarning,
  FileCheck,
  Building,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise, numberToWordsIndian } from '../utils/money';
import { formatIndianDate } from '../utils/date';

const payI18n = {
  en: {
    portalTitle: 'Payment Portal',
    portalSub: 'B2B Commercial Settlement Desk',
    billedTo: 'Billed To',
    invoiceNo: 'Invoice No',
    due: 'Due',
    amountOwed: 'Amount Owed',
    tabPay: 'Pay Now (UPI / Bank)',
    tabAlreadyPaid: "I've Already Paid",
    tabDispute: "Something's Wrong",
    scanUpi: 'Scan via Any UPI App',
    scanSub: 'PhonePe, Google Pay, Paytm, or BHIM • 0% Convenience Fee',
    bankTitle: 'Direct NEFT / RTGS / IMPS Bank Transfer',
    bankAcc: 'Account Name',
    bankNum: 'Account Number',
    bankIfsc: 'IFSC Code',
    simUpiBtn: '⚡ Simulate Customer Instant UPI Payment',
    utrLabel: 'Bank UTR / Transaction Reference Number',
    utrPlaceholder: 'e.g. 16-digit UTR or UPI Transaction ID',
    submitPaidBtn: 'Submit Payment Confirmation',
    issueLabel: 'Describe Issue / Query (Damaged goods, price difference, etc.)',
    submitDisputeBtn: 'Submit Query & Pause Escalation',
  },
  hi: {
    portalTitle: 'भुगतान पोर्टल (Payment Portal)',
    portalSub: 'B2B व्यावसायिक निपटान डेस्क',
    billedTo: 'बिल प्राप्तकर्ता',
    invoiceNo: 'बिल क्रमांक',
    due: 'देय तारीख',
    amountOwed: 'बकाया राशि',
    tabPay: 'अभी भुगतान करें (UPI / बैंक)',
    tabAlreadyPaid: 'मैं पहले ही भुगतान कर चुका हूँ',
    tabDispute: 'बिल में समस्या है / शिकायत',
    scanUpi: 'किसी भी UPI ऐप से स्कैन करके भुगतान करें',
    scanSub: 'PhonePe, Google Pay, Paytm या BHIM • 0% अतिरिक्त शुल्क',
    bankTitle: 'सीधा बैंक ट्रांसफर (NEFT / RTGS / IMPS)',
    bankAcc: 'खाता धारक का नाम',
    bankNum: 'खाता संख्या',
    bankIfsc: 'IFSC कोड',
    simUpiBtn: '⚡ त्वरित UPI भुगतान सिमुलेटर',
    utrLabel: 'बैंक UTR / ट्रांजैक्शन संदर्भ संख्या',
    utrPlaceholder: 'उदा. 16 अंकों का UTR या UPI संदर्भ क्रमांक',
    submitPaidBtn: 'भुगतान पुष्टि जमा करें',
    issueLabel: 'समस्या का विवरण दें (क्षतिग्रस्त माल, दर में अंतर आदि)',
    submitDisputeBtn: 'शिकायत दर्ज करें व स्मरण पत्र रोकें',
  },
  mr: {
    portalTitle: 'पेमेंट पोर्टल (Payment Portal)',
    portalSub: 'B2B व्यापारी देयक निपटारा कक्ष',
    billedTo: 'खरेदीदार (Billed To)',
    invoiceNo: 'बीजक क्रमांक',
    due: 'देय तारीख',
    amountOwed: 'एकूण येणे बाकी',
    tabPay: 'आताच भरा (UPI / बँक)',
    tabAlreadyPaid: 'मी आधीच पैसे भरले आहेत',
    tabDispute: 'बिलाविषयी काही अडचण आहे',
    scanUpi: 'कोणत्याही UPI ॲपवरून स्कॅन करून भरा',
    scanSub: 'PhonePe, Google Pay, Paytm किंवा BHIM • ०% अतिरिक्त शुल्क',
    bankTitle: 'थेट बँक ट्रान्सफर (NEFT / RTGS / IMPS)',
    bankAcc: 'खातेदाराचे नाव',
    bankNum: 'खाते क्रमांक',
    bankIfsc: 'IFSC कोड',
    simUpiBtn: '⚡ ग्राहकाचे त्वरित UPI पेमेंट तपासा',
    utrLabel: 'बँक UTR / व्यवहार संदर्भ क्रमांक',
    utrPlaceholder: 'उदा. १६ अंकी UTR किंवा UPI व्यवहार क्रमांक',
    submitPaidBtn: 'पेमेंट केल्याची पावती सादर करा',
    issueLabel: 'अडचणीचे स्वरूप लिहा (मालाचे नुकसान, दरात फरक, इ.)',
    submitDisputeBtn: 'तक्रार नोंदवा व वसुली थांबवा',
  },
};

export function CustomerPayScreen() {
  const { token } = useParams();
  const { invoices, customers = [], business, submitCustomerClaim, confirmPaymentMatch, demoDate } = useApp();

  const invoice = invoices.find(
    (i) => i.token === token || i.id === token || i.invoiceNumber === token
  );

  const customer = customers.find((c) => c.id === invoice?.customerId);
  const [payLang, setPayLang] = useState(customer?.preferredLanguage || 'en');
  const strings = payI18n[payLang] || payI18n.en;

  const [activeTab, setActiveTab] = useState('pay'); // 'pay' | 'already_paid' | 'dispute'
  const [refNumber, setRefNumber] = useState('');
  const [paidDate, setPaidDate] = useState(demoDate || '2026-10-23');
  const [disputeReason, setDisputeReason] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(null);
  const [simulatedPaidSuccess, setSimulatedPaidSuccess] = useState(false);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
        <div className="bg-[#0f172a]/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-white/10">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-white">Invoice Link Expired or Not Found</h1>
          <p className="text-xs text-slate-400 mt-2">
            Please check the link provided in your payment reminder or contact Kavach Mobile Accessories.
          </p>
        </div>
      </div>
    );
  }

  const grandTotalRupees = (invoice.balanceDuePaise / 100).toFixed(2);
  const upiUrl = `upi://pay?pa=${encodeURIComponent(business?.upiId || '')}&pn=${encodeURIComponent(
    business?.name || 'Kavach Mobile'
  )}&am=${grandTotalRupees}&tn=${encodeURIComponent(invoice.invoiceNumber)}&cu=INR`;

  // Submit "I've already paid"
  const handleAlreadyPaidSubmit = (e) => {
    e.preventDefault();
    if (!refNumber) {
      alert('Please enter your UTR / Transaction reference number');
      return;
    }
    submitCustomerClaim(token, 'already_paid', {
      referenceNumber: refNumber,
      paidDate,
    });
    setSubmittedMessage(
      'Your payment claim has been submitted to Kavach Mobile Accessories. Our accounts team will verify the bank ledger and confirm settlement.'
    );
  };

  // Submit Dispute "Something's wrong with this invoice"
  const handleDisputeSubmit = (e) => {
    e.preventDefault();
    if (!disputeReason) {
      alert('Please state the issue with this bill');
      return;
    }
    submitCustomerClaim(token, 'dispute', {
      reason: disputeReason,
    });
    setSubmittedMessage(
      'Your query has been logged and the reminder escalation ladder has been paused. Our store team will contact you shortly to resolve this.'
    );
  };

  // Simulate Instant UPI payment (for testing and interactive verification)
  const handleSimulateUpiPay = () => {
    confirmPaymentMatch({
      bankRow: {
        id: `STMT-SIM-${Date.now()}`,
        referenceNumber: `UPI/SIM${Math.floor(100000000 + Math.random() * 900000000)}`,
        description: `UPI Sim / ${invoice.customerName} / ${invoice.invoiceNumber}`,
      },
      matchType: 'exact',
      invoiceIds: [invoice.id],
      matchedAmountPaise: invoice.balanceDuePaise,
      reason: 'Instant UPI simulator demo confirmation',
    });
    setSimulatedPaidSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#090d16] py-10 px-4 flex justify-center items-start text-white">
      <div className="bg-[#0f172a]/80 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-white/10">
        {/* Top Header */}
        <div className="bg-gradient-to-b from-[#0b0f19] to-[#0f172a] p-6 text-center border-b border-white/[0.08] relative">
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#090d16] p-1 rounded-xl border border-white/10 text-xs">
            {['en', 'hi', 'mr'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setPayLang(l)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                  payLang === l ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l === 'en' ? 'EN' : l === 'hi' ? 'हिंदी' : 'मराठी'}
              </button>
            ))}
          </div>

          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <span className="text-[11px] uppercase font-bold text-indigo-400 tracking-widest block">
            {business.name || 'Kavach Mobile Accessories'} • Pune
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-1 text-white">{strings.portalTitle}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {strings.portalSub} • GSTIN: <span className="font-mono text-slate-300">{business.gstin}</span>
          </p>
        </div>

        {/* Bill Summary Card */}
        <div className="p-6 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{strings.billedTo}</span>
              <h2 className="text-base font-bold text-white mt-0.5">{invoice.customerName}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{invoice.customerAddress || 'Pune, Maharashtra'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{strings.invoiceNo}</span>
              <p className="font-mono font-bold text-indigo-400 text-sm mt-0.5">{invoice.invoiceNumber}</p>
              <p className="text-[11px] text-slate-400">{strings.due}: <strong className="text-slate-300">{formatIndianDate(invoice.dueDate)}</strong></p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-[#090d16]/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{strings.amountOwed}</span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">
                {formatPaise(invoice.balanceDuePaise)}
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                invoice.status === 'paid' || simulatedPaidSuccess
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {simulatedPaidSuccess ? 'Paid' : invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Success Feedback Banner */}
        {(submittedMessage || simulatedPaidSuccess) && (
          <div className="m-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm text-white block mb-0.5">
                  {simulatedPaidSuccess ? 'Payment Received Successfully!' : 'Response Recorded'}
                </strong>
                <p className="leading-relaxed text-slate-300">
                  {submittedMessage ||
                    `Thank you! Receipt has been updated in Kavach Mobile Accessories accounts system. Invoice ${invoice.invoiceNumber} is settled.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        {!submittedMessage && !simulatedPaidSuccess && (
          <div>
            <div className="flex border-b border-white/[0.08] text-xs font-bold bg-[#090d16]/50">
              <button
                onClick={() => setActiveTab('pay')}
                className={`flex-1 py-3.5 text-center flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'pay'
                    ? 'border-indigo-500 text-indigo-400 bg-white/[0.04]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>{strings.tabPay}</span>
              </button>

              <button
                onClick={() => setActiveTab('already_paid')}
                className={`flex-1 py-3.5 text-center flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'already_paid'
                    ? 'border-indigo-500 text-indigo-400 bg-white/[0.04]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>{strings.tabAlreadyPaid}</span>
              </button>

              <button
                onClick={() => setActiveTab('dispute')}
                className={`flex-1 py-3.5 text-center flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'dispute'
                    ? 'border-indigo-500 text-indigo-400 bg-white/[0.04]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquareWarning className="w-4 h-4" />
                <span>{strings.tabDispute}</span>
              </button>
            </div>

            {/* Tab 1: Pay by UPI */}
            {activeTab === 'pay' && (
              <div className="p-6 space-y-5 text-center">
                <div>
                  <h3 className="text-sm font-bold text-white">{strings.scanUpi}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {strings.scanSub}
                  </p>
                </div>

                <div className="inline-block p-4 bg-white rounded-2xl shadow-xl">
                  <QRCodeSVG value={upiUrl} size={180} level="M" />
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p>
                    <span className="text-slate-400">UPI ID: </span>
                    <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{business.upiId}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Beneficiary: </span>
                    <strong className="text-white">{business.name}</strong>
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <a
                    href={upiUrl}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/20 transition-all inline-block"
                  >
                    Open UPI App ({formatPaise(invoice.balanceDuePaise)})
                  </a>

                  {/* Simulate Instant UPI Payment button */}
                  <button
                    onClick={handleSimulateUpiPay}
                    className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                  >
                    {strings.simUpiBtn}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Already Paid Claim */}
            {activeTab === 'already_paid' && (
              <form onSubmit={handleAlreadyPaidSubmit} className="p-6 space-y-4 text-left">
                <div>
                  <h3 className="text-sm font-bold text-white">{strings.tabAlreadyPaid}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter the transfer reference. This will notify our accounts desk and pause reminder follow-ups.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {strings.utrLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder={strings.utrPlaceholder}
                    className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Date of Payment
                  </label>
                  <input
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/20 transition-all cursor-pointer"
                >
                  {strings.submitPaidBtn}
                </button>
              </form>
            )}

            {/* Tab 3: Dispute / Something's Wrong */}
            {activeTab === 'dispute' && (
              <form onSubmit={handleDisputeSubmit} className="p-6 space-y-4 text-left">
                <div>
                  <h3 className="text-sm font-bold text-white">{strings.tabDispute}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Report damage, count discrepancy, or pricing issues. The reminder ladder will be immediately paused while we review.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {strings.issueLabel} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="e.g. 5 pcs tempered glass damaged in transit, or rates do not match wholesale agreement..."
                    className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-600/25 border border-rose-400/20 transition-all cursor-pointer"
                >
                  {strings.submitDisputeBtn}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-[#090d16] border-t border-white/[0.08] text-center text-xs text-slate-500">
          Kavach Mobile Accessories • FC Road, Shivaji Nagar, Pune • Tel: {business.phone}
        </div>
      </div>
    </div>
  );
}
