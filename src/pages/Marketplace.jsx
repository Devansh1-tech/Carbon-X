import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { mockMarketplace } from "../data/mockMarketplace";
import {
  Search, MapPin, Star, X, Check, ChevronLeft, Filter,
  TrendingUp, ShoppingCart, Leaf, Bot, SlidersHorizontal,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

/* ── Chart data ── */
const tradedByType = [
  { type: "Tree Plantation", credits: 820, fill: "#10b981" },
  { type: "Soil Carbon", credits: 340, fill: "#f59e0b" },
  { type: "Renewable", credits: 480, fill: "#0ea5e9" },
];
const priceHistory = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  price: 560 + Math.round(Math.sin(i / 5) * 15 + i * 1.2 + Math.random() * 10),
}));

const TYPE_BADGE = {
  tree_plantation: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "🌳 Tree Plantation" },
  soil_carbon: { bg: "bg-amber-500/15", text: "text-amber-400", label: "🌾 Soil Carbon" },
  renewable_energy: { bg: "bg-sky-500/15", text: "text-sky-400", label: "⚡ Renewable Energy" },
};

const STATES = ["All States", "Madhya Pradesh", "Maharashtra", "Rajasthan"];
const STATE_ABBR = { "Madhya Pradesh": "MP", Maharashtra: "Maharashtra", Rajasthan: "Rajasthan" };

/* ── Toast ── */
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed top-6 right-6 z-[100] animate-[slideIn_0.35s_ease-out]">
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-xl shadow-2xl">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-4 h-4 text-emerald-400" /></div>
        <span className="text-emerald-300 text-sm font-medium">{msg}</span>
        <button onClick={onClose} className="ml-2 text-emerald-400/60 hover:text-emerald-300"><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

/* ── Chart tooltip ── */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2235] border border-white/10 rounded-xl px-4 py-2 shadow-xl">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-emerald-400 font-bold text-sm">{payload[0].value}</p>
    </div>
  );
}

