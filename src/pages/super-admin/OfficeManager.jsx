import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import OfficeModal from '../../components/super-admin/OfficeModal';
import { useConfirmation } from '../../context/ConfirmationContext';
import { useOffices } from '../../context/OfficeContext';
import { useRegions } from '../../context/RegionContext';
import useDebounce from '../../hooks/useDebounce';

// ... (Icons remain same)
// --- PROFESSIONAL ICONS ---
const Icons = {
    Building: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
    Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
    Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
    Filter: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>,
    Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
    MapPin: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
    ArrowLeft: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
};

const OfficeManager = () => {
    const { offices, fetchOffices, deleteOffice, loading, pagination } = useOffices();
    const { regions } = useRegions();
    const { confirm } = useConfirmation();
    const location = useLocation();
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetOffice, setTargetOffice] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [parentOfficeName, setParentOfficeName] = useState('');

    // Derived State from URL
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const filterRegion = searchParams.get('region') || 'ALL';
    const parentOfficeId = searchParams.get('parent') || null;

    // Debounce Search
    const debouncedSearch = useDebounce(search, 500);

    // Fetch Data on Params Change
    useEffect(() => {
        const fetch = async () => {
            const params = {
                page,
                limit,
                search: debouncedSearch,
                region_id: filterRegion !== 'ALL' ? filterRegion : null,
                parent_office_id: parentOfficeId,
                toplevel: !parentOfficeId ? 'true' : undefined
            };
            await fetchOffices(params);
        };
        fetch();
    }, [debouncedSearch, page, limit, filterRegion, parentOfficeId]);

    // Helpers to update params
    const updateParams = (newParams) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                next.delete(key);
            } else {
                next.set(key, value);
            }
        });
        setSearchParams(next);
    };

    // Derived Lists
    // Since server filters, we just use 'offices' directly
    const filteredOffices = offices;

    // Handlers
    const handleOpenModal = (office = null) => {
        if (office) {
            setTargetOffice(office);
        } else {
            setTargetOffice({
                parent_id: parentOfficeId,
                region_id: filterRegion !== 'ALL' ? filterRegion : null
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (office) => {
        const isConfirmed = await confirm({
            title: 'Delete Office?',
            message: `Are you sure you want to delete "${office.name}"? This action cannot be undone.`,
            confirmLabel: 'Delete Office',
            variant: 'danger',
            icon: 'trash'
        });

        if (isConfirmed) {
            const success = await deleteOffice(office.office_id);
            if (success) {
                toast.success('Office deleted successfully');
            }
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setTargetOffice(null);
    };

    const handleSaveSuccess = () => {
        handleModalClose();
        // Refresh with current params
        const params = {
            page,
            limit,
            search: debouncedSearch,
            region_id: filterRegion !== 'ALL' ? filterRegion : null,
            parent_office_id: parentOfficeId,
            toplevel: !parentOfficeId ? 'true' : undefined
        };
        fetchOffices(params);
    };

    const handleOfficeClick = (office) => {
        // DYNAMIC: If we're at top level (no parent), try to drill down
        if (!parentOfficeId) {
            updateParams({ parent: office.office_id, page: 1 });
            setParentOfficeName(office.name);
            return;
        }

        // Already drilled down - navigate to Codex
        navigate('/codex', { state: { officeId: office.office_id } });
    };

    const handleBack = () => {
        updateParams({ parent: null, page: 1 });
        setParentOfficeName('');
    };

    // Helper to get region name
    const getRegionName = (regionId) => {
        const region = regions.find(r => r.id === regionId || r.id === parseInt(regionId));
        return region?.name || 'Unknown Region';
    };

    // Calculate Stats
    const totalOffices = offices.length;
    const activeRegions = new Set(offices.map(o => o.region_id)).size;

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">

            {/* 1. TOP NAVIGATION / HEADER (Compact & Professional) */}
            <header className="flex-none bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-900 text-white rounded-lg shadow-md">
                        <Icons.Building />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Office Management</h1>
                        <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                            {parentOfficeId ? `Unit Command: ${parentOfficeName}` : 'National Command Center'}
                        </p>
                    </div>

                    {/* Breadcrumb Separator if drilled down */}
                    {parentOfficeId && (
                        <>
                            <div className="h-8 w-px bg-slate-200 mx-2"></div>
                            <button onClick={handleBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                                <Icons.ArrowLeft /> Back to HQ
                            </button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        <Icons.Plus /> <span>New {parentOfficeId ? 'Unit' : 'Office'}</span>
                    </button>
                </div>
            </header>

            {/* 2. STATS ROW (Executive Overview) */}
            <div className="flex-none px-8 py-6 bg-slate-50 border-b border-slate-200/60 hidden lg:flex gap-6">
                <StatCard
                    label="Total Offices"
                    value={totalOffices}
                    icon={<Icons.Building />}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
                <StatCard
                    label="Active Provinces"
                    value={activeRegions}
                    icon={<Icons.MapPin />}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />

            </div>

            {/* 3. COMMAND BAR (Toolbar) */}
            <div className="flex-none px-8 py-4 bg-white/50 backdrop-blur-sm border-b border-slate-200 flex flex-col md:flex-row items-center gap-4 justify-between">
                {/* Search & Filter Group */}
                <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-2xl">
                    <div className="relative flex-1 group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Icons.Search />
                        </div>
                        <input
                            type="text"
                            placeholder="Search office name, code..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                            value={search}
                            onChange={(e) => updateParams({ search: e.target.value, page: 1 })}
                        />
                    </div>

                    <div className="h-8 w-px bg-slate-300 mx-1 hidden md:block"></div>

                    {/* Region Filter */}
                    <div className="relative">
                        <select
                            className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer shadow-sm transition-all min-w-[160px]"
                            value={filterRegion}
                            onChange={(e) => updateParams({ region: e.target.value, page: 1, parent: null })}
                        >
                            <option value="ALL">All Regions</option>
                            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Icons.Filter />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            // Trigger re-fetch manually if needed, but params change triggers effect. 
                            // To force refresh without params change, we might need a dummy state or just call fetchOffices directly.
                            const params = {
                                page,
                                limit,
                                search: debouncedSearch,
                                region_id: filterRegion !== 'ALL' ? filterRegion : null,
                                parent_office_id: parentOfficeId,
                                toplevel: !parentOfficeId ? 'true' : undefined
                            };
                            fetchOffices(params);
                        }}
                        className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 rounded-lg shadow-sm transition-colors"
                        title="Refresh Data"
                    >
                        <Icons.Refresh />
                    </button>
                </div>

                {/* View Toggles */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="List View"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Grid View"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </button>
                </div>
            </div>

            {/* 4. MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-indigo-400 animate-pulse">
                            <Icons.Refresh className="w-10 h-10 animate-spin" />
                            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading Command Center...</span>
                        </div>
                    </div>
                ) : filteredOffices.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* LIST VIEW (Table) */}
                        {viewMode === 'list' && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-200">
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-16">Icon</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Office Name</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Region</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredOffices.map((office) => (
                                            <tr
                                                key={office.office_id}
                                                onClick={() => handleOfficeClick(office)}
                                                className="group hover:bg-indigo-50/30 transition-colors cursor-pointer"
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                                        {(office.code || office.name || 'O').charAt(0).toUpperCase()}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <span className="block font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">
                                                            {office.name}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-medium">#{office.code || 'NO-CODE'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-500">
                                                        <Icons.MapPin className="w-3 h-3" />
                                                        {getRegionName(office.region_id)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide
                                                        ${office.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${office.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                        {office.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleOpenModal(office); }}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Icons.Edit />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(office); }}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Icons.Trash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* GRID VIEW (Cards) */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                                {filteredOffices.map((office) => (
                                    <div
                                        key={office.office_id}
                                        onClick={() => handleOfficeClick(office)}
                                        className="group relative bg-white rounded-xl p-6 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-lg bg-slate-50 text-slate-700 font-black flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                {(office.code || office.name || 'O').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenModal(office) }} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600"><Icons.Edit /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(office) }} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600"><Icons.Trash /></button>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1 group-hover:text-indigo-700">{office.name}</h3>
                                        <p className="text-xs font-medium text-slate-400 mb-4">#{office.code || 'N/A'}</p>

                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                <Icons.MapPin className="w-3 h-3" />
                                                {getRegionName(office.region_id)}
                                            </span>
                                            <span className={`w-2 h-2 rounded-full ${office.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 5. PAGINATION CONTROLS */}
            {!loading && offices.length > 0 && (
                <div className="flex-none px-8 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <span>Rows per page:</span>
                        <select
                            value={limit}
                            onChange={(e) => updateParams({ limit: Number(e.target.value), page: 1 })}
                            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="ml-4">
                            Showing {((pagination.current - 1) * limit) + 1} - {Math.min(pagination.current * limit, pagination.total)} of {pagination.total}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => updateParams({ page: Math.max(1, page - 1) })}
                            disabled={pagination.current === 1}
                            className={`p-2 rounded-lg border flex items-center gap-1 text-sm font-bold transition-colors
                                ${pagination.current === 1
                                    ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                            <Icons.ArrowLeft /> Prev
                        </button>

                        <div className="flex items-center gap-1 px-2">
                            {/* Simplified pagination for now */}
                            <span className="text-sm font-bold text-slate-600">
                                Page {pagination.current} of {pagination.pages}
                            </span>
                        </div>

                        <button
                            onClick={() => updateParams({ page: Math.min(pagination.pages, page + 1) })}
                            disabled={pagination.current === pagination.pages}
                            className={`p-2 rounded-lg border flex items-center gap-1 text-sm font-bold transition-colors
                                ${pagination.current === pagination.pages
                                    ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                            Next <span className="rotate-180"><Icons.ArrowLeft /></span>
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL */}
            <OfficeModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                office={targetOffice}
                regions={regions}
                onSaveSuccess={handleSaveSuccess}
            />
        </div>
    );
};

export default OfficeManager;

// --- SUB-COMPONENTS ---

const StatCard = ({ label, value, icon, color, bg, isText }) => (
    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm min-w-[200px]">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${bg} ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-black text-slate-800 ${isText ? 'text-lg' : ''}`}>{value}</p>
        </div>
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-fade-in">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <h3 className="text-lg font-bold text-slate-600">No Data Found</h3>
        <p className="text-sm">Try adjusting your filters or database is empty.</p>
    </div>
);
