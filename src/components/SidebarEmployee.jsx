import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const SidebarEmployee = ({
  isOpen,
  onClose,
  onCloseMobile,
  showBackdrop = true,
  showMobileClose = true,
}) => {
  const location = useLocation();
  const closeSidebar = onClose || onCloseMobile || (() => {});
  const isControlled = typeof isOpen === "boolean";
  const effectiveOpen = isControlled ? isOpen : true;

  useEffect(() => {
    if (!isControlled || !effectiveOpen || window.innerWidth >= 992) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [effectiveOpen, isControlled]);

  // State untuk mengontrol status dropdown Business Trip
  const isBusinessTripPath = location.pathname.startsWith(
    "/employee/business-trip",
  );

  const [isBusinessTripOpen, setIsBusinessTripOpen] =
    useState(isBusinessTripPath);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    window.location.replace("/login");
  };

  // Fungsi pembantu untuk menutup sidebar saat item diklik
  const handleNavClick = () => {
    closeSidebar();
  };

  return (
    <>
      {/* Overlay Backdrop khusus Mobile saat Sidebar Terbuka */}
      <div
        className={`d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark ${
          showBackdrop && isControlled && effectiveOpen
            ? "opacity-50 pe-auto"
            : "opacity-0 pe-none"
        }`}
        style={{
          zIndex: 1040,
          transition: "opacity 0.3s ease-in-out",
        }}
        onClick={closeSidebar}
      />

      {/* Main Sidebar Container */}
      <aside
        className={`d-flex flex-column flex-shrink-0 p-3 shadow-sm style-sidebar position-fixed top-0 bottom-0 start-0 ${
          effectiveOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        style={{
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          width: "260px",
          height: "100vh",
          zIndex: 1050,
          overflowY: "auto",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Brand Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 px-2">
          <div className="d-flex align-items-center">
            <div
              className="bg-primary text-white p-2 rounded-3 me-2 fw-bold fs-5 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: 40, height: 40 }}
            >
              HR
            </div>

            <div>
              <h6 className="fw-bold mb-0 text-white">HR Portal</h6>
              <small style={{ color: "#94a3b8" }}>
                Employee Space
              </small>
            </div>
          </div>

          {/* Tombol Close khusus layar mobile */}
          {showMobileClose && (
            <button
              type="button"
              className="btn text-white-50 d-lg-none p-1 border-0 shadow-none"
              onClick={closeSidebar}
              aria-label="Close Sidebar"
            >
              <i className="bi bi-x-lg fs-5"></i>
            </button>
          )}
        </div>

        {/* Section Label */}
        <small
          className="text-uppercase fw-bold px-2 mb-2 d-block"
          style={{
            fontSize: "11px",
            color: "#64748b",
            letterSpacing: "0.5px",
          }}
        >
          Main Menu
        </small>

        {/* Navigation Links */}
        <ul className="nav nav-pills flex-column mb-auto gap-1">

          {/* ================= DASHBOARD ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/dashboard"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-grid-1x2-fill"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* ================= MY SHIFT ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/my-shift"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-calendar2-week-fill"></i>
              <span>My Shift</span>
            </NavLink>
          </li>

          {/* ================= ABSEN ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/attendance"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-clock-history"></i>
              <span>Absen</span>
            </NavLink>
          </li>

          {/* ================= CUTI ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/leave"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-calendar-event-fill"></i>
              <span>Cuti</span>
            </NavLink>
          </li>

          {/* ================= RESIGN ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/resignation"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-person-dash-fill"></i>
              <span>Pengajuan Resign</span>
            </NavLink>
          </li>

          {/* ================= SAKIT ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/medical"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-hospital-fill"></i>
              <span>Pengajuan Sakit</span>
            </NavLink>
          </li>

          {/* ================= UANG MAKAN ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/meal-allowance"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-cup-hot-fill"></i>
              <span>Uang Makan</span>
            </NavLink>
          </li>

          {/* ================= KASBON ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/cash-advance"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-wallet2"></i>
              <span>Kasbon</span>
            </NavLink>
          </li>

          {/* ================= PARENT: BUSINESS TRIP ================= */}
          <li className="nav-item">
            <button
              onClick={() =>
                setIsBusinessTripOpen(!isBusinessTripOpen)
              }
              className="btn w-100 text-start d-flex align-items-center justify-content-between py-2 px-3 rounded-3 border-0 shadow-none"
              style={{
                color: isBusinessTripPath
                  ? "#ffffff"
                  : "#cbd5e1",
                backgroundColor: "transparent",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-briefcase-fill"></i>
                <span>Business Trip</span>
              </div>

              <i
                className={`bi bi-chevron-${
                  isBusinessTripOpen ? "down" : "right"
                } fs-7`}
              ></i>
            </button>

            {/* SUBMENU */}
            {isBusinessTripOpen && (
              <ul className="nav flex-column ms-3 mt-1 gap-1 border-start border-secondary ps-2">

                {/* Business Trip Request */}
                <li className="nav-item">
                  <NavLink
                    to="/employee/business-trip"
                    end
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `nav-link py-1-5 px-3 rounded-3 fs-7 ${
                        isActive
                          ? "bg-primary text-white fw-medium"
                          : ""
                      }`
                    }
                    style={({ isActive }) => ({
                      color: isActive
                        ? "#fff"
                        : "#94a3b8",
                    })}
                  >
                    <i className="bi bi-circle fs-8 me-2"></i>
                    <span>Business Trip Request</span>
                  </NavLink>
                </li>

                {/* Business Trip Attendance */}
                <li className="nav-item">
                  <NavLink
                    to="/employee/business-trip/attendance"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `nav-link py-1-5 px-3 rounded-3 fs-7 ${
                        isActive
                          ? "bg-primary text-white fw-medium"
                          : ""
                      }`
                    }
                    style={({ isActive }) => ({
                      color: isActive
                        ? "#fff"
                        : "#94a3b8",
                    })}
                  >
                    <i className="bi bi-circle fs-8 me-2"></i>
                    <span>Business Trip Attendance</span>
                  </NavLink>
                </li>

              </ul>
            )}
          </li>

          {/* ================= BUKTI PEMBAYARAN BPJS ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/bpjs-payment"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-file-earmark-check-fill"></i>
              <span>Bukti BPJS</span>
            </NavLink>
          </li>

          {/* ================= TARGET KINERJA ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/targets"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-bullseye"></i>
              <span>Target Kinerja</span>
            </NavLink>
          </li>

          {/* ================= TUGAS ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/tasks"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-list-task"></i>
              <span>Tugas Saya</span>
            </NavLink>
          </li>

          {/* ================= PERFORMANCE ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/employee-performance"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "bg-primary text-white fw-semibold"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-graph-up-arrow"></i>
              <span>Performance</span>
            </NavLink>
          </li>

          {/* ================= BALANCE EMPLOYEE ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/balance"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-cash-stack"></i>
              <span>Saldo</span>
            </NavLink>
          </li>

          {/* ================= PENGELUARAN OPERASIONAL ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/operational-expenses"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-receipt-cutoff"></i>
              <span>Pengeluaran Operasional</span>
            </NavLink>
          </li>

          {/* ================= MEETING ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/meeting"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-camera-video-fill"></i>
              <span>Meeting</span>
            </NavLink>
          </li>

          {/* ================= ARTIKEL PERUSAHAAN ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/company-posts"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-newspaper"></i>
              <span>Artikel Perusahaan</span>
            </NavLink>
          </li>

          {/* ================= PROFILE ================= */}
          <li className="nav-item">
            <NavLink
              to="/employee/profile"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${
                  isActive
                    ? "active bg-primary text-white fw-medium"
                    : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#cbd5e1",
              })}
            >
              <i className="bi bi-person-fill"></i>
              <span>Profile</span>
            </NavLink>
          </li>

        </ul>

        {/* ================= LOGOUT ================= */}
        <hr
          className="my-3"
          style={{
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}
        />

        <button
          onClick={handleLogout}
          className="btn w-100 border-0 text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 shadow-none"
          style={{
            color: "#ef4444",
            backgroundColor: "#0f172a",
            position: "sticky",
            bottom: 0,
            zIndex: 3,
            marginTop: "0.5rem",
          }}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </aside>

      {/* Responsive Style Overrides */}
      <style>{`
        @media (max-width: 991.98px) {
          aside.sidebar-closed {
            transform: translateX(-100%);
          }

          aside.sidebar-open {
            transform: translateX(0);
          }
        }

        @media (min-width: 992px) {
          aside {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
};

export default SidebarEmployee;