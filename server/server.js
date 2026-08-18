// TruthLens AI — Node/Express backend
// Loads GROQ_API_KEY from .env, exposes /api endpoints for claim extraction
// and live web verification. Never exposes secrets to the browser.

import "dotenv/config";
import express from "express";
import cors from "cors";
import { extractClaimsRoute } from "./routes/extractClaims.js";
import { verifyClaimRoute } from "./routes/verifyClaim.js";
import { healthRoute } from "./routes/health.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Root helper
app.get("/", (_req, res) => {
  res.json({
    name: "TruthLens AI Backend",
    status: "running",
    endpoints: ["/api/health", "/api/extract-claims", "/api/verify-claim"],
  });
});

app.get("/api/health", healthRoute);
app.post("/api/extract-claims", extractClaimsRoute);
app.post("/api/verify-claim", verifyClaimRoute);

// Global error handler — never leak stack traces
app.use((err, _req, res, _next) => {
  console.error("[TruthLens] Unhandled error:", err);
  res.status(500).json({
    error: "An unexpected server error occurred. Please try again.",
  });
});

app.listen(PORT, () => {
  const hasGroq = !!process.env.GROQ_API_KEY;
  const hasTavily = !!process.env.TAVILY_API_KEY;
  console.log("\n┌─────────────────────────────────────────────┐");
  console.log("│  🔍  TruthLens AI backend                    │");
  console.log(`│  Listening on http://localhost:${PORT}         │`);
  console.log(`│  GROQ_API_KEY:   ${hasGroq ? "✓ loaded " : "✗ missing"}                  │`);
  console.log(`│  TAVILY_API_KEY: ${hasTavily ? "✓ loaded " : "✗ missing"}                  │`);
  console.log("└─────────────────────────────────────────────┘\n");
  if (!hasGroq) {
    console.warn(
      "⚠  GROQ_API_KEY not configured. Add it to your .env file to enable claim extraction and verification."
    );
  }
  if (!hasTavily) {
    console.warn(
      "⚠  TAVILY_API_KEY not configured. Live web search will use Groq's built-in compound web search. If you prefer Tavily, add TAVILY_API_KEY to .env."
    );
  }
});
