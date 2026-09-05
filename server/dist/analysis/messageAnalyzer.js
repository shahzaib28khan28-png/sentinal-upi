"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeMessageDeterministically = analyzeMessageDeterministically;
const urlAnalyzer_1 = require("./urlAnalyzer");
const upiParser_1 = require("./upiParser");
function analyzeMessageDeterministically(input) {
    const text = input.text || '';
    const indicators = [];
    const extractedUrls = [];
    const extractedUpis = [];
    let deterministicRisk = 10;
    // 1. Extract URLs
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:xyz|top|tk|live|icu|buzz|cfd|online|site|store|app|link|dev|co\.in|com|in)\b[^\s]*)/gi;
    const matches = text.match(urlRegex) || [];
    for (const rawMatch of matches) {
        const cleanUrl = rawMatch.replace(/[.,;!?"')]+$/, '');
        const urlAnalysis = (0, urlAnalyzer_1.analyzeUrlDeterministically)(cleanUrl);
        extractedUrls.push(urlAnalysis.details);
        if (urlAnalysis.riskScore >= 40) {
            indicators.push({
                name: `Embedded Malicious / Unverified URL (${urlAnalysis.details.domain})`,
                severity: urlAnalysis.riskScore >= 70 ? 'CRITICAL' : 'HIGH',
                explanation: `Message embeds a suspicious link targeting "${urlAnalysis.details.domain}". ${urlAnalysis.indicators.map((i) => i.explanation).slice(0, 1).join(' ')}`,
                scoreContribution: Math.min(35, urlAnalysis.riskScore)
            });
            deterministicRisk += Math.min(35, urlAnalysis.riskScore);
        }
    }
    // 2. Extract UPI VPAs
    const upiRegex = /([a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64})/gi;
    const upiMatches = text.match(upiRegex) || [];
    for (const rawUpi of upiMatches) {
        const parsed = (0, upiParser_1.parseUpiString)(rawUpi);
        extractedUpis.push(parsed);
        if (parsed.isSuspiciousHandle) {
            indicators.push({
                name: `Suspicious In-Text UPI Handle (${parsed.pa})`,
                severity: 'HIGH',
                explanation: `Message provides a payment VPA containing high-risk keywords used for impersonation.`,
                scoreContribution: 25
            });
            deterministicRisk += 25;
        }
    }
    // 3. Authority Impersonation Cues
    if (/(sbi|hdfc|icici|axis|punjab national|reserve bank|rbi|income tax|airtel|jio|bescom|mpeb)/i.test(text)) {
        if (/(kyc|pan|block|suspend|deactivate|disconnected|arrest|warrant)/i.test(text)) {
            indicators.push({
                name: 'Coercive Authority Claim with Penalty Threat',
                severity: 'HIGH',
                explanation: 'Message combines financial or utility authority claims with explicit threats of account blocking or service cut-off.',
                scoreContribution: 25
            });
            deterministicRisk += 25;
        }
    }
    // 4. Time Pressure / Urgency
    if (/(within 24 hrs|immediately|today itself|by tonight|before 9:30 pm|urgent action required|last reminder)/i.test(text)) {
        indicators.push({
            name: 'Artificial Time Pressure',
            severity: 'MEDIUM',
            explanation: 'Uses urgent deadlines to induce panic and prevent the victim from cross-verifying with genuine institutions.',
            scoreContribution: 18
        });
        deterministicRisk += 18;
    }
    // 5. Credential / Secret Solicitation
    if (/(send otp|share otp|enter upi pin|share pin|cvv|forward this sms|download apk)/i.test(text)) {
        indicators.push({
            name: 'Authentication Credential Solicitation',
            severity: 'CRITICAL',
            explanation: 'Message asks you to reveal OTPs, UPI PINs, or install unverified APK applications.',
            scoreContribution: 35
        });
        deterministicRisk += 35;
    }
    deterministicRisk = Math.min(100, deterministicRisk);
    return {
        indicators,
        extractedUrls,
        extractedUpis,
        deterministicRisk
    };
}
