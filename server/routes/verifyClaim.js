import { groqChat, extractContent, GroqError, DEFAULT_MODEL } from "../services/groq.js";
import { searchWeb } from "../services/webSearch.js";
import { safeJsonParse } from "../utils/jsonParse.js";

const VERDICT_PROMPT = `You are TruthLens, a rigorous fact-checking judge.

You will receive:
1. An extracted factual CLAIM from a document.
2. LIVE WEB EVIDENCE that was just retrieved from real sources.

Your task: decide the verdict based strictly on the evidence.

VERDICTS:
- VERIFIED: Credible evidence substantially supports the claim as stated.
- INACCURATE: The claim is partially wrong, misleading, numerically off, or outdated (a more recent verified figure exists in the evidence).
- FALSE: Credible evidence directly contradicts the claim, or the claim appears fabricated.
- UNVERIFIED: The retrieved evidence is insufficient or unreliable to make a determination.

RULES:
- Base your judgment ONLY on the provided evidence. Do NOT rely on your training data.
- If the evidence shows a more recent value than the claim (e.g. claim says 10M users, evidence says 17M users), the verdict MUST be INACCURATE and you MUST populate actualInformation with the latest verified value.
- Do NOT invent sources. Only reference sources present in the evidence.
- Confidence (0-100) must reflect evidence quality AND agreement across sources.
- If evidence is thin/missing, verdict is UNVERIFIED with low confidence, and explain why.

Return ONLY valid JSON matching exactly:
{
  "verdict": "VERIFIED" | "INACCURATE" | "FALSE" | "UNVERIFIED",
  "confidence": number (0-100),
  "explanation": "1-3 sentence justification grounded in the evidence.",
  "evidence": "A brief summary of the strongest supporting or contradicting evidence.",
  "actualInformation": "If the claim is outdated or wrong, state the latest verified information here. Otherwise empty string."
}`;

export async function verifyClaimRoute(req, res) {
  try {
    const { claim } = req.body || {};
    if (!claim || typeof claim !== "object" || !claim.claim) {
      return res.status(400).json({ error: "Missing claim payload." });
    }

    const query = claim.searchQuery || claim.claim;

    // 1) Live web search
    let searchResult;
    try {
      searchResult = await searchWeb(query);
    } catch (e) {
      console.error("[verifyClaim] search failed:", e);
      return res.status(200).json({
        verdict: "UNVERIFIED",
        confidence: 0,
        explanation:
          "Live web verification is temporarily unavailable, so this claim could not be checked.",
        evidence: "",
        actualInformation: "",
        sources: [],
      });
    }

    const { sources = [], rawEvidence = "" } = searchResult;

    if (!rawEvidence && sources.length === 0) {
      return res.status(200).json({
        verdict: "UNVERIFIED",
        confidence: 0,
        explanation: "No reliable web evidence was found for this claim.",
        evidence: "",
        actualInformation: "",
        sources: [],
      });
    }

    // 2) Ask Groq to judge
    const evidenceText = buildEvidenceText(rawEvidence, sources);

    const resp = await groqChat({
      model: DEFAULT_MODEL,
      temperature: 0.1,
      responseFormat: { type: "json_object" },
      maxTokens: 900,
      messages: [
        { role: "system", content: VERDICT_PROMPT },
        {
          role: "user",
          content:
            `CLAIM: "${claim.claim}"\n` +
            `CATEGORY: ${claim.category || "Other"}\n\n` +
            `LIVE WEB EVIDENCE (retrieved just now):\n"""\n${evidenceText}\n"""\n\n` +
            `Return your verdict as JSON.`,
        },
      ],
    });

    const raw = extractContent(resp);
    const parsed = safeJsonParse(raw);

    if (!parsed || typeof parsed !== "object") {
      return res.status(200).json({
        verdict: "UNVERIFIED",
        confidence: 0,
        explanation: "The verification model returned an unparseable response.",
        evidence: "",
        actualInformation: "",
        sources,
      });
    }

    const verdict = normalizeVerdict(parsed.verdict);
    const confidence = clampNum(parsed.confidence, 0, 100);

    res.json({
      verdict,
      confidence,
      explanation: String(parsed.explanation || "").trim(),
      evidence: String(parsed.evidence || "").trim(),
      actualInformation: String(parsed.actualInformation || "").trim(),
      sources,
      searchProvider: searchResult.provider || "unknown",
    });
  } catch (e) {
    if (e instanceof GroqError) {
      return res.status(e.status || 500).json({ error: e.message, code: e.code });
    }
    console.error("[verifyClaim] error:", e);
    res.status(500).json({ error: "Failed to verify claim." });
  }
}

function buildEvidenceText(rawEvidence, sources) {
  let out = rawEvidence ? rawEvidence.trim() + "\n\n" : "";
  if (sources && sources.length) {
    out += "Sources (with snippets):\n";
    sources.forEach((s, i) => {
      out += `[${i + 1}] ${s.title || s.domain || s.url}\n`;
      out += `    URL: ${s.url}\n`;
      if (s.publishedDate) out += `    Date: ${s.publishedDate}\n`;
      if (s.snippet) out += `    Snippet: ${s.snippet}\n`;
    });
  }
  return out.slice(0, 12000);
}

function normalizeVerdict(v) {
  const s = String(v || "").toUpperCase().trim();
  if (["VERIFIED", "INACCURATE", "FALSE", "UNVERIFIED"].includes(s)) return s;
  return "UNVERIFIED";
}

function clampNum(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(lo, Math.min(hi, Math.round(x)));
}
