import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, FileText, Calendar, ShieldCheck } from "lucide-react";
import { loadHistory, clearHistory, removeHistoryItem } from "../utils/history";
import { formatDate } from "../utils/format";

export default function HistoryPage({ onOpen }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  const refresh = () => setItems(loadHistory());

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Local History</div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Recent Verifications
          </h2>
          <p className="mt-2 text-slate-400 text-sm max-w-xl">
            Reports are stored locally in your browser only. Nothing is uploaded to a cloud database.
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              clearHistory();
              refresh();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/10 text-sm text-rose-200"
          >
            <Trash2 className="w-4 h-4" /> Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl glass flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-slate-400" />
          </div>
          <div className="mt-4 text-white font-medium">No verifications yet</div>
          <p className="mt-1 text-sm text-slate-400">
            Upload a PDF from the Fact Check page to build your local history.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((it) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-5 hover:bg-white/[0.06] transition group cursor-pointer"
              onClick={() => onOpen(it)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-cyan-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate group-hover:text-cyan-200 transition">
                    {it.documentName}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(it.analyzedAt)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-semibold text-white">{it.trustScore}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">/ 100</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <Mini label="Claims" value={it.summary?.total || 0} color="text-white" />
                <Mini label="Verified" value={it.summary?.verified || 0} color="text-emerald-300" />
                <Mini label="Inaccurate" value={it.summary?.inaccurate || 0} color="text-amber-300" />
                <Mini label="False" value={it.summary?.false || 0} color="text-rose-300" />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeHistoryItem(it.id);
                    refresh();
                  }}
                  className="text-[11px] text-slate-500 hover:text-rose-300 transition"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

function Mini({ label, value, color }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/5 py-2">
      <div className={`text-base font-semibold ${color}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
