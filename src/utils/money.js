// Money formatting and Indian numbering utilities (always using whole paise internally)

/**
 * Formats paise as Indian Rupees with commas: e.g. 10000000 paise -> "₹1,00,000"
 */
export function formatPaise(paise, options = {}) {
  const { showSymbol = true, showPaiseIfNonZero = true } = options;
  const num = Number(paise) || 0;
  const rupees = Math.floor(Math.abs(num) / 100);
  const remainingPaise = Math.abs(num) % 100;
  const isNegative = num < 0;

  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  let formattedRupees = formatter.format(rupees);
  let result = formattedRupees;

  if (showPaiseIfNonZero && remainingPaise > 0) {
    result += '.' + remainingPaise.toString().padStart(2, '0');
  }

  if (showSymbol) {
    result = '₹' + result;
  }

  return isNegative ? '-' + result : result;
}

/**
 * Converts paise to float rupees (for inputs / displays)
 */
export function paiseToRupees(paise) {
  return (Number(paise) || 0) / 100;
}

/**
 * Converts float rupees to integer paise safely
 */
export function rupeesToPaise(rupees) {
  if (rupees === '' || rupees === null || rupees === undefined) return 0;
  const val = parseFloat(String(rupees).replace(/,/g, ''));
  if (isNaN(val)) return 0;
  return Math.round(val * 100);
}

/**
 * Converts paise into words using Indian Numbering (Crore, Lakh, Thousand, Hundred)
 * e.g., 1180000 -> "Rupees Eleven Thousand Eight Hundred Only"
 */
export function numberToWordsIndian(paise) {
  const num = Number(paise) || 0;
  const rupees = Math.floor(Math.abs(num) / 100);
  const remainingPaise = Math.abs(num) % 100;

  if (rupees === 0 && remainingPaise === 0) {
    return 'Rupees Zero Only';
  }

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n) {
    if (n < 20) return ones[n];
    const t = tens[Math.floor(n / 10)];
    const o = ones[n % 10];
    return t + (o ? ' ' + o : '');
  }

  function convertThreeDigits(n) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (h > 0) res += ones[h] + ' Hundred';
    if (rest > 0) res += (res ? ' ' : '') + convertTwoDigits(rest);
    return res;
  }

  let current = rupees;
  const parts = [];

  const crores = Math.floor(current / 10000000);
  current %= 10000000;
  if (crores > 0) parts.push(convertThreeDigits(crores) + ' Crore');

  const lakhs = Math.floor(current / 100000);
  current %= 100000;
  if (lakhs > 0) parts.push(convertThreeDigits(lakhs) + ' Lakh');

  const thousands = Math.floor(current / 1000);
  current %= 1000;
  if (thousands > 0) parts.push(convertThreeDigits(thousands) + ' Thousand');

  if (current > 0) parts.push(convertThreeDigits(current));

  let words = 'Rupees ' + parts.join(' ');
  if (remainingPaise > 0) {
    words += ' and ' + convertTwoDigits(remainingPaise) + ' Paise';
  }

  return (num < 0 ? 'Minus ' : '') + words.trim() + ' Only';
}

/**
 * Calculates MSMED Act penal compound interest with monthly rests at 3x RBI bank rate
 * @param {number} principalPaise - Principal overdue in paise
 * @param {number} daysOverdue - Number of days overdue
 * @param {number} annualRatePercent - 3x RBI bank rate (e.g. 19.5% for 6.5% base)
 * @returns {number} Interest in paise (rounded integer)
 */
export function calculateMsmeInterestPaise(principalPaise, daysOverdue, annualRatePercent = 19.5) {
  if (daysOverdue <= 0 || principalPaise <= 0) return 0;

  // Monthly interest rate = (annualRate / 12) / 100
  const monthlyRate = (annualRatePercent / 100) / 12;
  const months = daysOverdue / 30; // monthly rests

  // Compound amount = P * (1 + r)^m
  const amount = principalPaise * Math.pow(1 + monthlyRate, months);
  const interest = amount - principalPaise;

  return Math.round(interest);
}

