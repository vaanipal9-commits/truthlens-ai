# TruthLens AI

**Upload. Verify. Trust.**

TruthLens AI is an AI-powered PDF fact-checking platform. It extracts factual claims from any document, verifies each one against **live web evidence**, and produces a transparent Trust Score with real citations.

---

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons, pdf.js
- **Backend:** Node.js, Express, dotenv
- **AI:** [Groq](https://groq.com) — `llama-3.3-70b-versatile` for reasoning + `groq/compound` for live web search
- **Optional live search:** [Tavily](https://tavily.com) (auto-detected when `TAVILY_API_KEY` is set)

No Python. No TypeScript in the app code (only a thin `.tsx` shim required by the build tool). All source files under `server/` and `src/components|pages|services|utils|app` are plain JavaScript / JSX.

---

## Getting Started

### 1. Install Node.js
Requires **Node.js 18 or newer**.

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env`
```bash
cp .env.example .env
```
Open `.env` and paste your real Groq API key:
```
GROQ_API_KEY=gsk_your_real_key_here
```
Get a free key at <https://console.groq.com/keys>.

### 4. Run the app
```bash
npm run dev
```
This single command starts **both** the frontend and backend concurrently:

| Service   | URL                       |
|-----------|---------------------------|
| Frontend  | http://localhost:5173     |
| Backend   | http://localhost:5000     |

Open <http://localhost:5173> in your browser.

---

## How it Works

```
Upload PDF
   ↓
Extract text (client-side, pdf.js)
   ↓
Identify factual claims        (Groq: llama-3.3-70b-versatile)
   ↓
Generate search queries
   ↓
Search live web                (Groq Compound  OR  Tavily)
   ↓
Compare claim with evidence    (Groq: llama-3.3-70b-versatile)
   ↓
Verdict: VERIFIED / INACCURATE / FALSE / UNVERIFIED
   ↓
Trust Score + downloadable report (CSV / JSON)
```

Every source shown in the UI is a **real URL returned by the live search** — the app never fabricates citations.

---

## Security

- The Groq API key is **only** ever read on the server via `dotenv`.
- The key is **never** sent to the browser and is **never** prefixed with `VITE_`.
- All AI calls go through `/api/*` endpoints on the Express server.
- `.env` is git-ignored by default.

If the key is missing:
> "Groq API key is not configured. Add GROQ_API_KEY to your .env file."

If the key is invalid:
> "Groq API authentication failed. Please check your API key."

---

## Project Structure

```
truthlens-ai/
├── src/                       # React frontend (all .jsx / .js)
│   ├── app/AppRoot.jsx
│   ├── components/
│   ├── pages/
│   ├── services/              # PDF + backend client
│   ├── utils/
│   ├── index.css
│   └── main.tsx               # thin bootstrap
│
├── server/                    # Node/Express backend
│   ├── routes/
│   │   ├── health.js
│   │   ├── extractClaims.js
│   │   └── verifyClaim.js
│   ├── services/
│   │   ├── groq.js            # Groq API wrapper
│   │   └── webSearch.js       # Live web search (Groq compound / Tavily)
│   ├── utils/jsonParse.js
│   └── server.js
│
├── dev.js                     # Single-command launcher (frontend + backend)
├── .env.example
├── .gitignore
├── package.json               # scripts: dev, build, start
└── README.md
```

---

## Available Scripts

| Command             | What it does                                     |
|---------------------|--------------------------------------------------|
| `npm run dev`       | Start Vite frontend **and** Express backend      |
| `npm run dev:client`| Start only the Vite dev server                   |
| `npm run dev:server`| Start only the Express backend                   |
| `npm run build`     | Production build (Vite)                          |
| `npm start`         | Run backend in production mode                   |

---

## Troubleshooting

**"Backend not detected"** — Make sure port 5000 is free and you ran `npm run dev` from the project root.

**"Groq API key is not configured"** — Add `GROQ_API_KEY=...` to `.env` and restart.

**"Unable to extract readable text from this PDF"** — The PDF is likely scanned images. Upload a text-based PDF.

**Rate-limit errors from Groq** — Wait a moment and try again; free-tier limits reset quickly.

---

© TruthLens AI · Powered by Groq · Live web evidence
