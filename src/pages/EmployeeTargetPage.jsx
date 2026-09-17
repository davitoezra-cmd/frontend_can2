import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import {apiFetch} from "../api/apiFetch";

import EmployeeTargetStats from "../components/supervisor/EmployeeTargetStats";
import EmployeeTargetTable from "../components/supervisor/EmployeeTargetTable";
import EmployeeTargetDetailModal from "../components/supervisor/EmployeeTargetDetailModal";

const API_BASE_URL = "/supervisor/employee-targets";

const EmployeeTargetPage = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    period: "",
  });

  const [modalState, setModalState] = useState({
    detail: false,
  });

  const [selectedTarget, setSelectedTarget] = useState(null);

  // =====================================================
  // FETCH TARGET
  // =====================================================

  const fetchTargets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch.get(API_BASE_URL);

      const responseData = response.data;

      if (
        responseData?.success ||
        responseData?.status === "success"
      ) {
        setTargets(responseData.data || []);
      } else if (Array.isArray(responseData)) {
        setTargets(responseData);
      } else {
        setTargets(responseData?.data || []);
      }
    } catch (err) {
      console.error(
        "Gagal mengambil target kinerja:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Gagal memuat data target kinerja."
      );

      setTargets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  // =====================================================
  // CATEGORY
  // =====================================================

  const categories = useMemo(() => {
    const list = targets
      .map((target) => target.category)
      .filter(Boolean);

    return [...new Set(list)];
  }, [targets]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredTargets = useMemo(() => {
    const search = filters.search
      .trim()
      .toLowerCase();

    return targets.filter((item) => {
      const employeeName =
        item.employee?.name?.toLowerCase() || "";

      const employeeCode =
        item.employee?.employee_code?.toLowerCase() || "";

      const title =
        item.title?.toLowerCase() || "";

      const matchesSearch =
        !search ||
        employeeName.includes(search) ||
        employeeCode.includes(search) ||
        title.includes(search);

      const matchesStatus =
        !filters.status ||
        item.status === filters.status;

      const matchesCategory =
        !filters.category ||
        item.category === filters.category;

      const matchesPeriod =
        !filters.period ||
        item.start_date?.startsWith(filters.period);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesPeriod
      );
    });
  }, [targets, filters]);

  // =====================================================
  // RESET
  // =====================================================

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "",
      category: "",
      period: "",
    });
  }, []);

  // =====================================================
  // DETAIL
  // =====================================================

  const handleOpenDetail = useCallback(
    async (target) => {
      try {
        const response = await apiFetch.get(
          `${API_BASE_URL}/${target.id}`
        );

        const responseData = response.data;

        if (
          responseData?.success ||
          responseData?.status === "success"
        ) {
          setSelectedTarget(responseData.data);
        } else {
          setSelectedTarget(
            responseData?.data ||
              responseData ||
              target
          );
        }

        setModalState({
          detail: true,
        });
      } catch (err) {
        console.error(
          "Gagal mengambil detail target:",
          err
        );

        setSelectedTarget(target);

        setModalState({
          detail: true,
        });
      }
    },
    []
  );

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const handleCloseModals = useCallback(() => {
    setModalState({
      detail: false,
    });

    setSelectedTarget(null);
  }, []);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = useCallback(() => {
    if (!loading) {
      fetchTargets();
    }
  }, [fetchTargets, loading]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="employee-target-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="target-header">
        <div>
          <h4 className="fw-bold mb-1">
            Target Kinerja Pegawai
          </h4>

          <p className="text-muted mb-0">
            Supervisor dapat melihat dan memonitor target
            setiap pegawai.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-light border rounded-3 px-3"
          onClick={handleRefresh}
          disabled={loading}
        >
          <i
            className={`bi ${
              loading
                ? "bi-arrow-repeat"
                : "bi-arrow-clockwise"
            } me-2`}
          ></i>

          {loading ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show rounded-3 mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>

          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <EmployeeTargetStats
        targets={targets}
      />

      {/* =================================================
          FILTER
      ================================================= */}

      <div className="target-filter-card">

        {/* SEARCH */}

        <div className="filter-item filter-search">
          <label>
            Search Pegawai
          </label>

          <div className="search-wrapper">
            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Nama atau Kode..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* STATUS */}

        <div className="filter-item">
          <label>
            Filter Status
          </label>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
              }))
            }
          >
            <option value="">
              Semua Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="in_progress">
              Dalam Proses
            </option>

            <option value="completed">
              Selesai
            </option>

            <option value="cancelled">
              Dibatalkan
            </option>
          </select>
        </div>

        {/* CATEGORY */}

        <div className="filter-item">
          <label>
            Filter Kategori
          </label>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
          >
            <option value="">
              Semua Kategori
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* PERIOD */}

        <div className="filter-item">
          <label>
            Filter Periode
          </label>

          <input
            type="month"
            value={filters.period}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                period: e.target.value,
              }))
            }
          />
        </div>

        {/* RESET */}

        <div className="filter-reset">
          <button
            type="button"
            onClick={handleResetFilters}
            title="Reset Filter"
          >
            <i className="bi bi-arrow-counterclockwise"></i>

            <span>
              Reset
            </span>
          </button>
        </div>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      {loading ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <div
            className="spinner-border text-primary mx-auto mb-3"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted small mb-0">
            Memuat data target kinerja...
          </p>
        </div>
      ) : (
        <EmployeeTargetTable
          targets={filteredTargets}
          onDetail={handleOpenDetail}
        />
      )}

      {/* =================================================
          MODAL
      ================================================= */}

      <EmployeeTargetDetailModal
        isOpen={modalState.detail}
        onClose={handleCloseModals}
        data={selectedTarget}
      />

      {/* =================================================
          STYLE
      ================================================= */}

      <style>{`

        .employee-target-page {
          width: 100%;
          min-width: 0;
        }

        /* =================================================
           HEADER
        ================================================= */

        .target-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        /* =================================================
           FILTER CARD
        ================================================= */

        .target-filter-card {
          width: 100%;
          display: grid;

          /*
           * Search sedikit lebih lebar.
           * Status & kategori sama besar.
           * Periode sedikit lebih kecil.
           * Reset mengikuti ukuran tombol.
           */
          grid-template-columns:
            minmax(180px, 2fr)
            minmax(150px, 1.5fr)
            minmax(150px, 1.5fr)
            minmax(130px, 1.2fr)
            auto;

          gap: 14px;

          align-items: end;

          padding: 20px;

          margin-top: 20px;
          margin-bottom: 24px;

          background: #ffffff;

          border: 1px solid #e5e7eb;

          border-radius: 14px;

          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.04);

          box-sizing: border-box;
        }

        /* =================================================
           FILTER ITEM
        ================================================= */

        .filter-item {
          min-width: 0;
          width: 100%;
        }

        .filter-item label {
          display: block;

          margin-bottom: 8px;

          font-size: 14px;

          font-weight: 500;

          color: #374151;
        }

        /* =================================================
           INPUT
        ================================================= */

        .filter-item input,
        .filter-item select {
          width: 100%;

          height: 40px;

          padding: 0 12px;

          border: 1px solid #d7dce2;

          border-radius: 8px;

          background: #ffffff;

          color: #374151;

          font-size: 14px;

          outline: none;

          box-sizing: border-box;
        }

        .filter-item input:focus,
        .filter-item select:focus {
          border-color: #86b7fe;

          box-shadow:
            0 0 0 3px rgba(
              13,
              110,
              253,
              0.10
            );
        }

        /* =================================================
           SEARCH
        ================================================= */

        .search-wrapper {
          position: relative;

          width: 100%;
        }

        .search-wrapper i {
          position: absolute;

          left: 13px;

          top: 50%;

          transform: translateY(-50%);

          font-size: 16px;

          color: #64748b;

          pointer-events: none;

          z-index: 2;
        }

        .search-wrapper input {
          padding-left: 40px;
        }

        /* =================================================
           RESET
        ================================================= */

        .filter-reset {
          display: flex;

          align-items: flex-end;

          height: 100%;
        }

        .filter-reset button {
          height: 40px;

          min-width: 76px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 6px;

          padding: 0 12px;

          border: 1px solid #94a3b8;

          border-radius: 8px;

          background: #ffffff;

          color: #64748b;

          font-size: 14px;

          cursor: pointer;

          transition:
            background 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease;
        }

        .filter-reset button:hover {
          background: #f8fafc;

          color: #334155;

          border-color: #64748b;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1100px) {

          .target-filter-card {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .filter-reset {
            align-items: stretch;
          }

          .filter-reset button {
            width: 100%;
          }
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 767px) {

          .target-header {
            flex-direction: column;

            align-items: stretch;

            gap: 12px;
          }

          .target-header button {
            width: 100%;
          }

          .target-filter-card {
            grid-template-columns: 1fr;

            padding: 16px;

            gap: 14px;

            border-radius: 12px;
          }

          .filter-reset button {
            width: 100%;
          }
        }

      `}</style>
    </div>
  );
};

export default EmployeeTargetPage;