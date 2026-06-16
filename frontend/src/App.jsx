import { BrowserRouter as Router, Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import DetailPage from './pages/DetailPage';
import HistoryPage from './pages/HistoryPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard'; // ◄ Ubah nama komponen jadi OwnerDashboard

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🟩 JALUR CUSTOMER (Ada Navbar Atas) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/venue/:id" element={<DetailPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>

        {/* 🔏 JALUR AUTENTIKASI (Polos) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 👑 JALUR OWNER (Dashboard Pengelolaan Jadwal Lapangan & Keuangan milik Owner) */}
        {/* 💡 Mengubah rute menjadi /owner/dashboard sesuai database backend */}
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      </Routes>
    </Router>
  );
}