/* ═══ MARKETPLACE ═══ */
export default function Marketplace() {
  const { currentUser, buyCredits } = useApp();
  const userId = currentUser?.id || "usr_001";

  /* filters */
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState({ tree_plantation: true, soil_carbon: true, renewable_energy: true });
  const [priceRange, setPriceRange] = useState([400, 1000]);
  const [stateFilter, setStateFilter] = useState("All States");
  const [sellerType, setSellerType] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  /* modal */
  const [buyModal, setBuyModal] = useState(null);
  const [buyQty, setBuyQty] = useState(1);
  const [toast, setToast] = useState("");

  const toggleType = (key) => setTypes((prev) => ({ ...prev, [key]: !prev[key] }));

  const filtered = useMemo(() => {
    return mockMarketplace.filter((l) => {
      if (!types[l.projectType]) return false;
      const displayPrice = l.pricePerCredit * 50;
      if (displayPrice < priceRange[0] || displayPrice > priceRange[1]) return false;
      if (stateFilter !== "All States" && !l.location.includes(STATE_ABBR[stateFilter] || stateFilter)) return false;
      if (sellerType !== "all" && l.sellerType !== sellerType) return false;
      if (l.rating < minRating) return false;
      if (search && !l.projectTitle.toLowerCase().includes(search.toLowerCase()) && !l.sellerName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [types, priceRange, stateFilter, sellerType, minRating, search]);

  const handleBuy = useCallback(() => {
    if (!buyModal) return;
    buyCredits(buyModal.id, buyQty, userId);
    setToast(`✅ ${buyQty} credits added to your wallet!`);
    setBuyModal(null);
    setBuyQty(1);
  }, [buyModal, buyQty, buyCredits, userId]);

  const openBuy = (listing) => { setBuyModal(listing); setBuyQty(1); };

  /* ── Filter sidebar content (shared between desktop & mobile) ── */
  const filterContent = (
    <div className="space-y-6">
      {/* Type */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Project Type</h3>
        {Object.entries(TYPE_BADGE).map(([key, val]) => (
          <label key={key} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
            <input type="checkbox" checked={types[key]} onChange={() => toggleType(key)} className="accent-emerald-500 w-3.5 h-3.5" />
            <span className={`text-sm ${types[key] ? "text-gray-300" : "text-gray-600"} group-hover:text-gray-300 transition-colors`}>{val.label}</span>
          </label>
        ))}
      </div>
      {/* Price */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Price Range</h3>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2"><span>₹{priceRange[0]}</span><span>₹{priceRange[1]}</span></div>
        <input type="range" min={400} max={1000} step={50} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="w-full accent-emerald-500" />
      </div>
      {/* State */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Location</h3>
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-emerald-400/50 transition-all">
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {/* Seller */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Seller Type</h3>
        {["all", "farmer", "ngo"].map((t) => (
          <label key={t} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
            <input type="radio" name="seller" checked={sellerType === t} onChange={() => setSellerType(t)} className="accent-emerald-500 w-3.5 h-3.5" />
            <span className="text-sm text-gray-400 capitalize">{t === "all" ? "All Sellers" : t}</span>
          </label>
        ))}
      </div>
      {/* Rating */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Min Rating</h3>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${minRating === r ? "bg-amber-500/15 text-amber-400 border border-amber-500/25" : "bg-white/[0.03] text-gray-600 border border-transparent hover:text-gray-400"}`}>
              {r === 0 ? "Any" : `${r}★`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard/farmer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /> Dashboard</Link>
            <Link to="/" className="flex items-center gap-2"><span className="text-xl">🌱</span><span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">CarbonX</span></Link>
            <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden p-2 rounded-lg bg-white/[0.04] text-gray-400"><Filter className="w-4 h-4" /></button>
            <div className="hidden lg:block" />
          </div>
          {/* Ticker */}
          <div className="flex items-center gap-6 py-2 text-xs overflow-x-auto border-t border-white/[0.04] scrollbar-hide">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium whitespace-nowrap"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Market Open</span>
            <span className="text-gray-500 whitespace-nowrap">Avg Price: <span className="text-gray-300 font-semibold">₹605</span></span>
            <span className="text-gray-500 whitespace-nowrap">24h Volume: <span className="text-gray-300 font-semibold">1,240 credits</span></span>
            <span className="text-gray-500 whitespace-nowrap">Trending: <span className="text-emerald-400 font-semibold">Tree Plantation ↑</span></span>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Carbon Credit Marketplace</h1>
            <p className="text-sm text-gray-500 mt-0.5">{filtered.length} listings available</p>
          </div>
          <div className="relative w-72 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects or sellers..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 transition-all" />
          </div>
        </div>

        <div className="flex gap-8">
          {/* ════ SIDEBAR ════ */}
          <aside className={`${showFilters ? "fixed inset-0 z-40 bg-black/60 lg:relative lg:bg-transparent" : "hidden"} lg:block lg:w-[240px] flex-shrink-0`}>
            <div className={`${showFilters ? "absolute right-0 top-0 h-full w-72 bg-[#151823] p-6 overflow-y-auto lg:relative lg:w-auto lg:h-auto" : ""} lg:p-0`}>
              {showFilters && <button onClick={() => setShowFilters(false)} className="lg:hidden mb-4 text-gray-400"><X className="w-5 h-5" /></button>}
              <div className="lg:sticky lg:top-28 p-5 rounded-2xl bg-[#151823] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-5">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Filters</span>
                </div>
                {filterContent}
              </div>
            </div>
          </aside>

          {/* ════ LISTINGS ════ */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
              {filtered.map((l) => {
                const badge = TYPE_BADGE[l.projectType] || TYPE_BADGE.tree_plantation;
                return (
                  <div key={l.id} className="group rounded-2xl bg-[#151823] border border-white/[0.06] hover:border-emerald-500/20 overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
                    {/* Image */}
                    <div className="h-36 bg-gradient-to-br from-emerald-600/15 via-green-600/5 to-transparent relative">
                      <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-25 group-hover:scale-110 transition-transform duration-500">
                        {l.projectType === "tree_plantation" ? "🌳" : l.projectType === "soil_carbon" ? "🌾" : "⚡"}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-amber-200 font-semibold">{l.rating}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      {/* Seller */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-300 font-medium truncate">{l.sellerName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${l.sellerType === "farmer" ? "bg-emerald-500/15 text-emerald-400" : "bg-violet-500/15 text-violet-400"}`}>{l.sellerType}</span>
                      </div>
                      {/* Title + badge */}
                      <h3 className="text-white font-semibold text-sm mb-2 leading-snug">{l.projectTitle}</h3>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${badge.bg} ${badge.text} text-[10px] font-semibold uppercase tracking-wider mb-3`}>{badge.label}</div>
                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3"><MapPin className="w-3 h-3" />{l.location}</div>
                      {/* Stats */}
                      <div className="flex items-center justify-between py-3 border-t border-white/[0.04]">
                        <div>
                          <p className="text-lg font-bold text-white">{l.creditsAvailable} <span className="text-xs text-gray-500 font-medium">CC</span></p>
                          <p className="text-[11px] text-gray-600">available</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-400">₹{l.pricePerCredit * 50}</p>
                          <p className="text-[11px] text-gray-600">per credit</p>
                        </div>
                      </div>
                      <button onClick={() => openBuy(l)} className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                        <ShoppingCart className="w-4 h-4" /> Buy Credits
                      </button>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-600">No listings match your filters</div>
              )}
            </div>

            {/* ── AI Recommendation ── */}
            <div className="mb-10 p-6 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/15">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-400 mb-1">AI Market Recommendation</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Based on current market trends, <span className="text-emerald-300 font-medium">Tree Plantation credits from Madhya Pradesh</span> are in high demand. List your credits now for best returns! Average selling price is ₹605/credit — <span className="text-emerald-300 font-medium">12% above last month</span>.</p>
                </div>
              </div>
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
                <h3 className="text-sm font-bold text-white mb-4">Credits Traded by Type</h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tradedByType} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="credits" radius={[6, 6, 0, 0]} barSize={40}>
                        {tradedByType.map((e, i) => <rect key={i} fill={e.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Avg Credit Price — 30 Days</h3>
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold"><TrendingUp className="w-3.5 h-3.5" /> +8.3%</span>
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceHistory} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                      <YAxis domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                      <Tooltip content={<ChartTip />} />
                      <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════ BUY MODAL ════ */}
      {buyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBuyModal(null)} />
          <div className="relative w-full max-w-md bg-[#1a1e2e] border border-white/[0.08] rounded-2xl p-6 shadow-2xl animate-[fadeUp_0.25s_ease-out]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Buy Carbon Credits</h3>
              <button onClick={() => setBuyModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            {/* Listing info */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5">
              <p className="text-sm text-white font-semibold mb-1">{buyModal.projectTitle}</p>
              <p className="text-xs text-gray-500">by {buyModal.sellerName} • {buyModal.location}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gray-400">{buyModal.creditsAvailable} CC available</span>
                <span className="text-xs text-emerald-400 font-semibold">₹{buyModal.pricePerCredit * 50}/credit</span>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Credits to Buy</label>
                <input type="number" min={1} max={buyModal.creditsAvailable} value={buyQty} onChange={(e) => setBuyQty(Math.min(buyModal.creditsAvailable, Math.max(1, parseInt(e.target.value) || 1)))} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-lg font-bold text-center focus:outline-none focus:border-emerald-400/50 transition-all" />
                <input type="range" min={1} max={buyModal.creditsAvailable} value={buyQty} onChange={(e) => setBuyQty(parseInt(e.target.value))} className="w-full mt-2 accent-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Cost</p>
                  <p className="text-xl font-bold text-white">₹{(buyQty * buyModal.pricePerCredit * 50).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">CO₂ Offset</p>
                  <p className="text-xl font-bold text-emerald-400">{buyQty} <span className="text-sm font-medium text-emerald-400/60">tons</span></p>
                </div>
              </div>
              <button onClick={handleBuy} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      <style>{`
        @keyframes fadeUp { 0% { opacity:0; transform:translateY(12px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { 0% { transform:translateX(100%) translateY(-10px); opacity:0; } 100% { transform:translateX(0) translateY(0); opacity:1; } }
      `}</style>
    </div>
  );
}
