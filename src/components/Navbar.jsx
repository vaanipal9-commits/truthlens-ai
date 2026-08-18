import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanEye, Menu, X, Sparkles } from "lucide-react";

const links = [
  { id: "dashboard", label: "Dashboard" },
  { id: "factcheck", label: "Fact Check" },
  { id: "history", label: "History" },
  { id: "how", label: "How It Works" },
];

export default function Navbar({ page, onNavigate }) {
  const [open, setOpen] = useState(false);

  const go = (id) => {
    setOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
        <div className="glass-strong rounded-2xl px-3 sm:px-5 py-3 flex items-center justify-between">
          <button
            onClick={() => go("dashboard")}
            className="flex items-center gap-2 group"
            aria-label="TruthLens AI Home"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ScanEye className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-semibold tracking-tight text-white text-[15px]">TruthLens</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/80">AI</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className={`px-3.5 py-2 rounded-lg text-sm transition ${
                  page === l.id
                    ? "text-white bg-white/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => go("factcheck")}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 hover:shadow-cyan-500/30 transition-all hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              New Analysis
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden w-10 h-10 rounded-lg glass flex items-center justify-center text-white"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="md:hidden glass-strong rounded-2xl mt-2 p-2"
            >
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm ${
                    page === l.id ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => go("factcheck")}
                className="w-full mt-1 px-4 py-3 rounded-lg text-sm bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-medium"
              >
                New Analysis
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
