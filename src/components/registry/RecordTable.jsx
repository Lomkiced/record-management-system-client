
// --- EXPANDED ICON SET ---
const Icons = {
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Archive: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Restore: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Destroy: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
};

const RecordTable = ({ records, onEdit, onArchive, onRestore, onDestroy, onView, viewMode }) => {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p>No records found in this view.</p>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    if (status === 'Archived') return 'bg-gray-100 text-gray-600 border-gray-200';
    if (status === 'Active') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-gray-50/50 sticky top-0 backdrop-blur-sm z-10 text-xs uppercase text-gray-500 font-semibold tracking-wider">
        <tr className="border-b border-gray-100">
          <th className="px-6 py-4">Ref ID / Title</th>
          <th className="px-6 py-4">Classification</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4">Disposal Date</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {records.map((record) => (
          <tr key={record.id} className="hover:bg-blue-50/50 transition-colors group">
            <td className="px-6 py-4">
                <div className="font-bold text-gray-800 text-sm">{record.title}</div>
                <div className="font-mono text-xs text-gray-400">{record.id}</div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-700">{record.category}</div>
                <div className="text-xs text-gray-500">{record.type_name}</div>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusStyle(record.status)}`}>
                {record.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                {record.disposal_date || 'N/A'}
            </td>
            
            {/* --- ACTIONS COLUMN --- */}
            <td className="px-6 py-4 text-right">
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                
                {/* GLOBAL: View Button */}
                <button 
                  onClick={() => onView(record)} 
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                  title="View File"
                >
                    <Icons.Eye />
                </button>
                
                {/* ACTIVE MODE BUTTONS */}
                {viewMode === 'Active' && (
                    <>
                        <button onClick={() => onEdit(record)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Metadata">
                            <Icons.Edit />
                        </button>
                        <button onClick={() => onArchive(record.id)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Archive Record">
                            <Icons.Archive />
                        </button>
                    </>
                )}

                {/* ARCHIVED MODE BUTTONS */}
                {viewMode === 'Archived' && (
                    <>
                        <button 
                          onClick={() => onRestore(record.id)} 
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                          title="Restore to Registry"
                        >
                            <Icons.Restore />
                        </button>
                        <button 
                          onClick={() => onDestroy(record.id)} 
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Permanently Destroy"
                        >
                            <Icons.Destroy />
                        </button>
                    </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RecordTable;