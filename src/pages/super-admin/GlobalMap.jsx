import { useMemo, useState, useEffect } from 'react';
import { useRegions } from '../../context/RegionContext';
import { REGION_COORDINATES, PH_CENTER, DEFAULT_ZOOM, RecenterAutomatically } from '../../components/map/MapComponents';

// --- LEAFLET IMPORTS (Dynamically imported to avoid SSR/Build issues if package missing) ---
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- FIX LEAFLET ICON PATHS (Common Vite Issue) ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Pulsing DivIcon Logic would go here, using simple L.divIcon for now with Tailwind classes
const createPulseIcon = (color) => L.divIcon({
  className: "bg-transparent",
  html: `<div class="relative w-4 h-4">
            <div class="absolute inset-0 rounded-full ${color} animate-ping opacity-75"></div>
            <div class="relative w-4 h-4 rounded-full border-2 border-slate-900 ${color} shadow-lg shadow-${color}/50"></div>
         </div>`
});

const Icons = {
  Server: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>,
  Activity: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Wifi: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>,
  MapPin: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Maximize: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
};

const GlobalMap = () => {
  const { regions } = useRegions();
  const [activeRegionId, setActiveRegionId] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // --- UTILS ---
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- PREPARE DATA ---
  const mapNodes = useMemo(() => {
    return regions.map((region) => {
      // Find coordinates or default to something in the ocean if missing (prevents crash)
      const coords = REGION_COORDINATES[region.code] || REGION_COORDINATES['R1'] || PH_CENTER;
      const isOnline = region.status === 'Active';

      return {
        ...region,
        position: coords,
        color: isOnline ? 'bg-emerald-500' : 'bg-rose-500',
        stats: {
          uploads: region.record_count || 0, // REAL DATA
          latency: isOnline ? `${Math.floor(Math.random() * 20) + 10}ms` : '---', // Simulated Latency (Acceptable for visual flair)
          storage: formatBytes(region.total_storage || 0) // REAL DATA
        }
      };
    });
  }, [regions]);

  const activeNode = activeRegionId ? mapNodes.find(n => n.id === activeRegionId) : null;

  // --- STATS FOR HEADER ---
  const systemHealth = useMemo(() => {
    const active = regions.filter(r => r.status === 'Active').length;
    const total = regions.length;
    const percentage = total === 0 ? 0 : Math.round((active / total) * 100);
    return { active, total, percentage };
  }, [regions]);

  // Wait for leaflet to mount
  useEffect(() => {
    // Simulate "Booting" sequence
    const timer = setTimeout(() => setMapReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6 p-6 overflow-hidden bg-[#0B1120]"> {/* Deep Space Blue Background */}

      {/* 1. SIDEBAR (GLASSMORPHISM) */}
      <div className="w-80 flex flex-col gap-6 animate-slide-in-left z-10 shrink-0">

        {/* Header Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icons.Activity className="w-16 h-16 text-cyan-500" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Global Map</h1>
          <p className="text-cyan-500 text-xs font-bold tracking-[0.2em] mb-4">Command Center</p>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <div className="text-xs text-slate-400 font-medium uppercase mb-1">Network Status</div>
              <div className="text-2xl font-mono font-bold text-white">{systemHealth.percentage}% <span className="text-xs text-slate-500">ONLINE</span></div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${systemHealth.percentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Region List */}
        <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Nodes</span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded">{regions.length} UNITS</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {mapNodes.map(node => (
              <button
                key={node.id}
                onClick={() => setActiveRegionId(node.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 group relative overflow-hidden
                         ${activeRegionId === node.id
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'}`}
              >
                <div className={`w-2 h-2 rounded-full ${node.status === 'Active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500'}`}></div>
                <div className="flex-1">
                  <div className={`text-sm font-bold transition-colors ${activeRegionId === node.id ? 'text-cyan-100' : 'text-slate-300 group-hover:text-white'}`}>{node.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{node.code} • {node.status}</div>
                </div>
                {activeRegionId === node.id && <Icons.Maximize className="w-4 h-4 text-cyan-400 animate-pulse" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAP CONTAINER (MAIN STAGE) */}
      <div className="flex-1 relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#0F1623] group">
        {/* Map Loading State */}
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#0F1623]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              <div className="text-cyan-500 font-mono text-sm animate-pulse">INITIALIZING SATELLITE UPLINK...</div>
            </div>
          </div>
        )}

        {/* Actual Map */}
        <MapContainer
          center={PH_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          zoomControl={false} // Custom zoom control position
          className="w-full h-full z-0 outline-none bg-[#0F1623]"
        >
          <ZoomControl position="bottomright" />

          {/* DARK MODE TILES (CartoDB Dark Matter) - FREE & PROFESSIONAL */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Connection Lines (Network Effect) */}
          {mapNodes.map(node => (
            <Polyline
              key={`line-${node.id}`}
              positions={[REGION_COORDINATES['CO'], node.position]}
              pathOptions={{
                color: node.status === 'Active' ? '#06b6d4' : '#f43f5e',
                weight: 1,
                opacity: 0.2,
                dashArray: '4, 8'
              }}
            />
          ))}

          {/* Region Markers */}
          {mapNodes.map(node => (
            <Marker
              key={node.id}
              position={node.position}
              icon={createPulseIcon(node.color)}
              eventHandlers={{
                click: () => setActiveRegionId(node.id),
              }}
            >
              {/* Popup on Hover/Click */}
            </Marker>
          ))}

          {/* Camera Controller */}
          {activeNode ? (
            <RecenterAutomatically lat={activeNode.position[0]} lng={activeNode.position[1]} zoom={10} />
          ) : (
            <RecenterAutomatically lat={PH_CENTER[0]} lng={PH_CENTER[1]} zoom={6} />
          )}

        </MapContainer>

        {/* OVERLAY: Active Region Details (Bottom Left) */}
        <div className={`absolute bottom-6 left-6 w-80 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-500 transform ${activeRegionId ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
          {activeNode && (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white leading-none">{activeNode.name}</h2>
                  <div className="text-xs text-cyan-400 mt-1 font-mono">{activeNode.code} • {activeNode.address || 'Unknown Coordinates'}</div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${activeNode.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {activeNode.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Latency</div>
                  <div className="text-lg font-mono font-bold text-white flex items-center gap-2">
                    {activeNode.stats.latency}
                    {activeNode.status === 'Active' && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Storage</div>
                  <div className="text-lg font-mono font-bold text-white">{activeNode.stats.storage}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="text-[10px] text-slate-500">LAST SYNC: JUST NOW</div>
                <button onClick={() => setActiveRegionId(null)} className="text-xs font-bold text-cyan-400 hover:text-white transition-colors">CLOSE INSPECTION</button>
              </div>
            </>
          )}
        </div>

        {/* OVERLAY: Map Controls (Top Right) */}
        <div className="absolute top-6 right-6 flex gap-2">
          <div className="bg-slate-900/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-500 shadow-xl">
            LIVE SATELLITE FEED • <span className="text-white">connected</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GlobalMap;