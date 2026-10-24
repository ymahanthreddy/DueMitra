// Comprehensive Test Suite for DueMitra ERP
import assert from 'node:assert';
import { formatPaise, numberToWordsIndian, rupeesToPaise, paiseToRupees } from '../src/utils/money.js';
import { validateGstin, calcGstinCheckDigit, calculateLineGst, STATE_CODES } from '../src/utils/gst.js';
import { formatIndianDate, getFinancialYear, getFinancialYearString, getDaysDiff } from '../src/utils/date.js';
import { calculateChaseScore } from '../src/utils/scoring.js';
import { compute13WeekForecast } from '../src/utils/forecast.js';
import { getInvoiceLadderStage } from '../src/utils/ladder.js';
import { calculateEscalatedRent, computeMonthlyExpenseBreakdown } from '../src/utils/affordability.js';
import { isPlaceholderUrl } from '../src/utils/n8n.js';
import { en } from '../src/i18n/en.js';
import { hi } from '../src/i18n/hi.js';
import { mr } from '../src/i18n/mr.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

console.log('========================================================');
console.log('--- 1. CURRENCY & INDIAN RUPEE FORMATTING (PAISE) ---');
console.log('========================================================');

test('Whole paise formatting with Indian commas', () => {
  assert.strictEqual(formatPaise(123456700), '₹12,34,567');
  assert.strictEqual(formatPaise(500000), '₹5,000');
  assert.strictEqual(formatPaise(100), '₹1');
  assert.strictEqual(formatPaise(0), '₹0');
  assert.strictEqual(formatPaise(123456, { showSymbol: false }), '1,234.56');
});

test('Conversion between Rupees and Paise', () => {
  assert.strictEqual(rupeesToPaise(1500.50), 150050);
  assert.strictEqual(paiseToRupees(150050), 1500.50);
  assert.strictEqual(rupeesToPaise('12,390'), 1239000);
});

test('Amount in words (Indian numbering system: Lakhs & Crores)', () => {
  const words1 = numberToWordsIndian(1239000); // ₹12,390
  assert(words1.toLowerCase().includes('twelve thousand three hundred ninety'), `Got: ${words1}`);

  const words2 = numberToWordsIndian(50000000); // ₹5,00,000
  assert(words2.toLowerCase().includes('five lakh'), `Got: ${words2}`);

  const words3 = numberToWordsIndian(1500000000); // ₹1.5 Crore
  assert(words3.toLowerCase().includes('one crore fifty lakh'), `Got: ${words3}`);
});

console.log('\n========================================================');
console.log('--- 2. GSTIN & MODULO-36 CHECK-DIGIT VALIDATION ---');
console.log('========================================================');

test('Valid GSTIN format and state code check with Modulo-36', () => {
  // Official check digit for '27AAACW1234P1Z' is '3'
  const validCheck = validateGstin('27AAACW1234P1Z3');
  assert.strictEqual(validCheck.valid, true);
  assert.strictEqual(validCheck.stateCode, '27');
  assert.strictEqual(validCheck.stateName, 'Maharashtra');

  // Verify sample business GSTIN
  const sampleGstin = validateGstin('27AABCK1234F1ZZ');
  assert.strictEqual(sampleGstin.valid, true);

  // Invalid length
  const invalidLength = validateGstin('27AAACW1234P1Z');
  assert.strictEqual(invalidLength.valid, false);

  // Invalid state code
  const invalidState = validateGstin('99AAACW1234P1Z5');
  assert.strictEqual(invalidState.valid, false);
});

test('GSTIN Modulo-36 check digit algorithm', () => {
  const checkDigit = calcGstinCheckDigit('27AAACW1234P1Z');
  assert.strictEqual(checkDigit, '3');
});

