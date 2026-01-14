import { useEffect, useState } from 'react';
import DocumentViewerModal from '../../components/registry/DocumentViewerModal';
import FilePasswordModal from '../../components/registry/FilePasswordModal';
import RecordModal from '../../components/registry/RecordModal';
import RecordTable from '../../components/registry/RecordTable';
import { useAuth } from '../../context/AuthContext';
import { useCodex } from '../../context/CodexContext';
import { useRegions } from '../../context/RegionContext';
import { useRegistry } from '../../context/RegistryContext';

// --- ICONS ---
const Icons = {
  Home: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  ChevronRight: () => <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  X: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Folder: () => <svg className="w-12 h-12 text-blue-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" /></svg>,
  Codex: () => <svg className="w-10 h-10 text-amber-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" /></svg>
};

// --- SKELETONS ---
const GridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white/50 border border-slate-200 p-8 rounded-2xl flex flex-col items-center gap-4 h-48 justify-center">
        <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-4 animate-pulse p-6">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0"></div>
        <div className="flex-1 space-y-2 py-1">
            <div className="h-3 bg-slate-100 rounded w-1/4"></div>
            <div className="h-2 bg-slate-100 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

const Registry = () => {
  const { user } = useAuth();
  const { records, pagination, fetchRecords, destroyRecord, archiveRecord, restoreRecord, loading } = useRegistry();
  const { categories } = useCodex();
  const { regions } = useRegions();
  
  const [activeRegion, setActiveRegion] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [viewMode, setViewMode] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedRestrictedRecord, setSelectedRestrictedRecord] = useState(null);
  
  // Viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerFile, setViewerFile] = useState(null);

  // --- 1. REACTIVE FETCH (THE FIX) ---
  // We removed 'fetchRecords' from the dependency array to stop the infinite loop.
  // We also removed explicit calls in handlers; updating state is enough.
  useEffect(() => {
    // Only fetch if we are in a valid state to show data
    const shouldFetch = (activeRegion && activeCategory) || searchTerm.length > 0;
    
    if (shouldFetch) {
        const delayDebounceFn = setTimeout(() => {
            fetchRecords({ 
                region: activeRegion ? activeRegion.id : '', 
                category: activeCategory ? activeCategory.name : 'All', 
                page: 1, 
                status: viewMode,
                search: searchTerm 
            });
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, activeRegion, activeCategory, viewMode]); // <--- NO fetchRecords here

  // Navigation Handlers (Just update state, let useEffect handle fetch)
  const enterRegion = (region) => { setActiveRegion(region); setActiveCategory(null); setSearchTerm(''); };
  const enterCategory = (category) => { 
      if (!activeRegion) return; 
      setActiveCategory(category); 
      setViewMode('Active'); 
      setSearchTerm(''); 
  };
  const goToRoot = () => { setActiveRegion(null); setActiveCategory(null); setSearchTerm(''); };
  const goToRegion = () => { setActiveCategory(null); setSearchTerm(''); };
  const toggleViewMode = (mode) => setViewMode(mode);

  // Data Filters
  const visibleRegions = regions.filter(region => {
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isAssigned = region.id == user?.region_id; 
    return (isSuperAdmin || isAssigned);
  });

  const getVisibleCategories = () => {
    if (!activeRegion) return [];
    return categories.filter(cat => cat.region === 'Global' || cat.region === activeRegion.name);
  };

  // Actions
  const handleArchive = async (id) => {
    if (window.confirm("Archive this record?")) {
        await archiveRecord(id);
        // Manual refresh needed here because state didn't change
        fetchRecords({ region: activeRegion?.id, category: activeCategory?.name, page: 1, status: viewMode, search: searchTerm });
    }
  };

  const handleEdit = (rec) => { setRecordToEdit(rec); setIsModalOpen(true); };
  
  const handleOperationSuccess = () => {
    setIsModalOpen(false);
    setRecordToEdit(null);
    fetchRecords({ region: activeRegion?.id, category: activeCategory?.name, page: 1, status: viewMode, search: searchTerm });
  };

  const handleViewFile = (record) => {
    if (record.is_restricted) {
        setSelectedRestrictedRecord(record);
        setPasswordModalOpen(true);
    } else {
        const url = `http://localhost:5000/api/records/download/${record.file_path}`;
        setViewerUrl(url);
        setViewerFile(record);
        setViewerOpen(true);
    }
  };

  const handleUnlockSuccess = (filePath, accessToken) => {
    const url = `http://localhost:5000/api/records/download/${filePath}?token=${accessToken}`;
    setViewerUrl(url);
    setViewerFile(selectedRestrictedRecord);
    setViewerOpen(true);
  };

  const showTable = (activeRegion && activeCategory) || searchTerm.length > 0;

  return (
    <div className="p-6 lg:p-10 min-h-screen bg-slate-50/50 flex flex-col gap-8 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 animate-fade-in-down">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Registry<span className="text-indigo-600">.</span></h1>
          
          <nav className="flex items-center gap-2 text-sm font-medium bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm w-fit">
             <button onClick={goToRoot} className={`flex items-center gap-1.5 transition-colors ${!activeRegion ? 'text-slate-800 font-bold' : 'text-slate-400 hover:text-indigo-600'}`}>
                <Icons.Home /> <span>National</span>
             </button>
             {activeRegion && (
               <>
                 <Icons.ChevronRight />
                 <button onClick={goToRegion} className={`flex items-center gap-1 transition-colors ${!activeCategory ? 'text-slate-800 font-bold' : 'text-slate-400 hover:text-indigo-600'}`}>
                    {activeRegion.name}
                 </button>
               </>
             )}
             {activeCategory && (
               <>
                 <Icons.ChevronRight />
                 <span className="flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                    {activeCategory.name}
                 </span>
               </>
             )}
          </nav>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="group relative overflow-hidden px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl shadow-xl shadow-slate-200 transition-all active:scale-95">
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="relative flex items-center gap-2 font-bold text-sm">
                <Icons.Plus /> <span>New Record</span>
            </div>
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="sticky top-4 z-20 bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-white/50 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
         <div className="relative w-full md:max-w-md group">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><Icons.Search /></div>
           <input type="text" placeholder="Search records..." className="w-full pl-11 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           {searchTerm && (
               <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all">
                   <Icons.X />
               </button>
           )}
         </div>

         {showTable && (
             <div className="flex bg-slate-100 p-1.5 rounded-xl self-end md:self-auto">
                {['Active', 'Archived'].map((mode) => (
                    <button key={mode} onClick={() => toggleViewMode(mode)} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === mode ? 'bg-white text-slate-800 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'}`}>
                        {mode}
                    </button>
                ))}
             </div>
         )}
      </div>

      {/* CONTENT */}
      <div className="min-h-[400px]">
          
          {/* FOLDERS */}
          {!activeRegion && !searchTerm && (
            <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 mb-6">
                    <span className="h-px flex-1 bg-slate-200"></span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Regional Vaults</span>
                    <span className="h-px flex-1 bg-slate-200"></span>
                </div>
                {loading ? <GridSkeleton /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {visibleRegions.map((region) => (
                            <div key={region.id} onClick={() => enterRegion(region)} className="group bg-white hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 p-8 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                                <div className="transition-transform duration-300 group-hover:scale-110 mb-6 relative">
                                    <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full"></div>
                                    <Icons.Folder />
                                </div>
                                <h3 className="font-bold text-slate-700 text-lg group-hover:text-blue-700">{region.name}</h3>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}

          {activeRegion && !activeCategory && !searchTerm && (
            <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 mb-6">
                    <span className="h-px flex-1 bg-slate-200"></span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Classifications</span>
                    <span className="h-px flex-1 bg-slate-200"></span>
                </div>
                {loading ? <GridSkeleton /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {getVisibleCategories().map((cat) => (
                            <div key={cat.category_id} onClick={() => enterCategory(cat)} className="group bg-white hover:bg-amber-50/50 border border-slate-100 hover:border-amber-200 p-8 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                                <div className="transition-transform duration-300 group-hover:scale-110 mb-6 relative">
                                    <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full"></div>
                                    <Icons.Codex />
                                </div>
                                <h3 className="font-bold text-slate-700 text-lg group-hover:text-amber-700">{cat.name}</h3>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}

          {/* TABLE */}
          {showTable && (
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col animate-fade-in relative min-h-[300px]">
              {loading && <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm p-4"><TableSkeleton /></div>}
              
              <div className="overflow-x-auto">
                <RecordTable 
                    records={records}
                    viewMode={viewMode}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onRestore={restoreRecord}
                    onDestroy={destroyRecord}
                    onView={handleViewFile}
                />
              </div>

              {/* PAGINATION */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Page {pagination.current} of {pagination.pages}</span>
                <div className="flex items-center gap-2">
                  <button disabled={pagination.current === 1} onClick={() => fetchRecords({ page: pagination.current - 1, region: activeRegion?.id, category: activeCategory?.name, status: viewMode, search: searchTerm })} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 disabled:opacity-50">Previous</button>
                  <button disabled={pagination.current === pagination.pages} onClick={() => fetchRecords({ page: pagination.current + 1, region: activeRegion?.id, category: activeCategory?.name, status: viewMode, search: searchTerm })} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 disabled:opacity-50">Next</button>
                </div>
              </div>
            </div>
          )}
      </div>

      <RecordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleOperationSuccess} recordToEdit={recordToEdit} />
      <FilePasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} onSuccess={handleUnlockSuccess} record={selectedRestrictedRecord} />
      <DocumentViewerModal isOpen={viewerOpen} onClose={() => setViewerOpen(false)} fileUrl={viewerUrl} fileName={viewerFile?.title || 'Document'} isRestricted={viewerFile?.is_restricted} />
    </div>
  );
};

export default Registry;