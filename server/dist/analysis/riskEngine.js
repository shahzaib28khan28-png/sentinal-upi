"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.synthesizeRiskAnalysis = synthesizeRiskAnalysis;
function synthesizeRiskAnalysis(params) {
    const { inputType, aiResult, deterministicIndicators, deterministicScore = 0, metadata = {}, isAiGenerated, aiProviderName } = params;
    // 1. Merge and deduplicate indicators
    const mergedIndicators = [];
    const seenIndicatorNames = new Set();
    // Prioritize critical/high deterministic indicators first
    for (const ind of deterministicIndicators) {
        const key = ind.name.toLowerCase().trim();
        if (!seenIndicatorNames.has(key)) {
            seenIndicatorNames.add(key);
            mergedIndicators.push(ind);
        }
    }
    // Merge AI indicators
    for (const ind of aiResult.indicators || []) {
        const key = ind.name.toLowerCase().trim();
        if (!seenIndicatorNames.has(key)) {
            seenIndicatorNames.add(key);
            mergedIndicators.push(ind);
        }
    }
    // 2. Determine Critical Override Rules
    const hasCriticalDeterministic = deterministicIndicators.some((i) => i.severity === 'CRITICAL');
    const hasHighDeterministic = deterministicIndicators.some((i) => i.severity === 'HIGH');
    // 3. Score Synthesis:
    // Weight AI semantic analysis + Deterministic rules
    let rawScore;
    if (inputType === 'context') {
        // For freeform natural language narratives, AI semantic understanding is paramount
        rawScore = Math.round(aiResult.riskScore * 0.85 + deterministicScore * 0.15);
        if (aiResult.riskScore >= 75) {
            rawScore = Math.max(rawScore, aiResult.riskScore);
        }
    }
    else {
        rawScore = Math.round(aiResult.riskScore * 0.55 + deterministicScore * 0.45);
    }
    if (hasCriticalDeterministic) {
        rawScore = Math.max(rawScore, 85);
    }
    else if (hasHighDeterministic) {
        rawScore = Math.max(rawScore, 70);
    }
    // Clamp 0-100
    const finalScore = Math.max(0, Math.min(100, rawScore));
    // 4. Map Classification
    let classification = 'SAFE';
    if (finalScore >= 70) {
        classification = 'HIGH_RISK';
    }
    else if (finalScore >= 30) {
        classification = 'SUSPICIOUS';
    }
    else {
        classification = 'SAFE';
    }
    // 5. Threat Type Resolution
    let threatType = aiResult.threatType;
    if (threatType === 'Unknown') {
        if (inputType === 'qr' && hasCriticalDeterministic) {
            threatType = 'Refund Scam';
        }
        else if (inputType === 'url' && finalScore >= 70) {
            threatType = 'Phishing';
        }
        else if (hasHighDeterministic) {
            threatType = 'UPI Collect Scam';
        }
    }
    // 6. Ensure itemized indicators calibrate nicely with the final score
    // If finalScore is high, ensure the top indicators reflect the score contribution
    if (mergedIndicators.length === 0) {
        if (finalScore >= 70) {
            mergedIndicators.push({
                name: 'Multi-Vector Behavioral Threat',
                severity: 'HIGH',
                explanation: 'The request matches patterns commonly utilized in targeted financial deception.',
                scoreContribution: finalScore
            });
        }
        else if (finalScore >= 30) {
            mergedIndicators.push({
                name: 'Elevated Risk Signals',
                severity: 'MEDIUM',
                explanation: 'Transaction contains non-standard parameters warranting verification.',
                scoreContribution: finalScore
            });
        }
        else {
            mergedIndicators.push({
                name: 'Normal Transaction Parameters',
                severity: 'LOW',
                explanation: 'No anomalous signals, coercive requests, or domain risks detected.',
                scoreContribution: finalScore
            });
        }
    }
    // Deduplicate and assemble recommendations
    const allRecs = new Set();
    if (classification === 'HIGH_RISK') {
        allRecs.add('🚫 Do not enter your UPI PIN under any circumstance.');
        allRecs.add('🚫 Do not click any links or download external applications.');
        allRecs.add('🚫 Do not transfer funds or accept inbound collect requests.');
        allRecs.add('✅ Verify directly through your bank’s official mobile app or visit your nearest branch.');
    }
    else if (classification === 'SUSPICIOUS') {
        allRecs.add('⚠️ Verify the recipient’s identity using an independent communication channel.');
        allRecs.add('⚠️ Double check the exact Payee Name and UPI ID before proceeding.');
        allRecs.add('⚠️ Avoid paying advance token money without physical receipt or escrow protection.');
    }
    else {
        allRecs.add('✅ Standard payment hygiene: Confirm payee name on payment confirmation screen.');
        allRecs.add('✅ Never share your UPI PIN or banking OTP with anyone.');
    }
    for (const r of aiResult.recommendations || []) {
        if (r && r.trim())
            allRecs.add(r.trim());
    }
    // Deduplicate social engineering techniques
    const socialTechniques = Array.from(new Set(aiResult.socialEngineeringTechniques || []));
    return {
        riskScore: finalScore,
        classification,
        threatType,
        confidence: Math.round((aiResult.confidence || 0.9) * 100) / 100,
        summary: aiResult.summary || 'Comprehensive risk analysis completed.',
        indicators: mergedIndicators,
        recommendations: Array.from(allRecs),
        socialEngineeringTechniques: socialTechniques,
        meta: {
            inputType,
            isAiGenerated,
            aiProvider: aiProviderName,
            evaluatedAt: new Date().toISOString(),
            analysisMode: isAiGenerated ? 'Hybrid AI + Deterministic' : 'Deterministic Heuristic (Demo)',
            ...metadata
        }
    };
}
