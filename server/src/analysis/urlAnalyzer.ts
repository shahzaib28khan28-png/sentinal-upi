import { UrlSecurityDetails, Indicator } from '../types';

const KNOWN_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 'is.gd', 'cutt.ly', 'rb.gy', 't.co', 'ow.ly',
  'buff.ly', 'goo.gl', 'bl.ink', 'shorturl.at', 'rebrand.ly'
]);

const HIGH_ABUSE_TLDS = new Set([
  'xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'live', 'icu', 'buzz',
  'cfd', 'rest', 'pw', 'work', 'click', 'fit', 'monster', 'loan'
]);

const BRAND_PATTERNS: Record<string, { officialDomains: string[]; regex: RegExp }> = {
  SBI: {
    officialDomains: ['sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com', 'statebankofindia.com'],
    regex: /(^|[-._])(sbi|onlinesbi|statebank)($|[-._])/i
  },
  HDFC: {
    officialDomains: ['hdfcbank.com', 'hdfc.com'],
    regex: /(^|[-._])(hdfc|hdfcbank)($|[-._])/i
  },
  ICICI: {
    officialDomains: ['icicibank.com'],
    regex: /(^|[-._])(icici|icicibank)($|[-._])/i
  },
  Axis: {
    officialDomains: ['axisbank.com'],
    regex: /(^|[-._])(axis|axisbank)($|[-._])/i
  },
  Paytm: {
    officialDomains: ['paytm.com', 'paytmbank.com'],
    regex: /(^|[-._])(paytm)($|[-._])/i
  },
  PhonePe: {
    officialDomains: ['phonepe.com'],
    regex: /(^|[-._])(phonepe)($|[-._])/i
  },
  GooglePay: {
    officialDomains: ['google.com', 'pay.google.com'],
    regex: /(^|[-._])(gpay|googlepay)($|[-._])/i
  },
  Amazon: {
    officialDomains: ['amazon.in', 'amazon.com'],
    regex: /(^|[-._])(amazon)($|[-._])/i
  }
};

const SUSPICIOUS_URL_KEYWORDS = [
  'kyc', 'pan', 'aadhaar', 'verify', 'verification', 'update', 'blocked',
  'suspend', 'deactivate', 'refund', 'cashback', 'reward', 'otp', 'secure-login',
  'netbanking', 'banking-portal', 'auth', 'claim', 'bonus'
];

