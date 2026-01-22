import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RecordModal from '../../components/registry/RecordModal';
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
    Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Clock: () => <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Check: () => <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Alert: () => <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Upload: () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    Activity: () => <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Trending: () => <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
};

const StaffDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // 1. Initialize State
    const [stats, setStats] = useState({
        records: 0,
        disposal_queue: [],
        recent_activity: [],
        monthly_stats: [] // My Uploads Trend
    });

    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [time, setTime] = useState(new Date());

    // 2. Real-Time Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 3. REFRESH LOGIC
    const refreshDashboard = useCallback(async () => {
        try {
            const token = localStorage.getItem('dost_token');
            const res = await fetch(`http://localhost:5000/api/dashboard/stats?t=${new Date().getTime()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setStats({
                    records: data.records || 0,
                    disposal_queue: data.disposal_queue || [],
                    recent_activity: data.recent_activity || [],
                    monthly_stats: data.monthly_stats || []
                });
            }
        } catch (e) {
            console.error("Staff Dashboard Sync Error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refreshDashboard(); }, [refreshDashboard]);

    const handleUploadSuccess = () => {
        setIsUploadModalOpen(false);
        refreshDashboard(); // Trigger reload
    };

    const getGreeting = () => {
        const h = new Date().getHours();
        return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-400 animate-pulse">Syncing Workspace...</p>
            </div>
        </div>
    );

    return (
        <div className="p-8 min-h-screen bg-slate-50/50 animate-fade-in flex flex-col gap-6 font-sans">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Workspace</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                        {getGreeting()}, <span className="text-indigo-600">{user?.username || 'Staff'}</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        {user?.region || 'Assigned Region'} • <span className="text-slate-700 font-bold">{stats.records} Contribution Score</span>
                    </p>

                    {/* Office Assignment Badge - NEW */}
                    {user?.office && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Assigned to: {user.office}
                            </span>

                            {/* Quick Access Buttons */}
                            <button
                                onClick={() => navigate('/registry')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                My Records
                            </button>

                            <button
                                onClick={() => navigate('/codex')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Classifications
                            </button>
                        </div>
                    )}
                </div>

                {/* TIME WIDGET */}
                <div className="text-right hidden md:block">
                    <p className="text-3xl font-black text-slate-800 tabular-nums">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

                {/* LEFT: Quick Upload (Hero) */}
                <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4 opacity-80">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm"><Icons.Upload /></div>
                                <span className="text-xs font-bold uppercase tracking-widest">Quick Upload</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Secure Record Entry</h2>
                            <p className="text-indigo-100 text-sm leading-relaxed max-w-xs">
                                Digitize physical documents immediately. Ensure all files are tagged with the correct shelf location.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="mt-8 bg-white text-indigo-700 w-full py-4 rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors shadow-lg active:scale-[0.98]"
                        >
                            + Upload New File
                        </button>
                    </div>
                    {/* Decor */}
                    <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>
                </div>

                {/* MIDDLE: My Productivity Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Icons.Trending /> My Productivity
                        </h3>
                        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Last 6 Months</span>
                    </div>
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.monthly_stats}>
                                <defs>
                                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* BOTTOM LEFT: Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[350px]">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Icons.Activity /> Regional Activity Feed
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Live</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                        {stats.recent_activity.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">No recent activity found.</div>
                        ) : (
                            stats.recent_activity.map((log, i) => (
                                <div key={log.log_id} className={`p-4 hover:bg-slate-50 transition-colors flex gap-4 ${i !== stats.recent_activity.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                    <div className="mt-1">
                                        <div className={`w-2 h-2 rounded-full ${log.action.includes('UPLOAD') ? 'bg-emerald-500' :
                                            log.action.includes('DELETE') ? 'bg-red-500' : 'bg-indigo-500'
                                            }`}></div>
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

                {/* BOTTOM RIGHT: Disposal Queue */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[350px]">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Icons.Clock /> Retention Watch
                        </h3>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                        {(!stats.disposal_queue || stats.disposal_queue.length === 0) ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="p-3 bg-emerald-50 rounded-full text-emerald-500 mb-2"><Icons.Check /></div>
                                <p className="text-sm font-bold text-slate-600">All Clear</p>
                                <p className="text-xs text-slate-400">No records pending disposal.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.disposal_queue.map(rec => {
                                    const diff = new Date(rec.disposal_date) - new Date();
                                    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                    const isExpired = days < 0;
                                    return (
                                        <div key={rec.record_id} className={`p-3 rounded-xl border flex items-center gap-3 ${isExpired ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
                                            <div className={`text-[10px] font-bold px-2 py-1 rounded ${isExpired ? 'bg-white text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {isExpired ? 'EXP' : `${days}d`}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-700 truncate">{rec.title}</p>
                                                <p className="text-[10px] text-slate-400">{new Date(rec.disposal_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <RecordModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
};

export default StaffDashboard;