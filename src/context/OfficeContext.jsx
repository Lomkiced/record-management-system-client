import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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

    // Fetch offices by params (region_id, parent_office_id, toplevel, page, limit)
    const [pagination, setPagination] = useState({ total: 0, current: 1, pages: 1 });

    const fetchOffices = useCallback(async (params = null) => {
        setLoading(true);
        try {
            const token = getToken();
            let url = '/api/offices';

            // Build Query Params
            const searchParams = new URLSearchParams();
            if (params) {
                if (typeof params === 'object') {
                    if (params.region_id) searchParams.append('region_id', params.region_id);
                    if (params.parent_office_id) searchParams.append('parent_office_id', params.parent_office_id);
                    if (params.toplevel) searchParams.append('toplevel', params.toplevel);
                    if (params.page) searchParams.append('page', params.page);
                    if (params.limit) searchParams.append('limit', params.limit);
                    if (params.search) searchParams.append('search', params.search);
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
                const result = await response.json();

                // Handle both legacy array and new paginated object
                if (Array.isArray(result)) {
                    setOffices(result);
                    setPagination({ total: result.length, current: 1, pages: 1 });
                    return result;
                } else {
                    setOffices(result.data || []);
                    setPagination(result.pagination || { total: 0, current: 1, pages: 1 });
                    return result.data;
                }
            } else {
                setOffices([]);
                setPagination({ total: 0, current: 1, pages: 1 });
                return [];
            }
        } catch (error) {
            console.error('Fetch Offices Error:', error);
            setOffices([]);
            setPagination({ total: 0, current: 1, pages: 1 });
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Get TOP-LEVEL offices for a specific region (excludes sub-offices)
    const getOfficesByRegion = useCallback(async (regionId) => {
        if (!regionId) return [];
        return await fetchOffices({ region_id: regionId, toplevel: 'true' });
    }, [fetchOffices]);

    // Get sub-offices for a specific parent office
    const getSubOffices = useCallback(async (parentOfficeId) => {
        if (!parentOfficeId) return [];
        return await fetchOffices({ parent_office_id: parentOfficeId });
    }, [fetchOffices]);

    // Add new office
    const addOffice = useCallback(async (data) => {
        try {
            const token = getToken();
            const response = await fetch('/api/offices', {
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
    }, [fetchOffices]);

    // Update office
    const updateOffice = useCallback(async (id, data) => {
        try {
            const token = getToken();
            const response = await fetch(`/api/offices/${id}`, {
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
    }, []);

    // Delete office
    const deleteOffice = useCallback(async (id) => {
        try {
            const token = getToken();
            const response = await fetch(`/api/offices/${id}`, {
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
    }, []);

    const value = useMemo(() => ({
        offices,
        loading,
        pagination,
        fetchOffices,
        getOfficesByRegion,
        getSubOffices,
        addOffice,
        updateOffice,
        deleteOffice
    }), [offices, loading, pagination, fetchOffices, getOfficesByRegion, getSubOffices, addOffice, updateOffice, deleteOffice]);

    return (
        <OfficeContext.Provider value={value}>
            {children}
        </OfficeContext.Provider>
    );
};

export default OfficeContext;
