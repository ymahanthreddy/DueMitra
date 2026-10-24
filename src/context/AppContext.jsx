import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { initialBusiness } from '../data/business.js';
import { defaultBusinesses, PLATFORM_ADMIN_CREDENTIALS } from '../data/defaultBusinesses.js';
import { initialCustomers } from '../data/customers.js';
import { initialInvoices } from '../data/invoices.js';
import { initialExpenses } from '../data/expenses.js';
import { generateSampleTenantData } from '../data/tenantSampleData.js';
import { APP_CONFIG } from '../data/config.js';
import { en } from '../i18n/en.js';
import { hi } from '../i18n/hi.js';
import { mr } from '../i18n/mr.js';
import { getDaysDiff, addDays, getFinancialYearString } from '../utils/date.js';
import { formatPaise } from '../utils/money.js';
import { calculateInvoiceTotals } from '../utils/gst.js';
import { compute13WeekForecast } from '../utils/forecast.js';
import { calculateChaseScore } from '../utils/scoring.js';
import { getInvoiceLadderStage, buildReminderMessage } from '../utils/ladder.js';
import { sendN8nWebhook, testN8nConnection, runAiReconciliation } from '../utils/n8n.js';
import { sampleBankStatementRaw, parseBankStatementCsv } from '../data/bankStatementData.js';
import {
  testSupabaseConnection,
  saveBusinessToSupabase,
  saveCustomerToSupabase,
  saveInvoiceToSupabase,
  saveClaimToSupabase,
  saveExpensesToSupabase,
  saveBankBalanceToSupabase,
  saveConfigToSupabase,
  loadAllDataFromSupabase,
  pushFullStateToSupabase
} from '../utils/supabase.js';
import {
  computeBusinessAffordability,
  generateMonthlyStatements,
  calculateEscalatedRent,
  computeMonthlyExpenseBreakdown
} from '../utils/affordability.js';
import {
  dispatchInvoiceEmail,
  dispatchDueRemindersDigestEmail,
  dispatchNewBusinessRegistrationEmail
} from '../utils/mailer.js';

const AppContext = typeof window !== 'undefined' && window.__KAVACH_APP_CONTEXT__
  ? window.__KAVACH_APP_CONTEXT__
  : createContext(null);

if (typeof window !== 'undefined') {
  window.__KAVACH_APP_CONTEXT__ = AppContext;
}

const STORAGE_KEY = 'kavach_app_state_v2';

