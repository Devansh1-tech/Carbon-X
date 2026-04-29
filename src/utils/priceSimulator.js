import { useState, useEffect, useRef, useCallback } from "react";

/* ── Generate initial history ── */
function generateInitialHistory(basePrice, count) {
  const arr = [];
  let p = basePrice;
  const now = Date.now();
  for (let i = count; i > 0; i--) {
    const change = (Math.random() - 0.48) * basePrice * 0.012;
    p = Math.max(basePrice * 0.85, Math.min(basePrice * 1.15, p + change));
    arr.push({ time: new Date(now - i * 3000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }), price: +p.toFixed(2), ts: now - i * 3000 });
  }
  return arr;
}

export function usePriceSimulator(basePrice = 608, historySize = 50) {
  const [priceHistory, setPriceHistory] = useState(() => generateInitialHistory(basePrice, historySize));
  const priceRef = useRef(priceHistory[priceHistory.length - 1]?.price || basePrice);
  const openRef = useRef(basePrice);

  const tick = useCallback(() => {
    const prev = priceRef.current;
    const isSpike = Math.random() < 0.05;
    const maxMove = isSpike ? 0.05 : 0.02;
    const minMove = isSpike ? 0.02 : 0.005;
    const pct = (minMove + Math.random() * (maxMove - minMove)) * (Math.random() > 0.48 ? 1 : -1);
    const next = +(prev * (1 + pct)).toFixed(2);
    const clamped = Math.max(basePrice * 0.8, Math.min(basePrice * 1.2, next));
    priceRef.current = clamped;
    const now = Date.now();
    setPriceHistory((h) => {
      const updated = [...h, { time: new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }), price: clamped, ts: now }];
      return updated.slice(-historySize);
    });
  }, [basePrice, historySize]);

  useEffect(() => {
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [tick]);

  const currentPrice = priceHistory[priceHistory.length - 1]?.price || basePrice;
  const priceChange = +(currentPrice - openRef.current).toFixed(2);
  const percentChange = +((priceChange / openRef.current) * 100).toFixed(2);
  const direction = priceChange >= 0 ? "up" : "down";
  const prices = priceHistory.map((p) => p.price);
  const high24h = Math.max(...prices);
  const low24h = Math.min(...prices);
  const volume24h = 1240 + Math.floor(Math.sin(Date.now() / 60000) * 80);

  return { currentPrice, priceChange, percentChange, direction, priceHistory, high24h, low24h, volume24h };
}

/* ── Multi-asset simulator (for ticker) ── */
export function useMultiPriceSimulator() {
  const tree = usePriceSimulator(608, 20);
  const soil = usePriceSimulator(542, 20);
  const renewable = usePriceSimulator(724, 20);
  return { tree, soil, renewable };
}
