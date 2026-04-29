import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ArrowUp, ArrowDown, CornerDownLeft, Clock, FileText, ShoppingBag, Zap, Command } from "lucide-react";
import { mockMarketplace } from "../data/mockMarketplace";

/* ── Static page & action data ── */
const PAGES = [
  { id: "p1", label: "Dashboard", path: "/dashboard/farmer", icon: "📊", keywords: "dashboard home main overview" },
  { id: "p2", label: "Marketplace", path: "/marketplace", icon: "🏪", keywords: "marketplace buy sell credits trading" },
  { id: "p3", label: "Wallet", path: "/wallet", icon: "💰", keywords: "wallet balance credits money transactions" },
  { id: "p4", label: "Analytics", path: "/analytics", icon: "📈", keywords: "analytics charts data insights reports" },
  { id: "p5", label: "Submit Project", path: "/submit-project", icon: "📝", keywords: "submit project new create add" },
  { id: "p6", label: "Admin Panel", path: "/dashboard/admin", icon: "🛡️", keywords: "admin manage verify approve" },
  { id: "p7", label: "Company Dashboard", path: "/dashboard/company", icon: "🏢", keywords: "company corporate offset" },
  { id: "p8", label: "Watchlist", path: "/watchlist", icon: "❤️", keywords: "watchlist saved favorites wishlist heart" },
];

const ACTIONS = [
  { id: "a1", label: "Submit New Project", path: "/submit-project", icon: "🌱", keywords: "submit project new create" },
  { id: "a2", label: "Buy Carbon Credits", path: "/marketplace", icon: "🛒", keywords: "buy purchase credits marketplace" },
  { id: "a3", label: "View Certificate", path: "/wallet", icon: "📜", keywords: "certificate view download proof" },
  { id: "a4", label: "View Transactions", path: "/wallet", icon: "💳", keywords: "transactions history payments" },
  { id: "a5", label: "Check Market Trends", path: "/analytics", icon: "📊", keywords: "trends market price chart analysis" },
];

const TYPE_EMOJI = {
  tree_plantation: "🌳",
  soil_carbon: "🌾",
  renewable_energy: "⚡",
};

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  /* ── Focus input when opened ── */
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  /* ── Keyboard shortcut: Ctrl+K ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          // Trigger open from parent
          document.dispatchEvent(new CustomEvent("toggle-global-search"));
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  /* ── Build flat results ── */
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const matchedPages = PAGES.filter(
      (p) => p.label.toLowerCase().includes(q) || p.keywords.includes(q)
    ).map((p) => ({ ...p, category: "Pages", categoryIcon: <FileText className="w-3.5 h-3.5" /> }));

    const matchedProjects = mockMarketplace
      .filter(
        (p) =>
          p.projectTitle.toLowerCase().includes(q) ||
          p.sellerName.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      )
      .map((p) => ({
        id: p.id,
        label: p.projectTitle,
        sublabel: `${p.sellerName} • ${p.location}`,
        path: "/marketplace",
        icon: TYPE_EMOJI[p.projectType] || "🌿",
        category: "Projects",
        categoryIcon: <ShoppingBag className="w-3.5 h-3.5" />,
      }));

    const matchedActions = ACTIONS.filter(
      (a) => a.label.toLowerCase().includes(q) || a.keywords.includes(q)
    ).map((a) => ({ ...a, category: "Actions", categoryIcon: <Zap className="w-3.5 h-3.5" /> }));

    return [...matchedPages, ...matchedProjects, ...matchedActions];
  }, [query]);

  /* ── Recent searches (when no query) ── */
  const displayItems = useMemo(() => {
    if (query.trim()) return results;
    if (recentSearches.length === 0) return [];
    return recentSearches.map((r) => ({
      id: `recent_${r}`,
      label: r,
      category: "Recent",
      categoryIcon: <Clock className="w-3.5 h-3.5" />,
      isRecent: true,
    }));
  }, [query, results, recentSearches]);

  /* ── Clamp selected index ── */
  useEffect(() => {
    if (selectedIndex >= displayItems.length) {
      setSelectedIndex(Math.max(0, displayItems.length - 1));
    }
  }, [displayItems, selectedIndex]);

  /* ── Scroll selected into view ── */
  useEffect(() => {
    if (resultsRef.current) {
      const el = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  /* ── Navigate to result ── */
  const goToResult = useCallback(
    (item) => {
      if (item.isRecent) {
        setQuery(item.label);
        return;
      }
      // Save to recent
      setRecentSearches((prev) => {
        const updated = [query.trim(), ...prev.filter((s) => s !== query.trim())].slice(0, 5);
        return updated;
      });
      onClose();
      if (item.path) navigate(item.path);
    },
    [query, navigate, onClose]
  );

  /* ── Keyboard nav ── */
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, displayItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && displayItems[selectedIndex]) {
      e.preventDefault();
      goToResult(displayItems[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  /* ── Group results by category ── */
  const grouped = {};
  displayItems.forEach((item) => {
    const cat = item.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]" style={{ animation: "backdropFadeIn 0.15s ease-out" }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Search card */}
      <div className="relative w-full max-w-[600px] mx-4 bg-[#1a1e2e] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden" style={{ animation: "globalSearchSlideIn 0.2s ease-out" }}>
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, projects, actions..."
            className="flex-1 bg-transparent text-white text-[15px] placeholder-gray-500 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] text-gray-500 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-[360px] overflow-y-auto py-2 globalSearchScrollbar">
          {Object.keys(grouped).length === 0 && query.trim() && (
            <div className="px-5 py-10 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <p className="text-gray-400 text-sm font-medium mb-1">No results for "{query}"</p>
              <p className="text-gray-600 text-xs">Try searching for pages, projects, or actions</p>
            </div>
          )}
          {Object.keys(grouped).length === 0 && !query.trim() && (
            <div className="px-5 py-8 text-center">
              <p className="text-gray-500 text-sm">Start typing to search...</p>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-600">
                <span>Try:</span>
                {["marketplace", "solar", "wallet"].map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-gray-400 transition-colors">{s}</button>
                ))}
              </div>
            </div>
          )}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {items[0]?.categoryIcon}
                {category}
              </div>
              {items.map((item) => {
                const idx = flatIndex++;
                return (
                  <button
                    key={item.id}
                    data-index={idx}
                    onClick={() => goToResult(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                      idx === selectedIndex ? "bg-emerald-500/10 text-white" : "text-gray-400 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon || (item.isRecent ? "🕐" : "📄")}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${idx === selectedIndex ? "text-white" : "text-gray-300"}`}>{item.label}</p>
                      {item.sublabel && <p className="text-[11px] text-gray-500 truncate">{item.sublabel}</p>}
                    </div>
                    {idx === selectedIndex && (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <CornerDownLeft className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/[0.06] bg-[#151823]">
          <div className="flex items-center gap-4 text-[10px] text-gray-600">
            <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> Navigate</span>
            <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> Select</span>
            <span className="flex items-center gap-1">ESC Close</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-600">
            <Command className="w-3 h-3" /> + K
          </div>
        </div>
      </div>
    </div>
  );
}
