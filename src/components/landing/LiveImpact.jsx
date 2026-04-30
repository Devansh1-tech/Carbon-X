import { useState, useEffect, useRef } from "react";
import useScrollReveal from "../../hooks/useScrollReveal";
import ProjectMap from "../ProjectMap";

/* ── Animated counter ── */
function AnimCounter({ target, prefix = "", suffix = "", active, duration = 2200 }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

/* ── Progress bar ── */
function ProgressBar({ pct, active, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setW(pct), 300 + delay);
    return () => clearTimeout(t);
  }, [active, pct, delay]);
  return (
    <div className="w-full h-1 rounded-full bg-white/[0.06] mt-2 overflow-hidden">
      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
        style={{ width: `${w}%`, transition: "width 1.5s cubic-bezier(0.16,1,0.3,1)" }} />
    </div>
  );
}

/* ── Marquee ── */
function TrustMarquee() {
  const logos = ["TATA Group", "Mahindra", "Infosys", "Wipro", "Reliance", "Adani Green", "ITC", "L&T"];
  return (
    <div className="mt-12 overflow-hidden relative">
      <p className="text-center text-gray-600 text-xs uppercase tracking-widest mb-4 font-semibold">Trusted by leading companies</p>
      <div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)" }}>
        <div className="flex gap-4 animate-[marquee_20s_linear_infinite]">
          {[...logos, ...logos].map((name, i) => (
            <span key={i} className="flex-shrink-0 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] text-gray-400 text-xs font-semibold whitespace-nowrap">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const STATS = [
  { emoji: "🌳", target: 18420, suffix: "", label: "Tons CO₂ Offset", pct: 78 },
  { emoji: "👨‍🌾", target: 2340, suffix: "", label: "Active Farmers", pct: 62 },
  { emoji: "✅", target: 890, suffix: "", label: "Projects Verified", pct: 45 },
  { emoji: "💰", target: 42, prefix: "₹", suffix: " Cr", label: "Total Paid Out", pct: 88 },
];

export default function LiveImpact({ projects = [] }) {
  const { ref, isVisible } = useScrollReveal(0.15);

  return (
    <section id="impact" ref={ref} className="relative py-28 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0f1a 0%, #0f1a0f 50%, #0a0f1a 100%)" }}>
      {/* Green glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.04] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease-out" }}>
          <span className="inline-block px-4 py-1 mb-4 text-xs font-semibold tracking-widest uppercase text-emerald-400 border border-emerald-400/20 rounded-full bg-emerald-400/5">
            Live Impact
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Real Impact, <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">Real Numbers</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: Map */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.06]"
            style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateX(0)" : "translateX(-40px)", transition: "all 0.8s ease-out 0.2s", height: "500px" }}>
            <ProjectMap projects={projects} height="500px" />
          </div>

          {/* Right: Stats */}
          <div className="space-y-6" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateX(0)" : "translateX(40px)", transition: "all 0.8s ease-out 0.4s" }}>
            {STATS.map((s, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-400/20 transition-all group">
                <div className="flex items-center gap-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{s.emoji}</span>
                  <div className="flex-1">
                    <div className="text-3xl md:text-4xl font-bold text-white tabular-nums">
                      <AnimCounter target={s.target} prefix={s.prefix || ""} suffix={s.suffix} active={isVisible} />
                    </div>
                    <div className="text-sm text-gray-500">{s.label}</div>
                    <ProgressBar pct={s.pct} active={isVisible} delay={i * 200} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TrustMarquee />
      </div>
    </section>
  );
}
