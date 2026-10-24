// Transactional Email Dispatcher for DueMitra ERP
import { formatPaise, numberToWordsIndian } from './money.js';
import { formatIndianDate } from './date.js';

/**
 * Normalizes webhook URLs by routing through local dev proxy to eliminate browser CORS errors
 */
export function toProxiedUrl(url) {
  if (!url) return url;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    if (url.includes('ymahanthreddy.app.n8n.cloud')) {
      return url.replace('https://ymahanthreddy.app.n8n.cloud', '/n8n-proxy');
    }
  }
  return url;
}

/**
 * Dynamically resolves the recipient email from customer profile or business settings
 */
export function resolveRecipientEmail({ customer, invoice, business }) {
  const candidate =
    invoice?.customerEmail ||
    customer?.email ||
    business?.notificationEmail ||
    business?.email;
  if (!candidate || candidate.includes('kavachaccessories.in') || candidate.includes('kavach.app')) {
    return '';
  }
  return candidate;
}

/**
 * Builds standard plain text for invoice email
 */
export function buildInvoicePlainText({ invoice, business, customer, payUrl }) {
  const invNumber = invoice.invoiceNumber || 'INV-DRAFT';
  const totalStr = formatPaise(invoice.grandTotalPaise || 0);
  const words = numberToWordsIndian(invoice.grandTotalPaise || 0);
  const custName = customer?.name || invoice.customerName || 'Valued Trade Customer';
  const bizName = business?.name || 'Sharma Packaging';

  return `Dear ${custName},

Please find below the payment advisory and itemized breakdown for ${invoice.invoiceType || 'Tax Invoice'} ${invNumber}.

--------------------------------------------------
INVOICE SUMMARY:
Invoice No:    ${invNumber}
Date of Issue: ${formatIndianDate(invoice.invoiceDate)}
Due Date:      ${formatIndianDate(invoice.dueDate)}
Total Amount:  ${totalStr}
Amount in Words: ${words}
Place of Supply: ${invoice.placeOfSupply?.state || 'Maharashtra'} (${invoice.placeOfSupply?.stateCode || '27'})
Customer GSTIN: ${invoice.customerGstin || customer?.gstin || 'Unregistered / B2C'}
--------------------------------------------------

ITEMS:
${(invoice.items || [])
  .map(
    (item, idx) =>
      `${idx + 1}. ${item.description} (HSN: ${item.hsnSac}) - ${item.quantity} ${item.unit} @ ${formatPaise(item.ratePaise)} = ${formatPaise(item.lineTotalPaise)} (GST ${item.gstRate}%)`
  )
  .join('\n')}

TAX SUMMARY:
Taxable Value: ${formatPaise(invoice.taxableTotalPaise || 0)}
CGST:          ${formatPaise(invoice.cgstTotalPaise || 0)}
SGST:          ${formatPaise(invoice.sgstTotalPaise || 0)}
IGST:          ${formatPaise(invoice.igstTotalPaise || 0)}
Round Off:     ${formatPaise(invoice.roundOffPaise || 0)}
Grand Total:   ${totalStr}

--------------------------------------------------
HOW TO PAY:
UPI VPA / ID:   ${business?.upiId || 'kavachmobile@okhdfcbank'}
Pay Online:     ${payUrl || 'https://kavach.app'}

BANK TRANSFER:
Account Name:   ${bizName}
Bank:           ${business?.bankName || 'HDFC Bank'}
Account Number: ${business?.accountNumber || '50200012345678'}
IFSC Code:      ${business?.ifscCode || 'HDFC0001234'}

Thank you for your business.

Regards,
Accounts Desk
${bizName}
Phone: ${business?.phone || '+91 94834 10461'}
${business?.email && !business.email.includes('kavachaccessories.in') ? `Email: ${business.email}\n` : ''}`;
}

/**
 * Builds HTML email template
 */
