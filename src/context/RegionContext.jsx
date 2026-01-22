import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
// We don't even need useAuth here anymore, we'll go direct to storage
// import { useAuth } from './AuthContext'; 

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper to get token safely
    const getToken = () => localStorage.getItem('dost_token');

    // 1. FETCH REGIONS (Read)
    const fetchRegions = async () => {
        try {
            const token = getToken();
            const response = await fetch('http://localhost:5000/api/regions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRegions(data);
            }
        } catch (err) {
            console.error("Region Load Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // 2. ADD REGION (Create)
    const addRegion = async (formData) => {
        try {
            const token = getToken(); // <--- DIRECT FETCH FROM STORAGE
            console.log("Sending Token:", token); // Debugging

            const response = await fetch('http://localhost:5000/api/regions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchRegions(); // Refresh list
                toast.success("Region added successfully");
                return true;
            } else {
                const err = await response.json();
                toast.error("Failed to add region: " + (err.message || "Unknown Error"));
                return false;
            }
        } catch (error) {
            console.error("Add Region Error:", error);
            toast.error("Server Error");
            return false;
        }
    };

    // 3. UPDATE REGION
    const updateRegion = async (id, formData) => {
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:5000/api/regions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchRegions();
                toast.success("Region updated successfully");
            } else {
                toast.error("Failed to update region");
            }
        } catch (error) {
            console.error("Update Error:", error);
        }
    };

    // 4. DELETE REGION
    const deleteRegion = async (id) => {
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:5000/api/regions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchRegions();
                toast.success("Region deleted successfully");
            } else {
                toast.error("Failed to delete region");
            }
        } catch (error) {
            console.error("Delete Error:", error);
        }
    };

    const toggleStatus = async (id) => {
        const region = regions.find(r => r.id === id);
        if (!region) return;
        const newStatus = region.status === 'Active' ? 'Inactive' : 'Active';
        await updateRegion(id, { ...region, status: newStatus });
    };

    // Initial Load
    useEffect(() => {
        fetchRegions();
    }, []);

    return (
        <RegionContext.Provider value={{
            regions,
            loading,
            refreshRegions: fetchRegions,
            addRegion,
            updateRegion,
            deleteRegion,
            toggleStatus
        }}>
            {children}
        </RegionContext.Provider>
    );
};

export const useRegions = () => useContext(RegionContext);