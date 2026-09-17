import React, { useState, useEffect } from 'react';
import {apiFetch} from '../api/apiFetch';
import SidebarEmployee from '../components/SidebarEmployee';
import LogoutButton from '../components/LogoutButton';
import SelfieCard from '../attendance/SelfieCard';
import QrScannerCard from '../attendance/QrScannerCard';
import LocationCard from '../attendance/LocationCard';
import AttendanceStatusCard from '../attendance/AttendanceStatusCard';
import AttendanceHistoryCard from '../attendance/AttendanceHistoryCard';

const Attendance = () => {
  const [todayData, setTodayData] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myShift, setMyShift] = useState(null);
  const [shiftLoading, setShiftLoading] = useState(true);
  
  // State untuk Tab Mode Absen (Selfie / QR)
  const [activeTab, setActiveTab] = useState('selfie');

  // State Toggle Sidebar (Default terbuka di Desktop, tertutup di Mobile)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto-close sidebar jika layar berukuran mobile saat pertama kali load
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchTodayAttendance();
    fetchMyShift();
    getLocation();
  }, []);

  const fetchMyShift = async () => {
    setShiftLoading(true);
    try {
      const res = await apiFetch.get('/employee/my-shift');
      setMyShift(res.data?.data ?? null);
    } catch (err) {
      console.error('Gagal memuat shift hari ini:', err);
      setMyShift(null);
    } finally {
      setShiftLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await apiFetch.get('/employee/attendance');
      if (res.data?.success) {
        setTodayData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (err) => setLocationError('Gagal mengambil lokasi GPS'),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('Geolocation tidak didukung di browser ini');
    }
  };

  // Convert Base64 (from react-webcam) into File object for Multipart Form Upload
  const base64ToFile = (base64, filename) => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleCheckIn = async () => {
    if (!selfieImage) return alert('Silakan ambil foto selfie terlebih dahulu!');

    setLoading(true);
    const formData = new FormData();
    formData.append('image_selfie', base64ToFile(selfieImage, 'selfie.jpg'));
    if (location.latitude) formData.append('latitude', location.latitude);
    if (location.longitude) formData.append('longitude', location.longitude);

    try {
      const res = await apiFetch.post('/employee/attendance/check-in', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message || 'Check In Berhasil!');
      setSelfieImage(null);
      fetchTodayAttendance();
      fetchMyShift();
    } catch (err) {
      alert(err.response?.data?.message || 'Check in gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selfieImage) return alert('Silakan ambil foto selfie terlebih dahulu!');

    setLoading(true);
    const formData = new FormData();
    formData.append('image_selfie', base64ToFile(selfieImage, 'selfie.jpg'));
    if (location.latitude) formData.append('latitude', location.latitude);
    if (location.longitude) formData.append('longitude', location.longitude);

    try {
      const res = await apiFetch.post('/employee/attendance/check-out', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message || 'Check Out Berhasil!');
      setSelfieImage(null);
      fetchTodayAttendance();
      fetchMyShift();
    } catch (err) {
      alert(err.response?.data?.message || 'Check out gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanSuccess = async (token) => {
    try {
      const res = await apiFetch.post("/employee/attendance/scan", {
        token,
      });

      alert(res.data.message);
      fetchTodayAttendance();
      fetchMyShift();
    } catch (err) {
      alert(err.response?.data?.message || 'Scan QR gagal');
    }
  };

  return (
    <div className="min-vh-100 position-relative bg-light">
      
      {/* Styles Fix Sidebar Full Height & Smooth Slide Animation */}
      <style>{`
        /* Dynamic Overlay Backdrop (Mobile Only) */
        .sidebar-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(3px);
          z-index: 1040;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .sidebar-backdrop.show {
          opacity: 1;
          visibility: visible;
        }

        /* Sidebar Wrapper Fix Full Height */
        .sidebar-container {
          width: 260px;
          height: 100vh !important;
          max-height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          bottom: 0 !important;
          left: 0 !important;
          z-index: 1050;
          background-color: #0f172a;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          overflow-y: auto;
        }

        /* State ketika Sidebar Tertutup (Mobile Only) */
        @media (max-width: 991.98px) {
          .sidebar-container.closed {
            transform: translateX(-100%);
          }
          .sidebar-container.open {
            transform: translateX(0);
          }
          .main-content-wrapper {
            margin-left: 0 !important;
          }
        }

        /* Main Content Transition Shift & Permanent Sidebar on Desktop */
        @media (min-width: 992px) {
          .sidebar-container {
            transform: translateX(0) !important;
          }
          .main-content-wrapper {
            margin-left: 260px !important;
          }
        }

        .main-content-wrapper {
          min-height: 100vh;
          transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Backdrop Gelap saat Sidebar Terbuka di Mobile */}
      <div 
        className={`sidebar-backdrop d-lg-none ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Employee Container (Fixed & Full Height) */}
      <aside className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`}>
        
        {/* Tombol Silang (X) - Hanya Muncul di Mobile (d-lg-none) */}
        <button 
          className="btn btn-sm text-white rounded-circle position-absolute top-0 end-0 m-3 d-flex d-lg-none align-items-center justify-content-center"
          style={{ 
            width: '32px', 
            height: '32px', 
            zIndex: 1060, 
            backgroundColor: 'rgba(255, 255, 255, 0.12)', 
            border: 'none' 
          }}
          onClick={() => setIsSidebarOpen(false)}
          title="Tutup Sidebar"
        >
          <i className="bi bi-x-lg fs-6"></i>
        </button>

        {/* Komponen Utama Sidebar */}
        <SidebarEmployee
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          showBackdrop={false}
          showMobileClose={false}
        />
      </aside>

      {/* Area Konten Utama Halaman Presensi */}
      <div className="main-content-wrapper d-flex flex-column min-w-0">
        
        {/* Top Navbar Header dengan Tombol Toggle Sidebar */}
        <header className="bg-white border-bottom px-3 px-md-4 py-3 sticky-top shadow-sm" style={{ borderColor: '#e2e8f0', zIndex: 1020 }}>
          <div className="d-flex align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              {/* Tombol Toggle Buka/Tutup Sidebar - Hanya Muncul di Mobile (d-lg-none) */}
              <button 
                className="btn btn-light p-2 border-0 rounded-3 text-secondary d-flex d-lg-none align-items-center justify-content-center" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title="Buka Sidebar"
              >
                <i className="bi bi-list fs-4"></i>
              </button>
              <span className="fw-bold text-dark fs-6 d-none d-sm-inline">
                Sistem Presensi Karyawan
              </span>
            </div>

            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill small fw-semibold d-none d-md-inline-flex align-items-center">
                <i className="bi bi-calendar3 me-1"></i>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <LogoutButton compact className="navbar-logout-btn" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-3 p-md-4 flex-grow-1 overflow-auto container-fluid" style={{ maxWidth: '1600px' }}>
          
          {/* Header Banner Modern */}
          <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white">
            <div className="card-body p-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
              <div>
                <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                  <i className="bi bi-person-check-fill text-primary fs-4"></i> Halaman Presensi
                </h5>
                <p className="text-muted small m-0">
                  Pilih metode absensi via Selfie Camera atau Pemindai QR Code
                </p>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white">
            <div className="card-body p-3">
              {shiftLoading ? (
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <span className="spinner-border spinner-border-sm" /> Memuat shift hari ini...
                </div>
              ) : !myShift ? (
                <div className="alert alert-warning mb-0 py-2">
                  <i className="bi bi-calendar2-x me-2" /> Belum ada mapping shift untuk hari ini. Backend akan menolak Check In jika tidak ada sesi shift yang valid.
                </div>
              ) : myShift.status === 'off' ? (
                <div className="alert alert-secondary mb-0 py-2">
                  <i className="bi bi-moon-stars me-2" /> Jadwal hari ini <strong>OFF</strong>.
                </div>
              ) : (
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                  <div>
                    <small className="text-muted d-block">Shift aktif hari ini</small>
                    <div className="fw-bold">{myShift.shift?.name || myShift.shift?.code || 'Work Shift'}</div>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-primary-subtle text-primary border px-3 py-2">
                      <i className="bi bi-clock me-1" /> {String(myShift.shift?.jam_masuk || '').slice(0,5)} - {String(myShift.shift?.jam_pulang || '').slice(0,5)}
                    </span>
                    <span className="badge bg-light text-dark border px-3 py-2">
                      Toleransi {myShift.shift?.late_tolerance_minutes ?? 10} menit
                    </span>
                    <span className="badge bg-light text-dark border px-3 py-2">
                      Batas masuk {String(myShift.shift?.batas_telat || '').slice(0,5)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Grid: Left (Metode Absen), Right (Location & Status) */}
          <div className="row g-3">
            
            {/* Kolom Kiri: Kamera Selfie / Scan QR & Tombol Ringkas */}
            <div className="col-12 col-lg-7 col-xl-7">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                
                {/* Custom Tab Selector Modern */}
                <div className="p-2.5 bg-light border-bottom">
                  <div className="nav nav-pills nav-fill gap-2 bg-white p-1 rounded-3 border">
                    <button
                      className={`nav-link rounded-3 fw-semibold transition-all py-1.5 ${activeTab === 'selfie' ? 'active bg-primary text-white shadow-sm' : 'text-muted'}`}
                      onClick={() => setActiveTab('selfie')}
                    >
                      <i className="bi bi-camera-fill me-1"></i> Verifikasi Selfie
                    </button>
                    <button
                      className={`nav-link rounded-3 fw-semibold transition-all py-1.5 ${activeTab === 'qr' ? 'active bg-primary text-white shadow-sm' : 'text-muted'}`}
                      onClick={() => setActiveTab('qr')}
                    >
                      <i className="bi bi-qr-code-scan me-1"></i> Scan QR Code
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="card-body p-3">
                  {activeTab === 'selfie' ? (
                    <div>
                      <SelfieCard selfieImage={selfieImage} setSelfieImage={setSelfieImage} />

                      {/* AREA TOMBOL CHECK IN & CHECK OUT */}
                      <div className="mt-3 pt-2 border-top">
                        {!todayData ? (
                          /* Belum Check In */
                          <button
                            onClick={handleCheckIn}
                            disabled={!selfieImage || loading}
                            className="btn btn-primary py-2 w-100 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                          >
                            {loading ? (
                              <span><i className="spinner-border spinner-border-sm me-1"></i> Memproses...</span>
                            ) : (
                              <span><i className="bi bi-box-arrow-in-right fs-5"></i> PERIKSA MASUK (CHECK IN)</span>
                            )}
                          </button>
                        ) : !todayData.check_out ? (
                          /* Sudah Check In, Belum Check Out */
                          <button
                            onClick={handleCheckOut}
                            disabled={!selfieImage || loading}
                            className="btn btn-danger py-2 w-100 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                          >
                            {loading ? (
                              <span><i className="spinner-border spinner-border-sm me-1"></i> Memproses...</span>
                            ) : (
                              <span><i className="bi bi-box-arrow-left fs-5"></i> PERIKSA KELUAR (CHECK OUT)</span>
                            )}
                          </button>
                        ) : (
                          /* Sudah Check In & Check Out Hari Ini */
                          <div className="alert alert-success text-center py-2 mb-0 rounded-3 small fw-semibold">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Presensi hari ini sudah lengkap!
                          </div>
                        )}

                        {!selfieImage && !todayData?.check_out && (
                          <div className="text-center text-muted small mt-1" style={{ fontSize: '0.8rem' }}>
                            *Ambil foto selfie dulu untuk mengaktifkan tombol
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <QrScannerCard onScanSuccess={handleQRScanSuccess} />
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Kolom Kanan: Lokasi GPS & Presensi Card */}
            <div className="col-12 col-lg-5 col-xl-5 d-flex flex-column gap-3">
              
              {/* Box Lokasi GPS Integrated */}
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-body p-0">
                  <LocationCard location={location} getLocation={getLocation} locationError={locationError} />
                  
                  {location.latitude && location.longitude && (
                    <div className="px-3 pb-3">
                      <div className="rounded-3 overflow-hidden border">
                        <iframe
                          title="GPS Map"
                          width="100%"
                          height="140"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.003}%2C${location.latitude - 0.003}%2C${parseFloat(location.longitude) + 0.003}%2C${parseFloat(location.latitude) + 0.003}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`}
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Absensi Hari Ini & Action Card */}
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-body p-3">
                  <AttendanceStatusCard 
                    todayData={todayData} 
                    loading={loading}
                    onCheckIn={handleCheckIn} 
                    onCheckOut={handleCheckOut}
                    disabled={!selfieImage}
                  />
                </div>
              </div>

              {/* Riwayat Presensi Singkat */}
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-body p-3">
                  <AttendanceHistoryCard todayData={todayData} />
                </div>
              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default Attendance;