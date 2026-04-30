import { useState, useEffect, useRef } from "react";
import useScrollReveal from "../../hooks/useScrollReveal";

/* ── Animated form visual ── */
function FormVisual({ active }) {
  const [w1, setW1] = useState(0);
  const [w2, setW2] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t1 = setTimeout(() => setW1(100), 300);
    const t2 = setTimeout(() => setW2(100), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);
  return (
    <div className="space-y-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="h-3 rounded bg-emerald-500/20" style={{ width: `${w1}%`, transition: "width 1s ease" }} />
      <div className="h-3 rounded bg-emerald-500/15" style={{ width: `${w2}%`, transition: "width 1s ease" }} />
      <div className="flex gap-2 mt-2">
        <div className="h-6 w-16 rounded bg-emerald-500/30" style={{ opacity: w2 ? 1 : 0, transition: "opacity 0.5s" }} />
      </div>
    </div>
  );
}

/* ── Checklist visual ── */
function ChecklistVisual({ active }) {
  const [items, setItems] = useState([false, false, false]);
  useEffect(() => {
    if (!active) return;
    const timers = [
      setTimeout(() => setItems([true, false, false]), 400),
      setTimeout(() => setItems([true, true, false]), 900),
      setTimeout(() => setItems([true, true, true]), 1400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);
  return (
    <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      {["Satellite data ✓", "Field reports ✓", "AI analysis ✓"].map((t, i) => (
        <div key={i} className="flex items-center gap-2 transition-all duration-500"
          style={{ opacity: items[i] ? 1 : 0, transform: items[i] ? "translateX(0)" : "translateX(-10px)" }}>
          <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white">✓</span>
          <span className="text-xs text-emerald-300">{t}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Counter visual ── */
function WalletVisual({ active }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let c = 0;
    const iv = setInterval(() => { c += 3; setCount(Math.min(c, 47)); if (c >= 47) clearInterval(iv); }, 50);
    return () => clearInterval(iv);
  }, [active]);
  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
      <div className="text-2xl font-bold text-emerald-400 tabular-nums">{count} CC</div>
      <div className="text-[10px] text-gray-500">Credits earned</div>
    </div>
  );
}

/* ── Transaction visual ── */
function TransactionVisual({ active }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 1000);
    const t3 = setTimeout(() => setStep(3), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);
  return (
    <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="px-2 py-1 rounded bg-emerald-500/20 text-[10px] text-emerald-400 font-semibold"
        style={{ opacity: step >= 1 ? 1 : 0, transition: "opacity 0.3s" }}>Seller</div>
      <div className="text-emerald-400 text-sm" style={{ opacity: step >= 2 ? 1 : 0, transition: "opacity 0.3s" }}>→ 💰 →</div>
      <div className="px-2 py-1 rounded bg-sky-500/20 text-[10px] text-sky-400 font-semibold"
        style={{ opacity: step >= 3 ? 1 : 0, transition: "opacity 0.3s" }}>Buyer</div>
    </div>
  );
}

const ITEMS = [
  { num: "01", emoji: "📋", title: "Submit Your Project", body: "Upload tree plantation or soil project details. Takes 5 minutes.", Visual: FormVisual, side: "right" },
  { num: "02", emoji: "🤖", title: "AI Verifies Instantly", body: "Gemini AI cross-checks satellite data and field reports.", Visual: ChecklistVisual, side: "left" },
  { num: "03", emoji: "💳", title: "Credits Hit Your Wallet", body: "Verified carbon credits appear in your digital wallet immediately.", Visual: WalletVisual, side: "right" },
  { num: "04", emoji: "💰", title: "Sell to Companies", body: "List on marketplace. Companies buy. Money transfers instantly.", Visual: TransactionVisual, side: "left" },
];

export default function HowItWorks() {
  const { ref: sectionRef, isVisible: sectionVis } = useScrollReveal(0.1);
  const lineRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);

  // Scroll-driven green line
  useEffect(() => {
    if (!sectionVis) return;
    const handleScroll = () => {
      if (!lineRef.current) return;
      const rect = lineRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (rect.height + vh * 0.3)));
      setLineHeight(progress * 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionVis]);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative py-28 bg-gradient-to-b from-carbon via-forest/30 to-carbon overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20" style={{ opacity: sectionVis ? 1 : 0, transform: sectionVis ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease-out" }}>
          <span className="inline-block px-4 py-1 mb-4 text-xs font-semibold tracking-widest uppercase text-emerald-400 border border-emerald-400/20 rounded-full bg-emerald-400/5">
            How it Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">CarbonX</span> Works
          </h2>
        </div>

        {/* Timeline */}
        <div ref={lineRef} className="relative">
          {/* Vertical line container */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block">
            <div className="w-full bg-white/[0.06] h-full absolute" />
            <div className="w-full bg-gradient-to-b from-emerald-400 to-green-500 absolute top-0 rounded-full"
              style={{ height: `${lineHeight}%`, transition: "height 0.1s linear", boxShadow: "0 0 12px rgba(16,185,129,0.4)" }} />
          </div>

          {/* Timeline items */}
          <div className="space-y-20 md:space-y-28">
            {ITEMS.map((item, i) => (
              <TimelineItem key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ item, index }) {
  const { ref, isVisible } = useScrollReveal(0.2);
  const isRight = item.side === "right";
  const Visual = item.Visual;

  return (
    <div ref={ref} className={`relative flex items-center ${isRight ? "md:flex-row" : "md:flex-row-reverse"} flex-col md:gap-16 gap-6`}>
      {/* Center dot */}
      <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-carbon border-2 border-emerald-400 flex items-center justify-center z-10 hidden md:flex"
        style={{ boxShadow: isVisible ? "0 0 20px rgba(16,185,129,0.4)" : "none", transition: "box-shadow 0.5s" }}>
        <span className="text-lg">{item.emoji}</span>
      </div>

      {/* Content */}
      <div className={`flex-1 ${isRight ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateX(0)" : `translateX(${isRight ? "60px" : "-60px"})`,
          transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
        }}>
        {/* Background number */}
        <div className={`text-7xl md:text-8xl font-black text-white/[0.03] absolute ${isRight ? "right-0" : "left-0"} -top-6 pointer-events-none select-none hidden md:block`}>
          {item.num}
        </div>
        <div className="relative">
          <div className="md:hidden text-2xl mb-2">{item.emoji}</div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{item.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">{item.body}</p>
          <Visual active={isVisible} />
        </div>
      </div>

      {/* Spacer for other side */}
      <div className="flex-1 hidden md:block" />
    </div>
  );
}
