import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import LandingPage from './pages/LandingPage';
import DetailPage from './pages/DetailPage';
import HistoryPage from './pages/HistoryPage';
import useDocumentTitle from './hooks/useDocumentTitle';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-800">

        <nav className="bg-blue-600 p-4 text-white flex gap-4 shadow-md">
          <Link to="/" className="font-bold mr-auto text-xl">ArenaHUB</Link>
          <Link to="/" className="hover:underline">Cari Fasilitas</Link>
          <Link to="/history" className="hover:underline">Riwayat Sewa</Link>
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