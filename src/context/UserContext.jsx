import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth(); 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('dost_token'); 

  // 1. FETCH USERS
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) { setLoading(false); return; }

      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        
        // --- CRITICAL MAPPING FIX ---
        // We ensure every field has a fallback (|| '') so the UI never crashes
        const mappedUsers = data.map(u => ({
          id: u.user_id,
          username: u.username || 'Unknown',
          name: u.full_name || u.username || 'No Name',
          email: u.email || '',
          role: u.role, // Will be SUPER_ADMIN, REGIONAL_ADMIN, or STAFF
          dept: u.office || 'Unassigned',
          region: u.region_id || 'Global',
          status: u.status,
          joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'
        }));
        setUsers(mappedUsers);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchUsers(); }, [user]);

  // 2. ADD USER
  const addUser = async (userData) => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password || 'password123',
          full_name: userData.username, 
          email: userData.email,
          office: userData.office,
          role: userData.role, // Must match ENUM (REGIONAL_ADMIN)
          region_id: userData.region_id
        })
      });
      
      if (response.ok) {
        fetchUsers();
        return true;
      } else {
        const err = await response.json();
        throw new Error(err.message);
      }
    } catch (err) { 
        alert(err.message);
        return false; 
    }
  };

  const getStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'ACTIVE').length,
      admins: users.filter(u => u.role.includes('ADMIN')).length,
    };
  };

  return (
    <UserContext.Provider value={{ users, loading, addUser, getStats, refresh: fetchUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => useContext(UserContext);