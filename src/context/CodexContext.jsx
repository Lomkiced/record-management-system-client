import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const CodexContext = createContext();

export const CodexProvider = ({ children }) => {
  const { user } = useAuth(); // Depend on user auth state
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  const getToken = () => localStorage.getItem('dost_token');

  // 1. FETCH ALL DATA
  const fetchData = async () => {
    try {
      const token = getToken();
      if (!token) return;

      console.log("Loading Codex Data..."); // Debug Log

      const catRes = await fetch('http://localhost:5000/api/codex/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const typeRes = await fetch('http://localhost:5000/api/codex/types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (catRes.ok && typeRes.ok) {
        const catData = await catRes.json();
        const typeData = await typeRes.json();
        setCategories(catData);
        setTypes(typeData);
        console.log("Codex Data Loaded:", catData.length, "categories");
      }
    } catch (err) { console.error("Codex Load Error:", err); }
  };

  // Trigger fetch when user logs in
  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // 2. ADD CATEGORY (Wait for Server)
  const addCategory = async (data) => {
    const token = getToken();
    const response = await fetch('http://localhost:5000/api/codex/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      fetchData(); // Refresh from DB to confirm save
      toast.success("Category saved");
      return true;
    } else {
      toast.error("Failed to save category. Check console.");
      return false;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/codex/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success("Category deleted successfully");
        fetchData();
      } else {
        const err = await response.json();
        toast.error(err.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Delete Category Error:", error);
      toast.error("Server error while deleting category");
    }
  };

  const addType = async (data) => {
    const token = getToken();
    const response = await fetch('http://localhost:5000/api/codex/types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      fetchData();
      toast.success("Document type added successfully");
      return true;
    }
    toast.error("Failed to add document type");
    return false;
  };

  const deleteType = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/codex/types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success("Document type deleted successfully");
        fetchData();
      } else {
        const err = await response.json();
        toast.error(err.message || "Failed to delete document type");
      }
    } catch (error) {
      console.error("Delete Type Error:", error);
      toast.error("Server error while deleting type");
    }
  };

  return (
    <CodexContext.Provider value={{ categories, types, addCategory, deleteCategory, addType, deleteType }}>
      {children}
    </CodexContext.Provider>
  );
};

export const useCodex = () => useContext(CodexContext);