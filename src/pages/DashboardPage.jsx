import React from "react";
import Hero from "../components/Hero";
import HowItWorksPage from "./HowItWorksPage";

export default function DashboardPage({ onStart, onHow }) {
  return (
    <div>
      <Hero onStart={onStart} onHow={onHow} />
      <div className="border-t border-white/5">
        <HowItWorksPage />
      </div>
    </div>
  );
}
