// TruthLens AI — Frontend API service
// Communicates with the Node/Express backend at VITE_API_URL (default http://localhost:5000).
// NEVER contains any API keys — all secrets live server-side.

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  "http://localhost:5000";

async function jsonFetch(path, options = {}, timeoutMs = 90000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { error: "Malformed server response." };
    }
    if (!res.ok) {
      const err = new Error(
        (data && (data.error || data.message)) ||
          `Request failed with status ${res.status}`
      );
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (e) {
    if (e.name === "AbortError") {
      const err = new Error("The request timed out. Please try again.");
      err.code = "TIMEOUT";
      throw err;
    }
    if (e instanceof TypeError) {
      // Network / CORS / backend not reachable
      const err = new Error(
        "Cannot reach the TruthLens backend. Start it with `npm run dev` from the project root and ensure your .env has GROQ_API_KEY."
      );
      err.code = "BACKEND_UNAVAILABLE";
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkHealth() {
  return jsonFetch("/api/health", { method: "GET" }, 8000);
}

export async function extractClaims(text, documentName) {
  return jsonFetch(
    "/api/extract-claims",
    {
      method: "POST",
      body: JSON.stringify({ text, documentName }),
    },
    90000
  );
}

export async function verifyClaim(claim) {
  return jsonFetch(
    "/api/verify-claim",
    {
      method: "POST",
      body: JSON.stringify({ claim }),
    },
    90000
  );
}

export function getApiBase() {
  return API_BASE;
}