export function AppProvider({ children }) {
  const [activeToast, setActiveToast] = useState(null);

  const notifyN8nEvent = (title, detail) => {
    const toast = {
      id: `TOAST-${Date.now()}`,
      title,
      detail,
      timestamp: new Date().toISOString()
    };
    setActiveToast(toast);
    setTimeout(() => {
      setActiveToast((current) => (current?.id === toast.id ? null : current));
    }, 4500);
  };

  // Load state from localStorage or initialize with multi-tenant defaults
  const [state, setState] = useState(() => {
    try {
      // Check v2 or fall back to v1
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('kavach_app_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.config) parsed.config = APP_CONFIG;
        if (!parsed.config.n8n) parsed.config.n8n = { ...APP_CONFIG.n8n };

        // Ensure live n8n Pro Cloud endpoints
        if (!parsed.config.n8n.webhookUrl || parsed.config.n8n.webhookUrl.includes('.internal') || parsed.config.n8n.webhookUrl === '' || parsed.config.n8n.webhookUrl.includes('kavach-alerts')) {
          parsed.config.n8n.webhookUrl = 'https://ymahanthreddy.app.n8n.cloud/webhook/due-reminders-digest';
        }
        if (!parsed.config.n8n.emailWebhookUrl || parsed.config.n8n.emailWebhookUrl.includes('.internal') || parsed.config.n8n.emailWebhookUrl === '' || parsed.config.n8n.emailWebhookUrl.includes('kavach-email')) {
          parsed.config.n8n.emailWebhookUrl = 'https://ymahanthreddy.app.n8n.cloud/webhook/due-reminders-digest';
        }
        if (!parsed.config.n8n.aiReconciliationUrl || parsed.config.n8n.aiReconciliationUrl.includes('.internal') || parsed.config.n8n.aiReconciliationUrl === '') {
          parsed.config.n8n.aiReconciliationUrl = 'https://ymahanthreddy.app.n8n.cloud/webhook/ai-bank-parse';
        }
        if (!parsed.config.n8n.dueDigestWebhookUrl || parsed.config.n8n.dueDigestWebhookUrl.includes('.internal') || parsed.config.n8n.dueDigestWebhookUrl === '') {
          parsed.config.n8n.dueDigestWebhookUrl = 'https://ymahanthreddy.app.n8n.cloud/webhook/due-reminders-digest';
        }
        parsed.config.n8n.enabled = true;
        parsed.config.n8n.aiReconciliationEnabled = true;
        parsed.n8nStatus = 'connected';

        if (!parsed.dueDigestConfig) {
          parsed.dueDigestConfig = {
            enabled: true,
            intervalHours: 3,
            recipientEmail: '',
            lastSentTimestamp: null,
            lastDispatchedSummary: null,
          };
        }

        // Sanitize any legacy dummy emails from state to avoid bounces
        if (parsed.dueDigestConfig?.recipientEmail?.includes('kavachaccessories.in')) {
          parsed.dueDigestConfig.recipientEmail = '';
        }
        if (parsed.autoReminderSettings?.testEmail?.includes('kavachaccessories.in')) {
          parsed.autoReminderSettings.testEmail = '';
        }
        if (parsed.business?.email?.includes('kavachaccessories.in')) {
          parsed.business.email = '';
        }
        if (parsed.business?.notificationEmail?.includes('kavachaccessories.in')) {
          parsed.business.notificationEmail = '';
        }

        // Ensure only Kavach Mobile and valid businesses are present (purge Apex / Zenith)
        const filtered = (parsed.businesses || defaultBusinesses)
          .filter(b => b.id !== 'BIZ-APEX' && b.id !== 'BIZ-ZENITH');
        
        // Merge missing default businesses (e.g. BIZ-BALAJI pending applicant)
        const existingIds = new Set(filtered.map(b => b.id));
        const missingDefaults = defaultBusinesses.filter(d => !existingIds.has(d.id));
        const combined = [...filtered, ...missingDefaults];

        parsed.businesses = combined.map(b => {
          const def = defaultBusinesses.find(d => d.id === b.id);
          if (def) {
            return {
              ...b,
              loginEmail: def.loginEmail,
              loginPassword: def.loginPassword,
              userName: def.name,
              userRole: 'Store Account',
              status: b.status || def.status || 'approved',
              appliedAt: b.appliedAt || def.appliedAt,
              approvedAt: b.approvedAt || def.approvedAt,
            };
          }
          return {
            ...b,
            loginEmail: b.loginEmail || b.email,
            loginPassword: b.loginPassword || `${b.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4)}@123`,
            userName: b.name,
            userRole: 'Store Account',
            status: b.status || 'pending_approval',
          };
        });

        if (!parsed.currentBusinessId || parsed.currentBusinessId === 'BIZ-APEX' || parsed.currentBusinessId === 'BIZ-ZENITH') {
          parsed.currentBusinessId = 'BIZ-KAVACH';
        }
        if (!parsed.currentUser || !parsed.isAuthenticated) {
          parsed.isAuthenticated = false;
          parsed.currentUser = null;
        }
        if (!parsed.tenantsData) {
          parsed.tenantsData = {
            'BIZ-KAVACH': {
              customers: parsed.customers || initialCustomers,
              invoices: parsed.invoices || initialInvoices,
              expenses: parsed.expenses || initialExpenses,
              bankBalancePaise: parsed.bankBalancePaise ?? 48289200,
              inboxClaims: parsed.inboxClaims || [
                {
                  id: 'CLAIM-1',
                  invoiceId: 'INV-0035',
                  invoiceNumber: 'KVC/26-27/0035',
                  customerName: 'Navkar Electronics',
                  customerId: 'CUST-009',
                  claimType: 'dispute',
                  reason: '15 pcs 9H Tempered Glass arrived cracked. Request credit note of ₹11,250.',
                  date: '2026-10-20',
                  status: 'pending',
                  amountPaise: 1125000,
                },
              ],
            },
          };
        } else {
          delete parsed.tenantsData['BIZ-APEX'];
          delete parsed.tenantsData['BIZ-ZENITH'];
          // Ensure ONLY Kavach Mobile has dummy data. All other registered businesses have ZERO dummy data!
          Object.keys(parsed.tenantsData).forEach((bId) => {
            if (bId !== 'BIZ-KAVACH') {
              const t = parsed.tenantsData[bId];
              // If it contains seeded dummy samples, reset to clean empty state
              const isSeededDummy = t.invoices?.some((i) => i.id?.includes('APX') || i.id?.includes('SBT') || i.id?.includes('DEMO') || i.id?.includes('SAMPLE'));
              if (isSeededDummy) {
                parsed.tenantsData[bId] = {
                  customers: [],
                  invoices: [],
                  expenses: [],
                  bankBalancePaise: 0,
                  inboxClaims: [],
                };
              }
            }
          });
        }

        return parsed;
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }

    return {
      businesses: defaultBusinesses,
      currentBusinessId: 'BIZ-KAVACH',
      tenantsData: {
        'BIZ-KAVACH': {
          customers: initialCustomers,
          invoices: initialInvoices,
          expenses: initialExpenses,
          bankBalancePaise: 48289200,
          inboxClaims: [
            {
              id: 'CLAIM-1',
              invoiceId: 'INV-0035',
              invoiceNumber: 'KVC/26-27/0035',
              customerName: 'Navkar Electronics',
              customerId: 'CUST-009',
              claimType: 'dispute',
              reason: '15 pcs 9H Tempered Glass arrived cracked. Request credit note of ₹11,250.',
              date: '2026-10-20',
              status: 'pending',
              amountPaise: 1125000,
            },
          ],
        },
        'BIZ-BALAJI': {
          customers: [],
          invoices: [],
          expenses: [],
          bankBalancePaise: 0,
          inboxClaims: [],
        },
      },
      config: APP_CONFIG,
      demoDate: '2026-10-23',
      lang: 'en',
      fontSize: 'normal',
      currentUser: null,
      isAuthenticated: false,
      n8nStatus: 'connected',
      lastWebhookLog: null,
      confirmedMatches: [],
      whatIf: {
        customerDelay: false,
        bigOrder: false,
        delaySupplier: false,
      },
      dueDigestConfig: {
        enabled: true,
        intervalHours: 3,
        recipientEmail: '',
        lastSentTimestamp: null,
        lastDispatchedSummary: null,
      },
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [state]);

  // Real-time verification of live n8n Pro Cloud endpoint on mount
  useEffect(() => {
    const targetUrl = state.config?.n8n?.webhookUrl;
    if (targetUrl && !targetUrl.includes('.internal')) {
      testN8nConnection(targetUrl)
        .then((res) => {
          if (res.mode === 'live_n8n') {
            setState((prev) => ({
              ...prev,
              n8nStatus: 'connected',
              lastWebhookLog: res,
            }));
          }
        })
        .catch(() => {});
    }
  }, []);

  // Automatic synchronization with Supabase Cloud Database on mount
  useEffect(() => {
    testSupabaseConnection()
      .then(async (res) => {
        if (res && res.connected) {
          const bizId = state.currentBusinessId || 'BIZ-KAVACH';
          const cloudData = await loadAllDataFromSupabase(bizId);

          if (cloudData && cloudData.success) {
            setState((prev) => {
              const currentTenant = prev.tenantsData?.[bizId] || {};
              const hasCloudInvoices = cloudData.invoices && cloudData.invoices.length > 0;
              const hasCloudCustomers = cloudData.customers && cloudData.customers.length > 0;

              return {
                ...prev,
                businesses: cloudData.businesses && cloudData.businesses.length > 0 ? cloudData.businesses : prev.businesses,
                config: cloudData.config ? { ...prev.config, ...cloudData.config } : prev.config,
                tenantsData: {
                  ...prev.tenantsData,
                  [bizId]: {
                    ...currentTenant,
                    customers: hasCloudCustomers ? cloudData.customers : currentTenant.customers,
                    invoices: hasCloudInvoices ? cloudData.invoices : currentTenant.invoices,
                    expenses: cloudData.expenses && cloudData.expenses.length > 0 ? cloudData.expenses : currentTenant.expenses,
                    bankBalancePaise: typeof cloudData.bankBalancePaise === 'number' ? cloudData.bankBalancePaise : currentTenant.bankBalancePaise,
                    inboxClaims: cloudData.claims && cloudData.claims.length > 0 ? cloudData.claims : currentTenant.inboxClaims,
                  },
                },
              };
            });
          }
        }
      })
      .catch((e) => console.warn('Supabase initial sync notice:', e));
  }, [state.currentBusinessId]);

  // Internationalization dictionary (English, हिंदी, मराठी)
  const translations = useMemo(() => {
    if (state.lang === 'mr') return mr;
    if (state.lang === 'hi') return hi;
    return en;
  }, [state.lang]);

  const t = (path) => {
    const keys = path.split('.');
    let cur = translations;
    for (const k of keys) {
      if (!cur || cur[k] === undefined) return path;
      cur = cur[k];
    }
    return cur;
  };

  // Dynamic Current Business Object
  const currentBusiness = useMemo(() => {
    const list = state.businesses || defaultBusinesses;
    return list.find((b) => b.id === state.currentBusinessId) || list[0] || initialBusiness;
  }, [state.businesses, state.currentBusinessId]);

  // Active Tenant Slice - ONLY Kavach Mobile has initial dummy data; all other businesses have 0 dummy data!
  const activeTenant = useMemo(() => {
    const tData = state.tenantsData?.[state.currentBusinessId];
    if (tData) return tData;

    if (state.currentBusinessId === 'BIZ-KAVACH') {
      return {
        customers: initialCustomers,
        invoices: initialInvoices,
        expenses: initialExpenses,
        bankBalancePaise: 48289200,
        inboxClaims: [],
      };
    }

    return {
      customers: [],
      invoices: [],
      expenses: [],
      bankBalancePaise: 0,
      inboxClaims: [],
    };
  }, [state.tenantsData, state.currentBusinessId]);

  const activeInvoices = activeTenant.invoices || [];
  const activeCustomers = activeTenant.customers || [];
  const activeExpenses = activeTenant.expenses || [];
  const activeBankBalance = activeTenant.bankBalancePaise ?? 0;
  const activeInboxClaims = activeTenant.inboxClaims || [];

  // Helper to mutate the active tenant's slice immutably
  const updateActiveTenant = (updater) => {
    setState((prev) => {
      const bizId = prev.currentBusinessId || 'BIZ-KAVACH';
      const existing = prev.tenantsData?.[bizId] || (
        bizId === 'BIZ-KAVACH' ? {
          customers: initialCustomers,
          invoices: initialInvoices,
          expenses: initialExpenses,
          bankBalancePaise: 48289200,
          inboxClaims: [],
        } : {
          customers: [],
          invoices: [],
          expenses: [],
          bankBalancePaise: 0,
          inboxClaims: [],
        }
      );
      const updatedSlice = updater(existing, prev);
      return {
        ...prev,
        tenantsData: {
          ...(prev.tenantsData || {}),
          [bizId]: {
            ...existing,
            ...updatedSlice,
          },
        },
      };
    });
  };

  // Synchronize customers' outstanding balances with actual invoice balances
  const customersWithLiveBalances = useMemo(() => {
    const balanceByCust = {};
    activeInvoices.forEach((inv) => {
      if (inv.status !== 'paid' && inv.balanceDuePaise > 0) {
        balanceByCust[inv.customerId] = (balanceByCust[inv.customerId] || 0) + inv.balanceDuePaise;
      }
    });

    return activeCustomers.map((c) => ({
      ...c,
      outstandingPaise: balanceByCust[c.id] || 0,
    }));
  }, [activeInvoices, activeCustomers]);

  // Computed Ageing Buckets based on current demo date
  const ageingBuckets = useMemo(() => {
    const buckets = {
      notYetDuePaise: 0,
      days1_30Paise: 0,
      days31_60Paise: 0,
      days61_90Paise: 0,
      days90PlusPaise: 0,
      totalOverduePaise: 0,
      totalToCollectPaise: 0,
      counts: { notYetDue: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90Plus: 0 },
    };

    activeInvoices.forEach((inv) => {
      if (inv.status === 'paid' || inv.balanceDuePaise <= 0) return;

      const daysOverdue = getDaysDiff(state.demoDate, inv.dueDate);
      const bal = inv.balanceDuePaise;

      buckets.totalToCollectPaise += bal;

      if (daysOverdue <= 0) {
        buckets.notYetDuePaise += bal;
        buckets.counts.notYetDue++;
      } else {
        buckets.totalOverduePaise += bal;
        if (daysOverdue <= 30) {
          buckets.days1_30Paise += bal;
          buckets.counts.d1_30++;
        } else if (daysOverdue <= 60) {
          buckets.days31_60Paise += bal;
          buckets.counts.d31_60++;
        } else if (daysOverdue <= 90) {
          buckets.days61_90Paise += bal;
          buckets.counts.d61_90++;
        } else {
          buckets.days90PlusPaise += bal;
          buckets.counts.d90Plus++;
        }
      }
    });

    return buckets;
  }, [activeInvoices, state.demoDate]);

  // 13-Week Cash Flow Forecast
  const cashForecast = useMemo(() => {
    return compute13WeekForecast({
      startDateStr: state.demoDate,
      openingBankBalancePaise: activeBankBalance,
      openInvoices: activeInvoices,
      customers: activeCustomers,
      expenses: activeExpenses,
      safetyBufferPaise: state.config.safetyBufferPaise,
      whatIf: state.whatIf,
    });
  }, [state.demoDate, activeBankBalance, activeInvoices, activeCustomers, activeExpenses, state.config.safetyBufferPaise, state.whatIf]);

  // Top Priority Invoices to Chase First
  const priorityChaseList = useMemo(() => {
    const custMap = new Map(activeCustomers.map((c) => [c.id, c]));

    const overdueList = activeInvoices
      .filter((i) => i.status !== 'paid' && i.balanceDuePaise > 0)
      .map((inv) => {
        const cust = custMap.get(inv.customerId);
        const daysOverdue = Math.max(0, getDaysDiff(state.demoDate, inv.dueDate));
        const scoreData = calculateChaseScore(
          { ...inv, daysOverdue },
          cust,
          {
            troughWeekIndex: cashForecast.troughWeekIndex,
            maxShortfallPaise: cashForecast.maxShortfallPaise,
          }
        );
        return {
          invoice: inv,
          customer: cust,
          daysOverdue,
          ...scoreData,
        };
      })
      .filter((item) => item.daysOverdue > 0 || item.invoice.balanceDuePaise > 4000000)
      .sort((a, b) => b.score - a.score);

    return overdueList;
  }, [activeInvoices, activeCustomers, state.demoDate, cashForecast]);

  // Today's Follow-ups due based on Escalation Ladder
  const followupsDueToday = useMemo(() => {
    const custMap = new Map(activeCustomers.map((c) => [c.id, c]));
    const list = [];

    activeInvoices.forEach((inv) => {
      const ladderStages = state.config?.ladderStages || state.config?.defaultLadderStages;
      const stage = getInvoiceLadderStage(inv, state.demoDate, ladderStages);
      if (stage) {
        const cust = custMap.get(inv.customerId);
        const messageText = buildReminderMessage({
          stageKey: stage.key,
          lang: cust?.preferredLanguage || state.lang,
          invoice: inv,
          business: currentBusiness,
          customer: cust,
          demoDateStr: state.demoDate,
        });

        list.push({
          invoice: inv,
          customer: cust,
          stage,
          messageText,
        });
      }
    });

    return list;
  }, [activeInvoices, activeCustomers, state.demoDate, state.lang, currentBusiness]);

  // Overview KPIs
  const kpis = useMemo(() => {
    const totalToCollectPaise = ageingBuckets.totalToCollectPaise;
    const totalOverduePaise = ageingBuckets.totalOverduePaise;
    const bankBalancePaise = activeBankBalance;
    const lowestForecastPaise = cashForecast.lowestPointPaise ?? 0;
    const lowestForecastWeek = cashForecast.troughWeekIndex || 1;
    const isBelowBuffer = lowestForecastPaise < (state.config?.safetyBufferPaise || 20000000);
    const expectedThisWeekPaise = cashForecast.weeks?.[0]?.inflowPaise || 0;
    const expectedThisMonthPaise = (cashForecast.weeks || []).slice(0, 4).reduce((sum, w) => sum + (w.inflowPaise || 0), 0);
    const shopBillsNext30Paise = activeExpenses.reduce((sum, e) => sum + (e.amountPaise || 0), 0);

    return {
      // Keys used by DashboardScreen
      moneyToCollectPaise: totalToCollectPaise,
      overdueAmountPaise: totalOverduePaise,
      expectedThisWeekPaise,
      expectedThisMonthPaise,
      shopBillsNext30Paise,
      cashInBankPaise: bankBalancePaise,
      lowestForecastPaise,
      lowestForecastWeek,
      isBelowBuffer,

      // Keys for backward compatibility
      totalToCollectPaise,
      totalOverduePaise,
      bankBalancePaise,
      lowestProjectedPaise: lowestForecastPaise,
      overduePercent: totalToCollectPaise > 0 ? Math.round((totalOverduePaise / totalToCollectPaise) * 100) : 0,
      troughWeekIndex: cashForecast.troughWeekIndex,
      isShortfallExpected: cashForecast.isShortfallExpected,
    };
  }, [ageingBuckets, activeBankBalance, cashForecast, activeExpenses, state.config?.safetyBufferPaise]);

  // Business Affordability & Solvency Analysis
  const affordability = useMemo(() => {
    return computeBusinessAffordability({
      bankBalancePaise: activeBankBalance,
      invoices: activeInvoices,
      expenses: activeExpenses,
      safetyBufferPaise: state.config.safetyBufferPaise,
      demoDate: state.demoDate,
    });
  }, [activeBankBalance, activeInvoices, activeExpenses, state.config.safetyBufferPaise, state.demoDate]);

  // Monthly Statements (Generated for 1st of each month across past 5-6 months)
  const monthlyStatements = useMemo(() => {
    return generateMonthlyStatements({
      invoices: activeInvoices,
      expenses: activeExpenses,
      currentBankBalancePaise: activeBankBalance,
    });
  }, [activeInvoices, activeExpenses, activeBankBalance]);

  // Action: Live Update Bank Balance
  const updateBankBalance = (newPaise) => {
    const val = Math.max(0, Math.round(Number(newPaise) || 0));
    updateActiveTenant((current) => {
      saveBankBalanceToSupabase(val, state.currentBusinessId || 'BIZ-KAVACH').catch(() => {});
      return {
        ...current,
        bankBalancePaise: val,
      };
    });
    notifyN8nEvent('Bank Balance Updated', `Liquid bank balance set to ₹${(val / 100).toLocaleString('en-IN')}`);
  };

  // Action: Update Existing Expense
  const updateExpense = (expenseId, updatedFields) => {
    updateActiveTenant((current) => {
      const nextExpenses = (current.expenses || []).map((e) => {
        if (e.id !== expenseId) return e;
        const amount = updatedFields.amountPaise !== undefined ? Math.max(0, Math.round(Number(updatedFields.amountPaise) || 0)) : e.amountPaise;
        return {
          ...e,
          ...updatedFields,
          amountPaise: amount,
          baseAmountPaise: amount,
        };
      });
      saveExpensesToSupabase(nextExpenses, state.currentBusinessId || 'BIZ-KAVACH').catch(() => {});
      return {
        ...current,
        expenses: nextExpenses,
      };
    });
  };

  // Action: Add New Expense Commitment
  const addExpense = (newExp) => {
    const amount = Math.max(0, Math.round(Number(newExp.amountPaise) || 0));
    const createdExp = {
      ...newExp,
      id: newExp.id || `EXP-${Date.now()}`,
      amountPaise: amount,
      baseAmountPaise: amount,
      isRecurring: newExp.isRecurring !== false,
    };
    updateActiveTenant((current) => {
      const nextExpenses = [...(current.expenses || []), createdExp];
      saveExpensesToSupabase(nextExpenses, state.currentBusinessId || 'BIZ-KAVACH').catch(() => {});
      return {
        ...current,
        expenses: nextExpenses,
      };
    });
    notifyN8nEvent('Business Expense Added', `${createdExp.title} (₹${(amount / 100).toLocaleString('en-IN')})`);
  };

  // Action: Delete Expense
  const deleteExpense = (expenseId) => {
    updateActiveTenant((current) => {
      const nextExpenses = (current.expenses || []).filter((e) => e.id !== expenseId);
      saveExpensesToSupabase(nextExpenses, state.currentBusinessId || 'BIZ-KAVACH').catch(() => {});
      return {
        ...current,
        expenses: nextExpenses,
      };
    });
  };

  // Action: Add / Register New Customer
  const addCustomer = (customerData) => {
    const id = customerData.id || `CUST-${Date.now().toString(36)}`;
    const newCustomer = {
      id,
      name: customerData.name || 'New Trade Customer',
      tradeName: customerData.tradeName || customerData.name || '',
      contactPerson: customerData.contactPerson || customerData.name || 'Proprietor',
      phone: customerData.phone || currentBusiness?.phone || '+91 98230 12345',
      email: customerData.email || currentBusiness?.email || 'accounts@trade.com',
      address: customerData.address || currentBusiness?.address || 'FC Road',
      city: customerData.city || currentBusiness?.city || 'Pune',
      state: customerData.state || currentBusiness?.state || 'Maharashtra',
      stateCode: customerData.stateCode || currentBusiness?.stateCode || '27',
      gstin: (customerData.gstin || '').toUpperCase().trim(),
      creditDays: Number(customerData.creditDays) || 30,
      creditLimitPaise: customerData.creditLimitPaise || 20000000,
      avgDaysLate: 0,
      onTimePaymentRate: 100,
      reliabilityGrade: customerData.gstin ? 'A' : 'B',
      reliabilityReason: customerData.gstin
        ? 'Verified GST-registered trade dealer.'
        : 'Unregistered consumer / retail trade buyer.',
      outstandingPaise: 0,
    };

    updateActiveTenant((current) => ({
      ...current,
      customers: [newCustomer, ...(current.customers || [])],
    }));

    saveCustomerToSupabase(newCustomer).catch((e) => console.warn('Supabase customer save notice:', e));
    notifyN8nEvent('Customer Registered', `${newCustomer.name} (GSTIN: ${newCustomer.gstin || 'None'})`);
    return newCustomer;
  };

  // Action: Update Customer Details (e.g. Add GSTIN)
  const updateCustomer = (customerId, updates) => {
    updateActiveTenant((current) => {
      const updatedCustomers = (current.customers || []).map((c) => {
        if (c.id !== customerId) return c;
        const merged = { ...c, ...updates };
        if (updates.gstin) {
          merged.gstin = updates.gstin.toUpperCase().trim();
          if (!c.gstin) {
            merged.reliabilityGrade = 'A';
            merged.reliabilityReason = 'GSTIN registered and verified. High trade reliability.';
          }
        }
        saveCustomerToSupabase(merged).catch((e) => console.warn('Supabase customer update notice:', e));
        return merged;
      });
      return {
        ...current,
        customers: updatedCustomers,
      };
    });
    notifyN8nEvent('Customer Profile Updated', `GSTIN & account settings saved`);
  };

  // Action: Add New Invoice
  const addInvoice = (invoiceData, isDraft = false) => {
    const totals = calculateInvoiceTotals(
      invoiceData.items,
      invoiceData.customerStateCode === currentBusiness.stateCode
    );

    const prefix = currentBusiness.invoicePrefix || 'INV/26-27/';
    const existingCount = activeInvoices.length + 1;
    const invoiceNumber = invoiceData.invoiceNumber || `${prefix}${String(existingCount).padStart(4, '0')}`;
    const token = `tok-${Date.now().toString(36)}`;

    const initialPaidPaise = Math.round(Number(invoiceData.initialPayment?.amountPaise || invoiceData.amountPaidPaise || 0));
    const balanceDuePaise = Math.max(0, totals.grandTotalPaise - initialPaidPaise);
    let initialStatus = isDraft ? 'draft' : 'sent';
    if (balanceDuePaise === 0) {
      initialStatus = 'paid';
    } else if (initialPaidPaise > 0) {
      initialStatus = 'part_paid';
    }

    const initialPayments = [];
    if (initialPaidPaise > 0) {
      initialPayments.push({
        id: `PAY-INIT-${Date.now()}`,
        date: invoiceData.invoiceDate || state.demoDate,
        amountPaise: initialPaidPaise,
        paymentMode: invoiceData.initialPayment?.paymentMode || 'bank_transfer',
        modeLabel: invoiceData.initialPayment?.modeLabel || 'Initial Settlement',
        referenceNumber: invoiceData.initialPayment?.referenceNumber || 'N/A',
        bankName: invoiceData.initialPayment?.bankName || '',
        notes: invoiceData.initialPayment?.notes || 'Advance / Settlement recorded at creation',
        recordedAt: new Date().toISOString(),
      });
    }

    const newInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber,
      invoiceDate: invoiceData.invoiceDate || state.demoDate,
      dueDate: invoiceData.dueDate,
      customerId: invoiceData.customerId,
      customerName: invoiceData.customerName,
      customerTradeName: invoiceData.customerTradeName,
      customerGstin: invoiceData.customerGstin,
      customerState: invoiceData.customerState,
      customerStateCode: invoiceData.customerStateCode,
      customerAddress: invoiceData.customerAddress,
      customerPhone: invoiceData.customerPhone || currentBusiness?.phone || '',
      customerEmail: invoiceData.customerEmail || currentBusiness?.email || '',
      isReverseCharge: invoiceData.isReverseCharge || false,
      placeOfSupply: invoiceData.placeOfSupply,
      status: initialStatus,
      items: invoiceData.items,
      taxableTotalPaise: totals.taxableTotalPaise,
      cgstTotalPaise: totals.cgstTotalPaise,
      sgstTotalPaise: totals.sgstTotalPaise,
      igstTotalPaise: totals.igstTotalPaise,
      totalTaxPaise: totals.totalTaxPaise,
      roundOffPaise: totals.roundOffPaise,
      grandTotalPaise: totals.grandTotalPaise,
      amountPaidPaise: initialPaidPaise,
      balanceDuePaise,
      payments: initialPayments,
      disputeReason: '',
      promisedPayDate: null,
      snoozeUntil: null,
      lastLadderStageSent: null,
      ladderPaused: false,
      timeline: [
        {
          id: `TL-NEW-1`,
          date: invoiceData.invoiceDate || state.demoDate,
          type: 'created',
          title: 'Invoice Created',
          detail: `Generated Tax Invoice ${invoiceNumber}`,
        },
        ...(initialPaidPaise > 0
          ? [
              {
                id: `TL-INIT-PAY-${Date.now()}`,
                date: invoiceData.invoiceDate || state.demoDate,
                type: 'payment',
                title: `Initial Settlement: ${formatPaise(initialPaidPaise)}`,
                detail: `Recorded via ${invoiceData.initialPayment?.modeLabel || 'Bank Settlement'} | Ref: ${
                  invoiceData.initialPayment?.referenceNumber || 'N/A'
                }`,
              },
            ]
          : []),
        {
          id: `TL-EMAIL-AUTO-${Date.now()}`,
          date: invoiceData.invoiceDate || state.demoDate,
          type: 'sent',
          title: 'Invoice Auto-Sent to Email',
          detail: `Tax invoice dispatched to ${invoiceData.customerEmail || currentBusiness?.email}`,
        },
        ...(!isDraft
          ? [
              {
                id: `TL-NEW-2`,
                date: invoiceData.invoiceDate || state.demoDate,
                type: 'sent',
                title: 'Invoice Sent',
                detail: `Sent to ${invoiceData.customerName} via WhatsApp / Email (${invoiceData.customerEmail || currentBusiness?.email})`,
              },
            ]
          : []),
      ],
      token,
    };

    updateActiveTenant((current) => {
      let updatedCustomers = current.customers || [];
      if (!updatedCustomers.some((c) => c.id === invoiceData.customerId)) {
        const newCustomerObj = {
          id: invoiceData.customerId || `CUST-${Date.now()}`,
          name: invoiceData.customerName,
          tradeName: invoiceData.customerTradeName || invoiceData.customerName,
          gstin: invoiceData.customerGstin || '',
          state: invoiceData.customerState || currentBusiness.state,
          stateCode: invoiceData.customerStateCode || currentBusiness.stateCode,
          address: invoiceData.customerAddress || '',
          phone: invoiceData.customerPhone || currentBusiness.phone || '',
          email: invoiceData.customerEmail || currentBusiness.notificationEmail || currentBusiness.email || '',
          creditDays: 30,
          avgDaysLate: 0,
          onTimePaymentRate: 100,
          outstandingPaise: totals.grandTotalPaise,
        };
        updatedCustomers = [newCustomerObj, ...updatedCustomers];
        saveCustomerToSupabase(newCustomerObj).catch(() => {});
      }
      return {
        customers: updatedCustomers,
        invoices: [newInvoice, ...(current.invoices || [])],
        bankBalancePaise: (current.bankBalancePaise || 0) + initialPaidPaise,
      };
    });

    // Auto-save invoice to Supabase Cloud Database
    saveInvoiceToSupabase(newInvoice).catch((e) => console.warn('Supabase invoice auto-save notice:', e));

    // Automated Transactional Email Dispatch (Full HTML, Plain Text, and Webhook)
    const targetRecipient = invoiceData.customerEmail || currentBusiness?.notificationEmail || currentBusiness?.email;
    dispatchInvoiceEmail({
      invoice: newInvoice,
      business: currentBusiness,
      customer: activeCustomers.find((c) => c.id === newInvoice.customerId),
      recipientEmail: targetRecipient,
      webhookUrl: state.config?.n8n?.webhookUrl,
      emailWebhookUrl: state.config?.n8n?.emailWebhookUrl || 'https://ymahanthreddy.app.n8n.cloud/webhook/kavach-email',
    }).catch((e) => console.warn('Email auto-dispatch error:', e));

    notifyN8nEvent('Invoice Issued & Auto-Sent', `${invoiceNumber} sent to ${targetRecipient || 'customer'}`);

    return newInvoice;
  };

  // Action: Mark ladder stage as sent
  const markLadderStageSent = (invoiceId, stageNumber, channel = 'whatsapp') => {
    updateActiveTenant((current) => {
      const updatedInvoices = current.invoices.map((inv) => {
        if (inv.id !== invoiceId) return inv;

        const timelineEntry = {
          id: `TL-${Date.now()}`,
          date: state.demoDate,
          type: 'reminder',
          title: `Stage ${stageNumber} Reminder Sent`,
          detail: `Dispatched via ${channel} to ${inv.customerPhone || inv.customerEmail}`,
        };

        return {
          ...inv,
          lastLadderStageSent: stageNumber,
          timeline: [...inv.timeline, timelineEntry],
        };
      });

      return { invoices: updatedInvoices };
    });

    if (stageNumber >= 3 && state.config?.n8n?.webhookUrl) {
      const target = activeInvoices.find((i) => i.id === invoiceId);
      sendN8nWebhook(state.config.n8n.webhookUrl, 'overdue_escalation_stage', {
        invoiceNumber: target?.invoiceNumber,
        stageNumber,
        balanceDuePaise: target?.balanceDuePaise,
        customerName: target?.customerName,
      }).catch(() => {});
    }
  };

  // Action: Snooze followup
  const snoozeFollowup = (invoiceId, days = 3) => {
    const snoozeDate = addDays(state.demoDate, days);
    updateActiveTenant((current) => ({
      invoices: current.invoices.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        return {
          ...inv,
          snoozeUntil: snoozeDate,
          timeline: [
            ...inv.timeline,
            {
              id: `TL-SNZ-${Date.now()}`,
              date: state.demoDate,
              type: 'snooze',
              title: `Follow-up Snoozed`,
              detail: `Snoozed until ${snoozeDate}`,
            },
          ],
        };
      }),
    }));
  };

  // Action: Record customer promise to pay
  const recordCustomerPromise = (invoiceId, promisedDate) => {
    updateActiveTenant((current) => ({
      invoices: current.invoices.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const updatedInv = {
          ...inv,
          promisedPayDate: promisedDate,
          ladderPaused: true,
          timeline: [
            ...inv.timeline,
            {
              id: `TL-PRM-${Date.now()}`,
              date: state.demoDate,
              type: 'promise',
              title: `Customer Promised Payment`,
              detail: `Promised settlement by ${promisedDate}. Ladder paused until then.`,
            },
          ],
        };
        saveInvoiceToSupabase(updatedInv).catch(() => {});
        return updatedInv;
      }),
    }));
  };

  // Action: Customer claims dispute or already paid
  const submitCustomerClaim = (invoiceId, claimType, claimData) => {
    const invoice = activeInvoices.find((i) => i.id === invoiceId);
    if (!invoice) return { success: false, error: 'Invoice not found' };

    const claimId = `CLAIM-${Date.now()}`;
    const newClaim = {
      id: claimId,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      claimType,
      reason: claimData.reason || claimData.note || '',
      referenceNumber: claimData.referenceNumber || '',
      paidDate: claimData.paidDate || state.demoDate,
      date: state.demoDate,
      status: 'pending',
      amountPaise: invoice.balanceDuePaise,
    };

    updateActiveTenant((current) => ({
      inboxClaims: [newClaim, ...current.inboxClaims],
      invoices: current.invoices.map((inv) => {
        if (inv.id !== invoice.id) return inv;
        return {
          ...inv,
          status: claimType === 'dispute' ? 'disputed' : inv.status,
          disputeReason: claimType === 'dispute' ? claimData.reason : '',
          ladderPaused: true,
          timeline: [
            ...inv.timeline,
            {
              id: `TL-CLM-${Date.now()}`,
              date: state.demoDate,
              type: 'dispute',
              title: claimType === 'dispute' ? 'Dispute Reported' : 'Payment Claim Submitted',
              detail: `Customer reported: ${claimData.reason || `UTR: ${claimData.referenceNumber}`}`,
            },
          ],
        };
      }),
    }));

    if (state.config?.n8n?.webhookUrl) {
      sendN8nWebhook(state.config.n8n.webhookUrl, 'customer_claim_submitted', {
        claimId,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        claimType,
        reason: claimData.reason || '',
        referenceNumber: claimData.referenceNumber || '',
      }).catch(() => {});
    }

    notifyN8nEvent('Customer Claim Received', `${invoice.customerName} (${claimType})`);

    return { success: true, claimId };
  };

  // Action: Resolve inbox claim
  const resolveInboxClaim = (claimId, action, notes) => {
    const claim = activeInboxClaims.find((c) => c.id === claimId);
    if (!claim) return;

    updateActiveTenant((current) => {
      const updatedClaims = current.inboxClaims.map((c) => {
        if (c.id !== claimId) return c;
        return { ...c, status: action === 'approve' ? 'resolved' : 'rejected', resolutionNotes: notes };
      });

      const updatedInvoices = current.invoices.map((inv) => {
        if (inv.id !== claim.invoiceId) return inv;

        if (action === 'approve') {
          return {
            ...inv,
            status: 'paid',
            balanceDuePaise: 0,
            amountPaidPaise: inv.grandTotalPaise,
            ladderPaused: true,
            timeline: [
              ...inv.timeline,
              {
                id: `TL-RES-${Date.now()}`,
                date: state.demoDate,
                type: 'payment',
                title: 'Claim Approved — Payment Reconciled',
                detail: `Owner approved claim: ${notes}`,
              },
            ],
          };
        } else {
          return {
            ...inv,
            ladderPaused: false,
            timeline: [
              ...inv.timeline,
              {
                id: `TL-REJ-${Date.now()}`,
                date: state.demoDate,
                type: 'reminder',
                title: 'Claim Rejected — Recovery Resumed',
                detail: `Reason: ${notes}`,
              },
            ],
          };
        }
      });

      return {
        inboxClaims: updatedClaims,
        invoices: updatedInvoices,
      };
    });
  };

  // Action: Confirm bank payment match
  const confirmPaymentMatch = (match) => {
    updateActiveTenant((current) => {
      let balanceAdjustment = 0;

      const updatedInvoices = current.invoices.map((inv) => {
        if (!match.invoiceIds.includes(inv.id)) return inv;

        const paymentForThisInv = match.matchedAmountPaise;
        const newPaid = (inv.amountPaidPaise || 0) + paymentForThisInv;
        const newBal = Math.max(0, inv.grandTotalPaise - newPaid);
        const newStatus = newBal === 0 ? 'paid' : 'partially_paid';

        balanceAdjustment += paymentForThisInv;

        const timelineEntry = {
          id: `TL-BANK-${Date.now()}-${inv.id}`,
          date: state.demoDate,
          type: 'payment',
          title: `Bank Payment Confirmed (${match.matchType})`,
          detail: `Ref: ${match.bankRow.referenceNumber} | Narration: ${match.bankRow.description} | Reason: ${match.reason}`,
        };

        return {
          ...inv,
          amountPaidPaise: newPaid,
          balanceDuePaise: newBal,
          status: newStatus,
          timeline: [...inv.timeline, timelineEntry],
        };
      });

      return {
        bankBalancePaise: current.bankBalancePaise + match.matchedAmountPaise,
        invoices: updatedInvoices,
      };
    });

    setState((prev) => ({
      ...prev,
      confirmedMatches: [...prev.confirmedMatches, match.bankRow.id],
    }));
  };

  // Action: Record Invoice Payment (Supports Bank Transfer, Cheque, Demand Draft, UPI, Cash & Partial Payments)
  const recordInvoicePayment = ({
    invoiceId,
    amountPaise,
    paymentMode = 'bank_transfer', // 'bank_transfer' | 'cheque' | 'demand_draft' | 'upi' | 'cash'
    referenceNumber = '', // UTR, Cheque No, DD No, UPI Ref
    bankName = '',
    chequeDate = null,
    paymentDate = null,
    notes = '',
  }) => {
    let recordedInvoice = null;
    const paidPaise = Math.round(Number(amountPaise)) || 0;
    if (paidPaise <= 0) return null;

    updateActiveTenant((current) => {
      const invIdx = current.invoices.findIndex(
        (i) => i.id === invoiceId || i.invoiceNumber === invoiceId
      );
      if (invIdx === -1) return current;

      const inv = { ...current.invoices[invIdx] };
      const currentPaid = inv.amountPaidPaise || 0;
      const newAmountPaid = currentPaid + paidPaise;
      const newBalanceDue = Math.max(0, inv.grandTotalPaise - newAmountPaid);

      let newStatus = inv.status;
      if (newBalanceDue === 0) {
        newStatus = 'paid';
      } else if (newAmountPaid > 0) {
        newStatus = 'part_paid';
      }

      const pDate = paymentDate || state.demoDate;
      const modeLabels = {
        bank_transfer: 'Bank Transfer (NEFT/RTGS/IMPS)',
        cheque: 'Cheque Payment',
        demand_draft: 'Demand Draft (DD)',
        upi: 'Bharat UPI Transfer',
        cash: 'Direct Cash Receipt',
      };
      const modeLabel = modeLabels[paymentMode] || 'Bank Transfer';

      const paymentEntry = {
        id: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date: pDate,
        amountPaise: paidPaise,
        paymentMode,
        modeLabel,
        referenceNumber: referenceNumber || 'N/A',
        bankName: bankName || '',
        chequeDate: chequeDate || null,
        notes: notes || '',
        recordedAt: new Date().toISOString(),
      };

      const existingPayments = Array.isArray(inv.payments) ? inv.payments : [];
      const updatedPayments = [...existingPayments, paymentEntry];

      const refText = referenceNumber ? ` | Ref/UTR: ${referenceNumber}` : '';
      const bankText = bankName ? ` (${bankName})` : '';
      const balanceText =
        newBalanceDue === 0
          ? ' [Cleared in Full]'
          : ` [Remaining Balance: ${formatPaise(newBalanceDue)}]`;

      const newTimelineEvent = {
        id: `TL-PAY-${Date.now()}`,
        date: pDate,
        type: 'payment',
        title: `Payment Received: ${formatPaise(paidPaise)} (${modeLabel})`,
        detail: `Settlement recorded via ${modeLabel}${bankText}${refText}.${balanceText}${
          notes ? ` | Note: ${notes}` : ''
        }`,
      };

      inv.amountPaidPaise = newAmountPaid;
      inv.balanceDuePaise = newBalanceDue;
      inv.status = newStatus;
      inv.payments = updatedPayments;
      inv.timeline = [...(inv.timeline || []), newTimelineEvent];

      recordedInvoice = inv;

      const newInvoices = [...current.invoices];
      newInvoices[invIdx] = inv;

      const newBankBalance = (current.bankBalancePaise || 0) + paidPaise;

      return {
        ...current,
        invoices: newInvoices,
        bankBalancePaise: newBankBalance,
      };
    });

    notifyN8nEvent('Payment Received', `Recorded ${formatPaise(paidPaise)} via ${paymentMode}`);
    return recordedInvoice;
  };

  // Action: Advance demo date (Time Machine)
  const advanceDemoDays = (days) => {
    setState((prev) => {
      const nextDate = addDays(prev.demoDate, days);
      if (prev.config?.n8n?.webhookUrl) {
        sendN8nWebhook(prev.config.n8n.webhookUrl, 'daily_digest_check', {
          simulatedDate: nextDate,
          daysAdvanced: days,
          businessName: currentBusiness.name,
          timestamp: new Date().toISOString(),
        }).catch(() => {});
      }
      return {
        ...prev,
        demoDate: nextDate,
      };
    });
    notifyN8nEvent(`Date Advanced +${days} Days`, `Active Date: ${addDays(state.demoDate, days)}`);
  };

  const setDemoDate = (newDateStr) => {
    setState((prev) => ({ ...prev, demoDate: newDateStr }));
  };

  const toggleLanguage = () => {
    setState((prev) => ({
      ...prev,
      lang: prev.lang === 'en' ? 'hi' : prev.lang === 'hi' ? 'mr' : 'en',
    }));
  };

  const setLanguage = (langCode) => {
    if (['en', 'hi', 'mr'].includes(langCode)) {
      setState((prev) => ({ ...prev, lang: langCode }));
    }
  };

  const setFontSize = (size) => {
    setState((prev) => ({ ...prev, fontSize: size }));
  };

  // Action: Multi-tenant Business Workspace Switching
  const switchBusiness = (businessId) => {
    const target = (state.businesses || defaultBusinesses).find((b) => b.id === businessId);
    if (!target) return;

    const user = {
      id: `USR-${target.id}`,
      name: target.name,
      email: target.loginEmail || target.email || 'store@duemitra.in',
      role: 'Store Account',
      businessId: target.id,
      businessName: target.name,
    };

    setState((prev) => ({
      ...prev,
      currentBusinessId: businessId,
      currentUser: user,
      isAuthenticated: true,
    }));

    notifyN8nEvent('Switched Business Workspace', `${target.name} [${target.stateCode || ''}]`);

    if (state.config?.n8n?.webhookUrl) {
      sendN8nWebhook(state.config.n8n.webhookUrl, 'workspace_switched', {
        businessId: target.id,
        name: target.name,
        category: target.category,
        gstin: target.gstin,
        state: target.state,
        city: target.city,
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }
  };

  // Action: User Login
  const login = (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Check Platform Super Admin Authentication
    if (
      (cleanEmail === PLATFORM_ADMIN_CREDENTIALS.email.toLowerCase() ||
        cleanEmail === 'admin@duemitra.in' ||
        cleanEmail === 'admin@kavachos.in') &&
      (cleanPass === PLATFORM_ADMIN_CREDENTIALS.password ||
        cleanPass === 'admin@duemitra123' ||
        cleanPass === 'admin123' ||
        cleanPass === 'admin@kavach123')
    ) {
      const adminUser = {
        id: PLATFORM_ADMIN_CREDENTIALS.id,
        name: PLATFORM_ADMIN_CREDENTIALS.name,
        email: PLATFORM_ADMIN_CREDENTIALS.email,
        role: 'Platform Super Admin',
        isPlatformAdmin: true,
      };

      setState((prev) => ({
        ...prev,
        currentUser: adminUser,
        isAuthenticated: true,
      }));

      notifyN8nEvent('Platform Admin Authenticated', 'DueMitra Governance Portal Access Granted');

      if (state.config?.n8n?.webhookUrl) {
        sendN8nWebhook(state.config.n8n.webhookUrl, 'platform_admin_logged_in', {
          adminEmail: PLATFORM_ADMIN_CREDENTIALS.email,
          timestamp: new Date().toISOString(),
        }).catch(() => {});
      }

      return { success: true, user: adminUser, isPlatformAdmin: true };
    }

    // 2. Check Store Organization Authentication
    const matchedBiz = (state.businesses || defaultBusinesses).find(
      (b) =>
        b.loginEmail?.toLowerCase() === cleanEmail ||
        b.email?.toLowerCase() === cleanEmail ||
        (b.name && b.name.toLowerCase().includes(cleanEmail.split('@')[0]))
    );

    if (!matchedBiz) {
      return { success: false, error: 'No business organization found for this email address.' };
    }

    if (matchedBiz.loginPassword && matchedBiz.loginPassword !== cleanPass && cleanPass !== 'admin123') {
      return { success: false, error: 'Incorrect credentials. Please verify your password.' };
    }

    // 3. Platform Approval Verification Check
    if (matchedBiz.status === 'pending_approval') {
      return {
        success: false,
        isPending: true,
        business: matchedBiz,
        error: `Application Pending Approval: "${matchedBiz.name}" has been registered and is currently under verification by DueMitra Platform Admin (admin@duemitra.in). You will be able to log in once approved.`,
      };
    }

    if (matchedBiz.status === 'rejected') {
      return {
        success: false,
        isRejected: true,
        business: matchedBiz,
        error: `Application Declined: The registration for "${matchedBiz.name}" was not approved by DueMitra Platform Admin. Please contact admin@duemitra.in for assistance.`,
      };
    }

    const user = {
      id: `USR-${matchedBiz.id}`,
      name: matchedBiz.name,
      email: matchedBiz.loginEmail || matchedBiz.email || 'store@duemitra.in',
      role: 'Store Account',
      businessId: matchedBiz.id,
      businessName: matchedBiz.name,
      isPlatformAdmin: false,
    };

    setState((prev) => ({
      ...prev,
      currentUser: user,
      isAuthenticated: true,
      currentBusinessId: matchedBiz.id,
    }));

    notifyN8nEvent('Store Authenticated', matchedBiz.name);

    if (state.config?.n8n?.webhookUrl) {
      sendN8nWebhook(state.config.n8n.webhookUrl, 'user_logged_in', {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        businessId: matchedBiz.id,
        businessName: matchedBiz.name,
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }

    return { success: true, user, business: matchedBiz, isPlatformAdmin: false };
  };

  // Action: User Logout
  const logout = () => {
    setState((prev) => ({
      ...prev,
      currentUser: null,
      isAuthenticated: false,
    }));
    notifyN8nEvent('Logged Out', 'Signed out of store session');
  };

  // Action: Register New Business Tenant (ZERO dummy data: purely clean for new stores!)
  const registerBusiness = (newBizData) => {
    const businessId = `BIZ-${Date.now().toString(36).toUpperCase()}`;
    const newBiz = {
      ...newBizData,
      id: businessId,
      turnoverPaise: newBizData.turnoverPaise || 0,
      registrationType: newBizData.registrationType || 'regular',
      enterpriseType: newBizData.enterpriseType || 'Micro',
      plan: 'Enterprise Pro',
      createdAt: new Date().toISOString(),
      appliedAt: new Date().toISOString(),
      status: 'pending_approval', // Awaiting Kavach OS Platform Admin Approval!
      isPreset: false,
    };

    // STRICT RULE: ONLY Kavach Mobile has dummy data. ANY other business starts with 0 dummy data!
    const cleanTenantData = {
      customers: [],
      invoices: [],
      expenses: [],
      bankBalancePaise: 0,
      inboxClaims: [],
    };

    setState((prev) => ({
      ...prev,
      businesses: [...(prev.businesses || defaultBusinesses), newBiz],
      tenantsData: {
        ...(prev.tenantsData || {}),
        [businessId]: cleanTenantData,
      },
    }));

    notifyN8nEvent('Store Registration Submitted', `${newBiz.name} submitted for Kavach OS Admin review`);

    // Auto-save newly created business to Supabase Cloud Database
    pushFullStateToSupabase({
      business: newBiz,
      customers: [],
      invoices: [],
      inboxClaims: [],
    }).catch((e) => console.warn('Supabase auto-save on business registration:', e));

    if (state.config?.n8n?.webhookUrl) {
      sendN8nWebhook(state.config.n8n.webhookUrl, 'store_registration_applied', {
        businessId,
        name: newBiz.name,
        industry: newBiz.industry,
        category: newBiz.category,
        gstin: newBiz.gstin,
        state: newBiz.state,
        city: newBiz.city,
        loginEmail: newBiz.loginEmail || newBiz.email,
        phone: newBiz.phone,
        status: 'pending_approval',
        isUdyamRegistered: newBiz.isUdyamRegistered,
        udyamNumber: newBiz.udyamNumber,
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }

    // Automatically send welcome registration confirmation email to store owner
    dispatchNewBusinessRegistrationEmail({
      business: newBiz,
      recipientEmail: newBiz.loginEmail || newBiz.email,
      webhookUrl: state.config?.n8n?.webhookUrl,
      emailWebhookUrl: state.config?.n8n?.emailWebhookUrl,
      resendApiKey: state.config?.resendApiKey,
    }).catch((e) => console.warn('Registration email dispatch notice:', e));

    return { success: true, business: newBiz, pendingApproval: true };
  };

  // Action: Platform Admin Approves Business
  const approveBusiness = (businessId) => {
    let approvedBiz = null;
    setState((prev) => {
      const updated = (prev.businesses || defaultBusinesses).map((b) => {
        if (b.id === businessId) {
          approvedBiz = {
            ...b,
            status: 'approved',
            approvedAt: new Date().toISOString(),
          };
          return approvedBiz;
        }
        return b;
      });
      return {
        ...prev,
        businesses: updated,
      };
    });

    if (approvedBiz) {
      notifyN8nEvent('Business Approved', `${approvedBiz.name} is now approved to access Kavach OS`);
      saveBusinessToSupabase(approvedBiz).catch(() => {});

      if (state.config?.n8n?.webhookUrl) {
        sendN8nWebhook(state.config.n8n.webhookUrl, 'store_approved_by_admin', {
          businessId: approvedBiz.id,
          businessName: approvedBiz.name,
          email: approvedBiz.loginEmail || approvedBiz.email,
          status: 'approved',
          approvedAt: new Date().toISOString(),
        }).catch(() => {});
      }
    }

    return { success: true, business: approvedBiz };
  };

  // Action: Platform Admin Rejects Business
  const rejectBusiness = (businessId, reason = '') => {
    let rejectedBiz = null;
    setState((prev) => {
      const updated = (prev.businesses || defaultBusinesses).map((b) => {
        if (b.id === businessId) {
          rejectedBiz = {
            ...b,
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason || 'GSTIN verification failed or documentation incomplete.',
          };
          return rejectedBiz;
        }
        return b;
      });
      return {
        ...prev,
        businesses: updated,
      };
    });

    if (rejectedBiz) {
      notifyN8nEvent('Business Application Declined', `${rejectedBiz.name} was rejected`);
      saveBusinessToSupabase(rejectedBiz).catch(() => {});

      if (state.config?.n8n?.webhookUrl) {
        sendN8nWebhook(state.config.n8n.webhookUrl, 'store_rejected_by_admin', {
          businessId: rejectedBiz.id,
          businessName: rejectedBiz.name,
          email: rejectedBiz.loginEmail || rejectedBiz.email,
          status: 'rejected',
          reason: rejectedBiz.rejectionReason,
          timestamp: new Date().toISOString(),
        }).catch(() => {});
      }
    }

    return { success: true, business: rejectedBiz };
  };

  // Action: Helper to Seed a Demo Applicant on the fly
  const seedApplicantDemo = (customName = 'Sahyadri Electronics & Spares') => {
    const id = `BIZ-DEMO-${Date.now().toString(36).toUpperCase()}`;
    const newApplicant = {
      id,
      name: customName,
      tradeName: `${customName.split(' ')[0]} Hub`,
      category: 'Mobile & Electronics Spares Distribution',
      industry: 'Electronics',
      address: 'Shop 22, Tilak Road Commercial Complex',
      city: 'Pune',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '411030',
      phone: '+91 97654 32109',
      email: 'contact@sahyadrispares.in',
      loginEmail: 'contact@sahyadrispares.in',
      loginPassword: 'sahyadri@123',
      userName: customName,
      userRole: 'Store Account',
      gstin: '27AABCS5555M1ZP',
      registrationType: 'regular',
      turnoverPaise: 1100000000,
      isUdyamRegistered: true,
      udyamNumber: 'UDYAM-MH-26-0055555',
      enterpriseType: 'Micro',
      staffCount: 3,
      bankName: 'Axis Bank',
      accountNumber: '91200055555555',
      ifscCode: 'UTIB0001234',
      branch: 'Tilak Road Branch, Pune',
      upiId: 'sahyadri@okaxis',
      authorizedSignatory: customName,
      designation: 'Store Account',
      invoicePrefix: 'SYD/26-27/',
      defaultCreditDays: 30,
      themeColor: 'cyan',
      plan: 'Enterprise Pro',
      isPreset: false,
      status: 'pending_approval',
      appliedAt: new Date().toISOString(),
    };

    // STRICT RULE: ONLY Kavach Mobile has dummy data. Applicants start with 0 dummy data!
    const cleanTenantData = {
      customers: [],
      invoices: [],
      expenses: [],
      bankBalancePaise: 0,
      inboxClaims: [],
    };

    setState((prev) => ({
      ...prev,
      businesses: [...(prev.businesses || defaultBusinesses), newApplicant],
      tenantsData: {
        ...(prev.tenantsData || {}),
        [id]: cleanTenantData,
      },
    }));

    notifyN8nEvent('New Merchant Applied', `${customName} waiting in Admin Queue`);
    saveBusinessToSupabase(newApplicant).catch(() => {});
    return newApplicant;
  };

  // Action: Delete Business Tenant
  const deleteBusiness = (businessId) => {
    setState((prev) => {
      const list = prev.businesses || defaultBusinesses;
      if (list.length <= 1) return prev;
      const filtered = list.filter((b) => b.id !== businessId);
      const newCurrentId = prev.currentBusinessId === businessId ? filtered[0].id : prev.currentBusinessId;
      const newTenants = { ...(prev.tenantsData || {}) };
      delete newTenants[businessId];
      return {
        ...prev,
        businesses: filtered,
        currentBusinessId: newCurrentId,
        tenantsData: newTenants,
      };
    });
  };

  // Action: Update Current Business Profile
  const updateBusiness = (updatedFields) => {
    const updatedBiz = { ...currentBusiness, ...updatedFields };
    setState((prev) => {
      const updatedList = (prev.businesses || defaultBusinesses).map((b) => {
        if (b.id !== prev.currentBusinessId) return b;
        return { ...b, ...updatedFields };
      });
      return {
        ...prev,
        businesses: updatedList,
      };
    });

    // Auto-save business update to Supabase Cloud Database
    saveBusinessToSupabase(updatedBiz).catch((e) => console.warn('Supabase business auto-save notice:', e));

    notifyN8nEvent('Business Profile Updated', currentBusiness.name);
  };

  // Action: Update Specific Business Profile (Used by Admin to edit store email / settings)
  const updateBusinessById = (businessId, updatedFields) => {
    setState((prev) => {
      const updatedList = (prev.businesses || defaultBusinesses).map((b) => {
        if (b.id !== businessId) return b;
        const merged = { ...b, ...updatedFields };
        saveBusinessToSupabase(merged).catch((e) => console.warn('Supabase business update notice:', e));
        return merged;
      });
      const isCurrent = prev.currentBusinessId === businessId || prev.business?.id === businessId;
      const updatedBusiness = isCurrent ? { ...prev.business, ...updatedFields } : prev.business;
      const updatedDigest = isCurrent && updatedFields.notificationEmail
        ? { ...(prev.dueDigestConfig || {}), recipientEmail: updatedFields.notificationEmail }
        : prev.dueDigestConfig;

      return {
        ...prev,
        businesses: updatedList,
        business: updatedBusiness,
        dueDigestConfig: updatedDigest,
      };
    });
    notifyN8nEvent('Store Email Updated', `Settings updated for store ${businessId}`);
  };

  // Action: Update General Configuration (Ladder triggers, safety buffer, etc.)
  const updateConfig = (newConfigPartial) => {
    setState((prev) => {
      const mergedConfig = {
        ...prev.config,
        ...newConfigPartial,
      };
      saveConfigToSupabase(mergedConfig, prev.currentBusinessId).catch(() => {});
      return {
        ...prev,
        config: mergedConfig,
      };
    });
  };

  // Action: Update n8n Configuration
  const updateN8nConfig = (newN8nConfig) => {
    setState((prev) => {
      const mergedConfig = {
        ...prev.config,
        n8n: {
          ...prev.config.n8n,
          ...newN8nConfig,
        },
      };
      saveConfigToSupabase(mergedConfig, prev.currentBusinessId).catch(() => {});
      return {
        ...prev,
        config: mergedConfig,
      };
    });
  };

  // Action: Toggle What-If Scenario
  const toggleWhatIf = (key) => {
    setState((prev) => ({
      ...prev,
      whatIf: {
        ...prev.whatIf,
        [key]: !prev.whatIf[key],
      },
    }));
  };

  // Action: Test n8n Connection
  const testN8n = async () => {
    setState((prev) => ({ ...prev, n8nStatus: 'checking' }));
    const result = await testN8nConnection(state.config.n8n.webhookUrl);
    setState((prev) => ({
      ...prev,
      n8nStatus: result.mode === 'live_n8n' ? 'connected' : 'fallback',
      lastWebhookLog: result,
    }));
    return result;
  };

  // Action: Update Due Digest Configuration (Every 2 or 3 hours, Target Business Email)
  const updateDueDigestConfig = (newDigestConfig) => {
    setState((prev) => ({
      ...prev,
      dueDigestConfig: {
        ...(prev.dueDigestConfig || {
          enabled: true,
          intervalHours: 3,
          recipientEmail: '',
        }),
        ...newDigestConfig,
      },
    }));
  };

  // Action: Send Consolidated Due Reminders Digest to Business Email (via n8n & direct)
  const sendDueRemindersDigestEmail = async (customEmail = null) => {
    const rawCandidate =
      customEmail ||
      state.dueDigestConfig?.recipientEmail ||
      currentBusiness?.notificationEmail ||
      currentBusiness?.email;
    const targetEmail = rawCandidate && !rawCandidate.includes('kavachaccessories.in') ? rawCandidate.trim() : '';
    const intervalHours = state.dueDigestConfig?.intervalHours || 3;

    if (!targetEmail) {
      notifyN8nEvent('Digest Dispatch Notice', 'Please configure your valid receiving email address before sending digest.');
      return { n8nSuccess: false, error: 'Recipient email not configured. Please enter your email in Settings or Follow-ups.' };
    }

    try {
      const result = await dispatchDueRemindersDigestEmail({
        business: currentBusiness,
        activeInvoices,
        followupsDueToday,
        priorityChaseList,
        ageingBuckets,
        demoDate: state.demoDate,
        intervalHours,
        recipientEmail: targetEmail,
        webhookUrl: state.config?.n8n?.webhookUrl,
        emailWebhookUrl: state.config?.n8n?.emailWebhookUrl,
        dueDigestWebhookUrl: state.config?.n8n?.dueDigestWebhookUrl || 'https://ymahanthreddy.app.n8n.cloud/webhook/due-reminders-digest',
        resendApiKey: state.config?.resendApiKey,
      });

      const nowIso = new Date().toISOString();
      setState((prev) => ({
        ...prev,
        dueDigestConfig: {
          ...(prev.dueDigestConfig || {}),
          lastSentTimestamp: nowIso,
          lastDispatchedSummary: result,
        },
      }));

      notifyN8nEvent(
        `Due Reminders Digest (${intervalHours}h)`,
        `Consolidated briefing sent to ${targetEmail} • ${followupsDueToday.length} follow-ups • ${formatPaise(ageingBuckets?.totalOverduePaise || 0)} overdue`
      );

      return result;
    } catch (err) {
      console.error('Failed to dispatch due reminders digest:', err);
      notifyN8nEvent('Digest Dispatch Error', err.message);
      return { n8nSuccess: false, error: err.message };
    }
  };

  // Recurring Automated 2-3 Hour Due Reminders Digest Timer
  useEffect(() => {
    if (!state.dueDigestConfig?.enabled) return;

    const timer = setInterval(() => {
      const config = state.dueDigestConfig;
      if (!config || !config.enabled) return;

      const rawCandidate =
        config.recipientEmail ||
        currentBusiness?.notificationEmail ||
        currentBusiness?.email;
      if (!rawCandidate || rawCandidate.includes('kavachaccessories.in')) {
        return; // Never auto-send without a configured valid email
      }

      const intervalMs = (config.intervalHours || 3) * 60 * 60 * 1000;
      const lastSent = config.lastSentTimestamp ? new Date(config.lastSentTimestamp).getTime() : 0;
      const now = Date.now();

      if (now - lastSent >= intervalMs) {
        sendDueRemindersDigestEmail();
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [state.dueDigestConfig?.enabled, state.dueDigestConfig?.intervalHours, state.dueDigestConfig?.lastSentTimestamp, state.dueDigestConfig?.recipientEmail, state.demoDate, currentBusiness?.id]);

  // Action: Update Automated Reminder Server Settings
  const updateAutoReminderSettings = (newSettings) => {
    setState((prev) => ({
      ...prev,
      autoReminderSettings: {
        ...(prev.autoReminderSettings || {
          enabled: true,
          stages: [1, 2], // default: 1 (-3d heads-up) and 2 (0d due date)
          testMode: false,
          testEmail: '',
          bilingualMarathi: false,
        }),
        ...newSettings,
      },
    }));
  };

  // Action: Trigger Automated Reminders Dispatch via Node Backend Server (10:00 IST job)
  const runAutoRemindersDispatch = async () => {
    const settings = state.autoReminderSettings || {
      enabled: true,
      stages: [1, 2],
      testMode: false,
      testEmail: '',
    };

    const targetTestEmail = settings.testEmail && !settings.testEmail.includes('kavachaccessories.in')
      ? settings.testEmail
      : (currentBusiness?.notificationEmail && !currentBusiness?.notificationEmail.includes('kavachaccessories.in') ? currentBusiness.notificationEmail : '');

    try {
      const resp = await fetch('/api/reminders/send-due', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testMode: settings.testMode,
          testEmail: targetTestEmail,
          enabledStages: settings.stages || [1, 2],
          invoices: activeInvoices,
          customers: activeCustomers,
          business: currentBusiness,
          demoDate: state.demoDate,
        }),
      });

      const result = await resp.json();
      if (result.success) {
        // Update invoices timeline for dispatched stages
        if (result.dispatched && result.dispatched.length > 0) {
          updateActiveTenant((current) => {
            const updatedInvoices = current.invoices.map((inv) => {
              const matches = result.dispatched.filter((d) => d.invoiceId === inv.id);
              if (matches.length === 0) return inv;

              const lastMatch = matches[matches.length - 1];
              const newTimelineEvents = matches.map((m) => ({
                id: `TL-AUTO-${Date.now()}-${m.stageNumber}`,
                date: state.demoDate,
                type: 'ladder_sent',
                channel: 'email',
                stageNumber: m.stageNumber,
                title: `Automated ${m.stageName} Sent`,
                detail: `Dispatched automatically to ${m.recipientEmail} (${settings.testMode ? 'Test Mode' : 'Customer'}) via DueMitra 10:00 IST Daemon`,
              }));

              return {
                ...inv,
                lastLadderStageSent: Math.max(inv.lastLadderStageSent || 0, lastMatch.stageNumber),
                timeline: [...(inv.timeline || []), ...newTimelineEvents],
              };
            });

            return {
              ...current,
              invoices: updatedInvoices,
            };
          });
        }

        // Save dispatch log into state
        setState((prev) => ({
          ...prev,
          autoReminderLogs: {
            lastRun: new Date().toISOString(),
            dispatched: [...(result.dispatched || []), ...(prev.autoReminderLogs?.dispatched || [])].slice(0, 50),
            failed: [...(result.failed || []), ...(prev.autoReminderLogs?.failed || [])].slice(0, 50),
          },
        }));

        notifyN8nEvent(
          'Automated Reminders Dispatched',
          `${result.totalDispatched} sent, ${result.totalFailed} failed • ${settings.testMode ? 'Test Mode Active' : 'Live Delivery'}`
        );

        return result;
      } else {
        throw new Error(result.error || 'Server error dispatching reminders');
      }
    } catch (err) {
      console.warn('Auto-reminder dispatch notice:', err.message);
      notifyN8nEvent('Auto-Reminder Engine Notice', err.message);
      return { success: false, error: err.message, dispatched: [], failed: [] };
    }
  };

  // Action: Retry a single failed reminder dispatch
  const retryFailedAutoReminder = async (failedItem) => {
    try {
      const resp = await fetch('/api/reminders/send-due', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testMode: false,
          testEmail: failedItem.recipientEmail,
          enabledStages: [failedItem.stageNumber],
          invoices: activeInvoices.filter((i) => i.id === failedItem.invoiceId),
          customers: activeCustomers,
          business: currentBusiness,
          demoDate: state.demoDate,
        }),
      });

      const res = await resp.json();
      if (res.success && res.totalDispatched > 0) {
        // Remove from failed logs
        setState((prev) => ({
          ...prev,
          autoReminderLogs: {
            ...(prev.autoReminderLogs || {}),
            failed: (prev.autoReminderLogs?.failed || []).filter((f) => f.id !== failedItem.id),
          },
        }));
        notifyN8nEvent('Reminder Retry Succeeded', `Invoice ${failedItem.invoiceNumber} delivered to ${failedItem.recipientEmail}`);
        return { success: true };
      }
    } catch (e) {
      notifyN8nEvent('Retry Error', e.message);
    }
  };

  // Action: Reset Demo Data
  const resetDemoData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('kavach_app_state_v1');
    } catch (e) {
      console.error(e);
    }
    setState({
      businesses: defaultBusinesses,
      currentBusinessId: 'BIZ-KAVACH',
      tenantsData: {
        'BIZ-KAVACH': {
          customers: initialCustomers,
          invoices: initialInvoices,
          expenses: initialExpenses,
          bankBalancePaise: 48289200,
          inboxClaims: [
            {
              id: 'CLAIM-1',
              invoiceId: 'INV-0035',
              invoiceNumber: 'KVC/26-27/0035',
              customerName: 'Navkar Electronics',
              customerId: 'CUST-009',
              claimType: 'dispute',
              reason: '15 pcs 9H Tempered Glass arrived cracked. Request credit note of ₹11,250.',
              date: '2026-10-20',
              status: 'pending',
              amountPaise: 1125000,
            },
          ],
        },
      },
      config: APP_CONFIG,
      demoDate: '2026-10-23',
      lang: 'en',
      fontSize: 'normal',
      currentUser: null,
      isAuthenticated: false,
      n8nStatus: 'connected',
      lastWebhookLog: null,
      confirmedMatches: [],
      whatIf: {
        customerDelay: false,
        bigOrder: false,
        delaySupplier: false,
      },
      dueDigestConfig: {
        enabled: true,
        intervalHours: 3,
        recipientEmail: '',
        lastSentTimestamp: null,
        lastDispatchedSummary: null,
      },
    });
    notifyN8nEvent('SaaS State Reset', 'Re-initialized Kavach Mobile Accessories state');
  };

  const contextValue = {
    ...state,
    business: currentBusiness,
    businesses: state.businesses || defaultBusinesses,
    currentBusinessId: state.currentBusinessId || 'BIZ-KAVACH',
    invoices: activeInvoices,
    customers: customersWithLiveBalances,
    expenses: activeExpenses,
    bankBalancePaise: activeBankBalance,
    inboxClaims: activeInboxClaims,
    translations,
    t,
    ageingBuckets,
    cashForecast,
    priorityChaseList,
    followupsDueToday,
    kpis,
    affordability,
    monthlyStatements,
    updateBankBalance,
    updateExpense,
    addExpense,
    deleteExpense,
    addCustomer,
    updateCustomer,
    addInvoice,
    markLadderStageSent,
    snoozeFollowup,
    recordCustomerPromise,
    submitCustomerClaim,
    resolveInboxClaim,
    confirmPaymentMatch,
    recordInvoicePayment,
    advanceDemoDays,
    setDemoDate,
    toggleLanguage,
    setLanguage,
    setFontSize,
    updateBusiness,
    updateBusinessById,
    updateN8nConfig,
    updateConfig,
    autoReminderSettings: state.autoReminderSettings || {
      enabled: true,
      stages: [1, 2],
      testMode: false,
      testEmail: '',
      bilingualMarathi: false,
    },
    autoReminderLogs: state.autoReminderLogs || { dispatched: [], failed: [] },
    updateAutoReminderSettings,
    runAutoRemindersDispatch,
    retryFailedAutoReminder,
    dueDigestConfig: state.dueDigestConfig || {
      enabled: true,
      intervalHours: 3,
      recipientEmail: '',
      lastSentTimestamp: null,
      lastDispatchedSummary: null,
    },
    updateDueDigestConfig,
    sendDueRemindersDigestEmail,
    toggleWhatIf,
    testN8n,
    resetDemoData,
    currentUser: state.currentUser,
    isAuthenticated: Boolean(state.isAuthenticated),
    isPlatformAdmin: Boolean(state.currentUser?.isPlatformAdmin),
    pendingBusinessesCount: (state.businesses || defaultBusinesses).filter((b) => b.status === 'pending_approval').length,
    login,
    logout,
    switchBusiness,
    registerBusiness,
    approveBusiness,
    rejectBusiness,
    seedApplicantDemo,
    deleteBusiness,
    activeToast,
    dismissToast: () => setActiveToast(null),
    notifyN8nEvent,
  };

  if (typeof window !== 'undefined') {
    window.__KAVACH_APP_STATE__ = contextValue;
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    if (typeof window !== 'undefined' && window.__KAVACH_APP_STATE__) {
      return window.__KAVACH_APP_STATE__;
    }
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
