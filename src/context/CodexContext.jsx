import { createContext, useContext, useEffect, useState } from 'react';
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
        return true;
    } else {
        alert("Failed to save category. Check console.");
        return false;
    }
  };

  const deleteCategory = async (id) => {
    const token = getToken();
    await fetch(`http://localhost:5000/api/codex/categories/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
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
        return true;
    }
    return false;
  };

  const deleteType = async (id) => {
    const token = getToken();
    await fetch(`http://localhost:5000/api/codex/types/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  return (
    <CodexContext.Provider value={{ categories, types, addCategory, deleteCategory, addType, deleteType }}>
      {children}
    </CodexContext.Provider>
  );
};

export const useCodex = () => useContext(CodexContext);