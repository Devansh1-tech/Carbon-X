import { useState, useEffect } from "react";
import useScrollReveal from "../../hooks/useScrollReveal";

const ROLES = [
  {
    key: "farmer", emoji: "🌾", label: "Farmer", tagline: "Your land, your income.",
    benefits: ["Earn credits from tree plantation & soil restoration", "AI verification in minutes, not months", "Direct payment to your bank account"],
    preview: "Ramesh planted 500 trees → Earned 47 CC → ₹28,500",
    shape: "bg-emerald-500/10", accent: "emerald",
  },
  {
    key: "ngo", emoji: "🌍", label: "NGO", tagline: "Scale your impact, transparently.",
    benefits: ["Bulk credit generation for large projects", "Transparent tracking for donors", "Real-time impact dashboards"],
    preview: "Forest India restored 10 acres → 120 CC → ₹72,000",
    shape: "bg-teal-500/10", accent: "emerald",
  },
  {
    key: "company", emoji: "🏢", label: "Company", tagline: "Meet your ESG goals faster.",
    benefits: ["Browse verified carbon credits marketplace", "Automated offset tracking & certificates", "ESG compliance reporting built-in"],
    preview: "Offset 500 tons CO₂ → 500 CC purchased → ESG Goal Met ✓",
    shape: "bg-sky-500/10", accent: "sky",
  },
  {
    key: "individual", emoji: "👤", label: "Individual", tagline: "Small steps, real change.",
    benefits: ["Plant trees from your phone", "Track your personal carbon footprint", "Earn from community green projects"],
    preview: "Planted 50 trees → 4.5 CC → ₹2,700",
    shape: "bg-purple-500/10", accent: "purple",
  },
];

export default function WhoIsItFor() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [checkItems, setCheckItems] = useState([false, false, false]);

  const switchRole = (idx) => {
    if (idx === active || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActive(idx);
      setCheckItems([false, false, false]);
      setTimeout(() => setAnimating(false), 50);
    }, 300);
  };

  // Animate checklist items on role change
  useEffect(() => {
    if (!isVisible) return;
    const timers = [
      setTimeout(() => setCheckItems([true, false, false]), 300),
      setTimeout(() => setCheckItems([true, true, false]), 600),
      setTimeout(() => setCheckItems([true, true, true]), 900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active, isVisible]);

  const role = ROLES[active];
  const accentColor = role.accent === "sky" ? "text-sky-400" : role.accent === "purple" ? "text-purple-400" : "text-emerald-400";
  const accentBg = role.accent === "sky" ? "bg-sky-500" : role.accent === "purple" ? "bg-purple-500" : "bg-emerald-500";

  return (
    <section ref={ref} className="relative py-28 bg-carbon overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-14" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease-out" }}>
          <span className="inline-block px-4 py-1 mb-4 text-xs font-semibold tracking-widest uppercase text-emerald-400 border border-emerald-400/20 rounded-full bg-emerald-400/5">
            Who It's For
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Built for <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">Everyone</span> in the Chain
          </h2>
        </div>

        {/* Tab buttons */}
        <div className="flex justify-center gap-2 md:gap-4 mb-12 flex-wrap"
          style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.6s ease 0.3s" }}>
          {ROLES.map((r, i) => (
            <button key={r.key} onClick={() => switchRole(i)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                active === i
                  ? "bg-white/[0.06] border-emerald-400/40 text-white shadow-lg shadow-emerald-500/10 -translate-y-0.5"
                  : "border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/[0.12]"
              }`}>
              <span className="text-lg">{r.emoji}</span>
              <span className="hidden sm:inline">{r.label}</span>
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className={`grid md:grid-cols-2 gap-10 items-center transition-all duration-300 ${animating ? "opacity-0 translate-x-[-20px]" : "opacity-100 translate-x-0"}`}>
          {/* Left: Illustration */}
          <div className="flex justify-center">
            <div className={`relative w-56 h-56 md:w-72 md:h-72 rounded-3xl ${role.shape} flex items-center justify-center border border-white/[0.06]`}>
              <span className="text-7xl md:text-8xl">{role.emoji}</span>
              {/* Decorative rings */}
              <div className="absolute inset-4 rounded-3xl border border-white/[0.04] animate-pulse" />
              <div className="absolute -inset-3 rounded-3xl border border-white/[0.02]" />
              {/* Glow */}
              <div className={`absolute inset-0 rounded-3xl ${accentBg}/5 blur-2xl`} />
            </div>
          </div>

          {/* Right: Info */}
          <div>
            <h3 className={`text-2xl md:text-3xl font-bold text-white mb-1`}>{role.label}</h3>
            <p className={`${accentColor} text-sm font-medium mb-6`}>{role.tagline}</p>

            {/* Animated checklist */}
            <div className="space-y-3 mb-6">
              {role.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3 transition-all duration-500"
                  style={{ opacity: checkItems[i] ? 1 : 0, transform: checkItems[i] ? "translateX(0)" : "translateX(-15px)" }}>
                  <div className={`w-5 h-5 mt-0.5 rounded-full ${accentBg} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-[10px] text-white font-bold">✓</span>
                  </div>
                  <span className="text-gray-300 text-sm">{b}</span>
                </div>
              ))}
            </div>

            {/* Earnings preview */}
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-6">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Earnings Preview</div>
              <p className={`text-sm font-semibold ${accentColor}`}>{role.preview}</p>
            </div>

            <button className={`px-6 py-3 rounded-xl ${accentBg} text-white font-semibold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5`}>
              Get Started as {role.label} →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
