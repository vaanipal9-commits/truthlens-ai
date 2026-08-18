import React from "react";
import { motion } from "framer-motion";

// Lightweight animated "Trust Core" — SVG based (no heavy 3D dep) for smooth performance on all devices.
export default function TrustCore({ score = 0, size = 220 }) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  const c = size / 2;
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  const dash = (s / 100) * circ;

  const color =
    s >= 80 ? "#34d399" : s >= 60 ? "#22d3ee" : s >= 40 ? "#fbbf24" : "#fb7185";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-40"
        style={{ background: color }}
      />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="trustGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
        />
        <motion.circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="url(#trustGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Trust</div>
        <CountUp value={s} className="text-5xl font-semibold text-white leading-none mt-1" />
        <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mt-1">/ 100</div>
      </div>
    </div>
  );
}

function CountUp({ value, className }) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    let raf;
    const start = performance.now();
    const dur = 1400;
    const from = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <div className={className}>{n}</div>;
}
