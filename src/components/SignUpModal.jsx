import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { mockUsers } from "../data/mockUsers";
import { Eye, EyeOff, X, Loader2, ChevronRight, Check } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const INDUSTRIES = ["Technology","Manufacturing","Energy","Finance","Healthcare","Automotive","Construction","Agriculture","Retail","Other"];
const COMPANY_SIZES = ["1-50","51-200","200-1000","1000+"];

const ROLES = [
  { key: "farmer", emoji: "🌾", label: "Farmer", desc: "Submit green projects, earn credits", color: "emerald" },
  { key: "ngo", emoji: "🌍", label: "NGO / Organization", desc: "Environmental projects, bulk credits", color: "emerald" },
  { key: "company", emoji: "🏢", label: "Company", desc: "Buy credits, offset emissions", color: "sky" },
  { key: "individual", emoji: "👤", label: "Individual", desc: "Small projects, community green work", color: "purple" },
];

/* ── Floating Particles ── */
function Particles() {
  const dots = Array.from({ length: 20 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 2, delay: Math.random() * 6, dur: Math.random() * 4 + 4,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map(d => (
        <span key={d.id} className="absolute rounded-full bg-emerald-400/25"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size,
            animation: `floatDot ${d.dur}s ease-in-out ${d.delay}s infinite alternate` }} />
      ))}
    </div>
  );
}

/* ── Animated Credit Card ── */
function CreditCard() {
  const [rot, setRot] = useState(0);
  useEffect(() => {
    let frame;
    const animate = () => { setRot(prev => prev + 0.3); frame = requestAnimationFrame(animate); };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex justify-center mb-6" style={{ perspective: "800px" }}>
      <div className="w-72 h-44 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #10b981 50%, #047857 100%)",
          transform: `rotateY(${Math.sin(rot * 0.02) * 12}deg) rotateX(${Math.cos(rot * 0.015) * 4}deg)`,
          transformStyle: "preserve-3d", boxShadow: "0 20px 60px rgba(16,185,129,0.3)",
        }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-emerald-200/80 text-[10px] font-semibold tracking-widest uppercase">CarbonX Wallet</span>
            <span className="text-lg">🌱</span>
          </div>
          <div className="text-3xl font-bold text-white mt-2">247 <span className="text-sm font-normal text-emerald-200">CC</span></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="text-white text-sm font-semibold">Ramesh Kumar</div>
            <div className="text-emerald-200/60 text-[10px]">Farmer • MP</div>
          </div>
          <span className="text-2xl">🌾</span>
        </div>
      </div>
    </div>
  );
}

/* ── Animated Stat Pills ── */
function StatPills() {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setVisible(1), 400),
      setTimeout(() => setVisible(2), 800),
      setTimeout(() => setVisible(3), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const pills = [
    { emoji: "🌳", text: "Save CO₂" },
    { emoji: "💰", text: "Earn Income" },
    { emoji: "🌍", text: "Help Planet" },
  ];

  return (
    <div className="flex justify-center gap-2 mb-6">
      {pills.map((p, i) => (
        <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-500"
          style={{
            opacity: visible > i ? 1 : 0, transform: visible > i ? "translateY(0)" : "translateY(10px)",
            background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.2)", color: "#6ee7b7",
          }}>
          {p.emoji} {p.text}
        </span>
      ))}
    </div>
  );
}

