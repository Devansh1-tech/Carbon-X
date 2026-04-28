import { useState, useMemo, useCallback } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { MapPin } from "lucide-react";

const MAP_CENTER = { lat: 22.5, lng: 80.0 };
const MAP_ZOOM = 5;

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

/* ── Fallback placeholder ── */
function MapFallback() {
  return (
    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#16213e] to-[#0f1117] border border-white/[0.06] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <span className="text-3xl">🗺️</span>
      </div>
      <div className="text-center">
        <p className="text-gray-400 font-medium">Map loading...</p>
        <p className="text-gray-600 text-sm mt-1">Add Google Maps API key to enable</p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs text-gray-500">Set VITE_GOOGLE_MAPS_KEY in .env</span>
      </div>
    </div>
  );
}

/* ═══ PROJECT MAP ═══ */
export default function ProjectMap({ projects = [] }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const hasKey = apiKey && apiKey !== "YOUR_KEY_HERE";

  const verifiedProjects = useMemo(
    () => projects.filter((p) => p.status === "verified" && p.location?.lat && p.location?.lng),
    [projects]
  );

  const [selectedProject, setSelectedProject] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "carbonx-map",
    googleMapsApiKey: hasKey ? apiKey : "",
  });

  const onMarkerClick = useCallback((project) => {
    setSelectedProject(project);
  }, []);

  const onInfoClose = useCallback(() => {
    setSelectedProject(null);
  }, []);

  /* No key or not loaded → fallback */
  if (!hasKey) {
    return (
      <div className="w-full">
        <div className="h-[400px]">
          <MapFallback />
        </div>
        <p className="text-center text-gray-500 text-sm mt-4">
          📍 <span className="text-emerald-400 font-semibold">{verifiedProjects.length}</span> active projects across India
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-[#16213e] border border-white/[0.06] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-[400px] rounded-2xl overflow-hidden border border-white/[0.06]">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          options={mapOptions}
        >
          {verifiedProjects.map((project) => (
            <MarkerF
              key={project.id}
              position={{ lat: project.location.lat, lng: project.location.lng }}
              label={{
                text: "🌿",
                fontSize: "20px",
                className: "map-marker-label",
              }}
              onClick={() => onMarkerClick(project)}
            />
          ))}

          {selectedProject && (
            <InfoWindowF
              position={{
                lat: selectedProject.location.lat,
                lng: selectedProject.location.lng,
              }}
              onCloseClick={onInfoClose}
            >
              <div style={{ padding: "8px", maxWidth: "220px", color: "#1a1a2e", fontFamily: "Inter, sans-serif" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px" }}>
                  {selectedProject.title}
                </h3>
                <div style={{ display: "inline-block", padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 600, color: TYPE_COLORS[selectedProject.type] || "#10b981", background: `${TYPE_COLORS[selectedProject.type] || "#10b981"}20`, marginBottom: "8px" }}>
                  {TYPE_LABELS[selectedProject.type] || selectedProject.type}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.6 }}>
                  <div>📍 {selectedProject.location.city}, {selectedProject.location.state}</div>
                  <div>🌱 Credits: <strong style={{ color: "#10b981" }}>{selectedProject.creditsGenerated}</strong></div>
                  {selectedProject.treesPlanted > 0 && (
                    <div>🌳 Trees: <strong>{selectedProject.treesPlanted.toLocaleString()}</strong></div>
                  )}
                </div>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>
      <p className="text-center text-gray-500 text-sm mt-4">
        📍 <span className="text-emerald-400 font-semibold">{verifiedProjects.length}</span> active projects across India
      </p>
    </div>
  );
}
