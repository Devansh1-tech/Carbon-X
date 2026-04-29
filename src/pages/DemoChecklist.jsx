import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, CheckCircle2, Circle, RotateCcw } from "lucide-react";

const CHECKLIST = [
  { id: 1, text: "Landing page loads and counter animates", category: "Core" },
  { id: 2, text: "Farmer login works and shows correct credits", category: "Auth" },
  { id: 3, text: "Project submission form — all 3 steps work", category: "Core" },
  { id: 4, text: "AI verification animation runs", category: "Core" },
  { id: 5, text: "Credits appear in wallet after submission", category: "Core" },
  { id: 6, text: "Marketplace listings visible and filterable", category: "Marketplace" },
  { id: 7, text: "Company dashboard shows emission gauge", category: "Dashboard" },
  { id: 8, text: "Purchase updates company offset %", category: "Core" },
  { id: 9, text: "Admin can verify pending projects", category: "Admin" },
  { id: 10, text: "Certificate downloads", category: "Feature" },
  { id: 11, text: "Demo controller switches users", category: "Demo" },
  { id: 12, text: "Map shows project markers", category: "Feature" },
  { id: 13, text: "Price ticker scrolls", category: "UI" },
  { id: 14, text: "All charts render", category: "UI" },
];

const CAT_COLORS = {
  Core: "bg-emerald-500/15 text-emerald-400",
  Auth: "bg-sky-500/15 text-sky-400",
  Marketplace: "bg-amber-500/15 text-amber-400",
  Dashboard: "bg-violet-500/15 text-violet-400",
  Admin: "bg-rose-500/15 text-rose-400",
  Feature: "bg-cyan-500/15 text-cyan-400",
  Demo: "bg-orange-500/15 text-orange-400",
  UI: "bg-indigo-500/15 text-indigo-400",
};

export default function DemoChecklist() {
  const [checked, setChecked] = useState({});
  const toggle = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const reset = () => setChecked({});

  const done = Object.values(checked).filter(Boolean).length;
  const total = CHECKLIST.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/dashboard/farmer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-sm font-bold text-white">🧪 Pre-Demo Checklist</span>
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] text-gray-500 hover:text-gray-300 text-xs transition-colors active:scale-95">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="mb-8 p-5 rounded-2xl bg-[#151823] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">{done}/{total} Ready</h2>
            <span className={`text-sm font-bold ${pct === 100 ? "text-emerald-400" : pct >= 70 ? "text-amber-400" : "text-gray-500"}`}>{pct}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-gradient-to-r from-emerald-500 to-green-400" : pct >= 70 ? "bg-gradient-to-r from-amber-500 to-yellow-400" : "bg-gradient-to-r from-gray-600 to-gray-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct === 100 && <p className="text-emerald-400 text-sm font-medium mt-3 text-center">🎉 All checks passed! Ready to present!</p>}
        </div>

        {/* Items */}
        <div className="space-y-2">
          {CHECKLIST.map((item) => (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl border transition-all active:scale-[0.99] text-left ${
                checked[item.id]
                  ? "bg-emerald-500/[0.06] border-emerald-500/20"
                  : "bg-[#151823] border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              {checked[item.id]
                ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                : <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
              }
              <span className={`text-sm font-medium flex-1 ${checked[item.id] ? "text-emerald-300 line-through" : "text-gray-300"}`}>
                {item.text}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${CAT_COLORS[item.category] || CAT_COLORS.Core}`}>
                {item.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
