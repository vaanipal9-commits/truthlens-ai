import React from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileSearch, Globe2, ShieldCheck, FileBarChart } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Upload",
    icon: UploadCloud,
    body: "Drop a PDF into the secure upload zone. Text is extracted client-side using pdf.js — nothing is stored on any server.",
  },
  {
    n: "02",
    title: "Extract",
    icon: FileSearch,
    body: "The Groq LLM reads the content and identifies verifiable factual claims: statistics, dates, financial figures, technical facts.",
  },
  {
    n: "03",
    title: "Search",
    icon: Globe2,
    body: "For each claim, TruthLens performs a live web search across authoritative sources — government, research, official and reputable news.",
  },
  {
    n: "04",
    title: "Verify",
    icon: ShieldCheck,
    body: "The AI compares each claim against the retrieved evidence and issues a verdict: Verified, Inaccurate, False, or Unverified.",
  },
  {
    n: "05",
    title: "Report",
    icon: FileBarChart,
    body: "A weighted Trust Score is calculated and a full report is produced with explanations, real sources and downloadable CSV / JSON.",
  },
];

export default function HowItWorksPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">The Pipeline</div>
        <h2 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight text-white">
          How <span className="text-gradient">TruthLens</span> Works
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base">
          Five focused steps from raw document to verified truth — powered by
          live web evidence, not model memory.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-5 hover:-translate-y-1 hover:bg-white/[0.06] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-[0.2em] text-slate-500">{s.n}</span>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 border border-white/10 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-cyan-200" />
              </div>
            </div>
            <h3 className="mt-4 text-white font-medium">{s.title}</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.body}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-14 glass-strong rounded-3xl p-6 sm:p-10">
        <h3 className="text-xl sm:text-2xl font-semibold text-white">
          Why live web evidence matters
        </h3>
        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
          Language models are trained on static snapshots of the world. That
          means a fact that was true two years ago — a company's user count, a
          country's GDP, a product's specifications — may be outdated today.
          TruthLens grounds every verdict in real, current web sources. If a
          claim has been overtaken by newer information, TruthLens marks it as{" "}
          <span className="text-amber-300">INACCURATE</span> and shows you the
          latest verified figure with a citation you can open and read.
        </p>
      </div>
    </section>
  );
}
