# DueMitra (द्यूमित्र) — Autonomous Trade Credit & Receivables ERP

> **Problem Statement 4: The Small Business Invoice Chase**  
> *Track: Finance & Banking • Focus: Small Businesses · Receivables · Cash Flow Management*

---

## 1. The Problem & Target Audience

### The Problem in Two Lines
Small businesses in India lose working capital and sleep because customers delay payments for weeks, creating acute cash shortages for rent, salaries, and inventory even when the business is profitable on paper. Without dedicated accounting teams, business owners lack a simple system to track dues, anticipate buffer breaches, and escalate payment requests professionally without ruining customer relationships.

### Who the App is For
DueMitra is built for **Indian MSME manufacturers, distributors, traders, and wholesale merchants** (e.g., electronics, FMCG, packaging, auto parts, textiles) who sell on 15 to 45-day commercial trade credit and struggle with manual follow-ups, delayed collections, and unpredicted cash crunches.

---

## 2. What DueMitra Does (One Line per Screen)

- **Dashboard (`/dashboard`)**: Displays real-time receivables KPIs (total to collect, overdue, cash in bank, 30-day bills), an ageing breakdown bar, and the top 5 priority invoices to chase.
- **Invoices (`/invoices`)**: Organises all receivables with live status filters, customer search, balance tracking in whole paise, and instant print/PDF previews.
- **Create Invoice Modal (`/invoices/new`)**: Generates GST-compliant Tax Invoices or Bills of Supply with live tax math, Modulo-36 GSTIN check-digit validation, and instant UPI QR generation.
- **Trade Accounts (`/customers`)**: Manages customer credit limits, payment history, average payment delay, and dynamic A/B/C credit health grades with plain-language reasons.
- **Today's Follow-ups (`/followups`)**: Automates daily collection workflows with pre-drafted personalized messages, one-tap WhatsApp links (`wa.me`), SMS, and direct email dispatch.
- **Escalation Ladder (`/ladder`)**: Configures an editable 6-stage escalation protocol that automatically progresses overdue bills and pauses immediately on disputes or promises to pay.
- **Claims & Disputes Inbox (`/inbox`)**: Centralizes buyer payment claims, submitted UTR numbers, and billing disputes before disputes turn into defaults.
- **Bank Reconciliation (`/payments`)**: Imports bank CSV statements and matches credits using AI, detecting 1% or 2% Section 194C/Q TDS deductions, split receipts, and partial payments.
- **13-Week Cash Forecast (`/forecast`)**: Simulates 13-week rolling cash liquidity, warns when balance breaches the safety buffer, flags the lowest trough week, and models What-If switches.
- **Priority Chase (`/chase`)**: Ranks invoices requiring urgent attention using financial impact scores and plain-language explanations of which bills bridge the cash gap.
- **Evidence Dossiers (`/documents`)**: Generates print-ready A4 Tax Invoices, Section 16 MSMED Demand Letters, and court-admissible commercial claim evidence dossiers.
- **Settings & Business Profile (`/settings`)**: Manages multi-tenant store profiles, safety cash reserves, escalation trigger days, trilingual language preferences, and simulated demo dates.
- **Customer Pay & Dispute Portal (`/pay/:invoiceId`)**: Provides buyers with a clean self-service link to pay via UPI, upload payment UTR receipts ("Already Paid"), or flag billing errors ("Something's Wrong").

---

## 3. GST Calculation & Invoice Types

### How GST is Worked Out
- **Whole Paise Precision**: All currency math is stored and calculated in whole integer paise internally (₹1 = 100 paise) to eliminate floating-point rounding errors.
- **Line-by-Line Calculation**: Each line item's taxable value equals `(Quantity × Rate) - Discount`. Taxes are calculated per line item and rounded to the nearest paisa.
- **Intra-State vs. Inter-State Routing**:
  - If the **Supplier State Code** matches the **Place of Supply / Customer State Code** (e.g., both `27` Maharashtra): the GST rate is halved into **CGST** and **SGST** (e.g., 18% GST = 9% CGST + 9% SGST).
  - If state codes differ (e.g., `27` Maharashtra to `29` Karnataka): the entire rate is levied as **IGST** (18%).
- **GSTIN Modulo-36 Check-Digit Algorithm**: Verifies standard 15-character Indian GSTINs using the official government Modulo-36 weighted algorithm across characters `0-9, A-Z`.
- **Automatic Round-Off Line**: The difference between the sum of line totals and the nearest whole rupee is automatically calculated and shown as a `Round Off` line item.
- **Amount in Words**: Totals are formatted in the traditional Indian numbering system (Lakhs and Crores) via `numberToWordsIndian`.

