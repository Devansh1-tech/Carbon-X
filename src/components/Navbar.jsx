import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Bell, LogOut, X, ChevronDown } from "lucide-react";

export default function SharedNavbar() {
  const {
    currentUser,
    wallet,
    richNotifications,
    logout,
    toggleNotificationCenter,
  } = useApp();

  const navigate = useNavigate();

  const user = currentUser || { name: "User", role: "farmer", avatar: "👤" };
  const balance = wallet?.balance || 0;
  const unreadCount = richNotifications.filter((n) => !n.read).length;

  const handleLogout = () => { logout(); navigate("/login"); };

  const roleBadge = {
    farmer: "bg-emerald-500/15 text-emerald-400",
    ngo: "bg-violet-500/15 text-violet-400",
    company: "bg-sky-500/15 text-sky-400",
    admin: "bg-amber-500/15 text-amber-400",
  };

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

          {/* Notification bell — opens NotificationCenter drawer */}
          <button
            onClick={() => toggleNotificationCenter(true)}
            className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
          >
            <Bell className="w-[18px] h-[18px] text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center" style={{ animation: "pulseGlow 2s infinite" }}>
                {Math.min(unreadCount, 9)}{unreadCount > 9 ? "+" : ""}
              </span>
            )}
          </button>

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
