import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const OfficeContext = createContext();

export const useOffices = () => {
    const context = useContext(OfficeContext);
    if (!context) throw new Error('useOffices must be used within OfficeProvider');
    return context;
};

export const OfficeProvider = ({ children }) => {
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(false);

    const getToken = () => localStorage.getItem('dost_token');

    // Fetch offices by params (region_id, parent_office_id, toplevel)
    const fetchOffices = async (params = null) => {
        setLoading(true);
        try {
            const token = getToken();
            let url = 'http://localhost:5000/api/offices';

            // Build Query Params
            const searchParams = new URLSearchParams();
            if (params) {
                if (typeof params === 'object') {
                    if (params.region_id) searchParams.append('region_id', params.region_id);
                    if (params.parent_office_id) searchParams.append('parent_office_id', params.parent_office_id);
                    if (params.toplevel) searchParams.append('toplevel', params.toplevel);
                } else {
                    // Backward compatibility: treat as regionId
                    searchParams.append('region_id', params);
                }
            }

            if (searchParams.toString()) {
                url += `?${searchParams.toString()}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setOffices(data);
                return data;
            } else {
                setOffices([]);
                return [];
            }
        } catch (error) {
            console.error('Fetch Offices Error:', error);
            setOffices([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Get TOP-LEVEL offices for a specific region (excludes sub-offices)
    const getOfficesByRegion = async (regionId) => {
        if (!regionId) return [];
        return await fetchOffices({ region_id: regionId, toplevel: 'true' });
    };

    // Get sub-offices for a specific parent office
    const getSubOffices = async (parentOfficeId) => {
        if (!parentOfficeId) return [];
        return await fetchOffices({ parent_office_id: parentOfficeId });
    };

    // Add new office
    const addOffice = async (data) => {
        try {
            const token = getToken();
            const response = await fetch('http://localhost:5000/api/offices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                toast.success('Office created successfully');
                await fetchOffices(data.region_id);
                return true;
            } else {
                const err = await response.json();
                toast.error(err.message || 'Failed to create office');
                return false;
            }
        } catch (error) {
            console.error('Add Office Error:', error);
            toast.error('Server error');
            return false;
        }
    };

    // Update office
    const updateOffice = async (id, data) => {
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:5000/api/offices/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                toast.success('Office updated');
                return true;
            } else {
                const err = await response.json();
                toast.error(err.message || 'Update failed');
                return false;
            }
        } catch (error) {
            console.error('Update Office Error:', error);
            toast.error('Server error');
            return false;
        }
    };

    // Delete office
    const deleteOffice = async (id) => {
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:5000/api/offices/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success('Office deleted');
                setOffices(prev => prev.filter(o => o.office_id !== id));
                return true;
            } else {
                const err = await response.json();
                toast.error(err.message || 'Delete failed');
                return false;
            }
        } catch (error) {
            console.error('Delete Office Error:', error);
            toast.error('Server error');
            return false;
        }
    };

    return (
        <OfficeContext.Provider value={{
            offices,
            loading,
            fetchOffices,
            getOfficesByRegion,
            getSubOffices,
            addOffice,
            updateOffice,
            deleteOffice
        }}>
            {children}
        </OfficeContext.Provider>
    );
};

export default OfficeContext;
