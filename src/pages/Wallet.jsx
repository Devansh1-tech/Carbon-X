import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  ArrowUpRight, ArrowDownLeft, ChevronLeft, X, Minus, Plus,
  Wallet as WalletIcon, TrendingUp, Clock, ShieldCheck, Send,
  History, CreditCard, Sparkles, Check,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, ResponsiveContainer,
} from "recharts";
import { usePriceSimulator } from "../utils/priceSimulator";

/* mock sparkline data removed — now using usePriceSimulator */

/* ── Extended wallet transactions (enriched from mock) ── */
const walletTxns = [
  { id: "w1", date: "2026-04-12", type: "earned", desc: "Narmada Valley Reforestation", credits: 180, value: 108000, status: "completed" },
  { id: "w2", date: "2026-04-08", type: "sold", desc: "Tata Steel Industries", credits: 50, value: 30000, status: "completed" },
  { id: "w3", date: "2026-03-28", type: "earned", desc: "Organic Soil Enrichment", credits: 95, value: 57000, status: "completed" },
  { id: "w4", date: "2026-03-15", type: "sold", desc: "Tata Steel Industries", credits: 30, value: 18000, status: "completed" },
  { id: "w5", date: "2026-03-12", type: "sold", desc: "Tata Steel Industries", credits: 45, value: 27000, status: "completed" },
  { id: "w6", date: "2026-02-20", type: "earned", desc: "Biochar Pilot – Sehore", credits: 65, value: 39000, status: "pending" },
  { id: "w7", date: "2026-02-10", type: "purchased", desc: "Green Earth Foundation", credits: 20, value: 12000, status: "completed" },
  { id: "w8", date: "2026-01-18", type: "sold", desc: "Tata Steel Industries", credits: 50, value: 30000, status: "completed" },
  { id: "w9", date: "2026-01-05", type: "earned", desc: "Tree Plantation Phase-1", credits: 40, value: 24000, status: "completed" },
  { id: "w10", date: "2025-12-22", type: "purchased", desc: "Sunita Devi Credits", credits: 15, value: 9000, status: "completed" },
];

const FILTER_TABS = ["All", "Earned", "Sold", "Purchased"];

const TYPE_STYLE = {
  earned: { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: ArrowDownLeft, label: "Earned" },
  sold: { bg: "bg-red-500/10", text: "text-red-400", icon: ArrowUpRight, label: "Sold" },
  purchased: { bg: "bg-sky-500/10", text: "text-sky-400", icon: ArrowDownLeft, label: "Purchased" },
};

/* ── Toast ── */
function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed top-6 right-6 z-[100] animate-[slideIn_0.35s_ease-out]">
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-xl shadow-2xl">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-4 h-4 text-emerald-400" /></div>
        <span className="text-emerald-300 text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-emerald-400/60 hover:text-emerald-300 transition-colors"><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

/* ── Mini live price widget ── */
function CreditValueWidget() {
  const { currentPrice, percentChange, direction, priceHistory } = usePriceSimulator(608, 20);
  const up = direction === "up";
  const color = up ? "#10b981" : "#ef4444";
  return (
    <div className="p-5 rounded-xl bg-[#151823] border border-white/[0.06]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Market Rate</span>
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
          <TrendingUp className="w-3.5 h-3.5" /> {up ? "+" : ""}{percentChange}%
        </span>
      </div>
      <p className="text-2xl font-bold text-white mb-0.5 tabular-nums">1 CC = ₹{currentPrice.toFixed(0)}</p>
      <div className="h-12 w-full mt-2 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={priceHistory}>
            <defs>
              <linearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#walletGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: color }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
        </span>
        <p className="text-[11px] text-gray-600">Live • Updates every 3s</p>
      </div>
    </div>
  );
}

