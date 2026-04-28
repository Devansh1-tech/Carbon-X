import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Bell, LogOut, X, ChevronDown } from "lucide-react";

export default function SharedNavbar() {
  const { currentUser, wallet, notifications, logout, clearNotifications } = useApp();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const dropRef = useRef(null);

  const user = currentUser || { name: "User", role: "farmer", avatar: "👤" };
  const balance = wallet?.balance || 0;

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const roleBadge = {
    farmer: "bg-emerald-500/15 text-emerald-400",
    ngo: "bg-violet-500/15 text-violet-400",
    company: "bg-sky-500/15 text-sky-400",
    admin: "bg-amber-500/15 text-amber-400",
  };

  const recentNotifs = notifications.slice(-3).reverse().map((n) =>
    typeof n === "string" ? n : n.message || ""
  );

  return (
    <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center justify-between px-6 lg:px-10 h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">CarbonX</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Credits pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-sm">💚</span>
            <span className="text-sm font-semibold text-emerald-400">{balance} CC</span>
          </div>

          {/* Notification bell */}
          <div className="relative" ref={dropRef}>
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors">
              <Bell className="w-[18px] h-[18px] text-gray-400" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {Math.min(notifications.length, 9)}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1e2e] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  {notifications.length > 0 && (
                    <button onClick={() => { clearNotifications(); setShowNotifs(false); }} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Clear all</button>
                  )}
                </div>
                {recentNotifs.length > 0 ? (
                  <div className="max-h-[240px] overflow-y-auto">
                    {recentNotifs.map((n, i) => (
                      <div key={i} className="px-4 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <p className="text-sm text-gray-300 leading-relaxed">{n}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-600 text-sm">No notifications</div>
                )}
              </div>
            )}
          </div>

          {/* User info */}
          <div className="hidden sm:flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <span className="text-lg">{user.avatar}</span>
            <span className="text-sm text-gray-300 font-medium">{user.name?.split(" ")[0]}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${roleBadge[user.role] || roleBadge.farmer}`}>{user.role}</span>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/20 text-gray-500 hover:text-red-400 transition-all" title="Logout">
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
