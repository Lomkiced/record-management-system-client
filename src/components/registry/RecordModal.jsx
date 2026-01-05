import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useCodex } from '../../context/CodexContext';
import { useRegions } from '../../context/RegionContext';

// --- CONFIGURATION ---
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// --- ICONS ---
const Icons = {
  CloudUpload: () => <svg className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3.75m-3-3.75l-3 3.75M12 9.75V4.5m0 12.75c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Pdf: () => <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path fillOpacity=".5" d="M14 2v6h6" /></svg>,
  X: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
  Spinner: () => <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
  Scale: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Book: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
};

const RecordModal = ({ isOpen, onClose, onSuccess, preSelectedCategory, preSelectedRegion, recordToEdit }) => {
  const { regions } = useRegions();
  const { categories, types } = useCodex();

  // --- FORM STATE ---
  const [title, setTitle] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRuleName, setSelectedRuleName] = useState('');
  const [file, setFile] = useState(null);
  
  // --- INTELLIGENCE STATE ---
  const [codexRule, setCodexRule] = useState(null); 
  
  // --- UI STATE ---
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- INITIALIZER ---
  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        setTitle(recordToEdit.title);
        setSelectedRegionId(recordToEdit.region_id);
        setSelectedCategory(recordToEdit.category);
        setSelectedRuleName(recordToEdit.classification_rule || '');
      } else {
        setTitle('');
        setFile(null);
        setError('');
        setCodexRule(null);
        setSelectedRuleName('');
        if (preSelectedRegion) setSelectedRegionId(preSelectedRegion.id);
        if (preSelectedCategory) setSelectedCategory(preSelectedCategory.name);
      }
    }
  }, [isOpen, preSelectedRegion, preSelectedCategory, recordToEdit]);

  const formatBytes = (bytes) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${['Bytes', 'KB', 'MB', 'GB'][i]}`;
  };

  // --- FILTERING LOGIC ---
  const filteredCategories = categories.filter(cat => {
    if (!selectedRegionId) return false; 
    const currentRegion = regions.find(r => r.id == selectedRegionId);
    if (!currentRegion) return cat.region === 'Global';
    return (cat.region === currentRegion.name) || (cat.region === 'Global');
  });

  const filteredRules = types.filter(t => {
     if (!selectedCategory) return false;
     const catObj = categories.find(c => c.name === selectedCategory);
     if (!catObj) return false;
     return t.category_id === catObj.category_id;
  });

  // --- INTELLIGENCE LOGIC ---
  useEffect(() => {
    if (selectedRuleName) {
        const ruleMatch = types.find(t => t.type_name === selectedRuleName);
        if (ruleMatch) {
            const retentionYears = parseInt(ruleMatch.retention_period) || 0;
            const isPermanent = ruleMatch.retention_period?.toString().toLowerCase().includes('perm');
            
            const now = new Date();
            const disposalDate = new Date(now.setFullYear(now.getFullYear() + retentionYears));
            
            setCodexRule({
                ruleName: ruleMatch.type_name,
                retentionText: isPermanent ? 'PERMANENT' : `${retentionYears} Years`,
                disposalDate: isPermanent ? 'Never' : disposalDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                description: ruleMatch.description || `Standard ${selectedCategory} compliance rule.`,
                color: isPermanent ? 'text-indigo-400' : (retentionYears < 5 ? 'text-amber-400' : 'text-emerald-400')
            });
        }
    } else {
        setCodexRule(null);
    }
  }, [selectedRuleName, types, selectedCategory]);

  // --- FILE HANDLERS ---
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); validateAndSetFile(e.dataTransfer.files[0]); };
  const handleFileSelect = (e) => { validateAndSetFile(e.target.files[0]); };

  const validateAndSetFile = (fileItem) => {
    if (!fileItem) return;
    if (fileItem.type !== 'application/pdf') { setError('Only PDF files are allowed.'); return; }
    if (fileItem.size > MAX_FILE_BYTES) { setError(`File is too large. Max ${MAX_FILE_SIZE_MB}MB.`); return; }
    setError(''); setFile(fileItem);
    if (!title) setTitle(fileItem.name.replace('.pdf', '').replace(/_/g, ' '));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!title || !selectedRegionId || !selectedCategory || !selectedRuleName || (!file && !recordToEdit)) {
        setError('Please complete all classification fields.');
        setIsLoading(false);
        return;
    }

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('region_id', selectedRegionId);
        formData.append('category_name', selectedCategory); 
        formData.append('classification_rule', selectedRuleName); 
        if (file) formData.append('file', file);

        // --- ⚡ CRITICAL FIX: CORRECT URL ENDPOINT ⚡ ---
        const url = recordToEdit 
            ? `http://localhost:5000/api/records/${recordToEdit.record_id}`
            : 'http://localhost:5000/api/records'; // Removed '/upload' to match backend routes
        
        const method = recordToEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('dost_token')}` },
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Upload failed');
        }
        onSuccess();
    } catch (err) {
        setError(err.message || 'Server Error');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isLoading && onClose()}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95 translate-y-4" enterTo="opacity-100 scale-100 translate-y-0" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100 translate-y-0" leaveTo="opacity-0 scale-95 translate-y-4">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-100">
                
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                    <div>
                        <Dialog.Title as="h3" className="text-lg font-bold text-slate-800">
                            {recordToEdit ? 'Edit Document' : 'Upload Document'}
                        </Dialog.Title>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Secure Digital Vault</p>
                    </div>
                    <button onClick={onClose} disabled={isLoading} className="text-slate-400 hover:text-slate-600 transition-colors"><Icons.X /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {!file && !recordToEdit && (
                        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                            <input type="file" accept="application/pdf" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="mb-2 p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300"><Icons.CloudUpload /></div>
                            <p className="text-sm font-bold text-slate-700">Click to upload PDF</p>
                        </div>
                    )}

                    {file && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Icons.Pdf />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                                    <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => {setFile(null); setTitle('');}} className="p-1 hover:bg-indigo-100 rounded-full text-indigo-400 hover:text-indigo-600"><Icons.X /></button>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Document Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="e.g. 2025 Financial Report" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">1. Region</label>
                                <select value={selectedRegionId} onChange={(e) => { setSelectedRegionId(e.target.value); setSelectedCategory(''); setSelectedRuleName(''); }} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none">
                                    <option value="">Select Region</option>
                                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">2. Classification Series</label>
                                <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedRuleName(''); }} disabled={!selectedRegionId} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-50">
                                    <option value="">Select Series</option>
                                    {filteredCategories.map(c => <option key={c.category_id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">3. Specific Document Type</label>
                             <select value={selectedRuleName} onChange={(e) => setSelectedRuleName(e.target.value)} disabled={!selectedCategory} className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-50 disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400">
                                <option value="">Select Document Rule</option>
                                {filteredRules.map(t => <option key={t.type_id} value={t.type_name}>{t.type_name} ({t.retention_period})</option>)}
                             </select>
                        </div>

                        {codexRule && (
                            <div className="animate-fade-in bg-slate-800 rounded-xl p-4 text-white border border-slate-700 shadow-lg relative overflow-hidden group">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                
                                <div className="flex items-start gap-3 relative z-10">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300"><Icons.Scale /></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Policy: {codexRule.ruleName}</h4>
                                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full"><Icons.Check /> VERIFIED</div>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-snug">{codexRule.description}</p>
                                        <div className="mt-3 flex gap-4 border-t border-slate-700/50 pt-3">
                                            <div>
                                                <span className="block text-[10px] text-slate-500 uppercase font-bold">Retention</span>
                                                <span className={`text-sm font-bold flex items-center gap-1 ${codexRule.color}`}><Icons.Book /> {codexRule.retentionText}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] text-slate-500 uppercase font-bold">Disposal Date</span>
                                                <span className="text-sm font-bold text-slate-200 flex items-center gap-1"><Icons.Clock /> {codexRule.disposalDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{error}</div>}

                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70">
                            {isLoading ? <><Icons.Spinner /> Processing...</> : <><Icons.Check /> Save Record</>}
                        </button>
                    </div>

                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RecordModal;