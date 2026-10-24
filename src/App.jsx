import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NotificationToast } from './components/NotificationToast';
import { DashboardScreen } from './screens/DashboardScreen';
import { InvoicesScreen } from './screens/InvoicesScreen';
import { NewInvoiceScreen } from './screens/NewInvoiceScreen';
import { InvoiceDetailScreen } from './screens/InvoiceDetailScreen';
import { CustomersScreen } from './screens/CustomersScreen';
import { FollowupsScreen } from './screens/FollowupsScreen';
import { LadderScreen } from './screens/LadderScreen';
import { CustomerPayScreen } from './screens/CustomerPayScreen';
import { InboxScreen } from './screens/InboxScreen';
import { PaymentsScreen } from './screens/PaymentsScreen';
import { CashForecastScreen } from './screens/CashForecastScreen';
import { ChaseScreen } from './screens/ChaseScreen';
import { DocumentsScreen } from './screens/DocumentsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { BankExpensesScreen } from './screens/BankExpensesScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { PlatformAdminScreen } from './screens/PlatformAdminScreen';
import { Footer } from './components/Footer';

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fontSize, activeToast, dismissToast, isAuthenticated, isPlatformAdmin, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. The customer pay route (/pay/:token) is public and does not show the owner's sidebar/header
  const isPublicPayRoute = location.pathname.startsWith('/pay/');

  if (isPublicPayRoute) {
    return (
      <div className={`min-h-screen bg-[#0A0F1D] text-slate-100 selection:bg-indigo-600 selection:text-white ${fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
        <Routes>
          <Route path="/pay/:token" element={<CustomerPayScreen />} />
        </Routes>
      </div>
    );
  }

  // 2. The public SaaS landing / home / index page
  const isPublicLanding = location.pathname === '/' || location.pathname === '/home';

  if (isPublicLanding) {
    return (
      <div className={`min-h-screen bg-[#0A0F1D] text-slate-100 selection:bg-indigo-600 selection:text-white ${fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/home" element={<HomeScreen />} />
        </Routes>
        <NotificationToast toast={activeToast} onDismiss={dismissToast} />
      </div>
    );
  }

  // 3. If no business is logged in, any internal route (or /login) displays the single sign-in page
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-[#0A0F1D] text-slate-100 selection:bg-indigo-600 selection:text-white ${fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
        <LoginScreen />
        <NotificationToast toast={activeToast} onDismiss={dismissToast} />
      </div>
    );
  }

  // 4. PLATFORM ADMIN: Isolated, dedicated Admin Console ONLY.
  // No store sidebar, no invoices, no customers, no store finances!
  if (isPlatformAdmin) {
    return (
      <div className={`min-h-screen bg-[#0A0F1D] text-slate-100 selection:bg-indigo-600 selection:text-white ${fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
        {/* Dedicated Standalone Platform Admin Header */}
        <header className="sticky top-0 z-30 bg-[#0F172A]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#090e1a] border border-cyan-500/30 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-white/10 overflow-hidden p-0.5">
              <img src="/logo.png" alt="DueMitra Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">DueMitra OS</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                  Platform Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Merchant Approvals & Governance Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#0A0F1D] border border-white/10 rounded-xl text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono">admin@duemitra.in</span>
              <span className="text-emerald-400 font-semibold">• HQ Super Admin</span>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-3.5 py-2 bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 rounded-xl border border-white/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dedicated Admin Main Content - Merchant Approvals ONLY */}
        <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full animate-fade-in">
          <Routes>
            <Route path="/admin" element={<PlatformAdminScreen />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>

        {/* Floating Toast */}
        <NotificationToast toast={activeToast} onDismiss={dismissToast} />
      </div>
    );
  }

  // 5. STORE ACCOUNT: Render the specific business dashboard & workspace
  return (
    <div className={`min-h-screen bg-[#0A0F1D] text-slate-100 selection:bg-indigo-600 selection:text-white ${fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
      {/* Sleek Enterprise Left Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 xl:pl-72 flex flex-col min-h-screen transition-all">
        {/* Top Command Bar */}
        <Header onOpenMobile={() => setMobileMenuOpen(true)} />

        {/* Page Content with ambient glowing gradient backdrop */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full animate-fade-in space-y-6">
          <Routes>
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/invoices" element={<InvoicesScreen />} />
            <Route path="/invoices/new" element={<NewInvoiceScreen />} />
            <Route path="/invoices/:id" element={<InvoiceDetailScreen />} />
            <Route path="/customers" element={<CustomersScreen />} />
            <Route path="/followups" element={<FollowupsScreen />} />
            <Route path="/ladder" element={<LadderScreen />} />
            <Route path="/inbox" element={<InboxScreen />} />
            <Route path="/payments" element={<PaymentsScreen />} />
            <Route path="/forecast" element={<CashForecastScreen />} />
            <Route path="/bank-expenses" element={<BankExpensesScreen />} />
            <Route path="/chase" element={<ChaseScreen />} />
            <Route path="/documents" element={<DocumentsScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Global SaaS Interactive Footer (Do & See) */}
        <Footer />
      </div>

      {/* Floating Real-time n8n Alert Notification Toast */}
      <NotificationToast toast={activeToast} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  );
}
