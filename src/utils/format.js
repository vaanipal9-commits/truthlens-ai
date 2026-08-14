export function formatBytes(bytes) {
  if (bytes === 0 || bytes == null) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatDate(d) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (!date || isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateTrustScore(claims) {
  if (!claims || claims.length === 0) return 0;
  let score = 0;
  let weight = 0;
  for (const c of claims) {
    const w = c.importance === "High" ? 3 : c.importance === "Medium" ? 2 : 1;
    weight += w;
    let v = 0;
    switch ((c.verdict || "").toUpperCase()) {
      case "VERIFIED":
        v = 100;
        break;
      case "INACCURATE":
        v = 35;
        break;
      case "FALSE":
        v = 0;
        break;
      case "UNVERIFIED":
      default:
        v = 55;
    }
    // Blend with confidence when available
    if (typeof c.confidence === "number") {
      const conf = Math.max(0, Math.min(100, c.confidence));
      v = Math.round(v * 0.7 + (v >= 50 ? conf : 100 - conf) * 0.3);
    }
    score += v * w;
  }
  return Math.round(score / weight);
}

export function summarize(claims) {
  const s = { total: 0, verified: 0, inaccurate: 0, false: 0, unverified: 0 };
  for (const c of claims || []) {
    s.total++;
    const v = (c.verdict || "UNVERIFIED").toUpperCase();
    if (v === "VERIFIED") s.verified++;
    else if (v === "INACCURATE") s.inaccurate++;
    else if (v === "FALSE") s.false++;
    else s.unverified++;
  }
  return s;
}

export function verdictColor(verdict) {
  switch ((verdict || "").toUpperCase()) {
    case "VERIFIED":
      return { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-400/30", dot: "bg-emerald-400" };
    case "INACCURATE":
      return { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-400/30", dot: "bg-amber-400" };
    case "FALSE":
      return { text: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-400/30", dot: "bg-rose-400" };
    default:
      return { text: "text-slate-300", bg: "bg-slate-500/10", border: "border-slate-400/30", dot: "bg-slate-400" };
  }
}
