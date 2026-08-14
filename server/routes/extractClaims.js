import { groqChat, extractContent, GroqError, DEFAULT_MODEL } from "../services/groq.js";
import { safeJsonParse } from "../utils/jsonParse.js";

const MAX_TEXT = 24000; // limit prompt size for reliability

const SYSTEM_PROMPT = `You are TruthLens, a rigorous fact-extraction engine.

Your job: read a document and extract a list of ATOMIC, VERIFIABLE FACTUAL CLAIMS.

RULES:
- Include: statistics, percentages, dates, monetary/financial figures, technical specifications, company facts (founding year, HQ, headcount, revenue, market share), market claims, scientific facts, historical events with dates.
- Exclude: opinions, subjective statements, marketing adjectives ("best", "leading"), section headings, generic filler, forward-looking language ("we believe", "we expect").
- Each claim must be a single, self-contained sentence with enough context to verify (e.g. include the entity name, the year, the unit).
- Do NOT invent facts. Only extract what is explicitly stated.
- Assign a category from: Statistics | Financial | Dates | Company | Market | Technical | Scientific | Other.
- Assign importance: High | Medium | Low (High = central factual claims, Low = trivia).
- Provide a concise Google-style searchQuery that a fact-checker could use to verify the claim on the web.
- Return between 5 and 15 claims (fewer only if the document truly contains fewer verifiable facts).

Return ONLY valid JSON matching exactly:
{
  "claims": [
    { "claim": "...", "category": "...", "importance": "...", "searchQuery": "..." }
  ]
}`;

export async function extractClaimsRoute(req, res) {
  try {
    const { text, documentName } = req.body || {};
    if (!text || typeof text !== "string" || text.trim().length < 40) {
      return res.status(400).json({
        error: "The document text is empty or too short to analyze.",
      });
    }

    const trimmed = text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) : text;

    const resp = await groqChat({
      model: DEFAULT_MODEL,
      temperature: 0.1,
      responseFormat: { type: "json_object" },
      maxTokens: 3000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Document title: ${documentName || "Untitled"}\n\nDocument content:\n"""\n${trimmed}\n"""\n\nExtract the verifiable factual claims as JSON.`,
        },
      ],
    });

    const raw = extractContent(resp);
    const parsed = safeJsonParse(raw);

    if (!parsed || !Array.isArray(parsed.claims)) {
      return res.status(502).json({
        error: "The AI response could not be parsed. Please try again.",
      });
    }

    // Normalize + clip
    const claims = parsed.claims
      .filter((c) => c && typeof c.claim === "string" && c.claim.trim().length > 0)
      .slice(0, 15)
      .map((c) => ({
        claim: String(c.claim).trim(),
        category: normalizeCategory(c.category),
        importance: normalizeImportance(c.importance),
        searchQuery:
          typeof c.searchQuery === "string" && c.searchQuery.trim().length > 0
            ? c.searchQuery.trim()
            : String(c.claim).slice(0, 120),
      }));

    if (claims.length === 0) {
      return res.status(200).json({
        claims: [],
        message: "No verifiable factual claims were identified in this document.",
      });
    }

    res.json({ claims });
  } catch (e) {
    if (e instanceof GroqError) {
      return res.status(e.status || 500).json({ error: e.message, code: e.code });
    }
    console.error("[extractClaims] error:", e);
    res.status(500).json({ error: "Failed to extract claims." });
  }
}

function normalizeCategory(cat) {
  const allowed = [
    "Statistics",
    "Financial",
    "Dates",
    "Company",
    "Market",
    "Technical",
    "Scientific",
    "Other",
  ];
  if (typeof cat !== "string") return "Other";
  const found = allowed.find((a) => a.toLowerCase() === cat.trim().toLowerCase());
  return found || "Other";
}

function normalizeImportance(imp) {
  if (typeof imp !== "string") return "Medium";
  const v = imp.trim().toLowerCase();
  if (v === "high") return "High";
  if (v === "low") return "Low";
  return "Medium";
}
