import { useState, useEffect, useCallback } from "react";
import useScrollReveal from "../../hooks/useScrollReveal";

const TESTIMONIALS = [
  {
    name: "Ramesh Kumar", role: "Farmer, MP", avatar: "🧑‍🌾",
    quote: "Maine pehle kabhi socha nahi tha ki mere khet se online income ho sakti hai.",
    stat: "Earned ₹42,000 last season", stars: 5,
  },
  {
    name: "Forest India NGO", role: "Maharashtra", avatar: "🌍",
    quote: "Verification jo pehle 2 saal lagti thi, ab 2 minute mein ho jaati hai.",
    stat: "Generated 1,200 credits", stars: 5,
  },
  {
    name: "GreenCorp Industries", role: "Gujarat", avatar: "🏢",
    quote: "CarbonX helped us hit our 2025 carbon neutrality target 8 months early.",
    stat: "Offset 5,000 tons", stars: 5,
  },
];

export default function Testimonials() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1); // 1=forward

  const goTo = useCallback((idx) => {
    setDir(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  // Auto-advance
  useEffect(() => {
    if (!isVisible || paused) return;
    const iv = setInterval(() => {
      setDir(1);
      setCurrent(prev => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(iv);
  }, [isVisible, paused]);

  const t = TESTIMONIALS[current];

  return (
    <section ref={ref} className="relative py-28 bg-carbon overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-14" style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease-out" }}>
          <span className="inline-block px-4 py-1 mb-4 text-xs font-semibold tracking-widest uppercase text-emerald-400 border border-emerald-400/20 rounded-full bg-emerald-400/5">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            What Our <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">Users</span> Say
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="max-w-2xl mx-auto">
            <div key={current} className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] text-center"
              style={{ animation: `testimonialIn 0.5s ease-out` }}>
              {/* Avatar */}
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-500/15 border-2 border-emerald-400/30 flex items-center justify-center">
                <span className="text-3xl">{t.avatar}</span>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: t.stars }, (_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">⭐</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-lg md:text-xl text-gray-200 italic leading-relaxed mb-5 font-light">
                "{t.quote}"
              </p>

              {/* Stat */}
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5">
                <span className="text-emerald-400 text-sm font-semibold">{t.stat}</span>
              </div>

              {/* Author */}
              <div>
                <div className="text-white font-semibold">{t.name}</div>
                <div className="text-gray-500 text-sm">{t.role}</div>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === current ? "bg-emerald-400 w-8" : "bg-white/[0.15] hover:bg-white/[0.3]"
                }`}
                aria-label={`Go to testimonial ${i + 1}`} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes testimonialIn {
          0% { opacity: 0; transform: scale(0.92) translateX(${dir > 0 ? "30px" : "-30px"}); }
          100% { opacity: 1; transform: scale(1) translateX(0); }
        }
      `}</style>
    </section>
  );
}
