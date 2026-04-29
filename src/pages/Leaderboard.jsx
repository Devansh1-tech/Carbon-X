import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { mockUsers } from "../data/mockUsers";
import { getBadge } from "../utils/badges";
import { ArrowLeft, ChevronUp, ChevronDown, Trophy, Medal, Award } from "lucide-react";

const FILTERS = ["All", "Farmers", "NGOs", "This Month", "All Time"];

function getLeaderboardUsers() {
  return mockUsers
    .filter(u => u.role !== "admin" && u.role !== "company")
    .map(u => ({
      ...u,
      state: u.location?.split(", ")[1] || "—",
      badge: getBadge(u.creditsEarned || 0),
    }))
    .sort((a, b) => (b.creditsEarned || 0) - (a.creditsEarned || 0));
}

/* ═══ PODIUM ═══ */
function Podium({ users }) {
  const order = [users[1], users[0], users[2]]; // 2nd, 1st, 3rd
  const heights = ["h-28", "h-36", "h-24"];
  const borders = ["border-gray-300/40", "border-yellow-400/50", "border-amber-600/40"];
  const bgs = ["from-gray-400/10 to-gray-400/[0.02]", "from-yellow-400/15 to-yellow-400/[0.02]", "from-amber-600/10 to-amber-600/[0.02]"];
  const ranks = ["2nd", "1st", "3rd"];
  const rankColors = ["text-gray-300", "text-yellow-400", "text-amber-500"];

  return (
    <div className="flex items-end justify-center gap-4 mb-10">
      {order.map((u, i) => {
        if (!u) return null;
        const isFirst = i === 1;
        return (
          <div key={u.id} className="flex flex-col items-center" style={{ animation: `podiumRise 0.6s ease-out ${i * 0.15}s both` }}>
            {isFirst && <span className="text-2xl mb-1">👑</span>}
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${bgs[i]} border-2 ${borders[i]} flex items-center justify-center text-3xl mb-2 ${isFirst ? "w-20 h-20 shadow-lg shadow-yellow-400/10" : ""}`}>
              {u.avatar}
            </div>
            <p className="text-white font-bold text-sm text-center max-w-[120px] truncate">{u.name}</p>
            <p className="text-gray-500 text-[10px]">{u.state}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs">{u.badge.emoji}</span>
              <span className={`text-xs font-bold ${rankColors[i]}`}>{(u.creditsEarned || 0).toLocaleString()} credits</span>
            </div>
            <div className={`mt-2 w-24 ${heights[i]} rounded-t-xl bg-gradient-to-t ${bgs[i]} border ${borders[i]} border-b-0 flex items-end justify-center pb-2`}
              style={{ transformOrigin: "bottom", animation: `podiumRise 0.5s ease-out ${0.3 + i * 0.15}s both` }}>
              <span className={`text-lg font-black ${rankColors[i]}`}>{ranks[i]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══ SORT ICON ═══ */
function SortIcon({ column, sortBy, sortDir }) {
  if (sortBy !== column) return <ChevronUp className="w-3 h-3 text-gray-700 ml-1 inline" />;
  return sortDir === "asc"
    ? <ChevronUp className="w-3 h-3 text-emerald-400 ml-1 inline" />
    : <ChevronDown className="w-3 h-3 text-emerald-400 ml-1 inline" />;
}

/* ═══ LEADERBOARD PAGE ═══ */
export default function Leaderboard() {
  const { currentUser } = useApp();
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("creditsEarned");
  const [sortDir, setSortDir] = useState("desc");

  const allUsers = useMemo(() => getLeaderboardUsers(), []);

  const filtered = useMemo(() => {
    let list = [...allUsers];
    if (filter === "Farmers") list = list.filter(u => u.role === "farmer");
    if (filter === "NGOs") list = list.filter(u => u.role === "ngo");
    // "This Month" and "All Time" use same data in mock
    return list;
  }, [allUsers, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortBy] || 0;
      const bv = b[sortBy] || 0;
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [filtered, sortBy, sortDir]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const columns = [
    { key: "creditsEarned", label: "Credits" },
    { key: "projectsSubmitted", label: "Projects" },
    { key: "treesPlanted", label: "Trees" },
    { key: "co2Saved", label: "CO₂ Saved" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/farmer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="w-px h-6 bg-white/[0.06]" />
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h1 className="text-xl font-bold text-white">Leaderboard</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Podium */}
        <Podium users={sorted.slice(0, 3)} />

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${filter === f
                ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-400"
                : "bg-white/[0.03] border-white/[0.06] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300"}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-[#151823] border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  {columns.map(c => (
                    <th key={c.key} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none"
                      onClick={() => handleSort(c.key)}>
                      {c.label} <SortIcon column={c.key} sortBy={sortBy} sortDir={sortDir} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Badge</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((u, i) => {
                  const isMe = currentUser?.id === u.id;
                  return (
                    <tr key={u.id}
                      className={`border-b border-white/[0.03] transition-colors ${isMe ? "bg-emerald-500/[0.06]" : "hover:bg-white/[0.02]"}`}
                      style={{ animation: `stepSlideIn 0.3s ease-out ${i * 0.04}s both` }}>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-500" : "text-gray-600"}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{u.avatar}</span>
                          <div>
                            <p className={`font-semibold ${isMe ? "text-emerald-400" : "text-white"}`}>{u.name} {isMe && <span className="text-[10px] text-emerald-400/70">(You)</span>}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{u.state}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${u.role === "farmer" ? "bg-emerald-500/10 text-emerald-400" : "bg-purple-500/10 text-purple-400"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-bold">{(u.creditsEarned || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-300">{u.projectsSubmitted || 0}</td>
                      <td className="px-4 py-3 text-gray-300">{(u.treesPlanted || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-300">{(u.co2Saved || 0).toLocaleString()} t</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1">
                          <span>{u.badge.emoji}</span>
                          <span className={`text-xs font-medium ${u.badge.color}`}>{u.badge.name}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
