import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp, MapPin, X } from "lucide-react";
import DualRangeSlider from "./DualRangeSlider";

const TYPE_BADGE = {
  tree_plantation: { label: "🌳 Tree Plantation", bg: "bg-emerald-500/15", text: "text-emerald-400" },
  soil_carbon: { label: "🌾 Soil Carbon", bg: "bg-amber-500/15", text: "text-amber-400" },
  renewable_energy: { label: "☀️ Renewable Energy", bg: "bg-sky-500/15", text: "text-sky-400" },
};

const ALL_STATES = ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Gujarat"];
const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "price_low", label: "Lowest Price" },
  { value: "price_high", label: "Highest Price" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "credits", label: "Most Credits" },
];

export default function MarketplaceFilters({ filters, onChange, onClear, resultCount }) {
  const [sections, setSections] = useState({ type: true, price: true, location: true, rating: true, credits: false, sort: true });
  const [stateSearch, setStateSearch] = useState("");
  const [stateDropOpen, setStateDropOpen] = useState(false);
  const toggle = (s) => setSections((p) => ({ ...p, [s]: !p[s] }));

  const { types, priceRange, selectedStates, nearMe, minRating, creditRange, sortBy } = filters;

  const toggleType = (key) => {
    const next = { ...types, [key]: !types[key] };
    onChange({ ...filters, types: next });
  };

  const setPrice = (v) => onChange({ ...filters, priceRange: v });
  const setCredits = (v) => onChange({ ...filters, creditRange: v });
  const setRating = (r) => onChange({ ...filters, minRating: r });
  const setSort = (v) => onChange({ ...filters, sortBy: v });
  const toggleNearMe = () => onChange({ ...filters, nearMe: !nearMe });

  const toggleState = (s) => {
    const next = selectedStates.includes(s) ? selectedStates.filter((x) => x !== s) : [...selectedStates, s];
    onChange({ ...filters, selectedStates: next });
  };

  const filteredStates = ALL_STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase()));

  const activeCount = Object.values(types).filter((v) => !v).length + (priceRange[0] > 400 || priceRange[1] < 800 ? 1 : 0) + selectedStates.length + (nearMe ? 1 : 0) + (minRating > 0 ? 1 : 0) + (creditRange[0] > 50 || creditRange[1] < 5000 ? 1 : 0);

  const Section = ({ id, title, children }) => (
    <div className="border-b border-white/[0.04] last:border-0">
      <button onClick={() => toggle(id)} className="flex items-center justify-between w-full py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors">
        {title}
        {sections[id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {sections[id] && <div className="pb-4">{children}</div>}
    </div>
  );

  return (
    <div className="p-5 rounded-2xl bg-[#151823] border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold text-white">Filters</span>
          {activeCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">{activeCount}</span>}
        </div>
        {activeCount > 0 && <button onClick={onClear} className="text-[10px] text-gray-500 hover:text-emerald-400 transition-colors">Clear all</button>}
      </div>

      <Section id="type" title="Project Type">
        <div className="flex flex-wrap gap-2">
          {Object.entries(TYPE_BADGE).map(([key, val]) => (
            <button key={key} onClick={() => toggleType(key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${types[key] ? `${val.bg} ${val.text} border border-current/20` : "bg-white/[0.03] text-gray-600 border border-transparent hover:text-gray-400"}`}>
              {val.label}
              {types[key] && <X className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </Section>

      <Section id="price" title="Price Range">
        <DualRangeSlider min={400} max={800} step={10} value={priceRange} onChange={setPrice} formatLabel={(v) => `₹${v}`} />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[["Under ₹500", [400, 500]], ["₹500-₹700", [500, 700]], ["Premium ₹700+", [700, 800]]].map(([label, range]) => (
            <button key={label} onClick={() => setPrice(range)} className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${priceRange[0] === range[0] && priceRange[1] === range[1] ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-white/[0.03] text-gray-600 border border-transparent hover:text-gray-400"}`}>{label}</button>
          ))}
        </div>
      </Section>

      <Section id="location" title="Location">
        <div className="relative mb-2">
          <button onClick={() => setStateDropOpen(!stateDropOpen)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-gray-400 hover:border-emerald-400/30 transition-all">
            <span>{selectedStates.length ? `${selectedStates.length} state(s)` : "Select states"}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {stateDropOpen && (
            <div className="absolute z-10 w-full mt-1 rounded-lg bg-[#1a1e2e] border border-white/[0.1] shadow-xl overflow-hidden">
              <input value={stateSearch} onChange={(e) => setStateSearch(e.target.value)} placeholder="Search states..." className="w-full px-3 py-2 bg-transparent text-sm text-white placeholder-gray-600 border-b border-white/[0.06] outline-none" />
              {filteredStates.map((s) => (
                <button key={s} onClick={() => toggleState(s)} className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/[0.04] transition-colors ${selectedStates.includes(s) ? "text-emerald-400" : "text-gray-400"}`}>
                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] ${selectedStates.includes(s) ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-600"}`}>{selectedStates.includes(s) ? "✓" : ""}</span>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedStates.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">{selectedStates.map((s) => (
            <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
              {s} <button onClick={() => toggleState(s)}><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}</div>
        )}
        <button onClick={toggleNearMe} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${nearMe ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-white/[0.03] text-gray-600 border border-transparent hover:text-gray-400"}`}>
          <MapPin className="w-3 h-3" /> Near me {nearMe && "(Indore, MP)"}
        </button>
      </Section>

      <Section id="rating" title="Minimum Rating">
        <div className="flex gap-1">
          {[0, 3, 4, 5].map((r) => (
            <button key={r} onClick={() => setRating(r)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${minRating === r ? "bg-amber-500/15 text-amber-400 border border-amber-500/25" : "bg-white/[0.03] text-gray-600 border border-transparent hover:text-gray-400"}`}>
              {r === 0 ? "Any" : `${r}★+`}
            </button>
          ))}
        </div>
      </Section>

      <Section id="credits" title="Credits Available">
        <DualRangeSlider min={50} max={5000} step={50} value={creditRange} onChange={setCredits} formatLabel={(v) => `${v}`} />
      </Section>

      <Section id="sort" title="Sort By">
        <select value={sortBy} onChange={(e) => setSort(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-emerald-400/50 transition-all">
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Section>
    </div>
  );
}

export { TYPE_BADGE, ALL_STATES, SORT_OPTIONS };
