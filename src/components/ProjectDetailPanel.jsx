import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, TreePine, MapPin, Calendar, ShieldCheck, Clock,
  ArrowRight, Leaf, BarChart3, User,
} from "lucide-react";

const TYPE_BADGE = {
  tree_plantation: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "🌳 Tree Plantation" },
  soil_carbon: { bg: "bg-amber-500/15", text: "text-amber-400", label: "🌾 Soil Carbon" },
  renewable_energy: { bg: "bg-sky-500/15", text: "text-sky-400", label: "⚡ Renewable Energy" },
};

const STATUS_BADGE = {
  verified: { bg: "bg-emerald-500/15", text: "text-emerald-400", icon: ShieldCheck, label: "Verified" },
  pending: { bg: "bg-amber-500/15", text: "text-amber-400", icon: Clock, label: "Pending" },
  rejected: { bg: "bg-red-500/15", text: "text-red-400", icon: X, label: "Rejected" },
};

/* ── Circular progress gauge ── */
function MiniGauge({ score = 87, size = 80 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const offset = c - (pct / 100) * c;
  const color = pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        className="rotate-90 origin-center" fill="white" fontSize="18" fontWeight="700"
        style={{ transform: `rotate(90deg)`, transformOrigin: "center" }}
      >{pct}%</text>
    </svg>
  );
}

/* ── Mini bar chart (CSS) ── */
function ImpactBars({ project }) {
  const bars = [
    { label: "Carbon Seq.", value: project.creditsGenerated || 0, max: 700, color: "#10b981" },
    { label: "Land Area", value: project.landArea || 0, max: 50, color: "#0ea5e9" },
    { label: "Trees", value: Math.min(project.treesPlanted || 0, 12000), max: 12000, color: "#f59e0b" },
  ];
  return (
    <div className="space-y-3">
      {bars.map((b) => {
        const pct = Math.min(100, (b.value / b.max) * 100);
        return (
          <div key={b.label}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-gray-500">{b.label}</span>
              <span className="text-gray-300 font-semibold tabular-nums">{b.value.toLocaleString()}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: b.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══ PANEL ═══ */
export default function ProjectDetailPanel({ project, onClose }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!project) return null;

  const type = TYPE_BADGE[project.type] || TYPE_BADGE.tree_plantation;
  const status = STATUS_BADGE[project.status] || STATUS_BADGE.pending;
  const StatusIcon = status.icon;
  const verificationScore = project.status === "verified" ? 87 : project.status === "pending" ? 45 : 12;
  const farmerName = project.userId === "usr_001" ? "Ramesh Patel" : project.userId === "usr_002" ? "Sunita Devi" : project.userId === "usr_003" ? "Green Earth Foundation" : "Unknown";
  const farmerAvatar = project.userId === "usr_001" ? "👨‍🌾" : project.userId === "usr_002" ? "👩‍🌾" : project.userId === "usr_003" ? "🌳" : "👤";
  const farmerRole = project.userId === "usr_003" ? "NGO" : "Farmer";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 z-[61] w-full max-w-md h-full bg-[#111422] border-l border-white/[0.06] overflow-y-auto animate-[panelSlideIn_0.35s_ease-out]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#111422]/90 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between p-5">
            <h2 className="text-lg font-bold text-white truncate pr-4">Project Details</h2>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Project Image */}
          <div className="relative rounded-2xl overflow-hidden h-48 bg-gradient-to-br from-emerald-900/30 to-[#151823]">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-30">{project.type === "tree_plantation" ? "🌳" : project.type === "soil_carbon" ? "🌾" : "☀️"}</span>
            </div>
            <div className="absolute top-3 left-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${type.bg} ${type.text}`}>{type.label}</span>
            </div>
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${status.bg} ${status.text}`}>
                <StatusIcon className="w-3 h-3" />{status.label}
              </span>
            </div>
          </div>

          {/* Title & Farmer */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-lg">{farmerAvatar}</div>
              <div>
                <p className="text-sm text-white font-medium">{farmerName}</p>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 uppercase tracking-wider">{farmerRole}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Trees", value: project.treesPlanted?.toLocaleString() || "—", icon: TreePine, color: "emerald" },
              { label: "Land Area", value: `${project.landArea || 0} acres`, icon: MapPin, color: "sky" },
              { label: "Credits", value: project.creditsGenerated || 0, icon: Leaf, color: "amber" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <s.icon className={`w-4 h-4 text-${s.color}-400 mx-auto mb-1.5`} />
                <p className="text-sm font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-gray-400 leading-relaxed">{project.description}</p>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-white">{project.location?.city}, {project.location?.state}</p>
              {project.location?.lat && (
                <p className="text-[10px] text-gray-600 tabular-nums mt-0.5">{project.location.lat.toFixed(4)}°N, {project.location.lng.toFixed(4)}°E</p>
              )}
            </div>
          </div>

          {/* AI Verification Score */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/[0.04] to-transparent border border-emerald-500/10">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">AI Verification Score</h4>
            <div className="flex items-center gap-5">
              <MiniGauge score={verificationScore} />
              <div className="flex-1 space-y-2">
                {["Vegetation Analysis", "Land Validation", "Carbon Rate", "Fraud Risk"].map((c, i) => {
                  const pass = verificationScore >= 50;
                  return (
                    <div key={c} className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">{c}</span>
                      <span className={`font-semibold ${i < 3 ? (pass ? "text-emerald-400" : "text-red-400") : (pass ? "text-emerald-400" : "text-amber-400")}`}>
                        {i < 3 ? (pass ? "Pass" : "Fail") : (pass ? "Low" : "Medium")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Carbon Impact Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Carbon Impact Breakdown</h4>
            <ImpactBars project={project} />
          </div>

          {/* Submitted Date */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="w-3.5 h-3.5" />
            Submitted: {project.submittedAt}
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/marketplace")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Request to Buy <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <style>{`
          @keyframes panelSlideIn {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0); }
          }
        `}</style>
      </div>
    </>
  );
}
