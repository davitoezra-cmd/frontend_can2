import React, { useState, useEffect } from 'react';
import {apiFetch} from '../api/apiFetch';
import QrScannerCard from '../attendance/QrScannerCard';
import AttendanceStatus from '../dashboard/AttendanceStatus';
import SidebarEmployee from '../components/SidebarEmployee';
import NavbarEmployee from '../layouts/NavbarEmployee';

const ScanAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });

  // Deteksi Lokasi GPS Otomatis
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Gagal mendapatkan lokasi GPS:", error)
      );
    }
  }, []);

  const handleScanSuccess = async (qrToken) => {
    setLoading(true);
    setStatusResult(null);

    try {
      // POST ke http://localhost:8000/api/attendance/scan
      const response = await apiFetch.post('/employee/attendance/scan', {
        token: qrToken,
      });

      setStatusResult({
        type: 'success',
        message: response.data.message || 'Absensi via QR berhasil dicatat!',
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Terjadi kesalahan saat memproses absensi QR.';

      setStatusResult({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex bg-light min-vh-100">
      {/* Sidebar Employee */}
      <SidebarEmployee
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-grow-1 scan-attendance-main overflow-auto">
        <NavbarEmployee
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className="p-3 p-md-4">
        {/* Top Header Banner */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom bg-white p-3 p-md-4 rounded-4 shadow-sm">
          <div>
            <h4 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
              <i className="bi bi-qr-code-scan text-primary"></i> Absensi QR Code
            </h4>
            <p className="text-muted small m-0 mt-1">
              Scan QR Code kantor untuk melakukan <b>Check In</b> atau <b>Check Out</b> harian Anda
            </p>
          </div>
          <div className="mt-3 mt-md-0">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-6 fw-semibold">
              <i className="bi bi-calendar3 me-2"></i>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Alert Response Status (Tetap Pakai Komponen Bawaan Kamu) */}
        <div className="mb-3">
          <AttendanceStatus statusData={statusResult} />
        </div>

        {/* Main Grid Section */}
        <div className="row g-4">
          
          {/* Left Column: QR Scanner & Info */}
          <div className="col-12 col-lg-7">
            
            {/* Loading Indicator */}
            {loading && (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center mb-4">
                <div className="spinner-border text-primary mx-auto mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h6 className="fw-bold text-dark mb-1">Memvalidasi Token QR...</h6>
                <span className="text-muted small">Mohon tunggu sebentar, sistem sedang mengirim data ke server.</span>
              </div>
            )}

            {/* Scanner Component */}
            {!loading && (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="card-body p-0">
                  <QrScannerCard onScanSuccess={handleScanSuccess} />
                </div>
              </div>
            )}

            {/* Practical Guide Box */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4">
                  <i className="bi bi-info-circle-fill fs-3"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">Sistem Otomatis</h6>
                  <p className="text-muted small mb-0">
                    Scan pertama otomatis menjadi <span className="text-success fw-bold">Check In</span>. Scan berikutnya di hari yang sama akan tercatat sebagai <span className="text-primary fw-bold">Check Out</span>.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive GPS Location Map */}
          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-white p-3 border-bottom d-flex align-items-center justify-content-between">
                <h6 className="fw-bold text-dark m-0">
                  <i className="bi bi-geo-alt-fill text-danger me-2"></i> Lokasi Anda Terdeteksi
                </h6>
                {location.lat && (
                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                    <i className="bi bi-dot me-1"></i>GPS Aktif
                  </span>
                )}
              </div>
              <div className="card-body p-0 position-relative">
                {location.lat && location.lng ? (
                  <>
                    {/* Map Widget (OpenStreetMap Embed) */}
                    <iframe
                      title="GPS Location Map"
                      width="100%"
                      height="240"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.003}%2C${location.lat - 0.003}%2C${parseFloat(location.lng) + 0.003}%2C${parseFloat(location.lat) + 0.003}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
                    ></iframe>
                    
                    {/* Location Coordinates & Direct Link */}
                    <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center">
                      <small className="text-muted font-monospace" style={{ fontSize: '12px' }}>
                        Lat: {location.lat.toFixed(6)} | Lng: {location.lng.toFixed(6)}
                      </small>
                      <a 
                        href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary rounded-pill py-1 px-3 fw-semibold"
                        style={{ fontSize: '12px' }}
                      >
                        <i className="bi bi-map me-1"></i> Buka Google Maps
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="p-5 text-center text-muted">
                    <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                    <p className="small mb-0">Mendeteksi koordinat GPS lokasi Anda...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        </main>
      </div>
      <style>{`
        .scan-attendance-main { width: 100%; min-width: 0; margin-left: 0; }
        @media (min-width: 992px) {
          .scan-attendance-main { margin-left: 260px; width: calc(100% - 260px); }
        }
      `}</style>
    </div>
  );
};

export default ScanAttendance;