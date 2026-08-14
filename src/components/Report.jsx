import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileJson, FileSpreadsheet, Calendar, FileText } from "lucide-react";
import TrustCore from "./TrustCore";
import ClaimCard from "./ClaimCard";
import { formatDate } from "../utils/format";
import { downloadCSV, downloadJSON } from "../utils/exports";

const VERDICTS = ["All", "Verified", "Inaccurate", "False", "Unverified"];
const CATEGORIES = ["All", "Statistics", "Financial", "Dates", "Company", "Market", "Technical", "Scientific", "Other"];

export default function Report({ report }) {
  const [verdictFilter, setVerdictFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filtered = useMemo(() => {
    return (report.claims || []).filter((c) => {
      const v = (c.verdict || "UNVERIFIED").toUpperCase();
      const cat = (c.category || "Other").toLowerCase();
      if (verdictFilter !== "All" && v !== verdictFilter.toUpperCase()) return false;
      if (categoryFilter !== "All" && cat !== categoryFilter.toLowerCase()) return false;
      return true;
    });
  }, [report.claims, verdictFilter, categoryFilter]);

  const s = report.summary || {};

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-5 sm:p-8"
      >
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
              <span className="pulse-dot text-emerald-400 w-1.5 h-1.5 rounded-full inline-block bg-current" />
              <span className="uppercase tracking-widest">Verification Report</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
              {report.documentName}
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(report.analyzedAt)}
              </span>
              {report.pageCount ? (
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  {report.pageCount} pages
                </span>
              ) : null}
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatCard label="Total Claims" value={s.total || 0} accent="text-white" />
              <StatCard label="Verified" value={s.verified || 0} accent="text-emerald-300" />
              <StatCard label="Inaccurate" value={s.inaccurate || 0} accent="text-amber-300" />
              <StatCard label="False" value={s.false || 0} accent="text-rose-300" />
              <StatCard label="Unverified" value={s.unverified || 0} accent="text-slate-300" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => downloadCSV(report)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/10 text-sm text-white transition"
              >
                <FileSpreadsheet className="w-4 h-4" /> Download CSV
              </button>
              <button
                onClick={() => downloadJSON(report)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/10 text-sm text-white transition"
              >
                <FileJson className="w-4 h-4" /> Download JSON
              </button>
            </div>
          </div>

          <div className="w-full lg:w-auto flex justify-center">
            <TrustCore score={report.trustScore} size={220} />
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="mt-8 space-y-3">
        <FilterRow
          label="Verdict"
          options={VERDICTS}
          value={verdictFilter}
          onChange={setVerdictFilter}
        />
        <FilterRow
          label="Category"
          options={CATEGORIES}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </div>

      {/* Claims */}
      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-slate-400 text-sm">
            No claims match the selected filters.
          </div>
        ) : (
          filtered.map((c, i) => <ClaimCard key={i} claim={c} index={i} />)
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="glass rounded-xl p-3 sm:p-4">
      <div className={`text-2xl sm:text-3xl font-semibold ${accent}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function FilterRow({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 w-20 flex-shrink-0">
        {label}
      </div>
      <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition ${
              value === o
                ? "bg-white/15 text-white border border-white/20"
                : "glass text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
