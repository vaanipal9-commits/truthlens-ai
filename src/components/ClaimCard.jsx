import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion } from "lucide-react";
import { verdictColor } from "../utils/format";

const iconFor = (v) => {
  switch ((v || "").toUpperCase()) {
    case "VERIFIED":
      return ShieldCheck;
    case "INACCURATE":
      return ShieldAlert;
    case "FALSE":
      return ShieldX;
    default:
      return ShieldQuestion;
  }
};

export default function ClaimCard({ claim, index }) {
  const [open, setOpen] = useState(false);
  const c = verdictColor(claim.verdict);
  const Icon = iconFor(claim.verdict);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`glass rounded-2xl border ${c.border} overflow-hidden`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:bg-white/[0.03] transition"
      >
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="text-[10px] font-mono text-slate-500">#{String(index + 1).padStart(2, "0")}</div>
          <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${c.text}`} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md ${c.bg} ${c.text} border ${c.border}`}>
              {claim.verdict || "UNVERIFIED"}
            </span>
            {claim.category && (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                {claim.category}
              </span>
            )}
            {claim.importance && (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
                {claim.importance}
              </span>
            )}
            {typeof claim.confidence === "number" && (
              <span className="ml-auto text-xs text-slate-300">
                <span className={`font-mono ${c.text}`}>{claim.confidence}%</span>
                <span className="text-slate-500"> confidence</span>
              </span>
            )}
          </div>
          <p className="text-white text-sm sm:text-[15px] leading-relaxed">
            {claim.claim}
          </p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 flex-shrink-0 mt-2 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-4 sm:p-5 space-y-4">
              {claim.explanation && (
                <Field label="Explanation">
                  <p className="text-slate-200 text-sm leading-relaxed">{claim.explanation}</p>
                </Field>
              )}

              {claim.evidence && (
                <Field label="Evidence Summary">
                  <p className="text-slate-300 text-sm leading-relaxed">{claim.evidence}</p>
                </Field>
              )}

              {claim.actualInformation && (
                <Field label="Latest Verified Information">
                  <div className={`rounded-xl p-3 ${c.bg} ${c.border} border`}>
                    <p className={`text-sm leading-relaxed ${c.text}`}>{claim.actualInformation}</p>
                  </div>
                </Field>
              )}

              {claim.searchQuery && (
                <Field label="Search Query Used">
                  <code className="text-xs px-2 py-1 rounded-md bg-white/5 text-cyan-200 border border-white/10 inline-block break-all">
                    {claim.searchQuery}
                  </code>
                </Field>
              )}

              {claim.sources && claim.sources.length > 0 && (
                <Field label={`Sources (${claim.sources.length})`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {claim.sources.map((s, i) => (
                      <SourceCard key={i} source={s} />
                    ))}
                  </div>
                </Field>
              )}

              {(!claim.sources || claim.sources.length === 0) && (
                <div className="text-xs text-slate-500 italic">
                  No live web sources returned for this claim.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function SourceCard({ source }) {
  let domain = source.domain;
  if (!domain && source.url) {
    try {
      domain = new URL(source.url).hostname.replace(/^www\./, "");
    } catch {}
  }
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group block rounded-xl p-3 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm text-white font-medium line-clamp-2 group-hover:text-cyan-200 transition">
            {source.title || domain || source.url}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="truncate">{domain}</span>
            {source.publishedDate && (
              <>
                <span>·</span>
                <span>{source.publishedDate}</span>
              </>
            )}
          </div>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 flex-shrink-0 mt-0.5" />
      </div>
      {source.snippet && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
          {source.snippet}
        </p>
      )}
      <div className="mt-2 text-[11px] text-cyan-300/80 opacity-0 group-hover:opacity-100 transition">
        Open Source ↗
      </div>
    </a>
  );
}
