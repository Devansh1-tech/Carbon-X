import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  TreePine,
  Bot,
  Coins,
  Leaf,
  Users,
  Building2,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Globe,
  TrendingUp,
  Sprout,
  Award,
} from "lucide-react";

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

/* ── Floating particles (CSS-in-JS for dynamic positions) ── */
function Particles() {
  const dots = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 6,
    dur: Math.random() * 4 + 4,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-emerald-400/30"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            animation: `floatDot ${d.dur}s ease-in-out ${d.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════ NAVBAR ═══════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-carbon/80 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
            CarbonX
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
            How it Works
          </a>
          <Link to="/marketplace" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
            Marketplace
          </Link>
          <a href="#impact" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
            Impact
          </a>
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login?role=farmer"
            className="px-5 py-2 text-sm font-medium text-emerald-400 border border-emerald-400/30 rounded-full hover:bg-emerald-400/10 transition-all"
          >
            Login as Farmer
          </Link>
          <Link
            to="/login?role=company"
            className="px-5 py-2 text-sm font-medium text-carbon bg-gradient-to-r from-emerald-400 to-green-400 rounded-full hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all"
          >
            Login as Company
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-carbon/95 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex flex-col gap-4">
          <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-emerald-400 transition-colors">How it Works</a>
          <Link to="/marketplace" onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-emerald-400 transition-colors">Marketplace</Link>
          <a href="#impact" onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-emerald-400 transition-colors">Impact</a>
          <Link to="/login?role=farmer" className="text-center py-2 text-sm border border-emerald-400/30 rounded-full text-emerald-400">Login as Farmer</Link>
          <Link to="/login?role=company" className="text-center py-2 text-sm bg-gradient-to-r from-emerald-400 to-green-400 rounded-full text-carbon font-medium">Login as Company</Link>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════ HERO ═══════════════════ */
function Hero() {
  const counter = useCounter(12847, 3000);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-carbon via-forest to-carbon">
      <Particles />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-emerald-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          India's First AI Carbon Marketplace
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
          Turn{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">
            Green Actions
          </span>
          <br />
          Into Real Income
        </h1>

        {/* Sub */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          India's first AI-powered carbon credit marketplace for farmers, NGOs and companies.
          Earn from sustainability. Offset with confidence.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/login?role=farmer"
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-carbon font-semibold rounded-full text-lg hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300"
          >
            Start Earning Credits
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login?role=company"
            className="flex items-center gap-2 px-8 py-4 border border-emerald-400/30 text-emerald-400 font-semibold rounded-full text-lg hover:bg-emerald-400/10 hover:-translate-y-1 transition-all duration-300"
          >
            Offset My Emissions
          </Link>
        </div>

        {/* Live counter */}
        <div ref={counter.ref} className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <Globe className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="text-2xl font-bold text-white tabular-nums">
            {counter.value.toLocaleString()}
          </span>
          <span className="text-gray-400 text-sm">tons CO₂ offset today</span>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-carbon to-transparent pointer-events-none" />
    </section>
  );
}

/* ═══════════════════ HOW IT WORKS ═══════════════════ */
function HowItWorks() {
  const steps = [
    {
      icon: TreePine,
      title: "Submit Your Green Project",
      desc: "Upload details of your tree plantation, soil restoration, or renewable energy project.",
      step: "01",
    },
    {
      icon: Bot,
      title: "AI Verifies & Generates Credits",
      desc: "Our AI analyzes satellite data, soil reports, and imagery to validate and assign carbon credits.",
      step: "02",
    },
    {
      icon: Coins,
      title: "Sell Credits, Earn Income",
      desc: "List your verified credits on the marketplace. Companies buy them to offset their emissions.",
      step: "03",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-carbon">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 mb-4 text-xs font-semibold tracking-widest uppercase text-emerald-400 border border-emerald-400/20 rounded-full bg-emerald-400/5">
            How it Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Three Simple{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              Steps
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            From green action to real income — here's how the CarbonX platform works.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Dashed connector line */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] border-t-2 border-dashed border-emerald-400/20" />

          {steps.map((s, i) => (
            <div
              key={i}
              className="relative group bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] rounded-2xl p-8 text-center hover:border-emerald-400/30 hover:-translate-y-2 transition-all duration-300"
            >
              {/* Step number */}
              <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-carbon font-bold text-lg shadow-lg shadow-emerald-500/20 relative z-10">
                {s.step}
              </div>
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center group-hover:bg-emerald-400/15 transition-colors">
                <s.icon className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ STATS BAR ═══════════════════ */
function StatsBar() {
  const farmers = useCounter(2340);
  const projects = useCounter(890);
  const paidOut = useCounter(42);
  const co2 = useCounter(18000);

  const stats = [
    { ref: farmers.ref, value: `${farmers.value.toLocaleString()}+`, label: "Farmers Onboarded", icon: Users },
    { ref: projects.ref, value: `${projects.value.toLocaleString()}`, label: "Projects Verified", icon: ShieldCheck },
    { ref: paidOut.ref, value: `₹${paidOut.value} Cr`, label: "Paid Out", icon: TrendingUp },
    { ref: co2.ref, value: `${co2.value.toLocaleString()}`, label: "Tons CO₂ Saved", icon: Leaf },
  ];

  return (
    <section className="relative py-16 bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-emerald-500/10 border-y border-emerald-400/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} ref={s.ref} className="text-center group">
              <s.icon className="w-6 h-6 mx-auto mb-3 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 tabular-nums">
                {s.value}
              </div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ PARTICIPANTS ═══════════════════ */
function Participants() {
  const cards = [
    {
      icon: Sprout,
      title: "Farmers & NGOs",
      desc: "Submit green projects, get AI-verified, and earn carbon credits for your sustainable work.",
      accent: "from-emerald-500 to-green-500",
      border: "hover:border-emerald-400/40",
    },
    {
      icon: Building2,
      title: "Companies",
      desc: "Buy verified carbon credits to offset your emissions and meet sustainability goals with confidence.",
      accent: "from-sky-500 to-cyan-400",
      border: "hover:border-sky-400/40",
    },
    {
      icon: Award,
      title: "CarbonX Platform",
      desc: "AI-powered verification, blockchain-ready transparency, and a fair marketplace for everyone.",
      accent: "from-amber-400 to-yellow-400",
      border: "hover:border-amber-400/40",
    },
  ];

  return (
    <section className="py-24 bg-carbon">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 mb-4 text-xs font-semibold tracking-widest uppercase text-emerald-400 border border-emerald-400/20 rounded-full bg-emerald-400/5">
            Who It's For
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Built for{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              Every Stakeholder
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((c, i) => (
            <div
              key={i}
              className={`group relative bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] rounded-2xl p-8 ${c.border} hover:-translate-y-2 transition-all duration-300`}
            >
              <div className={`w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br ${c.accent} flex items-center justify-center shadow-lg`}>
                <c.icon className="w-7 h-7 text-carbon" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{c.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{c.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 group-hover:gap-2 transition-all">
                Learn more <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ IMPACT MAP ═══════════════════ */
function ImpactMap() {
  // CSS-only glowing dots representing project locations
  const dots = [
    { top: "30%", left: "35%", label: "MP" },
    { top: "45%", left: "28%", label: "Rajasthan" },
    { top: "50%", left: "42%", label: "Maharashtra" },
    { top: "60%", left: "50%", label: "Karnataka" },
    { top: "25%", left: "55%", label: "UP" },
    { top: "35%", left: "60%", label: "Bihar" },
    { top: "40%", left: "48%", label: "Chhattisgarh" },
    { top: "55%", left: "38%", label: "Gujarat" },
    { top: "20%", left: "40%", label: "Punjab" },
    { top: "70%", left: "44%", label: "Kerala" },
    { top: "65%", left: "52%", label: "Tamil Nadu" },
    { top: "45%", left: "65%", label: "Odisha" },
    { top: "50%", left: "72%", label: "West Bengal" },
    { top: "35%", left: "75%", label: "Assam" },
  ];

  return (
    <section id="impact" className="py-24 bg-gradient-to-b from-carbon to-forest">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 mb-4 text-xs font-semibold tracking-widest uppercase text-emerald-400 border border-emerald-400/20 rounded-full bg-emerald-400/5">
            Our Reach
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Impact Across{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              India
            </span>
          </h2>
        </div>

        {/* Map container */}
        <div className="relative max-w-3xl mx-auto aspect-[4/3] rounded-3xl border border-white/[0.06] bg-gradient-to-br from-forest/60 to-carbon/80 overflow-hidden">
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* India outline glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[85%] bg-emerald-500/5 rounded-[40%_60%_55%_45%/50%_40%_60%_50%] blur-[40px]" />

          {/* Dots */}
          {dots.map((dot, i) => (
            <div
              key={i}
              className="absolute group cursor-pointer"
              style={{ top: dot.top, left: dot.left }}
            >
              {/* Pulse ring */}
              <span
                className="absolute -inset-2 rounded-full bg-emerald-400/20 animate-ping"
                style={{ animationDelay: `${i * 0.3}s`, animationDuration: "3s" }}
              />
              {/* Dot */}
              <span className="relative block w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 group-hover:scale-150 transition-transform" />
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-carbon/90 text-emerald-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-emerald-400/20">
                {dot.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 mt-8 text-lg">
          Active projects across{" "}
          <span className="text-emerald-400 font-semibold">14 Indian states</span>
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════ FOOTER ═══════════════════ */
function Footer() {
  return (
    <footer className="py-10 bg-carbon border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
            CarbonX
          </span>
        </div>
        <p className="text-gray-600 text-sm">© 2025 CarbonX. All rights reserved.</p>
        <p className="text-gray-600 text-sm">
          Built for{" "}
          <span className="text-emerald-400">climate action</span> 🌍
        </p>
      </div>
    </footer>
  );
}

/* ═══════════════════ LANDING PAGE ═══════════════════ */
export default function LandingPage() {
  return (
    <div className="bg-carbon min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <StatsBar />
      <Participants />
      <ImpactMap />
      <Footer />

      {/* Global keyframes for floating dots */}
      <style>{`
        @keyframes floatDot {
          0%   { transform: translateY(0px) scale(1); opacity: 0.3; }
          100% { transform: translateY(-30px) scale(1.5); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
