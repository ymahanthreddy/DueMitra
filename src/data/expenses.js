// Recurring and scheduled business expenses for Kavach Mobile Accessories, Pune
// Amounts stored in whole paise (₹1 = 100 paise)

export const initialExpenses = [
  // 1. SHOP PREMISES RENT (With 5% annual escalation compounding)
  {
    id: 'EXP-RENT',
    category: 'Rent',
    title: 'Shop Premises Rent (City Centre Hub)',
    recipient: 'City Centre Commercial Complex, FC Road',
    dayOfMonth: 5,
    baseAmountPaise: 4500000, // Base ₹45,000 / month
    amountPaise: 4725000, // Escalated by 5% in Year 2: ₹47,250
    annualEscalationPercent: 5,
    leaseStartYear: 2025,
    isRecurring: true,
    description: 'Commercial shop lease with contractual 5% annual compounding escalation clause',
  },

  // 2. PETROL & LOGISTICS FUEL
  {
    id: 'EXP-FUEL',
    category: 'Petrol & Logistics',
    title: 'Delivery Fleet Petrol & Local Logistics',
    recipient: 'Indian Oil Retail Outlet, FC Road',
    dayOfMonth: 7,
    amountPaise: 1250000, // ₹12,500 / month
    isRecurring: true,
    description: 'Monthly fuel allocation for dispatch riders, store deliveries, and wholesale pickups',
  },

  // 3. BUSINESS LOANS & WORKING CAPITAL EMIs
  {
    id: 'EXP-LOAN-HDFC',
    category: 'Business Loans',
    title: 'HDFC Bank MSME Working Capital Loan EMI',
    recipient: 'HDFC Bank - Commercial Lending Branch',
    dayOfMonth: 10,
    amountPaise: 3200000, // ₹32,000 / month
    isRecurring: true,
    description: '36-month MSME equipment & working capital term loan EMI (Principal + 11.5% Interest)',
    loanTenureMonths: 36,
    remainingMonths: 22,
    originalPrincipalPaise: 100000000, // ₹10,00,000 loan
  },

  // 4. COMPANY-OWNED VEHICLES (EMIs, Maintenance & Insurance)
  {
    id: 'EXP-VEHICLE-VAN',
    category: 'Company Vehicles',
    title: 'Tata Ace Delivery Van EMI',
    recipient: 'Tata Motors Finance Ltd.',
    dayOfMonth: 12,
    amountPaise: 1450000, // ₹14,500 / month
    isRecurring: true,
    description: 'Monthly financing EMI for company-owned commercial delivery van (MH 12 QX 4412)',
  },
  {
    id: 'EXP-VEHICLE-MAINT',
    category: 'Company Vehicles',
    title: 'Company Fleet Service & Van Maintenance',
    recipient: 'Autocare Authorized Commercial Garage',
    dayOfMonth: 15,
    amountPaise: 800000, // ₹8,000 / month
    isRecurring: true,
    description: 'Periodic vehicle servicing, tire replacement, engine oil, and preventative maintenance',
  },
  {
    id: 'EXP-VEHICLE-SCOOTER',
    category: 'Company Vehicles',
    title: 'Company Delivery Two-Wheeler Maintenance & Petrol',
    recipient: 'TVS City Service Hub',
    dayOfMonth: 18,
    amountPaise: 450000, // ₹4,500 / month
    isRecurring: true,
    description: 'Delivery two-wheeler fuel, insurance amortized, and brake/clutch servicing',
  },

  // 5. STAFF SALARIES & PAYROLL
  {
    id: 'EXP-SALARY',
    category: 'Salaries',
    title: 'Staff Payroll (4 Full-Time Employees)',
    recipient: 'Store Executives & Dispatch Staff',
    dayOfMonth: 1,
    amountPaise: 9500000, // ₹95,000 / month
    isRecurring: true,
    description: 'Monthly payroll for 2 store retail assistants, 1 inventory clerk, and 1 dispatch rider',
  },

  // 6. UTILITIES & TELECOM
  {
    id: 'EXP-ELEC',
    category: 'Utilities',
    title: 'MSEDCL Shop Electricity Bill',
    recipient: 'Maharashtra State Electricity Distribution Co.',
    dayOfMonth: 8,
    amountPaise: 850000, // ₹8,500 / month
    isRecurring: true,
    description: 'Store air conditioning, showcase illumination, and point-of-sale terminal power',
  },
  {
    id: 'EXP-INTERNET',
    category: 'Utilities',
    title: 'Airtel Commercial Broadband & Cloud Server',
    recipient: 'Bharti Airtel Commercial Telecommunications',
    dayOfMonth: 14,
    amountPaise: 250000, // ₹2,500 / month
    isRecurring: true,
    description: 'High-speed fiber connectivity for billing, CCTV monitoring, and cloud data backups',
  },
  {
    id: 'EXP-WATER',
    category: 'Water & Utilities',
    title: 'Pune Municipal Corporation (PMC) Water & Commercial Cess',
    recipient: 'Pune Municipal Corporation Water Supply Dept',
    dayOfMonth: 12,
    amountPaise: 350000, // ₹3,500 / month
    isRecurring: true,
    description: 'Store commercial water connection, sewerage charges, and municipal trade license cess',
  },

  // 7. STATUTORY TAXES (GSTR-3B Net Liability)
  {
    id: 'EXP-GST',
    category: 'Taxes',
    title: 'Monthly Net GST Payment (GSTR-3B)',
    recipient: 'Government of India - GST Portal',
    dayOfMonth: 20,
    amountPaise: 3800000, // ₹38,000 / month
    isRecurring: true,
    description: 'Net monthly GST tax liability after adjusting Input Tax Credit (ITC)',
  },

  // 8. TRADE INVENTORY DISTRIBUTOR BILLS (Ad-hoc)
  {
    id: 'EXP-DIST-01',
    category: 'Inventory',
    title: 'Anker & Soundcore Distributor Bill',
    recipient: 'West India Tech Distributors, Mumbai',
    dueDate: '2026-10-28',
    amountPaise: 8200000, // ₹82,000
    isRecurring: false,
    description: 'Bulk restock of 65W GaN fast chargers and braided Type-C cables',
  },
  {
    id: 'EXP-DIST-02',
    category: 'Inventory',
    title: 'Spigen & Ringke Premium Case Consignment',
    recipient: 'Apex Gadgets India, Pune',
    dueDate: '2026-11-04',
    amountPaise: 6400000, // ₹64,000
    isRecurring: false,
    description: 'Matte frosted cases and camera lens protectors consignment bill',
  },
];
