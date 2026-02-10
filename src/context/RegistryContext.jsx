import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../services/endpoints/api';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const RegistryContext = createContext();

export const RegistryProvider = ({ children }) => {
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, current: 1, pages: 1 });
  const [filters, setFilters] = useState({ search: '', category: 'All', page: 1, status: 'Active', region: '' });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // ARCHIVE-SPECIFIC STATE (Separate from main registry to prevent race conditions)
  const [archivedRecords, setArchivedRecords] = useState([]);
  const [archivePagination, setArchivePagination] = useState({ total: 0, current: 1, pages: 1 });
  const [archiveLoading, setArchiveLoading] = useState(false);

  // 1. FETCH RECORDS
  const fetchRecords = useCallback(async (overrideFilters = {}) => {
    try {
      setLoading(true);
      const activeFilters = { ...filters, ...overrideFilters };
      setFilters(activeFilters);

      const result = await api.getRecords({
        page: activeFilters.page || 1,
        limit: 10,
        search: activeFilters.search || '',
        category: activeFilters.category || 'All',
        status: activeFilters.status || 'Active',
        region: activeFilters.region || '',
        office_id: activeFilters.office_id || '',
        shelf: activeFilters.shelf || '',
        restricted_only: activeFilters.restricted_only, // Pass as-is, no default
        _t: Date.now() // Force fresh fetch
      });

      if (result) {
        setRecords(result.data || []);
        setPagination(result.pagination || { total: 0, current: 1, pages: 1 });
      }
    } catch (err) {
      console.error("Registry Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user) fetchRecords();
  }, [user]);

  // DEDICATED ARCHIVE FETCH (Isolated state, no race conditions)
  const fetchArchivedRecords = useCallback(async (params = {}) => {
    try {
      setArchiveLoading(true);
      const result = await api.getRecords({
        page: params.page || 1,
        limit: 10,
        search: params.search || '',
        category: params.category || 'All',
        status: 'Archived', // ALWAYS Archived
        region: params.region || '',
        office_id: params.office_id || ''
      });

      if (result) {
        setArchivedRecords(result.data || []);
        setArchivePagination(result.pagination || { total: 0, current: 1, pages: 1 });
      }
    } catch (err) {
      console.error("Archive Load Error:", err);
    } finally {
      setArchiveLoading(false);
    }
  }, []);

  // 2. CRUD OPERATIONS
  const uploadRecord = async (formData) => {
    setUploading(true);
    try {
      await api.createRecord(formData);
      await fetchRecords();
      toast.success("Record created successfully");
      setUploading(false);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload Failed");
      setUploading(false);
      return false;
    }
  };

  const updateRecord = async (id, formData) => {
    setUploading(true);
    try {
      await api.updateRecord(id, formData);
      await fetchRecords();
      toast.success("Record updated successfully");
      setUploading(false);
      return true;
    } catch (err) {
      console.error("Update Error:", err);
      setUploading(false);
      return false;
    }
  };

  // --- ARCHIVE FIX ---
  const archiveRecord = async (id) => {
    try {
      setUploading(true);
      console.log("Archiving ID:", id); // Debug
      await api.archiveRecord(id);
      // Force refresh with current filters
      await fetchRecords();
    } catch (err) {
      console.error("Archive Error in Context:", err);
      toast.error("Failed to archive record. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const restoreRecord = async (id) => {
    try {
      await api.restoreRecord(id);
      toast.success("Record restored to active registry");
      // Refresh both lists
      await fetchRecords();
      await fetchArchivedRecords();
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore record");
    }
  };

  // Permanent delete (used by Archive page - confirmation handled by UI)
  const deleteRecord = async (id) => {
    try {
      await api.deleteRecord(id);
      // Refresh archive list after deletion
      await fetchArchivedRecords();
      return true;
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to permanently delete record");
      return false;
    }
  };

  const destroyRecord = async (id, confirmed = false) => {
    if (!confirmed) {
      toast.error("Permanent delete requires confirmation. Call again with confirmed=true to proceed.", {
        description: "This action cannot be undone.",
        duration: 5000
      });
      return false;
    }
    try {
      await api.deleteRecord(id);
      toast.success("Record permanently deleted");
      await fetchRecords();
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete record");
      return false;
    }
  };

  return (
    <RegistryContext.Provider value={{
      records, pagination, filters, loading, uploading,
      fetchRecords, uploadRecord, updateRecord,
      archiveRecord, restoreRecord, deleteRecord, destroyRecord,
      // ARCHIVE-SPECIFIC EXPORTS
      archivedRecords, archivePagination, archiveLoading, fetchArchivedRecords
    }}>
      {children}
    </RegistryContext.Provider>
  );
};

export const useRegistry = () => useContext(RegistryContext);