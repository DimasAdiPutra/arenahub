import { BrowserRouter as Router, Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import DetailPage from './pages/DetailPage';
import HistoryPage from './pages/HistoryPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import ProtectedRoute from './components/ProtectedRoute'; // ◄ Import pelindung rute

export default function App() {
  return (
    <Router>
      <Routes>

        {/* 🟩 JALUR UMUM & CUSTOMER (Bisa diakses siapa saja / tanpa login) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/space/:id" element={<DetailPage />} />

          {/* 🔏 Jalur Khusus Customer Terautentikasi */}
          {/* Hanya user dengan role 'customer' yang bisa melihat history booking */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Route>

        {/* 🔏 JALUR AUTENTIKASI (Polos tanpa Navbar/Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 👑 JALUR PEMILIK LAPANGAN (Owner Only) */}
        {/* Mengunci rute dashboard agar tidak bisa diintip oleh customer biasa */}
        <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        </Route>

      </Routes>
    </Router>
  );
}