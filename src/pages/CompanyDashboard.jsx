import { useState, useMemo } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard, ShoppingCart, BarChart3, FileText, Settings,
  LogOut, Bell, TrendingUp, Plus, Bot, Download, Check,
  Building2, Flame, Leaf, Target, X,
} from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import PriceTicker from "../components/PriceTicker";
import CertificateGenerator from "../components/CertificateGenerator";

/* ── Chart data ── */
const monthlyData = [
  { month: "Jan", emissions: 850, purchased: 150, cumOffset: 150 },
  { month: "Feb", emissions: 820, purchased: 200, cumOffset: 350 },
  { month: "Mar", emissions: 900, purchased: 180, cumOffset: 530 },
  { month: "Apr", emissions: 780, purchased: 250, cumOffset: 780 },
  { month: "May", emissions: 830, purchased: 220, cumOffset: 1000 },
  { month: "Jun", emissions: 820, purchased: 200, cumOffset: 1200 },
];

/* ── Purchase history ── */
const purchases = [
  { id: 1, date: "2026-04-05", seller: "Green Earth Foundation", type: "Tree Plantation", credits: 100, amount: 50000, cert: true },
  { id: 2, date: "2026-03-20", seller: "Sunita Devi", type: "Renewable Energy", credits: 40, amount: 30000, cert: true },
  { id: 3, date: "2026-03-12", seller: "Ramesh Patel", type: "Tree Plantation", credits: 45, amount: 29250, cert: true },
  { id: 4, date: "2026-03-01", seller: "Green Earth Foundation", type: "Tree Plantation", credits: 150, amount: 67500, cert: true },
  { id: 5, date: "2026-02-14", seller: "Sunita Devi", type: "Renewable Energy", credits: 80, amount: 56000, cert: false },
  { id: 6, date: "2026-02-03", seller: "Ramesh Patel", type: "Soil Carbon", credits: 30, amount: 16500, cert: false },
];

/* ── Milestones ── */
const milestones = [
  { label: "Account Created", done: true },
  { label: "First Purchase", done: true },
  { label: "500 Tons Offset", done: true },
  { label: "Gold Member", done: false },
];

/* ── Sidebar nav ── */
const NAV = [
  { to: "/dashboard/company", icon: LayoutDashboard, label: "Overview" },
  { to: "/marketplace", icon: ShoppingCart, label: "Buy Credits" },
  { to: "/dashboard/company", icon: BarChart3, label: "Emissions Tracker" },
  { to: "/dashboard/company", icon: FileText, label: "Reports" },
  { to: "/dashboard/company", icon: Settings, label: "Settings" },
];

/* ── Gauge component ── */
function Gauge({ pct }) {
  const r = 80, c = Math.PI * 2 * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative w-[200px] h-[200px] flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        <circle cx="100" cy="100" r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth="14"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000" />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{pct}%</span>
        <span className="text-xs text-gray-500 mt-1">Neutrality</span>
      </div>
    </div>
  );
}

/* ── Chart tooltip ── */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2235] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

