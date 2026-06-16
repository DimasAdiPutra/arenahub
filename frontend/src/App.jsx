import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import LandingPage from './pages/LandingPage';
import DetailPage from './pages/DetailPage';
import HistoryPage from './pages/HistoryPage';
import Login from './pages/Login';       // ◄ Import halaman Login
import Register from './pages/Register'; // ◄ Import halaman Register
import useDocumentTitle from './hooks/useDocumentTitle';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth(); // Kita hapus fungsi simulasi login lama karena kita mau pakai form asli

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">

        {/* Navbar */}
        <nav className="bg-blue-600 p-4 text-white flex gap-4 shadow-md items-center">
          <Link to="/" className="font-bold mr-auto text-xl">ArenaHUB</Link>
          <Link to="/" className="hover:underline">Cari Fasilitas</Link>

          {user ? (
            <>
              <Link to="/history" className="hover:underline">Riwayat Sewa</Link>
              <div className="flex items-center gap-3">
                <span className="text-sm bg-blue-700 px-3 py-1 rounded">Halo, {user.name}</span>
                <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-medium transition">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm font-medium transition">
                Login
              </Link>
              <Link to="/register" className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm font-medium transition">
                Daftar
              </Link>
            </div>
          )}
        </nav>

        {/* Jalur Rute */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomeRouteWrapper />} />
            <Route path="/venue/:id" element={<DetailRouteWrapper />} />
            <Route path="/history" element={<HistoryRouteWrapper />} />
            <Route path="/login" element={<LoginRouteWrapper />} />       {/* ◄ Rute Baru */}
            <Route path="/register" element={<RegisterRouteWrapper />} /> {/* ◄ Rute Baru */}
          </Routes>
        </div>

      </div>
    </Router>
  );
}

// 🧩 Wrapper Komponen untuk Judul Tab Bar
function HomeRouteWrapper() { useDocumentTitle('Home'); return <LandingPage />; }
function DetailRouteWrapper() { useDocumentTitle('Detail Fasilitas'); return <DetailPage />; }
function HistoryRouteWrapper() { useDocumentTitle('Riwayat Sewa'); return <HistoryPage />; }
function LoginRouteWrapper() { useDocumentTitle('Login'); return <Login />; }       // ◄ Wrapper Baru
function RegisterRouteWrapper() { useDocumentTitle('Daftar Akun'); return <Register />; } // ◄ Wrapper Baru

export default App;