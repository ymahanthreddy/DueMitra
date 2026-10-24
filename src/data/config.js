// DueMitra App Configuration
// GST Rates: Check current official rates at https://cbic-gst.gov.in
// RBI Bank Rate: Check current official rates at https://rbi.org.in

export const APP_CONFIG = {
  appName: 'DueMitra',
  tagline: 'Autonomous Trade Credit & Cash Flow Protection Platform',

  // GST Rates available for items
  // Note: Check current official GST rates on cbic-gst.gov.in
  gstRates: [
    { rate: 0, label: '0% (Exempt / Nil Rated)' },
    { rate: 3, label: '3% (Special / Precious parts)' },
    { rate: 5, label: '5% (Concessional / Basic cables)' },
    { rate: 18, label: '18% (Standard - Mobile cases, chargers, tempered glass, audio since 22 Sep 2025)' },
    { rate: 40, label: '40% (Luxury / High cess)' },
  ],
  defaultGstRate: 18,

  // Benchmark RBI Bank Rate for MSMED Act penal interest calculations
  // Note: Check current official bank rate on rbi.org.in
  rbiBankRatePercent: 6.50,
  
  // Under Section 16 of MSMED Act 2006, buyers must pay compound interest with monthly rests
  // at three times the bank rate notified by RBI (3 * 6.50% = 19.50% per annum)
  msmeInterestMultiplier: 3,

  // Payment Demand Letter deadline (in days from issue)
  demandLetterGraceDays: 7,

  // Cash flow safety buffer (stored in whole paise: ₹2,00,000 = 20,000,000 paise)
  safetyBufferPaise: 20000000,

  // Default Escalation Ladder Stages (days relative to due date)
  defaultLadderStages: [
    {
      id: 'heads_up',
      stageNumber: 1,
      triggerDays: -3, // 3 days before due date
      name: 'Friendly Heads-up',
      description: 'Polite pre-due reminder that invoice is maturing soon',
      channel: 'whatsapp',
      action: 'send_heads_up',
    },
    {
      id: 'due_date',
      stageNumber: 2,
      triggerDays: 0, // On due date
      name: 'Due Date Reminder',
      description: 'Formal yet cordial payment due notification with UPI link',
      channel: 'whatsapp',
      action: 'send_due_reminder',
    },
    {
      id: 'firm_reminder',
      stageNumber: 3,
      triggerDays: 7, // 7 days overdue
      name: 'Firmer Reminder',
      description: 'Follow-up noting invoice is 1 week overdue, requesting immediate settlement',
      channel: 'whatsapp',
      action: 'send_firm_reminder',
      triggersWebhook: true, // triggers n8n webhook
    },
    {
      id: 'final_reminder',
      stageNumber: 4,
      triggerDays: 15, // 15 days overdue
      name: 'Final Reminder + Call',
      description: 'Urgent notice requesting clearing dues today + owner call alert',
      channel: 'whatsapp_and_call',
      action: 'send_final_reminder',
      triggersWebhook: true, // triggers n8n webhook
    },
    {
      id: 'demand_letter',
      stageNumber: 5,
      triggerDays: 30, // 30 days overdue
      name: 'Payment Demand Letter',
      description: 'Formal Payment Demand Letter with MSME clause & 7-day cure period',
      channel: 'letter_and_email',
      action: 'generate_demand_letter',
      triggersWebhook: true, // triggers n8n webhook
    },
    {
      id: 'next_steps',
      stageNumber: 6,
      triggerDays: 45, // 45 days overdue
      name: 'Legal Next Steps & MSME Samadhaan',
      description: 'Suggests direct phone call, legal counsel consult, and MSME Samadhaan portal filing',
      channel: 'internal_guidance',
      action: 'suggest_next_steps',
    },
  ],

  // n8n Automation Layer defaults (Connected to live n8n Pro Cloud)
  n8n: {
    webhookUrl: 'https://ymahanthreddy.app.n8n.cloud/webhook/due-reminders-digest',
    emailWebhookUrl: 'https://ymahanthreddy.app.n8n.cloud/webhook/due-reminders-digest',
    dueDigestWebhookUrl: 'https://ymahanthreddy.app.n8n.cloud/webhook/due-reminders-digest',
    aiReconciliationUrl: 'https://ymahanthreddy.app.n8n.cloud/webhook/ai-bank-parse',
    cronSchedule: '0 */2 * * *', // Every 2 hours
    enabled: true,
    aiReconciliationEnabled: true,
  },
};

