import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  PlusCircle,
  Wallet,
  CalendarCheck,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays
} from 'date-fns';
import { id } from 'date-fns/locale'; // Untuk lokalisasi bahasa Indonesia
import API from '../utils/api';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { formatCompactCurrency } from '../utils/formatters';
import Button from '../components/ui/Button';

export default function OwnerDashboard() {
  useDocumentTitle('Owner Dashboard');

  // State untuk Data Dashboard
  const [stats, setStats] = useState({ totalBookings: 0, totalHours: 0, revenue: 0, activeSpaces: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [calendarBookings, setCalendarBookings] = useState([]);

  // State untuk Kalender
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Catatan: Pastikan kamu membuat endpoint ini di Backend
      // Untuk sementara, jika API belum siap, ini bisa disimulasikan atau disesuaikan
      const res = await API.get('/owner/dashboard');
      const { statistics, recent, allSuccessBookings } = res.data.data;

      setStats(statistics);
      setRecentBookings(recent);
      setCalendarBookings(allSuccessBookings); // Data untuk kalender (berstatus success)
    } catch (error) {
      console.error("Gagal mengambil data dashboard", error);
    }
  };

  // ==========================================
  // 🗓️ RENDER LOGIC KALENDER
  // ==========================================
  const renderCalendarCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Senin sebagai awal minggu
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        // Cari booking (sukses) yang jatuh pada tanggal ini
        const dayBookings = calendarBookings.filter(b => isSameDay(new Date(b.date), cloneDay));

        days.push(
          <div
            key={day}
            className={`min-h-25 border border-slate-100 p-2 transition-colors hover:bg-slate-50 ${!isSameMonth(day, monthStart) ? 'bg-slate-50/50 text-slate-400' : 'bg-white text-slate-900'
              }`}
          >
            <span className="text-xs font-semibold">{format(day, 'd')}</span>

            {/* Tampilkan Badge Booking di Tanggal Ini */}
            <div className="mt-1 flex flex-col gap-1 overflow-y-auto max-h-15 no-scrollbar">
              {dayBookings.map((b, idx) => (
                <div key={idx} className="text-[10px] bg-emerald-100 text-emerald-800 rounded px-1.5 py-0.5 truncate font-medium border border-emerald-200">
                  {b.space?.title} ({b.bookedHours.length}j)
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day}>{days}</div>);
      days = [];
    }
    return <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">{rows}</div>;
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-sm text-slate-500 mt-1">Pantau performa dan kelola jadwal lapangan Anda.</p>
          </div>

          {/* Tombol Form Tambah Lapangan (Persiapan Upload Multipart) */}
          <Button
            to="/owner/spaces/create"
            variant="primary"
            size="md"
            fullWidth={false}
            className="gap-2 shadow-sm shadow-emerald-600/20"
          >
            <PlusCircle size={18} />
            Tambah Arena
          </Button>
        </div>

        {/* 🟢 TOP CARD ANALYTICS PANEL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardStat icon={<CalendarCheck className="text-indigo-600" />} title="Total Bookings" value={stats.totalBookings} />
          <CardStat icon={<Clock className="text-amber-600" />} title="Total Jam Sewa" value={`${stats.totalHours} Jam`} />
          <CardStat icon={<Wallet className="text-emerald-600" />} title="Total Revenue" value={formatCompactCurrency(stats.revenue)} />
          <CardStat icon={<MapPin className="text-rose-600" />} title="Active Spaces" value={stats.activeSpaces} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 🟢 RECENT BOOKINGS SECTION (Kiri Bawah) */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-125 flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" /> Transaksi Terbaru
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
              {recentBookings.length === 0 ? (
                <p className="text-sm text-slate-500 text-center mt-10">Belum ada transaksi.</p>
              ) : (
                recentBookings.map((b) => (
                  <div key={b._id} className="border-b border-slate-100 pb-3 last:border-0">
                    <p className="font-semibold text-slate-800 text-sm">{b.space?.title}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-slate-500">{format(new Date(b.date), 'dd MMM yyyy')}</p>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {b.bookedHours[0]}:00 ({b.bookedHours.length} Jam)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 🟢 INTERACTIVE MONTHLY CALENDAR (Kanan Bawah) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-125 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: id })}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"><ChevronLeft size={18} /></button>
                <button onClick={nextMonth} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"><ChevronRight size={18} /></button>
              </div>
            </div>

            {/* Header Nama Hari */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div><div>Min</div>
            </div>

            {/* Sel Kalender */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {renderCalendarCells()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-komponen untuk Top Card
function CardStat({ icon, title, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition">
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}