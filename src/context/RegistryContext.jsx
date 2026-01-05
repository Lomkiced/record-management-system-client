import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../services/endpoints/api'; // Import your optimized service
import { useAuth } from './AuthContext';

const RegistryContext = createContext();

export const RegistryProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, current: 1, pages: 1 });
  const [filters, setFilters] = useState({ search: '', category: 'All', page: 1, status: 'Active', region: '' });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // New State for UI Loading

  // 1. FETCH RECORDS
  // Wrapped in useCallback to prevent infinite loops in useEffect
  const fetchRecords = useCallback(async (overrideFilters = {}) => {
    try {
      setLoading(true);
      
      // Merge current filters with new ones
      const activeFilters = { ...filters, ...overrideFilters };
      setFilters(activeFilters);

      // STRATEGY: Use the API Service (Centralized Logic)
      // The API service now handles the token ('dost_token') automatically.
      const result = await api.getRecords({
          page: activeFilters.page || 1,
          limit: 10,
          search: activeFilters.search || '',
          category: activeFilters.category || 'All',
          status: activeFilters.status || 'Active',
          region: activeFilters.region || '' 
      });

      if (result) {
        setRecords(result.data || []);
        setPagination(result.pagination || { total: 0, current: 1, pages: 1 });
      }

    } catch (err) {
      console.error("Registry Load Error:", err);
      // Optional: setRecords([]) on error if you want to clear the table
    } finally {
      setLoading(false);
    }
  }, [filters]); // Dependencies

  // Initial Load
  useEffect(() => {
     if (user) fetchRecords();
  }, [user]); // Only run when user logs in/changes

  // 2. UPLOAD RECORD (Strategic: Uses api.js)
  const uploadRecord = async (formData) => {
    setUploading(true);
    try {
      await api.createRecord(formData);
      // Auto-refresh after success
      await fetchRecords(); 
      setUploading(false);
      return true;
    } catch (err) {
      console.error("Upload Error:", err);
      alert(err.response?.data?.message || "Upload Failed");
      setUploading(false);
      return false;
    }
  };

  // 3. UPDATE RECORD
  const updateRecord = async (id, formData) => {
    setUploading(true);
    try {
        await api.updateRecord(id, formData);
        await fetchRecords();
        setUploading(false);
        return true;
    } catch (err) {
        console.error("Update Error:", err);
        setUploading(false);
        return false;
    }
  };

  // 4. ARCHIVE
  const archiveRecord = async (id) => {
    try {
        await api.archiveRecord(id);
        fetchRecords(); // Refresh list
    } catch (err) { console.error(err); }
  };

  // 5. RESTORE
  const restoreRecord = async (id) => {
    try {
        await api.restoreRecord(id);
        fetchRecords();
    } catch (err) { console.error(err); }
  };

  // 6. DESTROY
  const destroyRecord = async (id) => {
    if(!window.confirm("WARNING: This will permanently delete the file. Undo is impossible.")) return;
    try {
        await api.deleteRecord(id);
        fetchRecords();
    } catch (err) { console.error(err); }
  };

  return (
    <RegistryContext.Provider value={{ 
      records, 
      pagination, 
      filters, 
      loading, 
      uploading, // Export this so Modal can show a spinner
      fetchRecords, 
      uploadRecord, // Export renamed function
      updateRecord, 
      archiveRecord, 
      restoreRecord, 
      destroyRecord 
    }}>
      {children}
    </RegistryContext.Provider>
  );
};

export const useRegistry = () => useContext(RegistryContext);