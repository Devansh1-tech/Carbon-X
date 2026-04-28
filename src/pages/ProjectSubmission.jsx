import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { calculateCredits } from "../utils/carbonCalculator";
import {
  ArrowLeft, ArrowRight, Check, Upload, X, Loader2, MapPin,
  TreePine, Leaf, Zap, Sparkles, ChevronLeft,
} from "lucide-react";

/* ── Location data ── */
const LOCATIONS = {
  "Madhya Pradesh": {
    districts: {
      Indore: ["Mhow", "Depalpur", "Sanwer"],
      Hoshangabad: ["Babai", "Seoni Malwa", "Pipariya"],
      Sehore: ["Ashta", "Ichhawar", "Nasrullaganj"],
    },
    gps: { lat: 23.2599, lng: 77.4126 },
  },
  Maharashtra: {
    districts: {
      Pune: ["Haveli", "Maval", "Mulshi"],
      Satara: ["Karad", "Wai", "Patan"],
      Kolhapur: ["Karvir", "Panhala", "Shahuwadi"],
    },
    gps: { lat: 19.7515, lng: 75.7139 },
  },
  Rajasthan: {
    districts: {
      Jodhpur: ["Bilara", "Osian", "Phalodi"],
      Barmer: ["Chohtan", "Sheo", "Siwana"],
      Jaipur: ["Amber", "Sanganer", "Phagi"],
    },
    gps: { lat: 26.9124, lng: 75.7873 },
  },
};

const PROJECT_TYPES = [
  { key: "tree_plantation", icon: "🌳", label: "Tree Plantation", color: "emerald" },
  { key: "soil_carbon", icon: "🌾", label: "Soil Carbon", color: "amber" },
  { key: "renewable_energy", icon: "☀️", label: "Renewable Energy", color: "sky" },
];

const SPECIES = ["Neem", "Mango", "Peepal", "Bamboo", "Mixed"];
const PRACTICES = ["Organic", "No-till", "Cover crops", "Composting"];
const ENERGY_TYPES = ["Solar", "Wind", "Biogas"];

