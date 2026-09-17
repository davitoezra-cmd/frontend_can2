import React, { useState, useEffect } from 'react';
import {apiFetch} from '../api/apiFetch';
import FaceEnrollmentCard from '../components/face/FaceEnrollmentCard';

const ProfileSupervisorPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // Menggunakan endpoint profile supervisor yang sudah ada
      const response = await apiFetch.get('/supervisor/profile');
      if (response.data && response.data.success) {
        setUser(response.data.data || response.data.user);
      } else {
        // Fallback mengambil dari local storage jika response API memiliki format berbeda
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(localUser);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      // Fallback ke localStorage jika request gagal agar UI tidak break
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (localUser && localUser.name) {
        setUser(localUser);
      } else {
        setError('Gagal memuat profil supervisor.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid p-3 p-md-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted small m-0">Memuat profil supervisor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="container-fluid p-3 p-md-4">
        <div className="alert alert-danger shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  // Pengambilan inisial nama untuk Avatar bundar biru
  const initialName = user?.name ? user.name.charAt(0).toUpperCase() : 'S';

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* ================= HERO HEADER CARD ================= */}
      <div className="card border-0 shadow-sm rounded-4 mb-3 mb-md-4 p-3 p-md-4 bg-white">
        <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-center text-center text-sm-start gap-3 gap-md-4">
          {/* Large Circle Avatar */}
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-1 flex-shrink-0"
            style={{ width: '80px', height: '80px' }}
          >
            {initialName}
          </div>

          <div className="w-100">
            <div className="d-flex flex-column flex-sm-row align-items-center gap-2 mb-1">
              <h4 className="fw-bold m-0 text-dark text-break">{user?.name || 'Supervisor'}</h4>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill fw-semibold small mt-1 mt-sm-0">
                • Active Employee
              </span>
            </div>
            <p className="text-muted small m-0 text-break">
              <i className="bi bi-envelope me-1"></i> {user?.email || 'supervisor@gembok.com'}
            </p>
          </div>
        </div>
      </div>

      {/* ================= 2 HORIZONTAL SUMMARY CARDS ================= */}
      <div className="row g-3 mb-3 mb-md-4">
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-4 bg-success-subtle p-3 text-success d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '50px', height: '50px' }}
              >
                <i className="bi bi-check-circle fs-4"></i>
              </div>
              <div className="text-truncate">
                <div className="text-muted small fw-bold text-uppercase">ACCOUNT STATUS</div>
                <div className="fw-bold text-dark fs-6 mt-1 text-truncate">{user?.status || 'Active'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-4 bg-light p-3 text-secondary d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '50px', height: '50px' }}
              >
                <i className="bi bi-telephone fs-4"></i>
              </div>
              <div className="text-truncate">
                <div className="text-muted small fw-bold text-uppercase">PHONE NUMBER</div>
                <div className="fw-bold text-dark fs-6 mt-1 text-truncate">{user?.phone || user?.no_hp || '081222222222'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT SECTION ================= */}
      <div className="row g-3 g-md-4">
        {/* Left Form: Profile Information */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 h-100">
            <h5 className="fw-bold text-dark mb-1">Profile Information</h5>
            <p className="text-muted small mb-4">Perbarui informasi profil dan identitas akun Anda di bawah ini.</p>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Nama Lengkap</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-light text-muted">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-light text-dark fw-semibold"
                    value={user?.name || ''}
                    readOnly
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Alamat Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-light text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-light border-light text-dark fw-semibold"
                    value={user?.email || ''}
                    readOnly
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Nomor Telepon</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-light text-muted">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-light text-dark fw-semibold"
                    value={user?.phone || user?.no_hp || '081222222222'}
                    readOnly
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Profile Summary Card */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 h-100 text-center d-flex flex-column justify-content-center">
            <div className="my-3">
              <div
                className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center p-3 mb-3"
                style={{ width: '80px', height: '80px' }}
              >
                <i className="bi bi-person-fill fs-1"></i>
              </div>
              <h5 className="fw-bold text-dark m-0 text-break">{user?.name || 'Supervisor'}</h5>
              <p className="text-muted small m-0 mt-1 text-break">{user?.email || 'supervisor@gembok.com'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 mt-md-4">
        <FaceEnrollmentCard guard="supervisor" />
      </div>
    </div>
  );
};

export default ProfileSupervisorPage;