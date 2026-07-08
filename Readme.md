# AI-Powered CRM CSV Importer (GrowEasy Assignment)

A production-ready full-stack application that intelligently extracts and maps unstructured CRM lead data from any arbitrary CSV schema layout into standard GrowEasy CRM records using hybrid deterministic rules and Gemini LLM inference.

## 🔗 Live Application Deployment Links

- **Hosted Application UI (Vercel):** [https://groweasy-csv-importer-flame.vercel.app](https://groweasy-csv-importer-flame.vercel.app)
- **Production API Service Endpoint (Render):** [https://groweasy-csv-importer-p746.onrender.com](https://groweasy-csv-importer-p746.onrender.com)

---

## 🚀 Key Engineering & Architecture Highlights

- **Decoupled Architecture:** Built using a modern frontend-backend separation with a responsive Next.js layout and a strictly typed Node.js/Express TypeScript backend ecosystem.
- **Client-Side Stream Parsing:** Utilizes zero-latency browser streaming via PapaParse for real-time visual grid generation without overloading server-side computing resources during initial file previewing.
- **Client-Controlled Multi-Batching Pipeline:** Intelligently chunks massive row matrices into sequential subsets of 20 items to eliminate token payload congestion, guard against upstream rate-limiting (`429`), and provide responsive UI progress feedback indicators.
- **Deterministic Validation Guardrail:** Runs an automated lowercase keyword script over unmapped headings to proactively filter out invalid entries that lack contact endpoints (neither phone nor email) before spending generative token budgets.

---

## 🛠️ Tech Stack & Dependencies

### Frontend
- **Framework:** Next.js (App Router, React Hooks)
- **Styling:** Tailwind CSS (Semantic Descriptive Style Grouping)
- **Icons & Utilities:** Lucide React, PapaParse

### Backend
- **Runtime:** Node.js, Express, TypeScript, `tsx` (Watch Execution)
- **AI Engine Layer:** `@google/generative-ai` (Gemini Inference)
- **Utilities:** Cors, Dotenv

---

## ⚙️ Local Configuration & Setup Instructions

### Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your system.

### 1. Repository Installation
Navigate to your root project workspace folder:
```bash
git clone <your-repo-url>
cd groweasy-csv-importer
