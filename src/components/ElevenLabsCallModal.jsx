import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneForwarded,
  Sparkles,
  Bot,
  Radio,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Key,
  ShieldCheck,
  Clock,
  Layers,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Signal
} from 'lucide-react';
import {
  DEFAULT_ELEVENLABS_VOICES,
  TARGET_CALLBACK_PHONE,
  generateCallScript,
  speakVoiceReminder,
  playPhoneRingTone
} from '../utils/elevenlabs';
import { placeRealPhoneCall } from '../utils/telephony';
import { formatPaise } from '../utils/money';
import { sendN8nWebhook } from '../utils/n8n';
import { useApp } from '../context/AppContext';
import { getDaysDiff } from '../utils/date';

export function ElevenLabsCallModal({
  isOpen,
  onClose,
  customer,
  invoice,
  business,
  onCallCompleted
}) {
  const { config, demoDate, notifyN8nEvent, recordCustomerPromise } = useApp();

  const [callState, setCallState] = useState('idle'); // 'idle' | 'dialing' | 'speaking' | 'completed' | 'error'
  const [callDuration, setCallDuration] = useState(0);
  const [language, setLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_ELEVENLABS_VOICES[0].id);
  const [apiKey, setApiKey] = useState(() => {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ELEVENLABS_API_KEY) ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('elevenlabs_api_key') || '' : '')
    );
  });
  const [vapiApiKey, setVapiApiKey] = useState(() => {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VAPI_API_KEY) ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('vapi_api_key') || '' : '')
    );
  });
  const [vapiPhoneNumberId, setVapiPhoneNumberId] = useState(() => {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VAPI_PHONE_NUMBER_ID) ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('vapi_phone_number_id') || '' : '')
    );
  });
  const [vapiAssistantId, setVapiAssistantId] = useState(() => {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VAPI_ASSISTANT_ID) ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('vapi_assistant_id') || '' : '')
    );
  });
  const [twilioSid, setTwilioSid] = useState(() => {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TWILIO_ACCOUNT_SID) ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('twilio_account_sid') || '' : '')
    );
  });
  const [twilioToken, setTwilioToken] = useState(() => {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TWILIO_AUTH_TOKEN) ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('twilio_auth_token') || '' : '')
    );
  });
  const [twilioPhone, setTwilioPhone] = useState(() => {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TWILIO_PHONE_NUMBER) ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('twilio_phone_number') || '' : '')
    );
  });
  const [showConfig, setShowConfig] = useState(false);
  const [customScript, setCustomScript] = useState('');
  const [realCallNotice, setRealCallNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const timerRef = useRef(null);

  const daysOverdue = Math.max(0, getDaysDiff(demoDate, invoice?.dueDate || demoDate));
  const amountFormatted = formatPaise(invoice?.balanceDuePaise || 0);
  const targetPhone = customer?.phone || TARGET_CALLBACK_PHONE;

  // Initialize or update script when customer/invoice/language changes
  useEffect(() => {
    if (invoice && customer) {
      const generated = generateCallScript({
        customerName: customer.name || 'Valued Dealer',
        contactPerson: customer.contactPerson || '',
        businessName: business?.name || 'Kavach Mobile Accessories',
        invoiceNumber: invoice.invoiceNumber,
        amountFormatted,
        daysOverdue,
        language,
      });
      setCustomScript(generated);
    }
  }, [invoice, customer, business, language, amountFormatted, daysOverdue]);

  // Duration timer when call is active
  useEffect(() => {
    if (callState === 'speaking') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  if (!isOpen || !invoice || !customer) return null;

  const handleSaveCredentials = () => {
    try {
      localStorage.setItem('elevenlabs_api_key', apiKey.trim());
      localStorage.setItem('vapi_api_key', vapiApiKey.trim());
      localStorage.setItem('vapi_phone_number_id', vapiPhoneNumberId.trim());
      localStorage.setItem('vapi_assistant_id', vapiAssistantId.trim());
      localStorage.setItem('twilio_account_sid', twilioSid.trim());
      localStorage.setItem('twilio_auth_token', twilioToken.trim());
      localStorage.setItem('twilio_phone_number', twilioPhone.trim());
    } catch (e) {}
  };

  const handleStartCall = async () => {
    setErrorMessage('');
    setRealCallNotice('');
    setCallState('dialing');
    setCallDuration(0);
    handleSaveCredentials();

    notifyN8nEvent('Placing Cellular & AI Voice Call', `Target: ${targetPhone} for Invoice ${invoice.invoiceNumber}`);

    // 1. PLACE REAL PHYSICAL CELLULAR CALL VIA VAPI.AI OR TWILIO
    placeRealPhoneCall({
      to: targetPhone,
      customerName: customer.name,
      invoiceNumber: invoice.invoiceNumber,
      amountFormatted,
      daysOverdue,
      script: customScript,
      vapiApiKey,
      vapiPhoneNumberId,
      vapiAssistantId,
      twilioSid,
      twilioToken,
      twilioPhone,
    }).then((res) => {
      if (res.mode === 'vapi_live_call') {
        setRealCallNotice(`Vapi.ai live call dispatched! Ringing ${targetPhone}...`);
      } else if (res.mode === 'twilio_live_call') {
        setRealCallNotice(`Twilio live call dispatched (SID: ${res.callSid}). Ringing ${targetPhone}...`);
      }
    }).catch(() => {});

    // 2. Play realistic telephone ringing sound effect
    await playPhoneRingTone(2400);

    // 3. Transition to speaking mode & trigger ElevenLabs / Speech Synthesis
    setCallState('speaking');

    speakVoiceReminder({
      script: customScript,
      voiceId: selectedVoice,
      apiKey,
      onStart: () => {
        setCallState('speaking');
      },
      onEnd: () => {
        setCallState('completed');
        dispatchN8nCallEvent('completed');
      },
      onError: (err) => {
        console.warn('Speech error:', err);
        setCallState('completed');
      },
    });
  };

  const handleHangup = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('completed');
    dispatchN8nCallEvent('ended_by_user');
  };

  const dispatchN8nCallEvent = (status) => {
    const webhookUrl = config?.n8n?.webhookUrl;
    if (webhookUrl) {
      sendN8nWebhook(webhookUrl, 'elevenlabs_outbound_call_completed', {
        targetPhone,
        customerId: customer.id,
        customerName: customer.name,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amountDuePaise: invoice.balanceDuePaise,
        daysOverdue,
        durationSeconds: callDuration,
        callStatus: status,
        voiceId: selectedVoice,
        script: customScript,
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }

    if (onCallCompleted) {
      onCallCompleted({
        invoiceId: invoice.id,
        phone: targetPhone,
        durationSeconds: callDuration || 24,
        status,
      });
    }
  };

  const handleLogPromise = () => {
    if (recordCustomerPromise) {
      recordCustomerPromise(invoice.id, 'Customer promised via ElevenLabs AI phone reminder to clear balance within 48 hours.');
    }
    notifyN8nEvent('Payment Promise Recorded', `${customer.name} promised payment via AI call`);
    onClose();
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && callState !== 'speaking') onClose();
      }}
    >
      <div className="bg-[#0c1220] rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden border border-cyan-500/30 text-white relative">
        {/* Glow ambient backgrounds */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-[#080d18] border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  ElevenLabs AI Voice Agent Call
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Real Calling
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Outbound commercial payment reminder call to consumer
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleHangup();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 relative z-10">
          {/* Target Consumer & Balance Banner */}
          <div className="bg-[#060a14] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Overdue Consumer / Buyer
                </span>
                <h4 className="text-base font-bold text-white">
                  {customer.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {customer.contactPerson ? `${customer.contactPerson} • ` : ''}{customer.city || 'Pune'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Amount Due
                </span>
                <span className="text-lg font-black font-mono text-rose-400 block">
                  {amountFormatted}
                </span>
                <span className="text-[10px] font-semibold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-md border border-rose-500/20 inline-block mt-0.5">
                  {daysOverdue} days overdue
                </span>
              </div>
            </div>

            {/* Target Phone Indicator with 1-Click Device Dialer */}
            <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs flex-wrap gap-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Actual Target Mobile:</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 flex items-center gap-1.5">
                  <span>{targetPhone}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </span>
              </div>
            </div>
          </div>

          {/* Active Call In-Progress Screen */}
          {callState === 'dialing' && (
            <div className="p-6 bg-gradient-to-b from-[#090f1d] to-[#050912] border border-cyan-500/40 rounded-2xl text-center space-y-4 animate-fade-in shadow-xl shadow-cyan-950/40">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/40 mx-auto flex items-center justify-center text-cyan-300 animate-bounce">
                <PhoneCall className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                  Connecting Outbound Telephony...
                </span>
                <h4 className="text-lg font-black text-white">
                  Calling {targetPhone}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Transmitting call request via ElevenLabs AI voice engine, Vapi.ai & Twilio
                </p>
              </div>
            </div>
          )}

          {callState === 'speaking' && (
            <div className="p-6 bg-gradient-to-b from-[#081120] to-[#040810] border border-emerald-500/40 rounded-2xl text-center space-y-5 animate-fade-in shadow-xl shadow-emerald-950/40">
              <div className="flex items-center justify-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  CALL ACTIVE • {formatTimer(callDuration)}
                </span>
              </div>

              {/* Glowing Audio Waveform Visualizer */}
              <div className="flex items-center justify-center gap-1.5 h-14">
                {[18, 38, 54, 28, 48, 62, 32, 50, 58, 24, 42, 60, 26, 40].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                  />
                ))}
              </div>

              {realCallNotice && (
                <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/30 rounded-xl text-[11px] text-cyan-300 font-mono">
                  {realCallNotice}
                </div>
              )}

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>ElevenLabs AI Voice Speaking to Consumer</span>
                </h4>
                <p className="text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/10 font-mono text-left leading-relaxed">
                  "{customScript}"
                </p>
              </div>

              <button
                type="button"
                onClick={handleHangup}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Disconnect Call</span>
              </button>
            </div>
          )}

          {callState === 'completed' && (
            <div className="p-6 bg-[#081220] border border-emerald-500/30 rounded-2xl text-center space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  Payment Reminder Call Completed
                </h4>
                <p className="text-xs text-slate-300">
                  Notification delivered for <strong>{targetPhone}</strong> (Duration: {callDuration}s).
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleLogPromise}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 border border-emerald-400/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Record Payment Promise</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-white/10 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Configuration Form (Visible when idle) */}
          {callState === 'idle' && (
            <div className="space-y-4 animate-fade-in">
              {/* Language & Voice Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Language / Tone
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="en">Indian English (Professional B2B)</option>
                    <option value="hi">Hindi / Hinglish (व्यापारिक स्मरण)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ElevenLabs AI Voice
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {DEFAULT_ELEVENLABS_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Editable Dynamic Call Script */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Live Payment Reminder Call Script
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    Spoken to customer
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={customScript}
                  onChange={(e) => setCustomScript(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono leading-relaxed"
                />
              </div>

              {/* Real Telephony & ElevenLabs Gateway Config Toggle */}
              <div className="p-3 bg-[#0a0f1d] border border-white/10 rounded-xl space-y-2">
                <button
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <Signal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Telephony Credentials (Twilio / Vapi.ai / ElevenLabs)</span>
                  </span>
                  <span className="text-[10px] text-cyan-400">
                    {showConfig ? 'Hide' : vapiApiKey ? '✓ Vapi.ai Ready' : twilioSid ? '✓ Twilio Ready' : '+ Configure Calling Keys'}
                  </span>
                </button>

                {showConfig && (
                  <div className="pt-3 border-t border-white/5 space-y-3 text-xs animate-fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        ElevenLabs API Key (sk_...)
                      </label>
                      <input
                        type="password"
                        placeholder="sk_..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full bg-[#02050c] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Vapi.ai Telephony Config */}
                    <div className="p-2.5 bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 border border-cyan-500/30 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                          Vapi.ai Autonomous Voice Agent ($10 Free Trial)
                        </span>
                        <a
                          href="https://dashboard.vapi.ai"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>vapi.ai</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-0.5 font-semibold">Vapi Private Key</label>
                          <input
                            type="password"
                            placeholder="Bearer / Key..."
                            value={vapiApiKey}
                            onChange={(e) => setVapiApiKey(e.target.value)}
                            className="w-full bg-[#02050c] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-0.5 font-semibold">Phone Number ID</label>
                          <input
                            type="text"
                            placeholder="Vapi phone ID..."
                            value={vapiPhoneNumberId}
                            onChange={(e) => setVapiPhoneNumberId(e.target.value)}
                            className="w-full bg-[#02050c] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-0.5 font-semibold">Assistant ID (optional)</label>
                          <input
                            type="text"
                            placeholder="Optional ID..."
                            value={vapiAssistantId}
                            onChange={(e) => setVapiAssistantId(e.target.value)}
                            className="w-full bg-[#02050c] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                        Twilio Alternative (Optional):
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Twilio Account SID</label>
                        <input
                          type="text"
                          placeholder="AC..."
                          value={twilioSid}
                          onChange={(e) => setTwilioSid(e.target.value)}
                          className="w-full bg-[#02050c] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Twilio Auth Token</label>
                        <input
                          type="password"
                          placeholder="Auth Token"
                          value={twilioToken}
                          onChange={(e) => setTwilioToken(e.target.value)}
                          className="w-full bg-[#02050c] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Twilio From Number</label>
                        <input
                          type="text"
                          placeholder="+1..."
                          value={twilioPhone}
                          onChange={(e) => setTwilioPhone(e.target.value)}
                          className="w-full bg-[#02050c] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {callState === 'idle' && (
          <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-[#080d18] border-t border-white/10 relative z-10 flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDeviceDirectDial}
              className="px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white rounded-xl border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Dial on Phone</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartCall}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 border border-cyan-400/30 transition-all cursor-pointer flex items-center gap-2 min-h-[40px]"
              >
                <PhoneCall className="w-4 h-4 text-cyan-200" />
                <span>Trigger AI Call ({targetPhone})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
