// Indian GST utilities, state code mappings, and check digit validation

export const STATE_CODES = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};

export function getStateFromGstin(gstin) {
  if (!gstin || gstin.length < 2) return { code: '', state: '' };
  const code = gstin.trim().slice(0, 2);
  return { code, state: STATE_CODES[code] || '' };
}

const GST_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Calculates check digit for 14-character GSTIN prefix using the official Modulo 36 algorithm.
 */
export function calcGstinCheckDigit(gstin14) {
  if (!gstin14 || gstin14.length !== 14) return null;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const cp = GST_CHARS.indexOf(gstin14[i].toUpperCase());
    if (cp === -1) return null;
    const factor = (i % 2 === 0) ? 1 : 2;
    const prod = cp * factor;
    sum += Math.floor(prod / 36) + (prod % 36);
  }
  const rem = sum % 36;
  const checkIdx = (36 - rem) % 36;
  return GST_CHARS[checkIdx];
}

/**
 * Validates a 15-character GSTIN including regex format, valid state code, and check digit.
 */
export function validateGstin(gstin) {
  if (!gstin) {
    return { valid: false, error: 'GSTIN is required' };
  }
  const clean = gstin.trim().toUpperCase();
  if (clean.length !== 15) {
    return { valid: false, error: `GSTIN must be 15 characters (currently ${clean.length})` };
  }

  // Regex: 2 digits, 5 letters, 4 digits, 1 letter, 1 entity (1-9, A-Z), 'Z', 1 check character
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!regex.test(clean)) {
    return { valid: false, error: 'Invalid GSTIN structure (e.g., 27AABCK1234F1ZZ)' };
  }

  const stateCode = clean.slice(0, 2);
  const stateName = STATE_CODES[stateCode];
  if (!stateName) {
    return { valid: false, error: `Invalid state code: ${stateCode}` };
  }

  const expectedCheckDigit = calcGstinCheckDigit(clean.slice(0, 14));
  if (expectedCheckDigit !== clean[14]) {
    return { 
      valid: false, 
      error: `Invalid check digit. Expected '${expectedCheckDigit}', got '${clean[14]}'` 
    };
  }

  return { valid: true, stateCode, stateName, gstin: clean };
}

/**
 * Computes GST line-item taxes and totals (all amounts in whole paise)
 */
export function calculateLineGst(item, supplierStateCode = '27', placeOfSupplyCode = '27') {
  const qty = Number(item.quantity) || 0;
  const ratePaise = Number(item.ratePaise) || 0;
  const discountPaise = Number(item.discountPaise) || 0;
  const gstRate = Number(item.gstRate) || 0;

  // Taxable value = (qty * rate) - discount
  const grossPaise = qty * ratePaise;
  const taxablePaise = Math.max(0, grossPaise - discountPaise);

  const isIntraState = String(supplierStateCode) === String(placeOfSupplyCode);

  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;
  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;

  if (gstRate > 0) {
    if (isIntraState) {
      cgstRate = gstRate / 2;
      sgstRate = gstRate / 2;
      cgstPaise = Math.round((taxablePaise * cgstRate) / 100);
      sgstPaise = Math.round((taxablePaise * sgstRate) / 100);
    } else {
      igstRate = gstRate;
      igstPaise = Math.round((taxablePaise * igstRate) / 100);
    }
  }

  const lineTotalPaise = taxablePaise + cgstPaise + sgstPaise + igstPaise;

  return {
    ...item,
    quantity: qty,
    ratePaise,
    discountPaise,
    taxablePaise,
    gstRate,
    cgstRate,
    sgstRate,
    igstRate,
    cgstPaise,
    sgstPaise,
    igstPaise,
    lineTotalPaise,
  };
}

/**
 * Calculates complete invoice totals including grand total and round off (in paise)
 */
export function calculateInvoiceTotals(items, supplierStateCode = '27', placeOfSupplyCode = '27') {
  const calculatedItems = items.map(item => calculateLineGst(item, supplierStateCode, placeOfSupplyCode));

  const taxableTotalPaise = calculatedItems.reduce((acc, it) => acc + it.taxablePaise, 0);
  const cgstTotalPaise = calculatedItems.reduce((acc, it) => acc + it.cgstPaise, 0);
  const sgstTotalPaise = calculatedItems.reduce((acc, it) => acc + it.sgstPaise, 0);
  const igstTotalPaise = calculatedItems.reduce((acc, it) => acc + it.igstPaise, 0);
  const totalTaxPaise = cgstTotalPaise + sgstTotalPaise + igstTotalPaise;

  const exactGrandTotalPaise = taxableTotalPaise + totalTaxPaise;

  // Round off to the nearest rupee (nearest 100 paise)
  const roundedGrandTotalPaise = Math.round(exactGrandTotalPaise / 100) * 100;
  const roundOffPaise = roundedGrandTotalPaise - exactGrandTotalPaise;

  return {
    items: calculatedItems,
    taxableTotalPaise,
    cgstTotalPaise,
    sgstTotalPaise,
    igstTotalPaise,
    totalTaxPaise,
    exactGrandTotalPaise,
    roundOffPaise,
    grandTotalPaise: roundedGrandTotalPaise,
  };
}

