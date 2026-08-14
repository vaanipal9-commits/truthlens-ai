// Real PDF extraction using pdfjs-dist (JavaScript only, no Python).
import * as pdfjsLib from "pdfjs-dist";
// Vite handles ?url for worker asset
// eslint-disable-next-line import/no-unresolved
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export async function extractPdf(file) {
  if (!file) throw new Error("No file provided.");
  if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Only PDF files are supported.");
  }
  const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
  if (file.size > MAX_BYTES) {
    throw new Error("PDF is too large. Please upload a file under 20 MB.");
  }

  const buf = await file.arrayBuffer();
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  } catch (e) {
    throw new Error("Could not read this PDF. It may be corrupted or password-protected.");
  }

  const pageCount = pdf.numPages;
  const pageTexts = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .map((it) => ("str" in it ? it.str : ""))
      .filter(Boolean);
    pageTexts.push(strings.join(" "));
  }
  const text = pageTexts.join("\n\n").replace(/[ \t]+/g, " ").trim();

  if (!text || text.length < 40) {
    throw new Error(
      "Unable to extract readable text from this PDF. Please upload a text-based PDF (not a scan/image)."
    );
  }

  return { text, pageCount, size: file.size, name: file.name };
}
