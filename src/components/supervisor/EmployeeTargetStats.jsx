import React, { useMemo } from "react";

const EmployeeTargetStats = ({ targets = [] }) => {
  const stats = useMemo(() => {
    const total = targets.length;

    const ongoing = targets.filter(
      (t) => t.status === "ongoing"
    ).length;

    const achieved = targets.filter(
      (t) => t.status === "achieved"
    ).length;

    const notAchieved = targets.filter(
      (t) => t.status === "not_achieved"
    ).length;

    return {
      total,
      ongoing,
      achieved,
      notAchieved,
    };
  }, [targets]);

  return (
    <>
      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style>
        {`
          .employee-target-stats {
            width: 100%;
            max-width: 100%;
            min-width: 0;
          }

          .employee-target-stat-card {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow: hidden;
          }

          .employee-target-stat-body {
            min-width: 0;
          }

          .employee-target-stat-content {
            min-width: 0;
            flex: 1 1 auto;
          }

          .employee-target-stat-title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }

          .employee-target-stat-number {
            line-height: 1;
          }

          .employee-target-stat-icon {
            width: 52px;
            height: 52px;
            flex: 0 0 52px;
          }

          /* =================================================
             MOBILE
          ================================================= */

          @media (max-width: 767.98px) {
            .employee-target-stats {
              margin-bottom: 1rem !important;
            }

            .employee-target-stat-card {
              border-radius: 14px !important;
            }

            .employee-target-stat-body {
              padding: 0.85rem 1rem !important;
            }

            .employee-target-stat-title {
              font-size: 0.72rem !important;
              margin-bottom: 0.3rem !important;
            }

            .employee-target-stat-number {
              font-size: 1.35rem !important;
            }

            .employee-target-stat-icon {
              width: 42px;
              height: 42px;
              flex: 0 0 42px;
              padding: 0 !important;
            }

            .employee-target-stat-icon i {
              font-size: 1rem !important;
            }
          }

          /* =================================================
             HP SANGAT KECIL
          ================================================= */

          @media (max-width: 400px) {
            .employee-target-stat-body {
              padding: 0.75rem 0.85rem !important;
            }

            .employee-target-stat-title {
              font-size: 0.68rem !important;
            }

            .employee-target-stat-number {
              font-size: 1.2rem !important;
            }

            .employee-target-stat-icon {
              width: 38px;
              height: 38px;
              flex: 0 0 38px;
            }

            .employee-target-stat-icon i {
              font-size: 0.9rem !important;
            }
          }
        `}
      </style>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="employee-target-stats row g-3 mb-4">

        {/* =================================================
            TOTAL TARGET
        ================================================= */}

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="employee-target-stat-card card border-0 shadow-sm rounded-4 h-100">
            <div
              className="
                employee-target-stat-body
                card-body
                p-3
                p-md-4
                d-flex
                align-items-center
                justify-content-between
                gap-3
              "
            >
              <div className="employee-target-stat-content">
                <p className="employee-target-stat-title text-muted small fw-medium mb-1">
                  Total Target
                </p>

                <h3 className="employee-target-stat-number fw-bold text-dark mb-0">
                  {stats.total}
                </h3>
              </div>

              <div
                className="
                  employee-target-stat-icon
                  rounded-circle
                  bg-primary-subtle
                  text-primary
                  d-flex
                  align-items-center
                  justify-content-center
                "
              >
                <i className="bi bi-card-checklist fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            SEDANG BERJALAN
        ================================================= */}

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="employee-target-stat-card card border-0 shadow-sm rounded-4 h-100">
            <div
              className="
                employee-target-stat-body
                card-body
                p-3
                p-md-4
                d-flex
                align-items-center
                justify-content-between
                gap-3
              "
            >
              <div className="employee-target-stat-content">
                <p className="employee-target-stat-title text-muted small fw-medium mb-1">
                  Sedang Berjalan
                </p>

                <h3 className="employee-target-stat-number fw-bold text-secondary mb-0">
                  {stats.ongoing}
                </h3>
              </div>

              <div
                className="
                  employee-target-stat-icon
                  rounded-circle
                  bg-secondary-subtle
                  text-secondary
                  d-flex
                  align-items-center
                  justify-content-center
                "
              >
                <i className="bi bi-hourglass-split fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            TARGET TERCAPAI
        ================================================= */}

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="employee-target-stat-card card border-0 shadow-sm rounded-4 h-100">
            <div
              className="
                employee-target-stat-body
                card-body
                p-3
                p-md-4
                d-flex
                align-items-center
                justify-content-between
                gap-3
              "
            >
              <div className="employee-target-stat-content">
                <p className="employee-target-stat-title text-muted small fw-medium mb-1">
                  Target Tercapai
                </p>

                <h3 className="employee-target-stat-number fw-bold text-success mb-0">
                  {stats.achieved}
                </h3>
              </div>

              <div
                className="
                  employee-target-stat-icon
                  rounded-circle
                  bg-success-subtle
                  text-success
                  d-flex
                  align-items-center
                  justify-content-center
                "
              >
                <i className="bi bi-check-circle-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            BELUM TERCAPAI
        ================================================= */}

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="employee-target-stat-card card border-0 shadow-sm rounded-4 h-100">
            <div
              className="
                employee-target-stat-body
                card-body
                p-3
                p-md-4
                d-flex
                align-items-center
                justify-content-between
                gap-3
              "
            >
              <div className="employee-target-stat-content">
                <p className="employee-target-stat-title text-muted small fw-medium mb-1">
                  Belum Tercapai
                </p>

                <h3 className="employee-target-stat-number fw-bold text-danger mb-0">
                  {stats.notAchieved}
                </h3>
              </div>

              <div
                className="
                  employee-target-stat-icon
                  rounded-circle
                  bg-danger-subtle
                  text-danger
                  d-flex
                  align-items-center
                  justify-content-center
                "
              >
                <i className="bi bi-x-circle-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default React.memo(EmployeeTargetStats);