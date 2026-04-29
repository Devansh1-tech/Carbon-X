import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  ChevronLeft, Heart, Star, MapPin, ShoppingCart, Trash2,
  Search, X, Check,
} from "lucide-react";

const TYPE_BADGE = {
  tree_plantation: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "🌳 Tree Plantation" },
  soil_carbon: { bg: "bg-amber-500/15", text: "text-amber-400", label: "🌾 Soil Carbon" },
  renewable_energy: { bg: "bg-sky-500/15", text: "text-sky-400", label: "⚡ Renewable Energy" },
};

export default function Watchlist() {
  const { watchlist, toggleWatchlist, buyCredits, currentUser } = useApp();
  const userId = currentUser?.id || "usr_001";
  const [search, setSearch] = useState("");

  const filtered = watchlist.filter((l) =>
    !search ||
    l.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
    l.sellerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <Link to="/marketplace" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to Marketplace
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">CarbonX</span>
            </Link>
            <div />
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8">
        {/* Title + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
              <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
            </div>
            <p className="text-sm text-gray-500">{watchlist.length} saved listing{watchlist.length !== 1 ? "s" : ""}</p>
          </div>
          {watchlist.length > 0 && (
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search watchlist..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 transition-all"
              />
            </div>
          )}
        </div>

        {/* Empty state */}
        {watchlist.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">💚</div>
            <h2 className="text-xl font-bold text-white mb-2">No saved listings yet</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Browse the marketplace and tap the heart icon on listings you want to track. They'll appear here for quick access.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              <ShoppingCart className="w-4 h-4" /> Browse Marketplace
            </Link>
          </div>
        )}

        {/* Watchlist cards */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((l) => {
              const badge = TYPE_BADGE[l.projectType] || TYPE_BADGE.tree_plantation;
              return (
                <div
                  key={l.id}
                  className="group rounded-2xl bg-[#151823] border border-white/[0.06] hover:border-rose-500/20 overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                  style={{ animation: "fadeUp 0.3s ease-out" }}
                >
                  {/* Image area */}
                  <div className="h-32 bg-gradient-to-br from-rose-600/10 via-pink-600/5 to-transparent relative">
                    <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                      {l.projectType === "tree_plantation" ? "🌳" : l.projectType === "soil_carbon" ? "🌾" : "⚡"}
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-amber-200 font-semibold">{l.rating}</span>
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={() => toggleWatchlist(l)}
                      className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-red-500/20 text-rose-400 transition-all"
                      title="Remove from watchlist"
                    >
                      <Heart className="w-4 h-4 fill-rose-400" />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-300 font-medium truncate">{l.sellerName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${l.sellerType === "farmer" ? "bg-emerald-500/15 text-emerald-400" : "bg-violet-500/15 text-violet-400"}`}>
                        {l.sellerType}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-2 leading-snug">{l.projectTitle}</h3>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${badge.bg} ${badge.text} text-[10px] font-semibold uppercase tracking-wider mb-3`}>
                      {badge.label}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                      <MapPin className="w-3 h-3" />{l.location}
                    </div>
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
                    <div className="flex gap-2 mt-2">
                      <Link
                        to="/marketplace"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                      >
                        <ShoppingCart className="w-4 h-4" /> Buy
                      </Link>
                      <button
                        onClick={() => toggleWatchlist(l)}
                        className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && watchlist.length > 0 && (
          <div className="text-center py-16 text-gray-600">No matches in your watchlist</div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { 0% { opacity:0; transform:translateY(12px); } 100% { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
