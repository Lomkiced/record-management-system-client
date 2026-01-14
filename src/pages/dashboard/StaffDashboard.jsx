import { useEffect, useState } from 'react';
import RecordModal from '../../components/registry/RecordModal';
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Clock: () => <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Alert: () => <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
};

const StaffDashboard = () => {
  const { user } = useAuth();
  // 1. Initialize with Safe Defaults (Prevents "undefined" crash)
  const [stats, setStats] = useState({ records: 0, disposal_queue: [] });
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('dost_token');
            const res = await fetch('http://localhost:5000/api/dashboard/stats', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                // 2. Merge with defaults to ensure safety
                setStats({ 
                    records: data.records || 0,
                    disposal_queue: data.disposal_queue || [] 
                });
            }
        } catch (e) { 
            console.error("Staff Dashboard Error:", e); 
        } finally { 
            setLoading(false); 
        }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
  };

  const getDaysLeft = (date) => {
      const diff = new Date(date) - new Date();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div className="p-8 text-slate-400 font-bold animate-pulse">Loading Your Workspace...</div>;

  return (
    <div className="p-8 min-h-screen bg-slate-50/50 animate-fade-in flex flex-col gap-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{getGreeting()}, <span className="text-indigo-600">{user?.username}</span>!</h1>
            <p className="text-slate-500 mt-1 font-medium">Region: <span className="font-bold text-slate-700">{user?.region || 'Assigned Region'}</span></p>
        </div>
        <button onClick={() => setIsUploadModalOpen(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2">
            <Icons.Plus /> New Upload
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* STATS COLUMN */}
        <div className="space-y-6">
            {/* MY UPLOADS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">My Total Uploads</h3>
                    <p className="text-4xl font-black text-slate-800">{stats.records}</p>
                </div>
                <div className="absolute right-4 top-4 p-3 bg-slate-50 rounded-xl"><Icons.Check /></div>
            </div>
            
            {/* MY DISPOSAL ALERT */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Files Expiring Soon</h3>
                    <Icons.Clock />
                </div>
                
                <div className="space-y-3">
                    {!stats.disposal_queue || stats.disposal_queue.length === 0 ? (
                        <div className="p-4 bg-slate-50 rounded-xl text-center">
                            <p className="text-sm font-medium text-slate-500">No files pending disposal.</p>
                            <p className="text-xs text-slate-400 mt-1">Your records are secure.</p>
                        </div>
                    ) : (
                        stats.disposal_queue.map(rec => {
                            const days = getDaysLeft(rec.disposal_date);
                            return (
                                <div key={rec.record_id} className={`flex items-center gap-3 p-3 rounded-xl border ${days < 0 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                                    <div className={`p-2 rounded-full bg-white ${days < 0 ? 'text-red-500' : 'text-amber-500'}`}>
                                        {days < 0 ? <Icons.Alert /> : <Icons.Clock />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-700 truncate">{rec.title}</p>
                                        <p className={`text-[10px] font-bold ${days < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                                            {days < 0 ? 'EXPIRED' : `${days} Days Left`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>

        {/* ACTION / INFO AREA */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-center items-start">
            <div className="relative z-10 max-w-lg">
                <h2 className="text-3xl font-bold mb-4">Registry Standards</h2>
                <p className="text-indigo-100 mb-8 leading-relaxed">
                    As a staff member, your uploads contribute to the regional archive. 
                    Please ensure all documents are correctly classified according to the 
                    <span className="font-bold text-white"> General Records Disposition Schedule (GRDS)</span>.
                </p>
                <div className="flex gap-4">
                    <button onClick={() => setIsUploadModalOpen(true)} className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors">
                        Upload Document
                    </button>
                </div>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        </div>
      </div>

      <RecordModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onSuccess={() => { setIsUploadModalOpen(false); /* Add refresh logic here if needed */ }} />
    </div>
  );
};

export default StaffDashboard;