export function buildInvoiceHtml({ invoice, business, customer, payUrl }) {
  const invNumber = invoice.invoiceNumber || 'INV-DRAFT';
  const totalStr = formatPaise(invoice.grandTotalPaise || 0);
  const words = numberToWordsIndian(invoice.grandTotalPaise || 0);
  const custName = customer?.name || invoice.customerName || 'Valued Trade Customer';
  const bizName = business?.name || 'Sharma Packaging';

  const rows = (invoice.items || [])
    .map(
      (it) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${it.description}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-family: monospace;">${it.hsnSac || '8504'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;">${it.quantity} ${it.unit}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace;">${formatPaise(it.ratePaise)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace; font-weight: bold;">${formatPaise(it.lineTotalPaise)}</td>
    </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tax Invoice ${invNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #090d16 0%, #1e1b4b 100%); padding: 28px; color: #ffffff;">
      <table style="width: 100%;">
        <tr>
          <td>
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">${bizName}</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #a5b4fc;">Tax Invoice & Commercial Bill of Supply</p>
          </td>
          <td style="text-align: right;">
            <span style="display: inline-block; background: rgba(99, 102, 241, 0.25); border: 1px solid rgba(165, 180, 252, 0.3); color: #e0e7ff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; font-family: monospace;">
              ${invNumber}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Meta Details -->
    <div style="padding: 24px; border-bottom: 1px solid #f1f5f9;">
      <table style="width: 100%; font-size: 13px;">
        <tr>
          <td style="vertical-align: top; width: 50%;">
            <strong style="color: #64748b; font-size: 11px; text-transform: uppercase;">Billed To:</strong>
            <div style="font-weight: bold; font-size: 15px; margin-top: 2px;">${custName}</div>
            <div style="color: #475569; margin-top: 2px;">GSTIN: ${invoice.customerGstin || customer?.gstin || 'Unregistered / B2C'}</div>
            <div style="color: #475569;">Email: ${invoice.customerEmail || customer?.email || business?.email || 'N/A'}</div>
          </td>
          <td style="vertical-align: top; width: 50%; text-align: right;">
            <table style="width: 100%; font-size: 13px;">
              <tr>
                <td style="color: #64748b; text-align: right;">Invoice Date:</td>
                <td style="font-weight: bold; text-align: right; padding-left: 8px;">${formatIndianDate(invoice.invoiceDate)}</td>
              </tr>
              <tr>
                <td style="color: #64748b; text-align: right;">Due Date:</td>
                <td style="font-weight: bold; color: #dc2626; text-align: right; padding-left: 8px;">${formatIndianDate(invoice.dueDate)}</td>
              </tr>
              <tr>
                <td style="color: #64748b; text-align: right;">Place of Supply:</td>
                <td style="text-align: right; padding-left: 8px;">${invoice.placeOfSupply?.state || 'Maharashtra'} (${invoice.placeOfSupply?.stateCode || '27'})</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <div style="padding: 24px 20px;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 8px 10px;">Item Description</th>
            <th style="padding: 8px 10px;">HSN</th>
            <th style="padding: 8px 10px; text-align: center;">Qty</th>
            <th style="padding: 8px 10px; text-align: right;">Rate</th>
            <th style="padding: 8px 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <!-- Summary -->
      <div style="margin-top: 20px; border-top: 2px solid #e2e8f0; padding-top: 14px;">
        <table style="width: 100%; font-size: 13px;">
          <tr>
            <td style="color: #64748b;">Taxable Value</td>
            <td style="text-align: right; font-family: monospace;">${formatPaise(invoice.taxableTotalPaise || 0)}</td>
          </tr>
          ${
            invoice.cgstTotalPaise > 0
              ? `<tr><td style="color: #64748b;">CGST</td><td style="text-align: right; font-family: monospace;">${formatPaise(invoice.cgstTotalPaise)}</td></tr>`
              : ''
          }
          ${
            invoice.sgstTotalPaise > 0
              ? `<tr><td style="color: #64748b;">SGST</td><td style="text-align: right; font-family: monospace;">${formatPaise(invoice.sgstTotalPaise)}</td></tr>`
              : ''
          }
          ${
            invoice.igstTotalPaise > 0
              ? `<tr><td style="color: #64748b;">IGST</td><td style="text-align: right; font-family: monospace;">${formatPaise(invoice.igstTotalPaise)}</td></tr>`
              : ''
          }
          ${
            invoice.roundOffPaise !== 0
              ? `<tr><td style="color: #64748b;">Round Off</td><td style="text-align: right; font-family: monospace;">${formatPaise(invoice.roundOffPaise)}</td></tr>`
              : ''
          }
          <tr style="font-size: 16px; font-weight: bold; border-top: 1px solid #cbd5e1;">
            <td style="padding-top: 10px; color: #0f172a;">Grand Total</td>
            <td style="padding-top: 10px; text-align: right; color: #4338ca; font-family: monospace;">${totalStr}</td>
          </tr>
        </table>
        <div style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 6px;">
          Amount in words: <strong>${words}</strong>
        </div>
      </div>
    </div>

    <!-- Payment CTA -->
    <div style="background: #eef2ff; border-top: 1px solid #c7d2fe; padding: 20px 24px; text-align: center;">
      <p style="margin: 0 0 12px; font-size: 13px; color: #3730a3; font-weight: 600;">
        Fast Settlement via UPI or Instant Digital Payment
      </p>
      ${
        payUrl
          ? `<a href="${payUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: bold; box-shadow: 0 2px 4px rgba(79,70,229,0.3);">View Invoice & Pay Online &rarr;</a>`
          : ''
      }
      <div style="margin-top: 14px; font-size: 12px; color: #475569;">
        <strong>UPI VPA:</strong> <code style="background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">${business?.upiId || 'kavachmobile@okhdfcbank'}</code>
        &bull; <strong>A/C:</strong> ${business?.accountNumber || '50200012345678'} &bull; <strong>IFSC:</strong> ${business?.ifscCode || 'HDFC0001234'}
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 24px; background: #f8fafc; font-size: 11px; color: #94a3b8; text-align: center;">
      Generated automatically by ${bizName} ERP &bull; Authorized B2B Trade Document
    </div>

  </div>
</body>
</html>
`;
}

/**
 * Dispatches the invoice email to n8n and/or direct transactional email APIs
 */
export async function dispatchInvoiceEmail({
  invoice,
  business,
  customer,
  recipientEmail,
  webhookUrl,
  emailWebhookUrl,
  resendApiKey,
}) {
  const candidate = recipientEmail || resolveRecipientEmail({ customer, invoice, business });
  const targetEmail = candidate && !candidate.includes('kavachaccessories.in') ? candidate : '';

  if (!targetEmail) {
    console.warn('dispatchInvoiceEmail skipped: No valid customer/recipient email configured (dummy/empty address prevented).');
    return {
      recipientEmail: '',
      subject: '',
      n8nSuccess: false,
      resendSuccess: false,
      skipped: true,
      reason: 'No valid recipient email address configured.',
    };
  }

  const payUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174'}/pay/${invoice.token || invoice.id}`;
  const subject = `Tax Invoice ${invoice.invoiceNumber || ''} - ${formatPaise(invoice.grandTotalPaise || 0)} from ${business?.name || 'Sharma Packaging'}`;
  const text = buildInvoicePlainText({ invoice, business, customer, payUrl });
  const html = buildInvoiceHtml({ invoice, business, customer, payUrl });

  const safeSenderEmail = business?.email && !business.email.includes('kavachaccessories.in') ? business.email : '';

  const payload = {
    // Standard Root Fields for n8n Email/Gmail Nodes
    to: targetEmail,
    email: targetEmail,
    recipientEmail: targetEmail,
    recipient: targetEmail,
    subject,
    text,
    message: text,
    html,
    event: 'invoice_created_auto_email',
    source: 'DueMitra ERP',
    senderEmail: safeSenderEmail,

    // Detailed metadata
    invoiceNumber: invoice.invoiceNumber,
    grandTotalPaise: invoice.grandTotalPaise,
    grandTotalFormatted: formatPaise(invoice.grandTotalPaise || 0),
    customerName: customer?.name || invoice.customerName,
    customerGstin: invoice.customerGstin || customer?.gstin || '',
    dueDate: invoice.dueDate,
    payUrl,
    timestamp: new Date().toISOString(),

    // Nested payload for backwards compatibility
    data: {
      invoiceNumber: invoice.invoiceNumber,
      grandTotalPaise: invoice.grandTotalPaise,
      grandTotalFormatted: formatPaise(invoice.grandTotalPaise || 0),
      customerName: customer?.name || invoice.customerName,
      customerEmail: targetEmail,
      recipientEmail: targetEmail,
      dueDate: invoice.dueDate,
      payUrl,
    },
  };

  const results = {
    recipientEmail: targetEmail,
    subject,
    n8nSuccess: false,
    resendSuccess: false,
  };

  // 1. Dispatch to dedicated email Webhook
  const targetEmailWebhook = toProxiedUrl(emailWebhookUrl || webhookUrl);
  if (targetEmailWebhook && !targetEmailWebhook.includes('.internal')) {
    try {
      const resp = await fetch(targetEmailWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        results.n8nSuccess = true;
      } else {
        results.n8nError = `HTTP ${resp.status}`;
      }
    } catch (e) {
      results.n8nError = e.message || 'Network error';
      console.warn('n8n email dispatch notice:', e.message || e);
    }
  }

  // 2. Optional: Dispatch to Resend API if API Key is configured
  const activeResendKey =
    resendApiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RESEND_API_KEY) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('resend_api_key') : null);

  if (activeResendKey) {
    try {
      const resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeResendKey}`,
        },
        body: JSON.stringify({
          from: 'DueMitra Invoicing <onboarding@resend.dev>',
          to: [targetEmail],
          subject,
          html,
          text,
        }),
      });
      if (resendResp.ok) {
        results.resendSuccess = true;
      }
    } catch (e) {
      console.warn('Resend direct email dispatch error:', e);
    }
  }

  return results;
}

/**
 * Builds Plain Text Executive Due Reminders Digest for the Business Owner
 */
export function buildDueDigestPlainText({
  business,
  activeInvoices = [],
  followupsDueToday = [],
  priorityChaseList = [],
  ageingBuckets = {},
  demoDate,
  intervalHours = 3,
}) {
  const bizName = business?.name || 'Kavach Mobile Accessories';
  const totalOutstanding = activeInvoices
    .filter((i) => i.status !== 'paid')
    .reduce((s, i) => s + (i.balanceDuePaise || 0), 0);
  const totalOverdue = ageingBuckets?.totalOverduePaise || 0;
  const overdueCount = activeInvoices.filter(
    (i) => i.status !== 'paid' && (i.daysOverdue > 0 || i.status === 'overdue')
  ).length;

  const followupsList = followupsDueToday.length > 0
    ? followupsDueToday
        .map(
          (f, idx) =>
            `${idx + 1}. [Stage ${f.stage?.number || '?'}: ${f.stage?.name || 'Reminder'}] ${f.customer?.name || f.invoice.customerName}
   - Invoice: ${f.invoice.invoiceNumber} | Balance: ${formatPaise(f.invoice.balanceDuePaise)}
   - Overdue: ${f.stage?.daysDiff > 0 ? `${f.stage.daysDiff} days overdue` : f.stage?.daysDiff === 0 ? 'Due Today' : `Due in ${Math.abs(f.stage.daysDiff)} days`}
   - Contact: ${f.customer?.contactPerson || 'Proprietor'} (${f.customer?.phone || f.invoice.customerPhone || 'N/A'})
   - Quick Pay Link: ${typeof window !== 'undefined' ? window.location.origin : 'https://kavach.app'}/pay/${f.invoice.token || f.invoice.id}`
        )
        .join('\n\n')
    : 'No escalation reminders scheduled for today. All receivables within standard credit cycle.';

  const topChase = priorityChaseList.slice(0, 5).map(
    (item, idx) =>
      `${idx + 1}. ${item.customer?.name || item.invoice.customerName} - ${formatPaise(item.invoice.balanceDuePaise)} (${item.daysOverdue} days overdue)`
  ).join('\n');

  return `🛡️ DueMitra Executive Due Reminders & Cash Digest
==================================================
Business Store: ${bizName}
Scheduled Cycle: Every ${intervalHours} Hours Automated Briefing
Simulated Ledger Date: ${formatIndianDate(demoDate || new Date().toISOString().split('T')[0])}
Dispatched At: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}

--------------------------------------------------
EXECUTIVE SUMMARY:
Total Receivables Outstanding: ${formatPaise(totalOutstanding)}
Total Overdue Capital at Risk: ${formatPaise(totalOverdue)} (${overdueCount} Invoices Overdue)
Actionable Reminders Due:     ${followupsDueToday.length} Accounts
MSMED Act Compound Interest:   19.5% p.a. (3x RBI Bank Rate applicable on eligible MSME invoices)

--------------------------------------------------
PRIORITY 1: TODAY'S FOLLOW-UP REMINDER QUEUE:
${followupsList}

--------------------------------------------------
PRIORITY 2: TOP HIGH-RISK CHASE INVOICES:
${topChase || 'None'}

--------------------------------------------------
RECEIVABLES AGING BREAKDOWN:
- Not Yet Due (0-30d terms): ${formatPaise(ageingBuckets?.notYetDuePaise || 0)}
- 1-30 Days Overdue:        ${formatPaise(ageingBuckets?.d1_30Paise || 0)}
- 31-60 Days Overdue:       ${formatPaise(ageingBuckets?.d31_60Paise || 0)}
- 61-90 Days Overdue:       ${formatPaise(ageingBuckets?.d61_90Paise || 0)}
- 90+ Days Critical:        ${formatPaise(ageingBuckets?.d90PlusPaise || 0)}

--------------------------------------------------
STATUTORY LEGAL COMPLIANCE:
Under the MSMED Act 2006, Section 15 & 16, buyer payments exceeding 45 days accrue compound interest at 3x RBI bank rate with monthly rests. Use DueMitra's Legal Demand Letter generator for Stage 5 accounts.

Access Command Center: ${typeof window !== 'undefined' ? window.location.origin : 'https://kavach.app'}/dashboard

Regards,
DueMitra Automated Receivables Intelligence Engine
${business?.notificationEmail && !business.notificationEmail.includes('kavachaccessories.in') ? `Support: ${business.notificationEmail}` : ''}
`;
}

/**
 * Builds High-End HTML Executive Due Reminders Digest Email
 */
export function buildDueDigestHtml({
  business,
  activeInvoices = [],
  followupsDueToday = [],
  priorityChaseList = [],
  ageingBuckets = {},
  demoDate,
  intervalHours = 3,
}) {
  const bizName = business?.name || 'Kavach Mobile Accessories';
  const totalOutstanding = activeInvoices
    .filter((i) => i.status !== 'paid')
    .reduce((s, i) => s + (i.balanceDuePaise || 0), 0);
  const totalOverdue = ageingBuckets?.totalOverduePaise || 0;
  const overdueCount = activeInvoices.filter(
    (i) => i.status !== 'paid' && (i.daysOverdue > 0 || i.status === 'overdue')
  ).length;

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://kavach.app';

  const followupRows = (followupsDueToday || [])
    .map((f) => {
      const payUrl = `${appOrigin}/pay/${f.invoice.token || f.invoice.id}`;
      const stageBadgeBg =
        f.stage?.number >= 5 ? '#f43f5e' : f.stage?.number >= 3 ? '#f59e0b' : '#6366f1';

      return `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #1e293b; font-size: 13px;">
          <strong style="color: #ffffff; display: block; font-size: 14px;">${f.customer?.name || f.invoice.customerName}</strong>
          <span style="color: #94a3b8; font-size: 11px;">${f.customer?.contactPerson || 'Proprietor'} &bull; ${f.customer?.phone || f.invoice.customerPhone || 'N/A'}</span>
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #1e293b; font-size: 12px; font-family: monospace; color: #cbd5e1;">
          ${f.invoice.invoiceNumber}
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #1e293b; font-size: 14px; font-family: monospace; font-weight: bold; color: #ffffff; text-align: right;">
          ${formatPaise(f.invoice.balanceDuePaise)}
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #1e293b; text-align: center;">
          <span style="background-color: ${stageBadgeBg}; color: #ffffff; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 9999px; text-transform: uppercase;">
            Stage ${f.stage?.number || '?'}: ${f.stage?.name || 'Due'}
          </span>
          <div style="color: #f43f5e; font-size: 11px; margin-top: 4px; font-weight: 600;">
            ${f.stage?.daysDiff > 0 ? `${f.stage.daysDiff}d overdue` : f.stage?.daysDiff === 0 ? 'Due Today' : `In ${Math.abs(f.stage.daysDiff)}d`}
          </div>
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #1e293b; text-align: right;">
          <a href="${payUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: bold;">
            Collect &rarr;
          </a>
        </td>
      </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DueMitra Executive Due Reminders Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0f1d; margin: 0; padding: 24px; color: #f8fafc;">
  <div style="max-width: 680px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    
    <!-- Top Header -->
    <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 28px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);">
      <table style="width: 100%;">
        <tr>
          <td>
            <div style="display: inline-block; background: #6366f1; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              Autonomous 2-3 Hour Dispatch
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
              🛡️ ${bizName}
            </h1>
            <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">
              Executive Due Reminders & Overdue Cash Digest
            </p>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <span style="font-family: monospace; font-size: 11px; color: #a5b4fc; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); padding: 4px 10px; border-radius: 8px; display: inline-block;">
              Cycle: Every ${intervalHours}h
            </span>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
              ${formatIndianDate(demoDate || new Date().toISOString().split('T')[0])}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- 4 KPI Metrics Grid -->
    <div style="padding: 20px 24px; background: #0b1120; border-bottom: 1px solid rgba(255,255,255,0.06);">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; padding: 8px;">
            <div style="background: #111c33; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px;">
              <span style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #94a3b8; letter-spacing: 0.5px; display: block;">Total Receivables</span>
              <div style="font-size: 20px; font-weight: 900; font-family: monospace; color: #ffffff; margin-top: 4px;">
                ${formatPaise(totalOutstanding)}
              </div>
              <span style="font-size: 11px; color: #38bdf8; display: block; margin-top: 2px;">
                ${activeInvoices.filter((i) => i.status !== 'paid').length} open invoices
              </span>
            </div>
          </td>
          <td style="width: 50%; padding: 8px;">
            <div style="background: #111c33; border: 1px solid rgba(244,63,94,0.3); border-radius: 12px; padding: 14px;">
              <span style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #f43f5e; letter-spacing: 0.5px; display: block;">Capital Overdue</span>
              <div style="font-size: 20px; font-weight: 900; font-family: monospace; color: #f43f5e; margin-top: 4px;">
                ${formatPaise(totalOverdue)}
              </div>
              <span style="font-size: 11px; color: #fda4af; display: block; margin-top: 2px;">
                ${overdueCount} accounts delayed
              </span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="width: 50%; padding: 8px;">
            <div style="background: #111c33; border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; padding: 14px;">
              <span style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #f59e0b; letter-spacing: 0.5px; display: block;">Action Reminders Today</span>
              <div style="font-size: 20px; font-weight: 900; font-family: monospace; color: #f59e0b; margin-top: 4px;">
                ${followupsDueToday.length} Invoices
              </div>
              <span style="font-size: 11px; color: #fde68a; display: block; margin-top: 2px;">
                Escalation stages 1 through 5
              </span>
            </div>
          </td>
          <td style="width: 50%; padding: 8px;">
            <div style="background: #111c33; border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 14px;">
              <span style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #10b981; letter-spacing: 0.5px; display: block;">MSMED Legal Rate</span>
              <div style="font-size: 20px; font-weight: 900; font-family: monospace; color: #10b981; margin-top: 4px;">
                19.5% p.a.
              </div>
              <span style="font-size: 11px; color: #a7f3d0; display: block; margin-top: 2px;">
                3x RBI Compound Interest
              </span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Section 1: Today's Action Reminders Queue -->
    <div style="padding: 24px;">
      <div style="margin-bottom: 14px;">
        <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #ffffff;">
          Today's Action Reminders Queue
        </h2>
        <p style="margin: 3px 0 0; font-size: 12px; color: #94a3b8;">
          Invoices matching scheduled escalation stages for proactive recovery
        </p>
      </div>

      ${
        followupsDueToday.length > 0
          ? `
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: rgba(255,255,255,0.03); color: #94a3b8; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 8px 10px;">Customer</th>
            <th style="padding: 8px 10px;">Invoice #</th>
            <th style="padding: 8px 10px; text-align: right;">Due</th>
            <th style="padding: 8px 10px; text-align: center;">Status</th>
            <th style="padding: 8px 10px; text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${followupRows}
        </tbody>
      </table>
      `
          : `
      <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 10px; padding: 16px; text-align: center; color: #34d399; font-size: 13px;">
        All customer accounts are currently on schedule. No urgent escalation reminders due at this hour!
      </div>
      `
      }
    </div>

    <!-- Section 2: Aging Bucket Matrix -->
    <div style="padding: 0 24px 24px;">
      <div style="background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px;">
        <h3 style="margin: 0 0 10px; font-size: 13px; font-weight: bold; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px;">
          Receivables Aging Matrix
        </h3>
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Not Yet Due (0-30 Days Terms):</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: bold; color: #10b981;">
              ${formatPaise(ageingBuckets?.notYetDuePaise || 0)}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">1 - 30 Days Overdue:</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: bold; color: #f59e0b;">
              ${formatPaise(ageingBuckets?.d1_30Paise || 0)}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">31 - 60 Days Overdue:</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: bold; color: #f97316;">
              ${formatPaise(ageingBuckets?.d31_60Paise || 0)}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">61 - 90 Days Overdue:</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: bold; color: #ef4444;">
              ${formatPaise(ageingBuckets?.d61_90Paise || 0)}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">90+ Days Critical Overdue:</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: 900; color: #f43f5e;">
              ${formatPaise(ageingBuckets?.d90PlusPaise || 0)}
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Statutory Legal Reminder -->
    <div style="margin: 0 24px 24px; background: rgba(99,102,241,0.08); border-left: 4px solid #6366f1; border-radius: 8px; padding: 14px 16px;">
      <strong style="color: #a5b4fc; font-size: 12px; display: block; margin-bottom: 3px;">
        ⚖️ Statutory Protection (MSMED Act 2006, Sec 15 & 16):
      </strong>
      <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.5;">
        Any buyer delaying payment beyond 45 days is legally mandated to pay compound interest with monthly rests at 3x RBI bank rate (19.5% p.a.). For accounts past 60 days, generate a formal Statutory Legal Demand Notice with 1-click in DueMitra.
      </p>
    </div>

    <!-- CTA Button -->
    <div style="background: #0b1120; border-top: 1px solid rgba(255,255,255,0.08); padding: 22px; text-align: center;">
      <a href="${appOrigin}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 10px; font-size: 13px; font-weight: bold; box-shadow: 0 4px 14px rgba(99,102,241,0.4);">
        Open DueMitra Command Center &rarr;
      </a>
      <div style="margin-top: 10px; font-size: 11px; color: #64748b;">
        Review invoices, send WhatsApp reminders, or verify bank reconciliation
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 24px; background: #070b14; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
      Automated 2-3 hour briefing generated for ${bizName} &bull; Powered by DueMitra & n8n Cloud
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Dispatches the Recurring 2-3 Hour Due Reminders Digest Email to the Business Owner
 */
