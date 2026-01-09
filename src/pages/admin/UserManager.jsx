import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
  UserPlus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3.75 13.5l2.25-1.125L9 10.875l3 1.5 2.25 1.125m-14.25 0V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-5.625" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Badge: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
};

const UserManager = () => {
  const { user } = useAuth(); // Contains { id, role, region_id }
  const [users, setUsers] = useState([]);
  const [regions, setRegions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  // FORM STATE
  const [formData, setFormData] = useState({ 
    id: null, 
    name: '',       
    username: '',   
    password: '', 
    role: 'STAFF', 
    office: '', 
    region_id: '',
    status: 'Active' 
  });
  const [isEditing, setIsEditing] = useState(false);

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    try {
        const token = localStorage.getItem('dost_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Users
        const userRes = await fetch('http://localhost:5000/api/users', { headers });
        if (userRes.ok) setUsers(await userRes.json());

        // Fetch Regions (Only if Super Admin)
        if (user && user.role === 'SUPER_ADMIN') {
             const regRes = await fetch('http://localhost:5000/api/regions', { headers });
             if (regRes.ok) setRegions(await regRes.json());
        }

    } catch (err) {
        console.error("Data Load Error", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  // --- 2. HANDLERS ---
  const openModal = (targetUser = null) => {
    if (targetUser) {
        setFormData({ ...targetUser, password: '' }); 
        setIsEditing(true);
    } else {
        setFormData({ 
            id: null, 
            name: '', 
            username: '', 
            password: '', 
            role: 'STAFF', 
            office: '', 
            region_id: user?.role === 'SUPER_ADMIN' ? '' : user?.region_id, 
            status: 'Active' 
        });
        setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('dost_token');
    const url = isEditing ? `http://localhost:5000/api/users/${formData.user_id}` : 'http://localhost:5000/api/users';
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (res.ok) {
            setIsModalOpen(false);
            fetchData(); 
        } else {
            alert(data.message || "Operation failed.");
        }
    } catch (err) {
        console.error(err);
        alert("Server connection error.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This will remove access for this user.")) return;
    const token = localStorage.getItem('dost_token');
    try {
        await fetch(`http://localhost:5000/api/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchData();
    } catch (err) {
        alert("Delete failed");
    }
  };

  // --- 3. FILTERING ---
  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 min-h-screen flex flex-col gap-6 animate-fade-in bg-slate-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200"><Icons.Badge /></span> 
             Workforce Management
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Manage system access, roles, and personnel assignments.
          </p>
        </div>

        <div className="flex gap-3">
             <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500"><Icons.Search /></div>
                <input 
                    type="text" 
                    placeholder="Search directory..." 
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none w-64 shadow-sm transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 text-sm font-bold active:scale-95">
                <Icons.UserPlus /> Onboard User
             </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 font-bold tracking-widest border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">Employee Profile</th>
                        <th className="px-6 py-4">Role & Access</th>
                        <th className="px-6 py-4">Office / Unit</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map(u => (
                        <tr key={u.user_id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${u.role.includes('ADMIN') ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`}>
                                        {(u.name || u.username).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">{u.name || 'No Name Set'}</p>
                                        <p className="text-xs text-slate-400 font-mono">@{u.username}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${u.role.includes('ADMIN') ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    {u.role.replace('_', ' ')}
                                </span>
                                {u.region_name && <p className="text-[10px] text-slate-400 mt-1">{u.region_name}</p>}
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-xs font-medium text-slate-600">{u.office || 'Unassigned'}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`flex items-center gap-1.5 text-xs font-bold ${u.status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                    {u.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(u)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Icons.Edit /></button>
                                <button onClick={() => handleDelete(u.user_id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Icons.Trash /></button>
                            </td>
                        </tr>
                    ))}
                    {filteredUsers.length === 0 && !loading && (
                        <tr><td colSpan="5" className="text-center py-12 text-slate-400 text-sm italic">No records found matching your query.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in">
                
                {/* Modal Header */}
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{isEditing ? 'Update Personnel' : 'Onboard New User'}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Fill in the details below to grant system access.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    
                    {/* 1. Identity Section (Full Name vs Username) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name <span className="text-red-500">*</span></label>
                            <input 
                                required 
                                placeholder="e.g. Engr. Juan Dela Cruz"
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username <span className="text-red-500">*</span></label>
                            <input 
                                required 
                                disabled={isEditing} 
                                placeholder="e.g. jdelacruz"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60" 
                                value={formData.username} 
                                onChange={e => setFormData({...formData, username: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password {isEditing && '(Optional)'}</label>
                            <input 
                                type="password" 
                                required={!isEditing} 
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                            />
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* 2. Assignment Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                            <select 
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20" 
                                value={formData.role} 
                                onChange={e => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="STAFF">Staff Member</option>
                                <option value="ADMIN">Regional Admin</option>
                                {user?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Office / Unit</label>
                            <input 
                                required 
                                placeholder="e.g. Finance Div."
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                value={formData.office} 
                                onChange={e => setFormData({...formData, office: e.target.value})} 
                            />
                        </div>
                        
                        {/* Only show Region Selector if Super Admin */}
                        {user?.role === 'SUPER_ADMIN' && (
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assigned Region</label>
                                <select 
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20" 
                                    value={formData.region_id} 
                                    onChange={e => setFormData({...formData, region_id: e.target.value})}
                                >
                                    <option value="">Select Region...</option>
                                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className={`flex-1 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isSaving ? 'Saving...' : 'Confirm & Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;