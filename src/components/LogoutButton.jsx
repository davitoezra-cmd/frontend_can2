import React, { useState } from 'react';
import Swal from 'sweetalert2';
import {apiFetch} from '../api/apiFetch';

/**
 * Shared logout control for desktop and mobile navigation.
 * - Always clears the local auth session.
 * - Optionally calls an existing backend logout endpoint when provided.
 * - Navigation still completes if the server logout call fails/has expired.
 */
const LogoutButton = ({
  apiEndpoint = null,
  compact = false,
  className = '',
  onLoggedOut,
  confirm = true,
}) => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    if (confirm) {
      const result = await Swal.fire({
        title: 'Keluar dari sistem?',
        text: 'Sesi Anda akan diakhiri.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#dc3545',
        reverseButtons: true,
        customClass: { popup: 'rounded-4' },
      });

      if (!result.isConfirmed) return;
    }

    setLoading(true);

    try {
      if (apiEndpoint) {
        await apiFetch.post(apiEndpoint);
      }
    } catch {
      // Token may already be invalid/expired. Local logout must still finish.
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();

      if (typeof onLoggedOut === 'function') {
        onLoggedOut();
      }

      window.location.replace('/login');
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`btn btn-outline-danger d-inline-flex align-items-center justify-content-center gap-2 logout-nav-button ${className}`.trim()}
      aria-label="Logout"
      title="Logout"
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      ) : (
        <i className="bi bi-box-arrow-right" aria-hidden="true" />
      )}
      <span className={compact ? 'd-none d-lg-inline' : ''}>Logout</span>
    </button>
  );
};

export default LogoutButton;
