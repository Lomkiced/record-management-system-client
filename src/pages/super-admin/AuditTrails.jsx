import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
  Shield: () => <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Terminal: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Filter: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
};

const AuditTrails = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // FILTERS
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('dost_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Construct URL with region filter
        let url = 'http://localhost:5000/api/audit/filter';
        if (regionFilter !== 'ALL') {
            url += `?region_filter=${regionFilter}`;
        }

        const [logRes, regRes] = await Promise.all([
            fetch(url, { headers }),
            fetch('http://localhost:5000/api/regions', { headers })
        ]);

        if (logRes.ok) setLogs(await logRes.json());
        if (regRes.ok) setRegions(await regRes.json());

    } catch (err) {
        console.error("Audit Load Error", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [regionFilter]); // Re-fetch when dropdown changes

  // --- SMART FILTER (Client Side for Text) ---
  const filteredLogs = logs.filter(log => 
    log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionStyle = (action) => {
      if (action.includes('LOGIN')) return 'bg-blue-50 text-blue-700 border-blue-200';
      if (action.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-200';
      if (action.includes('UPLOAD')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (action.includes('INIT') || action.includes('ADD')) return 'bg-purple-50 text-purple-700 border-purple-200';
      return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="p-8 h-[calc(100vh-2rem)] flex flex-col gap-6 animate-fade-in bg-slate-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <span className="bg-white p-2 rounded-xl shadow-sm border border-slate-100"><Icons.Shield /></span>
             Security Audit Trails
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Real-time monitoring of system integrity and user actions.
          </p>
        </div>
        
        <div className="flex gap-3">
             
             {/* REGION FILTER (Super Admin Only) */}
             {user?.role === 'SUPER_ADMIN' && (
                 <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Icons.Filter /></div>
                    <select 
                        className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm appearance-none cursor-pointer hover:bg-slate-50 transition-all"
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                    >
                        <option value="ALL">All Regions</option>
                        {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                 </div>
             )}

             <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500"><Icons.Search /></div>
                <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none w-64 shadow-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             
             <button onClick={fetchData} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 p-2.5 rounded-xl shadow-sm transition-all active:scale-95">
                <Icons.Refresh />
             </button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 font-bold tracking-widest sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Event Type</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Region</th> {/* NEW COLUMN */}
                  <th className="px-6 py-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                            <td colSpan="6" className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                        </tr>
                    ))
                ) : filteredLogs.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="p-20 text-center text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                                <Icons.Terminal />
                                <span className="font-medium">No logs found matching criteria.</span>
                            </div>
                        </td>
                    </tr>
                ) : (
                    filteredLogs.map((log) => (
                        <tr key={log.log_id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-bold text-slate-700 block">{log.username}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${getActionStyle(log.action)}`}>
                                    {log.action}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 max-w-sm truncate" title={log.details}>
                                {log.details}
                            </td>
                            <td className="px-6 py-4">
                                {log.region_name ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                                        {log.region_name}
                                    </span>
                                ) : (
                                    <span className="text-slate-300 text-xs">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">
                                {log.ip_address}
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center font-medium uppercase tracking-wide">
             System Integrity Monitor • Authorized Personnel Only
          </div>
      </div>
    </div>
  );
};

export default AuditTrails;