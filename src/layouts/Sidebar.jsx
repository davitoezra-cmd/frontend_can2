import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { apiFetch } from "../api/apiFetch";
import Swal from "sweetalert2";

const Sidebar = ({ mobile = false }) => {
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin keluar dari sistem?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc3545",
      customClass: {
        popup: "rounded-4",
      },
    });

    if (!result.isConfirmed) return;

    try {
      await apiFetch.post("/admin/logout");
    } catch (e) {
      // Abaikan jika token sudah tidak valid
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      sessionStorage.clear();

      window.location.replace("/login");
    }
  };

  // =====================================================
  // MENU
  // =====================================================

  const navItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: "bi-grid-1x2",
    },
    {
      path: "/admin/inventory",
      label: "Inventory",
      icon: "bi-box-seam",
    },
    {
      path: "/admin/attendance-locations",
      label: "Attendance Locations",
      icon: "bi-geo-alt",
    },
    {
      path: "/admin/shift-schedules",
      label: "Shift Schedules",
      icon: "bi-calendar2-week",
    },
    {
      path: "/admin/finance",
      label: "Finance Management",
      icon: "bi-wallet2",
    },
    {
      path: "/admin/payroll-expense",
      label: "Payroll Expense",
      icon: "bi-bar-chart-line",
    },
    {
      path: "/admin/supervisors",
      label: "Supervisor Management",
      icon: "bi-person-badge",
    },
    {
      path: "/admin/teams",
      label: "Team Management",
      icon: "bi-people-fill",
    },
    {
      path: "/admin/task-assignments",
      label: "Task Assignment",
      icon: "bi-clipboard-check",
    },
    {
      path: "/admin/performance",
      label: "Performance & Target",
      icon: "bi-graph-up-arrow",
    },
    {
      path: "/admin/attendance-qr",
      label: "Attendance QR",
      icon: "bi-qr-code-scan",
    },
    {
      path: "/admin/meeting",
      label: "Meeting",
      icon: "bi-calendar-event",
    },
    {
      path: "/admin/company-posts",
      label: "Company Posts",
      icon: "bi-newspaper",
    },
    {
      path: "/admin/documents",
      label: "Documents",
      icon: "bi-file-earmark-text",
    },
    {
      path: "/admin/profile",
      label: "Profile",
      icon: "bi-person",
    },

    {
      path: "whatsapp-gateway",
      label: "WhatsApp Gateway",
      icon: "bi-whatsapp",
    }
  ];

  // =====================================================
  // MOBILE NAVIGATION
  // =====================================================

  const handleMobileNavigation = () => {
    if (!mobile) return;

    /*
     * Jangan menggunakan data-bs-dismiss pada NavLink.
     *
     * React Router harus melakukan navigasi terlebih dahulu.
     * Setelah klik, Bootstrap Offcanvas ditutup.
     */

    setTimeout(() => {
      const offcanvasElement =
        document.getElementById("mobileSidebar");

      if (!offcanvasElement) return;

      if (window.bootstrap?.Offcanvas) {
        const offcanvas =
          window.bootstrap.Offcanvas.getInstance(
            offcanvasElement
          );

        if (offcanvas) {
          offcanvas.hide();
        }
      }
    }, 0);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <style>{`

        /* =================================================
            RESET
        ================================================= */

        .admin-sidebar,
        .admin-sidebar * {
          box-sizing: border-box;
        }


        /* =================================================
            DESKTOP SIDEBAR
        ================================================= */

        .admin-sidebar {
          position: fixed;

          top: 0;
          left: 0;
          bottom: 0;

          width: 250px;
          height: 100vh;
          height: 100dvh;

          display: flex;
          flex-direction: column;

          background: #080f1f;
          color: #ffffff;

          z-index: 1040;

          overflow: hidden;

          flex-shrink: 0;
        }


        /* =================================================
            BRAND
        ================================================= */

        .admin-sidebar-brand {
          flex: 0 0 auto;

          width: 100%;

          padding: 18px 16px 14px;

          background: #080f1f;
        }


        /* =================================================
            MOBILE HEADER
        ================================================= */

        .admin-sidebar-mobile-header {
          display: none;

          flex: 0 0 auto;

          align-items: center;
          justify-content: space-between;

          gap: 10px;

          width: 100%;

          padding: 13px 12px;

          background: #080f1f;

          border-bottom: 1px solid #172033;
        }


        /* =================================================
            CLOSE BUTTON
        ================================================= */

        .admin-sidebar-close {
          width: 34px;
          height: 34px;

          padding: 0;

          border: none;

          border-radius: 8px;

          background: rgba(255, 255, 255, 0.08);

          color: #ffffff;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 18px;

          cursor: pointer;

          flex-shrink: 0;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .admin-sidebar-close:hover {
          background: rgba(255, 255, 255, 0.15);

          color: #00e5ff;
        }


        /* =================================================
            MENU
        ================================================= */

        .admin-sidebar-menu {
          flex: 1 1 auto;

          min-height: 0;

          width: 100%;

          overflow-y: auto;
          overflow-x: hidden;

          padding: 0 10px 10px;

          background: #080f1f;

          -webkit-overflow-scrolling: touch;
        }


        /* =================================================
            SCROLLBAR
        ================================================= */

        .admin-sidebar-menu::-webkit-scrollbar {
          width: 5px;
        }

        .admin-sidebar-menu::-webkit-scrollbar-track {
          background: #080f1f;
        }

        .admin-sidebar-menu::-webkit-scrollbar-thumb {
          background: #1e293b;

          border-radius: 10px;
        }

        .admin-sidebar-menu::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }


        /* =================================================
            NAV
        ================================================= */

        .admin-sidebar-menu nav {
          width: 100%;

          display: flex;

          flex-direction: column;
        }


        /* =================================================
            MENU ITEM
        ================================================= */

        .sidebar-item {
          display: flex;

          align-items: center;

          gap: 0.75rem;

          width: 100%;

          min-width: 0;

          min-height: 42px;

          padding: 0.68rem 0.8rem;

          margin-bottom: 3px;

          color: #94a3b8;

          text-decoration: none;

          font-weight: 500;

          font-size: 0.9rem;

          line-height: 1.3;

          border-radius: 0.55rem;

          transition:
            background-color 0.2s ease,
            color 0.2s ease;

          white-space: nowrap;

          flex-shrink: 0;
        }


        .sidebar-item:hover {
          background: #111c35;

          color: #00e5ff;

          text-decoration: none;
        }


        .sidebar-item.active {
          background: #0d2945;

          color: #00e5ff;

          font-weight: 600;
        }


        /* =================================================
            ICON
        ================================================= */

        .sidebar-item i {
          color: inherit;

          width: 22px;
          min-width: 22px;
          max-width: 22px;

          text-align: center;

          flex-shrink: 0;
        }


        /* =================================================
            TEXT
        ================================================= */

        .sidebar-item span {
          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          min-width: 0;
        }


        /* =================================================
            FINANCE DASHBOARD BUTTON
        ================================================= */

        .finance-dashboard-link {
          position: relative;

          margin-top: 6px;
          margin-bottom: 8px;

          padding: 0.75rem 0.8rem;

          background: linear-gradient(
            135deg,
            rgba(0, 229, 255, 0.14),
            rgba(0, 180, 216, 0.08)
          );

          border: 1px solid rgba(0, 229, 255, 0.22);

          color: #d9fbff;

          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.12);

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .finance-dashboard-link:hover {
          background: linear-gradient(
            135deg,
            rgba(0, 229, 255, 0.22),
            rgba(0, 180, 216, 0.14)
          );

          border-color: rgba(0, 229, 255, 0.42);

          color: #ffffff;

          transform: translateY(-1px);

          box-shadow:
            0 6px 16px rgba(0, 0, 0, 0.18);
        }

        .finance-dashboard-link.active {
          background: linear-gradient(
            135deg,
            #0d2945,
            #103753
          );

          border-color: rgba(0, 229, 255, 0.5);

          color: #00e5ff;

          box-shadow:
            0 5px 16px rgba(0, 229, 255, 0.08);
        }

        .finance-dashboard-icon {
          width: 30px !important;
          min-width: 30px !important;
          max-width: 30px !important;

          height: 30px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: rgba(0, 229, 255, 0.12);

          color: #00e5ff !important;

          font-size: 16px;
        }

        .finance-dashboard-text {
          display: flex;

          flex-direction: column;

          align-items: flex-start;

          justify-content: center;

          gap: 1px;
        }

        .finance-dashboard-title {
          font-size: 0.88rem;

          font-weight: 600;

          line-height: 1.2;

          color: inherit;
        }

        .finance-dashboard-subtitle {
          font-size: 0.7rem;

          font-weight: 400;

          line-height: 1.2;

          color: #64748b;
        }

        .finance-dashboard-arrow {
          margin-left: auto;

          width: auto !important;
          min-width: auto !important;
          max-width: none !important;

          font-size: 0.72rem;

          color: #64748b !important;

          transition:
            transform 0.2s ease,
            color 0.2s ease;
        }

        .finance-dashboard-link:hover
          .finance-dashboard-arrow {
          color: #00e5ff !important;

          transform: translateX(2px);
        }

        .finance-dashboard-link.active
          .finance-dashboard-arrow {
          color: #00e5ff !important;
        }


        /* =================================================
            DROPDOWN GROUP
        ================================================= */

        .sidebar-dropdown {
          width: 100%;
          margin-bottom: 3px;
        }

        .sidebar-dropdown-toggle {
          border: none;
          background: transparent;
          font-family: inherit;
          text-align: left;
          cursor: pointer;
        }

        .sidebar-dropdown-toggle .dropdown-arrow {
          margin-left: auto;
          width: auto;
          min-width: auto;
          max-width: none;
          font-size: 0.75rem;
          transition: transform 0.2s ease;
        }

        .sidebar-dropdown-toggle.open .dropdown-arrow {
          transform: rotate(180deg);
        }

        .sidebar-submenu {
          width: 100%;
          padding: 0 0 3px 0;
        }

        .sidebar-submenu .sidebar-item {
          min-height: 38px;
          margin-bottom: 2px;
          padding-left: 2.45rem;
          font-size: 0.84rem;
          background: transparent;
        }

        .sidebar-submenu .sidebar-item:hover {
          background: #111c35;
          color: #00e5ff;
        }

        .sidebar-submenu .sidebar-item.active {
          background: #0d2945;
          color: #00e5ff;
        }


        /* =================================================
            LOGOUT
        ================================================= */

        .admin-sidebar-logout {
          flex: 0 0 auto;

          width: 100%;

          padding: 10px;

          background: #080f1f;

          border-top: 1px solid #172033;
        }


        .admin-sidebar .logout-item {
          margin: 0;

          width: 100%;

          color: #94a3b8 !important;

          background: transparent;

          border: none;

          cursor: pointer;

          text-align: left;

          font-family: inherit;
        }


        .admin-sidebar .logout-item:hover {
          background: #2a151a;

          color: #ff6b6b !important;
        }


        .admin-sidebar .logout-item i {
          color: inherit !important;
        }


        .admin-sidebar .text-muted {
          color: #64748b !important;
        }


        .admin-sidebar .text-white {
          color: #f8fafc !important;
        }


        /* =================================================
            MOBILE SIDEBAR
        ================================================= */

        .admin-sidebar.admin-sidebar-mobile {
          position: static;

          top: auto;
          left: auto;
          bottom: auto;

          width: 100%;

          max-width: none;

          height: 100%;

          min-height: 100%;

          display: flex;

          flex-direction: column;

          background: #080f1f;

          color: #ffffff;

          z-index: auto;

          overflow: hidden;

          box-shadow: none;

          transform: none;

          transition: none;

          isolation: auto;

          visibility: visible;

          opacity: 1;
        }


        /* =================================================
            MOBILE HEADER
        ================================================= */

        .admin-sidebar-mobile .admin-sidebar-mobile-header {
          display: flex;
        }


        /* =================================================
            MOBILE BRAND
        ================================================= */

        .admin-sidebar-mobile .admin-sidebar-brand {
          padding: 14px 12px;

          flex: 0 0 auto;

          padding-right: 55px;
        }


        /* =================================================
            MOBILE MENU
        ================================================= */

        .admin-sidebar-mobile .admin-sidebar-menu {
          flex: 1 1 auto;

          min-height: 0;

          height: auto;

          overflow-y: auto;

          overflow-x: hidden;

          padding: 8px 8px 10px;

          background: #080f1f;
        }


        /* =================================================
            MOBILE ITEMS
        ================================================= */

        .admin-sidebar-mobile .sidebar-item {
          width: 100%;

          min-height: 42px;

          font-size: 0.86rem;

          padding: 0.65rem 0.7rem;

          margin-bottom: 3px;

          /*
           * Pastikan link tetap bisa diklik.
           */
          pointer-events: auto;

          cursor: pointer;
        }


        /* =================================================
            MOBILE FINANCE BUTTON
        ================================================= */

        .admin-sidebar-mobile
          .finance-dashboard-link {
          margin-top: 5px;
          margin-bottom: 8px;

          min-height: 52px;

          padding: 0.65rem 0.7rem;

          border-radius: 0.65rem;
        }

        .admin-sidebar-mobile
          .finance-dashboard-icon {
          width: 30px !important;
          min-width: 30px !important;
          max-width: 30px !important;

          height: 30px;
        }

        .admin-sidebar-mobile
          .finance-dashboard-title {
          font-size: 0.84rem;
        }

        .admin-sidebar-mobile
          .finance-dashboard-subtitle {
          font-size: 0.67rem;
        }


        /* =================================================
            MOBILE LOGOUT
        ================================================= */

        .admin-sidebar-mobile .admin-sidebar-logout {
          flex: 0 0 auto;

          width: 100%;

          padding: 8px;

          padding-bottom:
            calc(8px + env(safe-area-inset-bottom));

          background: #080f1f;
        }


        /* =================================================
            TABLET DESKTOP
        ================================================= */

        @media (min-width: 768px) and (max-width: 991.98px) {

          .admin-sidebar {
            width: 230px;
          }

          .sidebar-item {
            font-size: 0.86rem;

            padding: 0.65rem 0.7rem;
          }

        }


        /* =================================================
            SMALL HEIGHT
        ================================================= */

        @media (max-height: 650px) {

          .admin-sidebar-brand {
            padding-top: 10px;

            padding-bottom: 8px;
          }

          .sidebar-item {
            padding-top: 0.55rem;

            padding-bottom: 0.55rem;

            margin-bottom: 1px;
          }

          .finance-dashboard-link {
            margin-top: 4px;

            margin-bottom: 5px;

            padding-top: 0.55rem;

            padding-bottom: 0.55rem;
          }

        }


        /* =================================================
            MOBILE RESPONSIVE
        ================================================= */

        @media (max-width: 767.98px) {

          .admin-sidebar.admin-sidebar-mobile {
            width: 100%;

            max-width: none;

            height: 100%;

            min-height: 100%;
          }

        }

      `}</style>


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`admin-sidebar ${
          mobile ? "admin-sidebar-mobile" : ""
        }`}
      >

        {/* =================================================
            MOBILE HEADER
        ================================================= */}

        {mobile && (
          <div className="admin-sidebar-mobile-header">

            <div className="d-flex align-items-center gap-2">

              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 34,
                  height: 34,
                  background: "#00e5ff",
                  color: "#080f1f",
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-people-fill"></i>
              </div>

              <div>
                <div
                  className="fw-bold text-white"
                  style={{
                    fontSize: 13,
                    lineHeight: 1.2,
                  }}
                >
                  HR & Payroll
                </div>

                <small className="text-muted">
                  Admin Panel
                </small>
              </div>

            </div>


            {/* =================================================
                BOOTSTRAP OFFCANVAS CLOSE
            ================================================= */}

            <button
              type="button"
              className="admin-sidebar-close"
              data-bs-dismiss="offcanvas"
              aria-label="Tutup menu"
            >
              <i className="bi bi-x-lg"></i>
            </button>

          </div>
        )}


        {/* =================================================
            BRAND DESKTOP
        ================================================= */}

        {!mobile && (
          <div className="admin-sidebar-brand">

            <div className="d-flex align-items-center gap-2">

              <div
                className="
                  rounded-3
                  d-flex
                  align-items-center
                  justify-content-center
                  flex-shrink-0
                "
                style={{
                  width: 38,
                  height: 38,
                  backgroundColor: "#00e5ff",
                  color: "#080f1f",
                }}
              >
                <i className="bi bi-people-fill fs-5"></i>
              </div>


              <div style={{ minWidth: 0 }}>

                <h6
                  className="fw-bold mb-0 text-white"
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  HR & Payroll
                </h6>

                <small className="text-muted">
                  Admin Panel
                </small>

              </div>

            </div>

          </div>
        )}


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="admin-sidebar-menu">

          <nav className="nav flex-column">

            {/* =================================================
                EMPLOYEE DROPDOWN
            ================================================= */}

            <div className="sidebar-dropdown">
              <button
                type="button"
                className={`sidebar-item sidebar-dropdown-toggle ${
                  employeeOpen ? "open" : ""
                }`}
                onClick={() => setEmployeeOpen((prev) => !prev)}
              >
                <i className="bi bi-people fs-5" />

                <span>Employee</span>

                <i className="bi bi-chevron-down dropdown-arrow" />
              </button>

              {employeeOpen && (
                <div className="sidebar-submenu">
                  <NavLink
                    to="/admin/employees"
                    onClick={handleMobileNavigation}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? "active" : ""}`
                    }
                  >
                    <i className="bi bi-people fs-5" />
                    <span>Employee Management</span>
                  </NavLink>

                  <NavLink
                    to="/admin/employee-lifecycle"
                    onClick={handleMobileNavigation}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? "active" : ""}`
                    }
                  >
                    <i className="bi bi-person-gear fs-5" />
                    <span>Employee Lifecycle</span>
                  </NavLink>
                </div>
              )}
            </div>


            {/* =================================================
                OTHER MENU
            ================================================= */}

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleMobileNavigation}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? "active" : ""}`
                }
              >
                <i className={`bi ${item.icon} fs-5`} />

                <span>
                  {item.label}
                </span>
              </NavLink>
            ))}


            {/* =================================================
                DASHBOARD FINANCE
                SUPERADMIN MASUK TANPA LOGOUT
            ================================================= */}

            <NavLink
              to="/finance/payroll"
              onClick={handleMobileNavigation}
              className={({ isActive }) =>
                `sidebar-item finance-dashboard-link ${
                  isActive ? "active" : ""
                }`
              }
            >

              <i className="bi bi-speedometer2 finance-dashboard-icon"></i>

              <span className="finance-dashboard-text">

                <span className="finance-dashboard-title">
                  Dashboard Finance
                </span>

                <span className="finance-dashboard-subtitle">
                  Masuk tanpa logout
                </span>

              </span>

              <i className="bi bi-arrow-right finance-dashboard-arrow"></i>

            </NavLink>


            {/* =================================================
                APPROVAL DROPDOWN
            ================================================= */}

            <div className="sidebar-dropdown">
              <button
                type="button"
                className={`sidebar-item sidebar-dropdown-toggle ${
                  approvalOpen ? "open" : ""
                }`}
                onClick={() => setApprovalOpen((prev) => !prev)}
              >
                <i className="bi bi-check2-square fs-5" />

                <span>Approval</span>

                <i className="bi bi-chevron-down dropdown-arrow" />
              </button>

              {approvalOpen && (
                <div className="sidebar-submenu">

                  <NavLink
                    to="/admin/approval/leave"
                    onClick={handleMobileNavigation}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? "active" : ""}`
                    }
                  >
                    <i className="bi bi-calendar2-check fs-5" />
                    <span>Approval Cuti</span>
                  </NavLink>


                  <NavLink
                    to="/admin/approval/medical"
                    onClick={handleMobileNavigation}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? "active" : ""}`
                    }
                  >
                    <i className="bi bi-journal-medical fs-5" />
                    <span>Approval Sakit</span>
                  </NavLink>


                  <NavLink
                    to="/admin/approval/meal-allowance"
                    onClick={handleMobileNavigation}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? "active" : ""}`
                    }
                  >
                    <i className="bi bi-clock-history fs-5" />
                    <span>Approval Uang Makan</span>
                  </NavLink>


                  <NavLink
                    to="/admin/approval/cash-advance"
                    onClick={handleMobileNavigation}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? "active" : ""}`
                    }
                  >
                    <i className="bi bi-cash-stack fs-5" />
                    <span>Approval Kasbon</span>
                  </NavLink>


                  <NavLink
                    to="/admin/approval/business-trip"
                    onClick={handleMobileNavigation}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? "active" : ""}`
                    }
                  >
                    <i className="bi bi-briefcase fs-5" />
                    <span>Approval Dinas Luar</span>
                  </NavLink>

                </div>
              )}

            </div>

          </nav>

        </div>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="admin-sidebar-logout">

          <button
            type="button"
            onClick={handleLogout}
            className="
              sidebar-item
              logout-item
              d-flex
              align-items-center
              border-0
            "
          >

            <i className="bi bi-box-arrow-right fs-5"></i>

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;

