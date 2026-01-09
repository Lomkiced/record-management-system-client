import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// --- HELPER: FORMAT BYTES ---
const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const RecordModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // DATA SOURCES
  const [regions, setRegions] = useState([]);
  const [codexCategories, setCodexCategories] = useState([]); 
  const [codexTypes, setCodexTypes] = useState([]); 
  const [availableTypes, setAvailableTypes] = useState([]);

  // FORM STATE
  const [formData, setFormData] = useState({
    title: '',
    region_id: '',
    category_name: '',
    classification_rule: '',
    retention_period: '',
    file: null
  });

  useEffect(() => {
    if (isOpen) {
        setFormData({
            title: '',
            region_id: user.role === 'SUPER_ADMIN' ? '' : user.region_id,
            category_name: '',
            classification_rule: '',
            retention_period: '',
            file: null
        });
        setUploadProgress(0);

        const fetchData = async () => {
            const token = localStorage.getItem('dost_token');
            const headers = { 'Authorization': `Bearer ${token}` };
            try {
                const [reg, cat, typ] = await Promise.all([
                    fetch('http://localhost:5000/api/regions', { headers }),
                    fetch('http://localhost:5000/api/codex/categories', { headers }),
                    fetch('http://localhost:5000/api/codex/types', { headers })
                ]);
                if (reg.ok) setRegions(await reg.json());
                if (cat.ok) setCodexCategories(await cat.json());
                if (typ.ok) setCodexTypes(await typ.json());
            } catch(e) { console.error(e); }
        };
        fetchData();
    }
  }, [isOpen, user]);

  // --- DRAG & DROP ---
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // --- STRICT PDF VALIDATION ---
  const validateAndSetFile = (file) => {
    // 1. Check MIME Type
    if (file.type !== 'application/pdf') {
        alert("Invalid File Format. Please upload a PDF document.");
        return;
    }
    
    // 2. Double Check Extension (Edge case safety)
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert("Invalid File Extension. Only .pdf files are allowed.");
        return;
    }

    // Auto-fill title
    const cleanTitle = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    setFormData(prev => ({
        ...prev, 
        file: file,
        title: prev.title || cleanTitle
    }));
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    const catObj = codexCategories.find(c => c.name === val);
    setFormData(p => ({ ...p, category_name: val, classification_rule: '', retention_period: '' }));
    if (catObj) {
        setAvailableTypes(codexTypes.filter(t => t.category_id === catObj.category_id));
    } else {
        setAvailableTypes([]);
    }
  };

  const handleClassificationChange = (e) => {
    const val = e.target.value;
    const rule = availableTypes.find(t => t.type_name === val);
    setFormData(p => ({ ...p, classification_rule: val, retention_period: rule ? (rule.retention_period || 'Permanent') : 'Permanent' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 90) progress = 90;
        setUploadProgress(progress);
    }, 200);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    try {
        const token = localStorage.getItem('dost_token');
        const res = await fetch('http://localhost:5000/api/records', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: data
        });

        clearInterval(interval);
        setUploadProgress(100);

        if (res.ok) {
            setTimeout(() => { onSuccess(); onClose(); }, 500);
        } else {
            const err = await res.json();
            alert(err.message || "Upload failed.");
            setUploadProgress(0);
        }
    } catch (err) { 
        console.error(err); 
        alert("Network Error");
    } finally { 
        setLoading(false); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-zoom-in border border-white/20">
         
         <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
            <div>
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Archive Document</h2>
                <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">PDF Only Repository</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                {/* PDF Icon */}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* DRAG & DROP ZONE - PDF RESTRICTED */}
            <div 
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 group cursor-pointer
                ${isDragging ? 'border-red-500 bg-red-50/50 scale-[1.02]' : 'border-slate-300 hover:border-red-400 hover:bg-red-50/10'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input 
                    type="file" 
                    required 
                    accept=".pdf,application/pdf" // Browser Filter
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => e.target.files.length > 0 && validateAndSetFile(e.target.files[0])}
                />
                
                {formData.file ? (
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{formData.file.name}</p>
                            <p className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">{formatBytes(formData.file.size)}</p>
                        </div>
                        <button type="button" onClick={(e) => {e.preventDefault(); setFormData({...formData, file: null})}} className="z-20 p-2 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2 pointer-events-none">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform group-hover:bg-red-50 group-hover:text-red-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </div>
                        <p className="text-sm font-bold text-slate-700">Click to upload PDF <span className="text-slate-400 font-medium">or drag here</span></p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">PDF Files Only (Max 25MB)</p>
                    </div>
                )}
            </div>

            {/* DOCUMENT DETAILS */}
            <div className="space-y-4">
                <div className="relative group">
                    <input 
                        required 
                        className="peer w-full px-4 pt-3 pb-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-transparent"
                        placeholder="Title"
                        id="docTitle"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                    <label htmlFor="docTitle" className="absolute left-4 -top-2.5 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-indigo-600 transition-all cursor-text">Document Title</label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <select required disabled={user.role !== 'SUPER_ADMIN'} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-400" value={formData.region_id} onChange={e => setFormData({...formData, region_id: e.target.value})}>
                         {user.role !== 'SUPER_ADMIN' && <option value={user.region_id}>My Region</option>}
                         {user.role === 'SUPER_ADMIN' && (
                             <>
                                 <option value="">Select Region...</option>
                                 {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                             </>
                         )}
                     </select>
                     
                     <select required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium bg-white outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.category_name} onChange={handleCategoryChange}>
                         <option value="">Select Category...</option>
                         {codexCategories.map(c => <option key={c.category_id} value={c.name}>{c.name}</option>)}
                     </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="relative">
                        <select required disabled={!formData.category_name} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:cursor-not-allowed" value={formData.classification_rule} onChange={handleClassificationChange}>
                            <option value="">Classification...</option>
                            {availableTypes.map(t => <option key={t.type_id} value={t.type_name}>{t.type_name}</option>)}
                        </select>
                     </div>

                     <div className="relative">
                        <input readOnly value={formData.retention_period || '-'} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 outline-none cursor-not-allowed" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Retention</span>
                     </div>
                </div>
            </div>

            {loading && (
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                </div>
            )}

            <div className="pt-2 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors">Cancel</button>
                <button 
                    type="submit" 
                    disabled={loading || !formData.file}
                    className={`flex-1 py-3.5 text-sm font-bold text-white rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2
                    ${loading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'}`}
                >
                    {loading ? (
                        <>Processing {Math.round(uploadProgress)}%</>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Confirm Upload
                        </>
                    )}
                </button>
            </div>
         </form>
      </div>
    </div>
  );
};

export default RecordModal;