import { createContext, useState, useEffect, useContext } from 'react';

// 1. Membuat indra atau wadah Context khusus Autentikasi
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // 🔄 Efek untuk mengecek apakah ada token yang tersimpan saat aplikasi pertama kali dimuat
  useEffect(() => {
    if (token) {
      // Sementara kita simpan dummy data user dari token yang ada.
      // Nanti di sini kita bisa tembak API backend (GET /api/auth/me) untuk ambil data profil asli.
      setUser({ name: "User ArenaHub", email: "user@arenahub.com" });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  // 🔓 Fungsi Aksi Login
  const login = (userData, userToken) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken); // Simpan di browser
  };

  // 🔒 Fungsi Aksi Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token'); // Hapus dari browser
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {/* Jangan rendir aplikasi sebelum pengecekan token selesai */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 🔌 Custom Hook biar panggil Context-nya jauh lebih pendek di halaman lain
export const useAuth = () => {
  return useContext(AuthContext);
};