function csvEscape(v) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCSV(report) {
  const rows = [
    [
      "Claim",
      "Category",
      "Verdict",
      "Confidence",
      "Explanation",
      "Actual Information",
      "Source",
      "Source URL",
    ],
  ];
  for (const c of report.claims || []) {
    const sources = c.sources || [];
    if (sources.length === 0) {
      rows.push([
        c.claim,
        c.category,
        c.verdict,
        c.confidence != null ? `${c.confidence}%` : "",
        c.explanation || "",
        c.actualInformation || "",
        "",
        "",
      ]);
    } else {
      for (const s of sources) {
        rows.push([
          c.claim,
          c.category,
          c.verdict,
          c.confidence != null ? `${c.confidence}%` : "",
          c.explanation || "",
          c.actualInformation || "",
          s.title || s.domain || "",
          s.url || "",
        ]);
      }
    }
  }
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  triggerDownload(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    `truthlens-${sanitize(report.documentName)}.csv`
  );
}

export function downloadJSON(report) {
  const json = JSON.stringify(report, null, 2);
  triggerDownload(
    new Blob([json], { type: "application/json" }),
    `truthlens-${sanitize(report.documentName)}.json`
  );
}

function sanitize(name) {
  return (name || "report").replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]/gi, "_").slice(0, 60);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
