import React, { useEffect, useState } from 'react'
import Button from './ui/Button';

import API from '../utils/api'

const BookingWidget = ({ space, triggerToast }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]); // Array karena user bisa booking > 1 jam sekaligus
  const [bookedHours, setBookedHours] = useState([]); // ◄ State menampung jam yang sudah dibooking
  const [loadingHours, setLoadingHours] = useState(false); // Loading khusus saat cek jam

  // Generate daftar jam dari 08:00 sampai 22:00
  const availableHours = Array.from({ length: 15 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // EFFECT: Setiap kali tanggal diubah oleh user, langsung cek ke backend
  useEffect(() => {
    if (!selectedDate) {
      setBookedHours([]);
      return;
    }

    const fetchAvailability = async () => {
      setLoadingHours(true);
      try {
        const response = await API.get(`/bookings/check-availability`, {
          params: { spaceId: space._id, date: selectedDate }
        });
        setBookedHours(response.data.data || []);
      } catch (err) {
        console.error(err)
        triggerToast('error', 'Gagal', 'Gagal memuat jadwal ketersediaan lapangan.');
      } finally {
        setLoadingHours(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, space._id]);

  // Fungsi untuk menangani klik pada tombol jam (Toggle Select)
  const handleTimeClick = (time) => {
    // Ekstrak string "08:00" menjadi angka integer 8
    const currentHour = parseInt(time.split(':')[0]);

    // KONDISI 1: Belum ada yang dipilih ATAU sudah ada rentang penuh (klik ketiga)
    // Kita reset dan jadikan klik ini sebagai JAM MULAI
    if (selectedTimes.length === 0 || selectedTimes.length > 1) {
      setSelectedTimes([time]);
      return;
    }

    // KONDISI 2: Sudah ada 1 jam terpilih (Jam Mulai), dan user klik jam yang sama
    // Ini berarti user membatalkan pilihan jam mulai tersebut
    if (selectedTimes.includes(time)) {
      setSelectedTimes([]);
      return;
    }

    // KONDISI 3: Proses pembentukan rentang (Klik Kedua / Jam Selesai)
    const startHour = parseInt(selectedTimes[0].split(':')[0]);

    // Tentukan mana angka yang lebih kecil sebagai batas bawah dan mana yang lebih besar sebagai batas atas
    const minHour = Math.min(startHour, currentHour);
    const maxHour = Math.max(startHour, currentHour);

    const newSelection = [];

    // Loop untuk mengisi semua jam di antara batas bawah hingga batas atas
    for (let hour = minHour; hour <= maxHour; hour++) {
      // Cek apakah ada jam di dalam rentang ini yang sudah laku dibooking di database
      if (bookedHours.includes(hour)) {
        triggerToast(
          'error',
          'Jadwal Bentrok',
          'Gagal memilih rentang karena ada slot jam yang sudah dipesan customer lain!'
        );
        return; // Hentikan proses, rentang tidak akan terbentuk
      }

      // Format kembali angka menjadi string "HH:00" agar sesuai dengan state awal
      const formattedTime = `${hour.toString().padStart(2, '0')}:00`;
      newSelection.push(formattedTime);
    }

    // Urutkan array dari jam terkecil ke terbesar sebelum disimpan ke state
    newSelection.sort((a, b) => parseInt(a.split(':')[0]) - parseInt(b.split(':')[0]));
    setSelectedTimes(newSelection);
  };

  // Hitung durasi sewa yang sebenarnya (Jumlah item dikurangi 1)
  const totalHours = selectedTimes.length > 1 ? selectedTimes.length - 1 : 0;

  // Kalkulasi total biaya sewa berdasarkan durasi riil
  const totalBelanja = totalHours * (space?.pricePerHour || 0);

  // Dapatkan tanggal hari ini dengan format YYYY-MM-DD untuk membatasi input tanggal lalu
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-6 lg:sticky lg:top-6">

      {/* Header Widget & Informasi Harga */}
      <div>
        <h2 className="text-lg font-bold text-slate-950 tracking-tight">Widget Pemesanan</h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Harga: <span className="font-extrabold text-emerald-700 text-sm">Rp {space.pricePerHour?.toLocaleString('id-ID')}</span> / jam
        </p>
      </div>

      <hr className="border-slate-100" />

      {/* 1. SELEKSI TANGGAL MAIN */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          1. Pilih Tanggal
        </label>
        <input
          type="date"
          min={todayStr} // Mencegah user booking tanggal kemarin
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedTimes([]); // Reset pilihan jam jika tanggal diubah
          }}
          className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
        />
      </div>

      {/* 2. SELEKSI JAM MAIN (Hanya terbuka jika tanggal sudah dipilih) */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          2. Pilih Jam Main
        </label>

        {selectedDate ? (
          loadingHours ? (
            <div className="text-center py-4 text-xs text-slate-400 animate-pulse font-medium">
              Memeriksa ketersediaan jam...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-55 overflow-y-auto pr-1 scrollbar-thin">
              {availableHours.map((time) => {
                const isSelected = selectedTimes.includes(time);

                // ◄ PERBAIKAN DI SINI: Ekstrak string "14:00" menjadi angka 14
                const hourNumber = parseInt(time.split(':')[0]);

                // Cek apakah angka jam tersebut ada di dalam array bookedHours dari backend (misal: [14, 15, 16])
                const isBooked = bookedHours.includes(hourNumber);

                return (
                  <button
                    key={time}
                    disabled={isBooked} // Otomatis terkunci jika sudah di-booking
                    onClick={() => handleTimeClick(time)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all duration-200 ${isBooked
                      ? 'bg-slate-100 border-slate-200 text-slate-300 line-through cursor-not-allowed' // Tampilan jam hangus
                      : isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
            Silakan pilih tanggal terlebih dahulu
          </div>
        )}
      </div>

      {/* 3. RINGKASAN PEMBAYARAN (Otomatis muncul jika jam sudah dipilih) */}
      {selectedTimes.length > 1 && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 animate-fadeIn">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Durasi Sewa:</span>
            <span className="text-slate-800 font-bold">
              {selectedTimes[0]} s/d {selectedTimes[selectedTimes.length - 1]} ({totalHours} Jam)
            </span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Biaya Sewa:</span>
            <span className="text-slate-800 font-bold">
              {totalHours} x Rp {space?.pricePerHour?.toLocaleString('id-ID')}
            </span>
          </div>
          <hr className="border-slate-200/60 my-1" />
          <div className="flex justify-between text-xs font-bold text-slate-900">
            <span>Total Bayar:</span>
            <span className="text-emerald-700 font-extrabold text-sm">
              Rp {totalBelanja.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      )}

      {/* TOMBOL AKSI UTAMA */}
      <Button
        type="button"
        disabled={!selectedDate || selectedTimes.length < 2}
        loading={false} // Nanti ini bisa dinamis pakai state saat kita integrasikan ke API payment
        onClick={() => {
          // Aksi checkout pembayaran akan ditaruh di sini
          triggerToast('success', 'Berhasil', 'Melanjutkan ke proses pembayaran...');
        }}
      >
        Lanjutkan ke Pembayaran
      </Button>
    </div>
  )
}

export default BookingWidget