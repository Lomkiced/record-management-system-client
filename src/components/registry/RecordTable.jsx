// --- ICONS ---
const Icons = {
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Archive: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Restore: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Destroy: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  File: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
};

const RecordTable = ({ records, onEdit, onArchive, onRestore, onDestroy, onView, viewMode, highlightedRecordId, confirm }) => {
  if (!records || records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 m-4">
        <div className="p-4 bg-white rounded-full shadow-sm mb-3">
          <Icons.File />
        </div>
        <p className="font-bold text-sm">No records found in this view.</p>
        <p className="text-xs text-slate-400 mt-1">Upload a file to get started.</p>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    if (status === 'Archived') return 'bg-gray-100 text-gray-600 border-gray-200';
    if (status === 'Active') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getRetentionBadge = (disposalDate) => {
    if (!disposalDate) return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">PERMANENT</span>;
    const now = new Date();
    const expiry = new Date(disposalDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysRaw = (expiry - now) / msPerDay;
    const days = Math.ceil(daysRaw);

    if (days < 0) return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-600 border border-red-100">EXPIRED</span>;

    let label;
    if (days < 30) {
      label = `${days} ${days === 1 ? 'Day' : 'Days'}`;
    } else if (days < 365) {
      const weeksRaw = (days / 7).toFixed(1);
      const weeks = weeksRaw.endsWith('.0') ? parseInt(weeksRaw) : weeksRaw;
      label = `${weeks} ${weeks == 1 ? 'Week' : 'Weeks'}`;
    } else {
      const yearsRaw = (days / 365).toFixed(1);
      const years = yearsRaw.endsWith('.0') ? parseInt(yearsRaw) : yearsRaw;
      label = `${years} ${years == 1 ? 'Year' : 'Years'}`;
    }

    return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">{label}</span>;
  };

  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-slate-50 sticky top-0 z-10 text-xs uppercase text-slate-500 font-bold tracking-wider">
        <tr className="border-b border-slate-100">
          <th className="px-6 py-4">Ref ID / Title</th>
          <th className="px-6 py-4">Classification</th>
          <th className="px-6 py-4">Location</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {records.map((record) => {
          const isHighlighted = highlightedRecordId && (record.record_id.toString() === highlightedRecordId.toString());
          return (
            <tr key={record.record_id} className={`transition-all group ${isHighlighted ? 'bg-amber-50/80 ring-2 ring-inset ring-amber-500/50' : 'hover:bg-slate-50/80'}`}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${record.is_restricted ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'} ${isHighlighted ? 'animate-bounce' : ''}`}>
                    {record.is_restricted ? <Icons.Lock /> : <Icons.File />}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${record.is_restricted ? 'text-red-700' : 'text-slate-700'}`}>{record.title}</div>
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">ID: {record.record_id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-slate-700">{record.category}</div>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase">{record.type_name || record.classification_rule || record.file_type || 'Record'}</span>
                  {getRetentionBadge(record.disposal_date)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-slate-600">{record.shelf || <span className="text-slate-400 italic font-normal">Unsorted</span>}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusStyle(record.status)}`}>
                  {record.status}
                </span>
              </td>

              {/* --- ACTIONS COLUMN --- */}
              <td className="px-6 py-4 text-right">
                <div className={`flex justify-end gap-1 transition-opacity ${isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>

                  {/* VIEW (Universal) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onView(record); }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View File"
                  >
                    <Icons.Eye />
                  </button>

                  {/* ACTIVE MODE BUTTONS */}
                  {viewMode === 'Active' && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); onEdit(record); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Metadata">
                        <Icons.Edit />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onArchive(record.record_id); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Archive Record">
                        <Icons.Archive />
                      </button>
                    </>
                  )}

                  {/* ARCHIVED MODE BUTTONS */}
                  {viewMode === 'Archived' && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); onRestore(record.record_id); }}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Restore to Registry"
                      >
                        <Icons.Restore />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm) {
                            const isConfirmed = await confirm({
                              title: 'Destroy Record?',
                              message: 'This action is irreversible. The file and metadata will be permanently deleted.',
                              confirmLabel: 'Permanently Destroy',
                              variant: 'danger',
                              icon: 'trash'
                            });
                            if (isConfirmed) onDestroy(record.record_id, true);
                          } else {
                            if (window.confirm("Permanently delete this record? This cannot be undone.")) {
                              onDestroy(record.record_id, true);
                            }
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Permanently Destroy"
                      >
                        <Icons.Destroy />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default RecordTable;