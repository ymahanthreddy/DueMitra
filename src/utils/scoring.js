// Receivables Urgency & Action Explanation Generator
import { formatPaise } from './money.js';

export function calculateChaseScore(invoice, customer, forecastSummary = {}) {
  const daysOverdue = Math.max(0, invoice.daysOverdue || 0);
  const balancePaise = invoice.balanceDuePaise || 0;
  const troughWeek = forecastSummary.troughWeekIndex || 5;
  const maxShortfallPaise = forecastSummary.maxShortfallPaise || 0;

  // Real financial impact score: balance amount multiplied by overdue weight
  const score = (balancePaise / 100) * (daysOverdue + 1);

  // 13-week cash gap bridge factor
  const coversGap = maxShortfallPaise > 0 && balancePaise >= (maxShortfallPaise * 0.7);

  // Build the clean, factual explanation in plain words
  const formattedAmt = formatPaise(balancePaise);
  let shortfallNote = '';
  if (coversGap) {
    shortfallNote = `, covers the projected operating deficit in week ${troughWeek}`;
  } else if (balancePaise >= 5000000) {
    shortfallNote = `, essential for upcoming distributor supplier settlements`;
  } else {
    shortfallNote = `, helps preserve cash flow safety reserve`;
  }

  const reason = daysOverdue > 0
    ? `${formattedAmt} is ${daysOverdue} days overdue${shortfallNote}.`
    : `${formattedAmt} matures today${shortfallNote}.`;

  return {
    score,
    reason,
    coversGap,
    formattedAmt,
    daysOverdue,
  };
}

