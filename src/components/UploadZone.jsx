import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { formatBytes } from "../utils/format";

export default function UploadZone({ onFile, file, meta, onClear, onAnalyze, busy, disabled }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const pick = () => inputRef.current?.click();

  const handleFiles = useCallback(
    (files) => {
      setError("");
      const f = files?.[0];
      if (!f) return;
      if (f.type && f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are supported.");
        return;
      }
      if (f.size > 20 * 1024 * 1024) {
        setError("PDF must be under 20 MB.");
        return;
      }
      onFile(f);
    },
    [onFile]
  );

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
          Verify a Document
        </h2>
        <p className="mt-2 text-slate-400 text-sm sm:text-base">
          Upload a PDF and let TruthLens investigate its factual claims.
        </p>
      </div>

      {!file ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`upload-glow relative rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all ${
            drag ? "bg-white/[0.08] scale-[1.01]" : "bg-white/[0.03]"
          }`}
          onClick={pick}
          role="button"
          tabIndex={0}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500/40 to-cyan-400/40 border border-white/10 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <UploadCloud className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
            </div>
            <h3 className="mt-5 text-lg sm:text-xl text-white font-medium">
              Drop your PDF here
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              or <span className="text-cyan-300 underline underline-offset-4">browse from your device</span>
            </p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-slate-500">
              Supported format: PDF · Max 20 MB
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-5 sm:p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 border border-white/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-cyan-200" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-white font-medium truncate">{file.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatBytes(file.size)}
                    {meta?.pageCount ? ` · ${meta.pageCount} pages` : ""}
                    {meta?.text ? ` · ${meta.text.length.toLocaleString()} chars extracted` : ""}
                  </p>
                </div>
                <button
                  onClick={onClear}
                  disabled={busy}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-50"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onAnalyze}
                  disabled={busy || disabled}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-medium shadow-lg shadow-indigo-500/20 hover:shadow-cyan-400/30 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {busy ? "Analyzing…" : "Analyze Document"}
                </button>
                <button
                  onClick={onClear}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl glass text-white font-medium hover:bg-white/10 disabled:opacity-50 transition"
                >
                  Replace
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
    </section>
  );
}
