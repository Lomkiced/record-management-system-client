import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegions } from '../../context/RegionContext';

// --- TITANIUM ICONS ---
const Icons = {
  Map: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Server: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>,
  Building: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Signal: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
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
    if (confirm("WARNING: Disconnecting a Regional Unit is a critical action. Confirm?")) deleteRegion(id);
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-700 font-sans p-4 lg:p-6 flex flex-col gap-6 animate-fade-in">

      {/* 1. EXECUTIVE HEADER */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg"><Icons.Building /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Network Administration</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Regional Units</h1>
        </div>

        {/* Stats Pills */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-2xl font-bold text-slate-800 leading-none">{stats.total}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Units</span>
          </div>
          <div className="flex flex-col items-center px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-2xl font-bold text-emerald-700 leading-none">{stats.active}</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Online</span>
          </div>
          <div className="flex flex-col items-center px-4 py-2 bg-rose-50 rounded-xl border border-rose-100">
            <span className="text-2xl font-bold text-rose-700 leading-none">{stats.inactive}</span>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Offline</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600"><Icons.Search /></div>
            <input
              type="text"
              placeholder="Search units..."
              className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none w-full md:w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 text-sm font-bold whitespace-nowrap active:scale-95">
            <Icons.Plus /> Add Unit
          </button>
        </div>
      </div>

      {/* 2. UNIT GRID */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-2 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRegions.map((region) => {
            return (
              <div key={region.id} className="group bg-white rounded-2xl p-0 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col relative overflow-hidden">

                {/* Active Indicator Strip */}
                <div className={`h-1.5 w-full ${region.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${region.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {region.code}
                        </span>
                        <span className={`flex h-2 w-2 rounded-full ${region.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors cursor-pointer" onClick={() => {
                        // Custom Flow Logic
                        const rId = Number(region.id);
                        if ([1, 3].includes(rId)) {
                          // Ilocos Norte, La Union -> Direct to Classification
                          navigate('/codex', { state: { regionId: rId } });
                        } else {
                          // Pangasinan, Ilocos Sur, Ilocos Region -> Offices Drilldown
                          navigate('/offices', { state: { regionId: rId } });
                        }
                      }}>{region.name}</h3>
                      <p className="text-sm text-slate-400 font-medium mt-1 flex items-center gap-1"><Icons.Map /> {region.address}</p>
                    </div>

                    {/* Actions Dropdown Substitute */}
                    <div className="flex flex-col gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenModal(region); }} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-lg transition-all" title="Edit Configuration"><Icons.Edit /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(region.id); }} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-100 rounded-lg transition-all" title="Disconnect Unit"><Icons.Trash /></button>
                    </div>
                  </div>

                  {/* Real Statistics Dashboard */}
                  <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-50">
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-center cursor-pointer hover:bg-indigo-50 transition-colors" onClick={() => {
                      const rId = Number(region.id);
                      if ([1, 3].includes(rId)) {
                        navigate('/codex', { state: { regionId: rId } });
                      } else {
                        navigate('/offices', { state: { regionId: rId } });
                      }
                    }}>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Offices</span>
                      <div className="text-lg font-black text-indigo-600">{region.office_count || 0}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Records</span>
                      <div className="text-lg font-black text-cyan-600">{region.record_count || 0}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Users</span>
                      <div className="text-lg font-black text-emerald-600">{region.user_count || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 p-3 flex gap-3 border-t border-slate-100">
                  <button
                    onClick={() => toggleStatus(region.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border ${region.status === 'Active' ? 'bg-white border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 get-shadow' : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'}`}
                  >
                    {region.status === 'Active' ? <><Icons.X /> Deactivate</> : <><Icons.Check /> Activate Unit</>}
                  </button>
                  <button onClick={() => navigate('/registry')} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-indigo-100 transition-all">
                    Access Vault
                  </button>
                </div>

              </div>
            );
          })}

          {/* Empty State */}
          {filteredRegions.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4"><Icons.Map /></div>
              <h3 className="text-xl font-bold text-slate-600">No Regional Units Found</h3>
              <p className="text-slate-500">Adjust your search parameters or register a new unit.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL FORM (Glass Overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in border border-white/20">

            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><Icons.Building /></div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{editingId ? 'Configure Unit' : 'New Regional Unit'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Icons.X /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Region Code</label>
                  <input required placeholder="R-XX" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operational Status</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Active">Operational (Online)</option>
                    <option value="Inactive">Maintenance (Offline)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Designation Name</label>
                <input required placeholder="e.g. National Capital Region Office" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Headquarters Location</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Map /></div>
                  <input required placeholder="City, Province, Country" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-50 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all uppercase tracking-wide">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 text-white font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all uppercase tracking-wide flex justify-center items-center gap-2">
                  <Icons.Check /> Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionManager;