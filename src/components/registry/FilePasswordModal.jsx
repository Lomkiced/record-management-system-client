import { useState } from 'react';

const FilePasswordModal = ({ isOpen, onClose, onSuccess, record }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('dost_token');
            const res = await fetch(`/api/records/${record.record_id}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // PASS THE TOKEN BACK
                onSuccess(record.file_path, data.access_token);
                onClose();
                setPassword('');
            } else {
                setError(data.message || "Access Denied.");
            }
        } catch (err) {
            setError("Server connection failed.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-zoom-in">
                <div className="bg-red-50 p-6 border-b border-red-100 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-white text-red-600 rounded-full flex items-center justify-center mb-3 shadow-sm border border-red-100">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-800">Restricted File</h3>
                    <p className="text-xs font-medium text-red-500 uppercase mt-1">Authorized Personnel Only</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <input type="password" autoFocus required placeholder="Enter Access Password"
                            className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-bold text-center tracking-widest"
                            value={password} onChange={(e) => setPassword(e.target.value)} />
                        {error && <p className="text-xs text-red-500 font-bold mt-2 text-center animate-pulse">{error}</p>}
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-200">{loading ? 'Verifying...' : 'Unlock'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FilePasswordModal;