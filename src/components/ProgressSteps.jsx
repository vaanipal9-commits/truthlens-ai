import React from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Circle } from "lucide-react";

export const STEPS = [
  { id: "upload", label: "Document uploaded" },
  { id: "extract", label: "Text extracted" },
  { id: "claims", label: "Identifying claims" },
  { id: "search", label: "Searching live web" },
  { id: "compare", label: "Comparing evidence" },
  { id: "verdict", label: "Generating verdicts" },
  { id: "done", label: "Verification complete" },
];

// state: { [stepId]: "pending" | "active" | "done" | "error" }
export default function ProgressSteps({ state, detail }) {
  return (
    <div className="glass-strong rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-white">Verification Pipeline</div>
        {detail && (
          <div className="text-xs text-slate-400 truncate max-w-[60%]">{detail}</div>
        )}
      </div>
      <ol className="space-y-2.5">
        {STEPS.map((s) => {
          const st = state[s.id] || "pending";
          return (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  st === "done"
                    ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                    : st === "active"
                    ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-200"
                    : st === "error"
                    ? "bg-rose-500/20 border-rose-400/40 text-rose-300"
                    : "bg-white/5 border-white/10 text-slate-500"
                }`}
              >
                {st === "done" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : st === "active" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Circle className="w-2.5 h-2.5 fill-current" />
                )}
              </span>
              <span
                className={`text-sm ${
                  st === "done"
                    ? "text-slate-200"
                    : st === "active"
                    ? "text-white"
                    : st === "error"
                    ? "text-rose-200"
                    : "text-slate-500"
                }`}
              >
                {s.label}
              </span>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
