import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Icons = {
  Shield: () => <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Filter: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
};

const AuditTrails = () => {
  const { user } = useAuth();

  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTERS
  const [filters, setFilters] = useState({
    search: '',
    region: 'ALL',
    action: 'ALL',
    startDate: '',
    endDate: ''
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('dost_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Ensure filters are not null
      const params = new URLSearchParams({
        page: page,
        limit: 20,
        search: filters.search || '',
        action_filter: filters.action || 'ALL',
        region_filter: filters.region || 'ALL',
        start_date: filters.startDate || '',
        end_date: filters.endDate || ''
      });

      const [logRes, regRes] = await Promise.all([
        fetch(`/api/audit/filter?${params}`, { headers }),
        fetch('/api/regions', { headers })
      ]);

      if (logRes.ok) {
        const result = await logRes.json();
        if (result.data) {
          setLogs(result.data);
          setMeta(result.meta);
        } else {
          setLogs([]); // Fallback
        }
      }

      if (regRes.ok) setRegions(await regRes.json());

    } catch (err) {
      console.error("Audit Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchData(1), 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) fetchData(newPage);
  };

  const getActionStyle = (action) => {
    if (!action) return 'bg-slate-100';
    const a = action.toUpperCase();
    if (a.includes('LOGIN')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (a.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-200';
    if (a.includes('UPLOAD')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (a.includes('INIT') || a.includes('ADD') || a.includes('UPDATE')) return 'bg-purple-50 text-purple-700 border-purple-200';
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
            System Integrity Monitor • <span className="text-indigo-600 font-bold">{meta?.total || 0} Events</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => fetchData(meta.page)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95">
            <Icons.Refresh />
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">

        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div>
          <input
            type="text"
            placeholder="Search actor, details, etc..."
            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none w-full"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <div className="text-slate-400"><Icons.Calendar /></div>
          <input type="date" className="bg-transparent text-sm font-bold text-slate-600 outline-none" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
          <span className="text-slate-300">to</span>
          <input type="date" className="bg-transparent text-sm font-bold text-slate-600 outline-none" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
        </div>

        <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })}>
          <option value="ALL">All Actions</option>
          <option value="LOGIN_SUCCESS">User Login</option>
          <option value="UPLOAD_RECORD">File Upload</option>
          <option value="DELETE_RECORD">File Deleted</option>
          <option value="UPDATE_RECORD">Update</option>
        </select>

        {/* Region Filter - Only for Super Admin & Admin */}
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
          <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer" value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })}>
            <option value="ALL">All Regions</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 font-bold tracking-widest sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4 text-right">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan="6" className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td></tr>
                ))
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="p-20 text-center text-slate-400">No events found matching your filters.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4"><span className="font-bold text-slate-700">{log.username}</span></td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${getActionStyle(log.action)}`}>{log.action}</span></td>
                    <td className="px-6 py-4 text-slate-600 max-w-sm truncate" title={log.details}>{log.details}</td>
                    <td className="px-6 py-4">{log.region_name ? <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-bold uppercase">{log.region_name}</span> : '-'}</td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">{log.ip_address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">Page {meta?.page || 1} of {meta?.totalPages || 1}</span>
          <div className="flex gap-2">
            <button disabled={(meta?.page || 1) === 1} onClick={() => handlePageChange((meta?.page || 1) - 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 disabled:opacity-50">Previous</button>
            <button disabled={(meta?.page || 1) === (meta?.totalPages || 1)} onClick={() => handlePageChange((meta?.page || 1) + 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrails;