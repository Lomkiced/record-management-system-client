import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useOffices } from '../../context/OfficeContext';

// --- ICONS ---
const Icons = {
    User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Lock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Badge: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    EyeOff: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
    Magic: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    ShieldCheck: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Building: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    ChevronDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
};

const UserModal = ({ isOpen, onClose, user: editingUser, isSuperAdmin, regions, userRegionId, onSave }) => {
    const { getOfficesByRegion, getSubOffices } = useOffices();

    // Store stable references to avoid infinite loops
    const getOfficesByRegionRef = useRef(getOfficesByRegion);
    const getSubOfficesRef = useRef(getSubOffices);
    useEffect(() => {
        getOfficesByRegionRef.current = getOfficesByRegion;
        getSubOfficesRef.current = getSubOffices;
    });

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'STAFF',
        office: '',
        region_id: '',
        status: 'Active',
        sub_unit_ids: []
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState(1); // 1: Account, 2: Access

    // --- NEW: Office Assignment State ---
    const [offices, setOffices] = useState([]);
    const [subOffices, setSubOffices] = useState([]);
    const [selectedOfficeId, setSelectedOfficeId] = useState('');
    const [selectedSubOfficeIds, setSelectedSubOfficeIds] = useState([]); // MULTI-SELECT
    const [loadingOffices, setLoadingOffices] = useState(false);
    const [loadingSubOffices, setLoadingSubOffices] = useState(false);

    // --- NEW: Sub-Unit State ---
    const [subUnits, setSubUnits] = useState([]);
    const [loadingSubUnits, setLoadingSubUnits] = useState(false);
    const [newSubUnitName, setNewSubUnitName] = useState('');
    const [creatingSubUnit, setCreatingSubUnit] = useState(false);

    // Track full objects { sub_unit_id, name } for display across office switches
    const [selectedAssignments, setSelectedAssignments] = useState([]);

    useEffect(() => {
        if (isOpen) {
            if (editingUser) {
                // Initialize sub-office selections from existing assignments
                const initialSubOfficeIds = editingUser.sub_units
                    ? editingUser.sub_units.map(u => u.id)
                    : [];

                setSelectedSubOfficeIds(initialSubOfficeIds);
                setFormData({
                    ...editingUser,
                    password: '', // Don't show hash
                    sub_unit_ids: initialSubOfficeIds
                });
            } else {
                // For new users: set region_id based on context
                // Super Admin can select any region, non-Super Admin is locked to their region
                const defaultRegionId = isSuperAdmin ? '' : (userRegionId || regions[0]?.id || '');
                setSelectedAssignments([]);  // Reset for new user
                setFormData({
                    name: '',
                    username: '',
                    password: '',
                    role: 'STAFF',
                    office: '',
                    region_id: defaultRegionId,
                    status: 'Active',
                    sub_unit_ids: []
                });
            }
            // Reset office selections
            setOffices([]);
            setSubOffices([]);
            setSelectedOfficeId('');
            if (!editingUser) setSelectedSubOfficeIds([]);
        }
    }, [isOpen, editingUser, isSuperAdmin, regions, userRegionId]);

    // --- NEW: Fetch offices when region changes ---
    useEffect(() => {
        const regionId = formData.region_id;
        if (!regionId) {
            setOffices([]);
            setSubOffices([]);
            setSelectedOfficeId('');
            setSelectedSubOfficeIds([]);
            return;
        }

        const fetchOffices = async () => {
            setLoadingOffices(true);
            try {
                const data = await getOfficesByRegionRef.current(regionId);
                setOffices(data || []);
            } catch (e) {
                console.error('Failed to fetch offices:', e);
                setOffices([]);
            } finally {
                setLoadingOffices(false);
            }
        };
        fetchOffices();
    }, [formData.region_id]); // Removed getOfficesByRegion to prevent infinite loop

    // --- NEW: Fetch sub-offices when office changes ---
    useEffect(() => {
        if (!selectedOfficeId) {
            setSubOffices([]);
            // Don't clear selectedSubOfficeIds to allow multi-office assignment
            return;
        }

        const fetchSubOffices = async () => {
            setLoadingSubOffices(true);
            try {
                const data = await getSubOfficesRef.current(selectedOfficeId);
                setSubOffices(data || []);
            } catch (e) {
                console.error('Failed to fetch sub-offices:', e);
                setSubOffices([]);
            } finally {
                setLoadingSubOffices(false);
            }
        };
        fetchSubOffices();
    }, [selectedOfficeId]); // Removed getSubOffices to prevent infinite loop

    // --- NEW: Update formData.office when primary office changes ---
    useEffect(() => {
        // Set primary office code (used for display)
        if (selectedOfficeId) {
            const office = offices.find(o => o.office_id == selectedOfficeId);
            if (office) {
                setFormData(prev => ({ ...prev, office: office.code || office.name }));
            }
        }
    }, [selectedOfficeId, offices]);

    // --- Toggle Sub-Office Selection (Multi-Select) ---
    const toggleSubOffice = (subOffice) => {
        const officeId = subOffice.office_id;
        setSelectedSubOfficeIds(prev => {
            const newIds = prev.includes(officeId)
                ? prev.filter(id => id !== officeId)
                : [...prev, officeId];

            // Also update formData.sub_unit_ids for backend saving
            setFormData(f => ({ ...f, sub_unit_ids: newIds }));
            return newIds;
        });
    };

    // --- NEW: Fetch Sub-Units when Office Changes ---
    useEffect(() => {
        if (!selectedOfficeId) {
            setSubUnits([]);
            // Do NOT clear selectedAssignments or formData.sub_unit_ids here to allow multi-office selection
            return;
        }

        const fetchSubUnits = async () => {
            setLoadingSubUnits(true);
            try {
                const token = localStorage.getItem('dost_token');
                const res = await fetch(`/api/sub-units?office_id=${selectedOfficeId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setSubUnits(await res.json());
                } else {
                    setSubUnits([]);
                }
            } catch (e) {
                console.error("Failed to fetch sub-units", e);
                setSubUnits([]);
            } finally {
                setLoadingSubUnits(false);
            }
        };

        // Only fetch if role is STAFF (Admins don't have sub-units usually)
        if (formData.role === 'STAFF') {
            fetchSubUnits();
        } else {
            setSubUnits([]);
            // Do NOT clear selectedAssignments here either
        }
    }, [selectedOfficeId, formData.role]);

    // --- Create New Sub-Unit Inline ---
    const createSubUnit = async () => {
        if (!newSubUnitName.trim() || !selectedOfficeId) return;
        setCreatingSubUnit(true);
        try {
            const token = localStorage.getItem('dost_token');
            const res = await fetch('/api/sub-units', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    office_id: parseInt(selectedOfficeId),
                    name: newSubUnitName.trim()
                })
            });
            if (res.ok) {
                const created = await res.json();
                // Add to subUnits list
                setSubUnits(prev => [...prev, created]);
                // Auto-select the new unit
                const newId = created.sub_unit_id;
                setFormData(prev => ({
                    ...prev,
                    sub_unit_ids: [...(prev.sub_unit_ids || []), newId]
                }));
                setSelectedAssignments(prev => [
                    ...prev,
                    { sub_unit_id: newId, name: created.name }
                ]);
                setNewSubUnitName('');
                toast.success(`Created and assigned: ${created.name}`);
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to create sub-unit');
            }
        } catch (e) {
            console.error('Create sub-unit error:', e);
            toast.error('Network error creating sub-unit');
        } finally {
            setCreatingSubUnit(false);
        }
    };

    // --- Toggle Sub-Unit Selection ---
    const toggleSubUnit = (unit) => {
        const currentIds = formData.sub_unit_ids || [];
        const isCurrentlySelected = currentIds.includes(unit.sub_unit_id);

        if (isCurrentlySelected) {
            // Remove
            setFormData(prev => ({
                ...prev,
                sub_unit_ids: prev.sub_unit_ids.filter(id => id !== unit.sub_unit_id)
            }));
            setSelectedAssignments(prev => prev.filter(a => a.sub_unit_id !== unit.sub_unit_id));
        } else {
            // Add
            setFormData(prev => ({
                ...prev,
                sub_unit_ids: [...(prev.sub_unit_ids || []), unit.sub_unit_id]
            }));
            if (!selectedAssignments.some(a => a.sub_unit_id === unit.sub_unit_id)) {
                setSelectedAssignments(prev => [...prev, { sub_unit_id: unit.sub_unit_id, name: unit.name }]);
            }
        }
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let pass = "";
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, password: pass });
        toast.success("Strong password generated");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.name || !formData.username) return toast.error("Name and Username are required");
        if (!editingUser && !formData.password) return toast.error("Password is required for new users");
        if (isSuperAdmin && !formData.region_id && formData.role !== 'SUPER_ADMIN') return toast.error("Region is required");

        setIsSaving(true);
        const success = await onSave(formData);
        setIsSaving(false);
        if (success) onClose();
    };

    if (!isOpen) return null;

    const roles = [
        { id: 'STAFF', label: 'Unit Staff', desc: 'Can view/upload records.', color: 'emerald' },
        { id: 'ADMIN', label: 'Regional Admin', desc: 'Manage users in region.', color: 'indigo' },
        ...(isSuperAdmin ? [{ id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full system access.', color: 'purple' }] : [])
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-zoom-in">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {editingUser ? <Icons.Badge /> : <Icons.User />}
                            {editingUser ? 'Update Profile' : 'New Personnel'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {step === 1 ? 'Enter personal details and credentials.' : 'Configure access levels and assignment.'}
                        </p>
                    </div>
                    {/* Steps Indicator */}
                    <div className="flex gap-2">
                        <div className={`w-3 h-3 rounded-full transition-all ${step === 1 ? 'bg-indigo-600 scale-125' : 'bg-slate-200'}`}></div>
                        <div className={`w-3 h-3 rounded-full transition-all ${step === 2 ? 'bg-indigo-600 scale-125' : 'bg-slate-200'}`}></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">

                    {/* STEP 1: ACCOUNT DETAILS */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in-right">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                                    <input
                                        autoFocus
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="e.g. Juan A. Dela Cruz"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Username</label>
                                    <input
                                        disabled={!!editingUser}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                        placeholder="jdelacruz"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Designation (Optional)</label>
                                    <input
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="e.g. Records Officer"
                                        value={formData.designation || ''}
                                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                        Password {editingUser && <span className="font-normal text-slate-400 normal-case">(Left blank to keep unchanged)</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full pl-4 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                            placeholder={editingUser ? "••••••••" : "Secure Password"}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
                                                title={showPassword ? "Hide Password" : "Show Password"}
                                            >
                                                {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={generatePassword}
                                                className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                                                title="Generate Strong Password"
                                            >
                                                <Icons.Magic />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: ROLE & ACCESS */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in-right">

                            {/* Role Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">System Role</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {roles.map(role => (
                                        <div
                                            key={role.id}
                                            onClick={() => setFormData({ ...formData, role: role.id })}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden group
                                            ${formData.role === role.id
                                                    ? `border-${role.color}-500 bg-${role.color}-50`
                                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg mb-3 flex items-center justify-center
                                            ${formData.role === role.id ? `bg-${role.color}-500 text-white` : `bg-slate-100 text-slate-500 group-hover:bg-slate-200`}`}>
                                                <Icons.ShieldCheck />
                                            </div>
                                            <h3 className={`font-bold text-sm ${formData.role === role.id ? `text-${role.color}-700` : 'text-slate-700'}`}>{role.label}</h3>
                                            <p className="text-[11px] text-slate-500 leading-tight mt-1">{role.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Region Selection (Conditional) */}
                            {isSuperAdmin ? (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data Scope (Region)</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none cursor-pointer appearance-none"
                                            value={formData.region_id}
                                            onChange={e => {
                                                setFormData({ ...formData, region_id: e.target.value, office: '' });
                                                setSelectedOfficeId('');
                                                setSelectedSubOfficeId('');
                                            }}
                                        >
                                            <option value="">Select Region Assignment...</option>
                                            {regions.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Icons.ChevronDown /></div>
                                    </div>
                                </div>
                            ) : (
                                /* Non-Super Admin: Show locked region display */
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assigned Region</label>
                                    <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-600">
                                        {regions.find(r => r.id == formData.region_id)?.name || 'Your Region'}
                                        <span className="text-[10px] text-slate-400 ml-2">(Locked)</span>
                                    </div>
                                </div>
                            )}

                            {/* --- NEW: Office Assignment Section --- */}
                            {/* Show for ADMIN and STAFF roles when region is set */}
                            {formData.region_id && formData.role !== 'SUPER_ADMIN' && (
                                <div className="space-y-4 p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl border border-indigo-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Icons.Building /></div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-700">Office Assignment</h4>
                                            <p className="text-[10px] text-slate-500">Select where this user will be assigned</p>
                                        </div>
                                    </div>

                                    {/* Office Dropdown */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary Office</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none cursor-pointer appearance-none disabled:opacity-60"
                                                value={selectedOfficeId}
                                                onChange={e => {
                                                    setSelectedOfficeId(e.target.value);
                                                    setSelectedSubOfficeId('');
                                                }}
                                                disabled={loadingOffices || offices.length === 0}
                                            >
                                                <option value="">
                                                    {loadingOffices ? 'Loading offices...' : offices.length === 0 ? 'No offices available' : 'Select Office...'}
                                                </option>
                                                {offices.map(o => (
                                                    <option key={o.office_id} value={o.office_id}>
                                                        {o.code} - {o.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Icons.ChevronDown /></div>
                                        </div>
                                    </div>

                                    {/* ========== SUB-OFFICE MULTI-SELECT (Staff Assignment) ========== */}
                                    {formData.role === 'STAFF' && selectedOfficeId && (
                                        <div className="animate-fade-in space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">
                                                    Sub-Office Assignments
                                                    <span className="font-normal text-slate-400 normal-case ml-1">(Click to select multiple)</span>
                                                </label>
                                                <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded-full">
                                                    {selectedSubOfficeIds.length} selected
                                                </span>
                                            </div>

                                            {loadingSubOffices ? (
                                                <div className="flex items-center gap-2 text-sm text-slate-400 italic py-3">
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                    </svg>
                                                    Loading sub-offices...
                                                </div>
                                            ) : subOffices.length === 0 ? (
                                                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                                    <p className="text-sm text-slate-500">No sub-offices found under this office.</p>
                                                    <p className="text-xs text-slate-400 mt-1">The staff will be assigned to the main office only.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {subOffices.map(subOffice => {
                                                        const isSelected = selectedSubOfficeIds.includes(subOffice.office_id);
                                                        return (
                                                            <button
                                                                key={subOffice.office_id}
                                                                type="button"
                                                                onClick={() => toggleSubOffice(subOffice)}
                                                                className={`px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 border-2 text-left flex items-center gap-2 group
                                                                ${isSelected
                                                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-lg shadow-purple-500/25 scale-[1.02]'
                                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md'}`}
                                                            >
                                                                <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all
                                                                    ${isSelected ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-purple-100'}`}>
                                                                    {isSelected ? (
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-3 h-3 text-slate-400 group-hover:text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                                        </svg>
                                                                    )}
                                                                </span>
                                                                <span className="truncate">{subOffice.code || subOffice.name}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Selected Sub-Offices Summary */}
                                            {selectedSubOfficeIds.length > 0 && (
                                                <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                                                    <p className="text-xs text-purple-700 font-semibold mb-2">✓ Staff will have access to:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedSubOfficeIds.map(id => {
                                                            const so = subOffices.find(s => s.office_id === id);
                                                            return so ? (
                                                                <span key={id} className="px-2 py-1 bg-white/80 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">
                                                                    {so.code || so.name}
                                                                </span>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Assignment Preview */}
                                    {formData.office && (
                                        <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-100 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-lg">
                                                {formData.office.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Will be assigned to</p>
                                                <p className="font-bold text-slate-800">{formData.office}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Status Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700">Account Status</h4>
                                    <p className="text-xs text-slate-500">Allow user to log in</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active' })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${formData.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${formData.status === 'Active' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                        </div>
                    )}

                </form>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    {step === 2 ? (
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
                        >
                            Back
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                    )}

                    {step === 1 ? (
                        <button
                            type="button"
                            onClick={() => {
                                if (!formData.name || !formData.username) return toast.error("Please fill in basic details first.");
                                setStep(2);
                            }}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                            Next Step <Icons.Refresh /> {/* Using Refresh icon as right arrow substitute or define chevron */}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Icons.Badge />
                                    {editingUser ? 'Save Changes' : 'Create Account'}
                                </>
                            )}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default UserModal;
