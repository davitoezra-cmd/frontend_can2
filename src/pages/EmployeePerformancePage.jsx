import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import SidebarEmployee from "../components/SidebarEmployee";
import NavbarEmployee from "../layouts/NavbarEmployee";

import EmployeePerformanceStats from "../components/employeeperformance/EmployeePerformanceStats";
import EmployeePerformanceFilter from "../components/employeeperformance/EmployeePerformanceFilter";
import EmployeePerformanceTable from "../components/employeeperformance/EmployeePerformanceTable";
import EmployeePerformanceDetailModal from "../components/employeeperformance/EmployeePerformanceDetailModal";

import {apiFetch} from "../api/apiFetch";

const EmployeePerformancePage = () => {
  // =========================================================
  // SIDEBAR
  // =========================================================

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // =========================================================
  // DATA
  // =========================================================

  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================================
  // FILTER
  // =========================================================

  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");

  // =========================================================
  // MODAL
  // =========================================================

  const [selectedDetail, setSelectedDetail] = useState(null);

  // =========================================================
  // RESPONSIVE SIDEBAR
  // =========================================================

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // =========================================================
  // FETCH API
  // =========================================================

  const fetchPerformances = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // apiFetch otomatis:
      // - mengambil token dari localStorage
      // - menambahkan Authorization: Bearer token
      // - menggunakan API_BASE_URL
      // - parsing JSON
      // - menangani HTTP error
      //
      // Request:
      // GET /api/employee/my-performances
      const response = await apiFetch.get(
        "/employee/my-performances"
      );

      const result = response.data;

      console.log("Employee performances:", result);

      if (result?.success) {
        setPerformances(
          Array.isArray(result.data)
            ? result.data
            : []
        );
      } else {
        setPerformances([]);

        setError(
          result?.message ||
            "Gagal mengambil data penilaian kinerja."
        );
      }
    } catch (err) {
      console.error(
        "Error fetching employee performances:",
        err
      );

      /*
       * apiFetch membuat error dengan:
       * err.status
       * err.data
       * err.response
       *
       * Jadi kita bisa mengambil message Laravel
       * dengan aman tanpa fetch() manual.
       */

      const responseData =
        err?.data ||
        err?.response?.data ||
        null;

      setPerformances([]);

      setError(
        responseData?.message ||
          responseData?.error ||
          err?.message ||
          "Terjadi kesalahan jaringan atau koneksi server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformances();
  }, [fetchPerformances]);

  // =========================================================
  // PERIOD FILTER
  // =========================================================

  const periods = useMemo(() => {
    const setP = new Set();

    performances.forEach((p) => {
      if (p.employee_target?.period) {
        setP.add(p.employee_target.period);
      }
    });

    return Array.from(setP);
  }, [performances]);

  // =========================================================
  // FILTER DATA
  // =========================================================

  const filteredPerformances = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return performances.filter((item) => {
      const title =
        item.employee_target?.title?.toLowerCase() || "";

      const titleMatch = title.includes(keyword);

      const gradeMatch = selectedGrade
        ? item.grade === selectedGrade
        : true;

      const periodMatch = selectedPeriod
        ? item.employee_target?.period === selectedPeriod
        : true;

      return (
        titleMatch &&
        gradeMatch &&
        periodMatch
      );
    });
  }, [
    performances,
    search,
    selectedGrade,
    selectedPeriod,
  ]);

  // =========================================================
  // RESET FILTER
  // =========================================================

  const handleResetFilter = () => {
    setSearch("");
    setSelectedGrade("");
    setSelectedPeriod("");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="employee-performance-page"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        overflowX: "hidden",
      }}
    >
      {/* =====================================================
          RESPONSIVE STYLE
      ====================================================== */}

      <style>{`
        .employee-performance-page {
          width: 100%;
          min-width: 0;
        }

        /* ============================
           SIDEBAR
        ============================ */

        .performance-sidebar {
          width: 260px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1050;
          overflow-y: auto;
          overflow-x: hidden;
          background-color: #0f172a;
          transition: transform 0.3s ease;
        }

        /* ============================
           MAIN CONTENT
        ============================ */

        .performance-main {
          min-height: 100vh;
          width: calc(100% - 260px);
          margin-left: 260px;
          min-width: 0;
          transition: margin-left 0.3s ease,
                      width 0.3s ease;
        }

        .performance-content {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          min-width: 0;
        }

        /* ============================
           MOBILE
        ============================ */

        .performance-backdrop {
          display: none;
        }

        @media (max-width: 991.98px) {

          .performance-sidebar {
            transform: translateX(-100%);
          }

          .performance-sidebar.open {
            transform: translateX(0);
          }

          .performance-main {
            width: 100%;
            margin-left: 0;
          }

          .performance-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 1040;
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(2px);
          }
        }

        /* ============================
           TABLE MOBILE
        ============================ */

        .performance-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .performance-table-wrapper table {
          min-width: 700px;
        }

        /* ============================
           MOBILE PADDING
        ============================ */

        @media (max-width: 575.98px) {

          .performance-content {
            width: 100%;
          }

          .performance-main-content {
            padding: 1rem !important;
          }

          .performance-header-title {
            font-size: 1.1rem !important;
          }

          .performance-header-description {
            font-size: 0.8rem !important;
            line-height: 1.5;
          }

          .performance-refresh-button {
            width: 100%;
          }
        }

        /* ============================
           PREVENT HORIZONTAL OVERFLOW
        ============================ */

        .employee-performance-page,
        .performance-main,
        .performance-content {
          overflow-x: hidden;
        }
      `}</style>

      {/* =====================================================
          BACKDROP MOBILE
      ====================================================== */}

      {isSidebarOpen && (
        <div
          className="performance-backdrop d-lg-none"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`performance-sidebar ${
          isSidebarOpen ? "open" : ""
        }`}
      >
        <SidebarEmployee
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onCloseMobile={() => setIsSidebarOpen(false)}
          showBackdrop={false}
        />
      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="performance-main">

        {/* ===================================================
            NAVBAR
        ==================================================== */}

        <NavbarEmployee
          onToggleSidebar={() =>
            setIsSidebarOpen((prev) => !prev)
          }
        />

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <main className="performance-main-content p-3 p-md-4">

          <div className="performance-content">

            {/* =================================================
                HEADER
            ================================================== */}

            <div
              className="
                d-flex
                flex-column
                flex-md-row
                justify-content-between
                align-items-start
                align-items-md-center
                gap-3
                mb-4
              "
            >

              <div className="flex-grow-1">

                <h4
                  className="
                    performance-header-title
                    fw-bold
                    text-dark
                    mb-1
                  "
                >
                  Hasil Penilaian Kinerja
                </h4>

                <p
                  className="
                    performance-header-description
                    text-muted
                    mb-0
                    small
                  "
                >
                  Lihat hasil evaluasi kinerja yang telah
                  diberikan oleh Supervisor berdasarkan
                  target kerja yang telah Anda selesaikan.
                </p>

              </div>

              <button
                type="button"
                className="
                  performance-refresh-button
                  btn
                  btn-primary
                  d-flex
                  align-items-center
                  justify-content-center
                  gap-2
                  rounded-3
                  shadow-sm
                  px-3
                  py-2
                "
                onClick={fetchPerformances}
                disabled={loading}
              >
                <i
                  className={`bi bi-arrow-clockwise ${
                    loading ? "spin" : ""
                  }`}
                ></i>

                <span>
                  {loading
                    ? "Memuat..."
                    : "Refresh Data"}
                </span>
              </button>

            </div>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                className="
                  alert
                  alert-danger
                  alert-dismissible
                  fade
                  show
                  rounded-3
                  shadow-sm
                  mb-4
                "
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
                LOADING
            ================================================== */}

            {loading ? (

              <div
                className="
                  d-flex
                  flex-column
                  justify-content-center
                  align-items-center
                  py-5
                "
                style={{ minHeight: "300px" }}
              >

                <div
                  className="spinner-border text-primary"
                  role="status"
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                  }}
                >
                  <span className="visually-hidden">
                    Loading...
                  </span>
                </div>

                <span className="text-muted small mt-3">
                  Memuat data penilaian...
                </span>

              </div>

            ) : (

              <>

                {/* =================================================
                    STATISTICS
                ================================================== */}

                <div className="mb-4">
                  <EmployeePerformanceStats
                    performances={performances}
                  />
                </div>

                {/* =================================================
                    FILTER
                ================================================== */}

                <div className="mb-4">
                  <EmployeePerformanceFilter
                    search={search}
                    setSearch={setSearch}
                    selectedGrade={selectedGrade}
                    setSelectedGrade={setSelectedGrade}
                    selectedPeriod={selectedPeriod}
                    setSelectedPeriod={setSelectedPeriod}
                    periods={periods}
                    onReset={handleResetFilter}
                  />
                </div>

                {/* =================================================
                    TABLE
                ================================================== */}

                <div
                  className="
                    card
                    border-0
                    shadow-sm
                    rounded-4
                    overflow-hidden
                  "
                >

                  <div className="performance-table-wrapper">

                    <EmployeePerformanceTable
                      performances={filteredPerformances}
                      onDetailClick={(item) =>
                        setSelectedDetail(item)
                      }
                    />

                  </div>

                </div>

              </>

            )}

          </div>

        </main>

      </div>

      {/* =====================================================
          DETAIL MODAL
      ====================================================== */}

      {selectedDetail && (
        <EmployeePerformanceDetailModal
          data={selectedDetail}
          onClose={() => setSelectedDetail(null)}
        />
      )}

    </div>
  );
};

export default EmployeePerformancePage;