import React, { useState, useEffect } from 'react';

import SidebarEmployee from '../components/SidebarEmployee';
import NavbarEmployee from '../layouts/NavbarEmployee';

import MealAllowanceStats from '../meal-allowance/MealAllowanceStats';
import MealAllowanceFilter from '../meal-allowance/MealAllowanceFilter';
import MealAllowanceTable from '../meal-allowance/MealAllowanceTable';
import MealAllowanceModal from '../meal-allowance/MealAllowanceModal';
import MealAllowanceDetailModal from '../meal-allowance/MealAllowanceDetailModal';

import LoadingSpinner from '../components/LoadingSpinner';

import { apiFetch } from '../api/apiFetch';

import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';

const MealAllowanceRequestPage = () => {
  const [mealAllowances, setMealAllowances] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState('Semua');

  // =========================================================
  // STATE USER PROFILE
  // =========================================================

  const [user, setUser] = useState(null);

  // =========================================================
  // STATE CREATE MODAL
  // =========================================================

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  // =========================================================
  // STATE DETAIL MODAL
  // =========================================================

  const [isDetailModalOpen, setIsDetailModalOpen] =
    useState(false);

  const [selectedDetailId, setSelectedDetailId] =
    useState(null);

  // =========================================================
  // STATE SIDEBAR
  // =========================================================

  // Default terbuka di Desktop,
  // tertutup di Mobile
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(true);

  // =========================================================
  // AUTO CLOSE SIDEBAR MOBILE
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

    window.addEventListener(
      'resize',
      handleResize
    );

    return () => {
      window.removeEventListener(
        'resize',
        handleResize
      );
    };
  }, []);

  // =========================================================
  // FETCH DATA SAAT HALAMAN DIBUKA
  // =========================================================

  useEffect(() => {
    fetchMealAllowances();
    fetchProfile();
  }, []);

  // =========================================================
  // FETCH PENGAJUAN UANG MAKAN
  // =========================================================

  const fetchMealAllowances = async () => {
    setLoading(true);

    try {
      const response = await apiFetch.get(
        '/employee/meal-allowance'
      );

      if (response.data?.success) {
        setMealAllowances(
          response.data.data || []
        );
      } else {
        setMealAllowances([]);
      }
    } catch (error) {
      console.error(
        'Gagal mengambil data uang makan:',
        error
      );

      toast.error(
        error.response?.data?.message ||
          'Gagal mengambil data pengajuan uang makan.'
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
      const response = await apiFetch.get(
        '/employee/profile'
      );

      if (response.data?.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      // Silent error
    }
  };

  // =========================================================
  // DELETE PENGAJUAN
  // Hanya bisa jika status pending
  // =========================================================

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Ingin menghapus pengajuan uang makan ini?',
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
        const response =
          await apiFetch.delete(
            `/employee/meal-allowance/${id}`
          );

        if (response.data?.success) {
          Swal.fire({
            title: 'Berhasil!',
            text: response.data.message,
            icon: 'success',
          });

          fetchMealAllowances();
        }
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            'Gagal menghapus pengajuan uang makan.'
        );
      }
    });
  };

  // =========================================================
  // FILTER PENGAJUAN UANG MAKAN
  // =========================================================

  const filteredMealAllowances =
    mealAllowances.filter((item) => {
      const reason = item.reason || '';

      const matchesSearch =
        reason
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesStatus =
        statusFilter === 'Semua' ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // =========================================================
  // BUKA DETAIL
  // =========================================================

  const handleDetail = (id) => {
    setSelectedDetailId(id);
    setIsDetailModalOpen(true);
  };

  // =========================================================
  // TUTUP DETAIL
  // =========================================================

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedDetailId(null);
  };

  return (
    <div
      className="min-vh-100 position-relative"
      style={{
        backgroundColor: '#F8FAFC',
      }}
    >

      {/* =====================================================
          CSS
      ====================================================== */}

      <style>{`

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
          transition:
            opacity 0.3s ease,
            visibility 0.3s ease;
        }

        .sidebar-backdrop.show {
          opacity: 1;
          visibility: visible;
        }

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
            transform 0.35s
            cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          overflow-y: auto;
        }

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
          transition:
            margin-left 0.35s
            cubic-bezier(0.4, 0, 0.2, 1);
        }

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

      {/* =====================================================
          MOBILE BACKDROP
      ====================================================== */}

      <div
        className={`
          sidebar-backdrop
          d-lg-none
          ${isSidebarOpen ? 'show' : ''}
        `}
        onClick={() =>
          setIsSidebarOpen(false)
        }
      />

      {/* =====================================================
          SIDEBAR EMPLOYEE
      ====================================================== */}

      <aside
        className={`
          sidebar-container
          ${isSidebarOpen ? 'open' : 'closed'}
        `}
      >

        {/* Tombol Close Mobile */}

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
            backgroundColor:
              'rgba(255, 255, 255, 0.12)',
            border: 'none',
          }}
          onClick={() =>
            setIsSidebarOpen(false)
          }
          title="Tutup Sidebar"
        >
          <i className="bi bi-x-lg fs-6"></i>
        </button>

        <SidebarEmployee
          isOpen={isSidebarOpen}
          onClose={() =>
            setIsSidebarOpen(false)
          }
          showBackdrop={false}
          showMobileClose={false}
        />

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          main-content-wrapper
          d-flex
          flex-column
          min-w-0
        "
      >

        {/* =================================================
            NAVBAR
        ================================================== */}

        <div
          className="sticky-top"
          style={{
            zIndex: 1020,
          }}
        >
          <NavbarEmployee
            user={user}
            onToggleSidebar={() =>
              setIsSidebarOpen(
                !isSidebarOpen
              )
            }
          />
        </div>

        {/* =================================================
            CONTENT
        ================================================== */}

        <main
          className="
            container-fluid
            p-3
            p-md-4
            flex-grow-1
            overflow-auto
          "
          style={{
            maxWidth: '1600px',
          }}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
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
                Pengajuan Uang Makan
              </h3>

              <p
                className="
                  text-muted
                  mb-0
                  small
                "
              >
                Ajukan uang makan dan pantau
                status approval dari admin.
              </p>

            </div>

            {/* =================================================
                TOMBOL AJUKAN
            ================================================== */}

            <button
              type="button"
              className="
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
              }}
              onClick={() =>
                setIsCreateModalOpen(true)
              }
            >
              <FaPlus />

              + Ajukan Uang Makan
            </button>

          </div>

          {/* =================================================
              LOADING
          ================================================== */}

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
                  STATISTIK
              ================================================= */}

              <MealAllowanceStats
                data={mealAllowances}
              />

              {/* =================================================
                  FILTER
              ================================================= */}

              <MealAllowanceFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={
                  setStatusFilter
                }
              />

              {/* =================================================
                  TABLE
              ================================================= */}

              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="responsive-table-wrapper">

                  <MealAllowanceTable
                    data={filteredMealAllowances}
                    onDetail={handleDetail}
                    onDelete={handleDelete}
                  />

                </div>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* =====================================================
          CREATE MODAL
      ====================================================== */}

      <MealAllowanceModal
        isOpen={isCreateModalOpen}
        onClose={() =>
          setIsCreateModalOpen(false)
        }
        onSuccess={fetchMealAllowances}
      />

      {/* =====================================================
          DETAIL MODAL
      ====================================================== */}

      <MealAllowanceDetailModal
        id={selectedDetailId}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
      />

    </div>
  );
};

export default MealAllowanceRequestPage;