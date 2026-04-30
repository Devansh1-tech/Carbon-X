import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowRight, Globe, Leaf, TrendingUp, Shield, Zap } from "lucide-react";

/* ── Animated counter hook ── */
function useCounter(target, duration = 2200) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

/* ── Typed text rotation effect ── */
function useTypedRotation(phrases, typingSpeed = 80, pauseMs = 2500) {
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timeout;

    if (!isDeleting && displayText === currentPhrase) {
      timeout = setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else {
      const speed = isDeleting ? typingSpeed / 2 : typingSpeed;
      timeout = setTimeout(() => {
        setDisplayText(
          isDeleting
            ? currentPhrase.substring(0, displayText.length - 1)
            : currentPhrase.substring(0, displayText.length + 1)
        );
      }, speed);
    }
    return () => clearTimeout(timeout);
  }, [displayText, phraseIndex, isDeleting, phrases, typingSpeed, pauseMs]);

  return displayText;
}

/* ── Enhanced floating particles ── */
function HeroParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 5 + 2,
        delay: Math.random() * 8,
        dur: Math.random() * 6 + 5,
        opacity: Math.random() * 0.4 + 0.1,
        glow: Math.random() > 0.7,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute rounded-full ${
            p.glow ? "bg-emerald-300" : "bg-emerald-400/30"
          }`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            filter: p.glow ? `blur(1px)` : "none",
            boxShadow: p.glow
              ? `0 0 ${p.size * 3}px rgba(52,211,153,0.4)`
              : "none",
            animation: `heroFloat ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Morphing gradient orbs ── */
function MorphingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: "700px",
          height: "700px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 50%, transparent 70%)",
          animation: "orbMorph 8s ease-in-out infinite",
        }}
      />
      {/* Secondary orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: "500px",
          height: "500px",
          top: "30%",
          left: "60%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 60%)",
          animation: "orbMorph2 10s ease-in-out 2s infinite",
        }}
      />
      {/* Accent orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: "350px",
          height: "350px",
          top: "70%",
          left: "30%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(6,214,160,0.05) 0%, transparent 60%)",
          animation: "orbMorph 12s ease-in-out 4s infinite reverse",
        }}
      />
    </div>
  );
}

/* ── Floating stat cards ── */
function FloatingStatCard({ icon: Icon, label, value, unit, delay, position }) {
  return (
    <div
      className="absolute hidden xl:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-xl z-[1]"
      style={{
        ...position,
        animation: `heroCardFloat 6s ease-in-out ${delay}s infinite alternate, heroCardEntry 1s ease-out ${delay}s both`,
      }}
    >
      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-emerald-400" />
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-base font-bold text-white">
          {value}
          <span className="text-emerald-400 text-sm ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}

/* ── Grid lines (subtle background texture) ── */
function GridBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        animation: "gridPulse 4s ease-in-out infinite",
      }}
    />
  );
}

