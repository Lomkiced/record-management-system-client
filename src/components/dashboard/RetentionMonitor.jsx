import { useNavigate } from 'react-router-dom';

// Lock icon for restricted files
const LockIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const RetentionMonitor = ({ disposalQueue, darkMode = false }) => {
    const navigate = useNavigate();

    const handleReview = (record) => {
        if (record.is_restricted) {
            // Navigate to registry with restricted vault context
            // The user will need to unlock the vault to view this file
            navigate(`/registry?vault=true&view=${record.record_id}`);
        } else {
            navigate(`/registry?view=${record.record_id}`);
        }
    };

    const getStatus = (date) => {
        const diff = new Date(date) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return { label: 'EXPIRED', color: 'text-rose-700 bg-rose-50 border-rose-200', daysLabel: `${Math.abs(days)} Days Overdue`, bg: 'bg-rose-50' };
        if (days === 0) return { label: 'TODAY', color: 'text-amber-700 bg-amber-50 border-amber-200', daysLabel: 'Due Today', bg: 'bg-amber-50' };
        return { label: 'URGENT', color: 'text-orange-700 bg-orange-50 border-orange-200', daysLabel: `${days} Days Left`, bg: 'bg-white' };
    };

    if (!disposalQueue || disposalQueue.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-emerald-100 text-emerald-600">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-bold text-xl text-slate-800">No Immediate Actions</h3>
                <p className="text-sm text-slate-500 max-w-xs mt-2">All records are compliant. No disposal protocols required for the next 7 days.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
            {disposalQueue.map((rec) => {
                const status = getStatus(rec.disposal_date);
                const isRestricted = rec.is_restricted;
                return (
                    <div
                        key={rec.record_id}
                        onClick={() => handleReview(rec)}
                        className={`group relative border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                            }`}
                    >
                        <div className="flex justify-between items-center relative z-10 w-full">
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-xs font-extrabold tracking-wider px-3 py-1 rounded-full border ${status.color}`}>
                                        {status.daysLabel.toUpperCase()}
                                    </span>
                                    {isRestricted && (
                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                                            <LockIcon /> RESTRICTED
                                        </span>
                                    )}
                                    <span className="text-sm font-medium text-slate-500">
                                        Due: {new Date(rec.disposal_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <h4 className={`font-bold text-lg truncate group-hover:text-indigo-700 transition-colors ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                                    {rec.title}
                                </h4>
                            </div>

                            <button className={`h-10 w-10 flex items-center justify-center rounded-xl shadow-sm transition-all ${isRestricted ? 'bg-red-50 text-red-400 group-hover:bg-red-600 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>

                        {/* Subtle side accent */}
                        <div className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-lg ${isRestricted ? 'bg-red-500' : status.label === 'EXPIRED' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                    </div>
                );
            })}
        </div>
    );
};

export default RetentionMonitor;
