import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ChevronUp, ChevronDown, User, Building2, Shield, Plus, Send, ShoppingCart, RotateCcw, X } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "ramesh.patel@gmail.com", password: "demo123", label: "🌾 Farmer", name: "Ramesh Patel", dash: "/dashboard/farmer" },
  { email: "sustainability@tatasteel.com", password: "demo123", label: "🏢 Company", name: "Tata Steel", dash: "/dashboard/company" },
  { email: "admin@carbonx.io", password: "demo123", label: "⚙️ Admin", name: "Admin CarbonX", dash: "/dashboard/admin" },
];

export default function DemoController() {
  const [expanded, setExpanded] = useState(false);
  const { currentUser, login, logout, submitProject, buyCredits, addNotification, wallet } = useApp();
  const navigate = useNavigate();

  const switchUser = useCallback((account) => {
    logout();
    setTimeout(() => {
      login(account.email, account.password);
      navigate(account.dash);
      setExpanded(false);
    }, 100);
  }, [login, logout, navigate]);

  const addCredits = useCallback(() => {
    addNotification({ message: "💰 +50 demo credits added!", type: "success" });
    // Simulate by buying from a listing that doesn't reduce stock meaningfully
    const userId = currentUser?.id || "usr_001";
    buyCredits("lst_009", 50, userId);
  }, [addNotification, buyCredits, currentUser]);

  const mockSubmit = useCallback(() => {
    submitProject({
      title: `Demo Project ${Date.now().toString(36)}`,
      type: "tree_plantation",
      treesPlanted: 500,
      landArea: 5,
      location: { city: "Indore", state: "Madhya Pradesh", lat: 22.72, lng: 75.86 },
      description: "Auto-generated demo project for presentation.",
    });
  }, [submitProject]);

  const mockPurchase = useCallback(() => {
    const userId = currentUser?.id || "usr_001";
    buyCredits("lst_002", 10, userId);
  }, [buyCredits, currentUser]);

  const resetDemo = useCallback(() => {
    logout();
    navigate("/");
    window.location.reload();
  }, [logout, navigate]);

  const user = currentUser;

  return (
    <div className="fixed bottom-4 left-4 z-[200]" id="demo-controller">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1e2e]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl hover:border-emerald-500/30 transition-all active:scale-95 group"
        >
          <span className="text-sm">🎭</span>
          <span className="text-[11px] text-gray-400 font-medium group-hover:text-gray-300">Demo</span>
          <ChevronUp className="w-3 h-3 text-gray-600" />
        </button>
      ) : (
        <div className="w-72 rounded-2xl bg-[#1a1e2e]/95 border border-white/[0.1] backdrop-blur-xl shadow-2xl overflow-hidden" style={{ animation: "fadeUp 0.2s ease-out" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span>🎭</span>
              <span className="text-sm font-bold text-white">Demo Controller</span>
            </div>
            <button onClick={() => setExpanded(false)} className="p-1 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Current user */}
          {user && (
            <div className="px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="text-lg">{user.avatar}</span>
                <div>
                  <p className="text-xs text-white font-medium">{user.name}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{user.role} • {wallet?.balance || 0} CC</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 space-y-4">
            {/* Switch User */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Switch User</p>
              <div className="flex gap-1.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => switchUser(acc)}
                    className={`flex-1 px-2 py-2 rounded-lg text-[10px] font-medium transition-all active:scale-95 ${
                      currentUser?.email === acc.email
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                        : "bg-white/[0.04] text-gray-400 border border-transparent hover:bg-white/[0.08] hover:text-gray-300"
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulate */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Simulate</p>
              <div className="grid grid-cols-3 gap-1.5">
                <button onClick={addCredits} className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg bg-white/[0.04] border border-transparent hover:bg-emerald-500/10 hover:border-emerald-500/20 text-gray-400 hover:text-emerald-400 transition-all active:scale-95">
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-medium">+50 CC</span>
                </button>
                <button onClick={mockSubmit} className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg bg-white/[0.04] border border-transparent hover:bg-sky-500/10 hover:border-sky-500/20 text-gray-400 hover:text-sky-400 transition-all active:scale-95">
                  <Send className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-medium">Project</span>
                </button>
                <button onClick={mockPurchase} className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg bg-white/[0.04] border border-transparent hover:bg-amber-500/10 hover:border-amber-500/20 text-gray-400 hover:text-amber-400 transition-all active:scale-95">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-medium">Purchase</span>
                </button>
              </div>
            </div>

            {/* Reset */}
            <button onClick={resetDemo} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium hover:bg-red-500/15 active:scale-95 transition-all">
              <RotateCcw className="w-3 h-3" /> Reset Demo
            </button>
          </div>

          {/* Shortcut hint */}
          <div className="px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
            <p className="text-[9px] text-gray-600 text-center">Press <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-gray-500 font-mono">Ctrl+M</kbd> to toggle</p>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeUp { 0% { opacity:0; transform:translateY(8px); } 100% { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
