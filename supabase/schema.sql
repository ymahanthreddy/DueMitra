-- Kavach Database Schema for Supabase
-- Copy and run this in Supabase SQL Editor: https://supabase.com/dashboard/project/oigyyzbpfsbbuoctkwjy/sql

-- 1. Business Profile
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

-- 2. Customers
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

-- 3. Invoices
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

-- 4. Customer Claims & Disputes
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

-- 5. Enable Row Level Security (RLS) with open hackathon demo policies
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
CREATE POLICY "Allow public write on kavach_inbox_claims" ON kavach_inbox_claims FOR ALL USING (true);

