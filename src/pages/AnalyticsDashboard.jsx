import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  ChevronLeft, Download, TrendingUp, TrendingDown, Leaf, Zap,
  DollarSign, FolderKanban, Bot, Printer,
} from "lucide-react";
import {
  ComposedChart, Bar, Line, Area, AreaChart, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Brush,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap, BarChart, ScatterChart, Scatter, ZAxis,
  RadialBarChart, RadialBar, Legend, Cell, LineChart,
} from "recharts";

/* ═══════════════════════════════════════════
   DATA GENERATORS
   ═══════════════════════════════════════════ */
function genDays(n) {
  const d = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - i);
    const base = 8 + Math.random() * 12;
    d.push({
      date: dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      credits: Math.round(base + Math.sin(i / 5) * 4),
      rawDate: dt,
    });
  }
  // 7-day moving avg
  for (let i = 0; i < d.length; i++) {
    const slice = d.slice(Math.max(0, i - 6), i + 1);
    d[i].avg = Math.round(slice.reduce((s, v) => s + v.credits, 0) / slice.length);
    d[i].cumulative = d.slice(0, i + 1).reduce((s, v) => s + v.credits, 0);
  }
  return d;
}

const radarData = [
  { metric: "Credits/Acre", tree: 85, soil: 60, energy: 40 },
  { metric: "Verify Speed", tree: 70, soil: 80, energy: 95 },
  { metric: "Demand", tree: 90, soil: 65, energy: 75 },
  { metric: "Price", tree: 75, soil: 55, energy: 85 },
  { metric: "ROI", tree: 80, soil: 70, energy: 90 },
];

const treemapData = [
  { name: "Tree Plantation", size: 4200, fill: "#10b981" },
  { name: "Soil Carbon", size: 2100, fill: "#f59e0b" },
  { name: "Renewable Energy", size: 1800, fill: "#06b6d4" },
  { name: "Agroforestry", size: 950, fill: "#8b5cf6" },
  { name: "Biochar", size: 600, fill: "#ec4899" },
];

const stateData = [
  { state: "Madhya Pradesh", credits: 4200, pct: 28 },
  { state: "Maharashtra", credits: 3800, pct: 25 },
  { state: "Rajasthan", credits: 2900, pct: 19 },
  { state: "Gujarat", credits: 1800, pct: 12 },
  { state: "Uttar Pradesh", credits: 1400, pct: 9 },
  { state: "Karnataka", credits: 980, pct: 6 },
  { state: "Tamil Nadu", credits: 750, pct: 5 },
  { state: "Odisha", credits: 520, pct: 3 },
];

const scatterMock = [
  { credits: 45, price: 580, value: 26100, seller: "Ramesh Patel", type: "Tree" },
  { credits: 120, price: 620, value: 74400, seller: "Green Earth", type: "Tree" },
  { credits: 30, price: 550, value: 16500, seller: "Sunita Devi", type: "Energy" },
  { credits: 80, price: 610, value: 48800, seller: "Ravi Kumar", type: "Soil" },
  { credits: 200, price: 640, value: 128000, seller: "EcoLife NGO", type: "Tree" },
  { credits: 60, price: 590, value: 35400, seller: "Amit Singh", type: "Soil" },
  { credits: 150, price: 600, value: 90000, seller: "GreenHarvest", type: "Tree" },
  { credits: 25, price: 570, value: 14250, seller: "Priya Sharma", type: "Energy" },
  { credits: 90, price: 630, value: 56700, seller: "TerraCo", type: "Soil" },
  { credits: 40, price: 605, value: 24200, seller: "FarmGreen", type: "Tree" },
];

const radialData = [
  { name: "Your Offset", value: 24, fill: "#10b981" },
  { name: "Industry Avg", value: 18, fill: "#f59e0b" },
  { name: "Your Emissions", value: 100, fill: "#ef4444" },
];

const BAR_GRAD = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#ef4444", "#14b8a6", "#6366f1"];

