// English UI strings for DueMitra

export const en = {
  appName: 'DueMitra',
  tagline: 'Autonomous Trade Credit & Cash Flow Protection',
  
  // Navigation
  nav: {
    dashboard: 'Dashboard',
    invoices: 'Invoices',
    newInvoice: 'New Invoice',
    customers: 'Customers',
    followups: 'Follow-ups',
    ladder: 'Ladder',
    inbox: 'Inbox',
    payments: 'Reconciliation',
    forecast: 'Cash Forecast',
    bankExpenses: 'Bank & Expenses',
    chase: 'Priority Chase',
    documents: 'Documents',
    settings: 'Settings',
  },

  // Common buttons & actions
  actions: {
    saveDraft: 'Save Draft',
    sendInvoice: 'Generate & Send',
    markAsSent: 'Mark as Sent',
    snooze: 'Snooze 3 Days',
    promiseToPay: 'Record Promised Date',
    viewInvoice: 'View Invoice',
    viewTimeline: 'View Timeline',
    printA4: 'Print / Save PDF',
    downloadEvidence: 'Evidence Pack (PDF)',
    filter: 'Filter',
    search: 'Search...',
    resetDemo: 'Reset Demo Data',
    cancel: 'Cancel',
    confirm: 'Confirm',
    apply: 'Apply',
    simulatePay: 'Simulate UPI Payment',
    testWebhook: 'Test n8n Webhook',
    uploadCsv: 'Import Statement CSV',
    matchAll: 'Auto-Match Credits',
    acceptClaim: 'Accept & Resolve',
    rejectClaim: 'Reject Claim',
    includeMsmeInterest: 'Include MSME late payment interest in letter',
  },

  // Terminology & Tooltips (Plain words with accounting tooltips)
  terms: {
    moneyToCollect: 'Money to Collect',
    moneyToCollectTip: 'Accounts Receivable: Total unpaid dues from customers',
    overdueAmount: 'Overdue Amount',
    overdueAmountTip: 'Bills that have crossed their credit period',
    expectedThisWeek: 'Expected This Week',
    expectedThisWeekTip: 'Inflows projected based on customer payment history',
    expectedThisMonth: 'Expected This Month',
    shopBillsNext30: 'Shop Bills Due in 30 Days',
    shopBillsNext30Tip: 'Accounts Payable: Rent, salaries, distributor invoices, and GST',
    cashInBank: 'Cash in Bank',
    cashInBankTip: 'Current verified operating balance in HDFC current account',
    lowestForecast: 'Lowest Point in 13-Week Forecast',
    lowestForecastTip: 'Trough cash level projected over the next quarter',
    safetyBuffer: 'Safety Cash Buffer',
    safetyBufferTip: 'Minimum reserve required to pay rent and salaries without shortfall',
  },

  // Statuses
  status: {
    draft: 'Draft',
    sent: 'Sent',
    due_soon: 'Due Soon',
    overdue: 'Overdue',
    part_paid: 'Part Paid',
    paid: 'Paid in Full',
    disputed: 'Disputed',
    all: 'All Statuses',
  },

  // Customer grades
  grade: {
    A: 'Grade A (Excellent)',
    B: 'Grade B (Average / Follow-up)',
    C: 'Grade C (High Risk / Slow)',
  },

  // Dashboard sections
  dashboard: {
    title: 'Cash Flow & Trade Credit Command Centre',
    subtitle: 'Kavach Mobile Accessories • Pune, Maharashtra',
    ageingTitle: 'Overdue Ageing Breakdown',
    notYetDue: 'Not Yet Due',
    days1_30: '1-30 Days Overdue',
    days31_60: '31-60 Days Overdue',
    days61_90: '61-90 Days Overdue',
    days90Plus: '90+ Days Overdue',
    chaseHeader: 'Top Priority Invoices to Chase This Week',
    chaseSub: 'Ranked by cash gap impact, days overdue, and customer payment track record',
    n8nStatus: 'n8n Automation Engine',
    n8nConnected: 'n8n Webhook Connected',
    n8nFallback: 'Local Browser Fallback Active',
    advanceDate: 'Advance Demo Date',
    todayIs: 'Current App Date (IST):',
  },

  // Demand Letter
  demandLetter: {
    title: 'Payment Demand Letter',
    disclaimer: 'This letter is from Kavach Mobile Accessories about money owed for the invoices listed below. It is not a notice from the GST department and not a legal notice from a lawyer.',
    dueNotice: 'The following trade invoices remain past due under the agreed 30-day commercial credit terms:',
    deadlineText: 'Please remit the total balance within 7 calendar days of receipt of this notice.',
    msmeClause: 'Under the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006, buyers are required to pay micro and small suppliers within the agreed period, which cannot exceed 45 days. Late payments carry statutory compound interest with monthly rests at 3 times the RBI bank rate.',
    msmeInterestCalculated: 'Statutory MSME Penal Interest (at 19.50% p.a.):',
    howToPay: 'Payment Methods & Bank Transfer Details',
    upiScan: 'Scan to Pay via Any UPI App',
    disputeNotice: 'For any billing discrepancies or verification of goods received, contact Suresh Patil at accounts@duemitra.in or +91 98230 12345.',
  },

  // Invoices screen
  invoices: {
    title: 'Tax Invoices & Billing',
    subtitle: 'Manage B2B credit sales, GST compliance, and payment timelines',
    newBtn: 'Create Invoice',
    searchPlaceholder: 'Search by invoice number or customer...',
    filterCustomer: 'All Customers',
    filterStatus: 'Status',
    invoiceCol: 'Invoice #',
    dateCol: 'Date',
    dueDateCol: 'Due Date',
    customerCol: 'Customer',
    totalCol: 'Grand Total',
    balanceCol: 'Balance Due',
    statusCol: 'Status',
    actionsCol: 'Action',
  },

  // Reconciliation
  reconciliation: {
    title: 'Bank Statement & AI Reconciliation',
    subtitle: 'Upload HDFC statement to match credits against open trade bills',
    matched: 'Matched',
    tdsWarning: 'Possibly TDS deducted: ask the customer for the TDS certificate (Section 194Q / 194C)',
    overpaymentWarning: 'Overpayment: Credit received exceeds invoice balance',
    partPaymentInfo: 'Part Payment: Remaining balance stays open on invoice',
    multiBillInfo: 'Single payment clearing multiple invoices',
    unmatchedWarning: 'Unknown deposit: No matching invoice found',
    confidence: 'AI Match Confidence',
    confirmBtn: 'Confirm Match & Update Ledger',
    confirmedBtn: 'Confirmed',
  },

  // Cash forecast
  forecast: {
    title: '13-Week Cash Flow Projection',
    subtitle: 'Simulating inflows (adjusted by customer delay) and shop operating outflows',
    openingCash: 'Opening Cash',
    inflows: 'Money In (Invoices)',
    outflows: 'Money Out (Expenses)',
    closingCash: 'Closing Cash',
    bufferAlert: 'Cash dips below ₹2,00,000 safety buffer in',
    whatIfTitle: 'Interactive "What If" Stress Tests',
    whatIfCustomerDelay: 'Sahyadri Telecom pays 30 days later',
    whatIfBigOrder: 'Bulk festive order received (+₹1,50,000 in Week 3)',
    whatIfDelaySupplier: 'Negotiate 2-week delay on distributor bill (-₹82,000)',
    resolvingInvoices: 'Invoices that would immediately bridge the cash gap:',
  },
};

