import { useState } from "react";
import { usePriceSimulator } from "../utils/priceSimulator";
import { TrendingUp, TrendingDown, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot,
} from "recharts";

/* ── Tooltip ── */
function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1a1e2e] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl">
      <p className="text-gray-500 text-[10px] mb-0.5">{d.time}</p>
      <p className="text-white font-bold text-sm">₹{d.price.toFixed(2)}</p>
    </div>
  );
}

/* ── Time range filter tabs ── */
const RANGES = ["1H", "6H", "24H", "7D"];

export default function LivePriceChart() {
  const { currentPrice, priceChange, percentChange, direction, priceHistory, high24h, low24h, volume24h } = usePriceSimulator(608, 50);
  const [range, setRange] = useState("1H");

  const up = direction === "up";
  const color = up ? "#10b981" : "#ef4444";
  const last = priceHistory[priceHistory.length - 1];

  /* Slice data based on range tab (simulated) */
  const dataMap = { "1H": 20, "6H": 35, "24H": 50, "7D": 50 };
  const sliced = priceHistory.slice(-(dataMap[range] || 50));

  return (
    <div className="rounded-2xl bg-[#151823] border border-white/[0.06] overflow-hidden">
      {/* ── Header ── */}
      <div className="p-5 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          {/* Price display */}
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">Carbon Credit / INR</p>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-white tabular-nums">₹{currentPrice.toFixed(2)}</span>
              <span className={`flex items-center gap-1 text-sm font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
                {up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {up ? "+" : ""}₹{priceChange.toFixed(2)} ({up ? "+" : ""}{percentChange}%)
              </span>
            </div>
          </div>
          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center px-3">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider">24h High</p>
              <p className="text-sm font-bold text-emerald-400 tabular-nums">₹{high24h.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="text-center px-3">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider">24h Low</p>
              <p className="text-sm font-bold text-red-400 tabular-nums">₹{low24h.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="text-center px-3">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider">Volume</p>
              <p className="text-sm font-bold text-gray-300 tabular-nums">{volume24h.toLocaleString()}</p>
            </div>
          </div>
        </div>
        {/* Range tabs */}
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${range === r ? (up ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400") : "text-gray-600 hover:text-gray-400"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="h-[200px] px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sliced} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={["dataMin - 5", "dataMax + 5"]} hide />
            <Tooltip content={<ChartTip />} />
            <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#priceGrad)" />
            {last && (
              <ReferenceDot x={last.time} y={last.price} r={5} fill={color} stroke={color} strokeWidth={2}>
              </ReferenceDot>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pulse dot legend */}
      <div className="px-5 pb-4 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: color }} />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
        </span>
        <span className="text-[11px] text-gray-500">Live • Updates every 3s</span>
      </div>
    </div>
  );
}
