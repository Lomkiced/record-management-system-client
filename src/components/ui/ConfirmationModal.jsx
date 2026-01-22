import { useEffect, useState } from 'react';

// Icons
const Icons = {
    Trash: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Warning: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Info: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, options }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
        } else {
            setTimeout(() => setVisible(false), 200); // Animation delay
        }
    }, [isOpen]);

    if (!visible && !isOpen) return null;

    const isDanger = options.variant === 'danger';

    const IconComponent = () => {
        if (options.icon === 'trash') return <Icons.Trash />;
        if (options.icon === 'warning') return <Icons.Warning />;
        return <Icons.Info />;
    };

    const getThemeClasses = () => {
        if (isDanger) return {
            iconBg: 'bg-red-100 text-red-600',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-200',
            border: 'border-red-100'
        };
        if (options.variant === 'warning') return {
            iconBg: 'bg-amber-100 text-amber-600',
            button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-200',
            border: 'border-amber-100'
        };
        return {
            iconBg: 'bg-indigo-100 text-indigo-600',
            button: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-200',
            border: 'border-indigo-100'
        };
    };

    const theme = getThemeClasses();

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-200 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all duration-300 ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'} border flex flex-col`}
            >
                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme.iconBg} animate-bounce-short`}>
                        <IconComponent />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {options.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed px-4">
                        {options.message}
                    </p>
                </div>

                {/* Actions */}
                <div className="bg-slate-50 p-4 flex gap-3 justify-center border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-slate-100"
                    >
                        {options.cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg active:scale-95 transition-all outline-none focus:ring-4 ${theme.button}`}
                    >
                        {options.confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
