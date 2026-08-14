// Live web search service.
//
// Two implementations:
//   1) Groq Compound model (groq/compound) — LLM with built-in web search tool.
//      Requires only GROQ_API_KEY. Returns real cited URLs from executed searches.
//   2) Tavily Search API — used automatically when TAVILY_API_KEY is set.
//      https://tavily.com — an AI-native search API returning structured results with URLs.
//
// Both return normalized: { sources: [{ title, url, domain, snippet, publishedDate }], rawEvidence: "..." }

import { groqChat, COMPOUND_MODEL, extractContent, extractToolExecutions, GroqError } from "./groq.js";

export async function searchWeb(query) {
  if (!query || typeof query !== "string") {
    return { sources: [], rawEvidence: "" };
  }
  if (process.env.TAVILY_API_KEY) {
    try {
      return await tavilySearch(query);
    } catch (e) {
      console.warn("[webSearch] Tavily failed, falling back to Groq compound:", e.message);
      // fall through to compound
    }
  }
  return await groqCompoundSearch(query);
}

async function tavilySearch(query) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: "advanced",
      max_results: 6,
      include_answer: true,
      include_raw_content: false,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Tavily error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const results = Array.isArray(data.results) ? data.results : [];
  const sources = results.map((r) => ({
    title: r.title || "",
    url: r.url,
    domain: safeDomain(r.url),
    snippet: (r.content || "").slice(0, 400),
    publishedDate: r.published_date || null,
  }));
  const rawEvidence =
    (data.answer ? `Summary: ${data.answer}\n\n` : "") +
    results
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${(r.content || "").slice(0, 500)}`)
      .join("\n\n");
  return { sources, rawEvidence, provider: "tavily" };
}

// Uses Groq's compound model which has native web search.
async function groqCompoundSearch(query) {
  const resp = await groqChat({
    model: COMPOUND_MODEL,
    temperature: 0.1,
    maxTokens: 1500,
    messages: [
      {
        role: "system",
        content:
          "You are a live web search assistant. Use the web_search tool to find current, authoritative information about the user's query. Prefer government, official company, university, research and reputable news sources. After searching, produce a concise factual summary and list the URLs you used.",
      },
      {
        role: "user",
        content: `Search the live web for authoritative information about: ${query}\n\nReturn a short factual summary followed by the sources you consulted (title + URL + brief snippet).`,
      },
    ],
  });

  const content = extractContent(resp);
  const executed = extractToolExecutions(resp);

  // Try to extract structured search results from executed tools.
  const sources = [];
  for (const t of executed || []) {
    // Different possible shapes; look for search_results / output containing URLs
    const output =
      t?.search_results || t?.output || t?.result || t?.results || t?.function?.output;
    const items = normalizeToolOutput(output);
    for (const it of items) sources.push(it);
  }

  // Fallback: parse URLs out of the compound response text
  if (sources.length === 0 && content) {
    const urls = extractUrls(content);
    for (const u of urls) {
      sources.push({
        title: "",
        url: u,
        domain: safeDomain(u),
        snippet: "",
        publishedDate: null,
      });
    }
  }

  // Deduplicate by URL
  const seen = new Set();
  const dedup = [];
  for (const s of sources) {
    if (!s.url) continue;
    if (seen.has(s.url)) continue;
    seen.add(s.url);
    dedup.push(s);
    if (dedup.length >= 6) break;
  }

  return {
    sources: dedup,
    rawEvidence: content || "",
    provider: "groq-compound",
  };
}

function normalizeToolOutput(output) {
  if (!output) return [];
  // If string, try JSON parse
  if (typeof output === "string") {
    try {
      output = JSON.parse(output);
    } catch {
      const urls = extractUrls(output);
      return urls.map((u) => ({
        title: "",
        url: u,
        domain: safeDomain(u),
        snippet: "",
        publishedDate: null,
      }));
    }
  }
  // Arrays or {results: [...]}
  const arr = Array.isArray(output)
    ? output
    : Array.isArray(output.results)
    ? output.results
    : Array.isArray(output.data)
    ? output.data
    : [];

  return arr
    .map((r) => {
      const url = r.url || r.link || r.source || r.href;
      if (!url) return null;
      return {
        title: r.title || r.name || "",
        url,
        domain: safeDomain(url),
        snippet: (r.snippet || r.content || r.description || r.text || "").toString().slice(0, 400),
        publishedDate: r.published_date || r.date || null,
      };
    })
    .filter(Boolean);
}

function extractUrls(text) {
  if (!text) return [];
  const re = /https?:\/\/[^\s)\]"'<>]+/g;
  const found = text.match(re) || [];
  return [...new Set(found.map((u) => u.replace(/[.,;:!?)\]]+$/, "")))];
}

function safeDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
