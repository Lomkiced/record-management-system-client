import { createContext, useContext, useState, useRef } from 'react';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const ConfirmationContext = createContext();

export const ConfirmationProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState({
        title: '',
        message: '',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        variant: 'danger', // danger | info | warning
        icon: 'trash' // trash | warning | info
    });

    // We use a ref to store the resolve function of the promise
    const resolveRef = useRef(null);

    const confirm = ({
        title = 'Are you sure?',
        message = 'This action cannot be undone.',
        confirmLabel = 'Yes, Delete',
        cancelLabel = 'Cancel',
        variant = 'danger',
        icon = 'trash'
    }) => {
        setOptions({ title, message, confirmLabel, cancelLabel, variant, icon });
        setIsOpen(true);

        return new Promise((resolve) => {
            resolveRef.current = resolve;
        });
    };

    const handleConfirm = () => {
        setIsOpen(false);
        if (resolveRef.current) {
            resolveRef.current(true);
            resolveRef.current = null;
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (resolveRef.current) {
            resolveRef.current(false);
            resolveRef.current = null;
        }
    };

    return (
        <ConfirmationContext.Provider value={{ confirm }}>
            {children}
            <ConfirmationModal
                isOpen={isOpen}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                options={options}
            />
        </ConfirmationContext.Provider>
    );
};

export const useConfirmation = () => useContext(ConfirmationContext);
