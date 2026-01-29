import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check for existing session on load
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('dost_token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            localStorage.removeItem('dost_token');
          }
        } catch (err) {
          console.error("Auth Check Failed:", err);
          localStorage.removeItem('dost_token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // 2. LOGIN (The Fix)
  // We DO NOT fetch here. Login.jsx has already done the fetching.
  // We just save the result.
  const login = (token, userData) => {
    localStorage.setItem('dost_token', token);
    setUser(userData);
  };

  // 3. LOGOUT
  const logout = () => {
    localStorage.removeItem('dost_token');
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;