### Which Invoice Type is Issued When
1. **Tax Invoice**: Issued by Regular GST-registered businesses when supplying taxable goods or services to B2B or B2C buyers. Displays full tax breakdowns (CGST/SGST/IGST), HSN codes, and GSTINs under Rule 46 of the CGST Rules, 2017.
2. **Bill of Supply**: Issued by Composition Scheme dealers (under Section 10 of CGST Act) or businesses supplying wholly exempt goods. Carries the statutory header *"Composition taxable person, not eligible to collect tax on supplies"*; no tax is charged.
3. **Invoice (Plain Commercial Bill)**: Issued by small unregistered merchants operating below the mandatory GST threshold limit (₹40 Lakhs for goods / ₹20 Lakhs for services).
4. **e-Invoicing (IRN) Advisory**: When business turnover exceeds ₹5 Crore, DueMitra automatically displays the statutory advisory highlighting that an Invoice Reference Number (IRN) is mandatory on the GST Portal.

---

## 4. Escalation Ladder & Payment Demand Letter

### How the Escalation Ladder Works
DueMitra progresses unpaid invoices through 6 distinct stages based on days past the agreed payment terms:
1. **Stage 1: Friendly Heads-up (-3 Days)**: Courteous advance notice before maturity.
2. **Stage 2: Due Date Reminder (Day 0)**: Notification that the payment is due today with an instant UPI payment link.
3. **Stage 3: Overdue Follow-up (+7 Days)**: Firmer reminder highlighting that the payment has lapsed past credit terms.
4. **Stage 4: Firm Reminder (+15 Days)**: Formal notice warning of temporary credit holds and distributor supply pauses.
5. **Stage 5: Payment Demand Letter (+30 Days)**: Official non-litigation demand letter with statutory MSMED interest calculations.
6. **Stage 6: Commercial Dispute / MSME Samadhaan (+45 Days)**: Preparation of the evidentiary dossier for submission to the MSME Facilitation Council under Section 18 of the MSMED Act.

### Anti-Spam & Automatic Pause Safeguards
- **Dispute Pause**: If a customer reports an issue through their self-service link ("Something's Wrong"), the escalation ladder freezes instantly.
- **Promise-to-Pay Pause**: If a buyer submits a promised payment date, reminders are silenced until that date passes.
- **Anti-Spam Frequency Cap**: A customer never receives more than one automated reminder per day, even if multiple invoices are overdue.
- **No Duplicate Stages**: The system records sent stages and never repeats the same stage twice.

### Why the Demand Letter is Clearly NOT a Legal or GST Notice
In strict accordance with the hackathon rules and commercial law:
- **Explicit Prominent Disclaimer**: Every generated demand letter includes a prominent amber banner:
  > *"Important Notice: This letter is from Kavach Mobile Accessories about money owed for the invoices listed below. It is not a notice from the GST department and not a legal notice from a lawyer."*
- **No Legal Notice Misrepresentation**: The document is titled **"Payment Demand Letter"** (never "Legal Notice").
- **Statutory MSMED Reference**: For Udyam-registered enterprises, the letter cites Section 16 of the MSMED Act, 2006, calculating compound interest with monthly rests at 3 times the RBI Bank Rate (19.5% p.a.), presenting it purely as a commercial contractual fact sheet.

---

## 5. Payment Matching, Cash Forecasting & Chase Scoring

### How Payments are Matched (Bank Reconciliation)
DueMitra imports standard Indian bank statement CSVs (HDFC, ICICI, SBI, Axis) and matches credits against open receivables using an intelligent 6-flag rules engine:
1. **EXACT_MATCH**: Amount and invoice number or customer trade name match with 100% confidence.
2. **POSSIBLE_TDS**: The credited amount is exactly 1% or 2% lower than the invoice value. In India, corporate buyers legally deduct 2% TDS under Section 194C/194Q. DueMitra detects this automatically and prevents the owner from wrongfully chasing the customer for tax deducted at source.
3. **PARTIAL_PAYMENT**: Customer paid a partial installment; the invoice remains open with an updated balance due.
4. **MULTIPLE_INVOICES**: A single lump-sum NEFT/RTGS transaction settles two or more open invoices.
5. **ADVANCE_PAYMENT**: Money received exceeds the open invoice balance.
6. **UNKNOWN_PAYEE**: Unidentified bank credit requiring manual review before reconciliation.

### How the 13-Week Cash Forecast Works
- Projects weekly opening balance, expected inflows, and scheduled operating outflows over 13 rolling weeks (91 days).
- **Behavior-Adjusted Inflows**: Inflows are mapped not just to invoice due dates, but adjusted by each customer's historical average payment delay (`avgDaysLate`).
- **Committed Outflows**: Models recurring monthly shop commitments including contractual shop rent (with 5% annual compounding escalation), fleet delivery fuel, MSME term loan EMIs, staff salaries, and utility fiber lines.
- **Trough Week & Buffer Warning**: Identifies the single lowest projected bank balance ("Trough Week") and triggers a shortfall alert whenever projected cash dips below the owner's safety reserve buffer (default: ₹2,00,000).
- **What-If Switches**: Interactive switches simulate scenarios such as: *What if our largest dealer delays payment by 30 days?* or *What if we postpone a supplier payout?*

