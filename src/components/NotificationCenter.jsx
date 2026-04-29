import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { X, Bell, TrendingUp, TrendingDown, Activity, Check, Trash2, ToggleLeft, ToggleRight, Plus, AlertTriangle } from "lucide-react";

/* ── Relative time helper ── */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

/* ── Notification type styles ── */
const TYPE_STYLES = {
  credit_earned: { border: "border-l-amber-400", bg: "bg-amber-500/[0.04]" },
  project_verified: { border: "border-l-emerald-400", bg: "bg-emerald-500/[0.04]" },
  purchase_complete: { border: "border-l-sky-400", bg: "bg-sky-500/[0.04]" },
  price_alert: { border: "border-l-violet-400", bg: "bg-violet-500/[0.04]" },
  ai_recommendation: { border: "border-l-purple-400", bg: "bg-purple-500/[0.04]" },
  system: { border: "border-l-gray-400", bg: "bg-white/[0.02]" },
};

/* ═══════════════════ TAB 1: NOTIFICATIONS ═══════════════════ */
function NotificationsTab() {
  const { richNotifications, markAllRead, dismissNotification } = useApp();
  const unreadCount = richNotifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header actions */}
      {unreadCount > 0 && (
        <div className="px-5 py-2.5 border-b border-white/[0.04]">
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Mark all read ({unreadCount})
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {richNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
            <p className="text-xs text-gray-600 mt-1">You'll see updates here</p>
          </div>
        ) : (
          richNotifications.map((notif) => {
            const style = TYPE_STYLES[notif.notifType] || TYPE_STYLES.system;
            const isUnread = !notif.read;
            return (
              <div
                key={notif.id}
                className={`group relative px-5 py-4 border-b border-white/[0.03] border-l-[3px] transition-all duration-200 hover:bg-white/[0.02] ${
                  isUnread
                    ? `${style.border} ${style.bg}`
                    : "border-l-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-base mt-0.5">
                    {notif.icon}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{notif.title}</span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mt-0.5">{notif.body}</p>
                    <span className="text-[10px] text-gray-600 mt-1 block">{timeAgo(notif.timestamp)}</span>
                  </div>
                  {/* Dismiss */}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/[0.08] text-gray-600 hover:text-gray-300 transition-all flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ═══════════════════ TAB 2: PRICE ALERTS ═══════════════════ */
function PriceAlertsTab() {
  const { priceAlerts, priceAlertsEnabled, setPriceAlertsEnabled, addPriceAlert, removePriceAlert } = useApp();
  const [direction, setDirection] = useState("above");
  const [threshold, setThreshold] = useState("");

  const handleAdd = () => {
    if (!threshold || isNaN(parseFloat(threshold))) return;
    addPriceAlert(direction, threshold);
    setThreshold("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Global toggle */}
      <div className="px-5 py-4 border-b border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-semibold">Price Alerts</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Get notified when prices change</p>
          </div>
          <button
            onClick={() => setPriceAlertsEnabled(!priceAlertsEnabled)}
            className="transition-colors"
          >
            {priceAlertsEnabled ? (
              <ToggleRight className="w-8 h-8 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Add alert form */}
      {priceAlertsEnabled && (
        <div className="px-5 py-4 border-b border-white/[0.04] space-y-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">New Alert</p>
          <div className="flex gap-2">
            <button
              onClick={() => setDirection("above")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                direction === "above"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : "bg-white/[0.04] text-gray-500 border border-white/[0.06]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Above
            </button>
            <button
              onClick={() => setDirection("below")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                direction === "below"
                  ? "bg-red-500/15 text-red-400 border border-red-500/25"
                  : "bg-white/[0.04] text-gray-500 border border-white/[0.06]"
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" /> Below
            </button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">₹</span>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="e.g. 650"
                className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 transition-all"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!threshold}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Active alerts list */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {priceAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No alerts set</p>
            <p className="text-xs text-gray-600 mt-1">{priceAlertsEnabled ? "Add a price threshold above" : "Enable alerts to get started"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {priceAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  alert.direction === "above"
                    ? "bg-emerald-500/[0.04] border-emerald-500/10"
                    : "bg-red-500/[0.04] border-red-500/10"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  alert.direction === "above" ? "bg-emerald-500/15" : "bg-red-500/15"
                }`}>
                  {alert.direction === "above" ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-semibold">
                    Price goes {alert.direction} ₹{alert.threshold}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {alert.triggered ? "Triggered ✓" : "Active — monitoring"}
                  </p>
                </div>
                <button
                  onClick={() => removePriceAlert(alert.id)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.08] text-gray-600 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════ TAB 3: ACTIVITY FEED ═══════════════════ */
function ActivityTab() {
  const { activityFeed, addActivity, MOCK_ACTIVITIES } = useApp();
  const intervalRef = useRef(null);

  /* Auto-add a new activity every 8 seconds */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const msg = MOCK_ACTIVITIES[Math.floor(Math.random() * MOCK_ACTIVITIES.length)];
      addActivity(msg.icon, msg.text);
    }, 8000);
    return () => clearInterval(intervalRef.current);
  }, [addActivity, MOCK_ACTIVITIES]);

  /* Seed initial feed if empty */
  useEffect(() => {
    if (activityFeed.length === 0) {
      const now = Date.now();
      const initial = MOCK_ACTIVITIES.slice(0, 5).map((msg, i) => ({
        ...msg,
        id: `act_seed_${i}`,
        timestamp: now - (i + 1) * 60000 * (i + 1),
      }));
      initial.forEach((item) => addActivity(item.icon, item.text));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex-1 overflow-y-auto">
      {activityFeed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-sm text-gray-500 font-medium">No activity yet</p>
        </div>
      ) : (
        <div>
          {/* Live indicator */}
          <div className="px-5 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Live Platform Activity</span>
          </div>

          {activityFeed.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-start gap-3 px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
              style={{
                animation: idx === 0 ? "activitySlideIn 0.4s ease-out" : "none",
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-base flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 leading-relaxed">{item.text}</p>
                <span className="text-[10px] text-gray-600 mt-0.5 block">{timeAgo(item.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ MAIN DRAWER ═══════════════════ */
export default function NotificationCenter() {
  const {
    showNotificationCenter,
    toggleNotificationCenter,
    notificationCenterTab,
    setNotificationCenterTab,
    richNotifications,
  } = useApp();

  const [closing, setClosing] = useState(false);
  const drawerRef = useRef(null);
  const unreadCount = richNotifications.filter((n) => !n.read).length;

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      toggleNotificationCenter(false);
    }, 250);
  }, [toggleNotificationCenter]);

  /* Close on Escape key */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && showNotificationCenter) handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showNotificationCenter, handleClose]);

  if (!showNotificationCenter && !closing) return null;

  const TABS = [
    { label: "Notifications", badge: unreadCount },
    { label: "Price Alerts", badge: 0 },
    { label: "Activity", badge: 0 },
  ];

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{
          animation: closing ? "backdropFadeOut 0.25s ease-out forwards" : "backdropFadeIn 0.25s ease-out forwards",
        }}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-[380px] max-w-[90vw] bg-[#151823] border-l border-white/[0.06] shadow-2xl flex flex-col"
        style={{
          animation: closing ? "slideOutRight 0.25s ease-in forwards" : "slideInRight 0.3s ease-out forwards",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Bell className="w-[18px] h-[18px] text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Notification Center</h2>
              <p className="text-[10px] text-gray-500">Stay updated</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 mt-4 gap-1 border-b border-white/[0.04]">
          {TABS.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setNotificationCenterTab(idx)}
              className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all duration-200 border-b-2 ${
                notificationCenterTab === idx
                  ? "text-emerald-400 border-emerald-400"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="ml-0.5 w-5 h-5 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {Math.min(tab.badge, 99)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {notificationCenterTab === 0 && <NotificationsTab />}
          {notificationCenterTab === 1 && <PriceAlertsTab />}
          {notificationCenterTab === 2 && <ActivityTab />}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.04] bg-[#151823]">
          <p className="text-[10px] text-gray-600 text-center">
            🌱 CarbonX Notifications • Real-time updates
          </p>
        </div>
      </div>
    </div>
  );
}
