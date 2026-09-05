import { ParsedUpiDetails } from '../types';

const KNOWN_LEGIT_PSP_HANDLES = new Set([
  'okaxis', 'okhdfcbank', 'okicici', 'oksbi', 'paytm', 'ybl', 'ibl', 'axl',
  'barodampay', 'upi', 'apl', 'rapt', 'fbl', 'idfcbank', 'kmbl', 'aubank',
  'indus', 'federal', 'cnrb', 'postbank', 'freecharge', 'slice', 'jupiteraxis',
  'fi'
]);

const SUSPICIOUS_HANDLE_SUBSTRINGS = [
  'support', 'customercare', 'helpline', 'refund', 'cashback', 'reward',
  'kyc', 'verification', 'tollfree', 'desk', 'officer', 'department',
  'manager', 'lottery', 'winner', 'airtel5g', 'jio5g', 'bescom', 'mpeb'
];

export function parseUpiString(input: string): ParsedUpiDetails {
  const trimmed = input.trim();
  const warnings: string[] = [];

  let pa: string | undefined;
  let pn: string | undefined;
  let am: string | undefined;
  let cu: string = 'INR';
  let tn: string | undefined;
  let tr: string | undefined;
  let mc: string | undefined;
  let mode: string | undefined;
  let sign: string | undefined;

  let isCollectRequest = false;
  let isSuspiciousHandle = false;

  // Check if it's a URI format: upi://pay?... or upi://collect?...
  if (trimmed.startsWith('upi://')) {
    try {
      const urlObj = new URL(trimmed);
      const params = urlObj.searchParams;

      pa = params.get('pa') || undefined;
      pn = params.get('pn') ? decodeURIComponent(params.get('pn')!) : undefined;
      am = params.get('am') || undefined;
      cu = params.get('cu') || 'INR';
      tn = params.get('tn') ? decodeURIComponent(params.get('tn')!) : undefined;
      tr = params.get('tr') || undefined;
      mc = params.get('mc') || undefined;
      mode = params.get('mode') || undefined;
      sign = params.get('sign') || undefined;

      if (urlObj.pathname.includes('collect') || trimmed.toLowerCase().includes('collect')) {
        isCollectRequest = true;
      }
    } catch {
      // Fallback manual query string parsing
      const queryPart = trimmed.split('?')[1] || '';
      const pairs = queryPart.split('&');
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        if (!k) continue;
        const decoded = v ? decodeURIComponent(v.replace(/\+/g, ' ')) : '';
        if (k === 'pa') pa = decoded;
        else if (k === 'pn') pn = decoded;
        else if (k === 'am') am = decoded;
        else if (k === 'cu') cu = decoded;
        else if (k === 'tn') tn = decoded;
        else if (k === 'tr') tr = decoded;
        else if (k === 'mc') mc = decoded;
      }
    }
  } else if (trimmed.includes('@')) {
    // Direct VPA handle string
    pa = trimmed;
  }

  // Analyze Payee VPA / Handle
  if (pa) {
    const parts = pa.split('@');
    if (parts.length === 2) {
      const username = parts[0].toLowerCase();
      const psp = parts[1].toLowerCase();

      // Check if handle username attempts impersonation
      for (const sub of SUSPICIOUS_HANDLE_SUBSTRINGS) {
        if (username.includes(sub)) {
          isSuspiciousHandle = true;
          warnings.push(`UPI handle contains high-risk prefix "${sub}" which scammers use to mimic official entities.`);
          break;
        }
      }

      // Check for pseudo-bank handles
      if (/^(sbi|hdfc|icici|axis|rbi|airtel|amazon)[-_.]/i.test(username) && !mc) {
        isSuspiciousHandle = true;
        warnings.push(`P2P VPA "${pa}" mimics an official institution name without verified merchant credentials.`);
      }
    } else {
      warnings.push(`Invalid UPI address format: "${pa}".`);
    }
  }

  // Analyze Note / Description
  if (tn) {
    const lowerTn = tn.toLowerCase();
    if (lowerTn.includes('refund') || lowerTn.includes('cashback') || lowerTn.includes('credit')) {
      warnings.push(`Transaction note contains claims of receiving money ("${tn}"). Scanning a QR can ONLY send money from your account.`);
    }
    if (lowerTn.includes('pin') || lowerTn.includes('enter pin')) {
      warnings.push('CRITICAL: Transaction note explicitly instructs you to enter your PIN. Never enter PIN to receive funds.');
    }
  }

  return {
    raw: trimmed,
    pa,
    pn,
    am,
    cu,
    tn,
    tr,
    mc,
    mode,
    sign,
    isCollectRequest,
    isSuspiciousHandle,
    warnings
  };
}
