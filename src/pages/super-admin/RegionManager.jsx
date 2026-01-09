import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- Navigation
import { useRegions } from '../../context/RegionContext';

// --- PROFESSIONAL ICONS ---
const Icons = {
  Map: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Check: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Vault: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  Building: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
};

const RegionManager = () => {
  const { regions, addRegion, updateRegion, deleteRegion, toggleStatus } = useRegions();
  const navigate = useNavigate();

  // STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', address: '', status: 'Active' });
  const [searchTerm, setSearchTerm] = useState('');

  // --- COMPUTED METRICS ---
  const stats = useMemo(() => ({
    total: regions.length,
    active: regions.filter(r => r.status === 'Active').length,
    inactive: regions.filter(r => r.status !== 'Active').length
  }), [regions]);

  const filteredRegions = regions.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- HANDLERS ---
  const handleOpenModal = (region = null) => {
    if (region) { setEditingId(region.id); setFormData(region); } 
    else { setEditingId(null); setFormData({ code: '', name: '', address: '', status: 'Active' }); }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) updateRegion(editingId, formData);
    else addRegion(formData);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if(confirm("WARNING: Removing a region may orphan associated records. Continue?")) deleteRegion(id);
  };

  return (
    <div className="p-8 h-[calc(100vh-2rem)] flex flex-col gap-6 animate-fade-in bg-slate-50/50">
      
      {/* 1. HEADER & METRICS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <span className="text-indigo-600 bg-indigo-50 p-2 rounded-xl"><Icons.Map /></span> 
             Regional Governance
          </h1>
          <div className="flex gap-4 mt-4">
             <div className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                TOTAL: <span className="text-indigo-600 text-sm ml-1">{stats.total}</span>
             </div>
             <div className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                ONLINE: <span className="text-emerald-600 text-sm ml-1">{stats.active}</span>
             </div>
             <div className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                OFFLINE: <span className="text-rose-500 text-sm ml-1">{stats.inactive}</span>
             </div>
          </div>
        </div>

        <div className="flex gap-3">
             {/* Search Bar */}
             <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500"><Icons.Search /></div>
                <input 
                    type="text" 
                    placeholder="Search regions..." 
                    className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none w-64 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             
             <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm font-bold active:scale-95">
                <Icons.Plus /> Register Region
             </button>
        </div>
      </div>

      {/* 2. REGION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-10">
        {filteredRegions.map((region) => (
          <div key={region.id} className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col">
            
            {/* Status Line */}
            <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors ${region.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${region.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                 {region.code}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleOpenModal(region)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Icons.Edit /></button>
                 <button onClick={() => handleDelete(region.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Icons.Trash /></button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-slate-50 rounded text-slate-400"><Icons.Building /></div>
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1" title={region.name}>{region.name}</h3>
                </div>
                <p className="text-xs text-slate-500 ml-9 mb-6 line-clamp-2">{region.address}</p>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 gap-3">
               
               {/* Quick Access to Registry (Mocked navigation for now) */}
               <button 
                 onClick={() => navigate('/registry')} // In a real app, pass state: { regionId: region.id }
                 className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
               >
                  <Icons.Vault /> Open Vault
               </button>

               {/* Status Toggle */}
               <button 
                 onClick={() => toggleStatus(region.id)} 
                 className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${region.status === 'Active' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                 title={region.status === 'Active' ? "Deactivate" : "Activate"}
               >
                 {region.status === 'Active' ? <Icons.Check /> : <Icons.X />}
               </button>
            </div>

          </div>
        ))}

        {filteredRegions.length === 0 && (
             <div className="col-span-full py-20 text-center text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-200">
                No regions found matching "{searchTerm}"
             </div>
        )}
      </div>

      {/* 3. MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in">
            
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Regional Office' : 'Register New Office'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Region Code</label>
                    <input required placeholder="e.g. R01" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-slate-700" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">System Status</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="Active">Operational</option>
                        <option value="Inactive">Offline / Maintenance</option>
                    </select>
                </div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Region Name</label>
                  <input required placeholder="e.g. Ilocos Regional Office" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">HQ Address</label>
                  <input required placeholder="City, Province" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              
              <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-sm transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 text-white font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionManager;