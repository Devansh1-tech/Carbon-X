import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, InfoWindowF } from "@react-google-maps/api";
import { MapPin, Filter, Eye, EyeOff, Layers, TreePine, Sprout, Zap } from "lucide-react";
import ProjectDetailPanel from "./ProjectDetailPanel";

/* ══════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════ */
const MAP_CENTER = { lat: 22.5, lng: 80.0 };
const MAP_ZOOM = 5;
const LIBRARIES = ["visualization"];
const containerStyle = { width: "100%", height: "100%" };

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f3460" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#16213e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
];

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  styles: darkMapStyle,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

const TYPE_COLORS = {
  tree_plantation: "#10b981",
  soil_carbon: "#f59e0b",
  renewable_energy: "#0ea5e9",
};

const TYPE_LABELS = {
  tree_plantation: "🌳 Tree Plantation",
  soil_carbon: "🌾 Soil Carbon",
  renewable_energy: "⚡ Renewable Energy",
};

const TYPE_ICONS = {
  tree_plantation: TreePine,
  soil_carbon: Sprout,
  renewable_energy: Zap,
};

/* ── Heatmap mock data: 20 points across MP, Maharashtra, Rajasthan ── */
const HEATMAP_DATA = [
  { lat: 22.7533, lng: 77.7264, weight: 8 },
  { lat: 22.7196, lng: 75.8577, weight: 5 },
  { lat: 23.2005, lng: 77.0855, weight: 3 },
  { lat: 23.2599, lng: 77.4126, weight: 6 },
  { lat: 22.0574, lng: 78.9382, weight: 4 },
  { lat: 21.1458, lng: 79.0882, weight: 7 },
  { lat: 19.0760, lng: 72.8777, weight: 9 },
  { lat: 17.6805, lng: 74.0183, weight: 10 },
  { lat: 18.5204, lng: 73.8567, weight: 8 },
  { lat: 19.9975, lng: 73.7898, weight: 5 },
  { lat: 20.9320, lng: 77.7523, weight: 4 },
  { lat: 26.2389, lng: 73.0243, weight: 6 },
  { lat: 25.7521, lng: 71.3967, weight: 3 },
  { lat: 26.9124, lng: 75.7873, weight: 7 },
  { lat: 24.5854, lng: 73.7125, weight: 5 },
  { lat: 27.0238, lng: 74.2179, weight: 4 },
  { lat: 25.3176, lng: 82.9739, weight: 3 },
  { lat: 23.8103, lng: 78.7572, weight: 6 },
  { lat: 21.7679, lng: 72.1519, weight: 5 },
  { lat: 20.2961, lng: 85.8245, weight: 2 },
];

/* ══════════════════════════════════════════════
   CUSTOM MARKER SVG
   ══════════════════════════════════════════════ */
function createMarkerSVG(project) {
  const color = TYPE_COLORS[project.type] || "#10b981";
  const isLarge = (project.treesPlanted || 0) > 1000;
  const isPending = project.status === "pending";
  const size = isLarge ? 48 : 36;
  const r = size / 2 - 2;
  const credits = project.creditsGenerated || 0;

  const glowFilter = isLarge
    ? `<filter id="glow"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    : "";

  const pulseAnim = isPending
    ? `<animate attributeName="r" from="${r}" to="${r + 6}" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite"/>`
    : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size + 16}" height="${size + 20}" viewBox="0 0 ${size + 16} ${size + 20}">
    ${glowFilter}
    ${isPending ? `<circle cx="${(size + 16) / 2}" cy="${size / 2 + 2}" r="${r}" fill="none" stroke="${color}" stroke-width="2" opacity="0.3">${pulseAnim}</circle>` : ""}
    <circle cx="${(size + 16) / 2}" cy="${size / 2 + 2}" r="${r}" fill="${color}" opacity="0.9" ${isLarge ? 'filter="url(#glow)"' : ""} />
    <circle cx="${(size + 16) / 2}" cy="${size / 2 + 2}" r="${r - 3}" fill="${color}" />
    <text x="${(size + 16) / 2}" y="${size / 2 + 6}" text-anchor="middle" fill="white" font-size="${isLarge ? 18 : 14}" font-weight="bold">
      ${project.type === "tree_plantation" ? "🌿" : project.type === "soil_carbon" ? "🌾" : "⚡"}
    </text>
    ${credits > 0 ? `
      <rect x="${size - 2}" y="0" width="${Math.max(28, String(credits).length * 8 + 12)}" height="18" rx="9" fill="#0f1117" stroke="${color}" stroke-width="1.5"/>
      <text x="${size + Math.max(12, String(credits).length * 4 + 4)}" y="13" text-anchor="middle" fill="${color}" font-size="10" font-weight="700">${credits}</text>
    ` : ""}
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* ══════════════════════════════════════════════
   FALLBACK MAP (no API key)
   ══════════════════════════════════════════════ */
