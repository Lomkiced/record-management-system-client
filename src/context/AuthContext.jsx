import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Initialize State from Storage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('dost_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      localStorage.clear();
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // 2. LOGIN ACTION
  const login = async (username, password) => {
    setLoading(true);
    try {
      // STRATEGY: Point to the CORRECT endpoint
      // Was: /api/login (Wrong) -> Now: /api/auth/login (Correct)
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // STRATEGY: Use Real Server Data
        // Don't use a "temp-id". Use the actual data the server sent back.
        const sessionUser = {
            ...data.user,
            token: data.token
        };

        // Save to Storage
        localStorage.setItem('dost_token', data.token);
        localStorage.setItem('dost_user', JSON.stringify(sessionUser));
        
        // Update State
        setUser(sessionUser);
        setLoading(false);
        return true;
      } else {
        alert(data.message || "Login Failed");
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error("Login Connection Error:", err);
      alert("Server is unreachable. Please check if the backend is running.");
      setLoading(false);
      return false;
    }
  };

  // 3. LOGOUT ACTION
  const logout = () => {
    setUser(null);
    localStorage.removeItem('dost_user');
    localStorage.removeItem('dost_token');
    // Optional: Call API to invalidate token on server if you implement a blacklist
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);