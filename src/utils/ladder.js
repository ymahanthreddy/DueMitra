// Escalation ladder processing engine
import { getDaysDiff, addDays } from './date.js';
import { formatPaise } from './money.js';
import { reminderTemplates } from '../data/templates.js';

export function getInvoiceLadderStage(invoice, demoDateStr = '2026-10-23', customLadderStages = null) {
  if (invoice.status === 'paid' || invoice.balanceDuePaise <= 0) return null;
  if (invoice.status === 'disputed' || invoice.ladderPaused) return null;

  // Check snooze
  if (invoice.snoozeUntil && demoDateStr < invoice.snoozeUntil) return null;

  // Check promised pay date
  if (invoice.promisedPayDate && demoDateStr < invoice.promisedPayDate) return null;

  const daysDiff = getDaysDiff(demoDateStr, invoice.dueDate); // positive = overdue

  const stages = customLadderStages && customLadderStages.length > 0 ? customLadderStages : [
    { stageNumber: 6, key: 'next_steps', triggerDays: 45, name: 'Legal Next Steps & MSME Samadhaan' },
    { stageNumber: 5, key: 'demand_letter', triggerDays: 30, name: 'Payment Demand Letter' },
    { stageNumber: 4, key: 'final_reminder', triggerDays: 15, name: 'Final Reminder + Call' },
    { stageNumber: 3, key: 'firm_reminder', triggerDays: 7, name: 'Firmer Reminder' },
    { stageNumber: 2, key: 'due_date', triggerDays: 0, name: 'Due Date Reminder' },
    { stageNumber: 1, key: 'heads_up', triggerDays: -3, name: 'Friendly Heads-up' },
  ];

  // Sort descending by triggerDays
  const sorted = [...stages].sort((a, b) => (Number(b.triggerDays) || 0) - (Number(a.triggerDays) || 0));

  let stage = null;
  for (const s of sorted) {
    if (daysDiff >= Number(s.triggerDays)) {
      stage = {
        number: s.stageNumber || s.number,
        key: s.id || s.key,
        daysDiff,
        name: s.name,
      };
      break;
    }
  }

  // Prevent sending duplicate stage
  if (stage && invoice.lastLadderStageSent && invoice.lastLadderStageSent >= stage.number) {
    return null;
  }

  return stage;
}

/**
 * Builds ready-to-send reminder text for WhatsApp, Email, or SMS
 */
export function buildReminderMessage({
  stageKey,
  lang = 'en',
  invoice,
  business,
  customer,
  demoDateStr = '2026-10-23',
  payUrl,
}) {
  const template = reminderTemplates[stageKey] || reminderTemplates.heads_up;
  let text = lang === 'mr' ? (template.mr || template.en) : lang === 'hi' ? (template.hi || template.en) : template.en;

  const daysOverdue = Math.max(0, getDaysDiff(demoDateStr, invoice.dueDate));
  const amountStr = formatPaise(invoice.balanceDuePaise);
  const graceDeadline = addDays(demoDateStr, 7);

  const replacements = {
    '{customerName}': customer?.contactPerson || customer?.name || invoice.customerName,
    '{businessName}': business?.name || 'Kavach Mobile Accessories',
    '{invoiceNumber}': invoice.invoiceNumber,
    '{amount}': amountStr,
    '{dueDate}': invoice.dueDate,
    '{daysOverdue}': String(daysOverdue),
    '{payLink}': payUrl || (typeof window !== 'undefined' ? `${window.location.origin}/pay/${invoice.token || invoice.id}` : `https://duemitra.in/pay/${invoice.token || invoice.id}`),
    '{upiId}': business?.upiId || 'kavachmobile@okhdfcbank',
    '{graceDeadline}': graceDeadline,
  };

  Object.entries(replacements).forEach(([placeholder, val]) => {
    text = text.replaceAll(placeholder, val);
  });

  return text;
}

