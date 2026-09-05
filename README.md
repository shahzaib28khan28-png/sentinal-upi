# 🛡️ UPI Sentinel
> **"Detect UPI Scams Before You Pay."**

[![Problem Statement](https://img.shields.io/badge/Hackathon-Problem%20Statement%20PS--03-blue.svg)](#problem-statement)
[![Architecture](https://img.shields.io/badge/Architecture-Hybrid%20AI%20%2B%20Deterministic%20Rules-emerald.svg)](#architecture)
[![Theme Support](https://img.shields.io/badge/Theme-System%20%7C%20Light%20%7C%20Dark-purple.svg)](#theme-system)
[![Offline Ready](https://img.shields.io/badge/Demo%20Mode-Zero--Config%20Offline%20Ready-amber.svg)](#interactive-demo-mode)

**UPI Sentinel** is a full-stack cybersecurity threat detection and risk intelligence platform designed to intercept fraudulent transactions across India's Unified Payments Interface (UPI) before payment execution.

---

## 📑 Table of Contents
1. [Problem Statement (PS-03)](#problem-statement-ps-03)
2. [Core Detection Vectors](#core-detection-vectors)
3. [Hybrid Detection Architecture](#hybrid-detection-architecture)
4. [Technology Stack](#technology-stack)
5. [Quick Start & Setup](#quick-start--setup)
6. [AI Provider Configuration](#ai-provider-configuration)
7. [Theme System (Light, Dark, System)](#theme-system)
8. [Interactive Demo Scenarios](#interactive-demo-scenarios)
9. [API Reference](#api-reference)
10. [Realism & Security Disclaimers](#realism--security-disclaimers)

---

## 🎯 Problem Statement (PS-03)
**UPI Scam Detection & Risk Analysis System**

### The Problem
Over 14 billion monthly UPI transactions make India the global leader in digital payments. However, consumers are increasingly victimized by:
- **Fake KYC & Account Suspension SMS/WhatsApp threats**
- **Reverse Collect QR Scams** (where victims scan a QR or enter their PIN thinking they are receiving a refund)
- **Authority Impersonation** (fake bank helplines, electricity board disconnections, telecom SIM blockages)
- **Peer Marketplace Advance Token Frauds** (OLX/Quikr prepayment traps)
- **Remote Screen Takeover** (AnyDesk/TeamViewer used to observe UPI PINs)

### The Challenge
Develop an explainable system that analyzes suspicious messages, URLs, QR codes, or transaction descriptions and classifies them as:
- 🟢 **SAFE (0–29)**
- 🟡 **SUSPICIOUS (30–69)**
- 🔴 **HIGH RISK (70–100)**
with actionable evidence and defensive guidance.

---

## 🛡️ Core Detection Vectors

| Vector | Capabilities |
| :--- | :--- |
| 💬 **Message Analysis** | Evaluates SMS, WhatsApp, and email messages for artificial urgency, penalty threats, authority impersonation, and embedded phishing links. |
| 🌐 **URL Scanner** | Algorithmic heuristics checking HTTPS/HTTP encryption, raw IP hosting, brand typosquatting (SBI, HDFC, ICICI, Amazon), high-abuse TLDs (`.xyz`, `.top`, `.tk`), and URL obfuscation. |
| 📷 **QR Code Inspector** | Upload image, live browser camera scanning, or raw UPI string paste. Decodes parameters (`pa`, `pn`, `am`, `tn`, `tr`) and flags reverse collect traps. |
| 💳 **Transaction Risk** | Evaluates transfer amount anomalies, recipient novelty, merchant categorization, and inbound collect pushes. |
| 🧠 **AI Context Analysis** | Accepts natural language incident narratives (e.g., fake Amazon refund calls) and analyzes multi-stage social engineering strategies. |

---

## 🏗️ Hybrid Detection Architecture

UPI Sentinel does **not** rely solely on keyword matching or a standalone LLM:

```
               [ USER INPUT ]
(SMS / WhatsApp / Link / QR / Transaction / Narrative)
                     │
                     ▼
        [ INPUT PREPROCESSOR & SANITIZER ]
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
[ AI SEMANTIC ANALYSIS ]    [ DETERMINISTIC CYBER RULES ]
 • Psychological intent      • URL typosquatting & TLD checks
 • Urgency & coercion        • UPI protocol URI parser
 • Authority impersonation   • Collect scam detection
 • Incongruous promises      • Transaction anomaly scoring
       │                           │
       └─────────────┬─────────────┘
                     ▼
        [ HYBRID RISK SYNTHESIS ENGINE ]
        (0–100 Calibrated Risk Score)
                     │
                     ▼
      [ EXPLAINABLE CYBERSECURITY RESULT ]
 • Risk Score (0-100) + Classification Badge
 • Factor Breakdown (+25, +20, etc.)
 • Actionable Defense Checklist (🚫 & ✅)
 • Decoded UPI / URL Parameter Tables
```

---

## 💻 Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS with semantic CSS custom properties
- **Icons:** Lucide React
- **Visualizations:** Recharts (Donut Risk Distribution, Bar Threat Breakdown)
- **Computer Vision:** `jsQR` (Image & live webcam QR decoding via HTML5 Canvas)

### Backend
- **Runtime:** Node.js + Express + TypeScript
- **Database:** SQLite (`better-sqlite3`) with schema migrations and seed records
- **AI SDK:** `@google/genai` (Official Google GenAI SDK for Gemini 2.5 Flash)
- **Validation:** Zod + input sanitizers + SSRF protection

---

## 🚀 Quick Start & Setup

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm 9+

### 1. Launch Both Client & Server Concurrently
From the project root:
```bash
npm run dev
```
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

### 2. Run Independently
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

---

## 🤖 AI Provider Configuration

UPI Sentinel features an abstract `AIProvider` layer supporting:
1. **Google Gemini** (`gemini-2.5-flash` via `@google/genai`)
2. **OpenAI** (`gpt-4o-mini`)
3. **Local Semantic AI Heuristic (Offline Demo Engine)**

To connect live Gemini:
1. Copy `.env.example` to `server/.env`:
   ```bash
   cp .env.example server/.env
   ```
2. Set your free Google AI Studio API key:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   AI_MODEL=gemini-2.5-flash
   ```
3. Restart the server. The UI status badge will automatically update to **Live AI**.

*If no key is configured, the system operates seamlessly in offline heuristic Demo mode with complete feature parity.*

---

## 🎨 Theme System

UPI Sentinel includes a professional, accessible Theme Engine:
- **☀ Light Mode:** Crisp enterprise security interface with high-contrast text and subtle borders.
- **🌙 Dark Mode:** Cybernetic SOC aesthetic with deep navy background and elevated glassy surfaces.
- **🖥 System Mode (Default):** Automatically tracks the operating system's `prefers-color-scheme` with live event listeners.
- **Zero Theme Flash:** Head inline script ensures correct theme renders prior to DOM paint.
- **Persistence:** Selected theme persists across sessions in `localStorage`.

---

## 🧪 Interactive Demo Mode

The `/demo` tab provides 8 instant, one-click evaluation test cases:
1. **Fake KYC SMS:** SBI account blocked threat driving users to `.xyz` credential phishing.
2. **Refund Collect QR Trap:** Impersonated Amazon refund collect request that debits user ₹3,499.
3. **Bank Impersonation:** ICICI credit card frozen alert asking user to call a private mobile.
4. **Lottery / Prize Scam:** KBC WhatsApp lucky draw demanding advance tax deposits.
5. **Customer Support Scam:** Search engine poisoned Google Pay helpline demanding AnyDesk install.
6. **Suspicious Netbanking URL:** Insecure HTTP domain with `.top` TLD mimicking HDFC Bank.
7. **Legitimate Transaction:** Supermarket food purchase via verified merchant UPI handle.
8. **Legitimate Bank Notification:** Official HDFC ATM debit alert with balance summary.

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analyze/message` | Analyzes SMS, WhatsApp text, or email body. |
| `POST` | `/api/analyze/url` | Inspects protocol, domain, TLD, and typosquatting heuristics. |
| `POST` | `/api/analyze/qr` | Decodes UPI QR payload and detects reverse collect traps. |
| `POST` | `/api/analyze/transaction` | Evaluates amount anomaly, recipient novelty, and collect pushes. |
| `POST` | `/api/analyze/context` | Evaluates natural language incident descriptions. |
| `GET` | `/api/history` | Retrieves stored analysis records with search and filter parameters. |
| `DELETE` | `/api/history/:id` | Deletes a specific audit record. |
| `DELETE` | `/api/history` | Wipes analysis history. |
| `GET` | `/api/stats` | Returns aggregated metrics, threat counts, and distribution data. |
| `GET` | `/api/health` | Returns engine status, active AI provider, and security notices. |

---

## ⚖️ Realism & Security Disclaimers

> [!IMPORTANT]
> **Advisory Prototype:** UPI Sentinel is a hackathon demonstration prototype. Risk assessments are advisory heuristics generated by algorithmic pattern analysis and AI evaluation, and must not be treated as definitive legal proof of fraud.

> [!NOTE]
> **Zero False Database Claims:** UPI Sentinel does NOT claim to query private NPCI internal switches, bank databases, police registries, or live bank balance APIs. All URL scans are performed via algorithmic structure inspection and clearly designated as *Prototype Heuristic Analysis*.

> [!CAUTION]
> **Golden Rule of UPI:** Scanning a QR code does NOT receive money. NEVER enter your UPI PIN to receive money or refunds.
