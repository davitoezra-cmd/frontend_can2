import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import {apiFetch} from '../api/apiFetch';

const AdminLayout = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch.get('/admin/profile');
        setUser(res.data.data.user);
      } catch (err) {
        // Handled by Interceptor
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="container-fluid p-0 d-flex min-vh-100">
      {/* Desktop Sidebar */}
      <div
        className="d-none d-md-block"
        style={{ width: '260px', flex: '0 0 260px' }}
      >
        <Sidebar />
      </div>

      {/* Mobile Offcanvas Sidebar */}
      <div
        className="offcanvas offcanvas-start border-0"
        tabIndex="-1"
        id="mobileSidebar"
        aria-labelledby="mobileSidebarLabel"
        style={{ width: 'min(86vw, 280px)' }}
      >
        <div className="visually-hidden" id="mobileSidebarLabel">Menu utama</div>
        <button
          type="button"
          className="btn-close btn-close-white position-absolute top-0 end-0 m-3 d-md-none"
          data-bs-dismiss="offcanvas"
          aria-label="Tutup menu"
          style={{ zIndex: 1060 }}
        />
        <div className="offcanvas-body p-0 position-relative overflow-hidden">
          <Sidebar mobile />
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="flex-grow-1 d-flex flex-column min-w-0"
        style={{
          background: '#f4f6f9',
        }}
      >
        <Navbar user={user} />

        <main className="p-3 p-md-4 flex-grow-1">
          <Outlet context={{ user, setUser }} />
        </main>
      </div>

    </div>
  );
};
export default AdminLayout;