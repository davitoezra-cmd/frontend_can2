import React, { useState, useEffect } from 'react';

import SidebarEmployee from '../components/SidebarEmployee';
import NavbarEmployee from '../layouts/NavbarEmployee';

import LeaveStats from '../leave/LeaveStats';
import LeaveFilter from '../leave/LeaveFilter';
import LeaveTable from '../leave/LeaveTable';
import LeaveModal from '../leave/LeaveModal';
import LeaveDetailModal from '../leave/LeaveDetailModal';

import LoadingSpinner from '../components/LoadingSpinner';
import {apiFetch} from '../api/apiFetch';

import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';

const LeaveRequestPage = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // User Profile
  const [user, setUser] = useState(null);

  // Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState(null);

  // Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // =========================================================
  // RESPONSIVE SIDEBAR
  // =========================================================

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

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // =========================================================
  // FETCH DATA
  // =========================================================

  useEffect(() => {
    fetchLeaves();
    fetchProfile();
  }, []);

  // =========================================================
  // FETCH LEAVES
  // =========================================================

  const fetchLeaves = async () => {
    setLoading(true);

    try {
      const response = await apiFetch.get('/employee/leave');

      if (response.data?.success) {
        setLeaves(response.data.data || []);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Gagal mengambil data cuti.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH PROFILE
  // =========================================================

  const fetchProfile = async () => {
    try {
      const response = await apiFetch.get('/employee/profile');

      if (response.data?.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      // Tidak mengganggu halaman jika profile gagal dimuat
    }
  };

  // =========================================================
  // DELETE LEAVE
  // =========================================================

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Ingin menghapus pengajuan cuti ini?',
      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',

      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',

      customClass: {
        popup: 'rounded-4',
      },
    }).then(async (result) => {
      if (!result.isConfirmed) {
        return;
      }

      try {
        const response = await apiFetch.delete(
          `/employee/leave/${id}`
        );

        if (response.data?.success) {
          Swal.fire({
            title: 'Berhasil!',
            text: response.data.message,
            icon: 'success',
            confirmButtonColor: '#4F46E5',
          });

          fetchLeaves();
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
          'Gagal menghapus pengajuan.'
        );
      }
    });
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredLeaves = leaves.filter((item) => {
    const reason = item.reason || '';

    const matchesSearch = reason
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'Semua' ||
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  // =========================================================
  // CLOSE CREATE MODAL
  // =========================================================

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // =========================================================
  // OPEN DETAIL
  // =========================================================

  const openDetailModal = (id) => {
    setSelectedDetailId(id);
    setIsDetailModalOpen(true);
  };

  // =========================================================
  // CLOSE DETAIL
  // =========================================================

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDetailId(null);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="min-vh-100 position-relative"
      style={{
        backgroundColor: '#F8FAFC',
      }}
    >

      {/* =====================================================
          CUSTOM STYLE
      ===================================================== */}

      <style>{`

        /* =====================================================
           SIDEBAR BACKDROP
        ===================================================== */

        .sidebar-backdrop {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;

          background-color: rgba(15, 23, 42, 0.4);

          backdrop-filter: blur(3px);

          z-index: 1040;

          opacity: 0;
          visibility: hidden;

          transition:
            opacity 0.3s ease,
            visibility 0.3s ease;
        }

        .sidebar-backdrop.show {
          opacity: 1;
          visibility: visible;
        }


        /* =====================================================
           SIDEBAR
        ===================================================== */

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

          box-shadow:
            4px 0 24px rgba(0, 0, 0, 0.08);

          transition:
            transform 0.35s cubic-bezier(
              0.4,
              0,
              0.2,
              1
            );

          will-change: transform;

          overflow-y: auto;
          overflow-x: hidden;
        }


        /* =====================================================
           MOBILE SIDEBAR
        ===================================================== */

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


        /* =====================================================
           DESKTOP SIDEBAR
        ===================================================== */

        @media (min-width: 992px) {

          .sidebar-container {
            transform: translateX(0) !important;
          }

          .main-content-wrapper {
            margin-left: 260px !important;
          }
        }


        /* =====================================================
           MAIN CONTENT
        ===================================================== */

        .main-content-wrapper {
          min-height: 100vh;

          transition:
            margin-left 0.35s cubic-bezier(
              0.4,
              0,
              0.2,
              1
            );

          min-width: 0;
        }


        /* =====================================================
           PAGE CONTENT
        ===================================================== */

        .leave-page-content {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
        }


        /* =====================================================
           RESPONSIVE TABLE
        ===================================================== */

        .responsive-table-wrapper {
          width: 100%;

          overflow-x: auto;

          -webkit-overflow-scrolling: touch;

          scrollbar-width: thin;
        }

        .responsive-table-wrapper table {
          width: 100%;
          min-width: 800px;
        }

        .responsive-table-wrapper table th,
        .responsive-table-wrapper table td {
          white-space: nowrap;
          vertical-align: middle;
        }


        /* =====================================================
           CREATE BUTTON
        ===================================================== */

        .leave-create-button {
          min-height: 44px;
          white-space: nowrap;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .leave-create-button:hover {
          transform: translateY(-1px);

          box-shadow:
            0 6px 18px rgba(79, 70, 229, 0.25) !important;
        }


        /* =====================================================
           FULL SCREEN MODAL OVERRIDE
        ===================================================== */

        /*
         * Class ini akan memaksa modal LeaveModal
         * menggunakan area layar yang jauh lebih besar.
         */

        .leave-fullscreen-modal {
          width: 100vw !important;
          max-width: 100vw !important;

          height: 100vh !important;
          max-height: 100vh !important;

          margin: 0 !important;
        }

        .leave-fullscreen-modal .modal-content {
          height: 100vh !important;
          max-height: 100vh !important;

          border: none !important;
          border-radius: 0 !important;
        }


        /* =====================================================
           MOBILE PAGE
        ===================================================== */

        @media (max-width: 575.98px) {

          .leave-page-content {
            padding-left: 0;
            padding-right: 0;
          }

          .leave-header {
            align-items: stretch !important;
          }

          .leave-create-button {
            width: 100%;
          }

          .responsive-table-wrapper {
            border-radius: 0;
          }
        }


        /* =====================================================
           TABLET
        ===================================================== */

        @media (
          min-width: 576px
        ) and (
          max-width: 991.98px
        ) {

          .leave-create-button {
            min-width: 170px;
          }
        }


        /* =====================================================
           DESKTOP
        ===================================================== */

        @media (min-width: 992px) {

          .leave-page-content {
            padding-left: 4px;
            padding-right: 4px;
          }
        }


        /* =====================================================
           MODAL MOBILE SAFETY
        ===================================================== */

        @media (max-width: 767.98px) {

          .modal-dialog {
            margin: 0 !important;
          }

          .modal-content {
            border-radius: 0 !important;
          }
        }

      `}</style>


      {/* =====================================================
          SIDEBAR BACKDROP
      ===================================================== */}

      <div
        className={`sidebar-backdrop d-lg-none ${
          isSidebarOpen ? 'show' : ''
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`sidebar-container ${
          isSidebarOpen ? 'open' : 'closed'
        }`}
      >

        {/* MOBILE CLOSE BUTTON */}

        <button
          type="button"
          className="
            btn
            btn-sm
            text-white
            rounded-circle
            position-absolute
            top-0
            end-0
            m-3
            d-flex
            d-lg-none
            align-items-center
            justify-content-center
          "
          style={{
            width: '32px',
            height: '32px',
            zIndex: 1060,
            backgroundColor: 'rgba(255,255,255,0.12)',
            border: 'none',
          }}
          onClick={() => setIsSidebarOpen(false)}
          title="Tutup Sidebar"
        >
          <i className="bi bi-x-lg fs-6"></i>
        </button>

        <SidebarEmployee
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          showBackdrop={false}
          showMobileClose={false}
        />

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="main-content-wrapper d-flex flex-column">


        {/* ===================================================
            NAVBAR
        =================================================== */}

        <div
          className="sticky-top"
          style={{
            zIndex: 1020,
          }}
        >
          <NavbarEmployee
            user={user}
            onToggleSidebar={() =>
              setIsSidebarOpen(!isSidebarOpen)
            }
          />
        </div>


        {/* ===================================================
            MAIN
        =================================================== */}

        <main
          className="
            container-fluid
            p-3
            p-md-4
            flex-grow-1
          "
        >

          <div className="leave-page-content">


            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                leave-header
                d-flex
                flex-column
                flex-md-row
                align-items-md-center
                justify-content-between
                mb-4
                gap-3
              "
            >

              <div>

                <h3
                  className="
                    fw-bold
                    text-dark
                    mb-1
                    fs-4
                    fs-md-3
                  "
                >
                  Pengajuan Cuti & Izin
                </h3>

                <p
                  className="
                    text-muted
                    mb-0
                    small
                  "
                >
                  Ajukan cuti atau izin dan pantau status
                  approval dari admin.
                </p>

              </div>


              {/* =================================================
                  CREATE BUTTON
              ================================================= */}

              <button
                type="button"
                className="
                  leave-create-button
                  btn
                  text-white
                  rounded-3
                  px-3
                  py-2
                  d-inline-flex
                  align-items-center
                  justify-content-center
                  gap-2
                  shadow-sm
                  flex-shrink-0
                "
                style={{
                  backgroundColor: '#4F46E5',
                  border: 'none',
                }}
                onClick={openCreateModal}
              >

                <FaPlus size={14} />

                <span>
                  Ajukan Cuti
                </span>

              </button>

            </div>


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

              <div
                className="
                  card
                  border-0
                  shadow-sm
                  rounded-4
                  p-5
                  bg-white
                  text-center
                "
              >
                <LoadingSpinner />
              </div>

            ) : (

              <div
                className="
                  d-flex
                  flex-column
                  gap-3
                  gap-md-4
                "
              >

                {/* =================================================
                    STATISTICS
                ================================================= */}

                <LeaveStats
                  data={leaves}
                />


                {/* =================================================
                    FILTER
                ================================================= */}

                <LeaveFilter
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                />


                {/* =================================================
                    TABLE
                ================================================= */}

                <div
                  className="
                    card
                    border-0
                    shadow-sm
                    rounded-4
                    overflow-hidden
                    bg-white
                  "
                >

                  <div className="responsive-table-wrapper">

                    <LeaveTable
                      data={filteredLeaves}

                      onDetail={openDetailModal}

                      onDelete={handleDelete}
                    />

                  </div>

                </div>

              </div>

            )}

          </div>

        </main>

      </div>


      {/* =====================================================
          CREATE LEAVE MODAL
      ===================================================== */}

      <LeaveModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSuccess={() => {
          closeCreateModal();
          fetchLeaves();
        }}
      />


      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      <LeaveDetailModal
        id={selectedDetailId}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
      />

    </div>
  );
};

export default LeaveRequestPage;