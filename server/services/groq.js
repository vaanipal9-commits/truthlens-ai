// Groq API wrapper — chat completions with safe error handling.
// Uses the Groq HTTP API directly to keep dependencies minimal.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Primary model for extraction + verification reasoning
export const DEFAULT_MODEL = "openai/gpt-oss-120b";
// Groq's "compound" model has built-in live web search (Groq's own search tool).
export const COMPOUND_MODEL = "groq/compound";

export class GroqError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function ensureGroqKey() {
  if (!process.env.GROQ_API_KEY) {
    throw new GroqError(
      "Groq API key is not configured. Add GROQ_API_KEY to your .env file.",
      "NO_API_KEY",
      500
    );
  }
}

export async function groqChat({
  model = DEFAULT_MODEL,
  messages,
  temperature = 0.2,
  responseFormat = null,
  maxTokens = 4096,
  timeoutMs = 60000,
}) {
  ensureGroqKey();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  if (responseFormat) body.response_format = responseFormat;

  let res;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    if (e.name === "AbortError") {
      throw new GroqError(
        "Groq request timed out. Please try again.",
        "TIMEOUT",
        504
      );
    }
    throw new GroqError(
      "Could not reach Groq API. Please check your connection.",
      "NETWORK",
      502
    );
  }
  clearTimeout(timer);

  if (res.status === 401 || res.status === 403) {
    throw new GroqError(
      "Groq API authentication failed. Please check your API key.",
      "BAD_KEY",
      401
    );
  }
  if (res.status === 429) {
    throw new GroqError(
      "Groq rate limit reached. Please wait a moment and retry.",
      "RATE_LIMIT",
      429
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const detail =
      (data && (data.error?.message || data.message)) ||
      `Groq request failed (${res.status}).`;
    throw new GroqError(detail, "BAD_RESPONSE", res.status);
  }

  return data;
}

export function extractContent(groqResponse) {
  return groqResponse?.choices?.[0]?.message?.content || "";
}

// Compound model may attach executed tool calls with web search results.
export function extractToolExecutions(groqResponse) {
  const msg = groqResponse?.choices?.[0]?.message;
  return msg?.executed_tools || msg?.tool_calls || [];
}
