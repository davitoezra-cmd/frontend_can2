
import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

const SidebarFinance = ({ isOpen = false, onClose = () => {} }) => {
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
        className={`d-flex flex-column flex-shrink-0 p-3 shadow-sm style-sidebar position-fixed top-0 bottom-0 start-0 ${
          isOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        style={{
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          width: "250px",
          zIndex: 1050,
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
        }}
      >
        {/* Brand Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 px-2">
          <div className="d-flex align-items-center">
            <div
              className="bg-primary text-white p-2 rounded-3 me-2 fw-bold fs-5 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: 40, height: 40 }}
            >
              <i className="bi bi-wallet-fill"></i>
            </div>

            <div>
              <h6 className="fw-bold mb-0 text-white">HR Finance</h6>
              <small style={{ color: "#94a3b8" }}>Finance Portal</small>
            </div>
          </div>

          {/* Tombol Close (X) khusus layar mobile */}
          <button
            type="button"
            className="btn text-white-50 d-md-none p-1 border-0 shadow-none"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <i className="bi bi-x-lg fs-5"></i>
          </button>
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
          Finance Menu
        </small>

        {/* Navigation Links */}
        <ul className="nav nav-pills flex-column mb-auto gap-1">

          {/* 1. Payroll Setting */}
          <li className="nav-item">
            <NavLink
              to="/finance/payroll-setting"
              onClick={onClose}
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
              <i className="bi bi-gear-fill"></i>
              <span>Payroll Setting</span>
            </NavLink>
          </li>

          {/* 2. Penggajian (Payroll) */}
          <li className="nav-item">
            <NavLink
              to="/finance/payroll"
              onClick={onClose}
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
              <span>Penggajian (Payroll)</span>
            </NavLink>
          </li>

          {/* 3. Riwayat Payroll */}
          <li className="nav-item">
            <NavLink
              to="/finance/payroll-history"
              onClick={onClose}
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
              <span>Riwayat Payroll</span>
            </NavLink>
          </li>

          {/* 4. Pencairan Kasbon */}
          <li className="nav-item">
            <NavLink
              to="/finance/cash-advance"
              onClick={onClose}
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
              <span>Pencairan Kasbon</span>
            </NavLink>
          </li>

          {/* 5. Bukti Pembayaran BPJS */}
          <li className="nav-item">
            <NavLink
              to="/finance/bpjs-payment"
              onClick={onClose}
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

          {/* 6. Saldo */}
          <li className="nav-item">
            <NavLink
              to="/finance/balance-withdrawal"
              onClick={onClose}
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
              <span>Saldo</span>
            </NavLink>
          </li>

          {/* 7. Pengeluaran Operasional */}
          <li className="nav-item">
            <NavLink
              to="/finance/operational-expense"
              onClick={onClose}
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

          {/* 8. Meeting */}
          <li className="nav-item">
            <NavLink
              to="/finance/meeting"
              onClick={onClose}
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
              <span>Meeting</span>
            </NavLink>
          </li>

          {/* 9. Profil Finance */}
          <li className="nav-item">
            <NavLink
              to="/finance/profile"
              onClick={onClose}
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
              <i className="bi bi-person-badge-fill"></i>
              <span>Profil Finance</span>
            </NavLink>
          </li>

        </ul>

        <hr
          className="my-3"
          style={{
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}
        />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn w-100 border-0 text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3"
          style={{
            color: "#ef4444",
            backgroundColor: "#0f172a",
            position: "sticky",
            bottom: 0,
            zIndex: 3,
          }}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </aside>

      {/* Style Transform untuk Animasi Slide Mobile */}
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

export default SidebarFinance;


