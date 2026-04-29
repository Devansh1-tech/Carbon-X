import { Star, MapPin, ShoppingCart, Heart } from "lucide-react";

const TYPE_BADGE = {
  tree_plantation: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "🌳 Tree", emoji: "🌳" },
  soil_carbon: { bg: "bg-amber-500/15", text: "text-amber-400", label: "🌾 Soil", emoji: "🌾" },
  renewable_energy: { bg: "bg-sky-500/15", text: "text-sky-400", label: "⚡ Energy", emoji: "⚡" },
};

function Highlight({ text, query }) {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  return <>{text.slice(0, i)}<mark className="search-highlight">{text.slice(i, i + query.length)}</mark>{text.slice(i + query.length)}</>;
}

export function GridCard({ l, search, onBuy, isWished, onWish }) {
  const badge = TYPE_BADGE[l.projectType] || TYPE_BADGE.tree_plantation;
  return (
    <div className="group rounded-2xl bg-[#151823] border border-white/[0.06] hover:border-emerald-500/20 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 marketplace-grid-enter">
      <div className="h-36 bg-gradient-to-br from-emerald-600/15 via-green-600/5 to-transparent relative">
        <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-25 group-hover:scale-110 transition-transform duration-500">{badge.emoji}</div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="text-xs text-amber-200 font-semibold">{l.rating}</span>
        </div>
        <button onClick={() => onWish(l)} className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-rose-500/20 transition-all">
          <Heart className={`w-4 h-4 ${isWished ? "text-rose-400 fill-rose-400" : "text-white/60"}`} />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-300 font-medium truncate"><Highlight text={l.sellerName} query={search} /></span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${l.sellerType === "farmer" ? "bg-emerald-500/15 text-emerald-400" : "bg-violet-500/15 text-violet-400"}`}>{l.sellerType}</span>
        </div>
        <h3 className="text-white font-semibold text-sm mb-2 leading-snug"><Highlight text={l.projectTitle} query={search} /></h3>
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${badge.bg} ${badge.text} text-[10px] font-semibold uppercase tracking-wider mb-3`}>{badge.label}</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3"><MapPin className="w-3 h-3" /><Highlight text={l.location} query={search} /></div>
        <div className="flex items-center justify-between py-3 border-t border-white/[0.04]">
          <div><p className="text-lg font-bold text-white">{l.creditsAvailable} <span className="text-xs text-gray-500 font-medium">CC</span></p><p className="text-[11px] text-gray-600">available</p></div>
          <div className="text-right"><p className="text-lg font-bold text-emerald-400">₹{l.pricePerCredit * 50}</p><p className="text-[11px] text-gray-600">per credit</p></div>
        </div>
        <button onClick={() => onBuy(l)} className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
          <ShoppingCart className="w-4 h-4" /> Buy Credits
        </button>
      </div>
    </div>
  );
}

export function ListRow({ l, search, onBuy, isWished, onWish }) {
  const badge = TYPE_BADGE[l.projectType] || TYPE_BADGE.tree_plantation;
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#151823] border border-white/[0.06] hover:border-emerald-500/20 transition-all marketplace-grid-enter">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600/15 to-transparent flex items-center justify-center text-2xl flex-shrink-0">{badge.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-semibold text-white truncate"><Highlight text={l.projectTitle} query={search} /></h3>
          <span className={`px-1.5 py-0.5 rounded ${badge.bg} ${badge.text} text-[9px] font-bold uppercase hidden sm:inline`}>{badge.label}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span><Highlight text={l.sellerName} query={search} /></span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /><Highlight text={l.location} query={search} /></span>
          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{l.rating}</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0 hidden sm:block"><p className="text-sm font-bold text-white">{l.creditsAvailable} CC</p></div>
      <div className="text-right flex-shrink-0"><p className="text-sm font-bold text-emerald-400">₹{l.pricePerCredit * 50}</p><p className="text-[10px] text-gray-600">per credit</p></div>
      <button onClick={() => onWish(l)} className="p-2 rounded-lg hover:bg-rose-500/10 transition-colors flex-shrink-0">
        <Heart className={`w-4 h-4 ${isWished ? "text-rose-400 fill-rose-400" : "text-gray-600"}`} />
      </button>
      <button onClick={() => onBuy(l)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] text-xs font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex-shrink-0">Buy</button>
    </div>
  );
}