/* ═══ COMPANY DASHBOARD ═══ */
export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { currentUser, notifications, logout } = useApp();
  const [toast, setToast] = useState("");
  const [certData, setCertData] = useState(null);

  const user = currentUser || {
    id: "usr_004", name: "Tata Steel Industries", role: "company",
    emissionsTotal: 5000, offsetCredits: 1200, remainingOffset: 3800, walletBalance: 4200,
  };

  const total = user.emissionsTotal || 5000;
  const offset = user.offsetCredits || 1200;
  const remaining = user.remainingOffset || 3800;
  const pct = Math.round((offset / total) * 100);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen flex bg-[#0f1117]">
      {/* ════ SIDEBAR ════ */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#151823] border-r border-white/[0.06]">
        <div className="px-6 pt-7 pb-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">CarbonX</span>
          </Link>
        </div>
        <div className="mx-4 mb-6 p-4 rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-sky-500/20 flex items-center justify-center text-2xl">🏢</div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user.name}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 text-[10px] font-semibold uppercase tracking-wider">company</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((item) => (
            <NavLink key={item.label} to={item.to} end
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? "bg-sky-500/12 text-sky-400" : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-300"}`}>
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" /><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-6">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all">
            <LogOut className="w-[18px] h-[18px]" /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-6 lg:px-10 h-16">
            <div className="lg:hidden flex items-center gap-2"><span className="text-xl">🌱</span><span className="font-bold text-white">CarbonX</span></div>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-3">
              <Link to="/marketplace" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Buy More Credits</span>
              </Link>
              <button className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors">
                <Bell className="w-[18px] h-[18px] text-gray-400" />
                {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{notifications.length}</span>}
              </button>
              <div className="hidden sm:flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <span className="text-lg">🏢</span>
                <span className="text-sm text-gray-300 font-medium">{user.name?.split(" ")[0]}</span>
              </div>
            </div>
          </div>
        </header>

        <PriceTicker />

        <div className="flex-1 px-6 lg:px-10 py-8 space-y-8">

          {/* ── SECTION 1: Emissions Overview ── */}
          <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
            <h2 className="text-lg font-bold text-white mb-6">Carbon Neutrality Progress</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <Gauge pct={pct} />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div className="p-5 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/[0.03] border border-red-500/10">
                  <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center mb-3"><Flame className="w-4 h-4 text-red-400" /></div>
                  <p className="text-2xl font-bold text-red-400">{total.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total Emissions (tons CO₂)</p>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.03] border border-emerald-500/10">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-3"><Leaf className="w-4 h-4 text-emerald-400" /></div>
                  <p className="text-2xl font-bold text-emerald-400">{offset.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Offset So Far (tons)</p>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/[0.03] border border-amber-500/10">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3"><Target className="w-4 h-4 text-amber-400" /></div>
                  <p className="text-2xl font-bold text-amber-400">{remaining.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Remaining Target (tons)</p>
                </div>
              </div>
            </div>
            <p className="text-center md:text-left text-sm text-gray-500 mt-4">{offset.toLocaleString()} tons offset of {total.toLocaleString()} tons total</p>
          </section>

          {/* ── SECTION 2: Chart ── */}
          <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
            <h2 className="text-lg font-bold text-white mb-6">6-Month Emissions & Offset Tracking</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip content={<ChartTip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
                  <Bar dataKey="emissions" name="Emissions" fill="#ef4444" opacity={0.7} radius={[4, 4, 0, 0]} barSize={28} />
                  <Bar dataKey="purchased" name="Credits Purchased" fill="#10b981" opacity={0.8} radius={[4, 4, 0, 0]} barSize={28} />
                  <Line type="monotone" dataKey="cumOffset" name="Cumulative Offset" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: "#06b6d4", r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ── SECTION 3: Purchase History ── */}
          <section className="rounded-2xl bg-[#151823] border border-white/[0.06] overflow-hidden">
            <div className="p-6 pb-4 border-b border-white/[0.04]">
              <h2 className="text-lg font-bold text-white">Recent Credit Purchases</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {["Date", "Seller", "Project Type", "Credits", "Amount Paid", "Certificate"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5 text-sm text-gray-400 whitespace-nowrap">{p.date}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-300">{p.seller}</td>
                      <td className="px-6 py-3.5"><span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                        p.type === "Tree Plantation" ? "bg-emerald-500/15 text-emerald-400" : p.type === "Soil Carbon" ? "bg-amber-500/15 text-amber-400" : "bg-sky-500/15 text-sky-400"
                      }`}>{p.type}</span></td>
                      <td className="px-6 py-3.5 text-sm font-bold text-emerald-400">{p.credits}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-400">₹{p.amount.toLocaleString()}</td>
                      <td className="px-6 py-3.5">
                        {p.cert ? (
                          <button
                            onClick={() => setCertData({
                              recipientName: user.name,
                              creditsAmount: p.credits,
                              projectTitle: p.type + " Credits from " + p.seller,
                              projectType: p.type,
                              location: "India",
                              date: p.date,
                              type: "offset",
                            })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold hover:bg-sky-500/20 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" /> Certificate
                          </button>
                        ) : <span className="text-xs text-gray-600">Pending</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── SECTION 4: Milestones ── */}
          <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
            <h2 className="text-lg font-bold text-white mb-6">Sustainability Milestones</h2>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-white/[0.06]" />
              <div className="absolute top-5 left-[10%] h-0.5 bg-emerald-500/50 transition-all duration-700" style={{ width: `${(milestones.filter(m => m.done).length - 1) / (milestones.length - 1) * 80}%` }} />
              {milestones.map((m, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    m.done ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-[#1e2235] border-2 border-white/[0.08] text-gray-600"
                  }`}>
                    {m.done ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium text-center ${m.done ? "text-emerald-400" : "text-gray-600"}`}>{m.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── SECTION 5: AI Insights ── */}
          <section className="p-6 rounded-2xl bg-sky-500/[0.05] border border-sky-500/15">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-sky-400" /></div>
              <div>
                <h3 className="text-sm font-bold text-sky-400 mb-2">AI Recommendation</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  At your current pace, you will achieve <span className="text-sky-300 font-medium">carbon neutrality by March 2027</span>.
                  To accelerate, consider purchasing <span className="text-sky-300 font-medium">200 more credits this month</span>.
                  Recommended: <span className="text-emerald-300 font-medium">Soil Carbon projects from Rajasthan</span> (best ROI at ₹550/credit).
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-[slideIn_0.35s_ease-out]">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-sky-500/15 border border-sky-500/30 backdrop-blur-xl shadow-2xl">
            <span className="text-sky-300 text-sm font-medium">{toast}</span>
            <button onClick={() => setToast("")} className="text-sky-400/60 hover:text-sky-300"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {certData && (
        <CertificateGenerator
          {...certData}
          onClose={() => setCertData(null)}
        />
      )}

      <style>{`
        @keyframes slideIn { 0% { transform:translateX(100%) translateY(-10px); opacity:0; } 100% { transform:translateX(0) translateY(0); opacity:1; } }
      `}</style>
    </div>
  );
}
