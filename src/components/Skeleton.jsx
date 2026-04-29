/* ── Loading Skeleton Components ── */
export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[#151823] border border-white/[0.06] overflow-hidden animate-pulse">
      <div className="h-36 bg-white/[0.04]" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-24 bg-white/[0.06] rounded" />
        <div className="h-4 w-3/4 bg-white/[0.06] rounded" />
        <div className="h-3 w-16 bg-white/[0.06] rounded-full" />
        <div className="h-3 w-20 bg-white/[0.06] rounded" />
        <div className="flex justify-between pt-3 border-t border-white/[0.04]">
          <div className="space-y-1"><div className="h-5 w-14 bg-white/[0.06] rounded" /><div className="h-2 w-10 bg-white/[0.04] rounded" /></div>
          <div className="space-y-1 text-right"><div className="h-5 w-14 bg-white/[0.06] rounded" /><div className="h-2 w-10 bg-white/[0.04] rounded" /></div>
        </div>
        <div className="h-10 w-full bg-white/[0.06] rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="rounded-2xl bg-[#151823] border border-white/[0.06] overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.06]">
        {[80, 120, 60, 90, 50].map((w, i) => <div key={i} className="h-3 bg-white/[0.06] rounded animate-pulse" style={{ width: w }} />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.03] animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="h-3 w-20 bg-white/[0.05] rounded" />
          <div className="h-3 w-28 bg-white/[0.05] rounded" />
          <div className="h-3 w-16 bg-white/[0.05] rounded" />
          <div className="h-3 w-24 bg-white/[0.05] rounded" />
          <div className="h-5 w-14 bg-white/[0.05] rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 220 }) {
  return (
    <div className="rounded-2xl bg-[#151823] border border-white/[0.06] p-6 animate-pulse">
      <div className="h-4 w-40 bg-white/[0.06] rounded mb-4" />
      <div className="rounded-lg bg-white/[0.03]" style={{ height }} />
    </div>
  );
}

export function SkeletonText({ lines = 3, width }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-white/[0.06] rounded" style={{ width: width || `${90 - i * 15}%`, animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-2xl bg-[#151823] border border-white/[0.06] p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-20 bg-white/[0.06] rounded" />
        <div className="w-10 h-10 rounded-xl bg-white/[0.04]" />
      </div>
      <div className="h-7 w-24 bg-white/[0.06] rounded mb-2" />
      <div className="h-3 w-16 bg-white/[0.04] rounded" />
    </div>
  );
}
