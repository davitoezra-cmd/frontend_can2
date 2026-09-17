import React, { useEffect, useState } from 'react';

import MealAllowanceApprovalStats from '../approval/meal/MealAllowanceApprovalStats';
import MealAllowanceApprovalFilter from '../approval/meal/MealAllowanceApprovalFilter';
import MealAllowanceApprovalTable from '../approval/meal/MealAllowanceApprovalTable';
import MealAllowanceApprovalDetailModal from '../approval/meal/MealAllowanceApprovalDetailModal';

import LoadingSpinner from '../components/LoadingSpinner';
import { apiFetch } from '../api/apiFetch';
import { toast } from 'react-toastify';
import { FaSync } from 'react-icons/fa';

const MealAllowanceApprovalPage = () => {
  const [mealAllowances, setMealAllowances] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState(null);

  useEffect(() => {
    fetchMealAllowances();
  }, []);

  /**
   * =========================================================
   * AMBIL SEMUA PENGAJUAN UANG MAKAN
   * =========================================================
   */
  const fetchMealAllowances = async () => {
    setLoading(true);

    try {
      const response = await apiFetch.get(
        '/admin/meal-allowance'
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

  /**
   * =========================================================
   * FILTER DATA
   * =========================================================
   */
  const filteredMealAllowances =
    mealAllowances.filter((item) => {
      const employeeName =
        item.employee?.name || '';

      const nameMatch =
        employeeName
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const statusMatch =
        statusFilter === 'Semua' ||
        item.status === statusFilter;

      return nameMatch && statusMatch;
    });

  /**
   * =========================================================
   * BUKA DETAIL
   * =========================================================
   */
  const handleDetail = (id) => {
    setSelectedDetailId(id);
    setIsDetailModalOpen(true);
  };

  /**
   * =========================================================
   * TUTUP DETAIL
   * =========================================================
   */
  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedDetailId(null);
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-3">

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        .spin {
          animation: spin 0.8s linear infinite;
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
          HEADER
      ===================================================== */}

      <div className="d-flex align-items-center justify-content-between gap-2 mb-3 mb-md-4">

        <div>
          <h4 className="fw-bold text-dark mb-1 fs-5 fs-md-4">
            Approval Pengajuan Uang Makan
          </h4>

          <p className="text-muted small mb-0 d-none d-sm-block">
            Kelola seluruh pengajuan uang makan dari karyawan.
          </p>
        </div>

        {/* =================================================
            REFRESH
        ================================================= */}

        <button
          type="button"
          className="btn btn-outline-primary rounded-3 px-3 py-2 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm flex-shrink-0"
          onClick={fetchMealAllowances}
          disabled={loading}
        >
          <FaSync
            className={loading ? 'spin' : ''}
          />

          <span className="d-none d-sm-inline">
            Refresh
          </span>
        </button>

      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      {loading ? (
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 gap-md-4">

          {/* =================================================
              STATISTIK
          ================================================= */}

          <MealAllowanceApprovalStats
            data={mealAllowances}
          />

          {/* =================================================
              FILTER
          ================================================= */}

          <MealAllowanceApprovalFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="responsive-table-wrapper">

              <MealAllowanceApprovalTable
                data={filteredMealAllowances}
                onDetail={handleDetail}
              />

            </div>
          </div>

        </div>
      )}

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      <MealAllowanceApprovalDetailModal
        id={selectedDetailId}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        onSuccess={fetchMealAllowances}
      />

    </div>
  );
};

export default MealAllowanceApprovalPage;