/* ═══════════════════ WALLET PAGE ═══════════════════ */
export default function Wallet() {
  const { currentUser, wallet } = useApp();
  const txRef = useRef(null);

  const user = currentUser || {
    id: "usr_001", name: "Ramesh Patel", avatar: "👨‍🌾",
    creditsEarned: 340, walletBalance: 280,
  };

  const balance = wallet.balance || user.walletBalance || 280;
  const balanceINR = Math.round(balance * 600);

  /* filters */
  const [filter, setFilter] = useState("All");
  const filteredTxns = useMemo(
    () => filter === "All" ? walletTxns : walletTxns.filter((t) => t.type === filter.toLowerCase()),
    [filter]
  );

  /* stats */
  const earnedMonth = walletTxns.filter((t) => t.type === "earned" && t.date >= "2026-04-01").reduce((s, t) => s + t.credits, 0);
  const soldMonth = walletTxns.filter((t) => t.type === "sold" && t.date >= "2026-04-01").reduce((s, t) => s + t.credits, 0);
  const pendingCredits = walletTxns.filter((t) => t.status === "pending").reduce((s, t) => s + t.credits, 0);

  /* sell modal */
  const [showSell, setShowSell] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [sellAmt, setSellAmt] = useState(10);
  const [sellPrice, setSellPrice] = useState(600);
  const [toast, setToast] = useState("");

  const handleSell = useCallback(() => {
    setToast(`Sold ${sellAmt} credits for ₹${(sellAmt * sellPrice).toLocaleString()}`);
    setShowSell(false);
    setSellAmt(10);
  }, [sellAmt, sellPrice]);

  const scrollToTx = () => txRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-6 lg:px-10 h-16 max-w-7xl mx-auto">
          <Link to="/dashboard/farmer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">CarbonX</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{user.avatar}</span>
            <span className="text-sm text-gray-300 font-medium hidden sm:block">{user.name?.split(" ")[0]}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">My Wallet</h1>
        <p className="text-sm text-gray-500 mb-8">Manage your carbon credits</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ════ LEFT COLUMN ════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Card */}
            <div className="relative rounded-2xl overflow-hidden p-6 h-[220px] flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)" }}>
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-300/10 rounded-full blur-[60px]" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌱</span>
                  <span className="text-sm font-bold text-emerald-200/80">CarbonX</span>
                </div>
                <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300/70 to-yellow-500/50 border border-yellow-300/20 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full border-2 border-yellow-200/40" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-emerald-200/60 text-xs uppercase tracking-wider mb-1">Credit Balance</p>
                <p className="text-4xl font-bold text-white tracking-tight">{balance} <span className="text-lg font-medium text-emerald-200/60">CC</span></p>
                <p className="text-emerald-200/50 text-sm mt-0.5">≈ ₹{balanceINR.toLocaleString()}</p>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <p className="text-emerald-100/70 text-sm font-medium tracking-wide">{user.name}</p>
                <p className="text-emerald-200/40 text-xs">Carbon Credits</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setShowSell(true)} className="flex flex-col items-center gap-2 py-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-emerald-500/10 hover:border-emerald-500/20 text-gray-400 hover:text-emerald-400 transition-all duration-200">
                <ArrowUpRight className="w-5 h-5" />
                <span className="text-xs font-medium">Sell Credits</span>
              </button>
              <button onClick={() => setShowTransfer(true)} className="flex flex-col items-center gap-2 py-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-sky-500/10 hover:border-sky-500/20 text-gray-400 hover:text-sky-400 transition-all duration-200">
                <Send className="w-5 h-5" />
                <span className="text-xs font-medium">Transfer</span>
              </button>
              <button onClick={scrollToTx} className="flex flex-col items-center gap-2 py-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-violet-500/10 hover:border-violet-500/20 text-gray-400 hover:text-violet-400 transition-all duration-200">
                <History className="w-5 h-5" />
                <span className="text-xs font-medium">History</span>
              </button>
            </div>

            {/* Credit breakdown */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Earned This Month", value: earnedMonth, icon: ArrowDownLeft, color: "emerald" },
                { label: "Sold This Month", value: soldMonth, icon: ArrowUpRight, color: "red" },
                { label: "Pending Verification", value: pendingCredits, icon: Clock, color: "yellow" },
                { label: "Lifetime Earned", value: user.creditsEarned || 340, icon: ShieldCheck, color: "violet" },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl bg-[#151823] border border-white/[0.06]">
                  <div className={`w-8 h-8 rounded-lg bg-${s.color}-500/15 flex items-center justify-center mb-2`}>
                    <s.icon className={`w-4 h-4 text-${s.color}-400`} />
                  </div>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Credit value ticker — LIVE */}
            <CreditValueWidget />
          </div>

          {/* ════ RIGHT COLUMN ════ */}
          <div className="lg:col-span-3" ref={txRef}>
            <div className="rounded-2xl bg-[#151823] border border-white/[0.06] overflow-hidden">
              {/* Header */}
              <div className="p-6 pb-4 border-b border-white/[0.04]">
                <h2 className="text-lg font-bold text-white mb-4">Transaction History</h2>
                <div className="flex gap-2">
                  {FILTER_TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        filter === tab
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : "bg-white/[0.03] text-gray-500 border border-transparent hover:bg-white/[0.06] hover:text-gray-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      {["Date", "Type", "Project / Company", "Credits", "Value (INR)", "Status"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxns.map((tx) => {
                      const style = TYPE_STYLE[tx.type];
                      const Icon = style.icon;
                      return (
                        <tr key={tx.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3.5 text-sm text-gray-400 whitespace-nowrap">{tx.date}</td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${style.bg} ${style.text}`}>
                              <Icon className="w-3 h-3" /> {style.label}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-sm text-gray-300 max-w-[180px] truncate">{tx.desc}</td>
                          <td className={`px-6 py-3.5 text-sm font-bold ${style.text}`}>
                            {tx.type === "sold" ? "-" : "+"}{tx.credits}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-gray-400">₹{tx.value.toLocaleString()}</td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              tx.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${tx.status === "completed" ? "bg-emerald-400" : "bg-yellow-400"}`} />
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredTxns.length === 0 && (
                  <div className="py-16 text-center text-gray-600 text-sm">No transactions found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════ SELL MODAL ════ */}
      {showSell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSell(false)} />
          <div className="relative w-full max-w-md bg-[#1a1e2e] border border-white/[0.08] rounded-2xl p-6 shadow-2xl animate-[fadeUp_0.25s_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Sell Credits</h3>
              <button onClick={() => setShowSell(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Amount to Sell</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSellAmt(Math.max(1, sellAmt - 5))} className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"><Minus className="w-4 h-4" /></button>
                  <input type="number" value={sellAmt} onChange={(e) => setSellAmt(Math.min(balance, Math.max(1, parseInt(e.target.value) || 1)))} className="flex-1 text-center px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-lg font-bold focus:outline-none focus:border-emerald-400/50 transition-all" />
                  <button onClick={() => setSellAmt(Math.min(balance, sellAmt + 5))} className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <input type="range" min={1} max={balance} value={sellAmt} onChange={(e) => setSellAmt(parseInt(e.target.value))} className="w-full mt-3 accent-emerald-500" />
                <p className="text-[11px] text-gray-600 mt-1">Max: {balance} credits</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Price Per Credit (₹)</label>
                <input type="number" value={sellPrice} onChange={(e) => setSellPrice(parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-emerald-400/50 transition-all" />
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-xs text-gray-500">Buyer:</span>
                <span className="text-sm text-gray-300 font-medium">Open Market</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                <p className="text-xs text-gray-500 mb-1">You will receive</p>
                <p className="text-2xl font-bold text-emerald-400">₹{(sellAmt * sellPrice).toLocaleString()}</p>
              </div>

              <button onClick={handleSell} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Confirm Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ TRANSFER MODAL ════ */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTransfer(false)} />
          <div className="relative w-full max-w-md bg-[#1a1e2e] border border-white/[0.08] rounded-2xl p-6 shadow-2xl animate-[fadeUp_0.25s_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Transfer Credits</h3>
              <button onClick={() => setShowTransfer(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recipient ID or Email</label>
                <input className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 transition-all" placeholder="user@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Credits to Transfer</label>
                <input type="number" defaultValue={10} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-emerald-400/50 transition-all" />
              </div>
              <button onClick={() => { setToast("Transfer initiated successfully!"); setShowTransfer(false); }} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-sky-500/25 transition-all flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Send Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <style>{`
        @keyframes fadeUp { 0% { opacity:0; transform:translateY(12px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { 0% { transform:translateX(100%) translateY(-10px); opacity:0; } 100% { transform:translateX(0) translateY(0); opacity:1; } }
      `}</style>
    </div>
  );
}
