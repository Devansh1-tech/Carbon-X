import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { mockMarketplace } from "../data/mockMarketplace";
import { Search, X, Check, ChevronLeft, Filter, TrendingUp, ShoppingCart, Bot, LayoutGrid, List, Heart } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { generateMarketInsight } from "../utils/geminiAI";
import LivePriceChart from "../components/LivePriceChart";
import PriceTicker from "../components/PriceTicker";
import MarketplaceFilters from "../components/MarketplaceFilters";
import { GridCard, ListRow } from "../components/MarketplaceCard";

const tradedByType = [
  { type: "Tree Plantation", credits: 820, fill: "#10b981" },
  { type: "Soil Carbon", credits: 340, fill: "#f59e0b" },
  { type: "Renewable", credits: 480, fill: "#0ea5e9" },
];
const priceHistory = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, price: 560 + Math.round(Math.sin(i / 5) * 15 + i * 1.2 + Math.random() * 10) }));

const STATE_MAP = { "Madhya Pradesh": "MP", Maharashtra: "Maharashtra", Rajasthan: "Rajasthan", Gujarat: "Gujarat" };
const DEFAULT_FILTERS = { types: { tree_plantation: true, soil_carbon: true, renewable_energy: true }, priceRange: [400, 800], selectedStates: [], nearMe: false, minRating: 0, creditRange: [50, 5000], sortBy: "popular" };

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (<div className="fixed top-6 right-6 z-[100] animate-[slideIn_0.35s_ease-out]"><div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-xl shadow-2xl"><div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-4 h-4 text-emerald-400" /></div><span className="text-emerald-300 text-sm font-medium">{msg}</span><button onClick={onClose} className="ml-2 text-emerald-400/60 hover:text-emerald-300"><X className="w-4 h-4" /></button></div></div>);
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#1e2235] border border-white/10 rounded-xl px-4 py-2 shadow-xl"><p className="text-gray-400 text-xs">{label}</p><p className="text-emerald-400 font-bold text-sm">{payload[0].value}</p></div>);
}

