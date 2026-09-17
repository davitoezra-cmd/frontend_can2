import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {apiFetch} from '../api/apiFetch';
import LogoutButton from '../components/LogoutButton';

const NavbarFinance = ({ title = "Dashboard Payroll", onToggleSidebar }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    apiFetch.get('/finance/profile')
      .then((res) => {
        if (res.data?.data?.finance) setUser(res.data.data.finance);
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="navbar bg-white border-bottom px-3 px-md-4 py-2 sticky-top shadow-sm">
      <div className="container-fluid px-0 d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2 gap-md-3 min-w-0">
          <button
            type="button"
            className="btn btn-light d-md-none border-0 p-2 text-dark shadow-none"
            onClick={onToggleSidebar}
            aria-label="Buka menu"
          >
            <i className="bi bi-list fs-4"></i>
          </button>
          <h5 className="fw-bold mb-0 text-dark fs-6 text-truncate">{title}</h5>
        </div>

        <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto flex-shrink-0">
          <Link to="/finance/profile" className="d-flex align-items-center gap-2 text-decoration-none">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Finance')}&background=0D6EFD&color=fff&size=64`}
              alt="Avatar"
              className="rounded-circle border border-primary"
              width="36"
              height="36"
            />
            <div className="d-none d-md-flex flex-column text-end">
              <span className="fw-bold text-dark lh-sm fs-6 text-truncate" style={{ maxWidth: 160 }}>
                {user?.name || 'Finance Staff'}
              </span>
              <small className="text-muted" style={{ fontSize: '11px' }}>Finance Department</small>
            </div>
          </Link>

          <LogoutButton compact className="navbar-logout-btn" />
        </div>
      </div>
    </nav>
  );
};

export default NavbarFinance;