/* ═══════════════════════════════════════════
   SUBCOMPONENTS
   ═══════════════════════════════════════════ */
function LiveCounter({ end, duration = 1200, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = (ts) => {
      if (!ref.current) ref.current = ts;
      const p = Math.min((ts - ref.current) / duration, 1);
      setVal(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return () => { ref.current = null; };
  }, [end, duration]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* Mini sparkline for KPI cards */
function Sparkline({ data, color }) {
  return (
    <div className="h-[32px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
            fill={`url(#spark-${color.replace('#','')})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2235] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl text-xs">
      <p className="text-gray-400 mb-1 font-semibold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

function ScatterTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-[#1e2235] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl text-xs">
      <p className="text-white font-bold mb-1">{d.seller}</p>
      <p className="text-gray-400">{d.type} • {d.credits} credits @ ₹{d.price}</p>
      <p className="text-emerald-400 font-semibold">₹{d.value.toLocaleString()}</p>
    </div>
  );
}

/* Custom treemap content */
function TreemapContent(props) {
  const { x, y, width, height, name, size, fill } = props || {};
  if (!width || !height || width < 50 || height < 30) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8}
        fill={fill || "#10b981"} opacity={0.8} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
      <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle"
        fill="white" fontSize={12} fontWeight={700}>{name || ""}</text>
      <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle"
        fill="rgba(255,255,255,0.7)" fontSize={10}>{(size || 0).toLocaleString()} CC</text>
    </g>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
const RANGES = [
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "1 Year", days: 365 },
];

export default function AnalyticsDashboard() {
  const { currentUser } = useApp();
  const [range, setRange] = useState(30);
  const isCompany = currentUser?.role === "company";
  const backLink = isCompany ? "/dashboard/company" : "/dashboard/farmer";

  const dailyData = useMemo(() => genDays(range), [range]);
  const totalCredits = useMemo(() => dailyData.reduce((s, d) => s + d.credits, 0), [dailyData]);
  const co2Saved = totalCredits;
  const revenue = Math.round(totalCredits * 608);
  const prevCredits = Math.round(totalCredits * 0.82);
  const creditsPctChange = Math.round(((totalCredits - prevCredits) / prevCredits) * 100);

  // Prediction data
  const predictionData = useMemo(() => {
    const last14 = dailyData.slice(-14);
    const future = [];
    let lastVal = last14[last14.length - 1]?.credits || 12;
    for (let i = 1; i <= 14; i++) {
      lastVal = Math.round(lastVal + Math.random() * 3 - 0.5);
      const dt = new Date();
      dt.setDate(dt.getDate() + i);
      future.push({
        date: dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        actual: null,
        predicted: Math.max(5, lastVal),
      });
    }
    return [
      ...last14.map((d) => ({ date: d.date, actual: d.credits, predicted: null })),
      ...future,
    ];
  }, [dailyData]);

  const projectedMonthly = useMemo(() => {
    const avg = dailyData.slice(-7).reduce((s, d) => s + d.credits, 0) / 7;
    return Math.round(avg * 30);
  }, [dailyData]);

  const COLOR_MAP = {
    emerald: { bg: "rgba(16,185,129,0.1)", bgHover: "rgba(16,185,129,0.15)", text: "#34d399", border: "rgba(16,185,129,0.1)", borderHover: "rgba(16,185,129,0.25)" },
    sky: { bg: "rgba(14,165,233,0.1)", bgHover: "rgba(14,165,233,0.15)", text: "#38bdf8", border: "rgba(14,165,233,0.1)", borderHover: "rgba(14,165,233,0.25)" },
    amber: { bg: "rgba(245,158,11,0.1)", bgHover: "rgba(245,158,11,0.15)", text: "#fbbf24", border: "rgba(245,158,11,0.1)", borderHover: "rgba(245,158,11,0.25)" },
    violet: { bg: "rgba(139,92,246,0.1)", bgHover: "rgba(139,92,246,0.15)", text: "#a78bfa", border: "rgba(139,92,246,0.1)", borderHover: "rgba(139,92,246,0.25)" },
  };

  /* Sparkline data per KPI */
  const sparkCredits = useMemo(() => dailyData.slice(-10).map(d => ({ v: d.credits })), [dailyData]);
  const sparkCo2 = useMemo(() => dailyData.slice(-10).map(d => ({ v: d.credits * 1 })), [dailyData]);
  const sparkRev = useMemo(() => dailyData.slice(-10).map(d => ({ v: d.credits * 608 })), [dailyData]);
  const sparkProj = useMemo(() => [{ v: 3 }, { v: 3 }, { v: 4 }, { v: 4 }, { v: 4 }, { v: 5 }, { v: 5 }, { v: 5 }, { v: 5 }, { v: 5 }], []);

  const kpis = [
    { label: "Credits Earned", value: totalCredits, change: creditsPctChange, icon: Leaf, color: "emerald", prefix: "", suffix: " CC", spark: sparkCredits, sparkColor: "#34d399" },
    { label: "CO₂ Saved", value: co2Saved, change: 18, icon: Zap, color: "sky", prefix: "", suffix: " tons", spark: sparkCo2, sparkColor: "#38bdf8" },
    { label: "Revenue", value: revenue, change: 22, icon: DollarSign, color: "amber", prefix: "₹", suffix: "", spark: sparkRev, sparkColor: "#fbbf24" },
    { label: "Projects Active", value: 5, change: 12, icon: FolderKanban, color: "violet", prefix: "", suffix: "", spark: sparkProj, sparkColor: "#a78bfa" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-6 lg:px-10 h-16 max-w-[1400px] mx-auto">
          <Link to={backLink} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">CarbonX</span>
          </Link>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.06] text-gray-400 text-sm hover:bg-white/[0.1] hover:text-white transition-all">
            <Printer className="w-4 h-4" /> Export Report
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 space-y-8">
        {/* Title + Range Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Deep insights into your carbon credit activity</p>
          </div>
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <button key={r.days} onClick={() => setRange(r.days)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${range === r.days
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                    : "bg-white/[0.04] text-gray-500 border border-transparent hover:bg-white/[0.08] hover:text-gray-300"
                  }`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── SECTION 2: KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => {
            const up = k.change >= 0;
            const c = COLOR_MAP[k.color];
            return (
              <div key={k.label}
                style={{ background: `linear-gradient(135deg, ${c.bg}, transparent)`, border: `1px solid ${c.border}` }}
                className="p-5 rounded-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{k.label}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
                    <k.icon className="w-4 h-4" style={{ color: c.text }} />
                  </div>
                </div>
                <p className="text-3xl font-bold tabular-nums" style={{ color: c.text }}>
                  <LiveCounter end={k.value} prefix={k.prefix} suffix={k.suffix} />
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  {up ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                  <span className={`text-xs font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
                    {up ? "+" : ""}{k.change}% vs prev period
                  </span>
                </div>
                <Sparkline data={k.spark} color={k.sparkColor} />
              </div>
            );
          })}
        </div>

        {/* ── SECTION 3: Credits Over Time ── */}
        <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
          <h2 className="text-lg font-bold text-white mb-1">Credits Earned Over Time</h2>
          <p className="text-xs text-gray-500 mb-5">Daily credits with 7-day moving average</p>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyData} margin={{ top: 5, right: 10, left: -10, bottom: 30 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} interval={Math.floor(dailyData.length / 8)} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="credits" name="Daily Credits" fill="url(#barGrad)" radius={[4, 4, 0, 0]} barSize={range > 90 ? 4 : range > 30 ? 8 : 14} />
                <Line type="monotone" dataKey="avg" name="7d Avg" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                {range > 14 && <Brush dataKey="date" height={24} stroke="#10b981" fill="#151823" travellerWidth={8}
                  startIndex={Math.max(0, dailyData.length - 30)} />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── SECTION 4: Project Type Breakdown ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
            <h2 className="text-lg font-bold text-white mb-1">Project Comparison</h2>
            <p className="text-xs text-gray-500 mb-4">Performance across 5 metrics</p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar name="Tree Plantation" dataKey="tree" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Soil Carbon" dataKey="soil" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Renewable Energy" dataKey="energy" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#9ca3af", paddingTop: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
            <h2 className="text-lg font-bold text-white mb-1">Credits by Project Type</h2>
            <p className="text-xs text-gray-500 mb-4">Proportional contribution</p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap data={treemapData} dataKey="size" aspectRatio={4 / 3}
                  content={<TreemapContent />} animationDuration={600} />
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* ── SECTION 5: Geographic Performance ── */}
        <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
          <h2 className="text-lg font-bold text-white mb-1">Geographic Performance</h2>
          <p className="text-xs text-gray-500 mb-5">Top 8 states by credits generated</p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis type="category" dataKey="state" axisLine={false} tickLine={false}
                  tick={{ fill: "#d1d5db", fontSize: 12, fontWeight: 500 }} width={120} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="credits" name="Credits" radius={[0, 8, 8, 0]} barSize={22}>
                  {stateData.map((_, i) => (
                    <Cell key={i} fill={BAR_GRAD[i % BAR_GRAD.length]} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── SECTION 6: Marketplace Scatter ── */}
        <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
          <h2 className="text-lg font-bold text-white mb-1">Marketplace Activity</h2>
          <p className="text-xs text-gray-500 mb-5">Credits listed vs price — bubble size = total value</p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" dataKey="credits" name="Credits" axisLine={false} tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 11 }} label={{ value: "Credits Listed", position: "bottom", fill: "#6b7280", fontSize: 11 }} />
                <YAxis type="number" dataKey="price" name="Price" axisLine={false} tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 11 }} label={{ value: "Price (₹)", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 11 }} />
                <ZAxis type="number" dataKey="value" range={[80, 600]} />
                <Tooltip content={<ScatterTip />} />
                <Scatter data={scatterMock} fill="#10b981" opacity={0.7}>
                  {scatterMock.map((s, i) => (
                    <Cell key={i} fill={s.type === "Tree" ? "#10b981" : s.type === "Soil" ? "#f59e0b" : "#06b6d4"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── SECTION 7: Comparative Analysis (Company only) ── */}
        {isCompany && (
          <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
            <h2 className="text-lg font-bold text-white mb-1">Comparative Analysis</h2>
            <p className="text-xs text-gray-500 mb-5">Your offset vs industry average</p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%"
                  data={radialData} startAngle={180} endAngle={0}>
                  <RadialBar background={{ fill: "rgba(255,255,255,0.04)" }}
                    dataKey="value" cornerRadius={8} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
                  <Tooltip content={<ChartTip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* ── SECTION 8: AI Prediction ── */}
        <section className="p-6 rounded-2xl border-2 border-dashed border-emerald-500/20 bg-emerald-500/[0.03]">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-400 mb-1">🤖 AI Projection</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Based on your activity trend, you are projected to earn{" "}
                <span className="text-emerald-300 font-bold">{projectedMonthly} credits</span> next month.
                At current market price, that equals{" "}
                <span className="text-emerald-300 font-bold">₹{(projectedMonthly * 608).toLocaleString()}</span>.
              </p>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} interval={3} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="actual" name="Actual" stroke="#10b981" fill="url(#actGrad)" strokeWidth={2} dot={false} connectNulls={false} />
                <Area type="monotone" dataKey="predicted" name="Predicted" stroke="#f59e0b" fill="url(#predGrad)" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-gray-600 mt-3 text-right">Powered by trend analysis • Historical + projected data</p>
        </section>

      </div>
    </div>
  );
}
