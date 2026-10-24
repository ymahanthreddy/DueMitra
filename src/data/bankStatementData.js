// Parsed raw bank statement rows for default loading in the Payments view

export const sampleBankStatementRaw = `Date,ReferenceNumber,Description,Debit,Credit,Balance
2026-10-21,UPI/629811234567,UPI/629811234567/Sahyadri Telecom/KVC-26-27-0031,,22892.00,482892.00
2026-10-21,NEFT/MAHB981726,NEFT/MAHB981726/Maratha Mobile/Part pay KVC-26-27-0019,,10000.00,492892.00
2026-10-22,RTGS/HDFC9012384,RTGS/HDFC9012384/Deccan Digital Plaza/KVC-26-27-0032 and 0033,,64310.00,557202.00
2026-10-22,NEFT/AXIS871239,NEFT/AXIS871239/Maratha Mobile/KVC-26-27-0026 net TDS 2 pct,,33756.00,590958.00
2026-10-23,UPI/629988112233,UPI/629988112233/Apex Mobile Hub/KVC-26-27-0028,,32000.00,622958.00
2026-10-23,IMPS/629011883344,IMPS/629011883344/UNKNOWN REMITTER/CR ACCESSORY ADVANCE,,18500.00,641458.00`;

export function parseBankStatementCsv(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parser supporting comma separation
    const cols = line.split(',').map(c => c.trim());
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] || '';
    });

    const creditRupees = parseFloat(row.Credit) || 0;
    const creditPaise = Math.round(creditRupees * 100);

    if (creditPaise > 0) {
      rows.push({
        id: `STMT-${i}`,
        date: row.Date,
        referenceNumber: row.ReferenceNumber,
        description: row.Description,
        creditRupees,
        creditPaise,
        balanceRupees: parseFloat(row.Balance) || 0,
      });
    }
  }

  return rows;
}

