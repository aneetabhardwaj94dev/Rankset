import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('rankset_token');
  const setToken = (t) => t ? localStorage.setItem('rankset_token', t) : localStorage.removeItem('rankset_token');

  const fetchUser = async () => {
    const token = getToken();
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const { user: u } = await res.json();
        setUser(u);
      } else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  const login = (userData, token) => {
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = { user, loading, login, logout, getToken, fetchUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function getAuthHeaders() {
  const token = localStorage.getItem('rankset_token');
  return { Authorization: `Bearer ${token}` };
}
