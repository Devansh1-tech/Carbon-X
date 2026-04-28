import { useState, useMemo, useCallback, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { mockUsers } from "../data/mockUsers";
import { mockTransactions } from "../data/mockTransactions";
import ProjectMap from "../components/ProjectMap";
import {
  LayoutDashboard, FolderKanban, Users, ArrowLeftRight, BarChart3,
  Settings, LogOut, TrendingUp, Leaf, TreePine, Globe, IndianRupee,
  Check, X, Shield,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

/* ── Chart data ── */
const dailyActivity = [
  { day: "Mon", issued: 120, traded: 85 },
  { day: "Tue", issued: 95, traded: 110 },
  { day: "Wed", issued: 140, traded: 90 },
  { day: "Thu", issued: 110, traded: 130 },
  { day: "Fri", issued: 160, traded: 105 },
  { day: "Sat", issued: 80, traded: 60 },
  { day: "Sun", issued: 55, traded: 40 },
];

const geoData = [
  { state: "Madhya Pradesh", credits: 4200, fill: "#10b981" },
  { state: "Maharashtra", credits: 3800, fill: "#06b6d4" },
  { state: "Rajasthan", credits: 2900, fill: "#f59e0b" },
  { state: "Gujarat", credits: 1800, fill: "#8b5cf6" },
  { state: "Uttar Pradesh", credits: 1400, fill: "#ec4899" },
];

const MEDALS = ["🥇", "🥈", "🥉", "4", "5"];

/* ── Sidebar nav ── */
const NAV = [
  { to: "/dashboard/admin", icon: LayoutDashboard, label: "Overview" },
  { to: "/dashboard/admin", icon: FolderKanban, label: "Projects" },
  { to: "/dashboard/admin", icon: Users, label: "Users" },
  { to: "/dashboard/admin", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/dashboard/admin", icon: BarChart3, label: "Platform Stats" },
  { to: "/dashboard/admin", icon: Settings, label: "Settings" },
];

/* ── Chart tooltip ── */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2235] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color || p.fill }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

/* ═══ ADMIN DASHBOARD ═══ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { projects, logout, notifications } = useApp();
  const [toast, setToast] = useState("");
  const [actionedIds, setActionedIds] = useState(new Set());

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3500); return () => clearTimeout(t); } }, [toast]);

  const pendingProjects = useMemo(
    () => projects.filter((p) => p.status === "pending" && !actionedIds.has(p.id)),
    [projects, actionedIds]
  );

  const leaderboard = useMemo(
    () => [...mockUsers].filter((u) => u.creditsEarned).sort((a, b) => b.creditsEarned - a.creditsEarned).slice(0, 5),
    []
  );

  const recentTxns = useMemo(() => {
    const userMap = Object.fromEntries(mockUsers.map((u) => [u.id, u.name]));
    return mockTransactions.slice(0, 6).map((t) => ({
      ...t, buyerName: userMap[t.buyerId] || t.buyerId, sellerName: userMap[t.sellerId] || t.sellerId,
    }));
  }, []);

  const handleVerify = useCallback((id, title) => {
    setActionedIds((prev) => new Set(prev).add(id));
    setToast(`✅ "${title}" verified — credits issued`);
  }, []);

  const handleReject = useCallback((id, title) => {
    setActionedIds((prev) => new Set(prev).add(id));
    setToast(`❌ "${title}" rejected`);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen flex bg-[#0b0d14]">
      {/* ════ SIDEBAR ════ */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#10131c] border-r border-white/[0.06]">
        <div className="px-6 pt-7 pb-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">CarbonX Admin</span>
          </Link>
        </div>
        <div className="mx-4 mb-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-amber-500/20 flex items-center justify-center"><Shield className="w-5 h-5 text-amber-400" /></div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm">Admin CarbonX</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">admin</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((item, i) => (
            <NavLink key={item.label} to={item.to} end={i === 0}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${i === 0 && isActive ? "bg-amber-500/12 text-amber-400" : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-300"}`}>
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
        <header className="sticky top-0 z-30 bg-[#0b0d14]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-6 lg:px-10 h-16">
            <h1 className="text-lg font-bold text-white">Mission Control</h1>
            <div className="flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-gray-300 font-medium">Admin</span>
            </div>
          </div>
        </header>

        <div className="flex-1 px-6 lg:px-10 py-8 space-y-8">

          {/* ── KPI Cards ── */}
          <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { label: "Total Credits Issued", value: "18,420", unit: "CC", icon: Leaf, color: "emerald" },
              { label: "Total CO₂ Offset", value: "18,420", unit: "tons", icon: TreePine, color: "teal" },
              { label: "Active Projects", value: "134", unit: "", icon: FolderKanban, color: "violet" },
              { label: "Registered Users", value: "2,341", unit: "", icon: Users, color: "sky" },
              { label: "Trading Volume", value: "₹1.12", unit: "Cr", icon: IndianRupee, color: "amber" },
            ].map((s) => (
              <div key={s.label} className={`p-5 rounded-2xl bg-gradient-to-br from-${s.color}-500/10 to-${s.color}-500/[0.03] border border-${s.color}-500/10 hover:border-${s.color}-500/25 transition-all`}>
                <div className={`w-9 h-9 rounded-xl bg-${s.color}-500/15 flex items-center justify-center mb-3`}>
                  <s.icon className={`w-4 h-4 text-${s.color}-400`} />
                </div>
                <div className="flex items-end gap-1">
                  <p className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</p>
                  {s.unit && <span className={`text-sm font-medium text-${s.color}-400/60 mb-0.5`}>{s.unit}</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-gray-500">{s.label}</span>
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            ))}
          </section>

          {/* ── Platform Activity Chart ── */}
          <section className="p-6 rounded-2xl bg-[#10131c] border border-white/[0.06]">
            <h2 className="text-lg font-bold text-white mb-6">Daily Platform Activity</h2>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyActivity} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="issuedG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="tradedG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="100%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="issued" name="Credits Issued" stroke="#10b981" strokeWidth={2} fill="url(#issuedG)" dot={false} />
                  <Area type="monotone" dataKey="traded" name="Credits Traded" stroke="#06b6d4" strokeWidth={2} fill="url(#tradedG)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ── Pending Verification ── */}
          <section className="rounded-2xl bg-[#10131c] border border-white/[0.06] overflow-hidden">
            <div className="p-6 pb-4 border-b border-white/[0.04]">
              <h2 className="text-lg font-bold text-white">Projects Pending Verification</h2>
            </div>
            {pendingProjects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-white/[0.04]">
                    {["Farmer", "Project Title", "Type", "Trees/Area", "Submitted", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {pendingProjects.map((p) => {
                      const farmer = mockUsers.find((u) => u.id === p.userId);
                      return (
                        <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3.5 text-sm text-gray-300">{farmer?.name || p.userId}</td>
                          <td className="px-6 py-3.5 text-sm text-white font-medium">{p.title}</td>
                          <td className="px-6 py-3.5"><span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                            p.type === "tree_plantation" ? "bg-emerald-500/15 text-emerald-400" : p.type === "soil_carbon" ? "bg-amber-500/15 text-amber-400" : "bg-sky-500/15 text-sky-400"
                          }`}>{p.type.replace("_", " ")}</span></td>
                          <td className="px-6 py-3.5 text-sm text-gray-400">{p.treesPlanted > 0 ? `${p.treesPlanted} trees` : `${p.landArea} acres`}</td>
                          <td className="px-6 py-3.5 text-sm text-gray-500">{p.submittedAt}</td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleVerify(p.id, p.title)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-all">
                                <Check className="w-3.5 h-3.5" /> Verify
                              </button>
                              <button onClick={() => handleReject(p.id, p.title)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-all">
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-600 text-sm">No projects pending verification</div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── Leaderboard ── */}
            <section className="rounded-2xl bg-[#10131c] border border-white/[0.06] overflow-hidden">
              <div className="p-6 pb-4 border-b border-white/[0.04]">
                <h2 className="text-lg font-bold text-white">Top Contributors</h2>
              </div>
              <div className="p-2">
                {leaderboard.map((u, i) => (
                  <div key={u.id} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      i < 3 ? "bg-amber-500/15 text-lg" : "bg-white/[0.06] text-gray-500"
                    }`}>{MEDALS[i]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{u.name}</p>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${u.role === "farmer" ? "text-emerald-400" : u.role === "ngo" ? "text-violet-400" : "text-gray-500"}`}>{u.role}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">{u.creditsEarned}</p>
                      <p className="text-[10px] text-gray-600">{u.projectsSubmitted || 0} projects</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Geographic Distribution ── */}
            <section className="p-6 rounded-2xl bg-[#10131c] border border-white/[0.06]">
              <h2 className="text-lg font-bold text-white mb-6">Credits by State</h2>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geoData} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis type="category" dataKey="state" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} width={100} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="credits" radius={[0, 6, 6, 0]} barSize={20}>
                      {geoData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* ── Recent Transactions ── */}
          <section className="rounded-2xl bg-[#10131c] border border-white/[0.06] overflow-hidden">
            <div className="p-6 pb-4 border-b border-white/[0.04]">
              <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {recentTxns.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate"><span className="text-white font-medium">{t.buyerName}</span> bought from <span className="text-white font-medium">{t.sellerName}</span></p>
                    <p className="text-xs text-gray-600 mt-0.5">{new Date(t.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-400">{t.credits} CC</p>
                    <p className="text-xs text-gray-500">₹{t.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Project Locations Map ── */}
          <section className="p-6 rounded-2xl bg-[#10131c] border border-white/[0.06]">
            <h2 className="text-lg font-bold text-white mb-6">Project Locations</h2>
            <ProjectMap projects={projects} />
          </section>

        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-[slideIn_0.35s_ease-out]">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl">
            <span className="text-white text-sm font-medium">{toast}</span>
            <button onClick={() => setToast("")} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <style>{`@keyframes slideIn { 0% { transform:translateX(100%) translateY(-10px); opacity:0; } 100% { transform:translateX(0) translateY(0); opacity:1; } }`}</style>
    </div>
  );
}