/* ── Animated text reveal ── */
function RevealText({ children, delay = 0, className = "" }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <span
      ref={ref}
      className={`inline-block transition-all duration-700 ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        filter: visible ? "blur(0)" : "blur(4px)",
      }}
    >
      {children}
    </span>
  );
}

/* ═══════════════════ HERO SECTION ═══════════════════ */
export default function HeroSection({ onSignUpClick }) {
  const counter = useCounter(12847, 3000);
  const typedText = useTypedRotation([
    "Farmers",
    "NGOs",
    "Companies",
    "Communities",
    "India",
  ]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  /* Parallax mouse tracking */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePos({ x, y });
    };
    const el = heroRef.current;
    if (el) el.addEventListener("mousemove", handleMouseMove);
    return () => el?.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-carbon via-forest to-carbon"
    >
      {/* Background layers */}
      <GridBackground />
      <MorphingOrbs />
      <HeroParticles />

      {/* Radial glow that follows mouse slightly */}
      <div
        className="absolute w-[900px] h-[900px] rounded-full pointer-events-none transition-transform duration-[2000ms] ease-out"
        style={{
          top: "50%",
          left: "50%",
          transform: `translate(calc(-50% + ${mousePos.x * 30}px), calc(-50% + ${mousePos.y * 30}px))`,
          background:
            "radial-gradient(circle, rgba(16,185,129,0.07) 0%, rgba(16,185,129,0.02) 40%, transparent 70%)",
        }}
      />

      {/* Floating stat cards — positioned in extreme corners to avoid overlap */}
      <FloatingStatCard
        icon={Leaf}
        label="Credits Earned"
        value="2.4M"
        unit="tons"
        delay={0.8}
        position={{ top: "15%", left: "3%" }}
      />
      <FloatingStatCard
        icon={TrendingUp}
        label="Market Growth"
        value="+147"
        unit="%"
        delay={1.2}
        position={{ top: "12%", right: "3%" }}
      />
      <FloatingStatCard
        icon={Shield}
        label="Verified Projects"
        value="1,283"
        unit=""
        delay={1.6}
        position={{ bottom: "18%", left: "3%" }}
      />
      <FloatingStatCard
        icon={Zap}
        label="Avg. Payout"
        value="₹48K"
        unit="/mo"
        delay={2.0}
        position={{ bottom: "14%", right: "3%" }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-28 pb-8">
        {/* Animated badge */}
        <RevealText delay={200}>
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-emerald-400 text-sm font-medium hero-badge-glow">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            India's First AI Carbon Marketplace
          </div>
        </RevealText>

        {/* Headline with staggered reveal */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-6 tracking-tight" style={{ wordSpacing: '0.15em' }}>
          <RevealText delay={400}>Turn </RevealText>{" "}
          <RevealText delay={600}>
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent hero-gradient-animate">
                Green Actions
              </span>
              {/* Underline decoration */}
              <span
                className="absolute -bottom-2 left-0 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-green-400"
                style={{
                  animation: "heroUnderline 1.5s ease-out 1.2s both",
                  width: "0%",
                }}
              />
            </span>
          </RevealText>
          <br />
          <RevealText delay={800}>Into </RevealText>{" "}
          <RevealText delay={1000}>
            <span className="relative inline-block">
              Real Income
              {/* Sparkle accent */}
              <span
                className="absolute -top-3 -right-5 text-2xl"
                style={{ animation: "heroSparkle 2s ease-in-out 2s infinite" }}
              >
                ✦
              </span>
            </span>
          </RevealText>
        </h1>

        {/* Typed subtitle */}
        <RevealText delay={1200}>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            AI-powered carbon credit marketplace built for{" "}
            <span className="text-2xl md:text-3xl font-semibold">
              <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                {typedText}
              </span>
              <span className="animate-pulse text-emerald-400 ml-0.5">|</span>
            </span>
          </p>
        </RevealText>

        {/* CTAs with animated entrance */}
        <RevealText delay={1600}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onSignUpClick?.("farmer")}
              className="group relative flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-carbon font-semibold rounded-full text-lg overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300 btn-press"
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent hero-shimmer" />
              <span className="relative flex items-center gap-2">
                Start Earning Credits
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => onSignUpClick?.("company")}
              className="group flex items-center gap-2 px-8 py-4 border border-emerald-400/30 text-emerald-400 font-semibold rounded-full text-lg hover:bg-emerald-400/10 hover:border-emerald-400/50 hover:-translate-y-1 transition-all duration-300 btn-press"
            >
              Offset My Emissions
              <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>
          </div>
        </RevealText>

        {/* Live counter with enhanced animation */}
        <RevealText delay={1800}>
          <div className="mt-10">
            <div
              ref={counter.ref}
              className="inline-flex items-center gap-4 px-7 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md hover:bg-white/[0.06] transition-colors duration-300"
            >
              <div className="relative">
                <Globe className="w-6 h-6 text-emerald-400" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white tabular-nums tracking-tight">
                  {counter.value.toLocaleString()}
                </span>
                <span className="text-gray-400 text-sm">tons CO₂ offset today</span>
              </div>
            </div>
          </div>
        </RevealText>

        {/* Scroll indicator */}
        <div
          className="mt-10 flex flex-col items-center gap-2 text-gray-600"
          style={{ animation: "heroScrollBounce 2s ease-in-out 3s infinite" }}
        >
          <span className="text-xs uppercase tracking-[0.2em]">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-gray-600/40 flex items-start justify-center p-1">
            <div
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              style={{ animation: "heroScrollDot 2s ease-in-out infinite" }}
            />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-carbon to-transparent pointer-events-none" />
    </section>
  );
}
