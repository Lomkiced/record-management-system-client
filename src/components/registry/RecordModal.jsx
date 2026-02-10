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

const RecordModal = ({ isOpen, onClose, onSuccess, recordToEdit, currentRegion, currentOffice, currentSubOffice, currentCategory, isVaultMode = false }) => {
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
        utility_value: 'Adm',
        media_text: '',
        restriction_text: '',
        frequency_text: '',
        provision_text: ''
    });

    // Separated state for dropdowns
    const [selectedParentOffice, setSelectedParentOffice] = useState('');
    const [selectedSubOffice, setSelectedSubOffice] = useState('');

    // STAFF OFFICE LOCK STATE
    const isStaffUser = user?.role === 'STAFF';
    const [staffAssignments, setStaffAssignments] = useState({
        parentOfficeId: null,
        parentOfficeName: '',
        assignedUnitIds: [],
        isLoading: true
    });

    const isEditMode = !!recordToEdit;

    // STAFF ASSIGNMENT RESOLUTION EFFECT
    useEffect(() => {
        if (!isOpen || !isStaffUser || !user?.assigned_office_ids?.length) {
            setStaffAssignments({ parentOfficeId: null, parentOfficeName: '', assignedUnitIds: [], isLoading: false });
            return;
        }

        const resolveStaffAssignments = async () => {
            const token = localStorage.getItem('dost_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            let parentId = null;
            let parentName = '';
            const unitIds = [];

            for (const officeId of user.assigned_office_ids) {
                try {
                    const res = await fetch(`/api/offices/${officeId}`, { headers });
                    if (res.ok) {
                        const office = await res.json();
                        if (office.parent_id) {
                            // It's a sub-unit
                            parentId = office.parent_id;
                            parentName = office.parent_office_name || '';
                            unitIds.push(office.office_id);
                        } else {
                            // It's a parent office
                            parentId = office.office_id;
                            parentName = office.name || office.code || '';
                        }
                    }
                } catch (err) {
                    console.error('Error fetching office:', err);
                }
            }

            setStaffAssignments({ parentOfficeId: parentId, parentOfficeName: parentName, assignedUnitIds: unitIds, isLoading: false });
        };

        resolveStaffAssignments();
    }, [isOpen, isStaffUser, user?.assigned_office_ids]);

    // AUTO-SET STAFF PARENT OFFICE & FILTER SUB-OFFICES
    useEffect(() => {
        if (staffAssignments.isLoading || !staffAssignments.parentOfficeId || !isStaffUser || !isOpen) return;

        setSelectedParentOffice(staffAssignments.parentOfficeId);

        // Load and filter sub-offices for staff's parent
        getSubOffices(staffAssignments.parentOfficeId).then(subs => {
            let filteredSubs = subs;
            if (staffAssignments.assignedUnitIds.length > 0) {
                filteredSubs = subs.filter(s => staffAssignments.assignedUnitIds.includes(s.office_id));
            }
            setSubOffices(filteredSubs);

            // FIX: INTELLIGENT SELECTION LOGIC
            // If the current context (currentSubOffice) is valid, use it.
            // If only one sub-office is available, auto-select it.
            // Otherwise, keep Parent Office as default (or whatever was initialized)

            // Check if we are opening in a sub-office context that is valid for this staff
            const contextSubOfficeId = currentSubOffice?.office_id;
            const contextIsValid = contextSubOfficeId && filteredSubs.some(s => s.office_id === contextSubOfficeId);

            if (contextIsValid) {
                // Keep the context sub-office (don't overwrite)
                setSelectedSubOffice(contextSubOfficeId);
                setFormData(p => ({ ...p, office_id: contextSubOfficeId }));
            } else if (filteredSubs.length === 1) {
                // Auto-select the single available unit
                const singleUnit = filteredSubs[0];
                setSelectedSubOffice(singleUnit.office_id);
                setFormData(p => ({ ...p, office_id: singleUnit.office_id }));
            } else {
                // Fallback to Parent Office if no specific sub-office context & multiple choices
                // BUT: If user manually selected a sub-office in Form (e.g. Edit Mode), respect that too?
                // For now, default to Parent is safer than random sub-office.
                if (!formData.office_id) {
                    setFormData(p => ({ ...p, office_id: staffAssignments.parentOfficeId }));
                }
            }
        });
    }, [staffAssignments, isStaffUser, isOpen, getSubOffices, currentSubOffice]);

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

                    // Set New Attributes


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
                            utility_value: recordToEdit.utility_value || 'Adm',
                            media_text: recordToEdit.media_text || '',
                            restriction_text: recordToEdit.restriction_text || '',
                            frequency_text: recordToEdit.frequency_text || '',
                            provision_text: recordToEdit.provision_text || ''
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
                            is_restricted: isVaultMode, // Auto-enable when opened from Vault Mode
                            period_covered: '',
                            volume: '',
                            duplication: '',
                            time_value: '',
                            utility_value: '',
                            media_text: '',
                            restriction_text: '',
                            frequency_text: '',
                            provision_text: ''
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
                        utility_value: formData.utility_value,
                        media_text: formData.media_text,
                        restriction_text: formData.restriction_text,
                        frequency_text: formData.frequency_text,
                        provision_text: formData.provision_text
                    })
                });
            } else {
                const data = new FormData();
                // Append all fields EXCEPT file first
                Object.keys(formData).forEach(key => {
                    if (key !== 'file') data.append(key, formData[key]);
                });
                // Append file LAST (Critical for Multer/Busboy parsing)
                if (formData.file) data.append('file', formData.file);

                res = await fetch('/api/records', {
                    method: 'POST',
                    headers: headers,
                    body: data
                });
            }

            clearInterval(interval);
            setUploadProgress(100);

            if (res.ok) {
                // Optimize: Immediate feedback
                setUploadProgress(100);
                setTimeout(() => {
                    onSuccess(); // Triggers refresh
                    onClose();

                    if (formData.is_restricted) {
                        toast.success("Secure Upload Complete", { description: "File saved to Restricted Vault." });
                    } else {
                        toast.success(isEditMode ? 'Record updated' : 'File uploaded successfully');
                    }
                }, 200); // Short delay for progress bar to hit 100% visually
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

    // Progress calculation for visual indicator
    const formProgress = (() => {
        let filled = 0;
        const fields = ['title', 'region_id', 'category_name', 'classification_rule', 'shelf', 'period_covered', 'volume', 'duplication'];
        fields.forEach(f => { if (formData[f]) filled++; });
        if (formData.file || isEditMode) filled++;
        return Math.round((filled / (fields.length + 1)) * 100);
    })();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 transition-all">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[88vh] animate-zoom-in border border-white/30 overflow-hidden">

                {/* ENHANCED HEADER */}
                <div className={`flex-none relative overflow-hidden ${isVaultMode ? 'bg-gradient-to-br from-red-600 via-red-700 to-rose-800' : isEditMode ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600' : 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800'}`}>
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 -left-4 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>

                    <div className="relative px-8 py-6 flex justify-between items-start">
                        <div className="flex items-start gap-4">
                            {/* Icon Container */}
                            <div className={`p-3 rounded-2xl ${isVaultMode ? 'bg-white/20' : isEditMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-sm shadow-lg`}>
                                {isVaultMode ? (
                                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" /></svg>
                                ) : isEditMode ? (
                                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                ) : (
                                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-white tracking-tight">
                                    {isEditMode ? 'Edit Metadata' : (isVaultMode ? 'Secure Vault Upload' : 'Upload Document')}
                                </h2>
                                <p className="text-sm text-white/70 mt-0.5 font-medium">
                                    {isEditMode ? 'Update record details and classification' : (isVaultMode ? 'Encrypted • Restricted Access' : 'Secure PDF Repository')}
                                </p>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all text-white/80 hover:text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-black/20">
                        <div className="h-full bg-white/80 transition-all duration-500 ease-out" style={{ width: `${formProgress}%` }}></div>
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
                                        <select required disabled={!['SUPER_ADMIN', 'ADMIN', 'REGIONAL_ADMIN'].includes(user.role)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 appearance-none" value={formData.region_id} onChange={handleRegionChange}>
                                            {!['SUPER_ADMIN', 'ADMIN', 'REGIONAL_ADMIN'].includes(user.role) && <option value={user.region_id}>My Province</option>}
                                            {['SUPER_ADMIN', 'ADMIN', 'REGIONAL_ADMIN'].includes(user.role) && (
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
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                                            Office / Division {!isStaffUser && <span className="text-slate-300">(Optional)</span>}
                                            {isStaffUser && <span className="text-amber-600">(Assigned)</span>}
                                        </label>
                                        <div className="relative">
                                            <select
                                                className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none transition-all appearance-none ${isStaffUser
                                                    ? 'bg-amber-50 border-amber-200 text-amber-800 cursor-not-allowed'
                                                    : 'border-slate-200 text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400'
                                                    }`}
                                                value={selectedParentOffice}
                                                onChange={handleParentOfficeChange}
                                                disabled={isStaffUser || !formData.region_id || (offices.length === 0 && !!formData.region_id)}
                                            >
                                                {isStaffUser ? (
                                                    <option value={staffAssignments.parentOfficeId}>
                                                        {staffAssignments.parentOfficeName || 'Loading...'}
                                                    </option>
                                                ) : (
                                                    <>
                                                        <option value="">
                                                            {formData.region_id && offices.length === 0 ? 'None (Province Only)' : 'Select Office...'}
                                                        </option>
                                                        {offices.map(o => <option key={o.office_id} value={o.office_id}>{o.code}</option>)}
                                                    </>
                                                )}
                                            </select>
                                            {isStaffUser && (
                                                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold tracking-wide flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" /></svg>
                                                    LOCKED
                                                </div>
                                            )}
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

                        {/* 2.5 NEW ATTRIBUTES GRID (TEXT INPUTS) */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* RECORDS MEDIUM */}
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Records Medium</label>
                                <input
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                                    placeholder="e.g. Paper, Electronic, Microfilm"
                                    value={formData.media_text}
                                    onChange={(e) => setFormData({ ...formData, media_text: e.target.value })}
                                />
                            </div>

                            {/* RESTRICTIONS */}
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Restrictions</label>
                                <input
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                                    placeholder="e.g. Confidential, Open Access"
                                    value={formData.restriction_text}
                                    onChange={(e) => setFormData({ ...formData, restriction_text: e.target.value })}
                                />
                            </div>

                            {/* FREQUENCY OF USE */}
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Frequency of Use</label>
                                <input
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                                    placeholder="e.g. Daily, Monthly, Yearly"
                                    value={formData.frequency_text}
                                    onChange={(e) => setFormData({ ...formData, frequency_text: e.target.value })}
                                />
                            </div>

                            {/* DISPOSITION PROVISION */}
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Disposition Provision</label>
                                <input
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
                                    placeholder="e.g. R.A. 9470, NAP Circular 1"
                                    value={formData.provision_text}
                                    onChange={(e) => setFormData({ ...formData, provision_text: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* 3. FILE UPLOAD & RESTRICTION */}
                        <div className="space-y-4">
                            {/* ENHANCED DROP ZONE */}
                            {!isEditMode || formData.replaceFile ? (
                                <div
                                    className={`relative rounded-2xl p-8 text-center transition-all duration-300 group cursor-pointer overflow-hidden
                                    ${isDragging
                                            ? 'bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 scale-[1.02] shadow-lg shadow-indigo-100'
                                            : formData.file
                                                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200'
                                                : 'bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:from-indigo-50/50 hover:to-purple-50/50'}`}
                                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                >
                                    {/* Animated Border on Drag */}
                                    {isDragging && (
                                        <div className="absolute inset-0 rounded-2xl animate-pulse" style={{
                                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7, #6366f1)',
                                            backgroundSize: '300% 100%',
                                            padding: '2px',
                                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                            WebkitMaskComposite: 'xor',
                                            maskComposite: 'exclude'
                                        }}></div>
                                    )}

                                    <input type="file" required={!isEditMode} accept=".pdf,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => e.target.files.length > 0 && validateAndSetFile(e.target.files[0])} />

                                    {formData.file ? (
                                        <div className="flex items-center justify-center gap-5 animate-fade-in">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                                                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Ready to Upload</p>
                                                <p className="text-sm font-bold text-slate-800 truncate max-w-[180px]">{formData.file.name}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 rounded-full shadow-sm">{formatBytes(formData.file.size)}</span>
                                                    <span className="text-xs font-medium text-slate-400">PDF Document</span>
                                                </div>
                                            </div>
                                            <button type="button" onClick={(e) => { e.preventDefault(); setFormData({ ...formData, file: null }) }} className="z-20 p-2.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm hover:shadow-md border border-slate-100 hover:border-red-200">
                                                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 pointer-events-none">
                                            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragging ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 group-hover:from-indigo-100 group-hover:to-purple-100 group-hover:text-indigo-500'}`}>
                                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                                            </div>
                                            <div>
                                                <p className={`text-base font-bold transition-colors ${isDragging ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-600'}`}>
                                                    {isDragging ? 'Drop your PDF here!' : (isEditMode ? 'Click to replace file' : 'Drag & drop your PDF')}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">or click to browse • Max 50MB</p>
                                            </div>
                                            {isEditMode && <button type="button" onClick={() => setFormData({ ...formData, replaceFile: false })} className="pointer-events-auto text-xs font-medium text-slate-400 hover:text-indigo-600 underline underline-offset-2 transition-colors">Cancel Replace</button>}
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

                                        <label className={`relative inline-flex items-center ${isVaultMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`} title={isVaultMode ? 'Always restricted when uploading from Vault Mode' : 'Toggle restricted access'}>
                                            <input type="checkbox" className="sr-only peer" checked={formData.is_restricted} onChange={(e) => !isVaultMode && setFormData({ ...formData, is_restricted: e.target.checked })} disabled={isVaultMode} />
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

                {/* ENHANCED FOOTER */}
                <div className={`flex-none p-6 border-t ${isVaultMode ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-100' : 'bg-gradient-to-r from-slate-50 to-white border-slate-100'}`}>
                    {/* Upload Progress */}
                    {loading && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {isEditMode ? 'Saving...' : 'Uploading...'}
                                </span>
                                <span className={`text-sm font-bold ${isEditMode ? 'text-amber-600' : isVaultMode ? 'text-red-600' : 'text-indigo-600'}`}>
                                    {uploadProgress}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${isEditMode ? 'bg-gradient-to-r from-amber-400 to-orange-500' : isVaultMode ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="record-form"
                            disabled={loading}
                            className={`flex-1 py-3.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group
                                ${isEditMode
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-200 hover:shadow-amber-300'
                                    : isVaultMode
                                        ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-200 hover:shadow-red-300'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-200 hover:shadow-indigo-300'
                                } ${!loading && 'hover:-translate-y-0.5 hover:shadow-xl'}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>{isEditMode ? 'Saving...' : 'Uploading...'}</span>
                                </>
                            ) : (
                                <>
                                    {isEditMode ? (
                                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                    ) : isVaultMode ? (
                                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                    )}
                                    <span>{isEditMode ? 'Save Changes' : (isVaultMode ? 'Secure Upload' : 'Upload Document')}</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Form Completion Hint */}
                    {!loading && formProgress < 100 && (
                        <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                            Complete all required fields to submit
                        </p>
                    )}
                </div>

            </div >
        </div >
    );
};

export default RecordModal;