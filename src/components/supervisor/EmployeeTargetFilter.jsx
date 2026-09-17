import React from "react";

const EmployeeTargetFilter = ({
  filters,
  setFilters,
  categories = [],
  onReset,
}) => {
  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <div className="employee-target-filter card border-0 shadow-sm rounded-4">
        <div className="card-body p-3 p-md-4">

          <div className="row g-3 align-items-end">

            {/* =================================================
                SEARCH PEGAWAI
            ================================================= */}

            <div className="col-12 col-md-6 col-lg-3">
              <label
                htmlFor="employee-search"
                className="form-label fw-medium mb-2"
              >
                Search Pegawai
              </label>

              <div className="input-group employee-search-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  id="employee-search"
                  type="text"
                  className="form-control"
                  placeholder="Nama atau Kode..."
                  value={filters.search}
                  onChange={(e) =>
                    handleChange(
                      "search",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* =================================================
                FILTER STATUS
            ================================================= */}

            <div className="col-12 col-md-6 col-lg-3">
              <label
                htmlFor="employee-status"
                className="form-label fw-medium mb-2"
              >
                Filter Status
              </label>

              <select
                id="employee-status"
                className="form-select"
                value={filters.status}
                onChange={(e) =>
                  handleChange(
                    "status",
                    e.target.value
                  )
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

            {/* =================================================
                FILTER KATEGORI
            ================================================= */}

            <div className="col-12 col-md-6 col-lg-3">
              <label
                htmlFor="employee-category"
                className="form-label fw-medium mb-2"
              >
                Filter Kategori
              </label>

              <select
                id="employee-category"
                className="form-select"
                value={filters.category}
                onChange={(e) =>
                  handleChange(
                    "category",
                    e.target.value
                  )
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

            {/* =================================================
                FILTER PERIODE
            ================================================= */}

            <div className="col-12 col-md-6 col-lg-2">
              <label
                htmlFor="employee-period"
                className="form-label fw-medium mb-2"
              >
                Filter Periode
              </label>

              <input
                id="employee-period"
                type="month"
                className="form-control"
                value={filters.period}
                onChange={(e) =>
                  handleChange(
                    "period",
                    e.target.value
                  )
                }
              />
            </div>

            {/* =================================================
                RESET
            ================================================= */}

            <div className="col-12 col-lg-1">
              <button
                type="button"
                className="btn btn-outline-secondary w-100 reset-filter-btn"
                onClick={onReset}
                title="Reset filter"
              >
                <i className="bi bi-arrow-counterclockwise me-lg-1"></i>

                <span className="d-inline d-lg-none">
                  Reset
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          STYLE
      ===================================================== */}

      <style>{`

        .employee-target-filter {
          background: #ffffff;
        }

        .employee-target-filter .form-label {
          color: #374151;
          font-size: 0.9rem;
          line-height: 1.2;
        }

        .employee-target-filter .form-control,
        .employee-target-filter .form-select,
        .employee-target-filter .input-group-text {
          min-height: 40px;
          border-color: #d9dee5;
          font-size: 0.9rem;
        }

        .employee-target-filter .form-control,
        .employee-target-filter .form-select {
          border-radius: 8px;
        }

        .employee-target-filter .form-control:focus,
        .employee-target-filter .form-select:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.15rem rgba(13, 110, 253, 0.12);
        }

        /* Search */

        .employee-search-group {
          display: flex !important;
          width: 100%;
        }

        .employee-search-group .input-group-text {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          flex: 0 0 42px;
          padding: 0;
          border-radius: 8px 0 0 8px;
          background: #ffffff;
        }

        .employee-search-group .form-control {
          min-width: 0;
          flex: 1 1 auto;
          width: 100%;
          border-left: 0;
          border-radius: 0 8px 8px 0;
        }

        .employee-search-group .form-control:focus {
          border-left: 0;
        }

        /* Reset */

        .reset-filter-btn {
          min-height: 40px;
          border-radius: 8px;
          white-space: nowrap;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 991.98px) {

          .employee-target-filter .row {
            row-gap: 1rem;
          }

          .reset-filter-btn {
            width: auto !important;
            min-width: 100px;
          }

        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 767.98px) {

          .employee-target-filter .card-body {
            padding: 1rem !important;
          }

          .employee-target-filter .form-label {
            font-size: 0.85rem;
          }

          .employee-target-filter .form-control,
          .employee-target-filter .form-select,
          .employee-target-filter .input-group-text {
            min-height: 42px;
          }

          .reset-filter-btn {
            width: 100% !important;
            min-height: 42px;
          }

        }

      `}</style>
    </>
  );
};

export default EmployeeTargetFilter;