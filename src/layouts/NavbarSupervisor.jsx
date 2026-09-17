import React from 'react';
import LogoutButton from '../components/LogoutButton';

const NavbarSupervisor = ({ onToggleSidebar }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="navbar navbar-expand bg-white border-bottom px-3 px-md-4 py-2 sticky-top">
      <div className="container-fluid p-0 d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2 min-w-0">
          <button
            type="button"
            className="btn btn-light d-md-none p-2 rounded-3 d-flex align-items-center justify-content-center text-secondary border-0"
            onClick={onToggleSidebar}
            aria-label="Buka menu"
            style={{ width: '38px', height: '38px' }}
          >
            <i className="bi bi-list fs-4"></i>
          </button>

          <div className="d-none d-md-flex align-items-center" style={{ width: 'min(300px, 30vw)' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input type="text" className="form-control bg-light border-0 ps-0" placeholder="Cari..." />
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center ms-auto gap-2 gap-md-3 flex-shrink-0">
          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle p-2 d-none d-sm-flex align-items-center justify-content-center text-secondary"
            style={{ width: '36px', height: '36px' }}
            aria-label="Notifikasi"
          >
            <i className="bi bi-bell"></i>
          </button>

          <div className="vr my-2 text-muted opacity-25 d-none d-md-block"></div>

          <div className="d-flex align-items-center gap-2">
            <div className="text-end me-1 d-none d-md-block">
              <div className="fw-bold small text-dark mb-0 text-truncate" style={{ maxWidth: 150 }}>
                {user.name || 'Supervisor'}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Supervisor</div>
            </div>
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
              style={{ width: '38px', height: '38px', fontSize: '0.9rem' }}
            >
              <i className="bi bi-person-fill"></i>
            </div>
          </div>

          <LogoutButton compact className="navbar-logout-btn" />
        </div>
      </div>
    </header>
  );
};

export default NavbarSupervisor;
