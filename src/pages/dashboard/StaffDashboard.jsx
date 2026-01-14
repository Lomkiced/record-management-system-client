import { useCallback, useEffect, useState } from 'react';
import RecordModal from '../../components/registry/RecordModal';
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
  Plus: () => <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Clock: () => <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Alert: () => <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Upload: () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Activity: () => <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
};

// --- SKELETON LOADER ---
const DashboardSkeleton = () => (
  <div className="p-8 space-y-8 animate-pulse">
    <div className="flex justify-between items-end">
        <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-48 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
    </div>
  </div>
);

const StaffDashboard = () => {
  const { user } = useAuth();
  
  // 1. Initialize State
  const [stats, setStats] = useState({ 
      records: 0, 
      disposal_queue: [], 
      recent_activity: [] 
  });
  
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  // 2. Real-Time Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. REFRESH LOGIC (THE FIX)
  // We wrap this in useCallback so we can trigger it manually later
  const refreshDashboard = useCallback(async () => {
    try {
        const token = localStorage.getItem('dost_token');
        // Add timestamp to prevent caching
        const res = await fetch(`http://localhost:5000/api/dashboard/stats?t=${new Date().getTime()}`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        if (res.ok) {
            const data = await res.json();
            setStats({ 
                records: data.records || 0,
                disposal_queue: data.disposal_queue || [],
                recent_activity: data.recent_activity || []
            });
        }
    } catch (e) { 
        console.error("Staff Dashboard Sync Error:", e); 
    } finally { 
        setLoading(false); 
    }
  }, []);

  // Initial Load
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // 4. HANDLERS
  const handleUploadSuccess = () => {
      setIsUploadModalOpen(false); // Close Modal
      refreshDashboard(); // <--- CRITICAL: Triggers immediate data reload
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
  };

  const getDaysLeft = (date) => {
      const diff = new Date(date) - new Date();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-8 min-h-screen bg-slate-50/50 animate-fade-in flex flex-col gap-8 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace Active</span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                {getGreeting()}, <span className="text-indigo-600">{user?.username || 'Staff'}</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
                Region: <span className="text-slate-700 font-bold">{user?.region || 'Assigned Region'}</span>
            </p>
        </div>

        {/* TIME WIDGET */}
        <div className="text-right hidden md:block">
            <p className="text-3xl font-black text-slate-800 tabular-nums">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: METRICS & ALERTS */}
        <div className="space-y-6">
            
            {/* MY UPLOADS CARD */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group transition-all hover:-translate-y-1">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">My Contribution</p>
                        <h2 className="text-5xl font-black">{stats.records}</h2>
                        <p className="text-indigo-100 text-xs mt-2 font-medium">Documents Uploaded</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Icons.Upload /></div>
                </div>
                {/* Decorative Circles */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
            </div>
            
            {/* DISPOSAL MONITOR */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Icons.Clock /> Retention Alert
                    </h3>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100">
                        {stats.disposal_queue.length} Pending
                    </span>
                </div>
                
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                    {(!stats.disposal_queue || stats.disposal_queue.length === 0) ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <div className="p-3 bg-emerald-50 rounded-full text-emerald-500 mb-2"><Icons.Check /></div>
                            <p className="text-sm font-bold text-slate-600">All Clear</p>
                            <p className="text-xs text-slate-400">No records pending disposal.</p>
                        </div>
                    ) : (
                        stats.disposal_queue.map(rec => {
                            const days = getDaysLeft(rec.disposal_date);
                            const isExpired = days < 0;
                            return (
                                <div key={rec.record_id} className={`group flex items-start gap-3 p-3 rounded-xl border transition-all ${isExpired ? 'bg-red-50 border-red-100 hover:border-red-200' : 'bg-white border-slate-100 hover:border-amber-200 hover:shadow-sm'}`}>
                                    <div className={`mt-0.5 p-1.5 rounded-lg ${isExpired ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {isExpired ? <Icons.Alert /> : <Icons.Clock />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{rec.title}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-[10px] text-slate-400 font-mono">{new Date(rec.disposal_date).toLocaleDateString()}</span>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isExpired ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                {isExpired ? 'EXPIRED' : `${days} DAYS`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: ACTION & ACTIVITY */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* HERO ACTION */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="relative z-10 max-w-lg">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Quick Upload</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Digitize and secure physical documents. Ensure all files are correctly classified according to the 
                        <span className="font-bold text-indigo-600"> 2025 General Records Disposition Schedule</span>.
                    </p>
                    <button 
                        onClick={() => setIsUploadModalOpen(true)} 
                        className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95"
                    >
                        <Icons.Plus /> <span>Upload New Record</span>
                    </button>
                </div>
                <div className="hidden md:block relative z-10">
                    <div className="w-32 h-32 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <Icons.Upload />
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* RECENT ACTIVITY FEED */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Icons.Activity /> Regional Activity Feed
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">LIVE</span>
                </div>
                <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                    {(!stats.recent_activity || stats.recent_activity.length === 0) ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">No recent activity found.</div>
                    ) : (
                        stats.recent_activity.map((log, i) => (
                            <div key={log.log_id} className={`p-4 hover:bg-slate-50 transition-colors flex gap-4 ${i !== stats.recent_activity.length -1 ? 'border-b border-slate-50' : ''}`}>
                                <div className="mt-1">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 mb-0.5">
                                        <span className="font-bold text-slate-700">{log.username || 'System'}</span> 
                                        <span className="mx-1">performed</span> 
                                        <span className="font-bold text-indigo-600">{log.action}</span>
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono">{new Date(log.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>

      {/* 5. PASS HANDLE SUCCESS TO MODAL */}
      <RecordModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
          onSuccess={handleUploadSuccess} 
      />
    </div>
  );
};

export default StaffDashboard;