export default function Marketplace() {
  const { currentUser, buyCredits, watchlist, toggleWatchlist } = useApp();
  const userId = currentUser?.id || "usr_001";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [buyModal, setBuyModal] = useState(null);
  const [buyQty, setBuyQty] = useState(1);
  const [toast, setToast] = useState("");
  const [marketInsight, setMarketInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => { generateMarketInsight().then((t) => { setMarketInsight(t); setInsightLoading(false); }).catch(() => setInsightLoading(false)); }, []);

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    let items = mockMarketplace.filter((l) => {
      if (!filters.types[l.projectType]) return false;
      const dp = l.pricePerCredit * 50;
      if (dp < filters.priceRange[0] || dp > filters.priceRange[1]) return false;
      if (filters.selectedStates.length > 0) {
        const match = filters.selectedStates.some((s) => l.location.includes(STATE_MAP[s] || s));
        if (!match) return false;
      }
      if (filters.nearMe && !l.location.includes("MP") && !l.location.includes("Indore")) return false;
      if (l.rating < filters.minRating) return false;
      if (l.creditsAvailable < filters.creditRange[0] || l.creditsAvailable > filters.creditRange[1]) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!l.projectTitle.toLowerCase().includes(q) && !l.sellerName.toLowerCase().includes(q) && !l.location.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    const s = filters.sortBy;
    if (s === "price_low") items.sort((a, b) => a.pricePerCredit - b.pricePerCredit);
    else if (s === "price_high") items.sort((a, b) => b.pricePerCredit - a.pricePerCredit);
    else if (s === "rating") items.sort((a, b) => b.rating - a.rating);
    else if (s === "newest") items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    else if (s === "credits") items.sort((a, b) => b.creditsAvailable - a.creditsAvailable);
    return items;
  }, [filters, search]);

  const handleBuy = useCallback(() => {
    if (!buyModal) return;
    buyCredits(buyModal.id, buyQty, userId);
    setToast(`✅ ${buyQty} credits added to your wallet!`);
    setBuyModal(null); setBuyQty(1);
  }, [buyModal, buyQty, buyCredits, userId]);

  const openBuy = (l) => { setBuyModal(l); setBuyQty(1); };
  const isWished = (l) => watchlist.some((w) => w.id === l.id);

  // Build summary
  const summaryParts = [];
  const activeTypes = Object.entries(filters.types).filter(([, v]) => !v);
  if (activeTypes.length > 0 && activeTypes.length < 3) {
    const on = Object.entries(filters.types).filter(([, v]) => v).map(([k]) => k === "tree_plantation" ? "Tree" : k === "soil_carbon" ? "Soil" : "Energy");
    summaryParts.push(...on);
  }
  if (filters.selectedStates.length) summaryParts.push(...filters.selectedStates.map((s) => STATE_MAP[s] || s));
  if (filters.priceRange[1] < 800) summaryParts.push(`Under ₹${filters.priceRange[1]}`);
  if (filters.minRating > 0) summaryParts.push(`${filters.minRating}★+`);
  const hasActiveFilters = summaryParts.length > 0;

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard/farmer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /> Dashboard</Link>
            <Link to="/" className="flex items-center gap-2"><span className="text-xl">🌱</span><span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">CarbonX</span></Link>
            <div className="flex items-center gap-2">
              <Link to="/watchlist" className="p-2 rounded-lg bg-white/[0.04] text-gray-400 hover:text-rose-400 transition-colors relative">
                <Heart className={`w-4 h-4 ${watchlist.length > 0 ? "text-rose-400 fill-rose-400" : ""}`} />
                {watchlist.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">{watchlist.length}</span>}
              </Link>
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden p-2 rounded-lg bg-white/[0.04] text-gray-400"><Filter className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex items-center gap-6 py-2 text-xs overflow-x-auto border-t border-white/[0.04] scrollbar-hide">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium whitespace-nowrap"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Market Open</span>
            <span className="text-gray-500 whitespace-nowrap">Avg Price: <span className="text-gray-300 font-semibold">₹605</span></span>
            <span className="text-gray-500 whitespace-nowrap">24h Volume: <span className="text-gray-300 font-semibold">1,240 credits</span></span>
            {insightLoading ? <span className="flex items-center gap-1.5 whitespace-nowrap"><Bot className="w-3 h-3 text-violet-400" /><span className="h-3 w-36 rounded bg-white/[0.06] animate-pulse inline-block" /></span> : marketInsight ? <span className="flex items-center gap-1.5 text-violet-400 whitespace-nowrap font-medium"><Bot className="w-3 h-3" /> {marketInsight}</span> : null}
          </div>
        </div>
      </header>

      <PriceTicker />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <div className="mb-8"><LivePriceChart /></div>

        {/* Title + Search + View Toggle */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Carbon Credit Marketplace</h1>
            <p className="text-sm text-gray-500 mt-0.5">{filtered.length} listings available</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects, sellers, locations..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 transition-all" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex rounded-xl overflow-hidden border border-white/[0.08]">
              <button onClick={() => setViewMode("grid")} className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.04] text-gray-600 hover:text-gray-400"}`} title="Grid view"><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("list")} className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.04] text-gray-600 hover:text-gray-400"}`} title="List view"><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Active Filter Summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-xs text-gray-500 whitespace-nowrap">Showing {filtered.length} results for:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {summaryParts.map((p) => <span key={p} className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">{p}</span>)}
            </div>
            <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-[10px] text-gray-500 hover:text-rose-400 transition-colors whitespace-nowrap"><X className="w-3 h-3" /> Clear all</button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`${showFilters ? "fixed inset-0 z-40 bg-black/60 lg:relative lg:bg-transparent" : "hidden"} lg:block lg:w-[260px] flex-shrink-0`}>
            <div className={`${showFilters ? "absolute right-0 top-0 h-full w-72 bg-[#151823] p-6 overflow-y-auto lg:relative lg:w-auto lg:h-auto" : ""} lg:p-0`}>
              {showFilters && <button onClick={() => setShowFilters(false)} className="lg:hidden mb-4 text-gray-400"><X className="w-5 h-5" /></button>}
              <div className="lg:sticky lg:top-28">
                <MarketplaceFilters filters={filters} onChange={setFilters} onClear={clearFilters} resultCount={filtered.length} />
              </div>
            </div>
          </aside>

          {/* Listings */}
          <div className="flex-1 min-w-0">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
                {filtered.map((l) => <GridCard key={l.id} l={l} search={search} onBuy={openBuy} isWished={isWished(l)} onWish={toggleWatchlist} />)}
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-10">
                {filtered.map((l) => <ListRow key={l.id} l={l} search={search} onBuy={openBuy} isWished={isWished(l)} onWish={toggleWatchlist} />)}
              </div>
            )}

            {/* No results */}
            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-white mb-2">{search ? `No results for "${search}"` : "No listings match"}</h3>
                <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                <div className="flex items-center justify-center gap-2">
                  {search && <button onClick={() => setSearch("")} className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-gray-400 hover:text-white transition-colors">Clear search</button>}
                  <button onClick={clearFilters} className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-sm text-emerald-400 hover:bg-emerald-500/25 transition-colors">Reset filters</button>
                </div>
                <div className="mt-6 text-xs text-gray-600">Suggestions: Try "Solar", "Narmada", or "Maharashtra"</div>
              </div>
            )}

            {/* AI Recommendation */}
            <div className="mb-10 p-6 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/15">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-400 mb-1">AI Market Recommendation</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Based on current market trends, <span className="text-emerald-300 font-medium">Tree Plantation credits from Madhya Pradesh</span> are in high demand. Average selling price is ₹605/credit — <span className="text-emerald-300 font-medium">12% above last month</span>.</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
                <h3 className="text-sm font-bold text-white mb-4">Credits Traded by Type</h3>
                <div className="h-[220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={tradedByType} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} /><XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} /><Tooltip content={<ChartTip />} /><Bar dataKey="credits" radius={[6, 6, 0, 0]} barSize={40}>{tradedByType.map((e, i) => <rect key={i} fill={e.fill} />)}</Bar></BarChart></ResponsiveContainer></div>
              </div>
              <div className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-white">Avg Credit Price — 30 Days</h3><span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold"><TrendingUp className="w-3.5 h-3.5" /> +8.3%</span></div>
                <div className="h-[220px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={priceHistory} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} /><YAxis domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} /><Tooltip content={<ChartTip />} /><Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {buyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBuyModal(null)} />
          <div className="relative w-full max-w-md bg-[#1a1e2e] border border-white/[0.08] rounded-2xl p-6 shadow-2xl animate-[fadeUp_0.25s_ease-out]">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-white">Buy Carbon Credits</h3><button onClick={() => setBuyModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors"><X className="w-4 h-4" /></button></div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5">
              <p className="text-sm text-white font-semibold mb-1">{buyModal.projectTitle}</p>
              <p className="text-xs text-gray-500">by {buyModal.sellerName} • {buyModal.location}</p>
              <div className="flex items-center gap-3 mt-2"><span className="text-xs text-gray-400">{buyModal.creditsAvailable} CC available</span><span className="text-xs text-emerald-400 font-semibold">₹{buyModal.pricePerCredit * 50}/credit</span></div>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Credits to Buy</label>
                <input type="number" min={1} max={buyModal.creditsAvailable} value={buyQty} onChange={(e) => setBuyQty(Math.min(buyModal.creditsAvailable, Math.max(1, parseInt(e.target.value) || 1)))} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-lg font-bold text-center focus:outline-none focus:border-emerald-400/50 transition-all" />
                <input type="range" min={1} max={buyModal.creditsAvailable} value={buyQty} onChange={(e) => setBuyQty(parseInt(e.target.value))} className="w-full mt-2 accent-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.04]"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Cost</p><p className="text-xl font-bold text-white">₹{(buyQty * buyModal.pricePerCredit * 50).toLocaleString()}</p></div>
                <div className="p-3 rounded-xl bg-emerald-500/[0.06]"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">CO₂ Offset</p><p className="text-xl font-bold text-emerald-400">{buyQty} <span className="text-sm font-medium text-emerald-400/60">tons</span></p></div>
              </div>
              <button onClick={handleBuy} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Confirm Purchase</button>
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
