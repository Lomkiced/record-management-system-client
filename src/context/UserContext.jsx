import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    // 🔒 GUARD CLAUSE: Don't fetch if user is Staff or not logged in
    if (!user || user.role === 'STAFF') {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('dost_token');
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error("User Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  return (
    <UserContext.Provider value={{ users, fetchUsers, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => useContext(UserContext);