import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Ambil token dari localStorage sejak awal render jika ada
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    // Ambil data user yang tersimpan di localStorage agar tidak hilang saat refresh
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sinkronisasi status loading
    if (token && user) {
      setToken(token);
      setUser(user);
    } else {
      // Jika salah satu tidak ada, bersihkan semua agar aman
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, [token, user]);

  // 🔓 Fungsi Login Asli (Menerima data riil dari form Login.jsx)
  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData)); // Simpan objek user ke browser
    setToken(userToken);
    setUser(userData);
  };

  // 🔒 Fungsi Logout Clean
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};