import { createClient } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://oigyyzbpfsbbuoctkwjy.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_W8DZaG4-o9YLF6t4k5meYw_3J3DN8Ke';

// Singleton Supabase client to prevent multiple GoTrueClient instances warning
export const supabase = (typeof window !== 'undefined' && window.__KAVACH_SUPABASE_CLIENT__)
  ? window.__KAVACH_SUPABASE_CLIENT__
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

if (typeof window !== 'undefined') {
  window.__KAVACH_SUPABASE_CLIENT__ = supabase;
}

/**
 * Checks if Supabase connection is healthy
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('kavach_business').select('id').limit(1);
    if (error) {
      const msg = error.message || '';
      // If table doesn't exist yet, we still know endpoint is live and authenticated
      if (
        msg.includes('schema cache') ||
        msg.includes('relation') ||
        msg.includes('table') ||
        error.code === 'PGRST205' ||
        error.code === '42P01'
      ) {
        return {
          connected: true,
          tablesCreated: false,
          message: 'Connected to Supabase! (Run schema.sql in Supabase SQL Editor to initialize tables)',
        };
      }
      return { connected: false, error: error.message };
    }
    return { connected: true, tablesCreated: true, message: 'Connected & Synced with Supabase Cloud!' };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

/**
 * Automatically saves or updates a business in Supabase
 */
