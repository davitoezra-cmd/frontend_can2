import React, { useState, useEffect } from 'react';
import {apiFetch} from '../api/apiFetch';
import SidebarEmployee from '../components/SidebarEmployee';
import NavbarEmployee from '../layouts/NavbarEmployee';
import LoadingSpinner from '../components/LoadingSpinner';
import BusinessTripStats from '../businessTrip/BusinessTripStats';
import BusinessTripFilter from '../businessTrip/BusinessTripFilter';
import BusinessTripTable from '../businessTrip/BusinessTripTable';
import BusinessTripFormModal from '../businessTrip/BusinessTripFormModal';
import BusinessTripDetailModal from '../businessTrip/BusinessTripDetailModal';

import { FaPlus, FaSync } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const BusinessTripPage = () => {
  const [businessTrips, setBusinessTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // State User Profile
  const [user, setUser] = useState(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

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

  // Modal Absensi State
  const [attendanceModal, setAttendanceModal] = useState({
    isOpen: false,
    type: 'checkin', // 'checkin' | 'checkout'
    data: null,
  });

  useEffect(() => {
    fetchBusinessTrips();
    fetchProfile();
  }, []);

  // Fetch All List
  const fetchBusinessTrips = async () => {
    try {
      setLoading(true);
      const response = await apiFetch.get('/employee/business-trip');
      if (response.data?.success) {
        setBusinessTrips(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengambil data dinas luar.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await apiFetch.get('/employee/profile');
      if (response.data?.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      // Silent error or handle toast if necessary without breaking flow
    }
  };

  // Fetch Single Detail
  const handleDetail = async (id) => {
    try {
      const response = await apiFetch.get(`/employee/business-trip/${id}`);
      if (response.data?.success) {
        setSelectedDetail(response.data.data);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat detail.');
    }
  };

  // Create
  const handleCreateSubmit = async (formData, resetForm) => {
    try {
      setBtnLoading(true);
      const response = await apiFetch.post('/employee/business-trip', formData);
      if (response.data?.success) {
        toast.success(response.data.message || 'Pengajuan dinas luar berhasil dikirim.');
        setIsFormModalOpen(false);
        resetForm();
        fetchBusinessTrips();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim pengajuan.');
    } finally {
      setBtnLoading(false);
    }
  };

  // Delete
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Pengajuan?',
      text: 'Pengajuan dinas luar yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      customClass: { popup: 'rounded-4' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch.delete(`/employee/business-trip/${id}`);
          if (response.data?.success) {
            toast.success(response.data.message || 'Pengajuan berhasil dihapus.');
            fetchBusinessTrips();
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Gagal menghapus pengajuan.');
        }
      }
    });
  };

  // Open Modal Check In
  const handleOpenCheckIn = (item) => {
    setAttendanceModal({
      isOpen: true,
      type: 'checkin',
      data: item,
    });
  };

  // Open Modal Check Out
  const handleOpenCheckOut = (item) => {
    setAttendanceModal({
      isOpen: true,
      type: 'checkout',
      data: item,
    });
  };

  // Submit Check In & Check Out API
  const handleAttendanceSubmit = async (id, formData) => {
    try {
      setBtnLoading(true);
      const endpoint =
        attendanceModal.type === 'checkin'
          ? `/employee/business-trip/${id}/check-in`
          : `/employee/business-trip/${id}/check-out`;

      const response = await apiFetch.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success) {
        toast.success(response.data.message || 'Absensi berhasil dikirim.');
        setAttendanceModal({ isOpen: false, type: 'checkin', data: null });
        fetchBusinessTrips();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim absensi.');
    } finally {
      setBtnLoading(false);
    }
  };

  // Filter List Data
  const filteredData = businessTrips.filter((item) => {
    const matchesSearch = item.destination.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'Semua' ? true : item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-vh-100 position-relative" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Styles Fix Sidebar Full Height, Smooth Slide Animation & Responsive Table Wrapper */}
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }

        /* Tabel Responsif agar tidak merusak layout mobile */
        .responsive-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .responsive-table-wrapper table th,
        .responsive-table-wrapper table td {
          white-space: nowrap;
          vertical-align: middle;
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

      {/* Area Konten Utama Halaman Business Trip */}
      <div className="main-content-wrapper d-flex flex-column min-w-0">
        
        {/* Navbar Layout Atas */}
        <div className="sticky-top" style={{ zIndex: 1020 }}>
          <NavbarEmployee
            user={user}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          />
        </div>

        {/* Main Content Area */}
        <main className="container-fluid p-3 p-md-4 flex-grow-1 overflow-auto" style={{ maxWidth: '1600px' }}>
          
          {/* Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
              <h3 className="fw-bold text-dark mb-1 fs-4 fs-md-3">Business Trip</h3>
              <p className="text-muted mb-0 small">Ajukan dinas luar dan lakukan absensi selama menjalankan tugas di luar kantor.</p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-light px-3 py-2 rounded-3 shadow-sm border d-flex align-items-center justify-content-center gap-2 flex-shrink-0"
                onClick={fetchBusinessTrips}
                disabled={loading}
                title="Refresh Data"
              >
                <FaSync className={loading ? 'spin' : ''} />
              </button>
              <button
                className="btn text-white px-4 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 fw-semibold flex-shrink-0"
                style={{ backgroundColor: '#4F46E5' }}
                onClick={() => setIsFormModalOpen(true)}
              >
                <FaPlus /> + Ajukan Dinas Luar
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <BusinessTripStats data={businessTrips} />

          {/* Search & Filter */}
          <BusinessTripFilter
            search={search}
            setSearch={setSearch}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />

          {/* Table Content */}
          {loading ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 bg-white text-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="responsive-table-wrapper">
                <BusinessTripTable
                  data={filteredData}
                  onDetail={handleDetail}
                  onDelete={handleDelete}
                  onCheckInOpen={handleOpenCheckIn}
                  onCheckOutOpen={handleOpenCheckOut}
                  onOpenCreate={() => setIsFormModalOpen(true)}
                />
              </div>
            </div>
          )}

          {/* Modal Form Pengajuan Baru */}
          <BusinessTripFormModal
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            onSubmit={handleCreateSubmit}
            loading={btnLoading}
          />

          {/* Modal Detail */}
          <BusinessTripDetailModal
            detailData={selectedDetail}
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedDetail(null);
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default BusinessTripPage;