export async function dispatchDueRemindersDigestEmail({
  business,
  activeInvoices = [],
  followupsDueToday = [],
  priorityChaseList = [],
  ageingBuckets = {},
  demoDate,
  intervalHours = 3,
  recipientEmail,
  webhookUrl,
  emailWebhookUrl,
  dueDigestWebhookUrl,
  resendApiKey,
}) {
  const candidate =
    recipientEmail ||
    business?.notificationEmail ||
    business?.email;
  const targetEmail = candidate && !candidate.includes('kavachaccessories.in') ? candidate : '';

  if (!targetEmail) {
    console.warn('dispatchDueRemindersDigestEmail skipped: No valid recipient email configured (dummy/empty address prevented).');
    return {
      recipientEmail: '',
      subject: '',
      n8nSuccess: false,
      resendSuccess: false,
      skipped: true,
      error: 'Please configure your valid receiving email address in Settings or Follow-ups before sending digests.',
    };
  }

  const totalOutstanding = activeInvoices
    .filter((i) => i.status !== 'paid')
    .reduce((s, i) => s + (i.balanceDuePaise || 0), 0);
  const totalOverdue = ageingBuckets?.totalOverduePaise || 0;

  const subject = `🛡️ DueMitra Due Digest (${intervalHours}h): ${formatPaise(totalOverdue)} Overdue • ${followupsDueToday.length} Reminders Due [${business?.name || 'Kavach Mobile'}]`;

  const text = buildDueDigestPlainText({
    business,
    activeInvoices,
    followupsDueToday,
    priorityChaseList,
    ageingBuckets,
    demoDate,
    intervalHours,
  });

  const html = buildDueDigestHtml({
    business,
    activeInvoices,
    followupsDueToday,
    priorityChaseList,
    ageingBuckets,
    demoDate,
    intervalHours,
  });

  const payload = {
    // n8n standard fields
    to: targetEmail,
    email: targetEmail,
    recipientEmail: targetEmail,
    recipient: targetEmail,
    subject,
    text,
    message: text,
    html,
    event: 'due_reminders_digest',
    source: 'DueMitra ERP Automated Scheduler',
    scheduleInterval: `Every ${intervalHours} Hours`,
    businessName: business?.name || 'Kavach Mobile Accessories',
    timestamp: new Date().toISOString(),

    // Detailed metrics for n8n filters or Slack/WhatsApp bridges
    totalOutstandingPaise: totalOutstanding,
    totalOutstandingFormatted: formatPaise(totalOutstanding),
    totalOverduePaise: totalOverdue,
    totalOverdueFormatted: formatPaise(totalOverdue),
    followupsCount: followupsDueToday.length,
    overdueInvoicesCount: activeInvoices.filter(
      (i) => i.status !== 'paid' && (i.daysOverdue > 0 || i.status === 'overdue')
    ).length,
    followups: followupsDueToday.map((f) => ({
      invoiceNumber: f.invoice.invoiceNumber,
      customerName: f.customer?.name || f.invoice.customerName,
      customerPhone: f.customer?.phone || f.invoice.customerPhone,
      balanceDuePaise: f.invoice.balanceDuePaise,
      balanceDueFormatted: formatPaise(f.invoice.balanceDuePaise),
      stageNumber: f.stage?.number,
      stageName: f.stage?.name,
      daysDiff: f.stage?.daysDiff,
    })),
  };

  const results = {
    recipientEmail: targetEmail,
    subject,
    n8nSuccess: false,
    resendSuccess: false,
  };

  // 1. Dispatch to dedicated n8n Due Reminders Digest Webhook
  const targetWebhook = toProxiedUrl(
    dueDigestWebhookUrl ||
    'https://ymahanthreddy.app.n8n.cloud/webhook/due-reminders-digest'
  );
  if (targetWebhook && !targetWebhook.includes('.internal')) {
    try {
      const resp = await fetch(targetWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        results.n8nSuccess = true;
      } else {
        results.n8nError = `HTTP ${resp.status}`;
      }
    } catch (e) {
      results.n8nError = e.message || 'Network error';
      console.warn('n8n due digest dispatch notice:', e.message || e);
    }
  }

  // 2. Dispatch to Resend API if configured
  const activeResendKey =
    resendApiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RESEND_API_KEY) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('resend_api_key') : null);

  if (activeResendKey) {
    try {
      const resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeResendKey}`,
        },
        body: JSON.stringify({
          from: 'DueMitra Digest <onboarding@resend.dev>',
          to: [targetEmail],
          subject,
          html,
          text,
        }),
      });
      if (resendResp.ok) {
        results.resendSuccess = true;
      }
    } catch (e) {
      console.warn('Resend digest email dispatch error:', e);
    }
  }

  return results;
}

/**
 * Dispatches Welcome / Registration Confirmation Email when a new business registers
 */
export async function dispatchNewBusinessRegistrationEmail({
  business,
  recipientEmail,
  webhookUrl,
  emailWebhookUrl,
  resendApiKey,
}) {
  const candidate = recipientEmail || business?.notificationEmail || business?.email || business?.loginEmail;
  const targetEmail = candidate && !candidate.includes('kavachaccessories.in') ? candidate : '';

  if (!targetEmail) {
    console.warn('dispatchNewBusinessRegistrationEmail skipped: No valid receiving email address configured.');
    return {
      recipientEmail: '',
      n8nSuccess: false,
      resendSuccess: false,
      skipped: true,
      reason: 'No valid recipient email address configured.',
    };
  }
  const bizName = business?.name || 'New Enterprise Store';
  const subject = `🎉 Welcome to DueMitra - Store Registration Confirmed: ${bizName}`;

  const text = `Dear ${bizName} Team,

Welcome to DueMitra - India's Autonomous Trade Credit & Receivables Protection Operating System.

Your new business store registration has been successfully recorded on the platform:
- Business Legal Name: ${bizName}
- Trade Name:          ${business.tradeName || bizName}
- GSTIN:               ${business.gstin || 'Pending Verification'}
- Place of Supply:     ${business.city || 'Pune'}, ${business.state || 'Maharashtra'} (${business.stateCode || '27'})
- Registered Email:    ${targetEmail}
- Initial Status:      Pending Platform Admin Verification

WHAT HAPPENS NEXT:
1. Platform Administrators review your verified GSTIN and business credentials.
2. Once verified, your account desk is authorized to create automated invoices, issue MSMED demand notices, and sync bank statements.
3. Your automated 2-3 hour recovery digests will be delivered to: ${targetEmail}.

Access Portal: ${typeof window !== 'undefined' ? window.location.origin : 'https://kavach.app'}/login

Thank you for choosing DueMitra to protect your trade receivables.

Warm regards,
DueMitra Platform Operations
Helpdesk: admin@duemitra.in
`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0f1d; color: #f8fafc; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    
    <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 28px; border-bottom: 1px solid rgba(255,255,255,0.08);">
      <div style="display: inline-block; background: #10b981; color: #022c22; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; margin-bottom: 8px;">
        Registration Acknowledged
      </div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
        Welcome to DueMitra, ${bizName}!
      </h1>
      <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">
        Autonomous Trade Credit & Statutory MSMED Protection
      </p>
    </div>

    <div style="padding: 24px;">
      <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin-top: 0;">
        Your business store application has been submitted to the DueMitra ERP Governance desk. Here is your initial registration profile:
      </p>

      <div style="background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin: 16px 0;">
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Store Legal Name:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ffffff; text-align: right;">${bizName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Verified GSTIN:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #38bdf8; text-align: right;">${business.gstin || 'Pending Verification'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Operating Location:</td>
            <td style="padding: 6px 0; color: #ffffff; text-align: right;">${business.city || 'Pune'}, ${business.state || 'Maharashtra'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Registered Login Email:</td>
            <td style="padding: 6px 0; font-family: monospace; color: #a5b4fc; text-align: right;">${targetEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Governance Status:</td>
            <td style="padding: 6px 0; text-align: right;"><span style="background: rgba(245,158,11,0.2); color: #fbbf24; padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 10px;">Pending Review</span></td>
          </tr>
        </table>
      </div>

      <div style="background: rgba(99,102,241,0.08); border-left: 4px solid #6366f1; border-radius: 8px; padding: 12px 14px; margin-bottom: 20px;">
        <strong style="color: #a5b4fc; font-size: 11px; display: block; margin-bottom: 2px;">
          What Happens Next:
        </strong>
        <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.5;">
          Platform Super Admins will review and verify your tax profile. Once approved, you can generate legal MSMED demand notices, track trade credit aging, and receive 2-3 hour executive due digests.
        </p>
      </div>

      <div style="text-align: center; padding-top: 8px;">
        <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://kavach.app'}/login" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: bold;">
          Sign In to Portal &rarr;
        </a>
      </div>
    </div>

    <div style="padding: 16px; background: #070b14; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05);">
      DueMitra ERP &bull; Autonomous MSMED Act 2006 Debt Recovery Operating System
    </div>
  </div>
</body>
</html>
`;

  const payload = {
    to: targetEmail,
    email: targetEmail,
    recipientEmail: targetEmail,
    subject,
    text,
    message: text,
    html,
    event: 'store_registration_applied',
    businessName: bizName,
    gstin: business.gstin,
    timestamp: new Date().toISOString(),
  };

  const results = {
    recipientEmail: targetEmail,
    subject,
    n8nSuccess: false,
    resendSuccess: false,
  };

  const targetWebhook = toProxiedUrl(emailWebhookUrl || webhookUrl);
  if (targetWebhook && !targetWebhook.includes('.internal')) {
    try {
      const resp = await fetch(targetWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        results.n8nSuccess = true;
      }
    } catch (e) {
      console.warn('n8n registration email notice:', e.message || e);
    }
  }

  const activeResendKey =
    resendApiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RESEND_API_KEY) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('resend_api_key') : null);

  if (activeResendKey) {
    try {
      const resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeResendKey}`,
        },
        body: JSON.stringify({
          from: 'DueMitra Onboarding <onboarding@resend.dev>',
          to: [targetEmail],
          subject,
          html,
          text,
        }),
      });
      if (resendResp.ok) {
        results.resendSuccess = true;
      }
    } catch (e) {
      console.warn('Resend registration email dispatch error:', e);
    }
  }

  return results;
}

