import { useEffect, useState } from "react";

const COLORS = ["#10b981", "#34d399", "#fbbf24", "#f472b6", "#60a5fa", "#a78bfa", "#fb923c", "#f87171"];

export default function ConfettiBurst({ trigger, x = 0, y = 0 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;
    const dots = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: (Math.random() * 360) * (Math.PI / 180),
      velocity: 60 + Math.random() * 120,
      size: 4 + Math.random() * 6,
    }));
    setParticles(dots);
    const t = setTimeout(() => setParticles([]), 1000);
    return () => clearTimeout(t);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none">
      {particles.map((p) => {
        const dx = Math.cos(p.angle) * p.velocity;
        const dy = Math.sin(p.angle) * p.velocity;
        return (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: x, top: y,
              width: p.size, height: p.size,
              backgroundColor: p.color,
              animation: `confettiDot 0.8s ease-out forwards`,
              "--dx": `${dx}px`, "--dy": `${dy}px`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confettiDot {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
