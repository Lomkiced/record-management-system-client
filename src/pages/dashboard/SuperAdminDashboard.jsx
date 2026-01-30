import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RetentionMonitor from '../../components/dashboard/RetentionMonitor';

// --- CUSTOM ICONS (SVG) ---
const Icons = {
  Users: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Files: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Server: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>,
  Activity: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Clock: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0, records: 0, storage: 0,
    regions: { total: 0, active: 0, inactive: 0 },
    recent_activity: [], disposal_queue: []
  });

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('dost_token');
        const res = await fetch('/api/dashboard/stats', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setStats({
            ...data,
            recent_activity: data.recent_activity || [],
            disposal_queue: data.disposal_queue || [],
            regions: data.regions || { total: 0, active: 0, inactive: 0 }
          });
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-indigo-700 gap-4">
      <div className="w-14 h-14 border-4 border-slate-200 border-t-indigo-700 rounded-full animate-spin"></div>
      <div className="font-bold text-sm tracking-[0.2em] uppercase text-slate-500">Loading System...</div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-700 font-sans p-4 lg:p-6 flex flex-col gap-5">

      {/* --- EXECUTIVE HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end bg-white rounded-2xl p-5 shadow-sm border border-slate-200 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">System Operational</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight leading-none">Command Center</h1>
          <p className="text-slate-500 font-medium text-base mt-1">Super Admin Overview</p>
        </div>
        <div className="text-right hidden md:block border-l border-slate-100 pl-6">
          <p className="text-4xl font-black text-indigo-900 tabular-nums tracking-tight">{time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      {/* --- KEY PERFORMANCE INDICATORS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 shrink-0">

        {/* Card 1: Personnel */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between h-32 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Personnel</p>
              <h3 className="text-4xl font-bold text-slate-800 mt-1">{stats.users}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform"><Icons.Users /></div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-indigo-600 h-full w-[70%]"></div>
          </div>
        </div>

        {/* Card 2: Records */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between h-32 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Records</p>
              <h3 className="text-4xl font-bold text-slate-800 mt-1">{stats.records}</h3>
            </div>
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl group-hover:scale-110 transition-transform"><Icons.Files /></div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-cyan-600 h-full w-[85%]"></div>
          </div>
        </div>

        {/* Card 3: Regions */}


        {/* Card 4: Vault */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between h-32 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Storage</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1 leading-tight">{formatBytes(stats.storage)}</h3>
            </div>
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl group-hover:scale-110 transition-transform"><Icons.Server /></div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-slate-500 h-full w-[45%]"></div>
          </div>
        </div>
      </div>

      {/* --- SPLIT PANE CONTENT --- */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MAIN PANEL: RETENTION */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-0">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shadow-sm"><Icons.Clock /></div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Retention Warnings</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Files Expiring within 7 Days</p>
              </div>
            </div>
            <button onClick={() => navigate('/registry')} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              View Registry
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 relative">
            <RetentionMonitor disposalQueue={stats.disposal_queue} darkMode={false} />
          </div>
        </div>

        {/* SIDE PANEL: STATUS & LOGS */}
        <div className="flex flex-col gap-6 min-h-0">

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <button onClick={() => navigate('/users')} className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex flex-col items-center justify-center gap-1 group">
              <Icons.Users />
              <span className="text-sm font-bold">Manage Users</span>
            </button>
            <button onClick={() => navigate('/registry')} className="bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-1">
              <Icons.Files />
              <span className="text-sm font-bold">View Files</span>
            </button>
          </div>

          {/* Live Feed */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Security Log</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs custom-scrollbar">
              {stats.recent_activity.length === 0 ? (
                <div className="text-slate-400 italic text-center py-4">No recent activity</div>
              ) : stats.recent_activity.map((log) => (
                <div key={log.log_id} className="flex gap-3 items-start border-l-2 border-slate-200 pl-3 py-0.5">
                  <span className="text-slate-400 font-semibold">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <div>
                    <span className="block font-bold text-slate-700">{log.action}</span>
                    <span className="block text-slate-500 text-[10px]">user: {log.username}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;