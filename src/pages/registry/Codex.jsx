import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { formatRetention, displayRetention, parseRetention } from '../../utils/retentionUtils';
import { useAuth } from '../../context/AuthContext';
import { useCodex } from '../../context/CodexContext';
import { useOffices } from '../../context/OfficeContext';
import { useRegions } from '../../context/RegionContext';

// --- ICONS ---
const Icons = {
  Folder: () => <svg className="w-16 h-16 text-amber-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" /></svg>,
  FolderOpen: () => <svg className="w-16 h-16 text-amber-400 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" /></svg>,
  FileRule: () => <svg className="w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
  Home: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Globe: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  MapPin: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>,
  Building: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
};

const Codex = () => {
  const { user } = useAuth();
  const { regions } = useRegions();
  const { offices } = useOffices();
  const { categories, types, addCategory, deleteCategory, addType, deleteType } = useCodex();
  const location = useLocation();

  // NAVIGATION CONTEXT
  const [contextRegionId, setContextRegionId] = useState(null);
  const [contextOfficeId, setContextOfficeId] = useState(null);
  const [contextRegionName, setContextRegionName] = useState('');
  const [contextOfficeName, setContextOfficeName] = useState('');

  // NAVIGATION STATE
  const [activeFolder, setActiveFolder] = useState(null);

  // --- LOAD NAVIGATION CONTEXT ---
  useEffect(() => {
    if (location.state?.regionId) {
      const regionId = Number(location.state.regionId);
      setContextRegionId(regionId);
      const region = regions.find(r => Number(r.id) === regionId);
      setContextRegionName(region?.name || 'Unknown Region');
    }
    if (location.state?.officeId) {
      const officeId = Number(location.state.officeId);
      setContextOfficeId(officeId);
      const office = offices.find(o => Number(o.office_id) === officeId);
      setContextOfficeName(office?.name || 'Unknown Office');
      // Also get the region from the office
      if (office?.region_id) {
        const region = regions.find(r => Number(r.id) === office.region_id);
        setContextRegionId(office.region_id);
        setContextRegionName(region?.name || 'Unknown Region');
      }
    }
  }, [location.state, regions, offices]);

  // --- STAFF AUTO-SCOPING ---
  // For Staff users, auto-set their region as context
  useEffect(() => {
    const isStaff = user?.role === 'STAFF';
    if (!isStaff || !regions.length) return;

    // If no context is set, use Staff's assigned region
    if (!contextRegionId && user.region_id) {
      const staffRegion = regions.find(r => r.id == user.region_id);
      if (staffRegion) {
        setContextRegionId(staffRegion.id);
        setContextRegionName(staffRegion.name);
      }
    }
  }, [user, regions, contextRegionId]);

  // MODAL STATES
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FORMS
  const [catForm, setCatForm] = useState({ name: '', region: 'Global' });
  const [ruleForm, setRuleForm] = useState({
    type_name: '',
    retention_value: '',
    retention_unit: 'Years' // Default unit
  });

  const currentRules = activeFolder
    ? types.filter(t => t.category_id === activeFolder.category_id)
    : [];

  // --- PERMISSION CHECK ---
  // Allow if Super Admin OR Regional Admin (Role name usually 'REGIONAL_ADMIN' or 'ADMIN')
  const canEdit = user.role === 'SUPER_ADMIN' || user.role === 'REGIONAL_ADMIN' || user.role === 'ADMIN';
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  // Helper: Get Name of Current User's Region
  const getUserRegionName = () => {
    const regionObj = regions.find(r => r.id == user.region_id);
    return regionObj ? regionObj.name : '';
  };

  // --- HANDLERS ---

  const handleCreate = () => {
    if (activeFolder) {
      // Create Rule inside a folder
      setRuleForm({ type_name: '', retention_value: '', retention_unit: 'Years' });
      setIsRuleModalOpen(true);
    } else {
      // Create Folder
      // SMART PRE-FILL: If Regional Admin, lock to their region
      if (isSuperAdmin) {
        setCatForm({ name: '', region: 'Global' });
      } else {
        setCatForm({ name: '', region: getUserRegionName() });
      }
      setIsCategoryModalOpen(true);
    }
  };

  const submitCategory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await addCategory(catForm);
    setIsSubmitting(false);
    setIsCategoryModalOpen(false);
  };

  const submitRule = async (e) => {
    e.preventDefault();
    if (!activeFolder) return;

    setIsSubmitting(true);

    // Construct retention period string (e.g., "5 Years", "30 Days", "Permanent")
    const retentionPeriod = formatRetention(ruleForm.retention_value, ruleForm.retention_unit);

    await addType({
      type_name: ruleForm.type_name,
      retention_period: retentionPeriod,
      category_id: activeFolder.category_id,
      region: activeFolder.region
    });
    setIsSubmitting(false);
    setIsRuleModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50 selection:bg-indigo-100 selection:text-indigo-700 transition-colors duration-500">

      {/* HEADER & NAVIGATION */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-10 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">

            {/* Title & Badge */}
            <div className="flex items-center gap-4 self-start lg:self-auto">
              <div className="p-3 rounded-2xl shadow-lg bg-indigo-600 text-white shadow-indigo-200">
                <Icons.FileRule />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-slate-800">
                  Classifications<span className="text-indigo-500">.</span>
                </h1>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Records Management Series
                </p>
                {/* Staff Assignment Badge */}
                {user?.role === 'STAFF' && user?.office && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {user.office} • {getUserRegionName() || 'Region'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Breadcrumbs / Nav Pill */}
            <nav className="flex items-center gap-1 p-1.5 rounded-2xl border border-slate-200 shadow-sm bg-white/60 overflow-x-auto max-w-full no-scrollbar">
              {/* Context Breadcrumbs form Navigation */}
              {contextRegionName && (
                <>
                  <span className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap">
                    <Icons.MapPin /> {contextRegionName}
                  </span>
                  {contextOfficeName && (
                    <>
                      <Icons.ChevronRight />
                      <span className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap">
                        <Icons.Building /> {contextOfficeName}
                      </span>
                    </>
                  )}
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                </>
              )}

              <button
                onClick={() => setActiveFolder(null)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                  ${!activeFolder
                    ? 'bg-slate-800 text-white shadow-lg shadow-slate-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <Icons.Home /> <span>Root</span>
              </button>

              {activeFolder && (
                <>
                  <Icons.ChevronRight />
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap bg-amber-500 text-white shadow-lg shadow-amber-200 cursor-default"
                  >
                    <Icons.FolderOpen /> {activeFolder.name}
                  </button>
                </>
              )}
            </nav>

            {/* Actions */}
            {canEdit && (
              <button
                onClick={handleCreate}
                className="relative overflow-hidden px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center gap-2 group whitespace-nowrap bg-slate-900 text-white hover:bg-slate-800 hover:shadow-slate-300 ml-auto lg:ml-0"
              >
                <Icons.Plus />
                <span>{activeFolder ? 'New Record Series' : 'New Classification'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-1 p-6 lg:p-10 max-w-[1920px] w-full mx-auto">

        {/* VIEW A: ROOT (FOLDERS) */}
        {!activeFolder && (
          <div className="animate-fade-in-up">
            <SectionHeader title="Classification Folders" subtitle="Organize records by major categories." />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {/* STAFF SCOPING: Filter categories to show only Global and Staff's Region */}
              {categories
                .filter(cat => {
                  // Super Admins and Admins see all
                  if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'REGIONAL_ADMIN') {
                    return true;
                  }
                  // Staff see only Global or their assigned region's categories
                  return cat.region === 'Global' || cat.region === getUserRegionName();
                })
                .map((cat) => (
                  <div
                    key={cat.category_id}
                    onClick={() => setActiveFolder(cat)}
                    className="group relative bg-white border border-slate-100 hover:border-amber-200 p-8 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-transparent to-amber-500/5"></div>

                    {/* Icon */}
                    <div className="transition-transform duration-300 group-hover:scale-110 mb-6 relative z-10">
                      <Icons.Folder />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center">
                      <h3 className="font-bold text-lg text-slate-700 group-hover:text-amber-700 transition-colors">{cat.name}</h3>

                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-3 shadow-sm border
                      ${cat.region === 'Global' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {cat.region === 'Global' ? <Icons.Globe /> : <Icons.MapPin />}
                        {cat.region}
                      </div>
                    </div>

                    {/* Delete Button */}
                    {(isSuperAdmin || (canEdit && cat.region === getUserRegionName())) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCategory(cat.category_id); }}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20"
                        title="Delete Folder"
                      >
                        <Icons.Trash />
                      </button>
                    )}
                  </div>
                ))}

              {/* Empty State */}
              {categories.length === 0 && (
                <div className="col-span-full border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center justify-center bg-slate-50/50">
                  <div className="bg-slate-100 p-4 rounded-full mb-4 opacity-50"><Icons.Folder /></div>
                  <p className="font-bold text-slate-400">No classifications found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW B: INSIDE FOLDER (RULES) */}
        {activeFolder && (
          <div className="animate-fade-in-up">
            <SectionHeader title={activeFolder.name} subtitle="Document Retention Policies"
              action={
                <button onClick={() => setActiveFolder(null)} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors mb-2">
                  <Icons.ArrowLeft /> Back to Folders
                </button>
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentRules.map((rule) => (
                <div key={rule.type_id} className="group relative bg-white border border-slate-200 hover:border-indigo-300 rounded-[1.5rem] p-6 flex flex-col hover:shadow-xl transition-all duration-300">

                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                      <Icons.FileRule />
                    </div>
                    {(isSuperAdmin || (canEdit && activeFolder.region === getUserRegionName())) && (
                      <button
                        onClick={() => deleteType(rule.type_id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Delete Rule"
                      >
                        <Icons.Trash />
                      </button>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-slate-800 leading-snug mb-2 group-hover:text-indigo-700 transition-colors line-clamp-2">
                    {rule.type_name}
                  </h3>

                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                      <Icons.Clock /> Retention Period
                    </div>
                    <p className="mt-1 text-2xl font-black text-slate-700 tracking-tight">
                      {displayRetention(rule.retention_period).split(' ')[0]}
                      <span className="text-sm font-bold text-slate-400 ml-1 uppercase">
                        {displayRetention(rule.retention_period).split(' ')[1] || ''}
                      </span>
                    </p>
                    {rule.retention_period === 'Permanent' && <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">PERMANENT RECORD</span>}
                  </div>
                </div>
              ))}

              {/* Add Rule Button (Inline) - Only if permitted */}
              {(isSuperAdmin || (canEdit && activeFolder.region === getUserRegionName())) && (
                <button
                  onClick={handleCreate}
                  className="group relative border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-all min-h-[200px]"
                >
                  <div className="bg-slate-50 group-hover:bg-white p-4 rounded-full mb-3 shadow-sm transition-all group-hover:scale-110">
                    <Icons.Plus />
                  </div>
                  <span className="font-bold">Add Policy</span>
                </button>
              )}
            </div>

            {currentRules.length === 0 && !(isSuperAdmin || (canEdit && activeFolder.region === getUserRegionName())) && (
              <div className="col-span-full py-12 flex flex-col items-center text-slate-400">
                <p>No retention policies defined for this folder.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL: NEW FOLDER --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-zoom-in">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 flex justify-center text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                📂
              </div>
            </div>

            <form onSubmit={submitCategory} className="p-8 pt-6 space-y-5">
              <div className="text-center mb-2">
                <h3 className="font-black text-xl text-slate-800">New Classification</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Create a new filing category</p>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Folder Name</label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  placeholder="e.g. Administrative Issuances"
                  value={catForm.name}
                  onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                  required autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1 block flex justify-between">
                  Target Region
                  {!isSuperAdmin && <span className="text-[10px] text-amber-600 flex items-center gap-1"><Icons.Lock /> Auto-Locked</span>}
                </label>

                {isSuperAdmin ? (
                  <div className="relative">
                    <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer" value={catForm.region} onChange={e => setCatForm({ ...catForm, region: e.target.value })}>
                      <option value="Global">Global (All Regions)</option>
                      {regions.map(r => <option key={r.id} value={r.name}>{r.name} Only</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Icons.ChevronRight /></div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      className="w-full bg-slate-100 border border-slate-200 p-3 rounded-xl text-sm text-slate-500 font-bold outline-none cursor-not-allowed select-none"
                      value={catForm.region}
                      readOnly
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.MapPin /></div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wide transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-wide shadow-lg shadow-amber-200 disabled:opacity-50 transition-all transform active:scale-95">
                  {isSubmitting ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: NEW RULE --- */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 flex justify-center text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                📋
              </div>
            </div>

            <form onSubmit={submitRule} className="p-8 pt-6 space-y-5">
              <div className="text-center mb-2">
                <h3 className="font-black text-xl text-slate-800">New Retention Policy</h3>
                <p className="text-xs text-slate-500 font-bold">Category: <span className="text-indigo-600">{activeFolder?.name}</span></p>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Document Type Title</label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  placeholder="e.g. Purchase Request"
                  value={ruleForm.type_name}
                  onChange={e => setRuleForm({ ...ruleForm, type_name: e.target.value })}
                  required autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Retention Period</label>
                <div className="flex gap-2">
                  {/* Value Input */}
                  {ruleForm.retention_unit !== 'Permanent' && (
                    <input
                      type="number"
                      min="1"
                      className="w-24 bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-700 text-center"
                      placeholder="5"
                      value={ruleForm.retention_value}
                      onChange={e => setRuleForm({ ...ruleForm, retention_value: e.target.value })}
                      required={ruleForm.retention_unit !== 'Permanent'}
                    />
                  )}

                  {/* Unit Select */}
                  <div className="relative flex-1">
                    <select
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                      value={ruleForm.retention_unit}
                      onChange={e => setRuleForm({
                        ...ruleForm,
                        retention_unit: e.target.value,
                        retention_value: e.target.value === 'Permanent' ? '' : ruleForm.retention_value
                      })}
                    >
                      <option value="Days">Days</option>
                      <option value="Weeks">Weeks</option>
                      <option value="Months">Months</option>
                      <option value="Years">Years</option>
                      <option value="Permanent">♾️ Permanent</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Icons.ChevronRight /></div>
                  </div>
                </div>

                {/* Preview Blurb */}
                <div className="mt-3 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-medium text-indigo-800 flex items-start gap-2 leading-relaxed">
                  <div className="mt-0.5"><Icons.Clock /></div>
                  <span>
                    {ruleForm.retention_unit === 'Permanent'
                      ? 'This document type will be kept permanently and never expire.'
                      : ruleForm.retention_value
                        ? `Documents of this type will be retained for ${formatRetention(ruleForm.retention_value, ruleForm.retention_unit)}.`
                        : 'Enter a value to see the retention preview.'
                    }
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsRuleModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wide transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all transform active:scale-95">
                  {isSubmitting ? 'Saving...' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// --- SUB-COMPONENTS ---

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="mb-8">
    {action}
    <div className="flex items-center gap-2 mb-2">
      <div className="h-px w-8 bg-indigo-500"></div>
      <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Directory</span>
    </div>
    <h2 className="text-3xl font-black text-slate-800">{title}</h2>
    <p className="text-slate-400 font-medium mt-1">{subtitle}</p>
  </div>
);
export default Codex;