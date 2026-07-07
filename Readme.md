# AI-Powered CRM CSV Importer (GrowEasy Assignment)

A production-ready full-stack application that intelligently extracts and maps unstructured CRM lead data from any arbitrary CSV schema layout into standard GrowEasy CRM records using hybrid deterministic rules and Gemini LLM inference.

## 🚀 Key Engineering & Architecture Highlights

- **Decoupled Architecture:** Built using a modern frontend-backend separation with a responsive Next.js layout and a strictly typed Node.js/Express TypeScript backend ecosystem.
- **Client-Side Stream Parsing:** Utilizes zero-latency browser streaming via PapaParse for real-time visual grid generation without overloading server-side computing resources during initial file previewing.
- **Client-Controlled Multi-Batching Pipeline:** Intelligently chunks massive row matrices into sequential subsets of 20 items to eliminate token payload congestion, guard against upstream rate-limiting (`429`), and provide responsive UI progress feedback indicators.
- **Deterministic Validation Guardrail:** Runs an automated lowercase keyword script over unmapped headings to proactively filter out invalid entries that lack contact endpoints (neither phone nor email) before spending generative token budgets.

---

## 🛠️ Tech Stack & Dependencies

### Frontend
- **Framework:** Next.js (App Router, React Hooks)[cite: 2]
- **Styling:** Tailwind CSS (Semantic Descriptive Style Grouping)[cite: 2]
- **Icons & Utilities:** Lucide React, PapaParse[cite: 2]

### Backend
- **Runtime:** Node.js, Express, TypeScript, `tsx` (Watch Execution)[cite: 2]
- **AI Engine Layer:** `@google/generative-ai` (Gemini 2.5 Flash Inference)[cite: 2]
- **Utilities:** Cors, Dotenv[cite: 2]

---

## ⚙️ Local Configuration & Setup Instructions

### Prerequisites
Ensure you have **Node.js (v18+)** installed on your system.

### 1. Repository Installation
Navigate to your root project workspace folder:
```bash
cd groweasy-csv-importer