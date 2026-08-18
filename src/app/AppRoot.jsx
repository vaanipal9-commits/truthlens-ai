import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "../components/Navbar";
import DashboardPage from "../pages/DashboardPage";
import FactCheckPage from "../pages/FactCheckPage";
import HistoryPage from "../pages/HistoryPage";
import HowItWorksPage from "../pages/HowItWorksPage";
import { checkHealth, getApiBase } from "../services/api";

export default function AppRoot() {
  const [page, setPage] = useState("dashboard");
  const [openReport, setOpenReport] = useState(null);
  const [health, setHealth] = useState({ status: "checking" });

  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then((h) => !cancelled && setHealth({ status: "ok", ...h }))
      .catch((e) =>
        !cancelled &&
        setHealth({
          status: "down",
          message: e.message,
          code: e.code,
        })
      );
    return () => {
      cancelled = false;
    };
  }, []);

  const navigate = (id) => {
    setPage(id);
    setOpenReport(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openHistoryReport = (report) => {
    setOpenReport(report);
    setPage("factcheck");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen">
      <div className="aurora" />
      <div className="grid-overlay" />

      <div className="relative z-10">
        <Navbar page={page} onNavigate={navigate} />

        <BackendBanner health={health} />

        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={page + (openReport ? "-r" : "")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {page === "dashboard" && (
                <DashboardPage
                  onStart={() => navigate("factcheck")}
                  onHow={() => navigate("how")}
                />
              )}
              {page === "factcheck" && <FactCheckPage initialReport={openReport} />}
              {page === "history" && <HistoryPage onOpen={openHistoryReport} />}
              {page === "how" && <HowItWorksPage />}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </div>
  );
}

function BackendBanner({ health }) {
  if (health.status !== "down") return null;
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-3">
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs sm:text-sm text-amber-100 flex items-start gap-3">
        <span className="mt-0.5">⚠️</span>
        <div className="flex-1">
          <span className="font-medium">Backend not detected at {getApiBase()}.</span>{" "}
          Live verification requires the Node/Express server. From the project
          root, run <code className="px-1.5 py-0.5 rounded bg-black/30 text-amber-200">npm install &amp;&amp; npm run dev</code> after
          creating <code className="px-1.5 py-0.5 rounded bg-black/30 text-amber-200">.env</code> with
          your <code className="px-1.5 py-0.5 rounded bg-black/30 text-amber-200">GROQ_API_KEY</code>.
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>© {new Date().getFullYear()} TruthLens AI · Upload. Verify. Trust.</div>
        <div className="flex items-center gap-3">
          <span>Powered by Groq · Live web evidence</span>
        </div>
      </div>
    </footer>
  );
}
