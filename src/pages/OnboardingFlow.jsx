import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { calculateCredits } from "../utils/carbonCalculator";
import {
  INDIAN_STATES, FARMER_AVATARS, COMPANY_AVATARS, FARMER_ACTIVITIES,
  COMPANY_INDUSTRIES, TARGET_YEARS, PROJECT_TYPES, TUTORIAL_STEPS,
} from "../data/onboardingData";

const PRICE_PER_CREDIT = 608;

/* ═══ CONFETTI ═══ */
function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    bg: ["#10b981","#06d6a0","#34d399","#fbbf24","#f472b6","#818cf8","#38bdf8","#fb923c"][i % 8],
    size: Math.random() * 8 + 4,
    delay: Math.random() * 2,
    dur: Math.random() * 2 + 2,
  })), []);
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div key={p.id} className="absolute rounded-sm" style={{
          left: p.left, top: -20, width: p.size, height: p.size * 1.5,
          backgroundColor: p.bg,
          animation: `confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}

/* ═══ PROGRESS BAR ═══ */
function ProgressBar({ step, total }) {
  return (
    <div className="flex items-center gap-2 w-full max-w-md mx-auto mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
          <div className={`h-full rounded-full transition-all duration-500 ${i <= step ? "bg-gradient-to-r from-emerald-500 to-green-400" : ""}`}
            style={{ width: i <= step ? "100%" : "0%" }} />
        </div>
      ))}
      <span className="text-[10px] text-gray-500 font-semibold ml-1">{step + 1}/{total}</span>
    </div>
  );
}

/* ═══ STEP 1: WELCOME ═══ */
function StepWelcome({ name, onNext }) {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="text-8xl mb-6" style={{ animation: "bounceIn 0.8s ease-out" }}>🌱</div>
      <h1 className="text-4xl font-bold text-white mb-3">
        Welcome to <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">CarbonX</span>, {name}!
      </h1>
      <p className="text-gray-400 text-lg mb-10 max-w-md">Let's set up your profile in 4 quick steps</p>
      <button onClick={onNext}
        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-2">
        Get Started <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ═══ STEP 2: PROFILE SETUP ═══ */
function StepProfile({ role, profile, setProfile }) {
  const isFarmer = role === "farmer" || role === "ngo";
  const states = Object.keys(INDIAN_STATES);
  const districts = profile.state ? INDIAN_STATES[profile.state] || [] : [];
  const avatars = isFarmer ? FARMER_AVATARS : COMPANY_AVATARS;

  return (
    <div className="max-w-lg mx-auto space-y-6" style={{ animation: "stepSlideIn 0.4s ease-out" }}>
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-white">Set Up Your Profile</h2>
        <p className="text-gray-500 text-sm mt-1">{isFarmer ? "Tell us about your farm" : "Tell us about your company"}</p>
      </div>

      {/* Avatar selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Choose an Avatar</label>
        <div className="grid grid-cols-6 gap-2">
          {avatars.map(a => (
            <button key={a} onClick={() => setProfile(p => ({ ...p, avatar: a }))}
              className={`text-2xl p-2.5 rounded-xl border transition-all ${profile.avatar === a ? "bg-emerald-500/15 border-emerald-400/40 scale-110" : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">State</label>
          <select value={profile.state || ""} onChange={e => setProfile(p => ({ ...p, state: e.target.value, district: "" }))}
            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-emerald-400/50">
            <option value="">Select State</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">District</label>
          <select value={profile.district || ""} onChange={e => setProfile(p => ({ ...p, district: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-emerald-400/50">
            <option value="">Select District</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {isFarmer ? (
        <>
          {/* Farm size slider */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Farm Size: <span className="text-emerald-400">{profile.farmSize || 50} acres</span>
            </label>
            <input type="range" min="1" max="500" value={profile.farmSize || 50}
              onChange={e => setProfile(p => ({ ...p, farmSize: +e.target.value }))}
              className="w-full accent-emerald-500" />
            <div className="flex justify-between text-[10px] text-gray-600"><span>1 acre</span><span>500 acres</span></div>
          </div>
          {/* Primary activity */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Primary Activity</label>
            <div className="grid grid-cols-2 gap-2">
              {FARMER_ACTIVITIES.map(a => (
                <button key={a.key} onClick={() => setProfile(p => ({ ...p, activity: a.key }))}
                  className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-left transition-all ${profile.activity === a.key ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-400" : "bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.06]"}`}>
                  <span className="text-xl">{a.emoji}</span>
                  <span className="text-sm font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Industry type */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Industry Type</label>
            <select value={profile.industry || ""} onChange={e => setProfile(p => ({ ...p, industry: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-emerald-400/50">
              <option value="">Select Industry</option>
              {COMPANY_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          {/* Emissions slider */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Annual Emissions: <span className="text-emerald-400">{(profile.emissions || 5000).toLocaleString()} tons CO₂</span>
            </label>
            <input type="range" min="100" max="50000" step="100" value={profile.emissions || 5000}
              onChange={e => setProfile(p => ({ ...p, emissions: +e.target.value }))}
              className="w-full accent-emerald-500" />
            <div className="flex justify-between text-[10px] text-gray-600"><span>100 tons</span><span>50,000 tons</span></div>
          </div>
          {/* Target year */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Carbon Neutrality Target</label>
            <div className="flex gap-2">
              {TARGET_YEARS.map(y => (
                <button key={y} onClick={() => setProfile(p => ({ ...p, targetYear: y }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${profile.targetYear === y ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-400" : "bg-white/[0.03] border-white/[0.06] text-gray-500 hover:bg-white/[0.06]"}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══ STEP 3: TUTORIAL ═══ */
function StepTutorial() {
  const [highlight, setHighlight] = useState(0);
  const step = TUTORIAL_STEPS[highlight];
  return (
    <div className="max-w-lg mx-auto" style={{ animation: "stepSlideIn 0.4s ease-out" }}>
      <h2 className="text-2xl font-bold text-white text-center mb-2">Quick Platform Tour</h2>
      <p className="text-gray-500 text-sm text-center mb-8">Learn the essentials in 3 quick steps</p>

      {/* Highlight card */}
      <div className="relative p-8 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center"
        style={{ animation: "highlightPulse 2s ease-in-out infinite" }}>
        <div className="text-5xl mb-4" style={{ animation: "floatUp 3s ease-in-out infinite" }}>{step.emoji}</div>
        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {TUTORIAL_STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === highlight ? "bg-emerald-400 w-6" : "bg-white/10"}`} />
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        {highlight < TUTORIAL_STEPS.length - 1 ? (
          <button onClick={() => setHighlight(h => h + 1)}
            className="px-6 py-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/25 transition-all flex items-center gap-2">
            Next Tip <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <Check className="w-4 h-4" /> Tour complete! Continue below.
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ STEP 4: GOALS ═══ */
function StepGoals({ role, goals, setGoals }) {
  const isFarmer = role === "farmer" || role === "ngo";

  const trees = goals.trees || 500;
  const calc = calculateCredits({ treesPlanted: trees, landArea: 10, projectType: "tree_plantation" });
  const income = Math.round(calc.credits * PRICE_PER_CREDIT);

  return (
    <div className="max-w-lg mx-auto space-y-6" style={{ animation: "stepSlideIn 0.4s ease-out" }}>
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-white">Set Your Goals</h2>
        <p className="text-gray-500 text-sm mt-1">{isFarmer ? "Plan your green impact" : "Plan your offset strategy"}</p>
      </div>

      {isFarmer ? (
        <>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Trees to plant this year: <span className="text-emerald-400">{trees.toLocaleString()}</span>
            </label>
            <input type="range" min="10" max="10000" step="10" value={trees}
              onChange={e => setGoals(g => ({ ...g, trees: +e.target.value }))} className="w-full accent-emerald-500" />
            <div className="flex justify-between text-[10px] text-gray-600"><span>10</span><span>10,000</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Target Credits</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{calc.credits}</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Estimated Income</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">₹{income.toLocaleString()}</p>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-500/[0.08] to-green-500/[0.04] border border-emerald-500/15">
            <p className="text-sm text-gray-300">🌍 <strong className="text-white">Your Impact:</strong> You could save <span className="text-emerald-400 font-bold">{(calc.co2Saved / 1000).toFixed(1)} tons</span> CO₂ and earn <span className="text-amber-400 font-bold">₹{income.toLocaleString()}</span></p>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Monthly Budget: <span className="text-emerald-400">₹{(goals.budget || 100000).toLocaleString()}</span>
            </label>
            <input type="range" min="10000" max="1000000" step="10000" value={goals.budget || 100000}
              onChange={e => setGoals(g => ({ ...g, budget: +e.target.value }))} className="w-full accent-emerald-500" />
            <div className="flex justify-between text-[10px] text-gray-600"><span>₹10K</span><span>₹10L</span></div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Offset Target: <span className="text-emerald-400">{goals.offsetPct || 30}%</span> of emissions
            </label>
            <input type="range" min="5" max="100" value={goals.offsetPct || 30}
              onChange={e => setGoals(g => ({ ...g, offsetPct: +e.target.value }))} className="w-full accent-emerald-500" />
            <div className="flex justify-between text-[10px] text-gray-600"><span>5%</span><span>100%</span></div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Preferred Project Types</label>
            <div className="grid grid-cols-2 gap-2">
              {PROJECT_TYPES.map(pt => {
                const sel = (goals.projectTypes || []).includes(pt);
                return (
                  <button key={pt} onClick={() => setGoals(g => {
                    const cur = g.projectTypes || [];
                    return { ...g, projectTypes: sel ? cur.filter(x => x !== pt) : [...cur, pt] };
                  })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${sel ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-400" : "bg-white/[0.03] border-white/[0.06] text-gray-500 hover:bg-white/[0.06]"}`}>
                    {sel ? "✓ " : ""}{pt}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══ STEP 5: ALL DONE ═══ */
function StepDone({ profile, goals, role, onFinish }) {
  const isFarmer = role === "farmer" || role === "ngo";
  return (
    <div className="max-w-lg mx-auto text-center" style={{ animation: "stepSlideIn 0.4s ease-out" }}>
      <Confetti />
      <div className="text-6xl mb-4" style={{ animation: "bounceIn 0.6s ease-out" }}>🎉</div>
      <h2 className="text-3xl font-bold text-white mb-2">You're All Set!</h2>
      <p className="text-gray-400 mb-8">Your profile is ready. Here's a summary:</p>

      <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-left space-y-3 mb-8">
        {profile.avatar && <div className="flex items-center gap-3"><span className="text-gray-500 text-xs w-24">Avatar</span><span className="text-2xl">{profile.avatar}</span></div>}
        {profile.state && <div className="flex items-center gap-3"><span className="text-gray-500 text-xs w-24">Location</span><span className="text-sm text-white">{profile.district}, {profile.state}</span></div>}
        {isFarmer && profile.farmSize && <div className="flex items-center gap-3"><span className="text-gray-500 text-xs w-24">Farm Size</span><span className="text-sm text-white">{profile.farmSize} acres</span></div>}
        {isFarmer && profile.activity && <div className="flex items-center gap-3"><span className="text-gray-500 text-xs w-24">Activity</span><span className="text-sm text-white capitalize">{profile.activity.replace("_", " ")}</span></div>}
        {!isFarmer && profile.industry && <div className="flex items-center gap-3"><span className="text-gray-500 text-xs w-24">Industry</span><span className="text-sm text-white">{profile.industry}</span></div>}
        {!isFarmer && profile.emissions && <div className="flex items-center gap-3"><span className="text-gray-500 text-xs w-24">Emissions</span><span className="text-sm text-white">{profile.emissions.toLocaleString()} tons/yr</span></div>}
        {isFarmer && goals.trees && <div className="flex items-center gap-3"><span className="text-gray-500 text-xs w-24">Tree Goal</span><span className="text-sm text-emerald-400 font-semibold">{goals.trees.toLocaleString()} trees</span></div>}
        {!isFarmer && goals.budget && <div className="flex items-center gap-3"><span className="text-gray-500 text-xs w-24">Budget</span><span className="text-sm text-emerald-400 font-semibold">₹{goals.budget.toLocaleString()}/mo</span></div>}
      </div>

      <button onClick={onFinish}
        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-2 mx-auto">
        Go to Dashboard <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ═══ MAIN ONBOARDING FLOW ═══ */
export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { currentUser, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({});
  const [goals, setGoals] = useState({});

  const user = currentUser || { name: "User", role: "farmer" };
  const role = user.role;
  const name = user.name?.split(" ")[0] || "User";

  const goNext = () => setStep(s => Math.min(s + 1, 4));
  const goBack = () => setStep(s => Math.max(s - 1, 0));

  const handleFinish = () => {
    completeOnboarding({ ...profile, ...goals });
    const path = (role === "farmer" || role === "ngo") ? "/dashboard/farmer"
      : role === "company" ? "/dashboard/company" : "/dashboard/admin";
    navigate(path, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">CarbonX</span>
        </div>
        {step > 0 && step < 4 && (
          <button onClick={() => { completeOnboarding({}); const p = (role === "farmer" || role === "ngo") ? "/dashboard/farmer" : role === "company" ? "/dashboard/company" : "/dashboard/admin"; navigate(p, { replace: true }); }}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Skip onboarding →</button>
        )}
      </header>

      {/* Progress */}
      <div className="px-8"><ProgressBar step={step} total={5} /></div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          {step === 0 && <StepWelcome name={name} onNext={goNext} />}
          {step === 1 && <StepProfile role={role} profile={profile} setProfile={setProfile} />}
          {step === 2 && <StepTutorial />}
          {step === 3 && <StepGoals role={role} goals={goals} setGoals={setGoals} />}
          {step === 4 && <StepDone profile={profile} goals={goals} role={role} onFinish={handleFinish} />}
        </div>
      </main>

      {/* Footer nav — steps 1–3 */}
      {step >= 1 && step <= 3 && (
        <footer className="px-8 py-5 flex items-center justify-between border-t border-white/[0.04]">
          <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={goNext}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      )}
    </div>
  );
}
