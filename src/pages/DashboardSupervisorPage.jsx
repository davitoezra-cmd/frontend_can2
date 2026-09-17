import React, { useState, useEffect, lazy, Suspense } from 'react';
import {apiFetch} from '../api/apiFetch';
import DashboardCards from '../components/supervisor/DashboardCards';

const SupervisorCharts = lazy(() => import('../components/supervisor/SupervisorCharts') );


const DashboardSupervisorPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState({
    total_employee: 0,
    hadir: 0,
    terlambat: 0,
  });
  const [todayAttendance, setTodayAttendance] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch.get('/supervisor/dashboard');
      if (response.data && response.data.success) {
        setUser(response.data.user || null);
        setStatistics(
          response.data.statistics || {
            total_employee: 0,
            hadir: 0,
            terlambat: 0,
          }
        );
        // Mendapatkan array attendance dari response backend
        setTodayAttendance(
          response.data.today_attendance || response.data.data || []
        );
      } else {
        setError('Gagal memuat data dashboard.');
      }
    } catch (err) {
      console.error('Fetch dashboard error:', err);
      setError(
        err.response?.data?.message || 'Terjadi kesalahan saat menghubungi server.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  

  // ================= PENGOLAHAN DATA DARI BACKEND =================
  
  // Helper untuk membaca nilai status secara konsisten dari DB
  const normalizeStatus = (statusStr) => {
    if (!statusStr) return '';
    const clean = statusStr.toString().toLowerCase().trim().replace('_', ' ');
    if (clean === 'late' || clean === 'terlambat') return 'terlambat';
    if (clean === 'hadir' || clean === 'present' || clean === 'on time') return 'hadir';
    return clean;
  };

  // Menghitung jumlah per status dari todayAttendance, fallback ke objek statistics backend
  const countStatus = (targetStatus) => {
    const keyTarget = normalizeStatus(targetStatus);
    
    // Filter langsung dari array hari ini yang dikirim Laravel
    const countFromArray = todayAttendance.filter((item) => {
      const itemStatus = normalizeStatus(item.status);
      return itemStatus === keyTarget;
    }).length;

    if (todayAttendance.length > 0) return countFromArray;

    // Fallback jika backend mengelompokkan ke `statistics`
    if (keyTarget === 'hadir') return statistics.hadir || 0;
    if (keyTarget === 'terlambat') return statistics.terlambat || statistics.late || 0;
    
    return 0;
  };

  const hadirCount = countStatus('hadir');
  const terlambatCount = countStatus('terlambat');
  const chartData = [
  {
    name: 'Hadir',
    value: hadirCount,
    color: '#198754',
  },
  {
    name: 'Terlambat',
    value: terlambatCount,
    color: '#FFC107',
  },
];

  

  // Total Karyawan & Persentase Kehadiran
  const totalEmployees = statistics.total_employee || todayAttendance.length || 0;
  
  // Menghitung total partisipasi (Hadir + Terlambat)
  const totalPresent = hadirCount + terlambatCount;
  const attendanceRate = totalEmployees > 0
    ? Math.min(100, Math.round((totalPresent / totalEmployees) * 100))
    : 0;

  // Filter 5 Karyawan Terakhir yang Check-In
  const recentCheckIns = [...todayAttendance]
    .filter((item) => item.check_in !== null && item.check_in !== '')
    .sort((a, b) => (b.check_in || '').localeCompare(a.check_in || ''))
    .slice(0, 5);

  // Helper Badge Warna Status
  const getBadgeClass = (statusStr) => {
    const st = normalizeStatus(statusStr);
    if (st === 'hadir') return 'bg-success text-white';
    if (st === 'terlambat') return 'bg-warning text-dark';
    return 'bg-secondary text-white';
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold m-0">Dashboard Supervisor</h4>
          <p className="text-muted small m-0 mt-1">
            Selamat datang, <span className="fw-semibold text-dark">{user?.name || 'Supervisor'}</span> • {formattedDate}
          </p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-outline-primary d-inline-flex align-items-center gap-2 shadow-sm"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted small m-0">Memuat data dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Cards Statistics */}
          <DashboardCards statistics={statistics} />

          <Suspense
  fallback={
    <div className="card border-0 shadow-sm rounded-4 mt-3">
      <div className="card-body text-center py-5">
        <div className="spinner-border text-primary">
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="text-muted small mt-2 mb-0">
          Memuat grafik...
        </p>
      </div>
    </div>
  }
>
  <SupervisorCharts chartData={chartData} />
</Suspense>

          {/* ================= SECTION PRESENTASE KEHADIRAN ================= */}
          <div className="row g-3 g-md-4 mt-1">
            
          
           

            {/* GRAFIK 3: Progress Bar Persentase Kehadiran */}
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
                  <div>
                    <h5 className="fw-bold text-dark m-0">Persentase Kehadiran Hari Ini</h5>
                    <p className="text-muted small m-0 mt-1">
                      Tingkat partisipasi kehadiran dari total {totalEmployees} karyawan.
                    </p>
                  </div>
                  <h2 className="fw-bold text-success m-0">{attendanceRate}%</h2>
                </div>

                {/* Progress Bar Utama */}
                <div className="progress rounded-pill mb-3" style={{ height: '22px' }}>
                  <div
                    className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{ width: `${attendanceRate}%` }}
                    aria-valuenow={attendanceRate}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {attendanceRate}%
                  </div>
                </div>

                {/* Stat Grid Mini (Hanya 2 Status: Hadir & Terlambat) */}
                <div className="row g-2 text-center mt-2 justify-content-center">
                  <div className="col-6 col-md-4">
                    <div className="p-2 rounded-3 bg-light border">
                      <div className="small text-muted">Hadir</div>
                      <div className="fw-bold text-success fs-6">{hadirCount}</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="p-2 rounded-3 bg-light border">
                      <div className="small text-muted">Terlambat</div>
                      <div className="fw-bold text-warning fs-6">{terlambatCount}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ================= DAFTAR 5 KARYAWAN TERAKHIR CHECK IN ================= */}
          <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 mt-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold text-dark m-0">5 Karyawan Terakhir Check-In</h5>
                <p className="text-muted small m-0 mt-1">Aktivitas presensi terbaru hari ini</p>
              </div>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold small">
                Live Status
              </span>
            </div>

            {recentCheckIns.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-clock-history fs-2 d-block mb-2 text-secondary"></i>
                Belum ada data check-in hari ini.
              </div>
            ) : (
              <div className="row g-3">
                {recentCheckIns.map((item, index) => {
                  const empName = item.employee?.name || item.employee_name || `Karyawan ${index + 1}`;
                  const dept = item.employee?.department?.name || item.employee?.department || item.department || 'Operational';
                  
                  const checkInTime = item.check_in || '-';
                  const checkOutTime = item.check_out || '-';
                  const statusText = item.status || 'Hadir';

                  return (
                    <div key={item.id || index} className="col-12 col-md-6 col-lg-4">
                      <div className="p-3 rounded-4 border bg-light-subtle h-100 d-flex flex-column justify-content-between">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2 text-truncate">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold small flex-shrink-0" style={{ width: '36px', height: '36px' }}>
                              {empName.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-truncate">
                              <h6 className="fw-bold text-dark m-0 text-truncate" style={{ fontSize: '0.95rem' }}>
                                {empName}
                              </h6>
                              <span className="text-muted small">{dept}</span>
                            </div>
                          </div>
                          <span className={`badge ${getBadgeClass(statusText)} rounded-pill px-2 py-1 small`}>
                            {statusText}
                          </span>
                        </div>

                        <div className="border-top pt-2 mt-2 d-flex align-items-center justify-content-between text-muted small">
                          <div>
                            <i className="bi bi-box-arrow-in-right text-success me-1"></i>
                            <span className="fw-semibold text-dark">{checkInTime}</span>
                          </div>
                          <div>
                            <i className="bi bi-box-arrow-right text-danger me-1"></i>
                            <span>{checkOutTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Style CSS animasi icon refresh */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DashboardSupervisorPage;