import { useState, useEffect } from "react";
import { useMultiPriceSimulator } from "../utils/priceSimulator";

export default function PriceTicker() {
  const { tree, soil, renewable } = useMultiPriceSimulator();
  const [countdown, setCountdown] = useState("4h 23m");

  /* Settlement countdown */
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = 3 - (now.getHours() % 4);
      const m = 59 - now.getMinutes();
      setCountdown(`${h}h ${m < 10 ? "0" : ""}${m}m`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  const items = [
    { emoji: "🌳", label: "Tree Plantation", price: tree.currentPrice, dir: tree.direction },
    { emoji: "🌾", label: "Soil Carbon", price: soil.currentPrice, dir: soil.direction },
    { emoji: "☀️", label: "Renewable", price: renewable.currentPrice, dir: renewable.direction },
    { emoji: "📊", label: "Avg Volume", price: null, extra: `${tree.volume24h.toLocaleString()}` },
    { emoji: "🟢", label: "Market", price: null, extra: "OPEN" },
    { emoji: "⏱️", label: "Next settlement", price: null, extra: countdown },
  ];

  const strip = items.map((it, i) => (
    <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
      <span>{it.emoji}</span>
      <span className="text-gray-500 font-medium">{it.label}</span>
      {it.price != null ? (
        <span className={`font-bold tabular-nums ${it.dir === "up" ? "text-emerald-400" : "text-red-400"}`}>
          ₹{it.price.toFixed(0)} {it.dir === "up" ? "▲" : "▼"}
        </span>
      ) : (
        <span className="font-bold text-gray-300">{it.extra}</span>
      )}
    </span>
  ));

  /* Duplicate for seamless scroll */
  return (
    <div className="relative overflow-hidden bg-[#0d0f16] border-b border-white/[0.04]">
      <div className="flex items-center gap-10 py-1.5 text-[11px] animate-[tickerScroll_30s_linear_infinite] hover:[animation-play-state:paused]" style={{ width: "max-content" }}>
        {strip}
        <span className="text-white/[0.06]">|</span>
        {strip}
        <span className="text-white/[0.06]">|</span>
        {strip}
      </div>
      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
