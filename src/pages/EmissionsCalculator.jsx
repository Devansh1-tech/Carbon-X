import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  ArrowLeft, Check, Printer, ChevronRight, Zap, Fuel, Plane, Car, TrainFront,
  Factory, Trash2, Users, Building2,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine, Legend,
} from "recharts";

/* ══════════════ CONSTANTS ══════════════ */

const INDUSTRIES = [
  { id: "manufacturing", label: "Manufacturing", emoji: "🏭" },
  { id: "aviation", label: "Aviation", emoji: "✈️" },
  { id: "transport", label: "Transport & Logistics", emoji: "🚛" },
  { id: "energy", label: "Energy & Utilities", emoji: "⚡" },
  { id: "it", label: "IT & Services", emoji: "🏢" },
  { id: "construction", label: "Construction", emoji: "🏗️" },
  { id: "retail", label: "Retail & FMCG", emoji: "🛒" },
  { id: "hospitality", label: "Hospitality", emoji: "🏨" },
];

const EMISSION_SOURCES = [
  { id: "electricity", label: "Electricity Consumption", icon: Zap, unit: "kWh / month", factor: 0.82, color: "#fbbf24" },
  { id: "fuel", label: "Fuel (Diesel/Petrol)", icon: Fuel, unit: "liters / month", factor: 2.68, color: "#f87171" },
  { id: "flight", label: "Business Travel (Flight)", icon: Plane, unit: "km / month", factor: 0.255, color: "#818cf8" },
  { id: "car", label: "Business Travel (Car)", icon: Car, unit: "km / month", factor: 0.171, color: "#38bdf8" },
  { id: "train", label: "Business Travel (Train)", icon: TrainFront, unit: "km / month", factor: 0.041, color: "#34d399" },
  { id: "manufacturing", label: "Manufacturing Process", icon: Factory, unit: "tons product / month", factor: null, color: "#fb923c" },
  { id: "waste", label: "Waste Generated", icon: Trash2, unit: "tons / month", factor: 500, color: "#a78bfa" },
  { id: "commute", label: "Employee Commute", icon: Users, unit: "number of employees", factor: null, color: "#f472b6" },
];

/* Manufacturing emission factors by industry (kgCO₂ per ton of product) */
const MFG_FACTORS = {
  manufacturing: 1800, aviation: 2200, transport: 900, energy: 2500,
  it: 150, construction: 1400, retail: 400, hospitality: 300,
};

/* Industry benchmark data (tons CO₂ / year) */
const BENCHMARKS = {
  manufacturing: { avg: 12000, best: 5000 }, aviation: { avg: 25000, best: 10000 },
  transport: { avg: 8000, best: 3000 }, energy: { avg: 18000, best: 7000 },
  it: { avg: 2000, best: 600 }, construction: { avg: 10000, best: 4000 },
  retail: { avg: 4000, best: 1500 }, hospitality: { avg: 3000, best: 1000 },
};

const PIE_COLORS = ["#fbbf24", "#f87171", "#818cf8", "#38bdf8", "#34d399", "#fb923c", "#a78bfa", "#f472b6"];
const PRICE_PER_CREDIT = 608;

/* ══════════════ CHART TOOLTIP ══════════════ */
function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2235] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl">
      <p className="text-sm font-semibold" style={{ color: payload[0]?.payload?.fill || payload[0]?.color || "#fff" }}>
        {payload[0].name}: {payload[0].value?.toLocaleString()} {payload[0].unit || ""}
      </p>
    </div>
  );
}

function BarTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2235] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.fill || p.color }}>{p.name}: {p.value?.toLocaleString()} t</p>
      ))}
    </div>
  );
}

/* ══════════════ PIE LABEL ══════════════ */
function renderLabel({ name, percent }) {
  if (percent < 0.05) return null;
  return `${name} ${(percent * 100).toFixed(0)}%`;
}

