export const ACHIEVEMENTS = [
  { id: "first_green_step", name: "First Green Step", emoji: "🌱", desc: "Submit your first project", check: (s) => s.projects.filter(p => p.userId === s.currentUser?.id).length >= 1 },
  { id: "verification_victor", name: "Verification Victor", emoji: "✅", desc: "Get your first project verified", check: (s) => s.projects.filter(p => p.userId === s.currentUser?.id && p.status === "verified").length >= 1 },
  { id: "marketplace_maven", name: "Marketplace Maven", emoji: "🛒", desc: "Complete your first purchase", check: (s) => s.wallet.transactions.length >= 1 },
  { id: "century_saver", name: "Century Saver", emoji: "💯", desc: "Earn 100 carbon credits", check: (s) => (s.currentUser?.creditsEarned || 0) + s.wallet.balance >= 100 },
  { id: "tree_hugger", name: "Tree Hugger", emoji: "🌳", desc: "Plant 1,000 trees across projects", check: (s) => (s.currentUser?.treesPlanted || 0) >= 1000 },
  { id: "carbon_crusher", name: "Carbon Crusher", emoji: "💪", desc: "Save 50 tons of CO₂", check: (s) => (s.currentUser?.co2Saved || 0) >= 50 },
  { id: "consistent_contributor", name: "Consistent Contributor", emoji: "⭐", desc: "Submit 5 projects", check: (s) => s.projects.filter(p => p.userId === s.currentUser?.id).length >= 5 },
];

export function checkAchievements(state) {
  if (!state.currentUser) return [];
  const unlocked = state.unlockedAchievements || [];
  const newlyUnlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (!unlocked.includes(ach.id) && ach.check(state)) {
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
}

export function getAchievement(id) {
  return ACHIEVEMENTS.find(a => a.id === id);
}
