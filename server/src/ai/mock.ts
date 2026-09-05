import { AIPromptInput, AIAnalysisResponse, IAIProvider } from './types';
import { ThreatType, Severity, Indicator, Classification } from '../types';

export class MockAIProvider implements IAIProvider {
  public readonly name = 'Prototype Semantic AI Engine (Offline Heuristic)';
  public readonly isConfigured = true;

  async analyze(input: AIPromptInput): Promise<AIAnalysisResponse> {
    // Simulate natural processing delay for realistic SOC analyst experience
    await new Promise((resolve) => setTimeout(resolve, 350));

    const text = (input.content + ' ' + JSON.stringify(input.additionalContext || {})).toLowerCase();
    const originalText = input.content;

    let riskScore = 10;
    let threatType: ThreatType = 'Unknown';
    let classification: Classification = 'SAFE';
    let confidence = 0.88;
    let summary = 'Standard communication or transaction without coercive social engineering patterns.';
    const indicators: Indicator[] = [];
    const recommendations: string[] = [];
    const socialEngineeringTechniques: string[] = [];

    // --- Social Engineering Vectors ---
    const hasAuthorityImpersonation =
      /(sbi|hdfc|icici|axis|punjab national|pnb|reserve bank|rbi|income tax|telecom|airtel|jio|amazon support|google pay support|paytm care|customs officer|police cyber cell|electricity board|bescom|mpeb)/i.test(text);

    const hasUrgencyOrCoercion =
      /(immediately|urgent|today itself|within 24 hours|account will be blocked|account suspended|deactivated|disconnected|power will be cut|legal action|arrest warrant|last warning)/i.test(text);

    const hasKycPretext =
      /(kyc|pan update|aadhaar link|identity verification|re-kyc|document upload|account closure notice)/i.test(text);

    const hasRefundPretext =
      /(refund|cashback|overpayment|money return|credit your account|claim refund|pending reimbursement)/i.test(text);

    const hasPrizeOrLottery =
      /(congratulations|won|lottery|kbc|lucky draw|cash prize|gift voucher|selected for prize)/i.test(text);

    const hasRemoteAccess =
      /(anydesk|teamviewer|rustdesk|quicksupport|screen share|install this app to fix)/i.test(text);

    const hasPinRequest =
      /(enter.*pin|upi pin to receive|enter upi pin for credit|share otp|forward this sms)/i.test(text);

    const hasJobOrTask =
      /(part time job|telegram task|earn 5000 per day|like youtube videos|crypto rating task|rating hotel)/i.test(text);

    const hasSuspiciousUrlPattern =
      /(http:\/\/|\.xyz|\.top|\.live|\.tk|\.cc|bit\.ly|tinyurl|is\.gd|cutt\.ly|firebaseapp\.com|pages\.dev)/i.test(text);

    const hasLegitimateBankReceiptPattern =
      /(debited by|credited to your|available balance|acct.*ending|inb\/|txn#|ref no|utr no)/i.test(text) &&
      !/(click here|verify at|call helpline 9[0-9]{9}|account will be blocked)/i.test(text);

    const hasLegitimateOrderPattern =
      /(delivered|arriving by|out for delivery|tracking id|order placed|swiggy|zomato|amazon order|flipkart)/i.test(text) &&
      !/(update kyc|click immediately|refund failed)/i.test(text);

    // Scenario 1: Remote Access Scam
    if (hasRemoteAccess) {
      threatType = 'Remote Access Scam';
      riskScore = 95;
      confidence = 0.97;
      socialEngineeringTechniques.push('Remote Screen Takeover', 'Pretexting', 'Fear of Service Termination');
      indicators.push({
        name: 'Remote Access Tool Coercion',
        severity: 'CRITICAL',
        explanation: 'Attacker requests installation of remote control software (AnyDesk/TeamViewer) to view UPI PIN and intercept authentication tokens.',
        scoreContribution: 40
      });
      indicators.push({
        name: 'Unsolicited Technical Pretext',
        severity: 'HIGH',
        explanation: 'Scammer invents technical support issue or telecom requirement to justify screen sharing.',
        scoreContribution: 30
      });
      if (hasUrgencyOrCoercion) {
        indicators.push({
          name: 'Coercive Urgency',
          severity: 'HIGH',
          explanation: 'Threatens immediate service deactivation unless remote session is established.',
          scoreContribution: 25
        });
      }
      summary = 'High-severity remote desktop takeover attempt. Criminals leverage screen sharing to monitor your UPI PIN entry and drain bank accounts.';
      recommendations.push(
        'Never install AnyDesk, TeamViewer, or QuickSupport on instructions from an incoming caller.',
        'If already installed, turn off Wi-Fi/Mobile Data immediately and uninstall the application.',
        'Contact your bank immediately to freeze your internet banking and UPI accounts.'
      );
    }
    // Scenario 2: Refund QR Scam / Collect Request Scam
    else if (hasRefundPretext && (input.type === 'qr' || hasPinRequest || /qr|scan/i.test(text) || input.additionalContext?.isCollectRequest)) {
      threatType = 'Refund Scam';
      riskScore = 94;
      confidence = 0.98;
      socialEngineeringTechniques.push('Reverse Payment Trick', 'Cognitive Distraction', 'Merchant Impersonation');
      indicators.push({
        name: 'Payment Direction Manipulation',
        severity: 'CRITICAL',
        explanation: 'Scammer misrepresents a payment instruction as a refund. Receiving money NEVER requires entering your UPI PIN or scanning a collect QR.',
        scoreContribution: 45
      });
      if (hasPinRequest || /pin/i.test(text)) {
        indicators.push({
          name: 'UPI PIN Harvesting Pretext',
          severity: 'CRITICAL',
          explanation: 'Instructs the victim to "enter PIN to accept credit", which is cryptographically impossible on UPI architecture.',
          scoreContribution: 30
        });
      }
      if (hasAuthorityImpersonation) {
        indicators.push({
          name: 'Merchant / Support Impersonation',
          severity: 'HIGH',
          explanation: 'Fraudster masquerades as customer care or logistics refund department.',
          scoreContribution: 19
        });
      }
      summary = 'Fraudulent collect request or reverse QR transaction. The scammer exploits the common misconception that scanning a QR code can receive money.';
      recommendations.push(
        'NEVER enter your UPI PIN to receive money or refunds. PIN entry always debits your account.',
        'Decline the UPI collect request in your payment app immediately.',
        'Only seek refunds via the official app where the purchase was made.'
      );
    }
    // Scenario 3: Fake KYC / Account Suspension Phishing
    else if (hasKycPretext && (hasUrgencyOrCoercion || hasAuthorityImpersonation || hasSuspiciousUrlPattern)) {
      threatType = 'Fake KYC';
      riskScore = 91;
      confidence = 0.96;
      socialEngineeringTechniques.push('Authority Impersonation', 'Account Suspension Threat', 'Credential Harvesting');
      indicators.push({
        name: 'Urgent Account Suspension Threat',
        severity: 'HIGH',
        explanation: 'Fabricated claim that bank account, SIM card, or wallet will be suspended today to provoke unthinking compliance.',
        scoreContribution: 30
      });
      if (hasAuthorityImpersonation) {
        indicators.push({
          name: 'Bank / Authority Impersonation',
          severity: 'HIGH',
          explanation: 'Unauthorized party claims to represent a recognized financial institution.',
          scoreContribution: 25
        });
      }
      if (hasSuspiciousUrlPattern || input.type === 'url') {
        indicators.push({
          name: 'Phishing Credential Interception Link',
          severity: 'CRITICAL',
          explanation: 'Directs user to an unverified external portal mimicking bank login to capture netbanking passwords or UPI credentials.',
          scoreContribution: 25
        });
      }
      indicators.push({
        name: 'Non-Standard KYC Protocol',
        severity: 'MEDIUM',
        explanation: 'RBI mandates that banks never perform KYC via third-party SMS links or personal messaging apps.',
        scoreContribution: 11
      });
      summary = 'Aggressive credential-harvesting scam utilizing fear of account closure to drive victims to malicious verification sites.';
      recommendations.push(
        'Do not click the link or provide Aadhaar, PAN, debit card numbers, or OTPs.',
        'Official KYC is conducted in-person at bank branches or via verified video KYC in official bank apps.',
        'Forward the suspicious message to the Indian Government Citizen Cyber Fraud reporting number 1930.'
      );
    }
    // Scenario 4: Lottery / Prize / Cashback Scam
    else if (hasPrizeOrLottery) {
      threatType = 'Lottery / Prize Scam';
      riskScore = 88;
      confidence = 0.95;
      socialEngineeringTechniques.push('Greed / Reward Lure', 'Advance Fee Fraud', 'Counterfeit Branding');
      indicators.push({
        name: 'Unsolicited Prize / Reward Bait',
        severity: 'HIGH',
        explanation: 'Promises large cash windfall or luxury prize for a contest the recipient never entered.',
        scoreContribution: 40
      });
      indicators.push({
        name: 'Processing Fee / Tax Pretext',
        severity: 'HIGH',
        explanation: 'Typically followed by demands to pay "TDS", "release fee", or "customs duty" via UPI before releasing funds.',
        scoreContribution: 30
      });
      if (hasAuthorityImpersonation) {
        indicators.push({
          name: 'High-Profile Brand Misuse',
          severity: 'MEDIUM',
          explanation: 'Fraudsters impersonate KBC, Tata, Reliance, or popular TV shows to establish fake credibility.',
          scoreContribution: 18
        });
      }
      summary = 'Classic advance-fee lottery scam. Victims are convinced they won a prize and are manipulated into transferring "taxes" or "claim fees".';
      recommendations.push(
        'Never send advance money to claim a prize or lottery.',
        'Legitimate lotteries deduct applicable tax at source before distributing winnings.',
        'Block and report the contact immediately.'
      );
    }
    // Scenario 5: Customer Support Impersonation
    else if (hasAuthorityImpersonation && /helpline|customer care|toll free|dial|call me|support team/i.test(text)) {
      threatType = 'Customer Support Scam';
      riskScore = 84;
      confidence = 0.92;
      socialEngineeringTechniques.push('Fake Support Channels', 'SEO Poisoning Lure', 'Pretexting');
      indicators.push({
        name: 'Fake Toll-Free / Mobile Support Representative',
        severity: 'HIGH',
        explanation: 'Uses personal mobile numbers (+91-9xxx) or unauthorized 1800 numbers posing as bank or merchant care.',
        scoreContribution: 35
      });
      indicators.push({
        name: 'Unsolicited Assistance Maneuver',
        severity: 'HIGH',
        explanation: 'Intervenes during perceived failed payments or order glitches to divert funds.',
        scoreContribution: 30
      });
      if (hasPinRequest || /pin|otp/i.test(text)) {
        indicators.push({
          name: 'Credential Solicitation',
          severity: 'HIGH',
          explanation: 'Customer care representatives never ask for PIN, OTP, or CVV under any circumstances.',
          scoreContribution: 19
        });
      }
      summary = 'Fraudulent customer care helpline operation designed to misdirect users into making payments or downloading remote control apps.';
      recommendations.push(
        'Never search for customer care numbers on Google Maps or social media—scammers plant fake numbers.',
        'Always obtain customer support contact details directly from inside your official mobile application.'
      );
    }
    // Scenario 6: Job / Task Scam
    else if (hasJobOrTask) {
      threatType = 'Job Scam';
      riskScore = 86;
      confidence = 0.93;
      socialEngineeringTechniques.push('Bait and Switch', 'Sunk Cost Trap', 'Micro-task Illusion');
      indicators.push({
        name: 'Unrealistic Compensation Promise',
        severity: 'HIGH',
        explanation: 'Offers ₹3,000–₹10,000/day for trivial tasks like rating hotels or subscribing to YouTube channels.',
        scoreContribution: 40
      });
      indicators.push({
        name: 'Prepaid Task Investment Trap',
        severity: 'HIGH',
        explanation: 'After paying small initial amounts to build trust, scammers demand high UPI deposits to "unlock" earnings.',
        scoreContribution: 35
      });
      summary = 'High-yield task investment scam orchestrated through messaging channels to trap victims in escalating deposit demands.';
      recommendations.push(
        'Legitimate companies never ask employees to pay money to receive work or salary.',
        'Do not join Telegram groups claiming automated investment returns.'
      );
    }
    // Scenario 7: Standalone Suspicious URL
    else if (input.type === 'url' || hasSuspiciousUrlPattern) {
      threatType = 'Phishing';
      riskScore = 78;
      confidence = 0.90;
      socialEngineeringTechniques.push('Typosquatting', 'Unverified TLD Exploitation');
      indicators.push({
        name: 'Suspicious Domain Infrastructure',
        severity: 'HIGH',
        explanation: 'Target URL exhibits characteristics of ephemeral phishing infrastructure (high-risk TLD or typosquatted brand).',
        scoreContribution: 45
      });
      indicators.push({
        name: 'External Redirection Risk',
        severity: 'MEDIUM',
        explanation: 'Link redirects outside verified secure payment gateways.',
        scoreContribution: 33
      });
      summary = 'Heuristic security flags indicate high probability of credential-harvesting phishing page.';
      recommendations.push(
        'Do not open the link or enter banking information.',
        'Inspect the root domain carefully before interacting with any payment portal.'
      );
    }
    // Scenario 8: Legitimate Transaction / Notification
    else if (hasLegitimateBankReceiptPattern || hasLegitimateOrderPattern) {
      threatType = 'Unknown';
      riskScore = 8;
      confidence = 0.95;
      summary = 'Verified legitimate transactional message. Structure conforms to standard banking or merchant notification protocols with no social engineering hooks.';
      indicators.push({
        name: 'Standard Transaction Syntax',
        severity: 'LOW',
        explanation: 'Message contains normal debit/credit confirmation, merchant reference, and balance indicators without urgent demands.',
        scoreContribution: 4
      });
      indicators.push({
        name: 'Absence of External Coercion',
        severity: 'LOW',
        explanation: 'No links, no requests to call unofficial numbers, no PIN demands.',
        scoreContribution: 4
      });
      recommendations.push(
        'Transaction appears legitimate. Verify against your official banking transaction passbook.'
      );
    }
    // Default / Ambiguous / Mild Suspicion
    else {
      if (hasUrgencyOrCoercion) {
        riskScore = 48;
        threatType = 'Payment Redirection';
        indicators.push({
          name: 'Urgent Tone Detected',
          severity: 'MEDIUM',
          explanation: 'The communication applies subtle pressure to conclude the transaction quickly.',
          scoreContribution: 25
        });
      } else {
        riskScore = 15;
        threatType = 'Unknown';
        indicators.push({
          name: 'Baseline Heuristic Scan',
          severity: 'LOW',
          explanation: 'No definitive scam patterns, malware links, or credential extortion observed.',
          scoreContribution: 10
        });
      }

      summary = riskScore >= 30
        ? 'Communication contains mild pressure or ambiguous transaction context. Proceed with heightened vigilance.'
        : 'No prominent indicators of fraudulent social engineering detected.';

      recommendations.push('Exercise standard payment hygiene. Verify recipient identity before paying.');
    }

    if (riskScore >= 70) {
      classification = 'HIGH_RISK';
    } else if (riskScore >= 30) {
      classification = 'SUSPICIOUS';
    } else {
      classification = 'SAFE';
    }

    return {
      riskScore,
      classification,
      threatType,
      confidence,
      summary,
      indicators,
      recommendations,
      socialEngineeringTechniques
    };
  }
}
