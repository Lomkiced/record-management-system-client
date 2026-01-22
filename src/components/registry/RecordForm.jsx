import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useCodex } from '../../context/CodexContext';
import { useRegions } from '../../context/RegionContext';

const RecordForm = ({ onClose, onSave, initialData, targetRegion }) => {
  const { user } = useAuth();
  const { regions } = useRegions();
  const { categories, types } = useCodex();

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState(initialData || {
    title: '',
    category_id: '',
    type_name: '',
    status: 'Active',
    file: null,
    // New fields for logic
    retention_period: '',
    disposal_date: ''
  });

  const [uploadRegion, setUploadRegion] = useState(initialData?.region || targetRegion);

  // --- FILTERING ---
  const availableCategories = categories.filter(c =>
    c.region === 'Global' || c.region === uploadRegion
  );

  const availableTypes = formData.category_id
    ? types.filter(t => t.category_id == formData.category_id)
    : [];

  // --- SMART DATE CALCULATOR ---
  // Calculates disposal date based on a text rule (e.g. "5 Years", "30 Days", "2 Weeks")
  const calculateDisposal = (retentionString) => {
    if (!retentionString) return 'N/A';
    if (retentionString.toLowerCase().includes('permanent')) return 'Permanent';

    // Regex to find the first number in the string
    const valueMatch = retentionString.match(/(\d+)/);
    const value = valueMatch ? parseInt(valueMatch[0]) : 0;

    if (value === 0) return 'N/A';

    const futureDate = new Date();
    const lowerStr = retentionString.toLowerCase();

    if (lowerStr.includes('day')) {
      futureDate.setDate(futureDate.getDate() + value);
    } else if (lowerStr.includes('week')) {
      futureDate.setDate(futureDate.getDate() + (value * 7));
    } else if (lowerStr.includes('month')) {
      futureDate.setMonth(futureDate.getMonth() + value);
    } else if (lowerStr.includes('year')) {
      futureDate.setFullYear(futureDate.getFullYear() + value);
    } else {
      // Default to years if no unit specified
      futureDate.setFullYear(futureDate.getFullYear() + value);
    }

    return futureDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // --- HANDLERS ---

  // When Document Type changes, find the rule and auto-calculate dates
  const handleTypeChange = (e) => {
    const selectedTypeName = e.target.value;
    const rule = types.find(t => t.type_name === selectedTypeName);

    const period = rule ? rule.retention_period : '';
    const disposal = calculateDisposal(period);

    setFormData(prev => ({
      ...prev,
      type_name: selectedTypeName,
      retention_period: period,
      disposal_date: disposal
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Compliance Alert: Only .pdf files are accepted in the Registry.');
        e.target.value = null;
        return;
      }
      setFormData({ ...formData, file: file });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const catName = categories.find(c => c.category_id == formData.category_id)?.name || 'Uncategorized';

    onSave({
      ...formData,
      category: catName,
      region: uploadRegion,
      upload_date: new Date().toISOString().split('T')[0] // Timestamp the upload
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {initialData ? 'Edit Record' : 'Upload Document'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Secure Document Registry</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Region Selection (Super Admin) */}
          {user.role === 'SUPER_ADMIN' ? (
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1 tracking-wide">
                Destination Region (Upload Target)
              </label>
              <select
                className="w-full bg-white border border-blue-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none block p-2"
                value={uploadRegion}
                onChange={(e) => {
                  setUploadRegion(e.target.value);
                  setFormData(prev => ({ ...prev, category_id: '', type_name: '', disposal_date: '' }));
                }}
              >
                <option value="Central Office">Central Office</option>
                {regions.map(r => (
                  <option key={r.id} value={r.name}>{r.name} ({r.code})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Uploading to:</span>
              <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                {uploadRegion}
              </span>
            </div>
          )}

          {/* Document Title */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Document Title</label>
            <input
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 2025 Annual Budget Plan"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Classification */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Classification</label>
              <select
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value, type_name: '', disposal_date: '' })}
              >
                <option value="">-- Select --</option>
                {availableCategories.map(c => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Type (Triggers Calculation) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Document Type</label>
              <select
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-300"
                value={formData.type_name}
                onChange={handleTypeChange} // <--- CALLS SMART CALCULATOR
                disabled={!formData.category_id}
              >
                <option value="">-- Select --</option>
                {availableTypes.map(t => (
                  <option key={t.type_id} value={t.type_name}>{t.type_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* --- LIVE RETENTION PREVIEW (New Feature) --- */}
          {formData.type_name && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center text-xs">
              <div>
                <span className="block text-gray-400 uppercase font-bold text-[10px]">Retention Rule</span>
                <span className="font-medium text-gray-700">{formData.retention_period || 'N/A'}</span>
              </div>
              <div className="text-right">
                <span className="block text-gray-400 uppercase font-bold text-[10px]">Scheduled Disposal</span>
                <span className={`font-bold ${formData.disposal_date === 'Permanent' ? 'text-indigo-600' : 'text-red-600'}`}>
                  {formData.disposal_date || 'Calculated on save'}
                </span>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 hover:border-blue-400 transition-all group">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              required={!initialData}
            />
            <div className="flex flex-col items-center pointer-events-none">
              <span className="text-xl mb-1">📄</span>
              <p className="text-sm font-bold text-gray-700 truncate max-w-[200px]">
                {formData.file ? formData.file.name : 'Click to Upload Document'}
              </p>
              <p className="text-[10px] text-gray-400">PDF Files Only</p>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold text-sm transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-blue-700 font-bold text-sm shadow-lg shadow-blue-200 transition-all transform active:scale-95">
              {initialData ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordForm;