import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { mockUsers } from "../data/mockUsers";
import { Eye, EyeOff, X, Loader2, Leaf } from "lucide-react";

const DEMO_PASSWORD = "demo123";

function getRedirectPath(role, isNewUser) {
  if (isNewUser) return "/onboarding";
  if (role === "farmer" || role === "ngo") return "/dashboard/farmer";
  if (role === "company") return "/dashboard/company";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/farmer";
}

export default function LoginModal({ isOpen, onClose, onSwitchToSignUp }) {
  const navigate = useNavigate();
  const { login, currentUser, isNewUser, addNotification } = useApp();
  const modalRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset on open
  useEffect(() => {
    if (isOpen) { setEmail(""); setPassword(DEMO_PASSWORD); setError(""); setLoading(false); }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
  }, [isOpen]);

  const handleLogin = useCallback((overrideEmail, overridePassword) => {
    const finalEmail = overrideEmail || email;
    const finalPassword = overridePassword || password;

    const user = mockUsers.find(u => u.email === finalEmail && u.password === finalPassword);
    if (!user) { setError("Invalid credentials. Check email and password."); return; }

    setError("");
    setLoading(true);

    setTimeout(() => {
      login(finalEmail, finalPassword);
      const matchedUser = mockUsers.find(u => u.email === finalEmail && u.password === finalPassword);
      setLoading(false);
      onClose();
      navigate(getRedirectPath(matchedUser?.role, matchedUser?.isNewUser), { replace: true });
    }, 1200);
  }, [email, password, login, navigate, onClose]);

  const handleQuickLogin = useCallback((roleKey) => {
    const roleEmails = {
      farmer: "ramesh.patel@gmail.com",
      company: "sustainability@tatasteel.com",
      admin: "admin@carbonx.io",
    };
    const em = roleEmails[roleKey];
    if (!em) return;
    setEmail(em);
    setPassword(DEMO_PASSWORD);
    setTimeout(() => handleLogin(em, DEMO_PASSWORD), 300);
  }, [handleLogin]);

  const handleForgot = () => {
    addNotification({ message: "📧 Password reset link sent — demo mode", type: "info" });
  };

  const onSubmit = (e) => { e.preventDefault(); handleLogin(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" style={{ animation: "lmBdIn 0.3s ease-out" }} />

      {/* Modal */}
      <div ref={modalRef} className="relative z-10 w-[95vw] max-w-[480px] rounded-3xl border border-white/[0.08] p-8"
        style={{
          background: "linear-gradient(135deg, rgba(26,26,46,0.97), rgba(15,15,30,0.98))",
          backdropFilter: "blur(40px)", animation: "lmScaleIn 0.35s ease-out",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 60px rgba(16,185,129,0.06)",
        }}>
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.12] transition-all"
          aria-label="Close"><X className="w-4 h-4" /></button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">CarbonX</span>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
        <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
            <X className="w-3.5 h-3.5 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="lm-email" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
            <input id="lm-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 focus:bg-white/[0.06] transition-all"
              placeholder="you@example.com" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="lm-pass" className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <button type="button" onClick={handleForgot} className="text-[10px] text-emerald-400/70 hover:text-emerald-400 transition-colors">Forgot Password?</button>
            </div>
            <div className="relative">
              <input id="lm-pass" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 focus:bg-white/[0.06] transition-all"
                placeholder="••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPassword ? "Hide" : "Show"}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-carbon font-semibold text-sm hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <><Leaf className="w-4 h-4" /> Login</>}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">Quick Demo Login</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Demo buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "farmer", label: "Farmer", emoji: "🌾", accent: "emerald" },
            { key: "company", label: "Company", emoji: "🏢", accent: "sky" },
            { key: "admin", label: "Admin", emoji: "⚙️", accent: "amber" },
          ].map(d => (
            <button key={d.key} type="button" disabled={loading} onClick={() => handleQuickLogin(d.key)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium border transition-all disabled:opacity-40 ${
                d.accent === "emerald" ? "border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10" :
                d.accent === "sky" ? "border-sky-400/20 text-sky-400 hover:bg-sky-400/10" :
                "border-amber-400/20 text-amber-400 hover:bg-amber-400/10"
              }`}>
              <span className="text-base">{d.emoji}</span>
              <span>{d.label} Demo</span>
            </button>
          ))}
        </div>

        {/* Switch to Sign Up */}
        <p className="text-center text-gray-600 text-xs mt-6">
          New here?{" "}
          <button onClick={() => { onClose(); onSwitchToSignUp?.(); }}
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Sign Up Free →
          </button>
        </p>
      </div>

      <style>{`
        @keyframes lmScaleIn { 0% { transform: scale(0.92); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes lmBdIn { 0% { opacity: 0; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}