function InteractiveFallback({ projects, typeFilter, onSelectProject, onFilterChange }) {
  const allProjects = useMemo(
    () => projects.filter((p) => p.location?.lat && p.location?.lng && (p.status === "verified" || p.status === "pending")),
    [projects]
  );
  const filtered = useMemo(
    () => typeFilter === "all" ? allProjects : allProjects.filter((p) => p.type === typeFilter),
    [allProjects, typeFilter]
  );

  /* Map India's approximate bounds to px coordinates */
  const toBounds = (lat, lng) => {
    const minLat = 8, maxLat = 35, minLng = 68, maxLng = 97;
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
  };

  const totalCredits = filtered.reduce((s, p) => s + p.creditsGenerated, 0);
  const totalCO2 = totalCredits;
  const statesSet = new Set(filtered.map((p) => p.location?.state).filter(Boolean));

  return (
    <div className="w-full h-full relative rounded-2xl bg-gradient-to-br from-[#16213e] to-[#0f1117] border border-white/[0.06] overflow-hidden">
      {/* Dot grid background */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />

      {/* India outline glow */}
      <div className="absolute inset-0 opacity-[0.08]"
        style={{ background: "radial-gradient(ellipse at 45% 55%, #10b981 0%, transparent 60%)" }} />

      {/* Filter controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-1.5">
        {[
          { key: "all", label: "All", icon: Filter },
          { key: "tree_plantation", label: "Trees", icon: TreePine },
          { key: "soil_carbon", label: "Soil", icon: Sprout },
          { key: "renewable_energy", label: "Energy", icon: Zap },
        ].map((f) => (
          <button key={f.key} onClick={() => onFilterChange(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              typeFilter === f.key
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-black/40 text-gray-500 border border-white/[0.06] hover:text-gray-300 hover:bg-black/60"
            }`}
          >
            <f.icon className="w-3 h-3" />{f.label}
          </button>
        ))}
      </div>

      {/* Project dots */}
      {filtered.map((p) => {
        const pos = toBounds(p.location.lat, p.location.lng);
        const color = TYPE_COLORS[p.type] || "#10b981";
        const isLarge = (p.treesPlanted || 0) > 1000;
        const isPending = p.status === "pending";
        const dotSize = isLarge ? 16 : 10;
        return (
          <button
            key={p.id}
            onClick={() => onSelectProject(p)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-[5]"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            title={p.title}
          >
            {/* Pulse ring for pending */}
            {isPending && (
              <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: color, width: dotSize + 8, height: dotSize + 8, top: -4, left: -4 }} />
            )}
            {/* Glow for large */}
            {isLarge && (
              <span className="absolute rounded-full" style={{ backgroundColor: color, width: dotSize + 12, height: dotSize + 12, top: -6, left: -6, opacity: 0.15, filter: "blur(6px)" }} />
            )}
            {/* Dot */}
            <span className="relative block rounded-full border-2 transition-all duration-200 group-hover:scale-150"
              style={{ width: dotSize, height: dotSize, backgroundColor: color, borderColor: color, boxShadow: `0 0 8px ${color}40` }} />
            {/* Credits badge */}
            {p.creditsGenerated > 0 && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "#0f1117", color: color, border: `1px solid ${color}50` }}>
                {p.creditsGenerated} CC
              </span>
            )}
          </button>
        );
      })}

      {/* Heatmap overlay (CSS approximation) */}
      {HEATMAP_DATA.map((h, i) => {
        const pos = toBounds(h.lat, h.lng);
        return (
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{
              left: `${pos.x}%`, top: `${pos.y}%`,
              width: h.weight * 10, height: h.weight * 10,
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, rgba(16,185,129,${h.weight * 0.03}) 0%, transparent 70%)`,
            }} />
        );
      })}

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/[0.08]">
        <span className="text-[11px] text-gray-400">
          📍 <span className="text-emerald-400 font-bold">{filtered.length}</span> Projects
        </span>
        <span className="text-white/10">|</span>
        <span className="text-[11px] text-gray-400">
          🌍 <span className="text-emerald-400 font-bold">{totalCO2.toLocaleString()}</span> tons CO₂
        </span>
        <span className="text-white/10">|</span>
        <span className="text-[11px] text-gray-400">
          🗺️ <span className="text-emerald-400 font-bold">{statesSet.size}</span> States
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   GOOGLE MAPS VERSION
   ══════════════════════════════════════════════ */
function GoogleMapView({ projects, typeFilter, heatmapOn, onSelectProject, mapViewType }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const { isLoaded } = useJsApiLoader({
    id: "carbonx-map",
    googleMapsApiKey: apiKey || "",
    libraries: LIBRARIES,
  });

  const mapRef = useRef(null);
  const heatmapRef = useRef(null);
  const markersRef = useRef([]);
  const [infoProject, setInfoProject] = useState(null);

  const filteredProjects = useMemo(() => {
    let list = projects.filter((p) => p.location?.lat && p.location?.lng && (p.status === "verified" || p.status === "pending"));
    if (typeFilter !== "all") list = list.filter((p) => p.type === typeFilter);
    return list;
  }, [projects, typeFilter]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  /* Manage custom markers manually */
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !window.google) return;

    /* Clear old markers */
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    filteredProjects.forEach((project) => {
      const isLarge = (project.treesPlanted || 0) > 1000;
      const marker = new window.google.maps.Marker({
        position: { lat: project.location.lat, lng: project.location.lng },
        map: mapRef.current,
        icon: {
          url: createMarkerSVG(project),
          scaledSize: new window.google.maps.Size(isLarge ? 64 : 52, isLarge ? 68 : 56),
          anchor: new window.google.maps.Point(isLarge ? 32 : 26, isLarge ? 34 : 28),
        },
        title: project.title,
        optimized: false,
      });
      marker.addListener("click", () => {
        setInfoProject(project);
      });
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
    };
  }, [filteredProjects, isLoaded]);

  /* Heatmap layer */
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !window.google?.maps?.visualization) return;

    if (heatmapRef.current) {
      heatmapRef.current.setMap(null);
      heatmapRef.current = null;
    }

    if (heatmapOn) {
      const heatmapData = HEATMAP_DATA.map(
        (h) => ({ location: new window.google.maps.LatLng(h.lat, h.lng), weight: h.weight })
      );
      heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: mapRef.current,
        radius: 40,
        opacity: 0.6,
        gradient: [
          "rgba(0, 0, 0, 0)",
          "rgba(16, 185, 129, 0.2)",
          "rgba(16, 185, 129, 0.4)",
          "rgba(16, 185, 129, 0.6)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 1)",
        ],
      });
    }
  }, [heatmapOn, isLoaded]);

  /* Map type toggle */
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setMapTypeId(mapViewType === "satellite" ? "satellite" : "roadmap");
  }, [mapViewType]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full rounded-2xl bg-[#16213e] border border-white/[0.06] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      options={mapOptions}
      onLoad={onMapLoad}
    >
      {infoProject && (
        <InfoWindowF
          position={{ lat: infoProject.location.lat, lng: infoProject.location.lng }}
          onCloseClick={() => setInfoProject(null)}
        >
          <div style={{ padding: "10px", maxWidth: "260px", fontFamily: "Inter, sans-serif", color: "#1a1a2e" }}>
            {/* Image */}
            <div style={{ width: "100%", height: "80px", borderRadius: "10px", background: "linear-gradient(135deg, #064e3b, #065f46)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "28px", opacity: 0.5 }}>{infoProject.type === "tree_plantation" ? "🌳" : infoProject.type === "soil_carbon" ? "🌾" : "☀️"}</span>
            </div>
            {/* Farmer */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>{infoProject.userId === "usr_001" ? "👨‍🌾" : infoProject.userId === "usr_002" ? "👩‍🌾" : "🌳"}</span>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 600, margin: 0 }}>
                  {infoProject.userId === "usr_001" ? "Ramesh Patel" : infoProject.userId === "usr_002" ? "Sunita Devi" : "Green Earth Foundation"}
                </p>
              </div>
            </div>
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px" }}>{infoProject.title}</h3>
            <div style={{ display: "inline-block", padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 600, color: TYPE_COLORS[infoProject.type] || "#10b981", background: `${TYPE_COLORS[infoProject.type] || "#10b981"}20`, marginBottom: "8px" }}>
              {TYPE_LABELS[infoProject.type] || infoProject.type}
            </div>
            {/* Stats */}
            <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "#6b7280", marginBottom: "8px" }}>
              {infoProject.treesPlanted > 0 && <span>🌳 {infoProject.treesPlanted.toLocaleString()} trees</span>}
              <span>📐 {infoProject.landArea} acres</span>
              <span style={{ color: "#10b981", fontWeight: 700 }}>💰 {infoProject.creditsGenerated} CC</span>
            </div>
            {/* Status */}
            <div style={{ display: "inline-block", padding: "2px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, color: infoProject.status === "verified" ? "#10b981" : "#f59e0b", background: infoProject.status === "verified" ? "#10b98120" : "#f59e0b20" }}>
              {infoProject.status === "verified" ? "✅ Verified" : "🟡 Pending"}
            </div>
            {/* View button */}
            <button
              onClick={() => onSelectProject(infoProject)}
              style={{ display: "block", width: "100%", marginTop: "10px", padding: "8px", borderRadius: "8px", background: "#10b981", color: "white", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}
            >
              View Full Project →
            </button>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
export default function ProjectMap({ projects = [], height = "400px" }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const hasKey = apiKey && apiKey !== "YOUR_KEY_HERE";

  const [typeFilter, setTypeFilter] = useState("all");
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [mapViewType, setMapViewType] = useState("roadmap");
  const [panelProject, setPanelProject] = useState(null);

  const allVisible = useMemo(() => {
    let list = projects.filter((p) => p.location?.lat && p.location?.lng && (p.status === "verified" || p.status === "pending"));
    if (typeFilter !== "all") list = list.filter((p) => p.type === typeFilter);
    return list;
  }, [projects, typeFilter]);

  const totalCredits = allVisible.reduce((s, p) => s + p.creditsGenerated, 0);
  const statesSet = new Set(allVisible.map((p) => p.location?.state).filter(Boolean));

  return (
    <div className="w-full">
      <div className="relative" style={{ height }}>
        {hasKey ? (
          <>
            <div className="w-full h-full rounded-2xl overflow-hidden border border-white/[0.06]">
              <GoogleMapView
                projects={projects}
                typeFilter={typeFilter}
                heatmapOn={heatmapOn}
                mapViewType={mapViewType}
                onSelectProject={setPanelProject}
              />
            </div>

            {/* Map controls overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5">
              {[
                { key: "all", label: "All Projects", icon: Filter },
                { key: "tree_plantation", label: "Trees", icon: TreePine },
                { key: "soil_carbon", label: "Soil", icon: Sprout },
                { key: "renewable_energy", label: "Energy", icon: Zap },
              ].map((f) => (
                <button key={f.key} onClick={() => setTypeFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    typeFilter === f.key
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                      : "bg-black/60 text-gray-400 border border-white/[0.08] hover:text-white hover:bg-black/80 backdrop-blur-md"
                  }`}>
                  <f.icon className="w-3 h-3" />{f.label}
                </button>
              ))}
            </div>

            {/* Right side controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
              <button onClick={() => setHeatmapOn((h) => !h)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  heatmapOn
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-black/60 text-gray-400 border border-white/[0.08] hover:text-white backdrop-blur-md"
                }`}>
                {heatmapOn ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                Heatmap
              </button>
              <button onClick={() => setMapViewType((v) => v === "roadmap" ? "satellite" : "roadmap")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-black/60 text-gray-400 border border-white/[0.08] hover:text-white backdrop-blur-md transition-all">
                <Layers className="w-3 h-3" />{mapViewType === "roadmap" ? "Satellite" : "Map"}
              </button>
            </div>

            {/* Stats overlay */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/[0.08]">
              <span className="text-[11px] text-gray-400">📍 <span className="text-emerald-400 font-bold">{allVisible.length}</span> Projects</span>
              <span className="text-white/10">|</span>
              <span className="text-[11px] text-gray-400">🌍 <span className="text-emerald-400 font-bold">{totalCredits.toLocaleString()}</span> tons CO₂</span>
              <span className="text-white/10">|</span>
              <span className="text-[11px] text-gray-400">🗺️ <span className="text-emerald-400 font-bold">{statesSet.size}</span> States</span>
            </div>
          </>
        ) : (
          <InteractiveFallback
            projects={projects}
            typeFilter={typeFilter}
            onSelectProject={setPanelProject}
            onFilterChange={setTypeFilter}
          />
        )}
      </div>

      {/* Detail Panel */}
      {panelProject && (
        <ProjectDetailPanel project={panelProject} onClose={() => setPanelProject(null)} />
      )}
    </div>
  );
}
