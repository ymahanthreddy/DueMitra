import React, { useState } from 'react';
import {
  X,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Send,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { formatIndianDate } from '../utils/date';

export function WhatsAppSimulatorModal({ item, onClose, onSimulateDealerReply }) {
  const [dealerReplyText, setDealerReplyText] = useState('');
  const [repliedMessages, setRepliedMessages] = useState([]);

  if (!item) return null;

  const cleanPhone = (item.customer?.phone || item.invoice.customerPhone || '+91 98221 44556');
  const payUrl = `${window.location.origin}/pay/${item.invoice.token || item.invoice.id}`;

  const handleSendDealerReply = (text) => {
    const reply = text || dealerReplyText;
    if (!reply) return;

    setRepliedMessages([...repliedMessages, { text: reply, time: 'Just now' }]);
    setDealerReplyText('');

    if (onSimulateDealerReply) {
      onSimulateDealerReply(item.invoice, reply);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border-4 border-slate-800 flex flex-col max-h-[92vh]">
        {/* Phone Top Notch / Speaker Bar */}
        <div className="bg-slate-900 pt-2 pb-1 px-6 flex justify-between items-center text-[11px] text-slate-300 font-mono">
          <span>9:00 AM</span>
          <div className="w-16 h-3 bg-slate-800 rounded-full" />
          <span>5G 100%</span>
        </div>

        {/* WhatsApp App Header */}
        <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm border border-emerald-400">
              K
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm leading-tight">Kavach Accessories</span>
                <span className="text-[10px] text-emerald-300 font-bold" title="Official Verified WhatsApp Business Account">
                  ✓
                </span>
              </div>
              <p className="text-[10px] text-emerald-100">Official Business Account</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-emerald-800/80 cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Chat Conversation Body (with authentic WhatsApp background pattern) */}
        <div className="flex-1 overflow-y-auto p-3 bg-[#E5DDD5] space-y-3 text-xs leading-relaxed">
          {/* Encryption Notice */}
          <div className="text-center">
            <span className="bg-[#FCF4CB] text-[#554D2F] px-2.5 py-1 rounded-md text-[10px] shadow-xs inline-block max-w-[90%]">
              🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read them.
            </span>
          </div>

          {/* Date separator */}
          <div className="text-center">
            <span className="bg-white/80 text-slate-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold shadow-xs">
              TODAY
            </span>
          </div>

          {/* Sent Reminder Message Bubble */}
          <div className="flex justify-end">
            <div className="bg-[#DCF8C6] text-slate-900 rounded-2xl rounded-tr-xs p-3 shadow-xs max-w-[88%] space-y-2">
              <pre className="font-sans text-xs whitespace-pre-wrap leading-relaxed text-slate-900">
                {item.messageText}
              </pre>

              <div className="pt-1 border-t border-emerald-300/60 flex items-center justify-between">
                <a
                  href={payUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Tap to Open Pay Link</span>
                </a>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                  <span>9:00 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />
                </div>
              </div>
            </div>
          </div>

          {/* Incoming Simulated Replies */}
          {repliedMessages.map((msg, i) => (
            <div key={i} className="flex justify-start">
              <div className="bg-white text-slate-900 rounded-2xl rounded-tl-xs p-3 shadow-xs max-w-[85%]">
                <p className="text-xs">{msg.text}</p>
                <div className="text-right text-[9px] text-slate-400 mt-1">
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Simulator Triggers */}
        <div className="bg-slate-100 p-2.5 border-t border-slate-200">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
            Simulate Dealer Quick Reply (Demo):
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() =>
                handleSendDealerReply(
                  `Payment done via UPI! Ref ID: UPI/629${Math.floor(100000000 + Math.random() * 900000000)}. Please verify.`
                )
              }
              className="px-2 py-1.5 bg-white border border-slate-300 rounded text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 text-left truncate cursor-pointer"
            >
              "Payment done via UPI..."
            </button>
            <button
              onClick={() =>
                handleSendDealerReply(
                  `Will clear balance this Saturday by 4 PM without fail.`
                )
              }
              className="px-2 py-1.5 bg-white border border-slate-300 rounded text-[11px] font-semibold text-indigo-800 hover:bg-indigo-50 text-left truncate cursor-pointer"
            >
              "Will clear Saturday..."
            </button>
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="bg-[#F0F0F0] p-2 flex items-center gap-2 border-t border-slate-300">
          <input
            type="text"
            value={dealerReplyText}
            onChange={(e) => setDealerReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendDealerReply()}
            placeholder="Type dealer reply..."
            className="flex-1 bg-white px-3 py-1.5 rounded-full text-xs text-slate-800 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            onClick={() => handleSendDealerReply()}
            className="p-2 bg-[#075E54] text-white rounded-full hover:bg-emerald-800 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

