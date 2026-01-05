import { useMemo, useState } from 'react';
import { useRegions } from '../../context/RegionContext';
import { useUsers } from '../../context/UserContext';
import * as api from '../../services/endpoints/api';

// --- ICONS ---
const Icons = {
  Folder: () => <svg className="w-16 h-16 text-indigo-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" /></svg>,
  FolderOpen: () => <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Ban: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Home: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
};

const UserList = () => {
  const { users, loading, refresh, getStats } = useUsers();
  const { regions } = useRegions();
  
  // --- STATE ---
  const [activeRoleFolder, setActiveRoleFolder] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'STAFF', region_id: '', office: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- DERIVED DATA ---
  const counts = {
    super: users.filter(u => u.role === 'SUPER_ADMIN').length,
    admin: users.filter(u => u.role === 'REGIONAL_ADMIN').length,
    staff: users.filter(u => u.role === 'STAFF').length
  };

  // --- SMART FILTERING (CRASH PROOF) ---
  const filteredUsers = useMemo(() => {
    if (!activeRoleFolder) return [];

    return users.filter(user => {
        const matchesRole = user.role === activeRoleFolder;
        const searchStr = searchTerm.toLowerCase();
        
        // SAFE CHECKS: (val || '') prevents crash if data is missing
        const matchesSearch = (user.username || '').toLowerCase().includes(searchStr) || 
                              (user.name || '').toLowerCase().includes(searchStr) || 
                              (user.dept || '').toLowerCase().includes(searchStr);
        
        return matchesRole && matchesSearch;
    });
  }, [users, activeRoleFolder, searchTerm]);

  // --- HANDLERS ---
  const openCreate = () => {
    setEditUser(null);
    setFormData({ 
        username: '', 
        password: '', 
        role: activeRoleFolder || 'STAFF', 
        region_id: '', 
        office: '' 
    });
    
    if (activeRoleFolder === 'SUPER_ADMIN') {
        const centralRegion = regions.find(r => r.id === 1 || r.name.includes('Central') || r.name.includes('National'));
        setFormData(prev => ({ ...prev, region_id: centralRegion ? centralRegion.id : 1 }));
    }
    setIsModalOpen(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    
    // --- FIX: INTELLIGENT DATA SANITIZATION ---
    // If region is "Global" (string) or empty, reset to '' for dropdown compatibility.
    // Otherwise, use the numeric ID.
    const safeRegionId = (user.region === 'Global' || !user.region) ? '' : user.region;

    setFormData({ 
        username: user.username, 
        password: '', 
        role: user.role, 
        region_id: safeRegionId, 
        office: user.dept || '' // Map 'dept' back to 'office'
    });
    
    setIsModalOpen(true);
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    if (newRole === 'SUPER_ADMIN') {
        const centralRegion = regions.find(r => r.id === 1 || r.name.includes('Central') || r.name.includes('National'));
        setFormData(prev => ({ ...prev, role: newRole, region_id: centralRegion ? centralRegion.id : 1 }));
    } else {
        setFormData(prev => ({ ...prev, role: newRole }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        // --- FIX: STRICT PARSING ---
        // Ensure we send a clean Number or Null to the backend
        const regionValue = parseInt(formData.region_id);
        const finalRegionId = isNaN(regionValue) ? null : regionValue;

        const payload = { 
            ...formData, 
            region_id: finalRegionId
        };

        if (editUser) {
            await api.updateUser(editUser.id, payload);
        } else {
            await api.createUser(payload);
        }
        setIsModalOpen(false);
        refresh(); 
    } catch (err) {
        // Safe error messaging
        const msg = err.response?.data?.message || err.message || "Operation Failed";
        alert(`Error: ${msg}`);
    } finally { 
        setIsSubmitting(false); 
    }
  };

  const toggleStatus = async (user) => {
    if (!window.confirm(`Confirm action for ${user.username}?`)) return;
    await api.updateUserStatus(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
    refresh();
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50/50 animate-fade-in flex flex-col gap-6">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                <span className="text-indigo-600">User Management</span>
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm font-medium">
                <button onClick={() => { setActiveRoleFolder(null); setSearchTerm(''); }} className={`flex items-center gap-1 hover:text-indigo-600 transition-colors ${!activeRoleFolder ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
                    <Icons.Home /> Directory
                </button>
                {activeRoleFolder && (
                    <>
                        <Icons.ChevronRight />
                        <span className="text-indigo-600 font-bold px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100 flex items-center gap-2">
                            <Icons.FolderOpen />
                            {activeRoleFolder.replace('_', ' ')}
                        </span>
                    </>
                )}
            </div>
        </div>
        <button onClick={openCreate} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 transition-all">
            <Icons.Plus /> {activeRoleFolder ? `New ${activeRoleFolder.replace('_', ' ')}` : 'Add New User'}
        </button>
      </div>

      {/* 2. DIRECTORY FOLDERS */}
      {!activeRoleFolder && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            
            <div onClick={() => setActiveRoleFolder('SUPER_ADMIN')} className="bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 p-8 rounded-2xl flex flex-col items-center cursor-pointer transition-all shadow-sm hover:shadow-xl group">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300 text-purple-400"><Icons.Folder /></div>
                <h3 className="font-bold text-slate-800 text-lg">Super Administrators</h3>
                <span className="text-xs font-bold text-purple-500 bg-purple-100 px-3 py-1 rounded-full mt-2">{counts.super} Users</span>
            </div>

            <div onClick={() => setActiveRoleFolder('REGIONAL_ADMIN')} className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 p-8 rounded-2xl flex flex-col items-center cursor-pointer transition-all shadow-sm hover:shadow-xl group">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300 text-blue-400"><Icons.Folder /></div>
                <h3 className="font-bold text-slate-800 text-lg">Regional Admins</h3>
                <span className="text-xs font-bold text-blue-500 bg-blue-100 px-3 py-1 rounded-full mt-2">{counts.admin} Users</span>
            </div>

            <div onClick={() => setActiveRoleFolder('STAFF')} className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 p-8 rounded-2xl flex flex-col items-center cursor-pointer transition-all shadow-sm hover:shadow-xl group">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300 text-emerald-400"><Icons.Folder /></div>
                <h3 className="font-bold text-slate-800 text-lg">Staff Members</h3>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-100 px-3 py-1 rounded-full mt-2">{counts.staff} Users</span>
            </div>
        </div>
      )}

      {/* 3. USER TABLE */}
      {activeRoleFolder && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col animate-fade-in">
            <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div>
                    <input 
                        type="text" 
                        placeholder={`Search ${activeRoleFolder.toLowerCase().replace('_', ' ')}s...`} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">User Identity</th>
                            <th className="px-6 py-4">Office / Assignment</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? <tr><td colSpan="4" className="p-10 text-center text-slate-400">Loading...</td></tr> : 
                         filteredUsers.length === 0 ? <tr><td colSpan="4" className="p-10 text-center text-slate-400">Folder is empty.</td></tr> :
                         filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                                            {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700">{user.name}</p>
                                            <p className="text-xs text-slate-400">{user.email || 'No Email'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="block font-bold text-xs text-slate-800 uppercase">{user.dept || 'No Office'}</span>
                                    <span className="text-xs text-slate-500">{regions.find(r => r.id == user.region)?.name || 'Global'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => openEdit(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Icons.Edit /></button>
                                        <button onClick={() => toggleStatus(user)} className={`p-2 rounded-lg ${user.status === 'ACTIVE' ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                                            {user.status === 'ACTIVE' ? <Icons.Ban /> : <Icons.Check />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-zoom-in">
                <h2 className="text-xl font-bold text-slate-800 mb-6">{editUser ? 'Edit User' : `Create ${formData.role.replace('_', ' ')}`}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                        <input className="w-full border p-3 rounded-xl mt-1 font-bold outline-none focus:border-indigo-500" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Password {editUser && '(Leave blank to keep)'}</label>
                        <input className="w-full border p-3 rounded-xl mt-1 outline-none focus:border-indigo-500" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editUser} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                            <select className="w-full border p-3 rounded-xl mt-1 bg-white outline-none focus:border-indigo-500" value={formData.role} onChange={handleRoleChange}>
                                <option value="STAFF">Staff</option>
                                <option value="REGIONAL_ADMIN">Regional Admin</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Region</label>
                            <select className={`w-full border p-3 rounded-xl mt-1 outline-none ${formData.role === 'SUPER_ADMIN' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white focus:border-indigo-500'}`} value={formData.region_id} onChange={e => setFormData({...formData, region_id: e.target.value})} required disabled={formData.role === 'SUPER_ADMIN'}>
                                <option value="">Select...</option>
                                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Office / Unit</label>
                        <input className="w-full border p-3 rounded-xl mt-1 outline-none focus:border-indigo-500" value={formData.office} onChange={e => setFormData({...formData, office: e.target.value})} placeholder="e.g. Finance" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-slate-600 hover:bg-slate-200">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-70">{isSubmitting ? 'Saving...' : 'Save User'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserList;