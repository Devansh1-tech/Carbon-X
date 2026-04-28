import { useState, useEffect, useCallback } from "react";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import { useApp } from "../context/AppContext";

const TYPES = {
  success: { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-300", icon: Check, iconBg: "bg-emerald-500/20", iconColor: "text-emerald-400" },
  error: { bg: "bg-red-500/15", border: "border-red-500/30", text: "text-red-300", icon: X, iconBg: "bg-red-500/20", iconColor: "text-red-400" },
  info: { bg: "bg-sky-500/15", border: "border-sky-500/30", text: "text-sky-300", icon: Info, iconBg: "bg-sky-500/20", iconColor: "text-sky-400" },
  warning: { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-300", icon: AlertTriangle, iconBg: "bg-amber-500/20", iconColor: "text-amber-400" },
};

function ToastItem({ id, message, type = "success", onRemove }) {
  const [exiting, setExiting] = useState(false);
  const style = TYPES[type] || TYPES.success;
  const Icon = style.icon;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(id), 250);
  }, [id, onRemove]);

  useEffect(() => {
    const t = setTimeout(dismiss, 3000);
    return () => clearTimeout(t);
  }, [dismiss]);

  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl ${style.bg} ${style.border} border backdrop-blur-xl shadow-2xl transition-all duration-250 ${exiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100 animate-[toastIn_0.3s_ease-out]"}`}>
      <div className={`w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${style.iconColor}`} />
      </div>
      <span className={`${style.text} text-sm font-medium max-w-[280px]`}>{message}</span>
      <button onClick={dismiss} className={`ml-1 ${style.iconColor} opacity-60 hover:opacity-100 transition-opacity flex-shrink-0`}>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { notifications } = useApp();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      const msg = typeof latest === "string" ? latest : latest.message || "";
      const type = typeof latest === "object" ? latest.type || "success" : "success";
      setToasts((prev) => [...prev.slice(-4), { id: Date.now(), message: msg, type }]);
    }
  }, [notifications.length]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onRemove={remove} />
      ))}
    </div>
  );
}
