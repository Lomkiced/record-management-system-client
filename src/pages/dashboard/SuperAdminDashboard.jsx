import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- ICONS ---
const Icons = {
  Users: () => <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Files: () => <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Shield: () => <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Server: () => <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>,
  Activity: () => <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Map: () => <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // REAL DATA STATE
  const [stats, setStats] = useState({
    users: 0,
    records: 0,
    storage: 0,
    regions: { total: 0, active: 0, inactive: 0 },
    recent_activity: []
  });

  // --- REAL-TIME CLOCK ---
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- FETCH REAL DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('dost_token');
            const response = await fetch('http://localhost:5000/api/dashboard/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error("Dashboard Sync Failed", err);
        } finally {
            setLoading(false);
        }
    };
    fetchDashboardData();
  }, []);

  // Format Bytes for Storage Card
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold animate-pulse tracking-widest text-xs">INITIALIZING COMMAND CENTER...</p>
    </div>
  );

  return (
    <div className="p-8 min-h-screen bg-slate-50/50 animate-fade-in flex flex-col gap-8">
      
      {/* 1. HERO HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Online</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Command Center</h1>
            <p className="text-slate-500 mt-1 font-medium">Real-time surveillance & governance overview.</p>
        </div>
        <div className="text-right hidden md:block bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-3xl font-bold text-indigo-600 tabular-nums leading-none">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
        </div>
      </div>

      {/* 2. STATS GRID (LIVE DATA) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* USERS CARD */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Icons.Users /></div>
            <div className="flex justify-between items-start z-10 relative">
                <div>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Active Personnel</p>
                    <h2 className="text-4xl font-bold">{stats.users}</h2>
                </div>
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Icons.Users /></div>
            </div>
            <button onClick={() => navigate('/users')} className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-indigo-100 transition-colors flex items-center justify-center gap-2">
                Manage Accounts →
            </button>
        </div>

        {/* RECORDS CARD */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-200 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Icons.Files /></div>
            <div className="flex justify-between items-start z-10 relative">
                <div>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Total Records</p>
                    <h2 className="text-4xl font-bold">{stats.records}</h2>
                </div>
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Icons.Files /></div>
            </div>
            <button onClick={() => navigate('/registry')} className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-emerald-100 transition-colors flex items-center justify-center gap-2">
                Access Vault →
            </button>
        </div>

        {/* STORAGE CARD (Calculated from Bytes) */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-xl shadow-slate-300 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Icons.Server /></div>
            <div className="flex justify-between items-start z-10 relative">
                <div>
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-1">Storage Consumed</p>
                    <h2 className="text-4xl font-bold">{formatBytes(stats.storage)}</h2>
                </div>
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Icons.Server /></div>
            </div>
            <div className="mt-6 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[5%] animate-pulse"></div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Stable</span>
            </div>
        </div>
      </div>

      {/* 3. SPLIT SECTION: LIVE FEED & HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LIVE SECURITY FEED (Audit Logs) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Icons.Shield /> Live Security Feed
                </h3>
                <button onClick={() => navigate('/audit')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">View All Logs</button>
            </div>
            <div className="p-0">
                {stats.recent_activity.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No recent activity recorded.</div>
                ) : (
                    stats.recent_activity.map((log, index) => (
                        <div key={log.log_id} className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${index !== stats.recent_activity.length - 1 ? 'border-b border-slate-50' : ''}`}>
                            <div className={`w-2 h-2 rounded-full ${log.action.includes('FAILED') ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-700">
                                    <span className="text-indigo-600">{log.username}</span> <span className="text-slate-400 font-normal">performed</span> {log.action}
                                </p>
                                <p className="text-xs text-slate-400 truncate max-w-md">{log.details}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* REGIONAL HEALTH STATUS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
                <Icons.Map />
                <h3 className="font-bold text-slate-800">Regional Governance</h3>
            </div>
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Connected Offices</span>
                    <span className="text-2xl font-bold text-emerald-600">{stats.regions.active}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Offline / Maintenance</span>
                    <span className="text-2xl font-bold text-slate-400">{stats.regions.inactive}</span>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                        <div 
                            className="bg-emerald-500 h-2.5 rounded-full" 
                            style={{ width: `${stats.regions.total > 0 ? (stats.regions.active / stats.regions.total) * 100 : 0}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-center text-slate-400 font-medium">
                        {stats.regions.total} Total Regions Configured
                    </p>
                </div>
                
                <button onClick={() => navigate('/regions')} className="w-full py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                    Manage Regions
                </button>
            </div>
        </div>

      </div>

    </div>
  );
};

export default SuperAdminDashboard;