
const ViewRecordModal = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${record.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                {record.status}
              </span>
              <span className="text-xs font-mono text-gray-400">{record.id}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 leading-tight">{record.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 bg-white hover:bg-gray-100 rounded-full border border-transparent hover:border-gray-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">

          {/* 1. File Preview Stub */}
          <div className="bg-slate-900 rounded-xl p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 flex flex-col items-center justify-center py-8">
              <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="text-slate-400 font-medium">PDF Preview Unavailable</p>
              <p className="text-slate-600 text-xs mt-1">File is secure or offline</p>
              <button className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
                Download Document
              </button>
            </div>
          </div>

          {/* 2. Metadata Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Classification</p>
              <p className="text-sm font-medium text-gray-800">{record.category}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Document Type</p>
              <p className="text-sm font-medium text-gray-800">{record.type_name || record.classification_rule || record.file_type || 'General Record'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Origin Region</p>
              <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {record.region_name || record.region || 'Unknown Region'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lifecycle Status</p>
              <p className="text-sm font-medium text-indigo-600">
                {record.disposal_date ? `Retain until ${record.disposal_date}` : 'Permanent Retention'}
              </p>
            </div>

            {/* NEW ATTRIBUTES */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Records Medium</p>
              <p className="text-sm font-medium text-gray-800">{record.media_text || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Restrictions</p>
              <p className="text-sm font-medium text-gray-800">
                {record.restriction_text ? (
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${record.restriction_text.toLowerCase().includes('restricted') || record.restriction_text.toLowerCase().includes('confidential') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                    {record.restriction_text}
                  </span>
                ) : 'None'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Frequency of Use</p>
              <p className="text-sm font-medium text-gray-800">{record.frequency_text || 'Unspecified'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Disposition Provision</p>
              <p className="text-sm font-medium text-gray-800">{record.provision_text || 'N/A'}</p>
            </div>
          </div>

          {/* 3. Audit Trail Stub */}
          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Recent Activity</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-col items-center hidden sm:flex">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5"></div>
                  <div className="w-px h-full bg-gray-200 my-1"></div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900">Document Uploaded</p>
                  <p className="text-[10px] text-gray-500">by Director Santos • {record.date}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm">
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRecordModal;