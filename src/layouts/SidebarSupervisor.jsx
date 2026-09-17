import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

const SidebarSupervisor = ({ isOpen = false, onClose = () => {} }) => {
  useEffect(() => {
    if (!isOpen || window.innerWidth >= 768) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    window.location.replace("/login");
  };

  return (
    <>
      {/* Overlay Backdrop saat Mobile Terbuka */}
      <div
        className={`d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark ${
          isOpen ? "opacity-50 pe-auto" : "opacity-0 pe-none"
        }`}
        style={{
          zIndex: 1040,
          transition: "opacity 0.3s ease-in-out",
        }}
        onClick={onClose}
      />

      {/* Sidebar Main */}
      <aside
        className={`d-flex flex-column flex-shrink-0 text-white position-fixed top-0 bottom-0 start-0 ${
          isOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        style={{
          width: "250px",
          backgroundColor: "#0d1b2a",
          zIndex: 1050,
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Brand Header */}
        <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-25">
          <div className="d-flex align-items-center gap-2">
            <div
              className="bg-primary text-white rounded-3 fw-bold d-flex align-items-center justify-content-center"
              style={{
                width: "38px",
                height: "38px",
                fontSize: "0.95rem",
              }}
            >
              HR
            </div>

            <div>
              <h6 className="fw-bold text-white m-0 lh-1">HR Portal</h6>

              <small className="text-secondary" style={{ fontSize: "0.75rem" }}>
                Supervisor Space
              </small>
            </div>
          </div>

          {/* Tombol Close Mobile */}
          <button
            type="button"
            className="btn text-white-50 d-md-none p-1 border-0 shadow-none"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-3 flex-grow-1 overflow-auto">
          <div
            className="text-uppercase fw-bold text-secondary mb-2 px-2"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.5px",
            }}
          >
            MAIN MENU
          </div>

          <nav className="nav nav-pills flex-column gap-1">
            {/* DASHBOARD */}
            <NavLink
              to="/supervisor/dashboard"
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-white ${
                  isActive
                    ? "bg-primary fw-semibold"
                    : "opacity-75 hover-opacity-100"
                }`
              }
            >
              <i className="bi bi-grid-fill"></i>
              <span>Dashboard</span>
            </NavLink>

            {/* TASK SAYA */}
            <NavLink
              to="/supervisor/tasks"
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-white ${
                  isActive
                    ? "bg-primary fw-semibold"
                    : "opacity-75 hover-opacity-100"
                }`
              }
            >
              <i className="bi bi-clipboard-check"></i>
              <span>Task Saya</span>
            </NavLink>

            {/* REKAP KEHADIRAN */}
            <NavLink
              to="/supervisor/rekap-kehadiran"
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-white ${
                  isActive
                    ? "bg-primary fw-semibold"
                    : "opacity-75 hover-opacity-100"
                }`
              }
            >
              <i className="bi bi-clock-history"></i>
              <span>Rekap Kehadiran</span>
            </NavLink>

            {/* PENGAJUAN */}
            <NavLink
              to="/supervisor/pengajuan"
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-white ${
                  isActive
                    ? "bg-primary fw-semibold"
                    : "opacity-75 hover-opacity-100"
                }`
              }
            >
              <i className="bi bi-file-earmark-text"></i>
              <span>Pengajuan</span>
            </NavLink>

            {/* TARGET KINERJA */}
            <NavLink
              to="/supervisor/employee-targets"
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-white ${
                  isActive
                    ? "bg-primary fw-semibold"
                    : "opacity-75 hover-opacity-100"
                }`
              }
            >
              <i className="bi bi-bullseye"></i>
              <span>Target Kinerja</span>
            </NavLink>

            {/* MEETING */}
            <NavLink
              to="/supervisor/meeting"
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-white ${
                  isActive
                    ? "bg-primary fw-semibold"
                    : "opacity-75 hover-opacity-100"
                }`
              }
            >
              <i className="bi bi-calendar-event-fill"></i>
              <span>Meeting</span>
            </NavLink>

            {/* PROFILE */}
            <NavLink
              to="/supervisor/profile"
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-white ${
                  isActive
                    ? "bg-primary fw-semibold"
                    : "opacity-75 hover-opacity-100"
                }`
              }
            >
              <i className="bi bi-person-fill"></i>
              <span>Profile</span>
            </NavLink>
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-top border-secondary border-opacity-25">
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-link text-danger text-decoration-none d-flex align-items-center gap-2 w-100 px-2 py-1 shadow-none"
          >
            <i className="bi bi-box-arrow-right fs-5"></i>
            <span className="fw-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Style Transform untuk Animasi Slide */}
      <style>{`
        @media (max-width: 767.98px) {
          .sidebar-closed {
            transform: translateX(-100%);
          }

          .sidebar-open {
            transform: translateX(0);
          }
        }

        @media (min-width: 768px) {
          aside {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
};

export default SidebarSupervisor;
