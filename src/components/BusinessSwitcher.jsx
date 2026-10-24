import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RegisterBusinessModal } from './RegisterBusinessModal';

export function BusinessSwitcher({ compact = false }) {
  const { business, businesses = [], currentBusinessId, switchBusiness } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'KV';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getThemeGradient = (color) => {
    if (color === 'cyan') return 'from-blue-600 to-indigo-600 shadow-blue-500/20';
    if (color === 'emerald') return 'from-emerald-600 to-teal-700 shadow-emerald-500/20';
    if (color === 'amber') return 'from-amber-600 to-orange-700 shadow-amber-500/20';
    if (color === 'violet') return 'from-indigo-600 to-purple-700 shadow-indigo-500/20';
    return 'from-blue-600 to-indigo-700 shadow-blue-500/20';
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`flex items-center gap-2.5 text-left rounded-2xl border transition-all cursor-pointer ${
          compact
            ? 'p-1.5 sm:px-3 sm:py-2 bg-[#0f172a]/80 hover:bg-[#131d36] border-white/10 hover:border-indigo-400/30 shadow-md'
            : 'w-full p-2.5 bg-[#0b101d] hover:bg-[#0f172a] border-white/10 hover:border-indigo-500/40 shadow-lg'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${getThemeGradient(
            business?.themeColor
          )} flex items-center justify-center font-black text-xs text-white shadow-md ring-1 ring-white/20 shrink-0`}
        >
          {getInitials(business?.name)}
        </div>

        <div className={`flex-1 min-w-0 ${compact ? 'hidden md:block' : 'block'}`}>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white truncate block">
              {business?.name || 'Kavach Mobile'}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase shrink-0">
              {business?.stateCode || '27'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block">
            {business?.industry || business?.category || 'Electronics Wholesale'}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
            dropdownOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div
          className={`absolute z-50 mt-2 bg-[#090e1a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 animate-fade-in text-white ${
            compact ? 'right-0 w-80' : 'left-0 right-0 w-full'
          }`}
        >
          {/* Menu Header */}
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Select Business Account</span>
            </span>
          </div>

          {/* List of Workspaces */}
          <div className="max-h-60 overflow-y-auto py-1 space-y-1">
            {businesses.map((biz) => {
              const isActive = biz.id === (currentBusinessId || business?.id);
              return (
                <button
                  key={biz.id}
                  onClick={() => {
                    switchBusiness(biz.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-900/60 to-indigo-950/40 border border-indigo-500/40 shadow-inner'
                      : 'hover:bg-white/[0.06] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${getThemeGradient(
                        biz.themeColor
                      )} flex items-center justify-center font-bold text-[11px] text-white shrink-0`}
                    >
                      {getInitials(biz.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {biz.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          [{biz.stateCode}]
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {biz.industry || biz.category}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions CTA */}
          <div className="pt-2 border-t border-white/10 mt-1 space-y-1.5">
            <Link
              to="/organizations"
              onClick={() => setDropdownOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Manage All Businesses</span>
              </div>
              <span className="text-[11px] text-indigo-400 font-bold">→</span>
            </Link>

            <button
              onClick={() => {
                setDropdownOpen(false);
                setRegisterModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm border border-blue-400/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Business</span>
            </button>
          </div>
        </div>
      )}

      {/* Registration Wizard Modal */}
      <RegisterBusinessModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
}

