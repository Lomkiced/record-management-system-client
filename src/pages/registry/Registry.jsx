import { useState } from 'react';
import RecordModal from '../../components/registry/RecordModal';
import { useAuth } from '../../context/AuthContext';
import { useCodex } from '../../context/CodexContext';
import { useRegions } from '../../context/RegionContext';
import { useRegistry } from '../../context/RegistryContext';

// --- ICONS ---
const Icons = {
  RegionFolder: () => <svg className="w-24 h-24 text-blue-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" /></svg>,
  CodexFolder: () => <svg className="w-20 h-20 text-amber-400 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" /></svg>,
  Home: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Archive: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  File: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Eye: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Pencil: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Refresh: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
};

const Registry = () => {
  const { user } = useAuth();
  const { records, pagination, fetchRecords, destroyRecord, archiveRecord, restoreRecord, loading } = useRegistry();
  const { categories } = useCodex();
  const { regions } = useRegions();
  
  // STATE
  const [activeRegion, setActiveRegion] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [viewMode, setViewMode] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);

  // --- 🔒 SMART SECURITY FILTER ---
  const visibleRegions = regions.filter(region => {
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    // Loose equality (==) allows string/number match (e.g. "4" == 4)
    const isAssigned = region.id == user?.region;
    const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase());
    return (isSuperAdmin || isAssigned) && matchesSearch;
  });

  // --- DATA REFRESHER ---
  const handleOperationSuccess = () => {
    setIsModalOpen(false);
    setRecordToEdit(null);
    if (activeRegion && activeCategory) {
        fetchRecords({ 
            region: activeRegion.id, 
            category: activeCategory.name, 
            page: 1, 
            status: viewMode 
        });
    }
  };

  // 1. CLICK REGION
  const enterRegion = (region) => {
    setActiveRegion(region);
    setActiveCategory(null);
    setSearchTerm('');
  };

  // 2. CLICK CATEGORY
  const enterCategory = (category) => {
    if (!activeRegion) return; 
    setActiveCategory(category);
    setViewMode('Active');
    
    // Safety check: Ensure we are sending the ID
    console.log("Entering Category:", category.name, "Region ID:", activeRegion.id);

    fetchRecords({ 
        region: activeRegion.id, 
        category: category.name, 
        page: 1, 
        status: 'Active' 
    });
  };

  // 3. NAVIGATION
  const goToRoot = () => { setActiveRegion(null); setActiveCategory(null); setSearchTerm(''); };
  const goToRegion = () => { setActiveCategory(null); setSearchTerm(''); };

  // 4. HELPERS
  const getVisibleCategories = () => {
    if (!activeRegion) return [];
    return categories.filter(cat => cat.region === 'Global' || cat.region === activeRegion.name);
  };

  const toggleViewMode = (mode) => {
    if (!activeRegion || !activeCategory) return;
    setViewMode(mode);
    fetchRecords({ 
        region: activeRegion.id, 
        category: activeCategory.name, 
        page: 1, 
        status: mode 
    });
  };

  const handleEdit = (rec) => { setRecordToEdit(rec); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setRecordToEdit(null); };
  const handleViewFile = (filename) => window.open(`http://localhost:5000/uploads/${filename}`, '_blank');

  const getRetentionBadge = (disposalDate) => {
      if (!disposalDate) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-600 border border-indigo-200">PERMANENT</span>;
      const days = Math.ceil((new Date(disposalDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (days < 0) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">EXPIRED</span>;
      if (days < 60) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-600 border border-amber-200">EXPIRING</span>;
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">{(days / 365).toFixed(1)} Years</span>;
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50/50 animate-fade-in flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
             <span className="text-indigo-600">Registry</span>
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm font-medium">
             <button onClick={goToRoot} className={`flex items-center gap-1 hover:text-indigo-600 transition-colors ${!activeRegion ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
               <Icons.Home /> National
             </button>
             {activeRegion && (
               <>
                 <Icons.ChevronRight />
                 <button onClick={goToRegion} className={`flex items-center gap-1 hover:text-indigo-600 transition-colors ${!activeCategory ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
                   {activeRegion.name}
                 </button>
               </>
             )}
             {activeCategory && (
               <>
                 <Icons.ChevronRight />
                 <span className="text-indigo-600 font-bold px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100">
                   {activeCategory.name}
                 </span>
               </>
             )}
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 font-bold text-sm flex items-center gap-2 active:scale-95 transition-all">
          <Icons.Plus /> Upload Record
        </button>
      </div>

      {/* --- LEVEL 0: ROOT --- */}
      {!activeRegion && (
        <div className="animate-fade-in-up">
            <div className="mb-6 relative max-w-md">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div>
                <input type="text" placeholder="Search regional office..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select Regional Office</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {visibleRegions.map((region) => (
                    <div key={region.id} onClick={() => enterRegion(region)} className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-xl group">
                        <div className="transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110 mb-4"><Icons.RegionFolder /></div>
                        <h3 className="font-bold text-slate-700 text-lg">{region.name}</h3>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Regional Vault</span>
                    </div>
                ))}
                {visibleRegions.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl"><p className="text-slate-400 font-bold">No authorized regional folders found.</p></div>
                )}
            </div>
        </div>
      )}

      {/* --- LEVEL 1: FOLDERS --- */}
      {activeRegion && !activeCategory && (
        <div className="animate-fade-in-up">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select Classification Series</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {getVisibleCategories().map((cat) => (
                    <div key={cat.category_id} onClick={() => enterCategory(cat)} className="bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-200 p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-xl group">
                        <div className="transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110 mb-4"><Icons.CodexFolder /></div>
                        <h3 className="font-bold text-slate-700 text-lg">{cat.name}</h3>
                        <div className="flex gap-2 mt-2"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 rounded-full text-slate-500">{cat.region}</span></div>
                    </div>
                ))}
                {getVisibleCategories().length === 0 && <div className="col-span-full py-20 text-center text-slate-400 italic">No folders available.</div>}
            </div>
        </div>
      )}

      {/* --- LEVEL 2: FILES --- */}
      {activeRegion && activeCategory && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col animate-fade-in">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
             <div className="relative w-full max-w-md">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div>
               <input type="text" placeholder="Search within this folder..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             <div className="flex bg-slate-200 p-1 rounded-lg">
                <button onClick={() => toggleViewMode('Active')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'Active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Active Files</button>
                <button onClick={() => toggleViewMode('Archived')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'Archived' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Icons.Archive /> Vault</button>
             </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold tracking-wider sticky top-0 z-10">
                <tr><th className="px-6 py-4">Document</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? ([...Array(3)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan="3" className="px-6 py-4"><div className="h-10 bg-slate-100 rounded"></div></td></tr>)) 
                : records.length === 0 ? (<tr><td colSpan="3" className="p-20 text-center text-slate-400">Folder is empty.</td></tr>) 
                : (records.map((r) => (
                    <tr key={r.record_id} className={`transition-colors group ${viewMode === 'Archived' ? 'bg-slate-50/50 grayscale' : 'hover:bg-indigo-50/30'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${viewMode === 'Archived' ? 'bg-slate-200 text-slate-500' : 'bg-indigo-50 text-indigo-600'}`}><Icons.File /></div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{r.title}</p>
                            <div className="flex gap-2 mt-1"><span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase">{r.type_name}</span>{getRetentionBadge(r.disposal_date)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-500">{viewMode === 'Active' ? 'Active' : 'Archived'}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                          {viewMode === 'Active' ? (
                            <>
                                <button onClick={() => handleViewFile(r.file_path)} className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50"><Icons.Eye /></button>
                                <button onClick={() => handleEdit(r)} className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"><Icons.Pencil /></button>
                                <button onClick={() => archiveRecord(r.record_id)} className="text-slate-400 hover:text-amber-600 p-2 rounded-lg hover:bg-amber-50"><Icons.Archive /></button>
                            </>
                          ) : (
                            <>
                                <button onClick={() => restoreRecord(r.record_id)} className="text-slate-400 hover:text-emerald-600 p-2 rounded-lg hover:bg-emerald-50"><Icons.Refresh /></button>
                                <button onClick={() => destroyRecord(r.record_id)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50"><Icons.Trash /></button>
                            </>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="text-xs text-slate-500">Page {pagination.current} of {pagination.pages}</div>
            <div className="flex gap-2">
              <button disabled={pagination.current === 1} onClick={() => fetchRecords({ page: pagination.current - 1, region: activeRegion?.id, category: activeCategory?.name, status: viewMode })} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 disabled:opacity-50">Prev</button>
              <button disabled={pagination.current === pagination.pages} onClick={() => fetchRecords({ page: pagination.current + 1, region: activeRegion?.id, category: activeCategory?.name, status: viewMode })} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}

      <RecordModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleOperationSuccess} 
        preSelectedCategory={activeCategory} 
        preSelectedRegion={activeRegion}
        recordToEdit={recordToEdit}
      />
    </div>
  );
};

export default Registry;