/* ══════════════ MAIN COMPONENT ══════════════ */
export default function EmissionsCalculator() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [industry, setIndustry] = useState("");
  const [sources, setSources] = useState({});
  const [values, setValues] = useState({});

  const toggleSource = (id) => {
    setSources(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id]) setValues(v => { const n = { ...v }; delete n[id]; return n; });
      return next;
    });
  };

  const updateValue = (id, val) => {
    setValues(prev => ({ ...prev, [id]: parseFloat(val) || 0 }));
  };

  /* ── Live calculations ── */
  const breakdown = useMemo(() => {
    return EMISSION_SOURCES.filter(s => sources[s.id] && values[s.id] > 0).map(s => {
      let kgCO2 = 0;
      if (s.id === "manufacturing") {
        kgCO2 = (values[s.id] || 0) * (MFG_FACTORS[industry] || 500);
      } else if (s.id === "commute") {
        kgCO2 = (values[s.id] || 0) * 4.6 * 22; // 4.6 kgCO₂/day/employee × 22 workdays
      } else {
        kgCO2 = (values[s.id] || 0) * s.factor;
      }
      return { name: s.label.split(" (")[0].split(" ").slice(0, 2).join(" "), kgCO2, color: s.color, fill: s.color };
    });
  }, [sources, values, industry]);

  const monthlyTons = useMemo(() => breakdown.reduce((sum, b) => sum + b.kgCO2, 0) / 1000, [breakdown]);
  const annualTons = monthlyTons * 12;

  const pieData = useMemo(() => breakdown.filter(b => b.kgCO2 > 0).map(b => ({ ...b, value: Math.round(b.kgCO2) })), [breakdown]);

  /* ── Benchmark comparison ── */
  const bench = BENCHMARKS[industry] || { avg: 5000, best: 2000 };
  const comparisonData = [
    { name: "Your Emissions", value: Math.round(annualTons), fill: "#ef4444" },
    { name: "Industry Avg", value: bench.avg, fill: "#6b7280" },
    { name: "Industry Best", value: bench.best, fill: "#10b981" },
  ];
  const targetLine = Math.round(annualTons * 0.5);

  /* ── Offset packages ── */
  const packages = [
    { name: "Basic", emoji: "🌱", pct: 50, desc: "Offset 50%", color: "emerald" },
    { name: "Standard", emoji: "🌿", pct: 100, desc: "Offset 100% — Carbon Neutral", color: "sky" },
    { name: "Premium", emoji: "👑", pct: 150, desc: "Offset 150% — Carbon Negative!", color: "amber" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117]" id="emissions-report">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.04] print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/company" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <div className="w-px h-6 bg-white/[0.06]" />
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-400" />
              <h1 className="text-xl font-bold text-white">Emissions Calculator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ═══ SECTION 1: INDUSTRY SELECTOR ═══ */}
        <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
          <h2 className="text-lg font-bold text-white mb-1">Select Your Industry</h2>
          <p className="text-sm text-gray-500 mb-5">Choose the closest match to your business</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {INDUSTRIES.map(ind => (
              <button key={ind.id} onClick={() => setIndustry(ind.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center group ${
                  industry === ind.id
                    ? "border-sky-400/50 bg-sky-500/10 shadow-lg shadow-sky-500/5"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]"
                }`}>
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{ind.emoji}</span>
                <span className={`text-xs font-semibold ${industry === ind.id ? "text-sky-400" : "text-gray-400"}`}>{ind.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 1b: EMISSION SOURCES ═══ */}
        <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
          <h2 className="text-lg font-bold text-white mb-1">Emission Sources</h2>
          <p className="text-sm text-gray-500 mb-5">Select sources and enter your monthly data</p>
          <div className="space-y-3">
            {EMISSION_SOURCES.map(src => {
              const Icon = src.icon;
              const active = sources[src.id];
              return (
                <div key={src.id} className={`rounded-xl border transition-all duration-200 ${
                  active ? "border-sky-500/20 bg-sky-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]"
                }`}>
                  <button onClick={() => toggleSource(src.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      active ? "bg-sky-500 border-sky-500" : "border-gray-600"
                    }`}>
                      {active && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <Icon className="w-4 h-4" style={{ color: src.color }} />
                    <span className={`text-sm font-medium ${active ? "text-white" : "text-gray-400"}`}>{src.label}</span>
                  </button>
                  {active && (
                    <div className="px-4 pb-4 pt-1" style={{ animation: "stepSlideIn 0.2s ease-out" }}>
                      <div className="flex items-center gap-3">
                        <input
                          type="number" min="0" placeholder="0"
                          value={values[src.id] || ""}
                          onChange={e => updateValue(src.id, e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-[#0f1117] border border-white/[0.08] text-white text-sm font-medium focus:outline-none focus:border-sky-500/40 transition-colors"
                        />
                        <span className="text-xs text-gray-500 whitespace-nowrap min-w-[100px]">{src.unit}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ SECTION 2: LIVE CALCULATION ═══ */}
        {monthlyTons > 0 && (
          <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]" style={{ animation: "stepSlideIn 0.3s ease-out" }}>
            <h2 className="text-lg font-bold text-white mb-6">Live Emissions Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Numbers */}
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/[0.03] border border-red-500/10">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Monthly Emissions</p>
                  <p className="text-4xl font-bold text-red-400">{monthlyTons.toFixed(1)} <span className="text-lg text-red-400/60">tons CO₂</span></p>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/[0.03] border border-amber-500/10">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Annual Projection</p>
                  <p className="text-4xl font-bold text-amber-400">{annualTons.toFixed(0)} <span className="text-lg text-amber-400/60">tons CO₂/year</span></p>
                </div>
                <div className="p-4 rounded-xl bg-sky-500/[0.06] border border-sky-500/15">
                  <p className="text-xs text-sky-400 font-semibold mb-2">Source Breakdown</p>
                  {breakdown.filter(b => b.kgCO2 > 0).map((b, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                        <span className="text-xs text-gray-400">{b.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-300">{(b.kgCO2 / 1000).toFixed(1)} t</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Pie Chart */}
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                      paddingAngle={2} label={renderLabel} labelLine={false}
                      style={{ fontSize: "10px", fill: "#9ca3af" }}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {/* ═══ SECTION 3: OFFSET RECOMMENDATION ═══ */}
        {annualTons > 0 && (
          <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]" style={{ animation: "stepSlideIn 0.3s ease-out" }}>
            <h2 className="text-lg font-bold text-white mb-1">Offset Recommendation</h2>
            <p className="text-sm text-gray-500 mb-6">
              To be <span className="text-emerald-400 font-semibold">Carbon Neutral</span> you need: <span className="text-white font-bold">{Math.ceil(annualTons)} Carbon Credits/year</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map(pkg => {
                const credits = Math.ceil(annualTons * (pkg.pct / 100));
                const monthlyCredits = Math.ceil(credits / 12);
                const monthlyCost = monthlyCredits * PRICE_PER_CREDIT;
                const spotCost = monthlyCredits * 730;
                const saving = Math.round(((spotCost - monthlyCost) / spotCost) * 100);
                const isPopular = pkg.pct === 100;
                return (
                  <div key={pkg.name} className={`relative p-5 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                    isPopular
                      ? `bg-gradient-to-br from-sky-500/15 to-sky-500/[0.03] border-sky-500/30 shadow-lg shadow-sky-500/5`
                      : `bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]`
                  }`}>
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold uppercase tracking-wider">
                        Most Popular
                      </div>
                    )}
                    <div className="text-center mb-4">
                      <span className="text-3xl">{pkg.emoji}</span>
                      <h3 className={`text-lg font-bold mt-2 ${isPopular ? "text-sky-400" : "text-white"}`}>{pkg.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{pkg.desc}</p>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Credits/month</span>
                        <span className="text-white font-bold">{monthlyCredits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Monthly cost</span>
                        <span className="text-emerald-400 font-bold">₹{monthlyCost.toLocaleString()}</span>
                      </div>
                      {saving > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">vs spot price</span>
                          <span className="text-amber-400 font-semibold">Save {saving}%</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Annual credits</span>
                        <span className="text-white font-bold">{credits.toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => navigate("/marketplace")}
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        isPopular
                          ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:shadow-lg hover:shadow-sky-500/25"
                          : "bg-white/[0.06] text-gray-300 hover:bg-white/[0.1]"
                      }`}>
                      Choose Plan <ChevronRight className="w-4 h-4 inline ml-1" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══ SECTION 4: COMPARISON WIDGET ═══ */}
        {annualTons > 0 && industry && (
          <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]" style={{ animation: "stepSlideIn 0.3s ease-out" }}>
            <h2 className="text-lg font-bold text-white mb-1">How Do You Compare?</h2>
            <p className="text-sm text-gray-500 mb-6">Your emissions vs. the <span className="text-sky-400 capitalize">{INDUSTRIES.find(i => i.id === industry)?.label}</span> industry</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} width={100} />
                  <Tooltip content={<BarTip />} />
                  <Bar dataKey="value" name="Emissions" radius={[0, 6, 6, 0]} barSize={24}>
                    {comparisonData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                  {targetLine > 0 && (
                    <ReferenceLine x={targetLine} stroke="#fbbf24" strokeDasharray="6 4" strokeWidth={2}
                      label={{ value: `Target: ${targetLine.toLocaleString()}t`, fill: "#fbbf24", fontSize: 10, position: "top" }} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* ═══ GENERATE REPORT ═══ */}
        {annualTons > 0 && (
          <div className="flex justify-center print:hidden">
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              <Printer className="w-4 h-4" /> Generate Emissions Report
            </button>
          </div>
        )}
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #emissions-report { background: white !important; }
          .print\\:hidden { display: none !important; }
          section { break-inside: avoid; border-color: #e5e7eb !important; background: #fafafa !important; }
          h1, h2, h3, p, span, td { color: #1f2937 !important; }
          .text-red-400, .text-amber-400 { color: #dc2626 !important; }
          .text-emerald-400, .text-sky-400 { color: #059669 !important; }
        }
      `}</style>
    </div>
  );
}
