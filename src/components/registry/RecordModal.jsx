import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useOffices } from '../../context/OfficeContext';
import { getShelves } from '../../services/endpoints/api';
import { formatRetention, parseRetention } from '../../utils/retentionUtils';

// --- HELPER: FORMAT BYTES ---
const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const RecordModal = ({ isOpen, onClose, onSuccess, recordToEdit, currentRegion, currentOffice, currentSubOffice, currentCategory }) => {
    // ... (existing hooks) ...

    // HELPER: Fix Grammar (1 Year vs 2 Years) - REMOVED (Using Utility)

    // ... (state definitions) ...

    const { user } = useAuth();
    const { getOfficesByRegion, getSubOffices } = useOffices();
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // DATA SOURCES
    const [regions, setRegions] = useState([]);
    const [offices, setOffices] = useState([]); // Parent Offices
    const [subOffices, setSubOffices] = useState([]); // Sub-Units
    const [codexCategories, setCodexCategories] = useState([]);
    const [codexTypes, setCodexTypes] = useState([]);
    const [availableTypes, setAvailableTypes] = useState([]);
    const [availableShelves, setAvailableShelves] = useState([]);
    const [showShelfSuggestions, setShowShelfSuggestions] = useState(false);

    // FORM STATE
    const [formData, setFormData] = useState({
        title: '',
        region_id: '',
        office_id: '', // This holds the FINAL selected office (Parent or Sub)
        category_name: '',
        classification_rule: '',
        shelf: '',
        retention_period: '',
        file: null,

        is_restricted: false,
        period_covered: '',
        volume: '',
        duplication: '',
        time_value: 'P',
        utility_value: 'Adm'
    });

    // Separated state for dropdowns
    const [selectedParentOffice, setSelectedParentOffice] = useState('');
    const [selectedSubOffice, setSelectedSubOffice] = useState('');

    const isEditMode = !!recordToEdit;

    // 1. INITIALIZE DATA & FORM
    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                const token = localStorage.getItem('dost_token');
                const headers = { 'Authorization': `Bearer ${token}` };
                try {
                    const [reg, cat, typ] = await Promise.all([
                        fetch('/api/regions', { headers }),
                        fetch('/api/codex/categories', { headers }),
                        fetch('/api/codex/types', { headers })
                    ]);

                    const categoriesData = await cat.json();
                    const typesData = await typ.json();
                    const regionsData = await reg.json();

                    if (reg.ok) setRegions(regionsData);
                    if (cat.ok) setCodexCategories(categoriesData);
                    if (typ.ok) setCodexTypes(typesData);

                    // --- B. EDIT MODE ---
                    if (recordToEdit) {
                        setFormData({
                            title: recordToEdit.title || '',
                            region_id: recordToEdit.region_id || '',
                            office_id: recordToEdit.office_id || '',
                            category_name: recordToEdit.category || '',
                            classification_rule: recordToEdit.classification_rule || '',
                            shelf: recordToEdit.shelf || '',
                            retention_period: recordToEdit.retention_period || '',
                            file: null,
                            is_restricted: recordToEdit.is_restricted || false,
                            period_covered: recordToEdit.period_covered || '',
                            volume: recordToEdit.volume || '',
                            duplication: recordToEdit.duplication || '',
                            time_value: recordToEdit.time_value || 'P',
                            utility_value: recordToEdit.utility_value || 'Adm'
                        });

                        // Populate Offices
                        if (recordToEdit.region_id) {
                            const officeData = await getOfficesByRegion(recordToEdit.region_id);
                            setOffices(officeData);
                        }

                        // Determine Parent/Sub Office Logic for Edit
                        if (recordToEdit.office_id) {
                            // Fetch specific office details to check if it has a parent
                            const res = await fetch(`/api/offices/${recordToEdit.office_id}`, { headers });
                            const output = await res.json();

                            if (output.parent_id) {
                                // It's a sub-office
                                setSelectedParentOffice(output.parent_id);
                                setSelectedSubOffice(output.office_id);
                                // Load sub-offices logic for this parent
                                const subs = await getSubOffices(output.parent_id);
                                setSubOffices(subs);
                            } else {
                                // It's a top-level office
                                setSelectedParentOffice(output.office_id);
                                setSelectedSubOffice('');
                                // Check if it HAS sub-offices (to populate dropdown if user wants to change)
                                const subs = await getSubOffices(output.office_id);
                                setSubOffices(subs);
                            }
                        }

                        const catObj = categoriesData.find(c => c.name === recordToEdit.category);
                        if (catObj) setAvailableTypes(typesData.filter(t => t.category_id === catObj.category_id));
                    } else {
                        const initialRegion = currentRegion?.id || user.region_id || '';
                        const initParent = currentOffice?.office_id || '';
                        const initSub = currentSubOffice?.office_id || '';

                        setFormData({
                            title: '',
                            region_id: initialRegion,
                            office_id: initSub || initParent || '',
                            category_name: currentCategory?.name || '',
                            classification_rule: '',
                            shelf: '',
                            retention_period: '',
                            file: null,
                            is_restricted: false,
                            period_covered: '',
                            volume: '',
                            duplication: '',
                            time_value: '',
                            utility_value: ''
                        });
                        setUploadProgress(0);
                        setSelectedParentOffice(initParent);
                        setSelectedSubOffice(initSub);

                        // Auto-load offices if region is known
                        if (initialRegion) {
                            const officeData = await getOfficesByRegion(initialRegion);
                            setOffices(officeData);
                        }

                        // Auto-load sub-offices if parent is known
                        if (initParent) {
                            const subs = await getSubOffices(initParent);
                            setSubOffices(subs);
                        }

                        // Auto-filter types if category is known
                        if (currentCategory?.name) {
                            const catObj = categoriesData.find(c => c.name === currentCategory.name);
                            if (catObj) setAvailableTypes(typesData.filter(t => t.category_id === catObj.category_id));
                        }
                    }

                } catch (e) { console.error("Modal Init Error:", e); }
            };
            fetchData();
        }
    }, [isOpen, recordToEdit, user, currentRegion, currentOffice, currentSubOffice, currentCategory]);



    // Handle Region Change -> Load Offices
    const handleRegionChange = async (e) => {
        const regId = e.target.value;
        setFormData(p => ({ ...p, region_id: regId, office_id: '' }));
        setSelectedParentOffice('');
        setSelectedSubOffice('');
        setSubOffices([]);
        setOffices([]); // Clear immediately

        if (regId) {
            try {
                const officeData = await getOfficesByRegion(regId);
                setOffices(officeData);
                if (officeData.length === 0) {
                    toast.info("No offices in this province. You can still upload records.");
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load offices.");
            }
        }
    };

    // Handle Parent Office Change -> Load Sub-Offices
    const handleParentOfficeChange = async (e) => {
        const pId = e.target.value;
        setSelectedParentOffice(pId);
        setSelectedSubOffice('');

        // Default office_id is the parent (until a sub is selected)
        setFormData(p => ({ ...p, office_id: pId }));

        if (pId) {
            const subs = await getSubOffices(pId);
            setSubOffices(subs);
        } else {
            setSubOffices([]);
        }
    };

    // Handle Sub-Office Change
    const handleSubOfficeChange = (e) => {
        const sId = e.target.value;
        setSelectedSubOffice(sId);
        // If sub-office selected, that is the office_id. If cleared, fallback to parent.
        setFormData(p => ({ ...p, office_id: sId || selectedParentOffice }));
    };

    // 2. DYNAMIC FILTERS
    const handleCategoryChange = (e) => {
        const val = e.target.value;
        const catObj = codexCategories.find(c => c.name === val);

        setFormData(p => ({
            ...p,
            category_name: val,
            classification_rule: '',
            retention_period: ''
        }));

        if (catObj) {
            setAvailableTypes(codexTypes.filter(t => t.category_id === catObj.category_id));
        } else {
            setAvailableTypes([]);
        }
    };

    const handleClassificationChange = (e) => {
        const val = e.target.value;
        const rule = availableTypes.find(t => t.type_name === val);
        setFormData(p => ({
            ...p,
            classification_rule: val,
            retention_period: rule ? formatRetention(parseRetention(rule.retention_period).value, parseRetention(rule.retention_period).unit) : 'Permanent'
        }));
    };

    // 3. FETCH SHELVES DYNAMICALLY
    // 3. FETCH SHELVES DYNAMICALLY
    useEffect(() => {
        // Now allows fetching if office_id is empty (for Province/Region level shelves)
        if (formData.region_id && formData.category_name) {
            getShelves({
                region_id: formData.region_id,
                office_id: formData.office_id || '', // Send empty string if null
                category: formData.category_name,
                restricted_only: formData.is_restricted // Filter by Vault Status
            })
                .then(shelves => setAvailableShelves(shelves || []))
                .catch(console.error);
        } else {
            setAvailableShelves([]);
        }
    }, [formData.region_id, formData.office_id, formData.category_name, formData.is_restricted, isOpen]);

    // --- DRAG & DROP ---
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isEditMode && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };
    const validateAndSetFile = (file) => {
        if (file.type !== 'application/pdf') return toast.error("Invalid Format. PDF only.");
        const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({ ...prev, file: file, title: prev.title || cleanTitle }));
    };

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- STRICT VALIDATION ---

        // 1. File Check
        if (!isEditMode && !formData.file) return toast.error("Please select a file.");

        // 2. Location Check
        if (!formData.region_id) return toast.error("Please select a Province.");

        // 3. Office/Unit Logic (Office is OPTIONAL - allows upload when province has no offices)
        // If the selected parent has sub-offices, ensure one is selected
        if (selectedParentOffice && subOffices.length > 0 && !selectedSubOffice) {
            return toast.error("Please select a specific Unit/Section.");
        }

        // 4. Metadata Completeness
        const requiredFields = [
            { key: 'category_name', label: 'Category' },
            { key: 'classification_rule', label: 'Description/Type' },
            { key: 'shelf', label: 'Shelf' },
            { key: 'period_covered', label: 'Period Covered' },
            { key: 'volume', label: 'Volume' },
            { key: 'duplication', label: 'Duplication' }
        ];

        for (const field of requiredFields) {
            if (!formData[field.key]) return toast.error(`Please fill in ${field.label}.`);
        }

        setLoading(true);

        // Simulate Progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress > 90) progress = 90;
            setUploadProgress(progress);
        }, 100);

        try {
            const token = localStorage.getItem('dost_token');
            const headers = { 'Authorization': `Bearer ${token}` };
            let res;

            if (isEditMode) {
                res = await fetch(`/api/records/${recordToEdit.record_id}`, {
                    method: 'PUT',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: formData.title,
                        region_id: formData.region_id,
                        office_id: formData.office_id,
                        category_name: formData.category_name,
                        classification_rule: formData.classification_rule,
                        shelf: formData.shelf,

                        retention_period: formData.retention_period,
                        period_covered: formData.period_covered,
                        volume: formData.volume,
                        duplication: formData.duplication,
                        time_value: formData.time_value,
                        utility_value: formData.utility_value
                    })
                });
            } else {
                const data = new FormData();
                Object.keys(formData).forEach(key => data.append(key, formData[key]));
                res = await fetch('/api/records', {
                    method: 'POST',
                    headers: headers,
                    body: data
                });
            }

            clearInterval(interval);
            setUploadProgress(100);

            if (res.ok) {
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    // Professional Feedack: Explain visibility
                    if (formData.is_restricted) {
                        toast.success("Secure Upload Complete", { description: "File saved to Restricted Vault. Switch to Vault View to access." });
                    } else {
                        toast.success(isEditMode ? 'Record updated successfully' : 'File uploaded successfully');
                    }
                }, 500);
            } else {
                // ROBUST ERROR HANDLING (Handles Nginx 413 HTML responses)
                const contentType = res.headers.get("content-type");
                let errorMessage = "Operation failed";

                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const err = await res.json();
                    errorMessage = err.message || errorMessage;
                } else {
                    const text = await res.text();
                    if (res.status === 413) errorMessage = "File too large (Limit: 50MB)";
                    else if (res.status === 502) errorMessage = "Server unavailable (502)";
                    else errorMessage = `Server Error (${res.status})`;
                    console.error("Non-JSON Error:", text);
                }

                toast.error(errorMessage);
                setUploadProgress(0);
            }
        } catch (err) {
            console.error(err);
            toast.error("Network Error: Unable to reach server.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[85vh] animate-zoom-in border border-white/20">

                {/* HEADER */}
                <div className="flex-none px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{isEditMode ? 'Edit Metadata' : 'Add Document'}</h2>
                        <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{isEditMode ? 'Update record details' : 'Secure PDF Repository'}</p>
                    </div>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto min-h-0 relative custom-scrollbar">
                    <form id="record-form" onSubmit={handleSubmit} className="p-8 space-y-6">

                        {/* 1. METADATA FIELDS */}
                        <div className="space-y-4">
                            {/* TITLE */}
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Document Title</label>
                                <input required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal" placeholder="Ex. Division Memorandum No. 123" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                <p className="text-[10px] text-slate-400 mt-1 ml-1 text-right">Visible in search results</p>
                            </div>

                            {/* HIERARCHY */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Province</label>
                                    <div className="relative">
                                        <select required disabled={user.role !== 'SUPER_ADMIN'} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 appearance-none" value={formData.region_id} onChange={handleRegionChange}>
                                            {user.role !== 'SUPER_ADMIN' && <option value={user.region_id}>My Province</option>}
                                            {user.role === 'SUPER_ADMIN' && (
                                                <>
                                                    <option value="">Select Province...</option>
                                                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </>
                                            )}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Office / Division <span className="text-slate-300">(Optional)</span></label>
                                        <div className="relative">
                                            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 appearance-none disabled:text-slate-400" value={selectedParentOffice} onChange={handleParentOfficeChange} disabled={!formData.region_id || (offices.length === 0 && !!formData.region_id)}>
                                                <option value="">
                                                    {formData.region_id && offices.length === 0 ? 'None (Province Only)' : 'Select Office...'}
                                                </option>
                                                {offices.map(o => <option key={o.office_id} value={o.office_id}>{o.code}</option>)}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Unit / Section</label>
                                        <div className="relative">
                                            <select
                                                disabled={!selectedParentOffice || subOffices.length === 0}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-400 appearance-none bg-indigo-50/10"
                                                value={selectedSubOffice}
                                                onChange={handleSubOfficeChange}
                                            >
                                                <option value="">{subOffices.length > 0 ? 'Select Unit...' : 'No Sub-Units'}</option>
                                                {subOffices.map(s => <option key={s.office_id} value={s.office_id}>{s.code} - {s.name}</option>)}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CLASSIFICATION */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Records Series Title</label>
                                    <div className="relative">
                                        <select required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none" value={formData.category_name} onChange={handleCategoryChange}>
                                            <option value="">Select Category...</option>
                                            {codexCategories.map(c => <option key={c.category_id} value={c.name}>{c.name}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Description</label>
                                    <div className="relative">
                                        <select required disabled={!formData.category_name} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 appearance-none" value={formData.classification_rule} onChange={handleClassificationChange}>
                                            <option value="">Select Type...</option>
                                            {availableTypes.map(t => <option key={t.type_id} value={t.type_name}>{t.type_name}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="group relative">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Location of Records</label>
                                    <div className="relative">
                                        <input
                                            className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                                            placeholder="Type or select shelf..."
                                            value={formData.shelf}
                                            onChange={(e) => {
                                                setFormData({ ...formData, shelf: e.target.value });
                                                setShowShelfSuggestions(true);
                                            }}
                                            onFocus={() => setShowShelfSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowShelfSuggestions(false), 200)}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>

                                        {/* SUGGESTIONS DROPDOWN */}
                                        {showShelfSuggestions && (
                                            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-30 animate-fade-in divide-y divide-slate-50">
                                                {availableShelves.filter(s => s && s.toLowerCase().includes(formData.shelf.toLowerCase())).map((shelf, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onMouseDown={(e) => e.preventDefault()} // Prevent blur
                                                        onClick={() => {
                                                            setFormData({ ...formData, shelf: shelf });
                                                            setShowShelfSuggestions(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                                                    >
                                                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs shrink-0">🗄️</span>
                                                        {shelf}
                                                    </button>
                                                ))}
                                                {availableShelves.length === 0 && (
                                                    <div className="px-4 py-3 text-xs text-slate-400 italic text-center">No existing shelves in this category</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Retention Period</label>
                                    <div className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 flex items-center justify-between">
                                        <span>{formData.retention_period || 'Auto-calculated'}</span>
                                        <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-500">READ-ONLY</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. OTHER DETAILS */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Period Covered</label>
                                <input className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="e.g. 2023-2024" value={formData.period_covered} onChange={(e) => setFormData({ ...formData, period_covered: e.target.value })} />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Volume (cu. m)</label>
                                <input type="number" step="0.01" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="0.00" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Duplication</label>
                                <input className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="e.g. 3 Copies" value={formData.duplication} onChange={(e) => setFormData({ ...formData, duplication: e.target.value })} />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Time Value</label>
                                <select required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none" value={formData.time_value} onChange={(e) => setFormData({ ...formData, time_value: e.target.value })}>
                                    <option value="" disabled>Select...</option>
                                    <option value="T">Temporary</option>
                                    <option value="P">Permanent</option>
                                </select>
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Utility Value</label>
                                <select required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none" value={formData.utility_value} onChange={(e) => setFormData({ ...formData, utility_value: e.target.value })}>
                                    <option value="" disabled>Select...</option>
                                    <option value="Adm">Administrative</option>
                                    <option value="F">Fiscal</option>
                                    <option value="L">Legal</option>
                                    <option value="Arc">Archival</option>
                                </select>
                            </div>
                        </div>

                        {/* 3. FILE UPLOAD & RESTRICTION */}
                        <div className="space-y-4">
                            {/* DROP ZONE (MOVED HERE) */}
                            {!isEditMode || formData.replaceFile ? (
                                <div
                                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 group cursor-pointer
                                    ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
                                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                >
                                    <input type="file" required={!isEditMode} accept=".pdf,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => e.target.files.length > 0 && validateAndSetFile(e.target.files[0])} />

                                    {formData.file ? (
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{formData.file.name}</p>
                                                <p className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">{formatBytes(formData.file.size)}</p>
                                            </div>
                                            <button type="button" onClick={(e) => { e.preventDefault(); setFormData({ ...formData, file: null }) }} className="z-20 p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 pointer-events-none">
                                            <div className="mx-auto w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                            </div>
                                            <p className="text-sm font-bold text-indigo-600">{isEditMode ? 'Click to replace file' : 'Click to upload PDF'}</p>
                                            {isEditMode && <button type="button" onClick={() => setFormData({ ...formData, replaceFile: false })} className="pointer-events-auto text-xs text-slate-400 underline hover:text-slate-600">Cancel Replace</button>}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between group hover:border-indigo-200 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg shrink-0">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-0.5">Current File</p>
                                            <a href={`/api/records/stream/${recordToEdit.file_path}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline truncate max-w-[200px] block" title="View File">
                                                {recordToEdit.file_path || `${recordToEdit.title}.pdf`}
                                            </a>
                                            <p className="text-[10px] font-medium text-slate-500 mt-0.5">{formatBytes(recordToEdit.file_size)} • {recordToEdit.file_type || 'PDF'}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, replaceFile: true })}
                                        className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
                                    >
                                        Replace
                                    </button>
                                </div>
                            )}

                            {!isEditMode && (
                                <div className={`p-4 rounded-xl border transition-all duration-300 ${formData.is_restricted ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg transition-colors ${formData.is_restricted ? 'bg-white text-red-600 shadow-sm' : 'bg-white text-slate-400'}`}>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${formData.is_restricted ? 'text-red-700' : 'text-slate-600'}`}>Restricted Access</p>
                                                <p className="text-[10px] text-slate-400">
                                                    {formData.is_restricted ? 'Protected by Global Master Password' : 'Public to authenticated users'}
                                                </p>
                                            </div>
                                        </div>

                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={formData.is_restricted} onChange={(e) => setFormData({ ...formData, is_restricted: e.target.checked })} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                        </label>
                                    </div>

                                    {formData.is_restricted && (
                                        <div className="mt-3 animate-fade-in text-xs text-red-600/80 font-medium px-1 flex gap-2">
                                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p>File will be encrypted and moved to the <strong>Restricted Vault</strong>.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex-none p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
                    {loading && <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-4"><div className={`h-1.5 rounded-full transition-all duration-300 ${isEditMode ? 'bg-amber-500' : 'bg-indigo-600'}`} style={{ width: `${uploadProgress}%` }}></div></div>}

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-xl transition-all">Cancel</button>
                        <button type="submit" form="record-form" disabled={loading} className={`flex-1 py-3.5 text-sm font-bold text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all ${isEditMode ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}>
                            {loading ? (isEditMode ? 'Saving Changes...' : 'Uploading File...') : (isEditMode ? 'Save Changes' : 'Confirm Upload')}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RecordModal;