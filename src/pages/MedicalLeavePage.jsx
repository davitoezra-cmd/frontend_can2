import React, { useState, useEffect } from 'react';
import SidebarEmployee from '../components/SidebarEmployee';
import NavbarEmployee from '../layouts/NavbarEmployee';
import MedicalStats from '../medical/MedicalStats';
import MedicalFilter from '../medical/MedicalFilter';
import MedicalTable from '../medical/MedicalTable';
import MedicalModal from '../medical/MedicalModal';
import MedicalDetailModal from '../medical/MedicalDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import {apiFetch} from '../api/apiFetch';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';

const MedicalLeavePage = () => {
  const [medicals, setMedicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // State User Profile
  const [user, setUser] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState(null);

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
    fetchMedicals();
    fetchProfile();
  }, []);

  const fetchMedicals = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get('/employee/medical-leave');
      if (response.data.success) {
        setMedicals(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data pengajuan sakit.');
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

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Ingin menghapus pengajuan izin sakit ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: { popup: 'rounded-4' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch.delete(`/employee/medical-leave/${id}`);
          if (response.data.success) {
            Swal.fire({ title: 'Berhasil!', text: response.data.message, icon: 'success' });
            fetchMedicals();
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Gagal menghapus pengajuan.');
        }
      }
    });
  };

  const filteredMedicals = medicals.filter((item) => {
    const matchesSearch = item.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || item.status === statusFilter;
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

      {/* Area Konten Utama Halaman Sakit */}
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
          
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
            <div>
              <h3 className="fw-bold text-dark mb-1 fs-4 fs-md-3">Pengajuan Sakit</h3>
              <p className="text-muted mb-0 small">Upload surat dokter dan kirim pengajuan izin sakit Anda.</p>
            </div>
            
            {/* Tombol Ajukan Sakit Responsif & Anti-Overlap */}
            <button
              className="btn text-white rounded-3 px-3 py-2 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm flex-shrink-0"
              style={{ backgroundColor: '#4F46E5' }}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <FaPlus /> + Ajukan Sakit
            </button>
          </div>

          {loading ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 bg-white text-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="d-flex flex-column gap-3 gap-md-4">
              <MedicalStats data={medicals} />
              
              <MedicalFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />

              {/* Pembungkus Tabel Agar Rapi, Bersih, dan Support Mobile Horizontal Scroll */}
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="responsive-table-wrapper">
                  <MedicalTable
                    data={filteredMedicals}
                    onDetail={(id) => { setSelectedDetailId(id); setIsDetailModalOpen(true); }}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <MedicalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchMedicals} />
      <MedicalDetailModal id={selectedDetailId} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />
    </div>
  );
};

export default MedicalLeavePage;