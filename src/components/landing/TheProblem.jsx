import { useState, useEffect, useRef } from "react";
import useScrollReveal from "../../hooks/useScrollReveal";

/* ── Typewriter Effect ── */
function Typewriter({ text, speed = 50, trigger }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!trigger) return;
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [trigger, text, speed]);
  return <>{displayed}<span className="animate-pulse">|</span></>;
}

/* ── Connecting Arrows SVG ── */
function ConnectingArrows({ visible }) {
  return (
    <svg className="hidden md:block absolute top-1/2 left-0 w-full h-12 -translate-y-1/2 pointer-events-none" viewBox="0 0 1200 48" fill="none">
      <path d="M200 24 L400 24" stroke="#10b981" strokeWidth="2" strokeDasharray="8 4"
        style={{ strokeDashoffset: visible ? 0 : 200, transition: "stroke-dashoffset 1.2s ease-out 0.8s" }} />
      <polygon points="395,18 410,24 395,30" fill="#10b981"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease 1.6s" }} />
      <path d="M600 24 L800 24" stroke="#10b981" strokeWidth="2" strokeDasharray="8 4"
        style={{ strokeDashoffset: visible ? 0 : 200, transition: "stroke-dashoffset 1.2s ease-out 1.2s" }} />
      <polygon points="795,18 810,24 795,30" fill="#10b981"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease 2s" }} />
    </svg>
  );
}

const CARDS = [
  {
    emoji: "🌾", title: "Farmers Work, Others Profit",
    stat: "₹0 earned by 120M Indian farmers for carbon work annually",
    desc: "Farmers do the hard work of planting trees and restoring soil, but intermediaries capture all the value.",
    bg: "rgba(220,38,38,0.08)", border: "border-red-500/20", dir: "left", delay: "0s",
  },
  {
    emoji: "🐌", title: "Systems Too Slow",
    stat: "Average 18 months to verify one carbon project",
    desc: "Legacy verification systems are bureaucratic, expensive, and inaccessible for small-scale projects.",
    bg: "rgba(245,158,11,0.08)", border: "border-amber-500/20", dir: "bottom", delay: "0.2s",
  },
  {
    emoji: "🚧", title: "Inaccessible to Small Players",
    stat: "Minimum project size of 10,000 acres excludes 99% of farmers",
    desc: "High barriers to entry mean only large corporations can participate in carbon markets.",
    bg: "rgba(239,68,68,0.08)", border: "border-red-400/20", dir: "right", delay: "0.4s",
  },
];

export default function TheProblem() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const [allCardsIn, setAllCardsIn] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(() => setAllCardsIn(true), 1200);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  const getTransform = (dir, visible) => {
    if (visible) return "translate(0,0)";
    if (dir === "left") return "translate(-80px, 0)";
    if (dir === "right") return "translate(80px, 0)";
    return "translate(0, 60px)";
  };

  return (
    <section ref={ref} className="relative py-28 bg-carbon overflow-hidden">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease-out" }}>
          <span className="inline-block px-4 py-1 mb-4 text-xs font-semibold tracking-widest uppercase text-red-400 border border-red-400/20 rounded-full bg-red-400/5">
            The Problem
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Carbon Credits Are{" "}
            <span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">Broken Today</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg h-8">
            {isVisible && <Typewriter text="The system was never built for the people who matter most." trigger={isVisible} />}
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          <ConnectingArrows visible={allCardsIn} />

          {CARDS.map((card, i) => (
            <div key={i}
              className={`relative rounded-2xl p-7 border ${card.border} group hover:-translate-y-2 transition-all duration-500`}
              style={{
                background: card.bg,
                opacity: isVisible ? 1 : 0,
                transform: getTransform(card.dir, isVisible),
                transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${card.delay}`,
              }}>
              {/* Emoji icon */}
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{card.emoji}</div>
              <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
              {/* Stat highlight */}
              <div className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] mb-3">
                <p className="text-sm font-semibold text-red-300">{card.stat}</p>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              {/* Decorative corner glow */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ background: i === 1 ? "#f59e0b" : "#ef4444" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
