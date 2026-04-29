import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { X } from "lucide-react";

export default function AchievementPopup() {
  const { achievementPopup, dismissAchievementPopup } = useApp();

  useEffect(() => {
    if (!achievementPopup) return;
    const t = setTimeout(dismissAchievementPopup, 4000);
    return () => clearTimeout(t);
  }, [achievementPopup, dismissAchievementPopup]);

  if (!achievementPopup) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150]" style={{ animation: "slideUpIn 0.5s ease-out" }}>
      <div className="relative px-6 py-4 rounded-2xl bg-[#1a1f2e] border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 flex items-center gap-4 min-w-[340px]">
        {/* Confetti dots */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: ["#10b981","#fbbf24","#f472b6","#818cf8","#38bdf8","#fb923c","#34d399","#a78bfa"][i],
              top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
              animation: `confettiFall ${1 + Math.random()}s ease-in ${Math.random() * 0.5}s forwards`,
              opacity: 0.7,
            }} />
        ))}
        <div className="text-4xl flex-shrink-0">{achievementPopup.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Achievement Unlocked! 🏆</p>
          <p className="text-white font-bold text-sm mt-0.5">{achievementPopup.name}</p>
          <p className="text-gray-400 text-xs mt-0.5">{achievementPopup.desc}</p>
        </div>
        <button onClick={dismissAchievementPopup} className="p-1 rounded-lg hover:bg-white/[0.06] text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
