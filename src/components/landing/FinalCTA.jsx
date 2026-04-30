import { useState } from "react";
import useScrollReveal from "../../hooks/useScrollReveal";

/* ── Animated Leaf SVG ── */
function LeafDecor() {
  return (
    <svg className="absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 opacity-[0.06] pointer-events-none" viewBox="0 0 200 200" fill="none">
      <path d="M100 20 C60 60 20 100 60 160 C80 180 120 180 140 160 C180 100 140 60 100 20Z"
        stroke="#10b981" strokeWidth="1.5" fill="none"
        strokeDasharray="500" strokeDashoffset="500"
        style={{ animation: "leafDraw 3s ease-out 0.5s forwards" }} />
      <path d="M100 20 L100 160" stroke="#10b981" strokeWidth="1" strokeDasharray="140" strokeDashoffset="140"
        style={{ animation: "leafDraw 2s ease-out 2s forwards" }} />
      <path d="M100 70 L70 50" stroke="#10b981" strokeWidth="1" strokeDasharray="50" strokeDashoffset="50"
        style={{ animation: "leafDraw 1s ease-out 3s forwards" }} />
      <path d="M100 110 L130 90" stroke="#10b981" strokeWidth="1" strokeDasharray="50" strokeDashoffset="50"
        style={{ animation: "leafDraw 1s ease-out 3.5s forwards" }} />
    </svg>
  );
}

export default function FinalCTA({ onSignUp }) {
  const { ref, isVisible } = useScrollReveal(0.15);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f2318 35%, #1a0f2e 70%, #0a1628 100%)" }}>
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-20"
          style={{ background: "#10b981", top: "20%", left: "10%", animation: "meshFloat1 8s ease-in-out infinite alternate" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[130px] opacity-15"
          style={{ background: "#3b82f6", top: "40%", right: "10%", animation: "meshFloat2 10s ease-in-out infinite alternate" }} />
        <div className="absolute w-[350px] h-[350px] rounded-full blur-[120px] opacity-10"
          style={{ background: "#8b5cf6", bottom: "10%", left: "30%", animation: "meshFloat3 12s ease-in-out infinite alternate" }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Headline */}
        <div style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(40px)", transition: "all 1s cubic-bezier(0.16,1,0.3,1)" }}>
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
            The Planet <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">Can't Wait.</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl mb-14 max-w-xl mx-auto">
            Start earning from your green work today.
          </p>
        </div>

        {/* CTA Cards */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease-out 0.4s" }}>

          {/* Left Card - Earn */}
          <button onClick={() => onSignUp?.("farmer")}
            className="group w-full md:w-80 p-8 rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.12] hover:border-emerald-400/40 hover:-translate-y-2 transition-all duration-300 text-left"
            style={{ boxShadow: "0 0 40px rgba(16,185,129,0.06)" }}>
            <div className="text-3xl mb-3">🌱</div>
            <h3 className="text-xl font-bold text-white mb-2">I want to earn credits</h3>
            <p className="text-gray-500 text-sm mb-5">For farmers, NGOs, individuals</p>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-carbon text-sm font-semibold group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all">
              Sign Up Free →
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 md:flex-col">
            <div className="w-12 h-px md:w-px md:h-12 bg-white/[0.1]" />
            <span className="text-gray-600 text-sm font-medium">or</span>
            <div className="w-12 h-px md:w-px md:h-12 bg-white/[0.1]" />
          </div>

          {/* Right Card - Offset */}
          <button onClick={() => onSignUp?.("company")}
            className="group w-full md:w-80 p-8 rounded-3xl border border-sky-400/20 bg-sky-500/[0.04] hover:bg-sky-500/[0.1] hover:border-sky-400/40 hover:-translate-y-2 transition-all duration-300 text-left"
            style={{ boxShadow: "0 0 40px rgba(59,130,246,0.04)" }}>
            <div className="text-3xl mb-3">🏢</div>
            <h3 className="text-xl font-bold text-white mb-2">I want to offset emissions</h3>
            <p className="text-gray-500 text-sm mb-5">For companies</p>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white text-sm font-semibold group-hover:shadow-lg group-hover:shadow-sky-500/25 transition-all">
              Create Company Account →
            </span>
          </button>
        </div>

        <LeafDecor />
      </div>

      <style>{`
        @keyframes meshFloat1 { 0% { transform: translate(0, 0); } 100% { transform: translate(40px, -30px); } }
        @keyframes meshFloat2 { 0% { transform: translate(0, 0); } 100% { transform: translate(-30px, 40px); } }
        @keyframes meshFloat3 { 0% { transform: translate(0, 0); } 100% { transform: translate(20px, -40px); } }
        @keyframes leafDraw { to { stroke-dashoffset: 0; } }
      `}</style>
    </section>
  );
}
