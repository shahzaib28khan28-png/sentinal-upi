"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeQrDeterministically = analyzeQrDeterministically;
const upiParser_1 = require("./upiParser");
function analyzeQrDeterministically(qrData, userContext) {
    const upiDetails = (0, upiParser_1.parseUpiString)(qrData);
    const indicators = [];
    const warnings = [...upiDetails.warnings];
    let deterministicRisk = 10;
    const mandatorySafetyNotice = 'CRITICAL UPI SAFETY RULE: Scanning a QR code does not receive money automatically. NEVER enter your UPI PIN to receive money or refunds. UPI PIN is exclusively used for sending money from your account.';
    // Check 1: UPI Collect Scam / Reverse Payment Trap
    const contextLower = (userContext || '').toLowerCase();
    const noteLower = (upiDetails.tn || '').toLowerCase();
    const payeeLower = (upiDetails.pn || '').toLowerCase();
    const isRefundClaim = contextLower.includes('refund') ||
        contextLower.includes('cashback') ||
        contextLower.includes('receive') ||
        noteLower.includes('refund') ||
        noteLower.includes('cashback') ||
        noteLower.includes('receive');
    if (isRefundClaim) {
        indicators.push({
            name: 'Reverse Payment Fraud Trap (Refund/Collect Scam)',
            severity: 'CRITICAL',
            explanation: 'You are attempting to receive a refund, but this QR code will DEBIT money from your bank. In the UPI architecture, you NEVER scan a QR or enter your PIN to receive funds.',
            scoreContribution: 45
        });
        deterministicRisk += 45;
    }
    // Check 2: Note asking for PIN entry
    if (noteLower.includes('pin') || noteLower.includes('enter pin')) {
        indicators.push({
            name: 'PIN Solicitation in Note',
            severity: 'CRITICAL',
            explanation: 'Transaction note explicitly instructs PIN entry under the false pretext of receiving credit.',
            scoreContribution: 35
        });
        deterministicRisk += 35;
    }
    // Check 3: Suspicious VPA Handle
    if (upiDetails.isSuspiciousHandle) {
        indicators.push({
            name: 'Impersonated / High-Risk UPI Handle',
            severity: 'HIGH',
            explanation: `The Payee VPA "${upiDetails.pa}" uses keywords or fake support prefixes commonly used in impersonation scams.`,
            scoreContribution: 25
        });
        deterministicRisk += 25;
    }
    // Check 4: Merchant vs Personal VPA Mismatch
    if (payeeLower.includes('amazon') || payeeLower.includes('flipkart') || payeeLower.includes('support') || payeeLower.includes('desk') || payeeLower.includes('sbi')) {
        if (!upiDetails.mc) {
            indicators.push({
                name: 'Corporate Pretext on Personal UPI ID',
                severity: 'HIGH',
                explanation: `Payee name "${upiDetails.pn}" claims corporate or merchant identity, but the recipient address is an unverified personal P2P handle with no Merchant Category Code (MCC).`,
                scoreContribution: 25
            });
            deterministicRisk += 25;
        }
    }
    // Check 5: Non-standard UPI payload
    if (!upiDetails.pa) {
        indicators.push({
            name: 'Non-UPI / Unknown QR Payload',
            severity: 'MEDIUM',
            explanation: 'The QR code does not contain a standard UPI payment protocol string.',
            scoreContribution: 20
        });
        deterministicRisk += 20;
    }
    // Check 6: Pre-set Amount Anomaly
    if (upiDetails.am) {
        const amountNum = parseFloat(upiDetails.am);
        if (!isNaN(amountNum) && amountNum > 10000) {
            indicators.push({
                name: 'High Pre-Filled Transaction Amount',
                severity: 'MEDIUM',
                explanation: `QR code has a pre-locked payment amount of ₹${amountNum.toLocaleString('en-IN')}. Verify payee before approving.`,
                scoreContribution: 15
            });
            deterministicRisk += 15;
        }
    }
    deterministicRisk = Math.min(100, deterministicRisk);
    return {
        upiDetails,
        indicators,
        deterministicRisk,
        warnings,
        mandatorySafetyNotice
    };
}