### How the "Chase These First" Score is Worked Out
Invoices are ranked dynamically based on financial impact:
$$\text{Chase Score} = \left(\frac{\text{Balance Due in Paise}}{100}\right) \times (\text{Days Overdue} + 1)$$
If collecting an invoice covers the projected deficit in the forecast's Trough Week, the invoice receives a **Gap Bridge Boost** and is marked with a clear explanation in plain words (e.g., *"₹45,000 is 15 days overdue, covers the projected operating deficit in week 3"*).

---

## 6. How It Improves on Chasing Payments by Hand Today

| Manual Chasing (Status Quo) | DueMitra Autonomous ERP |
|---|---|
| **Sticky notes & Excel spreadsheets** that get outdated the moment an invoice is raised. | **Live real-time ledger** tracking due dates, partial payments, and ageing buckets automatically. |
| **Awkward, emotional phone calls** that damage long-standing dealer relationships. | **Structured 6-stage escalation ladder** progressing from courteous courtesy notices to formal demand letters. |
| **Chasing the wrong customer**: spending time chasing ₹5,000 while a ₹1,50,000 bill slips 60 days late. | **Smart Priority Chase**: algorithms rank invoices based on cash impact and upcoming expense shortfall needs. |
| **Mistaking 2% TDS for non-payment**: owner fights with buyer over a ₹2,000 shortfall that was actually remitted to the Income Tax Dept. | **Automated Section 194C/Q TDS detection**: flags 1% and 2% deductions instantly during bank statement reconciliation. |
| **Blindsided by rent and salary day**: business appears profitable on paper, but bank account has zero balance on the 1st of the month. | **13-Week Cash Flow Forecast**: warns the owner weeks in advance of the exact Trough Week and the specific invoices needed to bridge the gap. |
| **Unsubstantiated claims**: buyer denies receiving goods or messages when legal action is finally attempted. | **One-click Evidence Dossiers**: compiles signed delivery receipts, GST invoices, WhatsApp logs, and demand letters into an audit-ready pack. |
| **Language barriers**: English-only software creating confusion for local regional shopkeepers. | **Trilingual localization** in English, Hindi, and Marathi, routing customer links and reminders in their preferred language. |

---

## 7. Setup, Local Run & Architecture

### Prerequisites
- **Node.js** v18+ or v20+
- **npm** v9+

### Quick Local Run
```bash
# 1. Clone the repository
git clone https://github.com/your-org/duemitra.git
cd duemitra

# 2. Install dependencies
npm install

# 3. Start the Express backend server (Port 3001)
npm run server

# 4. In a second terminal, start the Vite frontend (Port 5174 or 5173)
npm run dev
```

### What is Simulated vs. What is Live
- **Live & Production-Ready**:
  - Full client-side React 19 ERP with Supabase cloud replication.
  - Complete GST calculation engine with Modulo-36 check-digit verification.
  - 13-week cash forecasting engine and affordability math.
  - Interactive WhatsApp deep links (`wa.me`) with URL-encoded messages and UPI QR code generation.
  - Print-to-PDF generation for Tax Invoices, Demand Letters, and Evidence Dossiers with high-contrast black ink.
  - Automated test suite (17/17 tests passing).
- **Simulated for Hackathon Demonstration**:
  - **Simulated Demo Date**: Built-in time machine controller allowing judges to advance the calendar by 1, 7, or 30 days to see invoices age and escalation stages trigger in real time.
  - **Email Dispatch**: Configured to route through Resend API; if no API key is provided, the backend falls back to an intelligent test simulator logging dispatched emails.
  - **Bank Statements**: Includes built-in sample Indian bank statement CSVs for 1-click reconciliation demo.

### What We'd Build Next
1. **Account Aggregator (AA) Live Bank Feeds**: Direct real-time fetch of bank credits via Sahamati / RBI Account Aggregator framework instead of manual CSV uploads.
2. **WhatsApp Business Cloud API (WABA)**: Automated webhook dispatch of pre-approved Meta template messages without requiring user device interaction.
3. **Direct MSME Samadhaan API Integration**: 1-click XML/JSON export and direct submission to the Ministry of MSME Facilitation Council portal.
4. **GSTN Portal API Synchronization**: Direct sync with GSTR-1 and GSTR-2B to verify customer input tax credits in real time.

---

## 8. License & Team
Built with precision for the **National MSME Hackathon 2026** • Track: Finance & Banking (Problem Statement 4).
