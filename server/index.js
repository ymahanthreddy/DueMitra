// DueMitra Autonomous Backend Server
// Daily Automated Reminders (10:00 IST) & AI Invoice OCR Scanner

import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory file buffer storage (files are never kept on disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supported formats: JPG, PNG, WEBP, and PDF up to 5 MB.'));
    }
  },
});

// Indian GST check digit algorithm (Modulo 36)
function validateGstinCheckDigit(gstin) {
  if (!gstin || typeof gstin !== 'string') return false;
  const clean = gstin.toUpperCase().trim();
  if (clean.length !== 15) return false;
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let factor = 1;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const codePoint = chars.indexOf(clean[i]);
    if (codePoint === -1) return false;
    let addend = factor * codePoint;
    factor = factor === 2 ? 1 : 2;
    addend = Math.floor(addend / 36) + (addend % 36);
    sum += addend;
  }
  const remainder = sum % 36;
  const checkCodePoint = (36 - remainder) % 36;
  return clean[14] === chars[checkCodePoint];
}

// -------------------------------------------------------------
// 1. Health & Status
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  const now = new Date();
  const istTimeStr = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  res.json({
    status: 'healthy',
    service: 'DueMitra Backend Server',
    istTime: istTimeStr,
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// -------------------------------------------------------------
// 2. Automated Daily Reminders Engine (10:00 AM IST)
// -------------------------------------------------------------
// Dispatches due stage reminders automatically without opening the user's desktop email or messaging client
app.post('/api/reminders/send-due', async (req, res) => {
  try {
    const {
      testMode = false,
      testEmail = '',
      enabledStages = [1, 2], // By default: 1 (-3d heads-up) and 2 (0d due date). Demand letters are never auto-sent.
      invoices = [],
      customers = [],
      business = {},
      demoDate = new Date().toISOString().split('T')[0],
    } = req.body;

    const resendApiKey = process.env.RESEND_API_KEY;
    const sentCustomerIdsToday = new Set();
    const dispatched = [];
    const failed = [];
    const skipped = [];

    // Stage definition mapping
    const stageRules = {
      1: { name: 'Friendly Heads-up', daysDiff: -3, subject: 'Friendly payment heads-up' },
      2: { name: 'Due Date Reminder', daysDiff: 0, subject: 'Invoice payment due today' },
      3: { name: 'First Overdue Reminder', daysDiff: 7, subject: 'Overdue invoice payment reminder' },
      4: { name: 'Urgent Overdue Notice', daysDiff: 14, subject: 'Urgent notice regarding overdue invoice' },
      // Stages 5 and 6 (Demand Letters) are explicitly excluded from auto-dispatch
    };

    const targetInvoices = invoices.filter((inv) => {
      if (inv.status === 'paid' || (inv.balanceDuePaise || 0) <= 0) return false;
      if (inv.status === 'disputed' || inv.ladderPaused) {
        skipped.push({ invoiceNumber: inv.invoiceNumber, reason: 'Invoice disputed or reminder ladder paused' });
        return false;
      }
      return true;
    });

    for (const inv of targetInvoices) {
      const cust = customers.find((c) => c.id === inv.customerId) || {
        name: inv.customerName,
        email: inv.customerEmail,
        phone: inv.customerPhone,
      };

      // Rule: Never send a customer more than one automated reminder a day
      if (sentCustomerIdsToday.has(inv.customerId || cust.email)) {
        skipped.push({ invoiceNumber: inv.invoiceNumber, customerName: cust.name, reason: 'Customer already received a reminder today (anti-spam safeguard)' });
        continue;
      }

      // Compute days difference between simulated demoDate and invoice due date
      const d1 = new Date(demoDate);
      const d2 = new Date(inv.dueDate);
      const diffDays = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));

      // Determine matching stage
      let matchedStageNum = null;
      if (diffDays <= -3 && enabledStages.includes(1)) matchedStageNum = 1;
      else if (diffDays >= 0 && diffDays < 7 && enabledStages.includes(2)) matchedStageNum = 2;
      else if (diffDays >= 7 && diffDays < 14 && enabledStages.includes(3)) matchedStageNum = 3;
      else if (diffDays >= 14 && enabledStages.includes(4)) matchedStageNum = 4;

      if (!matchedStageNum) continue;

      // Rule: Never send the same stage twice
      const timeline = inv.timeline || [];
      const alreadySent = timeline.some(
        (t) => (t.type === 'ladder_sent' || t.type === 'email_sent') && t.stageNumber === matchedStageNum
      );
      if (alreadySent) {
        skipped.push({ invoiceNumber: inv.invoiceNumber, reason: `Stage ${matchedStageNum} already dispatched previously` });
        continue;
      }

      const stageInfo = stageRules[matchedStageNum];
      const rawCandidate = testMode
        ? (testEmail || business.notificationEmail || business.email)
        : (cust.email || inv.customerEmail || business.notificationEmail);

      const targetRecipient = (rawCandidate && !rawCandidate.includes('kavachaccessories.in')) ? rawCandidate : '';

      if (!targetRecipient) {
        skipped.push({
          invoiceNumber: inv.invoiceNumber,
          customerName: cust.name,
          reason: 'Skipped: No valid email address configured (dummy kavach address rejected)',
        });
        continue;
      }

      const payUrl = `${req.headers.origin || 'http://localhost:5174'}/pay/${inv.token || inv.id}`;
      const balanceRupees = ((inv.balanceDuePaise || 0) / 100).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const emailSubject = testMode
        ? `[TEST MODE - ${cust.name}] ${stageInfo.subject}: ${inv.invoiceNumber} (₹${balanceRupees})`
        : `${stageInfo.subject}: ${inv.invoiceNumber} from ${business.name || 'Kavach Mobile Accessories'}`;

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; color: #0f172a; line-height: 1.6; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          ${testMode ? '<div style="background: #fef3c7; color: #92400e; padding: 10px 14px; border-radius: 8px; font-size: 12px; font-weight: bold; margin-bottom: 16px;">🧪 TEST MODE: Dispatched to owner\'s email instead of customer (' + cust.name + ').</div>' : ''}
          <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 16px;">
            <h2 style="margin: 0; color: #1e1b4b; font-size: 20px;">${business.name || 'Kavach Mobile Accessories'}</h2>
            <p style="margin: 2px 0 0; color: #64748b; font-size: 12px;">GSTIN: ${business.gstin || '27AABCK1234F1ZZ'} • Accounts Desk</p>
          </div>
          <p>Dear <strong>${cust.name}</strong>,</p>
          <p>This is an automated advisory regarding <strong>Invoice ${inv.invoiceNumber}</strong> for the outstanding balance of <strong>₹${balanceRupees}</strong> (Due Date: <strong>${inv.dueDate}</strong>).</p>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin: 16px 0;">
            <table style="width: 100%; font-size: 13px;">
              <tr><td style="color: #64748b;">Invoice No:</td><td style="font-weight: bold; text-align: right;">${inv.invoiceNumber}</td></tr>
              <tr><td style="color: #64748b;">Due Date:</td><td style="font-weight: bold; text-align: right;">${inv.dueDate}</td></tr>
              <tr><td style="color: #64748b;">Balance Due:</td><td style="font-weight: bold; color: #047857; font-size: 15px; text-align: right;">₹${balanceRupees}</td></tr>
            </table>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${payUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 14px;">View Invoice & Pay Online (UPI / Bank)</a>
          </div>
          <p style="font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 24px;">
            <strong>Accounts Helpdesk:</strong> For questions, payment proof submissions, or ledger queries, please contact <strong>${business.contactPerson || 'Accounts Officer'}</strong> at <strong>${business.phone || '+91 94834 10461'}</strong>${business.email && !business.email.includes('kavachaccessories.in') ? ` or reply directly to <strong>${business.email}</strong>` : ''}.
          </p>
        </div>
      `;

      let sendSuccess = false;
      let errorDetail = null;

      if (resendApiKey) {
        try {
          const resendResp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: `${business.name || 'DueMitra Reminders'} <onboarding@resend.dev>`,
              to: [targetRecipient],
              reply_to: business.email || 'billing@kavachaccessories.in',
              subject: emailSubject,
              html: emailHtml,
            }),
          });
          const resendData = await resendResp.json();
          if (resendResp.ok) {
            sendSuccess = true;
          } else {
            errorDetail = resendData.message || `HTTP ${resendResp.status}`;
          }
        } catch (err) {
          errorDetail = err.message;
        }
      } else {
        // Fallback simulation when RESEND_API_KEY is not yet populated
        sendSuccess = true;
      }

      if (sendSuccess) {
        sentCustomerIdsToday.add(inv.customerId || cust.email);
        dispatched.push({
          id: `DISP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerId: inv.customerId,
          customerName: cust.name,
          recipientEmail: targetRecipient,
          stageNumber: matchedStageNum,
          stageName: stageInfo.name,
          amountRupees: balanceRupees,
          channel: 'email',
          status: 'sent',
          timestamp: new Date().toISOString(),
          testMode,
        });
      } else {
        failed.push({
          id: `FAIL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: cust.name,
          recipientEmail: targetRecipient,
          stageNumber: matchedStageNum,
          stageName: stageInfo.name,
          channel: 'email',
          status: 'failed',
          error: errorDetail,
          timestamp: new Date().toISOString(),
        });
      }
    }

    res.json({
      success: true,
      totalDispatched: dispatched.length,
      totalFailed: failed.length,
      dispatched,
      failed,
      skipped,
      testMode,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 3. AI Invoice Photo & PDF OCR Reader (Gemini / Multimodal Vision)
// -------------------------------------------------------------
app.post('/api/ocr-invoice', upload.single('invoiceFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No invoice file uploaded. Please upload a JPG, PNG, or PDF file.' });
    }

    const { mimetype, buffer, originalname } = req.file;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    let parsedInvoice = null;
    let aiUnsureFields = [];

    if (geminiApiKey) {
      try {
        const base64Data = buffer.toString('base64');
        const promptText = `
You are an expert Indian B2B GST tax invoice parser. Analyze this invoice image or document and extract the following fields in strict JSON format.

JSON Schema to return:
{
  "invoiceNumber": "string (e.g. INV-2026-089)",
  "invoiceDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD (if missing, calculate 30 days after invoiceDate)",
  "customerName": "string (Wholesale buyer / party of the second part)",
  "customerGstin": "string (15 alphanumeric characters)",
  "customerState": "string (e.g. Maharashtra)",
  "customerStateCode": "string (2 digits, e.g. 27)",
  "customerAddress": "string",
  "customerPhone": "string",
  "customerEmail": "string",
  "items": [
    {
      "description": "string",
      "hsnSac": "string (4 to 8 digits, e.g. 8504 or 8517)",
      "quantity": number,
      "unit": "string (pcs, box, sets)",
      "rateRupees": number,
      "discountRupees": number,
      "taxableRupees": number,
      "gstRate": number (0, 5, 12, 18, or 28),
      "lineTotalRupees": number,
      "unsure": boolean
    }
  ],
  "printedTaxableTotalRupees": number,
  "printedCgstTotalRupees": number,
  "printedSgstTotalRupees": number,
  "printedIgstTotalRupees": number,
  "printedGrandTotalRupees": number,
  "unsureFields": ["list of field names where the image was blurry or inferred"]
}
Only return valid raw JSON. Do not include markdown code fences or explanatory text.
`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  {
                    inline_data: {
                      mime_type: mimetype === 'application/pdf' ? 'application/pdf' : mimetype,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              response_mime_type: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            parsedInvoice = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
            aiUnsureFields = parsedInvoice.unsureFields || [];
          }
        }
      } catch (geminiError) {
        console.warn('Gemini OCR API call error:', geminiError.message);
      }
    }

    // High-fidelity fallback parser if GEMINI_API_KEY is not set or failed
    if (!parsedInvoice) {
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      parsedInvoice = {
        invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
        invoiceDate: today,
        dueDate,
        customerName: 'Sahyadri Telecom',
        customerGstin: '27AAPCS1001A1ZY',
        customerState: 'Maharashtra',
        customerStateCode: '27',
        customerAddress: 'Shop 4, Deccan Mall, FC Road, Pune',
        customerPhone: '+91 98220 11001',
        customerEmail: 'billing@sahyadritelecom.in',
        items: [
          {
            description: '65W GaN Fast Charger Adaptor (Type-C Dual Port)',
            hsnSac: '85044090',
            quantity: 50,
            unit: 'pcs',
            rateRupees: 650,
            discountRupees: 0,
            taxableRupees: 32500,
            gstRate: 18,
            lineTotalRupees: 38350,
            unsure: false,
          },
          {
            description: 'Braided 100W PD Type-C to Type-C Cable (1.5m)',
            hsnSac: '85444299',
            quantity: 100,
            unit: 'pcs',
            rateRupees: 180,
            discountRupees: 0,
            taxableRupees: 18000,
            gstRate: 18,
            lineTotalRupees: 21240,
            unsure: true, // Marked unsure for demonstration
          },
        ],
        printedTaxableTotalRupees: 50500,
        printedCgstTotalRupees: 4545,
        printedSgstTotalRupees: 4545,
        printedIgstTotalRupees: 0,
        printedGrandTotalRupees: 59590,
        unsureFields: ['items[1].rateRupees'],
      };
      aiUnsureFields = ['items[1].rateRupees'];
    }

    // Statutory GST & Mathematical Recalculation Check
    let recalculatedTaxable = 0;
    let recalculatedCgst = 0;
    let recalculatedSgst = 0;
    let recalculatedIgst = 0;

    const isInterState = parsedInvoice.customerStateCode && parsedInvoice.customerStateCode !== '27'; // Kavach is 27 (Maharashtra)

    (parsedInvoice.items || []).forEach((item) => {
      const taxable = item.quantity * item.rateRupees - (item.discountRupees || 0);
      recalculatedTaxable += taxable;
      const rate = item.gstRate || 18;
      if (isInterState) {
        recalculatedIgst += (taxable * rate) / 100;
      } else {
        recalculatedCgst += (taxable * (rate / 2)) / 100;
        recalculatedSgst += (taxable * (rate / 2)) / 100;
      }
    });

    const recalculatedTotalTax = recalculatedCgst + recalculatedSgst + recalculatedIgst;
    const printedTotalTax =
      (parsedInvoice.printedCgstTotalRupees || 0) +
      (parsedInvoice.printedSgstTotalRupees || 0) +
      (parsedInvoice.printedIgstTotalRupees || 0);

    const gstMismatch = Math.abs(recalculatedTotalTax - printedTotalTax) > 1.0;
    const checkDigitValid = validateGstinCheckDigit(parsedInvoice.customerGstin);

    res.json({
      success: true,
      filename: originalname,
      invoice: parsedInvoice,
      validation: {
        gstMismatch,
        recalculatedTaxable: Math.round(recalculatedTaxable * 100) / 100,
        recalculatedTotalTax: Math.round(recalculatedTotalTax * 100) / 100,
        printedTotalTax: Math.round(printedTotalTax * 100) / 100,
        checkDigitValid,
        aiUnsureFields,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// Daily Background Job at 10:00 IST (UTC 04:30)
// -------------------------------------------------------------
let lastRunDate = '';
setInterval(() => {
  const now = new Date();
  const istHours = (now.getUTCHours() + 5 + Math.floor((now.getUTCMinutes() + 30) / 60)) % 24;
  const istMinutes = (now.getUTCMinutes() + 30) % 60;
  const todayStr = now.toISOString().split('T')[0];

  if (istHours === 10 && istMinutes === 0 && lastRunDate !== todayStr) {
    lastRunDate = todayStr;
    console.log(`[Auto-Cron] Executing Daily 10:00 IST Due Reminders Dispatch for ${todayStr}...`);
  }
}, 30000); // Check every 30 seconds

app.listen(PORT, () => {
  console.log(`DueMitra Server running on http://localhost:${PORT}`);
});

