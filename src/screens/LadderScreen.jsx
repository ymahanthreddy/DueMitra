import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  PhoneCall,
  FileText,
  Scale,
  ShieldCheck,
  PauseCircle,
  Zap,
  Mail,
  Send,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Printer,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { reminderTemplates } from '../data/templates';
import { formatPaise } from '../utils/money';
import { formatIndianDate, getDaysDiff } from '../utils/date';
import { dispatchInvoiceEmail } from '../utils/mailer';
import { PrintDemandLetterModal } from '../components/PrintDemandLetterModal';

export function LadderScreen() {
  const {
    invoices = [],
    customers = [],
    business,
    config,
    lang,
    demoDate,
    markLadderStageSent,
  } = useApp();

  const [expandedStages, setExpandedStages] = useState({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true });
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [sentFeedback, setSentFeedback] = useState({});
  const [selectedDemandInvoice, setSelectedDemandInvoice] = useState(null);

  const toggleStage = (stageNum) => {
    setExpandedStages((prev) => ({ ...prev, [stageNum]: !prev[stageNum] }));
  };

  const stages = [
    {
      stage: 1,
      trigger: '-3 Days (Pre-Due)',
      title: 'Friendly Heads-up',
      tone: 'Gentle & Cordial',
      channel: 'WhatsApp & UPI Pay Link Email',
      desc: 'Reminds dealer that the commercial credit period is concluding in 3 days. Includes direct digital pay link.',
      templateKey: 'heads_up',
      icon: MessageSquare,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
      isEligible: (daysOverdue) => daysOverdue >= -3 && daysOverdue < 0,
    },
    {
      stage: 2,
      trigger: '0 Days (Due Date)',
      title: 'Due Date Reminder',
      tone: 'Formal & Professional',
      channel: 'WhatsApp & Digital Invoice Email',
      desc: 'Notifies the buyer that payment is due today, providing HDFC bank account details and instant UPI QR.',
      templateKey: 'due_date',
      icon: Clock,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
      isEligible: (daysOverdue) => daysOverdue === 0,
    },
    {
      stage: 3,
      trigger: '+7 Days Overdue (1-14 Days)',
      title: 'Firmer Follow-up',
      tone: 'Firm yet Polite',
      channel: 'WhatsApp, Webhook & Demand Email',
      desc: 'Highlights that invoice is past due. Cites supplier inventory cash flow necessity and triggers automated alert.',
      templateKey: 'firm_reminder',
      icon: Zap,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
      isEligible: (daysOverdue) => daysOverdue >= 1 && daysOverdue <= 14,
    },
    {
      stage: 4,
      trigger: '+15 Days Overdue (15-29 Days)',
      title: 'Final Reminder Notice',
      tone: 'Urgent & Serious',
      channel: 'WhatsApp & Escalated Demand Email',
      desc: 'Flags trade credit freeze risk. Alerts owner to follow up via phone. Dispatches formal payment ultimatum.',
      templateKey: 'final_reminder',
      icon: PhoneCall,
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_12px_rgba(249,115,22,0.15)]',
      isEligible: (daysOverdue) => daysOverdue >= 15 && daysOverdue <= 29,
    },
    {
      stage: 5,
      trigger: '+30 Days Overdue (30-44 Days)',
      title: 'Payment Demand Letter',
      tone: 'Official Commercial Requisition',
      channel: 'A4 Printable Demand Letter & PDF Email',
      desc: 'Issues non-litigation Payment Demand Letter with 7-day cure period and statutory MSMED Act interest calculation.',
      templateKey: 'demand_letter',
      icon: FileText,
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
      isEligible: (daysOverdue) => daysOverdue >= 30 && daysOverdue <= 44,
    },
    {
      stage: 6,
      trigger: '+45 Days Overdue (MSMED Act)',
      title: 'MSME Samadhaan Formal Escalation',
      tone: 'Internal Legal & Statutory Advisory',
      channel: 'Statutory 45-day MSMED Ceiling Notice',
      desc: 'Statutory 45-day MSMED ceiling crossed. Prepares dispute dossier for direct filing on the MSME Samadhaan council portal.',
      templateKey: 'next_steps',
      icon: Scale,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]',
      isEligible: (daysOverdue) => daysOverdue >= 45,
    },
  ];

  const handleSendInvoiceEmail = async (inv, stage) => {
    const cust = customers.find((c) => c.id === inv.customerId);
    const targetEmail = inv.customerEmail || cust?.email || business?.notificationEmail || business?.email;
    setSendingEmailId(inv.id);

    try {
      await dispatchInvoiceEmail({
        invoice: inv,
        business,
        customer: cust,
        recipientEmail: targetEmail,
        webhookUrl: config.n8n?.webhookUrl,
        emailWebhookUrl: config.n8n?.emailWebhookUrl,
      });

      markLadderStageSent(inv.id, stage.stage, 'email');
      setSentFeedback((prev) => ({
        ...prev,
        [inv.id]: `Email dispatched to ${targetEmail}!`,
      }));

      setTimeout(() => {
        setSentFeedback((prev) => {
          const updated = { ...prev };
          delete updated[inv.id];
          return updated;
        });
      }, 4000);
    } catch (err) {
      alert(`Email dispatch error: ${err.message}`);
    } finally {
      setSendingEmailId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Credit Escalation Ladder</span>
            <span className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-bold">
              6-Stage Protocol
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gradual 6-stage escalation protocol. Check eligible invoices at each stage and dispatch emails directly to registered customer addresses.
          </p>
        </div>
      </div>

      {/* Ladder Rules Banner */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
            <PauseCircle className="w-5 h-5" />
          </span>
          <div className="text-xs text-slate-300">
            <strong className="text-white block text-sm font-bold">Autonomous Pause Rules & 2-3h Consolidated Digest</strong>
            The ladder pauses automatically if an invoice is disputed or marked with a promised pay date. All active due reminders across these 6 stages are also automatically summarized in the 2-3 hour executive email digest sent to your registered business email.
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-300 bg-white/[0.04] px-3.5 py-2 rounded-xl border border-white/10 shrink-0">
          Editable in Settings
        </div>
      </div>

      {/* Step by Step Timeline */}
      <div className="space-y-5">
        {stages.map((st) => {
          const Icon = st.icon;
          const template = reminderTemplates[st.templateKey];
          const messageText = lang === 'hi' ? template?.hi : template?.en;

          // Find open invoices eligible for this stage
          const eligibleInvoices = invoices.filter((inv) => {
            if (inv.status === 'paid' || inv.balanceDuePaise <= 0 || inv.ladderPaused) return false;
            const daysOverdue = getDaysDiff(demoDate, inv.dueDate);
            return st.isEligible(daysOverdue);
          });

          const isExpanded = expandedStages[st.stage];

          return (
            <div
              key={st.stage}
              className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl transition-all hover:border-indigo-500/30 space-y-4"
            >
              {/* Stage Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3.5 rounded-2xl border shrink-0 ${st.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-black text-indigo-400">
                        STAGE {st.stage}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white/[0.04] text-slate-300 border border-white/10">
                        {st.trigger}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        Tone: {st.tone}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          eligibleInvoices.length > 0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-white/5 text-slate-500 border-white/5'
                        }`}
                      >
                        {eligibleInvoices.length} Eligible Invoice{eligibleInvoices.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                      <span>{st.title}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
                      {st.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-start">
                  <div className="text-left md:text-right shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Delivery Channel
                    </span>
                    <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                      {st.channel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStage(st.stage)}
                    className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Section: Eligible Invoices & Instant Send Action */}
              {isExpanded && (
                <div className="pt-3 border-t border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Invoices Eligible for Stage {st.stage} Escalation ({eligibleInvoices.length})</span>
                    </span>
                  </div>

                  {eligibleInvoices.length === 0 ? (
                    <div className="p-3 bg-[#090d16] rounded-xl border border-white/5 text-xs text-slate-500 italic">
                      No invoices currently match the Stage {st.stage} trigger criteria. All dealer bills are outside this window.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {eligibleInvoices.map((inv) => {
                        const cust = customers.find((c) => c.id === inv.customerId);
                        const daysOverdue = getDaysDiff(demoDate, inv.dueDate);
                        const targetEmail = inv.customerEmail || cust?.email || business?.notificationEmail || business?.email;
                        const isSending = sendingEmailId === inv.id;
                        const feedback = sentFeedback[inv.id];

                        return (
                          <div
                            key={inv.id}
                            className="bg-[#090d16] border border-white/5 hover:border-indigo-500/30 rounded-xl p-3.5 flex flex-col justify-between gap-3 transition-colors"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-mono text-xs font-bold text-indigo-400">
                                    {inv.invoiceNumber}
                                  </span>
                                  <h3 className="text-sm font-bold text-white mt-0.5">{inv.customerName}</h3>
                                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    <Mail className="w-3 h-3 text-slate-500" />
                                    <span className="font-mono text-slate-300">{targetEmail}</span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="text-sm font-black font-mono text-white">
                                    {formatPaise(inv.balanceDuePaise)}
                                  </div>
                                  <div className="text-[10px] font-bold text-rose-400">
                                    {daysOverdue > 0 ? `${daysOverdue} days overdue` : `Due: ${formatIndianDate(inv.dueDate)}`}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                              {feedback ? (
                                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{feedback}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">
                                  {inv.lastLadderStageSent === st.stage
                                    ? `Stage ${st.stage} notice already sent`
                                    : 'Ready for escalation dispatch'}
                                </span>
                              )}

                              <div className="flex items-center gap-1.5 ml-auto">
                                {st.stage === 5 && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDemandInvoice(inv)}
                                    className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Printer className="w-3 h-3" />
                                    <span>View Letter</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleSendInvoiceEmail(inv, st)}
                                  disabled={isSending}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>{isSending ? 'Sending...' : 'Send Email to Customer'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Message Template Accordion Preview */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Template Draft ({lang === 'hi' ? 'हिंदी' : 'English'}):
                    </span>
                    <pre className="text-xs font-sans text-slate-300 whitespace-pre-wrap bg-[#0a0f1d] p-3 rounded-xl border border-slate-800 leading-relaxed max-h-28 overflow-y-auto">
                      {messageText}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Demand Letter Modal */}
      {selectedDemandInvoice && (
        <PrintDemandLetterModal
          invoice={selectedDemandInvoice}
          customer={customers?.find((c) => c.id === selectedDemandInvoice.customerId) || selectedDemandInvoice.customer}
          business={business}
          config={config}
          demoDate={demoDate}
          onClose={() => setSelectedDemandInvoice(null)}
        />
      )}
    </div>
  );
}
