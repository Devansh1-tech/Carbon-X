import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SignUpModal from "../components/SignUpModal";
import LoginModal from "../components/LoginModal";
import { mockProjects } from "../data/mockProjects";

/* ── New animated sections ── */
import TheProblem from "../components/landing/TheProblem";
import HowItWorksTimeline from "../components/landing/HowItWorksTimeline";
import WhoIsItFor from "../components/landing/WhoIsItFor";
import LiveImpact from "../components/landing/LiveImpact";
import Testimonials from "../components/landing/Testimonials";
import FinalCTA from "../components/landing/FinalCTA";

import { ArrowRight, Globe } from "lucide-react";

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

/* ── Floating particles ── */
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
function Navbar({ onLoginClick, onSignUpClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
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
          <button
            onClick={onLoginClick}
            className="px-5 py-2 text-sm font-medium text-emerald-400 border border-emerald-400/30 rounded-full hover:bg-emerald-400/10 transition-all"
          >
            Login
          </button>
          <button
            onClick={onSignUpClick}
            className="px-6 py-2.5 text-sm font-semibold text-carbon bg-gradient-to-r from-emerald-400 to-green-400 rounded-full hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all"
            style={{ boxShadow: "0 0 20px rgba(16,185,129,0.15)" }}
          >
            Sign Up Free
          </button>
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
          <button onClick={() => { setMobileOpen(false); onLoginClick?.(); }} className="text-center py-2 text-sm border border-emerald-400/30 rounded-full text-emerald-400">Login</button>
          <button onClick={() => { setMobileOpen(false); onSignUpClick?.(); }} className="text-center py-2 text-sm bg-gradient-to-r from-emerald-400 to-green-400 rounded-full text-carbon font-medium">Sign Up Free</button>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════ HERO ═══════════════════ */
function Hero({ onSignUpClick }) {
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
          <button
            onClick={() => onSignUpClick?.("farmer")}
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-carbon font-semibold rounded-full text-lg hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300"
          >
            Start Earning Credits
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onSignUpClick?.("company")}
            className="flex items-center gap-2 px-8 py-4 border border-emerald-400/30 text-emerald-400 font-semibold rounded-full text-lg hover:bg-emerald-400/10 hover:-translate-y-1 transition-all duration-300"
          >
            Offset My Emissions
          </button>
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
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [signUpPreRole, setSignUpPreRole] = useState("");

  const openSignUp = (role = "") => { setSignUpPreRole(role); setShowSignUp(true); };
  const openLogin = () => setShowLogin(true);

  return (
    <div className="bg-carbon min-h-screen">
      <Navbar onLoginClick={openLogin} onSignUpClick={() => openSignUp()} />
      <Hero onSignUpClick={openSignUp} />

      {/* ── Animated Storytelling Sections ── */}
      <TheProblem />
      <HowItWorksTimeline />
      <WhoIsItFor />
      <LiveImpact projects={mockProjects} />
      <Testimonials />
      <FinalCTA onSignUp={openSignUp} />

      <Footer />

      {/* Auth Modals */}
      <SignUpModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToLogin={() => setShowLogin(true)}
        preselectedRole={signUpPreRole}
      />
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToSignUp={() => openSignUp()}
      />

      {/* Global keyframes */}
      <style>{`
        @keyframes floatDot {
          0%   { transform: translateY(0px) scale(1); opacity: 0.3; }
          100% { transform: translateY(-30px) scale(1.5); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

