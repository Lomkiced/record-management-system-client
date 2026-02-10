
const DocumentViewerModal = ({ isOpen, onClose, fileUrl, record }) => {
    if (!isOpen || !record) return null;

    const { is_restricted, title, file_path, file_size, file_type, uploaded_at, region_name, office_name, category, shelf, uploader_name, retention_period, disposal_date, period_covered, volume, duplication, time_value, utility_value, media_text, restriction_text, frequency_text, provision_text } = record;

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // GRAMMAR FIX
    const displayRetention = (period) => {
        if (!period) return 'N/A';
        if (period === 'Permanent') return 'Permanent';
        // If it already has "Year" or "Month", just return it (assuming DB is fixed)
        // If it is just a number, append "Years" (legacy support)
        if (String(period).match(/^\d+$/)) {
            return Number(period) === 1 ? '1 Year' : `${period} Years`;
        }
        // If it says "1 Years", fix it
        const match = String(period).match(/^(\d+)\s*years?$/i);
        if (match) {
            return Number(match[1]) === 1 ? '1 Year' : `${match[1]} Years`;
        }
        return period;
    };

    const timeValueMap = { 'T': 'Temporary', 'P': 'Permanent' };
    const utilityValueMap = { 'Adm': 'Administrative', 'F': 'Fiscal', 'L': 'Legal', 'Arc': 'Archival' };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[92vh] flex flex-col overflow-hidden border border-slate-700/50 ring-1 ring-white/10">

                {/* HEADER */}
                <div className="px-6 py-4 flex justify-between items-center bg-slate-900 text-white border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className={`p-2.5 rounded-xl shadow-lg ${is_restricted ? 'bg-gradient-to-br from-red-600 to-rose-700' : 'bg-gradient-to-br from-indigo-500 to-violet-600'}`}>
                            {is_restricted ? (
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            ) : (
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base font-bold text-white truncate pr-4">{title || 'Document Viewer'}</h3>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${is_restricted ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'}`}>
                                    {is_restricted ? 'Restricted' : 'Public'}
                                </span>
                                <span className="text-[10px] text-slate-400">• {formatBytes(file_size)}</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-all text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* CONTENT SPLIT */}
                <div className="flex flex-1 min-h-0">
                    {/* LEFT: PDF VIEWER */}
                    <div className="flex-1 bg-slate-100 relative group overflow-hidden flex flex-col shadow-inner">
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 z-0">
                            <svg className="w-12 h-12 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                        <iframe src={fileUrl} className="w-full h-full relative z-10 border-none bg-white" title="Document Viewer"></iframe>
                    </div>

                    {/* RIGHT: DETAILS PANEL */}
                    <div className="w-[400px] bg-white border-l border-slate-200 flex flex-col min-h-0 overflow-y-auto shrink-0 relative z-20 shadow-xl">
                        <div className="p-6 space-y-8">

                            {/* ACTION CARD */}
                            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Actions</p>
                                <a href={fileUrl} download className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-slate-900/20 active:scale-95 group">
                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download Access Copy
                                </a>
                            </div>

                            {/* DETAILS GRID */}
                            <div className="space-y-6">
                                {/* Location */}
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Filing Location</p>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1.5 bg-white rounded-md shadow-sm border border-slate-100"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{office_name}</p>
                                                <p className="text-xs text-slate-500">{region_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 border-t border-slate-200/60 pt-3">
                                            <div className="mt-0.5 p-1.5 bg-white rounded-md shadow-sm border border-slate-100"><svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg></div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-700 line-clamp-2">{category}</p>
                                                <p className="text-[10px] font-medium text-slate-500 mt-0.5 bg-slate-200/50 px-1.5 py-0.5 rounded w-fit">Shelf: {shelf}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Record Metadata</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                            <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Period Covered</p>
                                            <p className="text-sm font-bold text-slate-700">{period_covered || 'N/A'}</p>
                                        </div>

                                        {[
                                            { label: 'Medium', value: media_text },
                                            { label: 'Restrictions', value: restriction_text, isBadge: true },
                                            { label: 'Frequency', value: frequency_text },
                                            { label: 'Provision', value: provision_text },
                                            { label: 'Volume', value: volume },
                                            { label: 'Duplication', value: duplication },
                                            { label: 'Time Value', value: timeValueMap[time_value] || time_value },
                                            { label: 'Utility Value', value: utilityValueMap[utility_value] || utility_value }
                                        ].map((item, idx) => (
                                            <div key={idx} className={`p-3 bg-white border border-slate-100 rounded-xl shadow-sm ${item.isBadge ? 'col-span-2' : ''}`}>
                                                <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">{item.label}</p>
                                                {item.isBadge && item.value ? (
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.value.toLowerCase().includes('restricted') || item.value.toLowerCase().includes('confidential') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {item.value}
                                                    </span>
                                                ) : (
                                                    <p className="text-xs font-bold text-slate-700 truncate">{item.value || '-'}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Lifecycle */}
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Lifecycle</p>
                                    <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
                                        <div className="p-3 flex justify-between items-center">
                                            <span className="text-xs font-medium text-slate-500">Uploaded</span>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-700">{formatDate(uploaded_at).split(',')[0]}</p>
                                                <p className="text-[10px] text-slate-400">{uploader_name || 'System'}</p>
                                            </div>
                                        </div>
                                        <div className="p-3 flex justify-between items-center bg-indigo-50/50">
                                            <span className="text-xs font-medium text-indigo-600">Retention</span>
                                            <span className="text-xs font-bold text-indigo-700">{displayRetention(retention_period)}</span>
                                        </div>
                                        <div className="p-3 flex justify-between items-center bg-red-50/50">
                                            <span className="text-xs font-medium text-red-600">Disposal Date</span>
                                            <span className="text-xs font-bold text-red-700">{formatDate(disposal_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewerModal;