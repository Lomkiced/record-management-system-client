import { useEffect, useState } from 'react';
import { useRegistry } from '../../context/RegistryContext';
import { useRegions } from '../../context/RegionContext';
import { useAuth } from '../../context/AuthContext';
import { useConfirmation } from '../../context/ConfirmationContext';
import { toast } from 'sonner';
import DocumentViewerModal from '../../components/registry/DocumentViewerModal';

// --- ICONS ---
const Icons = {
    Archive: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
    Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
    Restore: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>,
    Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
    Filter: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>,
    Folder: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>,
    File: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
};

const Archive = () => {
    const { user } = useAuth();
    const { records, fetchRecords, restoreRecord, deleteRecord, loading, pagination } = useRegistry();
    const { regions } = useRegions();
    const { confirm } = useConfirmation();

    const [search, setSearch] = useState('');
    const [filterRegion, setFilterRegion] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerUrl, setViewerUrl] = useState('');

    // Fetch archived records on mount and focus
    useEffect(() => {
        const load = () => {
            const params = {
                page: currentPage,
                status: 'Archived',
                search: search,
                region: filterRegion !== 'All' ? filterRegion : '',
                category: filterCategory
            };
            fetchRecords(params);
        };

        load();

        // Auto-refresh when tab comes into focus (if user archived from another tab/window)
        const onFocus = () => load();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [currentPage, search, filterRegion, filterCategory]);

    // Handlers
    const handleRestore = async (record) => {
        const isConfirmed = await confirm({
            title: 'Restore Record?',
            message: `Restore "${record.title}" back to active records?`,
            confirmLabel: 'Restore',
            variant: 'success',
            icon: 'restore'
        });

        if (isConfirmed) {
            await restoreRecord(record.record_id);
            toast.success('Record restored successfully');
            // Refresh the list
            fetchRecords({ page: currentPage, status: 'Archived', search, region: filterRegion !== 'All' ? filterRegion : '', category: filterCategory });
        }
    };

    const handleDelete = async (record) => {
        const isConfirmed = await confirm({
            title: '⚠️ Permanent Deletion',
            message: `This will PERMANENTLY delete "${record.title}" and its physical file from the server. This action CANNOT be undone.`,
            confirmLabel: 'Delete Forever',
            variant: 'danger',
            icon: 'trash'
        });

        if (isConfirmed) {
            await deleteRecord(record.record_id);
            toast.success('Record and file permanently deleted');
            // Refresh the list
            fetchRecords({ page: currentPage, status: 'Archived', search, region: filterRegion !== 'All' ? filterRegion : '', category: filterCategory });
        }
    };

    const handleView = (record) => {
        const baseUrl = 'http://localhost:5000';
        const isRestricted = record.is_restricted;
        const filePath = isRestricted ? `/uploads/restricted/${record.file_path}` : `/uploads/${record.file_path}`;
        setViewerUrl(`${baseUrl}${filePath}`);
        setSelectedRecord(record);
        setIsViewerOpen(true);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatSize = (bytes) => {
        if (!bytes) return 'N/A';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    // Categories from records
    const categories = [...new Set(records.map(r => r.category).filter(Boolean))];

    return (
        <div className="p-8 min-h-screen flex flex-col gap-6 animate-fade-in bg-slate-50/50">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="p-2 bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-200"><Icons.Archive /></span>
                        Archive
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        View and manage all archived documents across regions.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                    <span className="text-amber-600 font-bold text-2xl">{pagination.total || 0}</span>
                    <span className="text-amber-700 text-sm font-medium">Archived Files</span>
                </div>
            </div>

            {/* FILTER TOOLBAR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">

                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div>
                    <input
                        type="text"
                        placeholder="Search archived files..."
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 outline-none w-full transition-all"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                {/* Region Filter */}
                {user?.role === 'SUPER_ADMIN' && (
                    <div className="relative group">
                        <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Region</label>
                        <select
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 min-w-[150px] cursor-pointer appearance-none"
                            value={filterRegion}
                            onChange={(e) => { setFilterRegion(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="All">All Regions</option>
                            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                )}

                {/* Category Filter */}
                <div className="relative group">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                    <select
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 min-w-[150px] cursor-pointer appearance-none"
                        value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Refresh */}
                <button
                    onClick={() => fetchRecords({ page: 1, status: 'Archived', search, region: filterRegion !== 'All' ? filterRegion : '', category: filterCategory })}
                    className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                    title="Refresh"
                >
                    <Icons.Refresh />
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80 text-[11px] uppercase text-slate-500 font-bold tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">File</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Region</th>
                                <th className="px-6 py-4">Archived Date</th>
                                <th className="px-6 py-4">Size</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse"><td colSpan="6" className="px-6 py-4"><div className="h-12 bg-slate-100 rounded-lg"></div></td></tr>
                                ))
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Icons.Archive />
                                            </div>
                                            <p className="font-medium">No archived files found.</p>
                                            <p className="text-sm">Archived documents will appear here.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                records.map(record => (
                                    <tr key={record.record_id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm">
                                                    <Icons.File />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700 text-sm truncate max-w-[200px]">{record.title}</p>
                                                    <p className="text-xs text-slate-400">{record.file_type || 'Unknown type'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                {record.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Icons.Folder />
                                                <span className="font-medium">{record.region_name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {formatDate(record.updated_at || record.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                            {formatSize(record.file_size)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleView(record)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Icons.Eye />
                                                </button>
                                                <button
                                                    onClick={() => handleRestore(record)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Restore"
                                                >
                                                    <Icons.Restore />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(record)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Permanently"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {pagination.pages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Page <span className="font-bold">{pagination.current}</span> of <span className="font-bold">{pagination.pages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={currentPage === pagination.pages}
                                className="px-3 py-1.5 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* DOCUMENT VIEWER MODAL */}
            <DocumentViewerModal
                isOpen={isViewerOpen}
                onClose={() => { setIsViewerOpen(false); setSelectedRecord(null); }}
                fileUrl={viewerUrl}
                fileName={selectedRecord?.title}
                fileType={selectedRecord?.file_type}
            />
        </div>
    );
};

export default Archive;
