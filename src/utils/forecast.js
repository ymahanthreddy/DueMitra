// 13-Week Cash Flow Forecast Engine
import { addDays, toISODateString } from './date.js';

export function compute13WeekForecast({
  startDateStr = '2026-10-23',
  openingBankBalancePaise = 48289200, // ₹4,82,892
  openInvoices = [],
  customers = [],
  expenses = [],
  safetyBufferPaise = 20000000, // ₹2,00,000
  whatIf = { customerDelay: false, bigOrder: false, delaySupplier: false },
}) {
  const customerMap = new Map(customers.map(c => [c.id, c]));

  // Build 13 consecutive 7-day week periods
  const weeks = [];
  const baseDate = new Date(startDateStr);

  for (let w = 0; w < 13; w++) {
    const wStart = new Date(baseDate);
    wStart.setDate(baseDate.getDate() + (w * 7));

    const wEnd = new Date(wStart);
    wEnd.setDate(wStart.getDate() + 6);

    const sStr = toISODateString(wStart);
    const eStr = toISODateString(wEnd);

    weeks.push({
      weekIndex: w + 1,
      startDate: sStr,
      endDate: eStr,
      label: `W${w + 1} (${wStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`,
      openingCashPaise: 0,
      inflowPaise: 0,
      outflowPaise: 0,
      closingCashPaise: 0,
      inflowItems: [],
      outflowItems: [],
      isBelowSafetyBuffer: false,
    });
  }

  // 1. Distribute Inflows across the 13 weeks
  openInvoices.forEach(inv => {
    if (inv.status === 'paid' || inv.balanceDuePaise <= 0) return;

    const cust = customerMap.get(inv.customerId);
    let delayDays = cust?.avgDaysLate || 5;

    // What-If: Key customer Sahyadri Telecom pays 30 days later
    if (whatIf.customerDelay && inv.customerId === 'CUST-001') {
      delayDays += 30;
    }

    // Expected collection date = Due Date + Delay Days
    let expectedPayDate = addDays(inv.dueDate, delayDays);

    // If expected pay date is already in the past relative to current demo date,
    // money is aggressively chased and expected in Week 1 or Week 2
    if (expectedPayDate < startDateStr) {
      expectedPayDate = (cust?.reliabilityGrade === 'C') ? addDays(startDateStr, 12) : addDays(startDateStr, 3);
    }

    // Find which week this expected date falls into
    let targetWeek = weeks.find(w => expectedPayDate >= w.startDate && expectedPayDate <= w.endDate);
    if (!targetWeek && expectedPayDate < weeks[0].startDate) {
      targetWeek = weeks[0];
    } else if (!targetWeek && expectedPayDate > weeks[12].endDate) {
      targetWeek = weeks[12]; // cap at week 13
    }

    if (targetWeek) {
      targetWeek.inflowPaise += inv.balanceDuePaise;
      targetWeek.inflowItems.push({
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        amountPaise: inv.balanceDuePaise,
        expectedDate: expectedPayDate,
      });
    }
  });

  // What-If: Big festive bulk order arrives in Week 3 (+₹1,50,000)
  if (whatIf.bigOrder && weeks[2]) {
    const festivePaise = 15000000;
    weeks[2].inflowPaise += festivePaise;
    weeks[2].inflowItems.push({
      invoiceNumber: 'SPECIAL-FESTIVE-ADV',
      customerName: 'Festive Bulk Accessory Order Advance',
      amountPaise: festivePaise,
      expectedDate: weeks[2].startDate,
    });
  }

  // 2. Distribute Outflows across the 13 weeks
  // (Recurring monthly on 1st, 5th, 10th, 20th + Distributor bills)
  for (let w = 0; w < 13; w++) {
    const week = weeks[w];
    const wStart = new Date(week.startDate);
    const wEnd = new Date(week.endDate);

    // Check each day of the week for recurring monthly bills
    for (let d = new Date(wStart); d <= wEnd; d.setDate(d.getDate() + 1)) {
      const dayNum = d.getDate();
      const curDateStr = toISODateString(d);

      expenses.forEach(exp => {
        if (exp.isRecurring && exp.dayOfMonth === dayNum) {
          week.outflowPaise += exp.amountPaise;
          week.outflowItems.push({
            title: exp.title,
            recipient: exp.recipient,
            amountPaise: exp.amountPaise,
            date: curDateStr,
            category: exp.category,
          });
        }
      });
    }

    // Check non-recurring distributor bills
    expenses.forEach(exp => {
      if (!exp.isRecurring && exp.dueDate) {
        let billDueDate = exp.dueDate;

        // What-If: Delay supplier bill (distributor bill 01 delayed by 2 weeks)
        if (whatIf.delaySupplier && exp.id === 'EXP-DIST-01') {
          billDueDate = addDays(billDueDate, 14);
        }

        if (billDueDate >= week.startDate && billDueDate <= week.endDate) {
          week.outflowPaise += exp.amountPaise;
          week.outflowItems.push({
            title: exp.title,
            recipient: exp.recipient,
            amountPaise: exp.amountPaise,
            date: billDueDate,
            category: exp.category,
          });
        }
      }
    });
  }

  // 3. Compute Week-by-Week Running Balances:
  // Strictly guarantees: week[w].openingCashPaise === week[w-1].closingCashPaise
  let runningCash = openingBankBalancePaise;
  let lowestPointPaise = runningCash;
  let troughWeekIndex = 1;
  let firstBufferBreachWeek = null;

  for (let w = 0; w < 13; w++) {
    const week = weeks[w];
    week.openingCashPaise = runningCash;
    week.closingCashPaise = runningCash + week.inflowPaise - week.outflowPaise;
    week.isBelowSafetyBuffer = week.closingCashPaise < safetyBufferPaise;

    if (week.closingCashPaise < lowestPointPaise) {
      lowestPointPaise = week.closingCashPaise;
      troughWeekIndex = w + 1;
    }

    if (week.isBelowSafetyBuffer && firstBufferBreachWeek === null) {
      firstBufferBreachWeek = w + 1;
    }

    runningCash = week.closingCashPaise;
  }

  const maxShortfallPaise = Math.max(0, safetyBufferPaise - lowestPointPaise);

  return {
    weeks,
    lowestPointPaise,
    troughWeekIndex,
    firstBufferBreachWeek,
    safetyBufferPaise,
    maxShortfallPaise,
    totalExpectedInPaise: weeks.reduce((sum, w) => sum + w.inflowPaise, 0),
    totalExpectedOutPaise: weeks.reduce((sum, w) => sum + w.outflowPaise, 0),
  };
}