/* ── Floating Label Input ── */
function FloatingInput({ id, label, type = "text", value, onChange, required = true, ...props }) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value;

  return (
    <div className="relative">
      <input id={id} type={type} value={value} onChange={onChange} required={required}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full px-4 pt-5 pb-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-emerald-400/50 focus:bg-white/[0.06] transition-all peer"
        placeholder=" " {...props} />
      <label htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          isActive ? "top-1.5 text-[10px] text-emerald-400 font-semibold" : "top-3.5 text-sm text-gray-500"
        }`}>
        {label}
      </label>
    </div>
  );
}

/* ── Floating Label Select ── */
function FloatingSelect({ id, label, value, onChange, options, required = true }) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={onChange} required={required}
        className="w-full px-4 pt-5 pb-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-emerald-400/50 focus:bg-white/[0.06] transition-all appearance-none">
        <option value="" disabled className="bg-[#1a1e2e]">Select...</option>
        {options.map(o => <option key={o} value={o} className="bg-[#1a1e2e]">{o}</option>)}
      </select>
      <label htmlFor={id} className="absolute left-4 top-1.5 text-[10px] text-emerald-400 font-semibold pointer-events-none">
        {label}
      </label>
      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rotate-90 pointer-events-none" />
    </div>
  );
}

/* ── Password Input ── */
function PasswordInput({ id, label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <FloatingInput id={id} label={label} type={show ? "text" : "password"} value={value} onChange={onChange} />
      <button type="button" onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors z-10"
        aria-label={show ? "Hide" : "Show"}>
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

/* ── Animated Checkmark SVG ── */
function AnimatedCheckmark() {
  return (
    <div className="flex justify-center mb-4">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#10b981" strokeWidth="3" opacity="0.2" />
        <circle cx="40" cy="40" r="36" fill="none" stroke="#10b981" strokeWidth="3"
          strokeDasharray="226" strokeDashoffset="226" strokeLinecap="round"
          style={{ animation: "checkCircleDraw 0.6s ease-out 0.2s forwards" }} />
        <path d="M24 42 L35 53 L56 28" fill="none" stroke="#34d399" strokeWidth="4"
          strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60"
          style={{ animation: "checkDraw 0.4s ease-out 0.7s forwards" }} />
      </svg>
    </div>
  );
}

/* ── Progress Bar ── */
function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3].map(s => (
        <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
          <div className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: s <= step ? "100%" : "0%",
              background: s <= step ? "linear-gradient(90deg, #10b981, #34d399)" : "transparent",
            }} />
        </div>
      ))}
      <span className="text-[10px] text-gray-500 ml-1 whitespace-nowrap">Step {step} of 3</span>
    </div>
  );
}

/* ═══════════════════ MAIN MODAL ═══════════════════ */
export default function SignUpModal({ isOpen, onClose, onSwitchToLogin, preselectedRole }) {
  const navigate = useNavigate();
  const { login, addNotification } = useApp();
  const modalRef = useRef(null);

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(preselectedRole || "");
  const [slideDir, setSlideDir] = useState("right");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [gst, setGst] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedRole(preselectedRole || "");
      setName(""); setEmail(""); setPhone(""); setState("");
      setPassword(""); setCompanyName(""); setIndustry("");
      setCompanySize(""); setGst(""); setAgreed(false);
      setLoading(false); setDone(false); setSlideDir("right");
    }
  }, [isOpen, preselectedRole]);

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
    const focusable = modalRef.current.querySelectorAll('button, input, select, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
  }, [isOpen, step]);

  const goNext = useCallback(() => {
    setSlideDir("right");
    setStep(s => s + 1);
  }, []);

  const goBack = useCallback(() => {
    setSlideDir("left");
    setStep(s => s - 1);
  }, []);

  const isCompany = selectedRole === "company";

  const handleCreate = () => {
    setLoading(true);
    setTimeout(() => {
      // Use a demo user for login based on role
      const roleMap = { farmer: "ramesh.patel@gmail.com", ngo: "contact@greenearthfdn.org",
        company: "sustainability@tatasteel.com", individual: "ramesh.patel@gmail.com" };
      login(roleMap[selectedRole] || roleMap.farmer, "demo123");
      setLoading(false);
      setDone(true);
      addNotification({ message: "🎉 Welcome to CarbonX!", type: "success" });
      setTimeout(() => { onClose(); navigate("/onboarding"); }, 1500);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" style={{ animation: "modalBdIn 0.3s ease-out" }} />
      <Particles />

      {/* Modal */}
      <div ref={modalRef} className="relative z-10 w-[95vw] max-w-[850px] max-h-[90vh] overflow-y-auto rounded-3xl border border-white/[0.08]"
        style={{
          background: "linear-gradient(135deg, rgba(26,26,46,0.97) 0%, rgba(15,15,30,0.98) 100%)",
          backdropFilter: "blur(40px)", animation: "modalScaleIn 0.35s ease-out",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 80px rgba(16,185,129,0.08)",
        }}>
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.12] transition-all"
          aria-label="Close"><X className="w-4 h-4" /></button>

        <div className="flex flex-col md:flex-row min-h-[520px]">
          {/* ──── LEFT PANEL ──── */}
          <div className="hidden md:flex md:w-[40%] flex-col justify-center p-8 border-r border-white/[0.06] bg-gradient-to-b from-emerald-500/[0.03] to-transparent">
            <CreditCard />
            <StatPills />
            <div className="mt-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <p className="text-emerald-100/80 text-xs italic leading-relaxed mb-3">
                "Earned ₹14,000 last season just from tree plantation credits"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">🧑‍🌾</div>
                <div>
                  <div className="text-white text-[11px] font-semibold">Suresh Patel</div>
                  <div className="text-gray-500 text-[10px]">Farmer, Madhya Pradesh</div>
                </div>
              </div>
            </div>
          </div>

          {/* ──── RIGHT PANEL ──── */}
          <div className="flex-1 p-6 md:p-8 overflow-hidden">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">
                {step === 1 ? "Join CarbonX" : step === 2 ? "Your Details" : done ? "Welcome! 🎉" : "Confirm & Create"}
              </h2>
              {step === 1 && <p className="text-gray-500 text-sm mt-1">Choose how you'll use CarbonX</p>}
            </div>

            {step > 1 && <ProgressBar step={step} />}

            {/* ── STEP 1: Role Selection ── */}
            <div style={{ display: step === 1 ? "block" : "none" }}>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {ROLES.map(role => {
                  const active = selectedRole === role.key;
                  const borderColor = role.color === "sky" ? "border-sky-400/50" : role.color === "purple" ? "border-purple-400/50" : "border-emerald-400/50";
                  const bgColor = role.color === "sky" ? "bg-sky-500/10" : role.color === "purple" ? "bg-purple-500/10" : "bg-emerald-500/10";

                  return (
                    <button key={role.key} type="button" onClick={() => setSelectedRole(role.key)}
                      className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 text-center group ${
                        active ? `${borderColor} ${bgColor} scale-[1.02]` : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]"
                      }`}>
                      {active && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                          style={{ animation: "modalScaleIn 0.2s ease-out" }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-3xl">{role.emoji}</span>
                      <span className={`text-sm font-semibold ${active ? "text-white" : "text-gray-300"}`}>{role.label}</span>
                      <span className="text-[11px] text-gray-500 leading-snug">{role.desc}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ opacity: selectedRole ? 1 : 0, transform: selectedRole ? "translateY(0)" : "translateY(10px)", transition: "all 0.3s ease" }}>
                <button onClick={goNext} disabled={!selectedRole}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-carbon font-semibold text-sm hover:shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-30">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── STEP 2: Details ── */}
            <div style={{ display: step === 2 ? "block" : "none", animation: step === 2 ? `slideStep${slideDir === "right" ? "Right" : "Left"} 0.35s ease-out` : "none" }}>
              <div className="space-y-4 mb-6">
                {isCompany ? (
                  <>
                    <FloatingInput id="su-company" label="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                    <FloatingInput id="su-email" label="Company Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    <FloatingSelect id="su-industry" label="Industry" value={industry} onChange={e => setIndustry(e.target.value)} options={INDUSTRIES} />
                    <FloatingSelect id="su-size" label="Company Size" value={companySize} onChange={e => setCompanySize(e.target.value)} options={COMPANY_SIZES} />
                    <FloatingInput id="su-gst" label="GST Number (optional)" value={gst} onChange={e => setGst(e.target.value)} required={false} />
                    <PasswordInput id="su-pass" label="Password" value={password} onChange={e => setPassword(e.target.value)} />
                  </>
                ) : (
                  <>
                    <FloatingInput id="su-name" label="Full Name" value={name} onChange={e => setName(e.target.value)} />
                    <FloatingInput id="su-email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    <FloatingInput id="su-phone" label="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                    <FloatingSelect id="su-state" label="State" value={state} onChange={e => setState(e.target.value)} options={INDIAN_STATES} />
                    <PasswordInput id="su-pass" label="Password" value={password} onChange={e => setPassword(e.target.value)} />
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={goBack}
                  className="px-5 py-3 rounded-xl border border-white/[0.08] text-gray-400 text-sm font-medium hover:bg-white/[0.05] transition-all">
                  Back
                </button>
                <button onClick={goNext}
                  disabled={isCompany ? (!companyName || !email || !password) : (!name || !email || !password)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-carbon font-semibold text-sm hover:shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-30">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── STEP 3: Confirm ── */}
            <div style={{ display: step === 3 ? "block" : "none", animation: step === 3 ? `slideStep${slideDir === "right" ? "Right" : "Left"} 0.35s ease-out` : "none" }}>
              {done ? (
                <div className="text-center py-8">
                  <AnimatedCheckmark />
                  <h3 className="text-2xl font-bold text-white mb-2">Welcome to CarbonX!</h3>
                  <p className="text-gray-400 text-sm">Redirecting to onboarding...</p>
                </div>
              ) : (
                <>
                  <AnimatedCheckmark />

                  {/* Summary card */}
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        {ROLES.find(r => r.key === selectedRole)?.emoji} {ROLES.find(r => r.key === selectedRole)?.label}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="text-white">{isCompany ? companyName : name}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-white">{email}</span></div>
                      {!isCompany && state && <div className="flex justify-between"><span className="text-gray-500">State</span><span className="text-white">{state}</span></div>}
                      {isCompany && industry && <div className="flex justify-between"><span className="text-gray-500">Industry</span><span className="text-white">{industry}</span></div>}
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                    <div className={`w-5 h-5 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                      agreed ? "bg-emerald-500 border-emerald-500" : "border-white/[0.15] group-hover:border-white/[0.3]"
                    }`} onClick={() => setAgreed(!agreed)}>
                      {agreed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-gray-400 text-xs leading-relaxed" onClick={() => setAgreed(!agreed)}>
                      I agree to CarbonX <span className="text-emerald-400">Terms of Service</span> and <span className="text-emerald-400">Carbon Credit Guidelines</span>
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <button onClick={goBack}
                      className="px-5 py-3 rounded-xl border border-white/[0.08] text-gray-400 text-sm font-medium hover:bg-white/[0.05] transition-all">
                      Back
                    </button>
                    <button onClick={handleCreate} disabled={!agreed || loading}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-carbon font-semibold text-sm hover:shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-30">
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <>Create My Account 🌱</>}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Bottom link */}
            {!done && (
              <p className="text-center text-gray-600 text-xs mt-6">
                Already have an account?{" "}
                <button onClick={() => { onClose(); onSwitchToLogin?.(); }}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                  Login →
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalScaleIn { 0% { transform: scale(0.92); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes modalBdIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slideStepRight { 0% { opacity: 0; transform: translateX(30px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes slideStepLeft { 0% { opacity: 0; transform: translateX(-30px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes checkCircleDraw { to { stroke-dashoffset: 0; } }
        @keyframes checkDraw { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}
