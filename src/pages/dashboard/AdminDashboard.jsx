import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
  Users: () => <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  File: () => <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Alert: () => <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, records: 0, storage: 0, disposal_queue: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('dost_token');
            const res = await fetch('http://localhost:5000/api/dashboard/stats', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setStats({ ...data, disposal_queue: data.disposal_queue || [] });
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const getDisposalStatus = (date) => {
      const diff = new Date(date) - new Date();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days < 0) return { label: 'Action Required', color: 'text-red-600 bg-red-50 border-red-100' };
      return { label: `${days} Days Remaining`, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
  };

  if (loading) return <div className="p-8 text-slate-400 font-bold animate-pulse">Syncing Regional Data...</div>;

  return (
    <div className="p-8 min-h-screen bg-slate-50/50 animate-fade-in flex flex-col gap-8">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 opacity-80">
             <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
             <span className="text-xs font-bold uppercase tracking-widest">Regional Command</span>
          </div>
          <h1 className="text-3xl font-bold">{user.region} Dashboard</h1>
          <p className="text-blue-100 mt-2 text-sm max-w-lg">Operational overview and document lifecycle management for your jurisdiction.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4 text-9xl">📍</div>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* USERS CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-indigo-200 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Regional Staff</h3>
                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors"><Icons.Users /></div>
            </div>
            <p className="text-4xl font-black text-slate-800">{stats.users}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Active Staff Members</p>
          </div>
          <button onClick={() => navigate('/users')} className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
             Manage Staff →
          </button>
        </div>

        {/* RECORDS CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-emerald-200 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Records</h3>
                <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
            </div>
            <p className="text-4xl font-black text-slate-800">{stats.records}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Encrypted & Stored</p>
          </div>
          <button onClick={() => navigate('/registry')} className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
             Go to Registry →
          </button>
        </div>

        {/* ALERT CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-amber-200 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Disposal Alert</h3>
                <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors"><Icons.Alert /></div>
            </div>
            <p className="text-4xl font-black text-slate-800">{stats.disposal_queue.length}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Files Pending Action</p>
          </div>
        </div>
      </div>

      {/* DISPOSAL SCHEDULE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Regional Disposal Schedule</h3>
            <p className="text-xs text-slate-400 mt-1">Files approaching mandatory disposal date based on retention policy.</p>
        </div>
        <div className="p-0">
            {stats.disposal_queue.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm">No files currently scheduled for disposal.</div>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                        <tr><th className="px-6 py-3">File Name</th><th className="px-6 py-3">Disposal Date</th><th className="px-6 py-3 text-right">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {stats.disposal_queue.map((rec) => {
                            const status = getDisposalStatus(rec.disposal_date);
                            return (
                                <tr key={rec.record_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">{rec.title}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono">{new Date(rec.disposal_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${status.color}`}>{status.label}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;