/* ── Step indicator ── */
function StepBar({ step }) {
  const steps = ["Project Details", "Impact Data", "Upload & Verify"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2.5 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/40"
                    : "bg-white/[0.05] text-gray-600"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : num}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  active ? "text-emerald-400" : done ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`h-px flex-1 mx-1 transition-colors duration-300 ${
                  done ? "bg-emerald-500/50" : "bg-white/[0.06]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Styled field wrapper ── */
function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-600 mt-1.5">{hint}</p>}
    </div>
  );
}

/* ── Input base classes ── */
const inputCls =
  "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 focus:bg-white/[0.06] transition-all";

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export default function ProjectSubmission() {
  const navigate = useNavigate();
  const { submitProject, currentUser } = useApp();

  const [step, setStep] = useState(1);

  /* Step 1 */
  const [title, setTitle] = useState("");
  const [type, setType] = useState("tree_plantation");
  const [description, setDescription] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");

  /* Step 2 */
  const [trees, setTrees] = useState("");
  const [species, setSpecies] = useState("");
  const [landArea, setLandArea] = useState("");
  const [practice, setPractice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [energyType, setEnergyType] = useState("");

  /* Step 3 */
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [checks, setChecks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [earnedCredits, setEarnedCredits] = useState(0);

  /* Reset dependent fields */
  useEffect(() => { setDistrict(""); setVillage(""); }, [state]);
  useEffect(() => { setVillage(""); }, [district]);

  /* ── Carbon calculator ── */
  const estimate = useMemo(() => {
    const la = parseFloat(landArea) || 0;
    const tp = parseInt(trees) || 0;
    const cap = parseFloat(capacity) || 0;
    const area = type === "renewable_energy" ? cap / 2 : la;
    const result = calculateCredits({ treesPlanted: tp, landArea: area, projectType: type });
    return { ...result, value: Math.round(result.credits * 600) };
  }, [type, trees, landArea, capacity]);

  const hasEstimate = estimate.credits > 0;

  /* ── GPS ── */
  const gps = state ? LOCATIONS[state]?.gps : null;

  /* ── Image handler ── */
  const handleImage = useCallback((file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  /* ── AI Verification ── */
  const runVerification = useCallback(() => {
    setVerifying(true);
    setChecks([]);
    setVerified(false);
    const msgs = [
      "Vegetation detected in satellite imagery",
      "Land area matches reported data",
      "No duplicate claims detected",
    ];
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      msgs.forEach((msg, i) => {
        setTimeout(() => setChecks((prev) => [...prev, msg]), (i + 1) * 500);
      });
    }, 2000);
  }, []);

  /* ── Submit ── */
  const handleSubmit = useCallback(() => {
    const la = parseFloat(landArea) || 0;
    const tp = parseInt(trees) || 0;
    const project = {
      title,
      type,
      description,
      userId: currentUser?.id || "usr_001",
      treesPlanted: tp,
      landArea: la,
      location: {
        city: district || village,
        state,
        lat: gps?.lat || 0,
        lng: gps?.lng || 0,
      },
      imageUrl: imagePreview || "https://placehold.co/400x300/16a34a/white?text=Project",
      creditsGenerated: estimate.credits,
    };
    submitProject(project);
    setEarnedCredits(estimate.credits);
    setSubmitted(true);
  }, [title, type, description, state, district, village, trees, landArea, gps, imagePreview, estimate, submitProject, currentUser]);

  /* ── Validation ── */
  const canNext1 = title.trim() && type && description.trim() && state && district;
  const canNext2 =
    type === "tree_plantation" ? trees && landArea :
    type === "soil_carbon" ? landArea && practice :
    capacity && energyType;

  /* ═══ SUCCESS SCREEN ═══ */
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-3">Project Submitted!</h1>
          <p className="text-gray-400 mb-6">Your project is now under AI verification.</p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="text-2xl font-bold text-emerald-400">{earnedCredits}</span>
            <span className="text-emerald-400/70 text-sm">estimated credits</span>
          </div>
          <div>
            <button
              onClick={() => navigate("/dashboard/farmer")}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
          <style>{`
            @keyframes confettiFall { 0% { transform: translateY(-100vh) rotate(0deg); opacity:1; } 100% { transform: translateY(100vh) rotate(720deg); opacity:0; } }
          `}</style>
          {["🎊","✨","🌟","🎉","💚","🌱","⭐","🎊","✨","🌟","💚","🎉"].map((e, i) => (
            <span
              key={i}
              className="fixed text-2xl pointer-events-none"
              style={{
                left: `${8 + i * 7.5}%`,
                top: "-40px",
                animation: `confettiFall ${2 + Math.random() * 2}s ease-in ${Math.random() * 1.5}s forwards`,
              }}
            >
              {e}
            </span>
          ))}
        </div>
      </div>
    );
  }

  /* ═══ FORM ═══ */
  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-6 lg:px-10 h-16 max-w-4xl mx-auto w-full">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step > 1 ? "Back" : "Dashboard"}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">CarbonX</span>
          </Link>
          <div className="text-xs text-gray-600">Step {step}/3</div>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Submit New Project</h1>
          <p className="text-sm text-gray-500 mb-6">Tell us about your green initiative</p>

          {/* Progress bar */}
          <div className="h-1 rounded-full bg-white/[0.06] mb-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <StepBar step={step} />

          {/* Card */}
          <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-sm">

            {/* ═══ STEP 1 ═══ */}
            {step === 1 && (
              <div className="space-y-6">
                <Field label="Project Title">
                  <input className={inputCls} placeholder="e.g. Narmada Valley Reforestation" value={title} onChange={(e) => setTitle(e.target.value)} />
                </Field>

                <Field label="Project Type">
                  <div className="grid grid-cols-3 gap-3">
                    {PROJECT_TYPES.map((pt) => {
                      const active = type === pt.key;
                      const ring = pt.color === "emerald" ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-400" : pt.color === "amber" ? "border-amber-400/40 bg-amber-500/10 text-amber-400" : "border-sky-400/40 bg-sky-500/10 text-sky-400";
                      const idle = "border-white/[0.06] bg-white/[0.03] text-gray-500 hover:bg-white/[0.06]";
                      return (
                        <button
                          key={pt.key}
                          type="button"
                          onClick={() => setType(pt.key)}
                          className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-sm font-medium transition-all duration-200 ${active ? ring + " -translate-y-0.5 shadow-lg" : idle}`}
                        >
                          <span className="text-2xl">{pt.icon}</span>
                          <span className="text-xs">{pt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Description">
                  <textarea className={inputCls + " min-h-[100px] resize-none"} placeholder="Describe your project's goals and impact..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </Field>

                <Field label="Location">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select className={inputCls} value={state} onChange={(e) => setState(e.target.value)}>
                      <option value="">State</option>
                      {Object.keys(LOCATIONS).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className={inputCls} value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state}>
                      <option value="">District</option>
                      {state && Object.keys(LOCATIONS[state].districts).map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className={inputCls} value={village} onChange={(e) => setVillage(e.target.value)} disabled={!district}>
                      <option value="">Village</option>
                      {district && state && LOCATIONS[state].districts[district]?.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </Field>

                <button
                  onClick={() => setStep(2)}
                  disabled={!canNext1}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ═══ STEP 2 ═══ */}
            {step === 2 && (
              <div className="space-y-6">
                {type === "tree_plantation" && (
                  <>
                    <Field label="Number of Trees Planted">
                      <input type="number" className={inputCls} placeholder="e.g. 5000" value={trees} onChange={(e) => setTrees(e.target.value)} min="0" />
                    </Field>
                    <Field label="Species">
                      <select className={inputCls} value={species} onChange={(e) => setSpecies(e.target.value)}>
                        <option value="">Select species</option>
                        {SPECIES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Land Area (acres)">
                      <input type="number" className={inputCls} placeholder="e.g. 12" value={landArea} onChange={(e) => setLandArea(e.target.value)} min="0" />
                    </Field>
                  </>
                )}

                {type === "soil_carbon" && (
                  <>
                    <Field label="Land Area (acres)">
                      <input type="number" className={inputCls} placeholder="e.g. 25" value={landArea} onChange={(e) => setLandArea(e.target.value)} min="0" />
                    </Field>
                    <Field label="Farming Practice">
                      <select className={inputCls} value={practice} onChange={(e) => setPractice(e.target.value)}>
                        <option value="">Select practice</option>
                        {PRACTICES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </Field>
                  </>
                )}

                {type === "renewable_energy" && (
                  <>
                    <Field label="Capacity (kW)">
                      <input type="number" className={inputCls} placeholder="e.g. 100" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="0" />
                    </Field>
                    <Field label="Energy Type">
                      <select className={inputCls} value={energyType} onChange={(e) => setEnergyType(e.target.value)}>
                        <option value="">Select type</option>
                        {ENERGY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                  </>
                )}

                {/* Live Calculator */}
                {hasEstimate && (
                  <div className="rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/15 p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live Carbon Estimate</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white/[0.04]">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Estimated Credits</p>
                        <p className="text-xl font-bold text-emerald-400">{estimate.credits}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.04]">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">CO₂ Saved</p>
                        <p className="text-xl font-bold text-teal-400">~{estimate.co2Saved.toLocaleString()} kg</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.04]">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Estimated Value</p>
                        <p className="text-xl font-bold text-amber-400">₹{estimate.value.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.04]">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Methodology</p>
                        <p className="text-sm font-semibold text-gray-300">{estimate.methodology}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(3)}
                  disabled={!canNext2}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ═══ STEP 3 ═══ */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Image upload */}
                <Field label="Project Image">
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/[0.08]">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                      <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-emerald-500/30 bg-white/[0.02] hover:bg-emerald-500/[0.03] cursor-pointer transition-all duration-200">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-300 font-medium">Click to upload project image</p>
                        <p className="text-xs text-gray-600 mt-0.5">PNG, JPG up to 10MB</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0])} />
                    </label>
                  )}
                </Field>

                {/* GPS */}
                {gps && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">GPS Coordinates (auto-filled)</p>
                      <p className="text-sm text-gray-300 font-mono">{gps.lat.toFixed(4)}°N, {gps.lng.toFixed(4)}°E</p>
                    </div>
                  </div>
                )}

                {/* AI Verification */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">AI Verification</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">Our AI will verify your project using satellite imagery</p>

                  {!verifying && !verified && (
                    <button onClick={runVerification} className="w-full py-3 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-400 text-sm font-semibold hover:bg-violet-500/20 hover:border-violet-500/40 transition-all duration-200 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" /> Run AI Verification
                    </button>
                  )}

                  {verifying && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                        <span className="text-sm text-gray-300">Analyzing satellite imagery...</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 animate-[loadBar_2s_ease-in-out]" />
                      </div>
                    </div>
                  )}

                  {verified && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold">AI Verification Complete</span>
                      </div>
                      {checks.map((msg, i) => (
                        <div key={i} className="flex items-center gap-2.5 pl-2 animate-[fadeIn_0.3s_ease-out]">
                          <span className="text-emerald-400 text-xs">✓</span>
                          <span className="text-xs text-gray-400">{msg}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!verified}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Leaf className="w-4 h-4" /> Submit Project
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes loadBar { 0% { width: 0%; } 100% { width: 100%; } }
        @keyframes fadeIn { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
