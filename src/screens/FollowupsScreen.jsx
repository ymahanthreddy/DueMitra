import React, { useState } from 'react';
import {
  BellRing,
  Clock,
  Send,
  MessageSquare,
  Mail,
  Phone,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  CalendarCheck,
  ArrowRight,
  Zap,
  Check,
  RotateCcw,
  ShieldAlert,
  Inbox,
  Edit2,
  Save,
  AtSign,
  Settings,
  Users,
  Eye,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise } from '../utils/money';
import { formatIndianDate, addDays } from '../utils/date';
import { WhatsAppSimulatorModal } from '../components/WhatsAppSimulatorModal';

export function FollowupsScreen() {
  const {
    t,
    business,
    followupsDueToday,
    markLadderStageSent,
    snoozeFollowup,
    recordCustomerPromise,
    demoDate,
    n8nStatus,
    dueDigestConfig,
    updateDueDigestConfig,
    sendDueRemindersDigestEmail,
    ageingBuckets,
    customers = [],
    updateCustomer,
    autoReminderSettings,
    autoReminderLogs,
    runAutoRemindersDispatch,
    retryFailedAutoReminder,
  } = useApp();

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'email_settings'
  const [activePromisedInvId, setActivePromisedInvId] = useState(null);
  const [promisedDate, setPromisedDate] = useState(addDays(demoDate, 5));
  const [simulatingWhatsAppItem, setSimulatingWhatsAppItem] = useState(null);
  const [dispatchingDigest, setDispatchingDigest] = useState(false);
  const [digestFeedback, setDigestFeedback] = useState(null);
  const [isAutoDispatching, setIsAutoDispatching] = useState(false);
  const [autoDispatchFeedback, setAutoDispatchFeedback] = useState(null);

  // Email Configuration State for 2-3 hour digest
  const resolveInitialDigestEmail = () => {
    const raw =
      dueDigestConfig?.recipientEmail ||
      business?.notificationEmail ||
      business?.email ||
      '';
    return raw.includes('kavachaccessories.in') ? '' : raw;
  };

  const [digestEmailInput, setDigestEmailInput] = useState(resolveInitialDigestEmail);
  const [digestInterval, setDigestInterval] = useState(dueDigestConfig?.intervalHours || 3);
  const [isEditingDigestEmail, setIsEditingDigestEmail] = useState(false);
  const [saveEmailSuccess, setSaveEmailSuccess] = useState(false);

  // Customer inline email edits: { [customerId]: emailString }
  const [editingCustomerEmails, setEditingCustomerEmails] = useState({});
  const [savedCustomerEmailId, setSavedCustomerEmailId] = useState(null);

  const targetBusinessEmail = resolveInitialDigestEmail();

  const handleSaveDigestEmail = (e) => {
    if (e) e.preventDefault();
    updateDueDigestConfig({
      recipientEmail: digestEmailInput.trim(),
      intervalHours: Number(digestInterval),
      enabled: true,
    });
    setIsEditingDigestEmail(false);
    setSaveEmailSuccess(true);
    setTimeout(() => setSaveEmailSuccess(false), 3000);
  };

  const handleUpdateCustomerEmail = (customerId, newEmail) => {
    if (!newEmail || !newEmail.trim()) return;
    updateCustomer(customerId, { email: newEmail.trim() });
    setSavedCustomerEmailId(customerId);
    setEditingCustomerEmails((prev) => ({ ...prev, [customerId]: undefined }));
    setTimeout(() => setSavedCustomerEmailId(null), 3000);
  };

  const handleTriggerDigestNow = async () => {
    const activeEmail = digestEmailInput.trim() || targetBusinessEmail;
    if (!activeEmail || activeEmail.includes('kavachaccessories.in')) {
      setActiveTab('email_settings');
      setDigestFeedback({
        type: 'warning',
        msg: 'Please configure your receiving email address in Email Digest Settings before sending.',
      });
      return;
    }
    setDispatchingDigest(true);
    setDigestFeedback(null);
    try {
      const res = await sendDueRemindersDigestEmail(activeEmail);
      if (res.n8nSuccess || res.resendSuccess) {
        setDigestFeedback({
          type: 'success',
          msg: `Digest dispatched to ${activeEmail} via live n8n (${followupsDueToday.length} reminders included)`,
        });
      } else {
        setDigestFeedback({
          type: 'warning',
          msg: `Digest payload prepared for ${activeEmail} (n8n: ${res.n8nError || 'Offline'}. Check that your workflow in n8n Cloud is toggled to Active)`,
        });
      }
    } catch (err) {
      setDigestFeedback({
        type: 'error',
        msg: `Failed to dispatch digest: ${err.message}`,
      });
    } finally {
      setDispatchingDigest(false);
    }
  };

  const handleTriggerAutoDispatch = async () => {
    setIsAutoDispatching(true);
    setAutoDispatchFeedback(null);
    try {
      const res = await runAutoRemindersDispatch();
      if (res && res.success) {
        setAutoDispatchFeedback({
          type: 'success',
          msg: `Auto-dispatch complete: ${res.totalDispatched} reminders delivered, ${res.totalFailed} failed.${autoReminderSettings?.testMode ? ` (Test Mode: Sent to ${autoReminderSettings?.testEmail})` : ''}`,
        });
      } else {
        setAutoDispatchFeedback({
          type: 'warning',
          msg: res?.error || 'Auto-dispatch ran into an issue. Check server status.',
        });
      }
    } catch (e) {
      setAutoDispatchFeedback({ type: 'error', msg: e.message });
    } finally {
      setIsAutoDispatching(false);
    }
  };

  const handleSendWhatsApp = (item) => {
    const phone = (item.customer?.phone || item.invoice.customerPhone || '').replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const encodedText = encodeURIComponent(item.messageText);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(waUrl, '_blank');
    markLadderStageSent(item.invoice.id, item.stage.number, 'whatsapp');
  };

  const handleSendEmail = (item) => {
    const email = item.customer?.email || item.invoice.customerEmail || '';
    const subject = encodeURIComponent(
      `Payment Reminder: Invoice ${item.invoice.invoiceNumber} - ${business?.name || 'Kavach Mobile Accessories'}`
    );
    const body = encodeURIComponent(item.messageText);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    markLadderStageSent(item.invoice.id, item.stage.number, 'email');
  };

  const handleSendSms = (item) => {
    const phone = (item.customer?.phone || item.invoice.customerPhone || '').replace(/[^0-9]/g, '');
    const body = encodeURIComponent(item.messageText);
    window.location.href = `sms:${phone}?body=${body}`;
    markLadderStageSent(item.invoice.id, item.stage.number, 'sms');
  };

  const handleSnooze = (invoiceId) => {
    snoozeFollowup(invoiceId, 3);
  };

  const handleRecordPromise = (invoiceId) => {
    recordCustomerPromise(invoiceId, promisedDate);
    setActivePromisedInvId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>{t('nav.followups')}</span>
            <span className="text-xs px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full font-bold">
              {followupsDueToday.length} Due Today
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Automated escalation reminders, multi-channel dispatch, and dealer follow-ups for {formatIndianDate(demoDate)}
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-[#0f172a] text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
          }`}
        >
          <BellRing className="w-4 h-4 text-amber-400" />
          <span>Today&apos;s Action Queue</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'queue' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
          }`}>
            {followupsDueToday.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('email_settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'email_settings'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-[#0f172a] text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
          }`}
        >
          <Mail className="w-4 h-4 text-cyan-400" />
          <span>Modify Reminder Emails & Schedule</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Every {dueDigestConfig?.intervalHours || 3}h
          </span>
        </button>
      </div>

      {/* TAB 1: ACTION QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* 2-3 Hour Consolidated Business Due Digest Banner with Quick Inline Email Edit */}
          <div className="bg-gradient-to-r from-indigo-950/60 via-[#0f172a] to-blue-950/40 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Mail className="w-4 h-4 text-indigo-400" />
                  </span>
                  <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                    Consolidated Business Due Digest (Every {dueDigestConfig?.intervalHours || 3}h via n8n)
                  </h2>
                  <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Auto-Active
                  </span>
                </div>

                {/* Inline Email Address Display & Quick Editor */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-300">Sending executive briefing to:</span>
                  {isEditingDigestEmail ? (
                    <form onSubmit={handleSaveDigestEmail} className="flex items-center gap-1.5">
                      <input
                        type="email"
                        value={digestEmailInput}
                        onChange={(e) => setDigestEmailInput(e.target.value)}
                        placeholder="recipient@example.com"
                        className="px-2.5 py-1 bg-[#090d16] border border-indigo-500/50 rounded-lg text-xs font-mono text-white focus:outline-hidden"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingDigestEmail(false)}
                        className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="inline-flex items-center gap-1.5">
                      <strong className="text-indigo-300 font-mono text-xs bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                        {targetBusinessEmail}
                      </strong>
                      <button
                        onClick={() => {
                          setDigestEmailInput(targetBusinessEmail);
                          setIsEditingDigestEmail(true);
                        }}
                        title="Click to edit recipient email"
                        className="p-1 text-slate-400 hover:text-indigo-300 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <span>Cycle: <strong className="text-indigo-300">Every {dueDigestConfig?.intervalHours || 3}h</strong></span>
                  <span>•</span>
                  <span>Overdue Pool: <strong className="text-rose-400 font-mono">{formatPaise(ageingBuckets?.totalOverduePaise || 0)}</strong></span>
                  <span>•</span>
                  <span>Included Reminders: <strong className="text-amber-400">{followupsDueToday.length} today</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleTriggerDigestNow}
                  disabled={dispatchingDigest}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 border border-cyan-400/30 transition-all cursor-pointer flex items-center gap-2 min-h-[42px]"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>{dispatchingDigest ? 'Sending Digest...' : 'Trigger Digest Now'}</span>
                </button>
              </div>
            </div>

            {/* Digest Feedback Notice */}
            {digestFeedback && (
              <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${
                digestFeedback.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-200'
                  : digestFeedback.type === 'warning'
                  ? 'bg-amber-950/50 border-amber-500/30 text-amber-200'
                  : 'bg-rose-950/50 border-rose-500/30 text-rose-200'
              }`}>
                {digestFeedback.msg}
              </div>
            )}
            {saveEmailSuccess && (
              <div className="mt-2 text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Recipient email updated to {targetBusinessEmail}!</span>
              </div>
            )}
          </div>

          {/* Daily 10:00 AM IST Auto-Reminder Engine Banner */}
          <div className="bg-gradient-to-r from-indigo-950/50 via-[#0f172a] to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Clock className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-white">Daily 10:00 AM IST Auto-Reminders Daemon</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Scheduled Active
                  </span>
                  {autoReminderSettings?.testMode && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      🧪 Test Mode Active ({autoReminderSettings?.testEmail})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Sends automated reminder emails for enabled stages (Stages 1 & 2 by default) without opening your email client. Enforces anti-spam limits (max 1 message per customer/day) and pauses for disputes. Demand letters are strictly manual.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isAutoDispatching}
                  onClick={handleTriggerAutoDispatch}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all cursor-pointer flex items-center gap-2 min-h-[42px]"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  <span>{isAutoDispatching ? 'Dispatching...' : '⚡ Run 10:00 IST Auto-Dispatch Now'}</span>
                </button>
              </div>
            </div>

            {autoDispatchFeedback && (
              <div className={`mt-3 p-3 rounded-xl border text-xs ${
                autoDispatchFeedback.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              }`}>
                {autoDispatchFeedback.msg}
              </div>
            )}

            {/* Failed Dispatches Retry List */}
            {autoReminderLogs?.failed && autoReminderLogs.failed.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Failed Dispatches (Retry Available):</span>
                </div>
                <div className="space-y-1.5">
                  {autoReminderLogs.failed.map((f) => (
                    <div key={f.id} className="flex items-center justify-between p-2.5 bg-rose-950/20 border border-rose-500/20 rounded-xl text-xs">
                      <div>
                        <span className="font-bold text-white">{f.customerName}</span> • <span className="font-mono text-slate-300">{f.invoiceNumber}</span> ({f.stageName})
                        <p className="text-[10px] text-rose-400">{f.error || 'Recipient mailbox unreachable'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => retryFailedAutoReminder(f)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Follow-up Cards List */}
          {followupsDueToday.length > 0 ? (
            <div className="space-y-5">
              {followupsDueToday.map((item) => {
                const currentCustEmail = item.customer?.email || item.invoice.customerEmail || '';
                const isEditingThisEmail = editingCustomerEmails[item.customer?.id] !== undefined;

                return (
                  <div
                    key={item.invoice.id}
                    className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl transition-all hover:border-indigo-500/30"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                            Stage {item.stage.number}: {item.stage.name}
                          </span>
                          <span className="font-mono text-xs text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
                            {item.invoice.invoiceNumber}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            Lang: {item.customer?.preferredLanguage === 'mr' ? 'मराठी' : item.customer?.preferredLanguage === 'hi' ? 'हिंदी' : 'English'}
                          </span>
                        </div>

                        <h2 className="text-lg font-bold text-white mt-2">
                          {item.customer?.name || item.invoice.customerName}
                        </h2>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>Contact: <strong className="text-slate-300">{item.customer?.contactPerson || 'Proprietor'}</strong></span>
                          <span>•</span>
                          <span>Phone: <strong className="font-mono text-slate-300">{item.customer?.phone || item.invoice.customerPhone}</strong></span>
                          <span>•</span>
                          
                          {/* Inline editable email for this customer */}
                          <div className="flex items-center gap-1.5">
                            <span>Email:</span>
                            {isEditingThisEmail ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="email"
                                  value={editingCustomerEmails[item.customer?.id] ?? currentCustEmail}
                                  onChange={(e) =>
                                    setEditingCustomerEmails({
                                      ...editingCustomerEmails,
                                      [item.customer?.id]: e.target.value,
                                    })
                                  }
                                  placeholder="customer@example.com"
                                  className="px-2 py-0.5 bg-[#090d16] border border-cyan-500/50 rounded text-xs font-mono text-white focus:outline-hidden"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateCustomerEmail(
                                      item.customer?.id,
                                      editingCustomerEmails[item.customer?.id] ?? currentCustEmail
                                    )
                                  }
                                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingCustomerEmails({
                                      ...editingCustomerEmails,
                                      [item.customer?.id]: undefined,
                                    })
                                  }
                                  className="text-xs text-slate-400 hover:text-white px-1"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-slate-300">{currentCustEmail || 'No email set'}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingCustomerEmails({
                                      ...editingCustomerEmails,
                                      [item.customer?.id]: currentCustEmail,
                                    })
                                  }
                                  title="Click to edit customer email"
                                  className="text-slate-400 hover:text-cyan-300 cursor-pointer p-0.5"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                {savedCustomerEmailId === item.customer?.id && (
                                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                    Saved!
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-left lg:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                          Outstanding Balance
                        </span>
                        <div className="text-xl font-black font-mono text-white mt-0.5">
                          {formatPaise(item.invoice.balanceDuePaise)}
                        </div>
                        <div className="text-xs font-bold text-amber-400 mt-0.5">
                          {item.stage.daysDiff < 0
                            ? `Matures in ${Math.abs(item.stage.daysDiff)} days`
                            : item.stage.daysDiff === 0
                            ? 'Due Today'
                            : `${item.stage.daysDiff} days overdue`}
                        </div>
                      </div>
                    </div>

                    {/* Pre-drafted Escalation Message Box */}
                    <div className="mt-4 bg-[#090d16]/90 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Pre-drafted Escalation Message ({item.customer?.preferredLanguage === 'mr' ? 'मराठी' : item.customer?.preferredLanguage === 'hi' ? 'हिंदी' : 'English'})
                        </span>
                        <span className="text-[11px] text-indigo-400 font-mono">
                          Includes UPI Quick Pay Link
                        </span>
                      </div>
                      <pre className="text-xs font-sans text-slate-200 whitespace-pre-wrap leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
                        {item.messageText}
                      </pre>
                    </div>

                    {/* One-Tap Action Triggers */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* WhatsApp One-Tap Link */}
                        <button
                          onClick={() => handleSendWhatsApp(item)}
                          className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer min-h-[44px]"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>WhatsApp (wa.me)</span>
                        </button>

                        {/* WhatsApp Phone Simulator */}
                        <button
                          onClick={() => setSimulatingWhatsAppItem(item)}
                          className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer min-h-[44px]"
                        >
                          <span>📱 Preview Simulator</span>
                        </button>

                        {/* Email mailto */}
                        <button
                          onClick={() => handleSendEmail(item)}
                          className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer min-h-[44px]"
                        >
                          <Mail className="w-4 h-4 text-cyan-400" />
                          <span>Email to {item.customer?.email?.split('@')[0] || 'Customer'}</span>
                        </button>

                        {/* SMS sms: */}
                        <button
                          onClick={() => handleSendSms(item)}
                          className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer min-h-[44px]"
                        >
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>SMS</span>
                        </button>
                      </div>

                      {/* Escalation Ladder Flow Controls */}
                      <div className="flex items-center gap-2">
                        {/* Snooze 3 Days */}
                        <button
                          onClick={() => handleSnooze(item.invoice.id)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer min-h-[44px]"
                          title="Pause escalation for 3 calendar days"
                        >
                          Snooze 3d
                        </button>

                        {/* Promise to Pay Popover Trigger */}
                        {activePromisedInvId === item.invoice.id ? (
                          <div className="flex items-center gap-1.5 bg-[#090d16] p-1.5 rounded-xl border border-indigo-500/50">
                            <input
                              type="date"
                              value={promisedDate}
                              onChange={(e) => setPromisedDate(e.target.value)}
                              className="px-2 py-1 bg-slate-900 text-white rounded text-xs border border-slate-700 font-mono"
                            />
                            <button
                              onClick={() => handleRecordPromise(item.invoice.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setActivePromisedInvId(null)}
                              className="px-2 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActivePromisedInvId(item.invoice.id);
                              setPromisedDate(addDays(demoDate, 5));
                            }}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer min-h-[44px]"
                            title="Record promise to pay date and temporarily pause ladder"
                          >
                            Promise Date
                          </button>
                        )}

                        {/* Mark As Sent */}
                        <button
                          onClick={() => markLadderStageSent(item.invoice.id, item.stage.number, 'manual')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[44px]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Sent</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-lg font-bold text-white">All Follow-ups Complete for Today!</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No reminders are pending for {formatIndianDate(demoDate)}. Advance the simulated date using the Time Machine in the top bar to inspect future escalation stages.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MODIFY REMINDER EMAILS & RECIPIENT DIRECTORY */}
      {activeTab === 'email_settings' && (
        <div className="space-y-6">
          {/* Main Digest Frequency & Recipient Card */}
          <div className="bg-[#0f172a]/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Executive Briefing & Digest Settings
                  </h2>
                  <p className="text-xs text-slate-400">
                    Automated email dispatch of all due follow-ups to your accounts team
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
                n8n Connected
              </span>
            </div>

            <form onSubmit={handleSaveDigestEmail} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Receiving Business Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={digestEmailInput}
                    onChange={(e) => setDigestEmailInput(e.target.value)}
                    placeholder="e.g. accounts@yourcompany.com or yourname@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Every reminder cycle sends a comprehensive briefing of all overdue accounts here.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Automated Digest Interval
                  </label>
                  <select
                    value={digestInterval}
                    onChange={(e) => setDigestInterval(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value={2}>Every 2 Hours (Intensive Recovery)</option>
                    <option value={3}>Every 3 Hours (Recommended Standard)</option>
                    <option value={6}>Every 6 Hours (Twice a day)</option>
                    <option value={24}>Daily at 10:00 AM IST</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Triggers the live n8n workflow webhook automatically on this frequency.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Digest Preferences</span>
                </button>

                {saveEmailSuccess && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/15 px-3 py-1.5 rounded-lg border border-emerald-500/30 animate-fade-in">
                    <Check className="w-4 h-4" />
                    <span>Saved successfully!</span>
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Customer Specific Email Directory & Editor */}
          <div className="bg-[#0f172a]/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Wholesale Customer Reminders Directory
                  </h2>
                  <p className="text-xs text-slate-400">
                    Modify individual recipient emails for sub-dealers and wholesale buyers
                  </p>
                </div>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {customers.length} Trade Accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Customer / Firm</th>
                    <th className="py-3 px-3">Contact Person</th>
                    <th className="py-3 px-3">Reminder Email Address</th>
                    <th className="py-3 px-3 text-right">Open Dues</th>
                    <th className="py-3 px-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers.map((c) => {
                    const isEditing = editingCustomerEmails[c.id] !== undefined;
                    const emailVal = editingCustomerEmails[c.id] ?? (c.email || '');

                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block">{c.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{c.gstin || 'Unregistered'}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {c.contactPerson || '-'}
                        </td>
                        <td className="py-3 px-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="email"
                                value={emailVal}
                                onChange={(e) =>
                                  setEditingCustomerEmails({
                                    ...editingCustomerEmails,
                                    [c.id]: e.target.value,
                                  })
                                }
                                placeholder="name@domain.in"
                                className="px-2.5 py-1 bg-[#090d16] border border-cyan-500/50 rounded-lg text-xs font-mono text-white focus:outline-hidden"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateCustomerEmail(c.id, emailVal)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Save className="w-3 h-3" />
                                <span>Save</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingCustomerEmails({
                                    ...editingCustomerEmails,
                                    [c.id]: undefined,
                                  })
                                }
                                className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-cyan-300">
                                {c.email || <span className="text-slate-500 italic">No email registered</span>}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingCustomerEmails({
                                    ...editingCustomerEmails,
                                    [c.id]: c.email || '',
                                  })
                                }
                                title="Click to edit email address"
                                className="p-1 text-slate-500 hover:text-cyan-300 cursor-pointer transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {savedCustomerEmailId === c.id && (
                                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                                  Saved!
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white">
                          {formatPaise(c.outstandingPaise || 0)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const mailUrl = `mailto:${c.email || ''}?subject=${encodeURIComponent('Payment Reminder - DueMitra')}&body=${encodeURIComponent(`Dear ${c.name},\n\nPlease review your balance due of ${formatPaise(c.outstandingPaise || 0)}.\n\nRegards,\nKavach Mobile Accessories`)}`;
                              window.location.href = mailUrl;
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-white/5 transition-colors cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Send Email</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Interactive WhatsApp Smartphone Simulator Modal */}
      {simulatingWhatsAppItem && (
        <WhatsAppSimulatorModal
          item={simulatingWhatsAppItem}
          onClose={() => setSimulatingWhatsAppItem(null)}
          onSimulateDealerReply={(inv, reply) => {
            markLadderStageSent(inv.id, simulatingWhatsAppItem.stage.number, 'whatsapp_simulator');
          }}
        />
      )}
    </div>
  );
}
