"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTransactionDeterministically = analyzeTransactionDeterministically;
const upiParser_1 = require("./upiParser");
function analyzeTransactionDeterministically(input) {
    const indicators = [];
    const warnings = [];
    let deterministicRisk = 10;
    const upiDetails = (0, upiParser_1.parseUpiString)(input.receiverUpi);
    // Check 1: Unsolicited Collect Request (Not User Initiated)
    if (!input.isUserInitiated) {
        indicators.push({
            name: 'Unsolicited Inbound Collect Request',
            severity: 'HIGH',
            explanation: 'This payment request was initiated by an external party pushing a collect request to your UPI ID, rather than you scanning or paying intentionally.',
            scoreContribution: 25
        });
        deterministicRisk += 25;
    }
    // Check 2: Suspicious Message Preceded Transaction
    if (input.suspiciousMessageReceived) {
        indicators.push({
            name: 'Preceded by Suspicious Communication',
            severity: 'CRITICAL',
            explanation: 'User reported receiving an urgent call, SMS, or WhatsApp message prior to this transaction request—a hallmark of social engineering scams.',
            scoreContribution: 30
        });
        deterministicRisk += 30;
    }
    // Check 3: First-time Recipient Novelty
    if (input.isNewRecipient) {
        indicators.push({
            name: 'First-Time Unverified Recipient',
            severity: 'MEDIUM',
            explanation: 'You have no historical transaction trust with this UPI address.',
            scoreContribution: 15
        });
        deterministicRisk += 15;
    }
    // Check 4: Suspicious UPI Handle Pattern
    if (upiDetails.isSuspiciousHandle) {
        indicators.push({
            name: 'High-Risk Recipient Handle Pattern',
            severity: 'HIGH',
            explanation: `Recipient UPI handle "${input.receiverUpi}" contains keyword patterns often utilized in brand or support impersonation.`,
            scoreContribution: 25
        });
        deterministicRisk += 25;
    }
    // Check 5: Description Red Flags
    const desc = (input.transactionDescription || '').toLowerCase();
    if (/(token|advance|security deposit|customs|processing fee|kyc fee|courier release|olx)/i.test(desc)) {
        indicators.push({
            name: 'High-Risk Transaction Pretext in Note',
            severity: 'HIGH',
            explanation: `Note indicates advance fee or token payment ("${input.transactionDescription}"). Advance payment fraud accounts for a significant portion of peer marketplace scams.`,
            scoreContribution: 22
        });
        deterministicRisk += 22;
    }
    // Check 6: Amount Anomaly
    if (input.amount >= 25000) {
        indicators.push({
            name: 'High-Value Transfer Threshold',
            severity: 'MEDIUM',
            explanation: `Transfer amount of ₹${input.amount.toLocaleString('en-IN')} exceeds standard micro-payment thresholds. Double check recipient identity.`,
            scoreContribution: 15
        });
        deterministicRisk += 15;
    }
    else if (input.amount <= 10 && !input.isUserInitiated) {
        // ₹1 or ₹10 test authorization bait
        indicators.push({
            name: 'Micro-Payment Bait Probe',
            severity: 'HIGH',
            explanation: 'Nominal amount (₹1–₹10) frequently used by scammers to test active accounts or observe UPI PIN entry during remote screen sharing.',
            scoreContribution: 20
        });
        deterministicRisk += 20;
    }
    deterministicRisk = Math.min(100, deterministicRisk);
    return {
        indicators,
        deterministicRisk,
        warnings
    };
}
