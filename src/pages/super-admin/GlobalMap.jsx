import { useMemo, useState } from 'react';
import { useRegions } from '../../context/RegionContext'; // Correct Import

// ... (Icons and COORDINATE_SLOTS remain exactly the same) ...
const Icons = {
  // ... (Paste your icons here)
  Server: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>,
  Activity: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Wifi: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>,
  MapPin: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
};

const COORDINATE_SLOTS = [
  { top: '20%', left: '20%' }, { top: '30%', left: '50%' },
  { top: '60%', left: '30%' }, { top: '50%', left: '70%' },
  { top: '20%', left: '70%' }, { top: '70%', left: '50%' },
  { top: '40%', left: '10%' }, { top: '80%', left: '80%' },
];

const GlobalMap = () => {
  const { regions } = useRegions();
  const [activeRegionId, setActiveRegionId] = useState(null);

  // ... (mapNodes Logic remains the same) ...
  const mapNodes = useMemo(() => {
    return regions.map((region, index) => {
      const slot = COORDINATE_SLOTS[index % COORDINATE_SLOTS.length];
      const isOnline = region.status === 'Active';
      return {
        ...region, ...slot,
        color: isOnline ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50',
        pulse: isOnline ? 'animate-ping' : '',
        connectionQuality: isOnline ? 'Optimal' : 'Offline',
        stats: {
          uploads: Math.floor(Math.random() * 500) + 120,
          latency: isOnline ? `${Math.floor(Math.random() * 40) + 10}ms` : '---',
          storage: `${Math.floor(Math.random() * 80) + 10}% Used`
        }
      };
    });
  }, [regions]);

  const activeNode = activeRegionId ? mapNodes.find(n => n.id === activeRegionId) : null;

  return (
    // ... (Your existing JSX Return Block) ...
    <div className="p-6 h-[calc(100vh-2rem)] flex flex-col animate-fade-in">
       {/* Paste the rest of your UI here exactly as it was */}
       <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Regional Command Center</h1>
          <p className="text-gray-500 text-sm">Real-time geospatial visualization of DOST regional nodes.</p>
        </div>
        {/* ... */}
       </div>
       <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl relative overflow-hidden shadow-2xl border border-slate-800 p-8 flex items-center justify-center">
             {/* Map Content */}
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
             <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
               {mapNodes.map((node, i) => (
                 <line key={`link-${i}`} x1="50%" y1="50%" x2={node.left} y2={node.top} stroke={node.status === 'Active' ? '#10b981' : '#ef4444'} strokeWidth="1" strokeDasharray="4,4" />
               ))}
               <circle cx="50%" cy="50%" r="4" fill="white" opacity="0.5" />
             </svg>
             <div className="absolute inset-0 w-full h-full">
                {mapNodes.map((node) => (
                  <button key={node.id} onClick={() => setActiveRegionId(node.id)} style={{ top: node.top, left: node.left }} className="absolute transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none">
                    {node.status === 'Active' && <div className={`absolute -inset-6 rounded-full opacity-20 ${node.pulse} ${node.color}`}></div>}
                    <div className={`relative w-4 h-4 rounded-full border-2 border-slate-900 shadow-lg ${node.color} group-hover:scale-150 transition-all duration-300 z-10`}></div>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">{node.code}</div>
                  </button>
                ))}
             </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
             {activeNode ? (
                <div className="flex-1 flex flex-col animate-fade-in">
                   <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
                      <h2 className="text-xl font-bold text-gray-800 leading-tight">{activeNode.name}</h2>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500"><Icons.MapPin /> {activeNode.address}</div>
                   </div>
                   {/* ... Stats & Logs ... */}
                   <div className="p-6 grid grid-cols-2 gap-4 border-b border-gray-100">
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100"><span className="text-lg font-bold text-gray-800">{activeNode.stats.uploads}</span></div>
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-100"><span className="text-lg font-bold text-gray-800">{activeNode.stats.latency}</span></div>
                   </div>
                   <div className="p-4 border-t border-gray-100"><button onClick={() => setActiveRegionId(null)} className="w-full py-2.5 text-xs font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-lg transition-all uppercase tracking-wide">Close Data Stream</button></div>
                </div>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/30">
                   <div className="w-20 h-20 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center mb-6 relative"><div className="absolute inset-0 rounded-full border-4 border-indigo-50 animate-ping opacity-75"></div><div className="text-4xl animate-pulse">🌍</div></div>
                   <h3 className="text-lg font-bold text-gray-800">Awaiting Selection</h3>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default GlobalMap;