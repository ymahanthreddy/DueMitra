import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  Activity,
  Calendar,
  Languages,
  Shield,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Save,
  Check,
  Database,
  Cloud,
  UploadCloud,
  Copy,
  Layers,
  Plus,
  Building2,
  GitCommit,
  Sliders,
  DollarSign,
  Mail,
  Clock,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPaise, rupeesToPaise, paiseToRupees } from '../utils/money';
import { validateGstin } from '../utils/gst';
import { testSupabaseConnection, pushFullStateToSupabase } from '../utils/supabase';
import { RegisterBusinessModal } from '../components/RegisterBusinessModal';
import { dispatchInvoiceEmail } from '../utils/mailer';

export function SettingsScreen() {
  const {
    business,
    businesses = [],
    currentBusinessId,
    switchBusiness,
    deleteBusiness,
    customers,
    invoices,
    inboxClaims,
    config,
    demoDate,
    lang,
    fontSize,
    updateBusiness,
    updateN8nConfig,
    updateConfig,
    setDemoDate,
    advanceDemoDays,
    toggleLanguage,
    setLanguage,
    setFontSize,
    resetDemoData,
    testN8n,
    n8nStatus,
    dueDigestConfig,
    updateDueDigestConfig,
    sendDueRemindersDigestEmail,
    followupsDueToday,
    ageingBuckets,
    autoReminderSettings,
    updateAutoReminderSettings,
  } = useApp();

  const [businessForm, setBusinessForm] = useState({ ...business });
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  useEffect(() => {
    setBusinessForm({ ...business });
  }, [business]);
  const [n8nForm, setN8nForm] = useState(() => ({
    webhookUrl: config.n8n?.webhookUrl || 'https://ymahanthreddy.app.n8n.cloud/webhook/kavach-alerts',
    dueDigestWebhookUrl: config.n8n?.dueDigestWebhookUrl || 'https://ymahanthreddy.app.n8n.cloud/webhook/due-reminders-digest',
    aiReconciliationUrl: config.n8n?.aiReconciliationUrl || 'https://ymahanthreddy.app.n8n.cloud/webhook/ai-bank-parse',
    enabled: config.n8n?.enabled ?? true,
    aiReconciliationEnabled: config.n8n?.aiReconciliationEnabled ?? true,
  }));
  const [safetyBufferRupees, setSafetyBufferRupees] = useState(
    paiseToRupees(config.safetyBufferPaise)
  );

  const [ladderForm, setLadderForm] = useState(() => {
    return (config.ladderStages || config.defaultLadderStages || [
      { id: 'heads_up', stageNumber: 1, triggerDays: -3, name: 'Friendly Heads-up', channel: 'whatsapp' },
      { id: 'due_date', stageNumber: 2, triggerDays: 0, name: 'Due Date Reminder', channel: 'whatsapp' },
      { id: 'firm_reminder', stageNumber: 3, triggerDays: 7, name: 'Firmer Reminder', channel: 'whatsapp' },
      { id: 'final_reminder', stageNumber: 4, triggerDays: 15, name: 'Final Reminder + Call', channel: 'whatsapp_and_call' },
      { id: 'demand_letter', stageNumber: 5, triggerDays: 30, name: 'Payment Demand Letter', channel: 'letter_and_email' },
      { id: 'next_steps', stageNumber: 6, triggerDays: 45, name: 'Legal Next Steps & MSME Samadhaan', channel: 'internal_guidance' },
    ]).map(s => ({ ...s }));
  });

  useEffect(() => {
    if (config.safetyBufferPaise) {
      setSafetyBufferRupees(paiseToRupees(config.safetyBufferPaise));
    }
    if (config.ladderStages) {
      setLadderForm(config.ladderStages.map(s => ({ ...s })));
    }
  }, [config]);

  const handleLadderStageChange = (idx, field, val) => {
    setLadderForm(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: field === 'triggerDays' ? Number(val) : val };
      return copy;
    });
  };

  const handleSaveLadderAndBuffer = (e) => {
    e.preventDefault();
    const bufferPaise = rupeesToPaise(Number(safetyBufferRupees) || 0);
    updateConfig({
      safetyBufferPaise: bufferPaise,
      ladderStages: ladderForm,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };
  const [testingN8n, setTestingN8n] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savedToast, setSavedToast] = useState(false);

  // Email Dispatch State
  const [resendApiKey, setResendApiKey] = useState(() => {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RESEND_API_KEY) ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('resend_api_key') || '' : '')
    );
  });
  const resolveInitialTestEmail = () => {
    const raw = business?.notificationEmail || business?.email || '';
    return raw.includes('kavachaccessories.in') ? '' : raw;
  };
  const [testRecipientEmail, setTestRecipientEmail] = useState(resolveInitialTestEmail);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState('');

  const handleSendTestEmail = async () => {
    const targetEmail = testRecipientEmail.trim() || resolveInitialTestEmail();
    if (!targetEmail || targetEmail.includes('kavachaccessories.in')) {
      setEmailTestResult('Error: Please enter a valid recipient email address (dummy/empty address prevented).');
      return;
    }
    setSendingTestEmail(true);
    setEmailTestResult(`Dispatching test invoice email to ${targetEmail}...`);
    try {
      if (resendApiKey.trim()) {
        try { localStorage.setItem('resend_api_key', resendApiKey.trim()); } catch (e) {}
      }

      const sampleInvoice = invoices[0] || {
        invoiceNumber: 'INV/26-27/0001',
        invoiceDate: '2026-10-23',
        dueDate: '2026-11-22',
        grandTotalPaise: 11800000,
        taxableTotalPaise: 10000000,
        cgstTotalPaise: 900000,
        sgstTotalPaise: 900000,
        items: [
          { description: '65W GaN Fast Charger', hsnSac: '8504', quantity: 10, unit: 'PCS', ratePaise: 65000, lineTotalPaise: 650000, gstRate: 18 }
        ]
      };

      const res = await dispatchInvoiceEmail({
        invoice: sampleInvoice,
        business,
        customer: customers[0],
        recipientEmail: targetEmail,
        webhookUrl: n8nForm.webhookUrl,
        emailWebhookUrl: config.n8n?.emailWebhookUrl || 'https://ymahanthreddy.app.n8n.cloud/webhook/kavach-email',
        resendApiKey: resendApiKey.trim() || undefined,
      });

      if (res.n8nSuccess || res.resendSuccess) {
        setEmailTestResult(`Success! Invoice email dispatched to ${targetEmail} (n8n: ${res.n8nSuccess ? '200 OK' : 'fallback'}, Resend: ${res.resendSuccess ? 'Delivered' : 'N/A'})`);
      } else {
        setEmailTestResult(`Dispatched webhook payload for ${targetEmail} to ${n8nForm.webhookUrl}`);
      }
    } catch (err) {
      setEmailTestResult(`Error: ${err.message}`);
    } finally {
      setSendingTestEmail(false);
    }
  };

  // 2-3 Hour Automated Due Reminders Digest State
  const resolveInitialDigestEmail = () => {
    const raw = dueDigestConfig?.recipientEmail || business?.notificationEmail || business?.email || '';
    return raw.includes('kavachaccessories.in') ? '' : raw;
  };
  const [digestEmail, setDigestEmail] = useState(resolveInitialDigestEmail);
  const [digestInterval, setDigestInterval] = useState(dueDigestConfig?.intervalHours || 3);
  const [sendingDigestNow, setSendingDigestNow] = useState(false);
  const [digestResult, setDigestResult] = useState('');
  const [copiedDigestWorkflow, setCopiedDigestWorkflow] = useState(false);

  const handleSaveDigestConfig = () => {
    updateDueDigestConfig({
      recipientEmail: digestEmail.trim(),
      intervalHours: Number(digestInterval),
      enabled: true,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleTriggerDigestNow = async () => {
    const target = digestEmail.trim() || resolveInitialDigestEmail();
    if (!target || target.includes('kavachaccessories.in')) {
      setDigestResult('Error: Please configure a valid receiving email address before triggering digest.');
      return;
    }
    setSendingDigestNow(true);
    setDigestResult(`Compiling due invoices and dispatching 2-3h digest to ${target}...`);
    try {
      const res = await sendDueRemindersDigestEmail(target);
      if (res.n8nSuccess || res.resendSuccess) {
        setDigestResult(`Success! All due reminders and cash digest sent to ${target} (n8n: ${res.n8nSuccess ? '200 OK' : 'fallback'}, Resend: ${res.resendSuccess ? 'Delivered' : 'N/A'})`);
      } else {
        setDigestResult(`Dispatched digest payload to n8n Webhook (${n8nForm.webhookUrl}) for ${target}`);
      }
    } catch (err) {
      setDigestResult(`Error: ${err.message}`);
    } finally {
      setSendingDigestNow(false);
    }
  };

  // Supabase state
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [pushingSupabase, setPushingSupabase] = useState(false);
  const [supabasePushResult, setSupabasePushResult] = useState(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    const res = await testSupabaseConnection();
    setSupabaseStatus(res);
    setTestingSupabase(false);
  };

  const handlePushSupabase = async () => {
    setPushingSupabase(true);
    const res = await pushFullStateToSupabase({
      business,
      customers,
      invoices,
      inboxClaims,
    });
    setSupabasePushResult(res);
    setPushingSupabase(false);
  };

  const handleCopySchema = () => {
    const sqlText = `-- Kavach Database Schema for Supabase
CREATE TABLE IF NOT EXISTS kavach_business (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  name TEXT NOT NULL,
  trade_name TEXT,
  gstin TEXT,
  state TEXT,
  state_code TEXT,
  phone TEXT,
  email TEXT,
  upi_id TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  turnover_paise BIGINT,
  is_udyam_registered BOOLEAN DEFAULT TRUE,
  udyam_number TEXT,
  data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kavach_customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trade_name TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  state_code TEXT,
  gstin TEXT,
  is_registered BOOLEAN DEFAULT TRUE,
  credit_days INT DEFAULT 30,
  avg_days_late INT DEFAULT 0,
  on_time_rate INT DEFAULT 90,
  reliability_grade TEXT DEFAULT 'A',
  reliability_reason TEXT,
  outstanding_paise BIGINT DEFAULT 0,
  data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kavach_invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  customer_id TEXT NOT NULL REFERENCES kavach_customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_gstin TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  grand_total_paise BIGINT NOT NULL,
  amount_paid_paise BIGINT DEFAULT 0,
  balance_due_paise BIGINT NOT NULL,
  token TEXT UNIQUE,
  ladder_paused BOOLEAN DEFAULT FALSE,
  last_ladder_stage_sent INT,
  data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kavach_inbox_claims (
  id TEXT PRIMARY KEY,
  invoice_id TEXT REFERENCES kavach_invoices(id) ON DELETE SET NULL,
  invoice_number TEXT,
  customer_id TEXT,
  customer_name TEXT,
  claim_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  reference_number TEXT,
  amount_paise BIGINT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE kavach_business ENABLE ROW LEVEL SECURITY;
ALTER TABLE kavach_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE kavach_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE kavach_inbox_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on kavach_business" ON kavach_business FOR SELECT USING (true);
CREATE POLICY "Allow public write on kavach_business" ON kavach_business FOR ALL USING (true);

CREATE POLICY "Allow public read on kavach_customers" ON kavach_customers FOR SELECT USING (true);
CREATE POLICY "Allow public write on kavach_customers" ON kavach_customers FOR ALL USING (true);

CREATE POLICY "Allow public read on kavach_invoices" ON kavach_invoices FOR SELECT USING (true);
CREATE POLICY "Allow public write on kavach_invoices" ON kavach_invoices FOR ALL USING (true);

CREATE POLICY "Allow public read on kavach_inbox_claims" ON kavach_inbox_claims FOR SELECT USING (true);
CREATE POLICY "Allow public write on kavach_inbox_claims" ON kavach_inbox_claims FOR ALL USING (true);`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleBusinessChange = (field, value) => {
    setBusinessForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    updateBusiness(businessForm);
    updateN8nConfig(n8nForm);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleTestN8n = async () => {
    setTestingN8n(true);
    const res = await testN8n();
    setTestResult(res);
    setTestingN8n(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to default initial state?')) {
      resetDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Settings & System Configuration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure business GST profile, n8n automation webhook endpoints, demo date, and credit buffers
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/20 cursor-pointer self-start sm:self-auto min-h-[44px] transition-all"
        >
          {savedToast ? <Check className="w-5 h-5 text-emerald-300" /> : <Save className="w-5 h-5" />}
          <span>{savedToast ? 'Settings Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      {savedToast && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>All settings and business profile successfully persisted to localStorage.</span>
        </div>
      )}

      {/* 1. Demo Date & Time Machine */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">
            Demo Date Simulation Controller
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Move &quot;today&quot; forward to watch invoices mature, escalation ladders trigger new stages, and the 13-week forecast roll forward in real time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Simulated Date (IST)
            </label>
            <input
              type="date"
              value={demoDate}
              onChange={(e) => setDemoDate(e.target.value)}
              className="px-3.5 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-sm font-bold font-mono text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-5">
            <button
              type="button"
              onClick={() => advanceDemoDays(1)}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              +1 Day
            </button>
            <button
              type="button"
              onClick={() => advanceDemoDays(7)}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              +7 Days (1 Week)
            </button>
            <button
              type="button"
              onClick={() => advanceDemoDays(15)}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              +15 Days
            </button>
          </div>
        </div>
      </div>

      {/* 2. Escalation Ladder & Safety Cash Buffer */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Escalation Ladder & Safety Buffer Configuration
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
            Editable Rules • Auto-Pauses on Dispute
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Configure the liquid cash reserve threshold (triggers 13-week cash shortfall warning) and customize trigger days for the 6-stage payment recovery ladder. The ladder automatically pauses whenever a buyer promises payment or logs an invoice dispute.
        </p>

        {/* Safety Cash Buffer */}
        <div className="p-4 bg-[#090d16] border border-white/[0.08] rounded-xl">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Safety Cash Reserve Buffer (in Rupees)
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={safetyBufferRupees}
                onChange={(e) => setSafetyBufferRupees(e.target.value)}
                placeholder="200000"
                className="w-full pl-8 pr-3.5 py-2 bg-[#0d1322] border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              = <strong className="text-white font-mono">{formatPaise(rupeesToPaise(Number(safetyBufferRupees) || 0))}</strong>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            When weekly projected cash dips below this reserve, the 13-Week Cash Forecast alerts you and flags invoices to close the gap.
          </p>
        </div>

        {/* Escalation Ladder Stages */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Escalation Ladder Stages (Days Relative to Due Date)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ladderForm.map((stage, idx) => (
              <div
                key={stage.id || idx}
                className="p-3.5 bg-[#090d16] border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-black text-indigo-400">
                    STAGE {stage.stageNumber || idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    {stage.triggerDays < 0
                      ? `${Math.abs(stage.triggerDays)}d Pre-Due`
                      : stage.triggerDays === 0
                      ? 'On Due Date'
                      : `+${stage.triggerDays}d Overdue`}
                  </span>
                </div>
                <input
                  type="text"
                  value={stage.name}
                  onChange={(e) => handleLadderStageChange(idx, 'name', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0d1322] border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-hidden focus:border-indigo-500"
                  placeholder="Stage title"
                />
                <div className="flex items-center justify-between gap-2 pt-1">
                  <label className="text-[11px] text-slate-400">Trigger Days:</label>
                  <input
                    type="number"
                    value={stage.triggerDays}
                    onChange={(e) => handleLadderStageChange(idx, 'triggerDays', e.target.value)}
                    className="w-20 px-2.5 py-1 bg-[#0d1322] border border-slate-700 rounded-lg text-xs font-mono font-bold text-white text-right focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Ladder & Buffer Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveLadderAndBuffer}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 border border-indigo-400/20 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Ladder & Safety Buffer</span>
          </button>
        </div>
      </div>

      {/* 3. n8n Automation Engine Settings */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              n8n Automation Layer Integration
            </h2>
          </div>
          <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
            n8nStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {n8nStatus === 'connected' ? 'Webhook Live' : 'Fallback Active'}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The app dispatches JSON payloads to n8n when an invoice reaches Overdue status (Stage 3/4) or when a Demand Letter is generated. If endpoints are disconnected, it seamlessly uses local browser calculations and wa.me links.
        </p>

        <div className="space-y-3.5">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                n8n Webhook Trigger URL
              </label>
              <span className="text-[11px] text-slate-500">Leave blank for local offline mode</span>
            </div>
            <input
              type="text"
              value={n8nForm.webhookUrl}
              onChange={(e) => setN8nForm({ ...n8nForm, webhookUrl: e.target.value })}
              placeholder="e.g. http://localhost:5678/webhook/kavach-alerts (or your hosted n8n URL)"
              className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                n8n AI Reconciliation Endpoint URL
              </label>
              <span className="text-[11px] text-slate-500">Optional</span>
            </div>
            <input
              type="text"
              value={n8nForm.aiReconciliationUrl}
              onChange={(e) => setN8nForm({ ...n8nForm, aiReconciliationUrl: e.target.value })}
              placeholder="e.g. http://localhost:5678/webhook/ai-bank-parse"
              className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>n8n 2-3h Due Reminders Digest Webhook URL</span>
              </label>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">Active</span>
            </div>
            <input
              type="text"
              value={n8nForm.dueDigestWebhookUrl}
              onChange={(e) => setN8nForm({ ...n8nForm, dueDigestWebhookUrl: e.target.value })}
              placeholder="https://ymahanthreddy.app.n8n.cloud/webhook/due-reminders-digest"
              className="w-full px-3.5 py-2.5 bg-[#090d16] border border-cyan-500/40 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={n8nForm.aiReconciliationEnabled}
                onChange={(e) =>
                  setN8nForm({ ...n8nForm, aiReconciliationEnabled: e.target.checked })
                }
                className="rounded text-indigo-500 focus:ring-indigo-500 w-4 h-4 bg-[#090d16] border-slate-700"
              />
              <span>Enable Automated AI Reconciliation via n8n</span>
            </label>

            <button
              type="button"
              onClick={handleTestN8n}
              disabled={testingN8n}
              className="px-4 py-2 bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
            >
              {testingN8n ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {testResult && (
            <div className="p-3 bg-[#090d16] rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-slate-300">Test Result: </span>
              <span className="text-slate-400">{testResult.message || testResult.warning}</span>
            </div>
          )}

          {/* Dedicated Invoice Email Dispatcher Card */}
          <div className="pt-4 border-t border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">Automated Invoice Email Dispatch</span>
              </div>
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                Customizable Recipient
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              When an invoice is created, it dispatches an email payload containing complete HTML and plain-text invoice data to the customer's verified email or your configured business notification address.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  placeholder="Test Email Recipient (e.g. accounts@yourcompany.com)"
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="w-full sm:w-56">
                <input
                  type="password"
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder="Resend API Key (Optional)"
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTestEmail}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md border border-indigo-400/20 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{sendingTestEmail ? 'Sending...' : 'Send Live Test Email'}</span>
              </button>
            </div>

            {emailTestResult && (
              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/30 text-xs text-indigo-200">
                <strong>Status:</strong> {emailTestResult}
              </div>
            )}
          </div>

          {/* Dedicated 2-3 Hour Consolidated Business Due Digest Engine */}
          <div className="pt-5 border-t border-white/[0.08] space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">
                  Recurring Due Reminders & Business Digest (Every 2-3 Hours)
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full self-start sm:self-auto font-semibold">
                n8n Cron + Live Webhook
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Consolidates all overdue customer balances, statutory 19.5% MSMED interest, and pending reminder queue items into <strong>one single executive email</strong> sent directly to the business every 2-3 hours.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Business Recipient Email
                </label>
                <input
                  type="email"
                  value={digestEmail}
                  onChange={(e) => setDigestEmail(e.target.value)}
                  placeholder="e.g. accounts@yourcompany.com or yourname@gmail.com"
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Dispatch Interval
                </label>
                <select
                  value={digestInterval}
                  onChange={(e) => setDigestInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-hidden focus:border-cyan-500"
                >
                  <option value={2}>Every 2 Hours (Active)</option>
                  <option value={3}>Every 3 Hours (Recommended)</option>
                  <option value={4}>Every 4 Hours</option>
                </select>
              </div>

              <div className="sm:col-span-4 flex items-end gap-2 pt-4 sm:pt-0">
                <button
                  type="button"
                  onClick={handleSaveDigestConfig}
                  className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-colors cursor-pointer"
                >
                  Save Schedule
                </button>
                <button
                  type="button"
                  onClick={handleTriggerDigestNow}
                  disabled={sendingDigestNow}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md border border-cyan-400/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingDigestNow ? 'Dispatching...' : 'Send Digest Now'}</span>
                </button>
              </div>
            </div>

            {digestResult && (
              <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30 text-xs text-cyan-200">
                <strong>Status:</strong> {digestResult}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Supabase Cloud Database */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Supabase Cloud Database & Persistence
            </h2>
          </div>
          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Connected Project
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          DueMitra connects directly to your live Supabase cloud project (<span className="font-mono text-indigo-400">oigyyzbpfsbbuoctkwjy</span>) to synchronize invoices, dealer records, and claims.
        </p>

        <div className="space-y-3 bg-[#090d16]/90 p-4 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="font-semibold text-slate-400 block mb-1">Project Endpoint URL:</span>
            <code className="text-[11px] font-mono text-indigo-300 bg-black/40 px-3 py-1.5 rounded-lg border border-slate-800 block truncate">
              https://oigyyzbpfsbbuoctkwjy.supabase.co
            </code>
          </div>

          <div>
            <span className="font-semibold text-slate-400 block mb-1">Publishable Key:</span>
            <code className="text-[11px] font-mono text-slate-300 bg-black/40 px-3 py-1.5 rounded-lg border border-slate-800 block truncate">
              sb_publishable_W8DZaG4-o9YLF6t4k5meYw_3J3DN8Ke
            </code>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={testingSupabase}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>{testingSupabase ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handlePushSupabase}
              disabled={pushingSupabase}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{pushingSupabase ? 'Pushing Data...' : 'Push All Data to Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySchema}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl cursor-pointer transition-colors"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedSchema ? 'SQL Schema Copied!' : 'Copy SQL Schema (schema.sql)'}</span>
            </button>
          </div>

          {supabaseStatus && (
            <div className={`p-3 rounded-xl border text-xs ${
              supabaseStatus.connected ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            }`}>
              <strong>Status: </strong>
              <span>{supabaseStatus.message || supabaseStatus.error}</span>
            </div>
          )}

          {supabasePushResult && (
            <div className="p-3 rounded-xl border bg-[#0f172a] border-slate-700 text-xs space-y-1">
              <span className="font-bold text-white block">Supabase Sync Results:</span>
              <p className="text-emerald-400 font-semibold">
                ✓ Business: {supabasePushResult.business ? 'Synced' : 'Pending'} | Customers: {supabasePushResult.customers} | Invoices: {supabasePushResult.invoices} | Claims: {supabasePushResult.claims}
              </p>
              {supabasePushResult.errors.length > 0 && (
                <div className="text-amber-300 text-[11px] bg-amber-950/40 p-2 rounded-lg border border-amber-500/30 mt-1">
                  <strong>Notice: </strong>
                  Run the SQL Schema in your Supabase SQL Editor once so tables are created.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Business Profile Settings */}
      <form onSubmit={handleSaveAll} className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
          <Building className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">
            Business Profile & Tax Registration
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Business Legal Name
            </label>
            <input
              type="text"
              value={businessForm.name}
              onChange={(e) => handleBusinessChange('name', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              GSTIN (Verified Modulo 36)
            </label>
            <input
              type="text"
              value={businessForm.gstin}
              onChange={(e) => handleBusinessChange('gstin', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-sm font-mono uppercase text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              GST Registration Type
            </label>
            <select
              value={businessForm.registrationType}
              onChange={(e) => handleBusinessChange('registrationType', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden"
            >
              <option value="regular">Regular GST Registered (Issues Tax Invoice)</option>
              <option value="composition">Composition Scheme (Issues Bill of Supply)</option>
              <option value="unregistered">Unregistered Business (Plain Invoice)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Annual Turnover (₹)
            </label>
            <input
              type="number"
              value={paiseToRupees(businessForm.turnoverPaise)}
              onChange={(e) =>
                handleBusinessChange('turnoverPaise', rupeesToPaise(e.target.value))
              }
              className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-hidden focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Threshold for mandatory IRN e-invoicing is ₹5 Crore.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Registered Street Address
            </label>
            <input
              type="text"
              value={businessForm.address}
              onChange={(e) => handleBusinessChange('address', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              City, State & Pincode
            </label>
            <input
              type="text"
              value={`${businessForm.city}, ${businessForm.state} - ${businessForm.pincode}`}
              disabled
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              UPI VPA / ID
            </label>
            <input
              type="text"
              value={businessForm.upiId}
              onChange={(e) => handleBusinessChange('upiId', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Bank A/C Number (HDFC)
            </label>
            <input
              type="text"
              value={businessForm.accountNumber}
              onChange={(e) => handleBusinessChange('accountNumber', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#090d16] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                Udyam MSME Registration (MSMED Act, 2006)
              </span>
              <span className="text-[11px] text-slate-400">
                Number: {businessForm.udyamNumber} ({businessForm.enterpriseType} Enterprise)
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={businessForm.isUdyamRegistered}
                onChange={(e) => handleBusinessChange('isUdyamRegistered', e.target.checked)}
                className="rounded text-indigo-500 focus:ring-indigo-500 w-4 h-4 bg-[#090d16] border-slate-700"
              />
              <span className="text-xs font-semibold text-slate-300">Udyam Registered</span>
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.08] flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer min-h-[44px] transition-all"
          >
            Save Business Profile
          </button>
        </div>
      </form>

      {/* 5. Daily 10:00 AM IST Automated Reminders Engine Settings */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Daily 10:00 AM IST Auto-Reminders Daemon
              </h2>
              <p className="text-xs text-slate-400">
                Configure automated background reminder dispatches without opening owner applications
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
            10:00 IST Active
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#090d16] rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-white block">Enable Automated Daily Reminder Job</span>
              <p className="text-[11px] text-slate-400">Runs daily at 10:00 AM IST and delivers reminders due on that day</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoReminderSettings?.enabled ?? true}
                onChange={(e) => updateAutoReminderSettings({ enabled: e.target.checked })}
                className="rounded text-indigo-500 focus:ring-indigo-500 w-4 h-4 bg-[#0f172a] border-slate-700"
              />
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Select Escalation Stages to Auto-Send:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 bg-[#090d16] rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(autoReminderSettings?.stages || [1, 2]).includes(1)}
                  onChange={(e) => {
                    const prev = autoReminderSettings?.stages || [1, 2];
                    const next = e.target.checked ? [...new Set([...prev, 1])] : prev.filter((s) => s !== 1);
                    updateAutoReminderSettings({ stages: next });
                  }}
                  className="rounded text-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white block">Stage 1: Friendly Heads-up (-3 Days)</span>
                  <span className="text-[10px] text-slate-400">Polite reminder with UPI quick link</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-[#090d16] rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(autoReminderSettings?.stages || [1, 2]).includes(2)}
                  onChange={(e) => {
                    const prev = autoReminderSettings?.stages || [1, 2];
                    const next = e.target.checked ? [...new Set([...prev, 2])] : prev.filter((s) => s !== 2);
                    updateAutoReminderSettings({ stages: next });
                  }}
                  className="rounded text-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white block">Stage 2: Due Date Reminder (0 Days)</span>
                  <span className="text-[10px] text-slate-400">Due today payment notice</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-[#090d16] rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(autoReminderSettings?.stages || [1, 2]).includes(3)}
                  onChange={(e) => {
                    const prev = autoReminderSettings?.stages || [1, 2];
                    const next = e.target.checked ? [...new Set([...prev, 3])] : prev.filter((s) => s !== 3);
                    updateAutoReminderSettings({ stages: next });
                  }}
                  className="rounded text-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white block">Stage 3: Firmer Reminder (+7 Days Overdue)</span>
                  <span className="text-[10px] text-slate-400">Inventory restocking cash impact</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-[#090d16] rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(autoReminderSettings?.stages || [1, 2]).includes(4)}
                  onChange={(e) => {
                    const prev = autoReminderSettings?.stages || [1, 2];
                    const next = e.target.checked ? [...new Set([...prev, 4])] : prev.filter((s) => s !== 4);
                    updateAutoReminderSettings({ stages: next });
                  }}
                  className="rounded text-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white block">Stage 4: Urgent Notice (+15 Days Overdue)</span>
                  <span className="text-[10px] text-slate-400">Credit term pause advisory</span>
                </div>
              </label>
            </div>

            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center justify-between">
              <div>
                <strong className="text-slate-300">Stages 5 & 6 (Payment Demand Letters): </strong>
                <span>Strictly Manual Only. Demand letters require explicit owner review and are never sent automatically.</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30 uppercase">
                Manual Lock
              </span>
            </div>
          </div>

          {/* Test Mode Configuration */}
          <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-200 block">🧪 Test Mode (Safeguard)</span>
                <span className="text-[11px] text-amber-300/80">Sends all automated reminders to the owner&apos;s email address instead of real customers</span>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoReminderSettings?.testMode ?? false}
                  onChange={(e) => updateAutoReminderSettings({ testMode: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 bg-[#090d16] border-amber-500/50"
                />
              </label>
            </div>

            {autoReminderSettings?.testMode && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-amber-200 mb-1">
                  Owner Test Delivery Email Address:
                </label>
                <input
                  type="email"
                  value={autoReminderSettings?.testEmail && !autoReminderSettings.testEmail.includes('kavachaccessories.in') ? autoReminderSettings.testEmail : ''}
                  onChange={(e) => updateAutoReminderSettings({ testEmail: e.target.value })}
                  placeholder="e.g. owner@gmail.com"
                  className="w-full px-3 py-1.5 bg-[#090d16] border border-amber-500/40 rounded-lg text-xs font-mono text-white focus:outline-hidden"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Display, Language & Reset Demo */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">
            Language, Bilingual Headings & Accessibility
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Application Language (Native Script)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिंदी' },
                { code: 'mr', label: 'मराठी' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    lang === item.code
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Bilingual Headings Setting
            </label>
            <label className="flex items-center gap-2.5 p-2 bg-[#090d16] rounded-xl border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReminderSettings?.bilingualMarathi ?? false}
                onChange={(e) => updateAutoReminderSettings({ bilingualMarathi: e.target.checked })}
                className="rounded text-indigo-500 w-4 h-4"
              />
              <span className="text-xs text-slate-300 leading-tight">
                Add Marathi sub-headings under Tax Invoices & Demand Letters (द्विभाषिक / Bilingual)
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Text Size (Accessibility)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  fontSize === 'normal'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                Normal (16px)
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  fontSize === 'large'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                Large (18px)
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-white block">Reset Demo State</span>
            <span className="text-[11px] text-slate-400">
              Clear local storage and restore all initial 40 invoices, 12 customers, and shop expenses.
            </span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 border border-rose-400/20 cursor-pointer min-h-[44px] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* SaaS Business Registration Modal */}
      <RegisterBusinessModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
}
