import React, { useEffect, useState } from 'react';
import {apiFetch} from '../api/apiFetch';
import SidebarEmployee from '../components/SidebarEmployee';
import StatisticCards from '../dashboard/StatisticCards';
import AttendanceStatus from '../dashboard/AttendanceStatus';
import RecentActivities from '../dashboard/RecentActivities';
import NavbarEmployee from "../layouts/NavbarEmployee";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State Toggle Sidebar (Default terbuka di Desktop, tertutup di Mobile)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 992 : true
  );

  // Auto-close sidebar jika layar berukuran mobile saat pertama kali load
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Run initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await apiFetch.get('/employee/dashboard');
      if (res.data?.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const todayDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-vh-100 position-relative" style={{ backgroundColor: '#f1f5f9' }}>
      
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
          background-color: #0f172a; /* Menyesuaikan background sidebar */
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
            transform: translateX(0) !important; /* Always Visible on Desktop */
          }
          .main-content-wrapper {
            margin-left: 260px !important; /* Always Pushed on Desktop */
          }
        }

        .main-content-wrapper {
          min-height: 100vh;
          transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Backdrop Overlay Saat Sidebar Terbuka di Mobile */}
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

      {/* Area Konten Utama Dashboard */}
      <div className="main-content-wrapper d-flex flex-column min-w-0">
        
        {/* Header Navigation */}
        <NavbarEmployee
    user={dashboardData?.user}
    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
/>

        {/* Main Dashboard Content */}
        <main className="p-3 p-md-4 container-fluid" style={{ maxWidth: '1600px' }}>
          {loading ? (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
              <div className="text-center p-4 bg-white rounded-4 shadow-sm border border-0">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h6 className="fw-bold mb-1 text-dark">Memuat Dashboard...</h6>
                <p className="text-muted small m-0">Menyiapkan data presensi Anda</p>
              </div>
            </div>
          ) : (
            <>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1 fs-4 fs-md-3" style={{ color: '#0f172a' }}>
                Selamat datang, {dashboardData?.user?.name || 'Karyawan'} 👋
              </h3>
              <p className="text-muted small mb-0">
                {todayDateFormatted} • <span className="badge bg-primary-subtle text-primary fw-semibold rounded-2 px-2 py-1">Employee Portal</span>
              </p>
            </div>
          </div>

          <div className="mb-4">
            <StatisticCards stats={dashboardData?.statistics} />
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div className="card-body p-3 p-md-4">
                  <AttendanceStatus today={dashboardData?.today} />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div className="card-body p-3 p-md-4">
                  <RecentActivities activities={dashboardData?.recent_activities} />
                </div>
              </div>
            </div>
          </div>
            </>
          )}

        </main>

      </div>

    </div>
  );
};

export default Dashboard;