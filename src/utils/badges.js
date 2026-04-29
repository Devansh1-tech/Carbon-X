const BADGE_TIERS = [
  { name: "Seedling", emoji: "🌱", min: 0, max: 50, color: "text-gray-400", bg: "bg-gray-500/15" },
  { name: "Sprout", emoji: "🌿", min: 51, max: 200, color: "text-green-400", bg: "bg-green-500/15" },
  { name: "Sapling", emoji: "🌳", min: 201, max: 500, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  { name: "Oak", emoji: "🌲", min: 501, max: 1000, color: "text-teal-400", bg: "bg-teal-500/15" },
  { name: "Carbon Champion", emoji: "🏆", min: 1001, max: 5000, color: "text-amber-400", bg: "bg-amber-500/15" },
  { name: "Climate Legend", emoji: "👑", min: 5001, max: Infinity, color: "text-yellow-300", bg: "bg-yellow-500/15" },
];

export function getBadge(credits) {
  const tier = BADGE_TIERS.find(t => credits >= t.min && credits <= t.max) || BADGE_TIERS[0];
  return tier;
}

export function getNextBadge(credits) {
  const currentIdx = BADGE_TIERS.findIndex(t => credits >= t.min && credits <= t.max);
  if (currentIdx === -1 || currentIdx >= BADGE_TIERS.length - 1) {
    return { name: "Max Level", emoji: "👑", threshold: credits, progress: 100, remaining: 0 };
  }
  const next = BADGE_TIERS[currentIdx + 1];
  const current = BADGE_TIERS[currentIdx];
  const progressInTier = credits - current.min;
  const tierRange = next.min - current.min;
  const progress = Math.min(Math.round((progressInTier / tierRange) * 100), 100);
  return {
    name: next.name,
    emoji: next.emoji,
    threshold: next.min,
    progress,
    remaining: next.min - credits,
  };
}

export { BADGE_TIERS };
