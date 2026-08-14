import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles, ShieldCheck, Globe2, FileSearch } from "lucide-react";

export default function Hero({ onStart, onHow }) {
  return (
    <section className="relative pt-14 sm:pt-20 pb-10 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs sm:text-sm text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="tracking-wide">TRUTHLENS AI</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">✦ AI-POWERED FACT VERIFICATION</span>
          </div>

          <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
            Turn Every Document
            <br />
            Into <span className="text-gradient">Verified Truth.</span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-slate-400 text-base sm:text-lg leading-relaxed">
            Upload a document, uncover factual claims, and verify them against
            live web evidence — powered by Groq and real-time source search.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-cyan-400/40 transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center"
            >
              Start Fact Check <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onHow}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass text-white font-medium hover:bg-white/10 transition w-full sm:w-auto justify-center"
            >
              <PlayCircle className="w-4 h-4" /> How It Works
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              icon: FileSearch,
              title: "Extract Claims",
              body: "Groq-powered LLM identifies verifiable statistics, dates and facts.",
            },
            {
              icon: Globe2,
              title: "Live Web Search",
              body: "Real-time evidence pulled from authoritative sources on the web.",
            },
            {
              icon: ShieldCheck,
              title: "Trust Score",
              body: "Every document receives a transparent, weighted trust rating.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-5 hover:-translate-y-1 hover:bg-white/[0.06] transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 border border-white/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-cyan-200" />
              </div>
              <h3 className="mt-4 text-white font-medium">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
