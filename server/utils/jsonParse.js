// Safely parse JSON emitted by an LLM. Handles code fences, prefixes, and truncated output.
export function safeJsonParse(text) {
  if (!text || typeof text !== "string") return null;

  // 1) direct parse
  try {
    return JSON.parse(text);
  } catch {}

  // 2) strip markdown code fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]);
    } catch {}
  }

  // 3) find first { ... } or [ ... ] block
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch {}
  }
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try {
      return JSON.parse(arrMatch[0]);
    } catch {}
  }

  return null;
}