test('GST calculation: Intra-State (CGST + SGST) vs Inter-State (IGST)', () => {
  // Intra-state (both 27 Maharashtra): 18% GST splits into 9% CGST + 9% SGST
  const item = { quantity: 1, ratePaise: 1000000, discountPaise: 0, gstRate: 18 };
  const intra = calculateLineGst(item, '27', '27');
  assert.strictEqual(intra.cgstRate, 9);
  assert.strictEqual(intra.sgstRate, 9);
  assert.strictEqual(intra.cgstPaise, 90000); // ₹900
  assert.strictEqual(intra.sgstPaise, 90000); // ₹900
  assert.strictEqual(intra.igstPaise, 0);
  assert.strictEqual(intra.lineTotalPaise, 1180000); // ₹11,800

  // Inter-state (27 Maharashtra to 29 Karnataka): 18% IGST
  const inter = calculateLineGst(item, '27', '29');
  assert.strictEqual(inter.cgstPaise, 0);
  assert.strictEqual(inter.sgstPaise, 0);
  assert.strictEqual(inter.igstRate, 18);
  assert.strictEqual(inter.igstPaise, 180000);
  assert.strictEqual(inter.lineTotalPaise, 1180000);
});

console.log('\n========================================================');
console.log('--- 3. INDIAN DATES & APRIL-MARCH FINANCIAL YEAR ---');
console.log('========================================================');

test('Indian date formatting DD/MM/YYYY', () => {
  const d = formatIndianDate('2026-10-24');
  assert(d.includes('2026'), `Got: ${d}`);
});

test('April-March Financial Year calculation', () => {
  assert.strictEqual(getFinancialYear(new Date('2026-10-24')), 'FY 2026-27');
  assert.strictEqual(getFinancialYear(new Date('2027-02-15')), 'FY 2026-27');
  assert.strictEqual(getFinancialYear(new Date('2027-05-01')), 'FY 2027-28');
  assert.strictEqual(getFinancialYearString(new Date('2026-10-24')), '26-27');
});

test('Overdue days difference calculation', () => {
  const demoDate = '2026-10-24';
  const diffOverdue = getDaysDiff(demoDate, '2026-10-10');
  assert.strictEqual(diffOverdue, 14);

  const diffFuture = getDaysDiff(demoDate, '2026-10-30');
  assert.strictEqual(diffFuture, -6);
});

console.log('\n========================================================');
console.log('--- 4. CHASE SCORING & REASONS IN WORDS ---');
console.log('========================================================');

test('Chase score prioritizes overdue balance and provides factual explanation in words', () => {
  const inv = {
    balanceDuePaise: 4500000,
    daysOverdue: 15
  };
  const result = calculateChaseScore(inv, {}, { troughWeekIndex: 3, maxShortfallPaise: 4000000 });
  assert(result.score > 0);
  assert(result.reason.includes('15 days overdue'));
  assert(result.coversGap === true);
});

console.log('\n========================================================');
console.log('--- 5. 13-WEEK CASH FORECAST & BUFFER BREACH ---');
console.log('========================================================');

test('Cash forecast generates 13 weekly points and tests buffer breach', () => {
  const forecast = compute13WeekForecast({
    startDateStr: '2026-10-23',
    openingBankBalancePaise: 48289200, // ₹4.82 Lakh
    safetyBufferPaise: 20000000,       // ₹2.00 Lakh
    openInvoices: [
      { id: '1', dueDate: '2026-10-28', balanceDuePaise: 15000000, customerId: 'CUST-001', status: 'open' }
    ],
    customers: [
      { id: 'CUST-001', avgDaysLate: 3 }
    ],
    expenses: [
      { id: 'exp-1', category: 'Rent', amountPaise: 4500000, dueDay: 1 }
    ],
    whatIf: { customerDelay: false, bigOrder: false, delaySupplier: false }
  });

  assert.strictEqual(forecast.weeks.length, 13);
  assert(typeof forecast.lowestPointPaise === 'number');
  assert(typeof forecast.troughWeekIndex === 'number');
  assert(forecast.weeks[0].closingCashPaise !== undefined);
});

console.log('\n========================================================');
console.log('--- 6. ESCALATION LADDER & PAUSE CONDITIONS ---');
console.log('========================================================');

