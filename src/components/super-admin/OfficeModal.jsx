import { useEffect, useState } from 'react';
import { useOffices } from '../../context/OfficeContext';
import { toast } from 'sonner';

// --- ICONS ---
const Icons = {
    Close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    Building: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    MapPin: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
    Save: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
    Spinner: () => <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
};

const OfficeModal = ({ isOpen, onClose, office, regions, onSaveSuccess }) => {
    const { addOffice, updateOffice } = useOffices();
    const [saving, setSaving] = useState(false);
    // FIX: Check for office_id, not just office existence
    // New sub-offices have { parent_id, region_id } but no office_id
    const isEditing = Boolean(office?.office_id);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        region_id: '',
        parent_id: null,
        status: 'Active'
    });

    // Reset form when modal opens/closes or office changes
    useEffect(() => {
        if (isOpen) {
            if (office) {
                setFormData({
                    code: office.code || '',
                    name: office.name || '',
                    description: office.description || '',
                    region_id: office.region_id || '',
                    parent_id: office.parent_id || null,
                    status: office.status || 'Active'
                });
            } else {
                setFormData({
                    code: '',
                    name: '',
                    description: '',
                    region_id: regions.length > 0 ? regions[0].id : '',
                    parent_id: null,
                    status: 'Active'
                });
            }
        }
    }, [isOpen, office, regions]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.code.trim()) return toast.error('Please enter an office code');
        if (!formData.name.trim()) return toast.error('Please enter an office name');
        if (!formData.region_id) return toast.error('Please select a region');

        setSaving(true);

        try {
            let success;
            if (isEditing) {
                success = await updateOffice(office.office_id, formData);
            } else {
                success = await addOffice(formData);
            }

            if (success) {
                onSaveSuccess();
            }
        } finally {
            setSaving(false);
        }
    };

    const isSubOffice = Boolean(formData.parent_id || office?.parent_id);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up z-10">

                {/* Header - Purple for Sub-Office, Slate for Office (Command Theme) */}
                <div className={`${isSubOffice ? 'bg-gradient-to-r from-purple-700 to-indigo-800' : 'bg-slate-900'} text-white p-6 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Icons.Building />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">
                                {isEditing
                                    ? (isSubOffice ? 'Edit Sub-Office' : 'Edit Office')
                                    : (isSubOffice ? 'Add New Sub-Office' : 'Add New Office')
                                }
                            </h2>
                            <p className={`${isSubOffice ? 'text-purple-200' : 'text-slate-400'} text-sm`}>
                                {isSubOffice
                                    ? (isEditing ? 'Update sub-office information' : 'Create a new sub-office under parent')
                                    : (isEditing ? 'Update office information' : 'Create a new office or unit')
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <Icons.Close />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Sub-Office Indicator */}
                    {isSubOffice && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <Icons.Building />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-purple-600 uppercase">Creating Sub-Office</p>
                                <p className="text-sm text-purple-700">This office will be nested under a parent office</p>
                            </div>
                        </div>
                    )}

                    {/* Code & Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Office Code <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                                placeholder="e.g., ITSM"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                                maxLength={20}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Status
                            </label>
                            <div className="flex items-center gap-3 h-[46px]">
                                <button
                                    type="button"
                                    onClick={() => handleChange('status', 'Active')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border-2 ${formData.status === 'Active' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                >
                                    Active
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleChange('status', 'Inactive')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border-2 ${formData.status === 'Inactive' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                >
                                    Inactive
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Office Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="e.g., Information Technology Services Management"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                        />
                    </div>

                    {/* Region Select */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            <span className="flex items-center gap-1"><Icons.MapPin /> Region <span className="text-red-400">*</span></span>
                        </label>
                        <select
                            value={formData.region_id}
                            onChange={(e) => handleChange('region_id', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Select a Region...</option>
                            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Optional description for this office..."
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-300"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-5 py-2.5 text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 text-sm font-bold"
                        >
                            {saving ? <Icons.Spinner /> : <Icons.Save />}
                            {saving ? 'Saving...' : (isEditing ? 'Update Office' : 'Create Office')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OfficeModal;