export async function saveBusinessToSupabase(business) {
  if (!business) return null;
  try {
    const bizId = business.id || 'primary';
    const payload = {
      id: bizId,
      name: business.name,
      trade_name: business.tradeName || business.name,
      gstin: business.gstin || '',
      state: business.state || 'Maharashtra',
      state_code: business.stateCode || '27',
      phone: business.phone || '',
      email: business.loginEmail || business.email || '',
      upi_id: business.upiId || '',
      account_number: business.accountNumber || '',
      ifsc_code: business.ifscCode || '',
      turnover_paise: business.turnoverPaise || 0,
      is_udyam_registered: business.isUdyamRegistered ?? true,
      udyam_number: business.udyamNumber || '',
      data: business,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('kavach_business').upsert(payload);
    if (error) console.warn('Supabase business save notice:', error.message);

    // Also update 'primary' for backward compatibility
    if (bizId === 'BIZ-KAVACH') {
      try {
        await supabase.from('kavach_business').upsert({ ...payload, id: 'primary' });
      } catch (e) {
        // ignore fallback error
      }
    }
    return { success: !error, error };
  } catch (err) {
    console.warn('Supabase business save error:', err.message);
    return { success: false, error: err };
  }
}

/**
 * Automatically saves or updates a customer in Supabase
 */
export async function saveCustomerToSupabase(customer) {
  if (!customer) return null;
  try {
    const row = {
      id: customer.id,
      name: customer.name,
      trade_name: customer.tradeName || customer.name,
      contact_person: customer.contactPerson || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || 'Pune',
      state: customer.state || 'Maharashtra',
      state_code: customer.stateCode || '27',
      gstin: customer.gstin || '',
      is_registered: !!customer.gstin,
      credit_days: customer.creditDays || 30,
      avg_days_late: customer.avgDaysLate || 0,
      on_time_rate: customer.onTimePaymentRate || 90,
      reliability_grade: customer.reliabilityGrade || 'A',
      reliability_reason: customer.reliabilityReason || '',
      outstanding_paise: customer.outstandingPaise || 0,
      data: customer,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('kavach_customers').upsert(row);
    if (error) console.warn('Supabase customer save notice:', error.message);
    return { success: !error, error };
  } catch (err) {
    console.warn('Supabase customer save error:', err.message);
    return { success: false, error: err };
  }
}

/**
 * Automatically saves or updates an invoice in Supabase
 */
export async function saveInvoiceToSupabase(invoice, customer = null) {
  if (!invoice) return null;
  try {
    // If customer provided and not yet in Supabase, ensure customer is upserted first to satisfy foreign key
    if (customer && customer.id) {
      await saveCustomerToSupabase(customer);
    } else if (invoice.customerId) {
      // Upsert a minimal customer placeholder if missing to satisfy foreign key constraint
      try {
        await supabase.from('kavach_customers').upsert({
          id: invoice.customerId,
          name: invoice.customerName || 'Trade Dealer',
          trade_name: invoice.customerTradeName || invoice.customerName || 'Trade Dealer',
          contact_person: invoice.customerName || 'Store Accounts',
          phone: invoice.customerPhone || '',
          email: invoice.customerEmail || '',
          gstin: invoice.customerGstin || '',
          city: invoice.customerCity || 'Pune',
          state: invoice.customerState || 'Maharashtra',
          state_code: invoice.customerStateCode || '27',
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        // ignore fallback error
      }
    }

    const row = {
      id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      invoice_date: invoice.invoiceDate,
      due_date: invoice.dueDate,
      customer_id: invoice.customerId,
      customer_name: invoice.customerName,
      customer_gstin: invoice.customerGstin || '',
      status: invoice.status,
      grand_total_paise: invoice.grandTotalPaise,
      amount_paid_paise: invoice.amountPaidPaise || 0,
      balance_due_paise: invoice.balanceDuePaise,
      token: invoice.token,
      ladder_paused: invoice.ladderPaused || false,
      last_ladder_stage_sent: invoice.lastLadderStageSent || null,
      data: invoice,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('kavach_invoices').upsert(row);
    if (error) console.warn('Supabase invoice save notice:', error.message);
    return { success: !error, error };
  } catch (err) {
    console.warn('Supabase invoice save error:', err.message);
    return { success: false, error: err };
  }
}

/**
 * Automatically saves or updates an inbox claim in Supabase
 */
export async function saveClaimToSupabase(claim) {
  if (!claim) return null;
  try {
    const row = {
      id: claim.id,
      invoice_id: claim.invoiceId || null,
      invoice_number: claim.invoiceNumber || '',
      customer_id: claim.customerId || '',
      customer_name: claim.customerName || '',
      claim_type: claim.claimType,
      status: claim.status || 'pending',
      reason: claim.reason || '',
      reference_number: claim.referenceNumber || '',
      amount_paise: claim.amountPaise || 0,
      data: claim,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('kavach_inbox_claims').upsert(row);
    if (error) console.warn('Supabase claim save notice:', error.message);
    return { success: !error, error };
  } catch (err) {
    console.warn('Supabase claim save error:', err.message);
    return { success: false, error: err };
  }
}

/**
 * Automatically saves all operating expenses to Supabase
 */
export async function saveExpensesToSupabase(expenses, bizId = 'BIZ-KAVACH') {
  try {
    const { data: existing } = await supabase.from('kavach_business').select('*').eq('id', bizId).single();
    const currentData = existing?.data || {};
    const updatedData = {
      ...currentData,
      expenses,
      updated_at: new Date().toISOString(),
    };

    let error = null;
    if (existing) {
      const res = await supabase.from('kavach_business').update({ data: updatedData }).eq('id', bizId);
      error = res.error;
    } else {
      const res = await supabase.from('kavach_business').upsert({
        id: bizId,
        name: 'Kavach Mobile Accessories',
        data: updatedData,
      });
      error = res.error;
    }

    if (error) console.warn('Supabase expenses save notice:', error.message);
    return { success: !error, error };
  } catch (err) {
    console.warn('Supabase expenses save error:', err.message);
    return { success: false, error: err };
  }
}

/**
 * Automatically saves live bank balance to Supabase
 */
export async function saveBankBalanceToSupabase(bankBalancePaise, bizId = 'BIZ-KAVACH') {
  try {
    const { data: existing } = await supabase.from('kavach_business').select('*').eq('id', bizId).single();
    const currentData = existing?.data || {};
    const updatedData = {
      ...currentData,
      bankBalancePaise,
      updated_at: new Date().toISOString(),
    };

    let error = null;
    if (existing) {
      const res = await supabase.from('kavach_business').update({ data: updatedData }).eq('id', bizId);
      error = res.error;
    } else {
      const res = await supabase.from('kavach_business').upsert({
        id: bizId,
        name: 'Kavach Mobile Accessories',
        data: updatedData,
      });
      error = res.error;
    }

    if (error) console.warn('Supabase bank balance save notice:', error.message);
    return { success: !error, error };
  } catch (err) {
    console.warn('Supabase bank balance save error:', err.message);
    return { success: false, error: err };
  }
}

/**
 * Automatically saves system & n8n configuration to Supabase
 */
export async function saveConfigToSupabase(config, bizId = 'BIZ-KAVACH') {
  try {
    const { data: existing } = await supabase.from('kavach_business').select('*').eq('id', bizId).single();
    const currentData = existing?.data || {};
    const updatedData = {
      ...currentData,
      config,
      updated_at: new Date().toISOString(),
    };

    let error = null;
    if (existing) {
      const res = await supabase.from('kavach_business').update({ data: updatedData }).eq('id', bizId);
      error = res.error;
    } else {
      const res = await supabase.from('kavach_business').upsert({
        id: bizId,
        name: 'Kavach Mobile Accessories',
        data: updatedData,
      });
      error = res.error;
    }

    if (error) console.warn('Supabase config save notice:', error.message);
    return { success: !error, error };
  } catch (err) {
    console.warn('Supabase config save error:', err.message);
    return { success: false, error: err };
  }
}

/**
 * Loads all live business data directly from Supabase Cloud Database
 */
export async function loadAllDataFromSupabase(currentBizId = 'BIZ-KAVACH') {
  try {
    const [bizRes, custRes, invRes, claimRes] = await Promise.all([
      supabase.from('kavach_business').select('*'),
      supabase.from('kavach_customers').select('*'),
      supabase.from('kavach_invoices').select('*'),
      supabase.from('kavach_inbox_claims').select('*'),
    ]);

    const bizRows = bizRes.data || [];
    const custRows = custRes.data || [];
    const invRows = invRes.data || [];
    const claimRows = claimRes.data || [];

    const activeBizRow = bizRows.find((b) => b.id === currentBizId) || bizRows[0];
    const bizData = activeBizRow?.data || {};

    return {
      success: true,
      businesses: bizRows.map((b) => ({ ...(b.data || {}), id: b.id, name: b.name })),
      expenses: bizData.expenses || null,
      bankBalancePaise: typeof bizData.bankBalancePaise === 'number' ? bizData.bankBalancePaise : null,
      config: bizData.config || null,
      customers: custRows.map((r) => ({
        ...(r.data || {}),
        id: r.id,
        name: r.name,
        tradeName: r.trade_name || r.name,
        contactPerson: r.contact_person,
        phone: r.phone,
        email: r.email,
        address: r.address,
        city: r.city,
        state: r.state,
        stateCode: r.state_code,
        gstin: r.gstin,
        creditDays: r.credit_days,
        avgDaysLate: r.avg_days_late,
        onTimePaymentRate: r.on_time_rate,
        reliabilityGrade: r.reliability_grade,
        reliabilityReason: r.reliability_reason,
        outstandingPaise: r.outstanding_paise,
      })),
      invoices: invRows.map((r) => ({
        ...(r.data || {}),
        id: r.id,
        invoiceNumber: r.invoice_number,
        invoiceDate: r.invoice_date,
        dueDate: r.due_date,
        customerId: r.customer_id,
        customerName: r.customer_name,
        customerGstin: r.customer_gstin,
        status: r.status,
        grandTotalPaise: r.grand_total_paise,
        amountPaidPaise: r.amount_paid_paise,
        balanceDuePaise: r.balance_due_paise,
        token: r.token,
        ladderPaused: r.ladder_paused,
        lastLadderStageSent: r.last_ladder_stage_sent,
      })),
      claims: claimRows.map((r) => ({
        ...(r.data || {}),
        id: r.id,
        invoiceId: r.invoice_id,
        invoiceNumber: r.invoice_number,
        customerId: r.customer_id,
        customerName: r.customer_name,
        claimType: r.claim_type,
        status: r.status,
        reason: r.reason,
        referenceNumber: r.reference_number,
        amountPaise: r.amount_paise,
      })),
    };
  } catch (err) {
    console.warn('Error loading from Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Uploads full local state to Supabase Cloud
 */
export async function pushFullStateToSupabase({ business, customers, invoices, inboxClaims }) {
  const results = { business: false, customers: 0, invoices: 0, claims: 0, errors: [] };

  try {
    // 1. Business
    if (business) {
      const bRes = await saveBusinessToSupabase(business);
      if (bRes && bRes.success) results.business = true;
      else if (bRes && bRes.error) results.errors.push(`Business error: ${bRes.error.message}`);
    }

    // 2. Customers
    if (customers && customers.length > 0) {
      for (const c of customers) {
        const cRes = await saveCustomerToSupabase(c);
        if (cRes && cRes.success) results.customers++;
        else if (cRes && cRes.error) results.errors.push(`Customer ${c.name} error: ${cRes.error.message}`);
      }
    }

    // 3. Invoices
    if (invoices && invoices.length > 0) {
      for (const inv of invoices) {
        const iRes = await saveInvoiceToSupabase(inv);
        if (iRes && iRes.success) results.invoices++;
        else if (iRes && iRes.error) results.errors.push(`Invoice ${inv.invoiceNumber} error: ${iRes.error.message}`);
      }
    }

    // 4. Claims
    if (inboxClaims && inboxClaims.length > 0) {
      for (const cl of inboxClaims) {
        const clRes = await saveClaimToSupabase(cl);
        if (clRes && clRes.success) results.claims++;
        else if (clRes && clRes.error) results.errors.push(`Claim error: ${clRes.error.message}`);
      }
    }

    return results;
  } catch (err) {
    results.errors.push(err.message);
    return results;
  }
}
