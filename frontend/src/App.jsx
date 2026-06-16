import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import LandingPage from './pages/LandingPage';
import DetailPage from './pages/DetailPage';
import HistoryPage from './pages/HistoryPage';
import useDocumentTitle from './hooks/useDocumentTitle';
import { useAuth } from './context/AuthContext'; // ◄ Import custom hook kita

function App() {
  const { user, login, logout } = useAuth(); // ◄ Ambil data user & fungsi aksi dari Context

  // Fungsi simulasi klik tombol login sementara sebelum ada halaman form
  const handleSimulateLogin = () => {
    login({ name: "Ahmad Futsal", email: "ahmad@gmail.com" }, "dummy-jwt-token-12345");
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-800">

        <nav className="bg-blue-600 p-4 text-white flex gap-4 shadow-md items-center">
          <Link to="/" className="font-bold mr-auto text-xl">ArenaHUB</Link>
          <Link to="/" className="hover:underline">Cari Fasilitas</Link>
          <Link to="/history" className="hover:underline">Riwayat Sewa</Link>

          {/* 💡 Tampilan Navigasi Dinamis Berdasarkan Status Login */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm bg-blue-700 px-3 py-1 rounded">Halo, {user.name}</span>
              <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-medium transition">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={handleSimulateLogin} className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm font-medium transition">
              Simulasi Login
            </button>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<HomeRouteWrapper />} />
          <Route path="/venue/:id" element={<DetailRouteWrapper />} />
          <Route path="/history" element={<HistoryRouteWrapper />} />
        </Routes>

      </div>
    </Router>
  );
}

// 🧩 Wrapper Komponen untuk Judul Tab Bar Dinamis
function HomeRouteWrapper() {
  useDocumentTitle('Home');
  return <LandingPage />;
}

function DetailRouteWrapper() {
  useDocumentTitle('Detail Fasilitas'); // ◄ Judul tab bar juga disesuaikan menjadi lebih umum
  return <DetailPage />;
}

function HistoryRouteWrapper() {
  useDocumentTitle('Riwayat Sewa');
  return <HistoryPage />;
}

export default App;