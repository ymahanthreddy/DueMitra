import React, { useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function N8nStatusBadge() {
  const { n8nStatus, config, testN8n } = useApp();
  const [testing, setTesting] = useState(false);

  const handleTest = async (e) => {
    e.stopPropagation();
    setTesting(true);
    await testN8n();
    setTesting(false);
  };

  const isConnected = n8nStatus === 'connected';

  return (
    <div className="relative group inline-block">
      <button
        onClick={handleTest}
        title="Click to ping n8n webhook"
        aria-label="n8n webhook connectivity status"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
          isConnected
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isConnected ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </span>

        <span className="hidden sm:inline">
          {testing
            ? 'Testing n8n...'
            : isConnected
            ? 'n8n Connected'
            : 'Local Fallback'}
        </span>
        <span className="sm:hidden">
          {isConnected ? 'n8n: Connected' : 'n8n: Local'}
        </span>

        <RefreshCw className={`w-3 h-3 text-slate-400 ${testing ? 'animate-spin' : ''}`} />
      </button>

      {/* Tooltip on hover */}
      <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-72 p-3.5 bg-[#0f172a] text-slate-200 text-xs rounded-xl shadow-2xl z-50 border border-slate-700/80 backdrop-blur-md">
        <p className="font-bold text-white mb-1 flex items-center gap-1.5">
          {isConnected ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
          <span>n8n Automation Engine</span>
        </p>
        <p className="text-slate-400 text-xs mb-2 leading-relaxed">
          {isConnected
            ? `Dispatches JSON alerts on Demand Letters & disputes to: ${config.n8n.webhookUrl}`
            : 'Using local browser simulation. Invoices & demand letters generate instantly offline.'}
        </p>
        <p className="text-[11px] text-indigo-400 border-t border-slate-800 pt-2 font-mono">
          Daily Cron: 9:00 AM IST (Automated Digest)
        </p>
      </div>
    </div>
  );
}
