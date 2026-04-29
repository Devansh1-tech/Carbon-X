import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { mockUsers } from "../data/mockUsers";
import { Leaf, Eye, EyeOff, Loader2, X, ChevronRight, ShieldCheck, TrendingUp, Globe } from "lucide-react";

/* ── Role config ── */
const ROLES = [
  { key: "farmer",  emoji: "🌾", label: "Farmer",  defaultEmail: "ramesh.patel@gmail.com" },
  { key: "company", emoji: "🏢", label: "Company", defaultEmail: "sustainability@tatasteel.com" },
  { key: "ngo",     emoji: "🌍", label: "NGO",     defaultEmail: "contact@greenearthfdn.org" },
  { key: "admin",   emoji: "⚙️", label: "Admin",   defaultEmail: "admin@carbonx.io" },
];

const DEMO_PASSWORD = "demo123";

/* ── Redirect helper ── */
function getRedirectPath(role, isNewUser) {
  if (isNewUser) return "/onboarding";
  if (role === "farmer" || role === "ngo") return "/dashboard/farmer";
  if (role === "company") return "/dashboard/company";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/farmer";
}

/* ── Floating particles for left panel ── */
function Particles() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
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
          className="absolute rounded-full bg-white/20"
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

/* ── Error Toast ── */
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[100] animate-[slideIn_0.35s_ease-out]">
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-red-500/15 border border-red-500/30 backdrop-blur-xl shadow-2xl shadow-red-900/20">
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <X className="w-4 h-4 text-red-400" />
        </div>
        <span className="text-red-300 text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-red-400/60 hover:text-red-300 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Loading Overlay ── */