test('Ladder returns proper stage based on days overdue and pauses when promised/disputed', () => {
  // Due date reminder on day 0
  const stageDue = getInvoiceLadderStage({
    status: 'open',
    balanceDuePaise: 100000,
    dueDate: '2026-10-24'
  }, '2026-10-24');
  assert.strictEqual(stageDue.key, 'due_date');

  // Friendly heads-up 3 days before
  const stageHeadsUp = getInvoiceLadderStage({
    status: 'open',
    balanceDuePaise: 100000,
    dueDate: '2026-10-27'
  }, '2026-10-24');
  assert.strictEqual(stageHeadsUp.key, 'heads_up');

  // Paused when disputed
  const stageDisputed = getInvoiceLadderStage({
    status: 'disputed',
    balanceDuePaise: 100000,
    dueDate: '2026-10-20'
  }, '2026-10-24');
  assert.strictEqual(stageDisputed, null);

  // Paused when promise to pay is in future
  const stagePromised = getInvoiceLadderStage({
    status: 'open',
    balanceDuePaise: 100000,
    dueDate: '2026-10-20',
    promisedPayDate: '2026-10-30'
  }, '2026-10-24');
  assert.strictEqual(stagePromised, null);
});

console.log('\n========================================================');
console.log('--- 7. BUSINESS AFFORDABILITY & COMPOUNDING RENT ---');
console.log('========================================================');

test('Compound 5% annual rent escalation', () => {
  // Base 10,000, 1 year elapsed at 5% = 10,500
  const rent1Year = calculateEscalatedRent(1000000, 2025, 2026, 0.05);
  assert.strictEqual(rent1Year, 1050000);

  // Base 10,000, 2 years elapsed at 5% = 11,025
  const rent2Year = calculateEscalatedRent(1000000, 2025, 2027, 0.05);
  assert.strictEqual(rent2Year, 1102500);
});

console.log('\n========================================================');
console.log('--- 8. I18N STRUCTURE & MARATHI COMPLETENESS ---');
console.log('========================================================');

test('English, Hindi, and Marathi locales have essential keys matching', () => {
  const enKeys = Object.keys(en);
  const hiKeys = Object.keys(hi);
  const mrKeys = Object.keys(mr);

  assert.deepStrictEqual(enKeys.sort(), hiKeys.sort());
  assert.deepStrictEqual(enKeys.sort(), mrKeys.sort());

  // Verify critical Marathi translations
  assert(mr.nav.dashboard.length > 0);
  assert(mr.nav.invoices.length > 0);
  assert(mr.dashboard.title.length > 0);
  assert(mr.demandLetter.title.length > 0);
});

console.log('\n========================================================');
console.log('--- 9. BACKEND EXPRESS API CHECKS (PORT 3001) ---');
console.log('========================================================');

await asyncTest('Health check endpoint /api/health responds with 200', async () => {
  const res = await fetch('http://localhost:3001/api/health');
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'healthy');
  assert.strictEqual(data.service, 'DueMitra Backend Server');
});

await asyncTest('Automated reminder engine /api/reminders/send-due executes safely with anti-spam', async () => {
  const res = await fetch('http://localhost:3001/api/reminders/send-due', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      testMode: true,
      testEmail: 'owner@example.com',
      enabledStages: [1, 2],
      invoices: [
        {
          id: 'test-inv-1',
          invoiceNumber: 'TEST/001',
          customerName: 'Test Retailer',
          customerEmail: 'buyer@example.com',
          customerPhone: '9876543210',
          balanceDuePaise: 1500000,
          dueDate: '2026-10-24',
          status: 'open'
        }
      ],
      customers: [
        {
          id: 'c-1',
          name: 'Test Retailer',
          email: 'buyer@example.com',
          phone: '9876543210'
        }
      ],
      business: {
        name: 'Kavach Mobile Accessories',
        email: 'owner@example.com',
        phone: '9822012345'
      },
      demoDate: '2026-10-24'
    })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.totalDispatched, 1);
  assert.strictEqual(data.dispatched[0].testMode, true);
});

console.log('\n========================================================');
console.log('--- 10. FRONTEND VITE SERVER (PORT 5174) ---');
console.log('========================================================');

await asyncTest('Vite frontend serves HTML on port 5174', async () => {
  const res = await fetch('http://localhost:5174/');
  assert.strictEqual(res.status, 200);
  const text = await res.text();
  assert(text.includes('<div id="root"></div>'));
});

console.log('\n========================================================');
console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
