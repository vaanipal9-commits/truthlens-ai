import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ServerCrash } from "lucide-react";

import UploadZone from "../components/UploadZone";
import ProgressSteps, { STEPS } from "../components/ProgressSteps";
import Report from "../components/Report";

import { extractPdf } from "../services/pdf";
import { extractClaims, verifyClaim } from "../services/api";
import { calculateTrustScore, summarize } from "../utils/format";
import { saveHistory } from "../utils/history";

const initialSteps = STEPS.reduce((acc, s) => {
  acc[s.id] = "pending";
  return acc;
}, {});

export default function FactCheckPage({ initialReport }) {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);
  const [busy, setBusy] = useState(false);
  const [stepState, setStepState] = useState(initialSteps);
  const [detail, setDetail] = useState("");
  const [error, setError] = useState(null);
  const [report, setReport] = useState(initialReport || null);

  const setStep = (id, s) => setStepState((prev) => ({ ...prev, [id]: s }));

  const reset = () => {
    setFile(null);
    setMeta(null);
    setStepState(initialSteps);
    setDetail("");
    setError(null);
    setReport(null);
  };

  const onFile = useCallback((f) => {
    setFile(f);
    setMeta(null);
    setReport(null);
    setError(null);
    setStepState({ ...initialSteps, upload: "done" });
    setDetail(f.name);
  }, []);

  const onAnalyze = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setReport(null);
    try {
      // Step: extract text
      setStep("extract", "active");
      setDetail("Extracting text from PDF…");
      const ext = await extractPdf(file);
      setMeta(ext);
      setStep("extract", "done");

      // Step: identify claims (backend)
      setStep("claims", "active");
      setDetail("Identifying factual claims with Groq…");
      const claimsResp = await extractClaims(ext.text, ext.name);
      const claims = (claimsResp && claimsResp.claims) || [];
      if (!Array.isArray(claims) || claims.length === 0) {
        setStep("claims", "error");
        throw new Error("No verifiable factual claims were found in this document.");
      }
      setStep("claims", "done");

      // Step: search + compare + verdict per claim
      setStep("search", "active");
      setStep("compare", "active");
      setStep("verdict", "active");

      const verified = [];
      for (let i = 0; i < claims.length; i++) {
        const c = claims[i];
        setDetail(`Verifying claim ${i + 1} of ${claims.length}: ${truncate(c.claim, 80)}`);
        try {
          const v = await verifyClaim(c);
          verified.push({ ...c, ...v });
        } catch (e) {
          verified.push({
            ...c,
            verdict: "UNVERIFIED",
            confidence: 0,
            explanation:
              e.code === "BACKEND_UNAVAILABLE"
                ? "Live verification is temporarily unavailable."
                : e.message || "Verification failed.",
            sources: [],
          });
        }
      }

      setStep("search", "done");
      setStep("compare", "done");
      setStep("verdict", "done");
      setStep("done", "done");
      setDetail("Verification complete.");

      const trustScore = calculateTrustScore(verified);
      const summary = summarize(verified);
      const newReport = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        documentName: ext.name,
        pageCount: ext.pageCount,
        analyzedAt: new Date().toISOString(),
        trustScore,
        summary,
        claims: verified,
      };
      setReport(newReport);
      saveHistory(newReport);
    } catch (e) {
      setError({
        message: e.message || "Something went wrong.",
        code: e.code,
      });
      // Mark any active step as error
      setStepState((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          if (next[k] === "active") next[k] = "error";
        }
        return next;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-8 sm:pt-12 pb-16">
      {!report && (
        <>
          <UploadZone
            file={file}
            meta={meta}
            onFile={onFile}
            onClear={reset}
            onAnalyze={onAnalyze}
            busy={busy}
          />
          <AnimatePresence>
            {(busy || Object.values(stepState).some((s) => s !== "pending")) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-8 mx-auto max-w-4xl px-4 sm:px-6"
              >
                <ProgressSteps state={stepState} detail={detail} />
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-6 mx-auto max-w-4xl px-4 sm:px-6">
              <ErrorBanner error={error} />
            </div>
          )}
        </>
      )}

      {report && (
        <div className="space-y-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <button
              onClick={reset}
              className="text-sm text-slate-400 hover:text-white transition inline-flex items-center gap-1.5"
            >
              ← Analyze another document
            </button>
          </div>
          <Report report={report} />
        </div>
      )}
    </div>
  );
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function ErrorBanner({ error }) {
  const backendDown = error.code === "BACKEND_UNAVAILABLE";
  const Icon = backendDown ? ServerCrash : AlertTriangle;
  return (
    <div className="glass-strong rounded-2xl p-5 border border-rose-400/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-rose-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium">
            {backendDown ? "Live verification is temporarily unavailable." : "Analysis error"}
          </div>
          <p className="mt-1 text-sm text-slate-300 leading-relaxed">{error.message}</p>
          {backendDown && (
            <div className="mt-3 text-xs text-slate-400 leading-relaxed">
              Make sure the backend is running. From the project root:
              <pre className="mt-2 p-3 rounded-lg bg-black/40 border border-white/10 text-cyan-200 overflow-x-auto">
{`# 1) Copy the env file
cp .env.example .env
# 2) Add your key to .env
GROQ_API_KEY=your_real_groq_key
# 3) Start both servers
npm install
npm run dev`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
