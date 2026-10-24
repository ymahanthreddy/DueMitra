// Date utilities for IST, Financial Year, and Ladder calculations

/**
 * Formats a Date object or ISO string to YYYY-MM-DD
 */
export function toISODateString(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats date for display in Indian format: DD/MM/YYYY or "23 Oct 2026"
 */
export function formatIndianDate(dateStr, options = { month: 'short' }) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: options.month || 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Returns the Indian Financial Year string, e.g. "26-27" for Oct 2026
 */
export function getFinancialYearString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12

  let startYear, endYear;
  if (month >= 4) {
    // April to December: current year is start
    startYear = year;
    endYear = year + 1;
  } else {
    // January to March: previous year is start
    startYear = year - 1;
    endYear = year;
  }

  const s2 = String(startYear).slice(-2);
  const e2 = String(endYear).slice(-2);
  return `${s2}-${e2}`;
}

/**
 * Returns formal FY label, e.g. "FY 2026-27"
 */
export function getFinancialYear(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const startYear = month >= 4 ? year : year - 1;
  const endYear = startYear + 1;
  return `FY ${startYear}-${String(endYear).slice(-2)}`;
}

/**
 * Calculates whole days difference: (currentDate - targetDate)
 * Positive means overdue; negative means due in future.
 */
export function getDaysDiff(currentDateStr, targetDateStr) {
  const current = new Date(currentDateStr);
  const target = new Date(targetDateStr);
  
  // Normalize to UTC midnight
  const utc1 = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate());
  const utc2 = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((utc1 - utc2) / msPerDay);
}

/**
 * Adds days to a date string and returns YYYY-MM-DD
 */
export function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Number(days));
  return toISODateString(d);
}

