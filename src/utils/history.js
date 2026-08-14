const KEY = "truthlens_history_v1";
const MAX = 20;

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveHistory(report) {
  try {
    const arr = loadHistory();
    const entry = {
      id: report.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      documentName: report.documentName,
      analyzedAt: report.analyzedAt,
      trustScore: report.trustScore,
      summary: report.summary,
      claims: report.claims,
    };
    const next = [entry, ...arr.filter((x) => x.id !== entry.id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    return entry;
  } catch {
    return null;
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function removeHistoryItem(id) {
  try {
    const arr = loadHistory().filter((x) => x.id !== id);
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch {}
}
