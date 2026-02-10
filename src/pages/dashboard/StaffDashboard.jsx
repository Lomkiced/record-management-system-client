import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import RecordModal from '../../components/registry/RecordModal';
import RetentionMonitor from '../../components/dashboard/RetentionMonitor';
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
    Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Upload: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    File: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Storage: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
    Trend: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    Activity: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Star: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    Office: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    Folder: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
    Codex: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    Refresh: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Archive: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
};

// --- UTILITY FUNCTIONS ---
const formatBytes = (bytes) => {
    if (!+bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Custom gradient colors for the bar chart
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'];

const StaffDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Initialize State
    const [stats, setStats] = useState({
        records: 0,
        storage: 0,
        disposal_queue: [],
        recent_activity: [],
        monthly_stats: [],
        classification_stats: []
    });

    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [chartMode, setChartMode] = useState('trends'); // 'trends' or 'classification'

    // REFRESH LOGIC
    const refreshDashboard = useCallback(async () => {
        try {
            const token = localStorage.getItem('dost_token');
            const res = await fetch(`/api/dashboard/stats?t=${new Date().getTime()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setStats({
                    records: data.records || 0,
                    storage: data.storage || 0,
                    disposal_queue: data.disposal_queue || [],
                    recent_activity: data.recent_activity || [],
                    monthly_stats: data.monthly_stats || [],
                    classification_stats: data.classification_stats || data.office_stats || []
                });
            }
        } catch (e) {
            console.error("Dashboard Sync Error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refreshDashboard(); }, [refreshDashboard]);

    const handleUploadSuccess = () => {
        setIsUploadModalOpen(false);
        refreshDashboard();
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
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm font-medium text-slate-500">
                        Staff Workspace • {user?.region || 'Assigned Region'}
                    </p>

                    {/* Office Assignment Badge */}
                    {user?.office && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl shadow-sm">
                                <Icons.Office />
                                {user.office}
                            </span>

                            {/* Quick Access Buttons */}
                            <button
                                onClick={() => navigate('/registry')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                            >
                                <Icons.Folder />
                                My Records
                            </button>

                            <button
                                onClick={() => navigate('/codex')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                            >
                                <Icons.Codex />
                                Classifications
                            </button>

                            <button
                                onClick={() => navigate('/archive')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                            >
                                <Icons.Archive />
                                Archive
                            </button>
                        </div>
                    )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
                    >
                        <Icons.Upload />
                        Upload Record
                    </button>
                    <button
                        onClick={refreshDashboard}
                        className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <Icons.Refresh />
                    </button>
                </div>
            </div>

            {/* ACTIVE RECORDS STAT */}
            <div className="w-full max-w-sm">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 group hover:border-emerald-200 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Icons.File />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Active Records</p>
                        <p className="text-3xl font-black text-slate-800">{stats.records}</p>
                    </div>
                </div>
            </div>



            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

                {/* LEFT COLUMN: ANALYTICS (2/3) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* CHART CARD */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Icons.Trend /> Analytics Overview
                            </h2>
                            <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                                <button
                                    onClick={() => setChartMode('trends')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'trends' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Upload Trends
                                </button>
                                <button
                                    onClick={() => setChartMode('classification')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'classification' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    By Classification
                                </button>
                            </div>
                        </div>

                        <div className="h-[300px] w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={200}>
                                {chartMode === 'trends' ? (
                                    <AreaChart data={stats.monthly_stats}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                ) : (
                                    <BarChart data={stats.classification_stats}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: '#F1F5F9', radius: 8 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                            {stats.classification_stats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* DISPOSAL MONITOR */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">Retention & Disposal</h3>
                            <span className="text-xs font-bold text-slate-400 uppercase">Upcoming Expiries</span>
                        </div>
                        <div className="p-4">
                            <RetentionMonitor disposalQueue={stats.disposal_queue} />
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: FEED (1/3) */}
                <div className="flex flex-col gap-6">

                    {/* RECENT ACTIVITY */}
                    <div className="bg-white p-0 rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-fit">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Icons.Activity /> Recent Activity
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Live</span>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {stats.recent_activity.map((log, i) => (
                                <div key={log.log_id || i} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.action?.includes('CREATE') || log.action?.includes('UPLOAD') ? 'bg-emerald-50 text-emerald-600' :
                                            log.action?.includes('DELETE') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                            }`}>{log.action}</span>
                                        <span className="text-[10px] text-slate-400 font-mono tracking-tighter">
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium line-clamp-2">{log.details || `${log.username || 'User'} performed ${log.action}`}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        • {new Date(log.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                            ))}
                            {stats.recent_activity.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-xs italic">No recent activity</div>
                            )}
                        </div>
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