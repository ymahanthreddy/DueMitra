# DueMitra (द्यूमित्र) — Production n8n Cloud Automation Architecture

> **Complete suite of autonomous workflows for B2B trade credit recovery, real-time lifecycle event hooks, AI bank statement reconciliation with Section 194Q TDS detection, and headless WhatsApp Business Platform messaging.**

---

## 🧭 The 4 Production Workflows Overview

| # | Workflow Name | File | Endpoint / Trigger | Purpose & Highlights |
|---|---|---|---|---|
| **1** | **Alerts & Escalation Receiver** | `01-kavach-alerts-webhook.json` | `POST /webhook/kavach-alerts` | Real-time receiver for stage escalations, customer dispute holds, and payment claims. |
| **2** | **AI Bank Reconciliation Engine** | `02-ai-bank-reconciliation-workflow.json` | `POST /webhook/ai-bank-parse` | Analyzes statement narration lines to detect multi-bill settlements and Section 194Q/194C TDS deductions (1%, 2%, 10%). |
| **3** | **Unified Multi-Event & 2-3h Digest Engine** | `03-daily-digest-cron-workflow.json` | Cron `0 */2 * * *` & `POST /webhook/due-reminders-digest` | **Primary Unified Endpoint**: Automatically handles ping tests, invoice creations, and 2-3h executive digests with a safe `IF` branch that prevents email bounces. |
| **4** | **WhatsApp Business Cloud API Engine** | `04-whatsapp-meta-cloud-api-workflow.json` | `POST /webhook/whatsapp-send-reminder` | Headless WhatsApp reminder dispatcher pre-configured with the **5 official Meta Utility templates** (`friendly_pre_due_heads_up`, `invoice_due_today_advisory`, etc.). |

---

## ⚡ How to Import / Update into Your n8n Instance

### Step 1: Open Your n8n Cloud Canvas
1. Visit your active n8n instance: `https://ymahanthreddy.app.n8n.cloud`
2. Log in and open your workspace canvas.

### Step 2: Import Workflow Files
For any workflow you wish to activate:
1. In the top-right corner of n8n, click the **`...` (More)** menu.
2. Select **Import from File...**
3. Choose any of the JSON files in this directory:
   - `03-daily-digest-cron-workflow.json` *(Recommended: Updated Unified Engine)*
   - `01-kavach-alerts-webhook.json`
   - `02-ai-bank-reconciliation-workflow.json`
   - `04-whatsapp-meta-cloud-api-workflow.json`
4. Toggle the workflow to **Active** (green switch in top-right).

---

## 🛡️ Critical Design Improvements in Workflow 3 (`03-daily-digest-cron-workflow.json`)

If you are using `https://ymahanthreddy.app.n8n.cloud/webhook/due-reminders-digest`:
1. **Multi-Event Router**:
   - Responds to `event: "ping_test"` with instant `200 OK` (`{"status":"connected"}`) without triggering unnecessary emails.
   - Responds to customer disputes and payment claims by acknowledging the hold on the escalation ladder.
2. **Conditional `IF` Guard Node Before Gmail**:
   - Evaluates `{{ $json.sendEmail === true }}`.
   - If a valid recipient email exists: delivers the executive HTML digest.
   - If no recipient email is set or if dummy addresses are filtered: **skips the Gmail node cleanly**, preventing 550 "Address not found" bounce emails.
   - Always returns a fast 200 OK response to DueMitra ERP.

---

## 📱 Meta WhatsApp Cloud API Workflow Details (`04-whatsapp-meta-cloud-api-workflow.json`)

To transition from one-tap `wa.me` links to fully automated headless background sending:
1. The workflow maps stage numbers (1 through 5) directly to the **5 Meta Utility Templates**:
   - **Stage 1**: `friendly_pre_due_heads_up` (-3 days)
   - **Stage 2**: `invoice_due_today_advisory` (Due date)
   - **Stage 3**: `first_overdue_followup` (+7 days)
   - **Stage 4**: `second_overdue_warning` (+14 days)
   - **Stage 5**: `commercial_demand_heads_up` (+30 days)
2. Automatically converts phone numbers to E.164 format (`91XXXXXXXXXX`).
3. Supports multilingual template switching (`en_US`, `hi`, `mr`).

---

## 🧪 Verification via Terminal

You can test your live n8n webhook anytime using this PowerShell / Node snippet:

```bash
# Test connection ping
node -e "fetch('https://ymahanthreddy.app.n8n.cloud/webhook/due-reminders-digest', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({event: 'ping_test'})}).then(r => r.json()).then(console.log)"
```
