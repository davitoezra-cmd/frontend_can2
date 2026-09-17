import React from 'react';
import LogoutButton from '../components/LogoutButton';

const Navbar = ({ user }) => {
  return (
    <header className="bg-white border-bottom px-3 px-md-4 py-2 py-md-3 d-flex justify-content-between align-items-center sticky-top gap-2">
      <button
        className="btn btn-light d-md-none rounded-3 flex-shrink-0"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#mobileSidebar"
        aria-controls="mobileSidebar"
        aria-label="Buka menu"
      >
        <i className="bi bi-list fs-4"></i>
      </button>

      <div className="d-none d-md-block min-w-0">
        <span className="text-muted">Selamat Datang,</span>
        <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: 280 }}>
          {user?.name || 'Super Admin'}
        </h6>
      </div>

      <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto flex-shrink-0">
        <div className="text-end d-none d-sm-block">
          <div className="fw-semibold text-truncate" style={{ maxWidth: 170 }}>
            {user?.name || 'Super Admin'}
          </div>
          <small className="text-muted">Super Admin</small>
        </div>

        <div
          className="bg-light rounded-circle d-flex align-items-center justify-content-center border"
          style={{ width: 40, height: 40 }}
        >
          <i className="bi bi-person-fill fs-4 text-secondary"></i>
        </div>

        <LogoutButton apiEndpoint="/admin/logout" compact className="navbar-logout-btn" />
      </div>
    </header>
  );
};

export default Navbar;