export function analyzeUrlDeterministically(rawUrl: string): {
  details: UrlSecurityDetails;
  indicators: Indicator[];
  riskScore: number;
} {
  let target = rawUrl.trim();
  if (!/^https?:\/\//i.test(target)) {
    target = 'http://' + target;
  }

  let urlObj: URL;
  try {
    urlObj = new URL(target);
  } catch {
    return {
      details: {
        url: rawUrl,
        protocol: 'unknown',
        isHttps: false,
        hostname: 'invalid',
        domain: 'invalid',
        subdomain: '',
        tld: '',
        isIpAddress: false,
        isShortener: false,
        isExcessiveSubdomains: false,
        suspiciousKeywordsFound: [],
        typosquattingSuspected: false,
        heuristicsTriggered: ['Malformed URL syntax'],
        prototypeNote: 'Prototype heuristic analysis — URL parsing failed'
      },
      indicators: [
        {
          name: 'Malformed URL',
          severity: 'HIGH',
          explanation: 'The provided text could not be parsed as a standard valid URL.',
          scoreContribution: 40
        }
      ],
      riskScore: 40
    };
  }

  const protocol = urlObj.protocol.replace(':', '').toLowerCase();
  const isHttps = protocol === 'https';
  const hostname = urlObj.hostname.toLowerCase();
  const pathname = urlObj.pathname.toLowerCase();
  const fullHref = urlObj.href.toLowerCase();

  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes('[');

  // Split hostname into components
  const hostParts = hostname.split('.');
  const tld = hostParts.length > 1 ? hostParts[hostParts.length - 1] : '';

  // Approximate root domain
  let domain = hostname;
  let subdomain = '';
  if (hostParts.length >= 2) {
    // Check for two-part TLDs like .co.in, .ac.in
    if (hostParts.length >= 3 && ['co.in', 'org.in', 'net.in', 'gov.in', 'ac.in'].includes(hostParts.slice(-2).join('.'))) {
      domain = hostParts.slice(-3).join('.');
      subdomain = hostParts.slice(0, -3).join('.');
    } else {
      domain = hostParts.slice(-2).join('.');
      subdomain = hostParts.slice(0, -2).join('.');
    }
  }

  const isShortener = KNOWN_SHORTENERS.has(domain) || KNOWN_SHORTENERS.has(hostname);
  const isExcessiveSubdomains = hostParts.length >= 4;

  const suspiciousKeywordsFound = SUSPICIOUS_URL_KEYWORDS.filter(
    (kw) => hostname.includes(kw) || pathname.includes(kw)
  );

  let impersonatedBrand: string | undefined;
  let typosquattingSuspected = false;

  for (const [brandName, pattern] of Object.entries(BRAND_PATTERNS)) {
    if (pattern.regex.test(hostname)) {
      const isOfficial = pattern.officialDomains.some(
        (od) => hostname === od || hostname.endsWith('.' + od)
      );
      if (!isOfficial) {
        impersonatedBrand = brandName;
        typosquattingSuspected = true;
        break;
      }
    }
  }

  const heuristicsTriggered: string[] = [];
  const indicators: Indicator[] = [];
  let riskScore = 0;

  // Rule 1: Protocol Security
  if (!isHttps) {
    heuristicsTriggered.push('Plain unencrypted HTTP protocol');
    indicators.push({
      name: 'Unencrypted HTTP Connection',
      severity: 'HIGH',
      explanation: 'The link uses insecure HTTP instead of HTTPS. Modern banking and financial portals strictly mandate encrypted HTTPS connections.',
      scoreContribution: 25
    });
    riskScore += 25;
  }

  // Rule 2: IP Address in Hostname
  if (isIpAddress) {
    heuristicsTriggered.push('IP address host destination');
    indicators.push({
      name: 'Direct IP Address Host',
      severity: 'CRITICAL',
      explanation: 'The URL targets a raw IP address instead of a registered domain. Legitimate financial institutions never distribute raw IP links to consumers.',
      scoreContribution: 40
    });
    riskScore += 40;
  }

  // Rule 3: Brand Impersonation & Typosquatting
  if (impersonatedBrand && typosquattingSuspected) {
    heuristicsTriggered.push(`Brand impersonation of ${impersonatedBrand}`);
    indicators.push({
      name: `Brand Impersonation (${impersonatedBrand})`,
      severity: 'CRITICAL',
      explanation: `The hostname incorporates "${impersonatedBrand}" or a close variant, but the root domain "${domain}" is not an authorized official portal.`,
      scoreContribution: 45
    });
    riskScore += 45;
  }

  // Rule 4: High-Abuse / Cheap TLD
  if (HIGH_ABUSE_TLDS.has(tld)) {
    heuristicsTriggered.push(`High-abuse top level domain (.${tld})`);
    indicators.push({
      name: `High-Risk TLD (.${tld})`,
      severity: 'HIGH',
      explanation: `The domain uses the .${tld} top-level domain, commonly utilized by cybercriminals for throwaway phishing sites due to low verification barrier.`,
      scoreContribution: 20
    });
    riskScore += 20;
  }

  // Rule 5: URL Shorteners
  if (isShortener) {
    heuristicsTriggered.push('URL Shortener masking real destination');
    indicators.push({
      name: 'Obfuscated Short URL',
      severity: 'MEDIUM',
      explanation: 'A URL shortening service is used to disguise the true landing page destination and bypass preliminary automated filters.',
      scoreContribution: 18
    });
    riskScore += 18;
  }

  // Rule 6: Excessive Subdomains / Subdomain Stacking
  if (isExcessiveSubdomains) {
    heuristicsTriggered.push('Excessive subdomain depth');
    indicators.push({
      name: 'Subdomain Stacking Deception',
      severity: 'MEDIUM',
      explanation: 'The URL contains multiple nested subdomains designed to display legitimate names early in mobile address bars while hosting on malicious roots.',
      scoreContribution: 15
    });
    riskScore += 15;
  }

  // Rule 7: Suspicious Financial Keywords
  if (suspiciousKeywordsFound.length > 0) {
    heuristicsTriggered.push(`Keywords detected: ${suspiciousKeywordsFound.join(', ')}`);
    const contrib = Math.min(20, suspiciousKeywordsFound.length * 7);
    indicators.push({
      name: 'Financial Action / Urgency Path Keywords',
      severity: suspiciousKeywordsFound.length >= 2 ? 'HIGH' : 'MEDIUM',
      explanation: `URL path or hostname contains sensitive security keywords (${suspiciousKeywordsFound.slice(0, 3).join(', ')}) typical of credential harvesting traps.`,
      scoreContribution: contrib
    });
    riskScore += contrib;
  }

  // Base score minimum if clean
  if (indicators.length === 0) {
    riskScore = 5;
    indicators.push({
      name: 'Heuristic Clean Scan',
      severity: 'LOW',
      explanation: 'HTTPS is active, domain syntax is standard, and no brand typosquatting or high-abuse TLD markers were identified.',
      scoreContribution: 5
    });
  }

  riskScore = Math.min(100, riskScore);

  const details: UrlSecurityDetails = {
    url: rawUrl,
    protocol,
    isHttps,
    hostname,
    domain,
    subdomain,
    tld,
    isIpAddress,
    isShortener,
    isExcessiveSubdomains,
    suspiciousKeywordsFound,
    impersonatedBrand,
    typosquattingSuspected,
    heuristicsTriggered,
    prototypeNote: 'Prototype heuristic analysis (local algorithmic heuristics without third-party threat intel subscription)'
  };

  return { details, indicators, riskScore };
}