function LoadingOverlay({ role }) {
  return (
    <div className="fixed inset-0 z-[90] bg-carbon/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-5 p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full bg-emerald-400/20 animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg">Authenticating...</p>
          <p className="text-gray-400 text-sm mt-1">
            Signing in as {role ? ROLES.find((r) => r.key === role)?.label || role : "user"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ LOGIN PAGE ═══════════════════ */
export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, currentUser, isNewUser } = useApp();

  /* ── State ── */
  const [selectedRole, setSelectedRole] = useState("farmer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── Read ?role= from URL ── */
  useEffect(() => {
    const urlRole = searchParams.get("role");
    if (urlRole && ROLES.some((r) => r.key === urlRole)) {
      setSelectedRole(urlRole);
    }
  }, [searchParams]);

  /* ── Update email when role changes ── */
  useEffect(() => {
    const roleConfig = ROLES.find((r) => r.key === selectedRole);
    if (roleConfig) setEmail(roleConfig.defaultEmail);
  }, [selectedRole]);

  /* ── Redirect if already logged in ── */
  useEffect(() => {
    if (currentUser && !loading) {
      navigate(getRedirectPath(currentUser.role, isNewUser), { replace: true });
    }
  }, [currentUser, navigate, loading, isNewUser]);

  /* ── Login handler ── */
  const handleLogin = useCallback(
    (overrideEmail, overridePassword, overrideRole) => {
      const finalEmail = overrideEmail || email;
      const finalPassword = overridePassword || password;
      const finalRole = overrideRole || selectedRole;

      /* Validate */
      const user = mockUsers.find(
        (u) => u.email === finalEmail && u.password === finalPassword
      );

      if (!user) {
        setError("Invalid credentials. Please check your email and password.");
        return;
      }

      setError("");
      setLoading(true);

      /* Fake auth delay */
      setTimeout(() => {
        login(finalEmail, finalPassword);
        setTimeout(() => {
          setLoading(false);
          /* Check if this user is new by looking up the mock data */
          const matchedUser = mockUsers.find(
            (u) => u.email === finalEmail && u.password === finalPassword
          );
          const userIsNew = matchedUser?.isNewUser || false;
          navigate(getRedirectPath(finalRole, userIsNew), { replace: true });
        }, 200);
      }, 1500);
    },
    [email, password, selectedRole, login, navigate]
  );

  /* ── Quick demo login ── */
  const handleQuickLogin = useCallback(
    (roleKey) => {
      const roleConfig = ROLES.find((r) => r.key === roleKey);
      if (!roleConfig) return;

      setSelectedRole(roleKey);
      setEmail(roleConfig.defaultEmail);
      setPassword(DEMO_PASSWORD);

      setTimeout(() => {
        handleLogin(roleConfig.defaultEmail, DEMO_PASSWORD, roleKey);
      }, 1000);
    },
    [handleLogin]
  );

  /* ── Form submit ── */
  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  /* ── Stats for left panel ── */
  const panelStats = [
    { icon: ShieldCheck, value: "890+", label: "Verified Projects" },
    { icon: TrendingUp, value: "₹42 Cr", label: "Paid to Farmers" },
    { icon: Globe, value: "14", label: "States Covered" },
  ];

  return (
    <div className="min-h-screen flex bg-carbon">
      {/* ════════════ LEFT PANEL ════════════ */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-800" />
        {/* Overlay pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "30px 30px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-300/10 rounded-full blur-[100px]" />

        <Particles />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo + Tagline */}
          <div>
            <Link to="/" className="flex items-center gap-3 group mb-2">
              <span className="text-3xl">🌱</span>
              <span className="text-2xl font-bold text-white">CarbonX</span>
            </Link>
            <p className="text-emerald-100/70 text-sm ml-1">
              India's First AI Carbon Credit Marketplace
            </p>
          </div>

          {/* Middle — Benefit bullets */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-6">
                Earn from your
                <br />
                <span className="text-emerald-200">green initiatives</span>
              </h2>
              <ul className="space-y-4">
                {[
                  "AI-powered verification of your carbon offset projects",
                  "Transparent marketplace connecting farmers & companies",
                  "Direct income from verified carbon credits",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />
                    </div>
                    <span className="text-emerald-50/90 text-sm leading-relaxed">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats row */}
            <div className="flex gap-6">
              {panelStats.map((s, i) => (
                <div
                  key={i}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
                >
                  <s.icon className="w-4 h-4 text-emerald-200 mb-1.5" />
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-emerald-100/60 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-yellow-300 text-sm">
                  ★
                </span>
              ))}
            </div>
            <p className="text-emerald-50/90 text-sm leading-relaxed italic mb-4">
              "CarbonX helped me earn ₹45,000 from my tree plantation project.
              The verification was quick and the money went straight to my
              account. This platform is changing lives in rural India."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-300/20 flex items-center justify-center text-lg">
                👨‍🌾
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Ramesh Patel</p>
                <p className="text-emerald-100/60 text-xs">
                  Farmer, Indore, Madhya Pradesh
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════ RIGHT PANEL ════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              CarbonX
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          {/* ── FORM CARD ── */}
          <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Role selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  I am a
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ROLES.map((role) => {
                    const isActive = selectedRole === role.key;
                    return (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => setSelectedRole(role.key)}
                        className={`
                          flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200
                          ${
                            isActive
                              ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-400 shadow-lg shadow-emerald-500/10 -translate-y-0.5"
                              : "bg-white/[0.03] border-white/[0.06] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300"
                          }
                          border
                        `}
                        id={`role-btn-${role.key}`}
                      >
                        <span className="text-lg">{role.emoji}</span>
                        <span>{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 focus:bg-white/[0.06] transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 focus:bg-white/[0.06] transition-all"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                id="login-submit-btn"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-carbon font-semibold text-sm hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Leaf className="w-4 h-4" />
                    Login
                  </>
                )}
              </button>
            </form>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">
                Quick Demo Login
              </span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* ── Quick Demo Buttons ── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "farmer",  label: "Farmer",  emoji: "🌾", accent: "emerald" },
                { key: "company", label: "Company", emoji: "🏢", accent: "sky" },
                { key: "admin",   label: "Admin",   emoji: "⚙️", accent: "amber" },
              ].map((demo) => (
                <button
                  key={demo.key}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin(demo.key)}
                  id={`quick-login-${demo.key}`}
                  className={`
                    flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium
                    border transition-all duration-200
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${
                      demo.accent === "emerald"
                        ? "border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/40"
                        : demo.accent === "sky"
                        ? "border-sky-400/20 text-sky-400 hover:bg-sky-400/10 hover:border-sky-400/40"
                        : "border-amber-400/20 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/40"
                    }
                  `}
                >
                  <span className="text-base">{demo.emoji}</span>
                  <span>Login as {demo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-gray-600 text-xs mt-6">
            Demo mode — no real authentication required.
            <br />
            All accounts use password:{" "}
            <code className="text-emerald-400/70 bg-emerald-400/5 px-1.5 py-0.5 rounded">
              demo123
            </code>
          </p>
        </div>
      </div>

      {/* ── Loading Overlay ── */}
      {loading && <LoadingOverlay role={selectedRole} />}

      {/* ── Error Toast ── */}
      {error && <Toast message={error} onClose={() => setError("")} />}

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes floatDot {
          0%   { transform: translateY(0px) scale(1); opacity: 0.2; }
          100% { transform: translateY(-25px) scale(1.4); opacity: 0.6; }
        }
        @keyframes slideIn {
          0%   { transform: translateX(100%) translateY(-10px); opacity: 0; }
          100% { transform: translateX(0) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
