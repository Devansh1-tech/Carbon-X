import { useMemo } from "react";
import { X, Download } from "lucide-react";

/* ──────────────────────────────────────────────
   Utility: Generate a random certificate ID
   ────────────────────────────────────────────── */
function genCertId() {
  return `CX-2025-${String(Math.floor(100000 + Math.random() * 900000))}`;
}

/* ──────────────────────────────────────────────
   SDG Badge Component
   ────────────────────────────────────────────── */
function SDGBadge({ number, label, color }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "5px 12px", borderRadius: "8px",
      backgroundColor: color, color: "white",
      fontSize: "11px", fontWeight: 700, letterSpacing: "0.02em",
    }}>
      <span style={{ fontSize: "14px", fontWeight: 800 }}>SDG {number}</span>
      <span style={{ opacity: 0.9, fontSize: "10px" }}>{label}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Verified Seal SVG Component
   ────────────────────────────────────────────── */
function VerifiedSeal() {
  const points = 12;
  const outerR = 72;
  const innerR = 58;
  const cx = 80, cy = 80;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
  }
  d += "Z";

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" style={{ filter: "drop-shadow(0 2px 8px rgba(16,185,129,0.25))" }}>
      {/* Star burst shape */}
      <path d={d} fill="none" stroke="#10b981" strokeWidth="2.5" opacity="0.6" />
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r="56" fill="none" stroke="#10b981" strokeWidth="3" />
      {/* Inner ring */}
      <circle cx={cx} cy={cy} r="48" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Green fill */}
      <circle cx={cx} cy={cy} r="44" fill="#10b981" opacity="0.12" />
      {/* Center text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700" letterSpacing="0.15em">
        AI VERIFIED
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="#10b981" fontSize="15" fontWeight="800">
        ✓
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#10b981" fontSize="8" fontWeight="600" letterSpacing="0.1em">
        IPCC 2023
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
export default function CertificateGenerator({
  recipientName = "Ramesh Patel",
  creditsAmount = 180,
  projectTitle = "Narmada Valley Reforestation",
  projectType = "Tree Plantation",
  location = "Hoshangabad, Madhya Pradesh",
  date,
  type = "generation", // "offset" | "generation"
  onClose,
}) {
  const certId = useMemo(() => genCertId(), []);
  const issuedDate = date || new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const actionText = type === "offset"
    ? "has successfully offset"
    : "has successfully generated";

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* ── Modal Overlay ── */}
      <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
        <div className="relative w-full max-w-[1060px]">
          {/* Close + Download bar */}
          <div className="flex items-center justify-between mb-4 no-print">
            <h2 className="text-white font-bold text-lg">Carbon Credit Certificate</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
              >
                <Download className="w-4 h-4" /> Download Certificate
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>

          {/* ══════════ THE CERTIFICATE ══════════ */}
          <div
            id="carbonx-certificate"
            style={{
              width: "1000px",
              height: "700px",
              margin: "0 auto",
              position: "relative",
              background: "linear-gradient(135deg, #fefdf8 0%, #f9f7f0 30%, #fefef9 60%, #f8f5ec 100%)",
              borderRadius: "12px",
              overflow: "hidden",
              fontFamily: "'Georgia', 'Times New Roman', serif",
              color: "#1a2e1a",
              boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
            }}
          >
            {/* ── Ornate Border ── */}
            <div style={{
              position: "absolute", inset: 0,
              border: "3px solid #10b981",
              borderRadius: "12px",
              pointerEvents: "none",
              zIndex: 2,
            }} />
            <div style={{
              position: "absolute", inset: "8px",
              border: "1.5px solid #10b981",
              borderRadius: "8px",
              pointerEvents: "none",
              zIndex: 2,
              opacity: 0.5,
            }} />
            <div style={{
              position: "absolute", inset: "14px",
              border: "0.5px solid #10b981",
              borderRadius: "6px",
              pointerEvents: "none",
              zIndex: 2,
              opacity: 0.25,
            }} />

            {/* ── Corner flourishes ── */}
            {[
              { top: 18, left: 18 }, { top: 18, right: 18 },
              { bottom: 18, left: 18 }, { bottom: 18, right: 18 },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  ...pos,
                  width: "40px",
                  height: "40px",
                  zIndex: 3,
                }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <path
                    d={
                      i === 0 ? "M5 20 Q5 5 20 5" :
                      i === 1 ? "M20 5 Q35 5 35 20" :
                      i === 2 ? "M5 20 Q5 35 20 35" :
                      "M20 35 Q35 35 35 20"
                    }
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <circle
                    cx={i < 2 ? (i === 0 ? 5 : 35) : (i === 2 ? 5 : 35)}
                    cy={i < 2 ? 5 : 35}
                    r="2.5"
                    fill="#10b981"
                    opacity="0.4"
                  />
                </svg>
              </div>
            ))}

            {/* ── Watermark ── */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-35deg)",
              fontSize: "120px",
              fontWeight: 900,
              color: "#10b981",
              opacity: 0.04,
              whiteSpace: "nowrap",
              zIndex: 1,
              letterSpacing: "0.1em",
              fontFamily: "'Inter', sans-serif",
              userSelect: "none",
            }}>
              CarbonX
            </div>

            {/* ── Decorative leaf pattern ── */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: "250px", height: "250px",
              background: "radial-gradient(circle at top right, rgba(16,185,129,0.06) 0%, transparent 70%)",
              zIndex: 1,
            }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0,
              width: "200px", height: "200px",
              background: "radial-gradient(circle at bottom left, rgba(16,185,129,0.04) 0%, transparent 70%)",
              zIndex: 1,
            }} />

            {/* ── Content ── */}
            <div style={{ position: "relative", zIndex: 5, height: "100%", display: "flex", flexDirection: "column", padding: "36px 48px 28px" }}>
              
              {/* ─── TOP: Logo + Title ─── */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "32px" }}>🌱</span>
                  <span style={{
                    fontSize: "22px", fontWeight: 800,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "-0.02em",
                  }}>
                    CarbonX
                  </span>
                </div>
                <h1 style={{
                  fontSize: "26px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: "#1a3a2a",
                  margin: 0,
                  textTransform: "uppercase",
                }}>
                  Carbon Credit Certificate
                </h1>
                <div style={{
                  width: "160px", height: "2px", margin: "10px auto 0",
                  background: "linear-gradient(90deg, transparent, #10b981, transparent)",
                }} />
              </div>

              {/* ─── BODY: Left + Right ─── */}
              <div style={{ display: "flex", flex: 1, gap: "40px", alignItems: "center" }}>

                {/* LEFT SIDE (60%) */}
                <div style={{ flex: "0 0 58%", paddingRight: "20px" }}>
                  <p style={{ fontSize: "14px", color: "#6b7a6b", marginBottom: "4px", fontStyle: "italic" }}>
                    This certifies that
                  </p>
                  <h2 style={{
                    fontSize: "34px", fontWeight: 700, color: "#0f3d1f",
                    margin: "0 0 6px 0", lineHeight: 1.15,
                    borderBottom: "2px solid #10b98130",
                    paddingBottom: "8px",
                  }}>
                    {recipientName}
                  </h2>
                  <p style={{ fontSize: "14px", color: "#6b7a6b", margin: "8px 0 2px", fontStyle: "italic" }}>
                    {actionText}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "4px 0 4px" }}>
                    <span style={{ fontSize: "42px", fontWeight: 800, color: "#10b981", fontFamily: "'Inter', sans-serif" }}>
                      {creditsAmount}
                    </span>
                    <span style={{ fontSize: "16px", color: "#3d6b4d", fontWeight: 600 }}>
                      Carbon Credits
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#6b7a6b", marginBottom: "18px" }}>
                    equivalent to <strong style={{ color: "#0f3d1f" }}>{creditsAmount} tons</strong> of CO₂
                  </p>

                  {/* Project details */}
                  <div style={{
                    padding: "14px 18px",
                    background: "rgba(16,185,129,0.06)",
                    borderRadius: "10px",
                    borderLeft: "4px solid #10b981",
                    marginBottom: "16px",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px" }}>
                      <div>
                        <span style={{ color: "#8a9a8a", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Project</span>
                        <p style={{ margin: "2px 0 0", fontWeight: 600, color: "#1a3a2a" }}>{projectTitle}</p>
                      </div>
                      <div style={{ display: "flex", gap: "24px" }}>
                        <div>
                          <span style={{ color: "#8a9a8a", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Type</span>
                          <p style={{ margin: "2px 0 0", fontWeight: 600, color: "#1a3a2a" }}>{projectType}</p>
                        </div>
                        <div>
                          <span style={{ color: "#8a9a8a", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Location</span>
                          <p style={{ margin: "2px 0 0", fontWeight: 600, color: "#1a3a2a" }}>{location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6b8a6b", marginBottom: "6px" }}>
                    <span style={{ fontSize: "14px" }}>✅</span> AI Verified &nbsp;|&nbsp; IPCC 2023 Standard
                  </div>

                  <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "#8a9a8a", fontFamily: "'Inter', sans-serif" }}>
                    <span><strong>Certificate ID:</strong> {certId}</span>
                    <span><strong>Issued:</strong> {issuedDate}</span>
                  </div>
                </div>

                {/* RIGHT SIDE (40%) */}
                <div style={{ flex: "0 0 38%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
                  {/* Seal */}
                  <VerifiedSeal />

                  {/* QR Code Placeholder */}
                  <div style={{
                    width: "90px", height: "90px",
                    background: "linear-gradient(135deg, #e8e4dc, #d8d4cc)",
                    borderRadius: "10px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    border: "1px solid #c8c4bc",
                  }}>
                    {/* QR-like grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "2px", width: "50px", height: "50px", marginBottom: "4px" }}>
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} style={{
                          background: [0,1,2,4,5,6,10,12,14,18,19,20,22,23,24].includes(i) ? "#4a5a4a" : "#ddd8d0",
                          borderRadius: "1px",
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: "8px", color: "#8a9a8a", fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.1em" }}>
                      SCAN TO VERIFY
                    </span>
                  </div>
                </div>
              </div>

              {/* ─── BOTTOM: Signature + SDG ─── */}
              <div style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                borderTop: "1px solid #10b98120",
                paddingTop: "16px",
                marginTop: "auto",
              }}>
                {/* Signature */}
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: "180px",
                    borderBottom: "1.5px solid #2d4a2d",
                    marginBottom: "6px",
                    paddingBottom: "4px",
                    fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                    fontSize: "20px",
                    color: "#2d4a2d",
                  }}>
                    A. Kumar
                  </div>
                  <p style={{ fontSize: "10px", color: "#8a9a8a", fontFamily: "'Inter', sans-serif", fontWeight: 600, margin: 0, letterSpacing: "0.03em" }}>
                    Platform Director, CarbonX
                  </p>
                </div>

                {/* SDG Goals */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "9px", color: "#8a9a8a", fontFamily: "'Inter', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: "4px" }}>
                    UN SDGs
                  </span>
                  <SDGBadge number={13} label="Climate" color="#3f7e44" />
                  <SDGBadge number={15} label="Land" color="#56c02b" />
                  <SDGBadge number={2} label="Food" color="#dda63a" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Print Styles ── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #carbonx-certificate,
          #carbonx-certificate * {
            visibility: visible !important;
          }
          #carbonx-certificate {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>
    </>
  );
}
