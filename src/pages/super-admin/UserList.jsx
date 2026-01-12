import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// --- PROFESSIONAL ICONS ---
const Icons = {
  UserPlus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3.75 13.5l2.25-1.125L9 10.875l3 1.5 2.25 1.125m-14.25 0V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-5.625" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Badge: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  Filter: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
};

const UserList = () => {
  const { user } = useAuth(); // Contains { id, role, region_id }
  const [users, setUsers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // FILTER STATE
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL'); // ALL, SUPER_ADMIN, ADMIN, STAFF
  const [filterRegion, setFilterRegion] = useState('ALL'); // ALL, or ID

  // MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, name: '', username: '', password: '', role: 'STAFF', office: '', region_id: '', status: 'Active' 
  });

  // --- 1. FETCH DATA (CRASH PROOF) ---
  const fetchData = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('dost_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [uRes, rRes] = await Promise.all([
            fetch('http://localhost:5000/api/users', { headers }),
            fetch('http://localhost:5000/api/regions', { headers })
        ]);

        const usersData = await uRes.json();
        const regionsData = await rRes.json();

        // SAFETY: Only set state if response is actually an array
        if (Array.isArray(usersData)) {
            setUsers(usersData);
        } else {
            console.error("API Error: Users endpoint did not return an array", usersData);
            setUsers([]); // Fallback to empty to prevent white screen
        }

        if (Array.isArray(regionsData)) {
            setRegions(regionsData);
        } else {
            setRegions([]);
        }

    } catch (err) { 
        console.error("Data Load Critical Failure", err); 
        setUsers([]); 
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  // --- 2. ADVANCED FILTERING ---
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Calculate Counts Safely
  const counts = {
      super: users.filter(u => u.role === 'SUPER_ADMIN').length,
      admin: users.filter(u => u.role === 'ADMIN' || u.role === 'REGIONAL_ADMIN').length,
      staff: users.filter(u => u.role === 'STAFF').length,
      total: users.length
  };

  // Safe Filtering Logic (Prevents crash if 'name' or 'office' is null in DB)
  const filteredUsers = users.filter(u => {
      const uName = (u.name || '').toLowerCase();
      const uUser = (u.username || '').toLowerCase();
      const uOffice = (u.office || '').toLowerCase();
      const sTerm = search.toLowerCase();

      // 1. Text Search
      const matchesSearch = uName.includes(sTerm) || uUser.includes(sTerm) || uOffice.includes(sTerm);
      
      // 2. Role Filter
      let matchesRole = true;
      if (filterRole === 'SUPER_ADMIN') matchesRole = u.role === 'SUPER_ADMIN';
      if (filterRole === 'ADMIN') matchesRole = (u.role === 'ADMIN' || u.role === 'REGIONAL_ADMIN');
      if (filterRole === 'STAFF') matchesRole = u.role === 'STAFF';

      // 3. Region Filter (Super Admin only)
      let matchesRegion = true;
      if (isSuperAdmin && filterRegion !== 'ALL') {
          // Ensure both are numbers or both are strings for comparison
          matchesRegion = u.region_id == filterRegion;
      }

      return matchesSearch && matchesRole && matchesRegion;
  });

  // --- 3. HANDLERS ---
  const handleOpenModal = (targetUser = null) => {
    if (targetUser) {
        setFormData({ ...targetUser, password: '' }); 
        setIsEditing(true);
    } else {
        // SMART PRE-FILL
        let defaultRole = 'STAFF';
        if (filterRole === 'ADMIN') defaultRole = 'ADMIN';
        if (filterRole === 'SUPER_ADMIN') defaultRole = 'SUPER_ADMIN';

        let defaultRegion = isSuperAdmin ? '' : user.region_id;
        if (isSuperAdmin && filterRegion !== 'ALL') defaultRegion = filterRegion;

        setFormData({ 
            id: null, name: '', username: '', password: '', 
            role: defaultRole, office: '', region_id: defaultRegion, status: 'Active' 
        });
        setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSaving(true);
    const token = localStorage.getItem('dost_token');
    const url = isEditing ? `http://localhost:5000/api/users/${formData.user_id}` : 'http://localhost:5000/api/users';
    const method = isEditing ? 'PUT' : 'POST';
    try {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) });
        if (res.ok) { setIsModalOpen(false); fetchData(); } else { const d = await res.json(); alert(d.message); }
    } catch (err) { alert("Error"); } finally { setIsSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    const token = localStorage.getItem('dost_token');
    await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchData();
  };

  return (
    <div className="p-8 min-h-screen flex flex-col gap-6 animate-fade-in bg-slate-50/50">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200"><Icons.Badge /></span> 
             Workforce Management
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Manage personnel access, roles, and assignments across all regions.
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 text-sm font-bold active:scale-95">
            <Icons.UserPlus /> Add Personnel
        </button>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
         
         {/* Search */}
         <div className="relative flex-1 min-w-[200px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div>
            <input 
                type="text" 
                placeholder="Search by name, username, or office..." 
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none w-full transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         {/* DIVIDER */}
         <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

         {/* CLASSIFICATION DROPDOWN (Smart Filter) */}
         <div className="relative group">
            <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider group-focus-within:text-indigo-600">Classification</label>
            <select 
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[200px] cursor-pointer appearance-none"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
            >
                <option value="ALL">All Personnel ({counts.total})</option>
                <option value="SUPER_ADMIN">Central Command ({counts.super})</option>
                <option value="ADMIN">Regional Leadership ({counts.admin})</option>
                <option value="STAFF">Area Workforce ({counts.staff})</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Icons.Filter /></div>
         </div>

         {/* REGION DROPDOWN (Visible only to Super Admin) */}
         {isSuperAdmin && (
             <div className="relative group">
                <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider group-focus-within:text-indigo-600">Region Scope</label>
                <select 
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[200px] cursor-pointer appearance-none"
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                >
                    <option value="ALL">All Regions</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Icons.Filter /></div>
             </div>
         )}

         {/* Refresh Button */}
         <button onClick={fetchData} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Refresh Data">
            <Icons.Refresh />
         </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/80 text-[11px] uppercase text-slate-500 font-bold tracking-widest border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">Profile</th>
                        <th className="px-6 py-4">Classification</th>
                        <th className="px-6 py-4">Assignment</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <tr key={i} className="animate-pulse"><td colSpan="5" className="px-6 py-4"><div className="h-10 bg-slate-100 rounded-lg"></div></td></tr>
                        ))
                    ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-24 text-slate-400 font-medium italic">No personnel found matching your filters.</td></tr>
                    ) : (
                        filteredUsers.map(u => (
                            <tr key={u.user_id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm 
                                            ${u.role.includes('ADMIN') ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`}>
                                            {(u.name || u.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">{u.name || 'No Name'}</p>
                                            <p className="text-xs text-slate-400 font-mono">@{u.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border 
                                        ${u.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                          u.role.includes('ADMIN') ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                                          'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                        {u.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium text-slate-700">{u.office || 'Unassigned'}</p>
                                    <p className="text-[11px] text-slate-400 font-medium">{u.region_name || 'No Region'}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold 
                                        ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(u)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Icons.Edit /></button>
                                    <button onClick={() => handleDelete(u.user_id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Icons.Trash /></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* MODAL (Context Aware) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{isEditing ? 'Update Personnel' : 'Onboard New User'}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Fill in the details below to grant system access.</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                            <input required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Juan Dela Cruz" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                            <input required disabled={isEditing} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:text-slate-500" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="jdelacruz" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                            <input type="password" required={!isEditing} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                        </div>
                    </div>
                    <hr className="border-slate-100" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                            <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="STAFF">Staff Member</option>
                                <option value="ADMIN">Regional Admin</option>
                                {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Office / Unit</label>
                            <input required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" value={formData.office} onChange={e => setFormData({...formData, office: e.target.value})} placeholder="e.g. IT Unit" />
                        </div>
                        {isSuperAdmin && (
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assigned Region</label>
                                <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20" value={formData.region_id} onChange={e => setFormData({...formData, region_id: e.target.value})}>
                                    <option value="">Select Region...</option>
                                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving} className="flex-1 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70">{isSaving ? 'Saving...' : 'Confirm & Save'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserList;