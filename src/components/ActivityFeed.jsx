import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Activity, ChevronRight } from "lucide-react";

/* ── Relative time helper ── */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

/* ═══ ACTIVITY FEED WIDGET ═══ */
export default function ActivityFeed() {
  const {
    activityFeed,
    addActivity,
    toggleNotificationCenter,
    setNotificationCenterTab,
    MOCK_ACTIVITIES,
  } = useApp();

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
      const seeds = MOCK_ACTIVITIES.slice(0, 5);
      seeds.forEach((msg) => addActivity(msg.icon, msg.text));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const last5 = activityFeed.slice(0, 5);

  const openActivityTab = () => {
    setNotificationCenterTab(2); // Activity tab
    toggleNotificationCenter(true);
  };

  return (
    <section className="p-6 rounded-2xl bg-[#151823] border border-white/[0.06]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Live Activity</h2>
        </div>
        <button
          onClick={openActivityTab}
          className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-0">
        {last5.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center gap-4 py-3.5 ${
              idx !== last5.length - 1 ? "border-b border-white/[0.04]" : ""
            }`}
            style={{
              animation: idx === 0 ? "activitySlideIn 0.4s ease-out" : "none",
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-lg flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 truncate">{item.text}</p>
              <p className="text-xs text-gray-600 mt-0.5">{timeAgo(item.timestamp)}</p>
            </div>
          </div>
        ))}

        {last5.length === 0 && (
          <div className="py-8 text-center text-gray-600 text-sm">No activity yet</div>
        )}
      </div>
    </section>
  );
}
