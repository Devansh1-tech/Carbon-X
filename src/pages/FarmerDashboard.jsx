import { useState, useEffect, useMemo } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard, FolderPlus, FolderKanban, Wallet, Store,
  LogOut, Bell, TrendingUp, TrendingDown, Leaf, TreePine,
  MapPin, ArrowRight, Plus, ChevronRight, Bot,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getAIRecommendation } from "../utils/geminiAI";

/* ── Chart mock data ── */
const chartData = [
  { month: "Jan", credits: 30 },
  { month: "Feb", credits: 65 },
  { month: "Mar", credits: 110 },
  { month: "Apr", credits: 180 },
  { month: "May", credits: 240 },
  { month: "Jun", credits: 340 },
];

/* ── Type badge colors ── */
const TYPE_COLORS = {
  tree_plantation: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "🌳 Tree Plantation" },
  soil_carbon: { bg: "bg-amber-500/15", text: "text-amber-400", label: "🌱 Soil Carbon" },
  renewable_energy: { bg: "bg-sky-500/15", text: "text-sky-400", label: "⚡ Renewable Energy" },
};

/* ── Status badge ── */
const STATUS_STYLE = {
  verified: { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
  pending: { bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-400" },
  rejected: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" },
};

/* ── Mock activity feed ── */
const activityFeed = [
  { id: 1, icon: "✅", text: "Project \"Narmada Valley Reforestation\" Verified", credits: "+180", positive: true, time: "2 hours ago" },
  { id: 2, icon: "💰", text: "Credits Sold to Tata Steel Industries", credits: "-50", positive: false, time: "5 hours ago" },
  { id: 3, icon: "📄", text: "New Project \"Biochar Pilot\" Submitted", credits: "0", positive: true, time: "1 day ago" },
  { id: 4, icon: "✅", text: "Project \"Organic Soil Enrichment\" Verified", credits: "+95", positive: true, time: "3 days ago" },
  { id: 5, icon: "💰", text: "Credits Sold — Marketplace Transaction", credits: "-30", positive: false, time: "1 week ago" },
];

/* ── Sidebar nav items ── */
const NAV = [
  { to: "/dashboard/farmer", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/submit-project", icon: FolderPlus, label: "Submit Project" },
  { to: "/dashboard/farmer", icon: FolderKanban, label: "My Projects", end: false },
  { to: "/wallet", icon: Wallet, label: "Wallet" },
  { to: "/marketplace", icon: Store, label: "Marketplace" },
];

/* ── Custom chart tooltip ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2235] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-emerald-400 font-bold text-sm">{payload[0].value} credits</p>
    </div>
  );
}

/* ═══════════════════ FARMER DASHBOARD ═══════════════════ */
export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { currentUser, projects, wallet, notifications, logout } = useApp();

  const user = currentUser || {
    id: "usr_001", name: "Ramesh Patel", role: "farmer",
    avatar: "👨‍🌾", creditsEarned: 340, projectsSubmitted: 3, walletBalance: 280,
  };

  /* derived data */
  const userProjects = useMemo(
    () => projects.filter((p) => p.userId === user.id),
    [projects, user.id]
  );

  /* AI Advisor */
  const [aiAdvice, setAiAdvice] = useState("");
  const [aiLoading, setAiLoading] = useState(true);
  const [displayedAdvice, setDisplayedAdvice] = useState("");

  useEffect(() => {
    getAIRecommendation(user.role, user.location || "rural India", user.creditsEarned || 0)
      .then((text) => { setAiAdvice(text); setAiLoading(false); })
      .catch(() => setAiLoading(false));
  }, []);

  /* Typewriter effect */
  useEffect(() => {
    if (!aiAdvice) return;
    let i = 0;
    setDisplayedAdvice("");
    const timer = setInterval(() => {
      i++;
      setDisplayedAdvice(aiAdvice.slice(0, i));
      if (i >= aiAdvice.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [aiAdvice]);
  const lastThreeProjects = userProjects.slice(-3).reverse();
  const totalCredits = user.creditsEarned || userProjects.reduce((s, p) => s + p.creditsGenerated, 0);
  const walletBalance = wallet.balance || user.walletBalance || 0;
  const co2Saved = walletBalance * 1; // 1 credit = 1 ton

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen flex bg-[#0f1117]">
      {/* ════════════ SIDEBAR ════════════ */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#151823] border-r border-white/[0.06]">
        {/* Brand */}
        <div className="px-6 pt-7 pb-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              CarbonX
            </span>
          </Link>
        </div>

        {/* User card */}
        <div className="mx-4 mb-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">
              {user.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user.name}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end !== false}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-emerald-500/12 text-emerald-400"
                    : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-300"
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ════════════ MAIN ════════════ */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* ── Top Bar ── */}
        <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-6 lg:px-10 h-16">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <span className="font-bold text-white">CarbonX</span>
            </div>
            <div className="hidden lg:block" />

            <div className="flex items-center gap-3">
              <Link
                to="/submit-project"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Submit New Project</span>
              </Link>

              {/* Notification bell */}
              <button className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors">
                <Bell className="w-[18px] h-[18px] text-gray-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Avatar chip */}
              <div className="hidden sm:flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <span className="text-lg">{user.avatar}</span>
                <span className="text-sm text-gray-300 font-medium">{user.name?.split(" ")[0]}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="flex-1 px-6 lg:px-10 py-8 space-y-8">

          {/* ── Section 1: Stats Cards ── */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Card 1 — Total Credits */}
              <div className="group p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.03] border border-emerald-500/10 hover:border-emerald-500/25 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Credits Earned</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-emerald-400">{totalCredits}</p>
                <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
              </div>

              {/* Card 2 — Wallet Balance */}
              <div className="group p-5 rounded-2xl bg-gradient-to-br from-sky-500/10 to-sky-500/[0.03] border border-sky-500/10 hover:border-sky-500/25 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits in Wallet</span>
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-sky-400" />
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-sky-400">{walletBalance}</p>
                  <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-semibold mb-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +12%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Available to trade</p>
              </div>

              {/* Card 3 — Projects Submitted */}
              <div className="group p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/[0.03] border border-violet-500/10 hover:border-violet-500/25 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects Submitted</span>
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
                    <FolderKanban className="w-4 h-4 text-violet-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-violet-400">{userProjects.length}</p>
                <p className="text-xs text-gray-500 mt-1">{userProjects.filter((p) => p.status === "verified").length} verified</p>
              </div>

              {/* Card 4 — CO₂ Saved */}
              <div className="group p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 to-teal-500/[0.03] border border-teal-500/10 hover:border-teal-500/25 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CO₂ Saved</span>
                  <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center">
                    <TreePine className="w-4 h-4 text-teal-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-teal-400">{co2Saved} <span className="text-lg font-medium text-teal-400/60">tons</span></p>
                <p className="text-xs text-gray-500 mt-1">Carbon offset impact</p>
              </div>
            </div>
          </section>

          {/* ── Section 2: Area Chart ── */}
          <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Carbon Credits Earned</h2>
                <p className="text-sm text-gray-500 mt-0.5">Growth trend over the last 6 months</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                <TrendingUp className="w-3.5 h-3.5" /> +42%
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} dx={-5} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(16,185,129,0.2)", strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="credits"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#creditGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#10b981", stroke: "#0f1117", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ── Section 3: My Projects ── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">My Projects</h2>
              <button className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {lastThreeProjects.map((project) => {
                const typeStyle = TYPE_COLORS[project.type] || TYPE_COLORS.tree_plantation;
                const statusStyle = STATUS_STYLE[project.status] || STATUS_STYLE.pending;
                return (
                  <div
                    key={project.id}
                    className="group rounded-2xl bg-[#151823] border border-white/[0.06] hover:border-emerald-500/20 overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {/* Thumbnail */}
                    <div className="h-36 bg-gradient-to-br from-emerald-600/20 via-green-600/10 to-transparent relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30 group-hover:scale-110 transition-transform duration-500">
                        {project.type === "tree_plantation" ? "🌳" : project.type === "soil_carbon" ? "🌱" : "⚡"}
                      </div>
                      {/* Status badge */}
                      <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusStyle.bg} backdrop-blur-sm`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${statusStyle.text}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${typeStyle.bg} ${typeStyle.text} text-[10px] font-semibold uppercase tracking-wider mb-2.5`}>
                        {typeStyle.label}
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-3 leading-snug">{project.title}</h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Credits Generated</span>
                          <span className="text-emerald-400 font-semibold">{project.creditsGenerated}</span>
                        </div>
                        {project.treesPlanted > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Trees Planted</span>
                            <span className="text-green-400 font-semibold">{project.treesPlanted.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {project.location.city}, {project.location.state}
                        </div>
                      </div>

                      <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-gray-400 text-xs font-medium hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 transition-all duration-200">
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Section 4: Activity Feed ── */}
          <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
            <h2 className="text-lg font-bold text-white mb-5">Recent Activity</h2>
            <div className="space-y-0">
              {activityFeed.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 py-4 ${idx !== activityFeed.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-lg flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{item.text}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{item.time}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${item.positive ? "text-emerald-400" : "text-red-400"}`}>
                    {item.credits !== "0" ? item.credits + " credits" : "—"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 5: AI Advisor ── */}
          <section className="p-6 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/15">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-emerald-400 mb-2">🤖 Your AI Advisor</h3>
                {aiLoading ? (
                  <div className="space-y-2">
                    <div className="h-3 rounded bg-white/[0.06] animate-pulse w-full" />
                    <div className="h-3 rounded bg-white/[0.06] animate-pulse w-4/5" />
                    <div className="h-3 rounded bg-white/[0.06] animate-pulse w-3/5" />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {displayedAdvice}<span className="inline-block w-0.5 h-4 bg-emerald-400 ml-0.5 animate-pulse" />
                  </p>
                )}
                <p className="text-[10px] text-gray-600 mt-3">Powered by Google Gemini • Updated now</p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
