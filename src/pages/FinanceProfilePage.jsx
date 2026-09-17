import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {apiFetch} from '../api/apiFetch';
import SidebarFinance from '../layouts/SidebarFinance';
import NavbarFinance from '../layouts/NavbarFinance';
import LoadingSpinner from '../components/LoadingSpinner';
import FaceEnrollmentCard from '../components/face/FaceEnrollmentCard';

const FinanceProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Finance'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Fetch Profile Data
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiFetch.get('/finance/profile');
      const data = res.data?.data?.finance || res.data?.data || {};
      
      setUser({
        name: data.name || 'Finance Staff',
        email: data.email || '',
        phone: data.phone || '-',
        role: 'Finance'
      });

      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengambil data profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch.put('/finance/profile', formData);
      toast.success(res.data?.message || 'Profil berhasil diperbarui!');
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'F';
  };

  return (
    <div className="d-flex min-vh-100 bg-light position-relative overflow-x-hidden">
      {/* 1. Sidebar Finance */}
      <SidebarFinance
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Main Area (Diberi class main-content-wrapper untuk penyesuaian layout) */}
      <div className="flex-grow-1 d-flex flex-column min-vh-100 main-content-wrapper" style={{ overflowX: 'hidden' }}>
        <NavbarFinance
          title="Profile Settings"
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <div className="container-fluid p-3 p-md-4">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="d-flex flex-column gap-3 gap-md-4">
              
              {/* Top Banner Card */}
              <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4">
                <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start text-center text-sm-start gap-3 gap-md-4">
                  <div 
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-1 shadow-sm flex-shrink-0"
                    style={{ width: 80, height: 80 }}
                  >
                    {getInitial(user.name)}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-2 mb-2">
                      <h3 className="fw-bold mb-0 text-dark fs-4 fs-md-3 text-truncate">{user.name}</h3>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill fw-semibold fs-7">
                        ● Finance Access
                      </span>
                    </div>
                    <p className="text-muted mb-2 d-flex align-items-center justify-content-center justify-content-sm-start gap-2 text-break fs-7">
                      <i className="bi bi-envelope"></i> {user.email}
                    </p>
                    <span className="badge bg-light text-primary border px-3 py-1.5 rounded-pill fw-medium fs-7">
                      <i className="bi bi-shield-check me-1"></i> Finance Department
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-md-4">
                  <div className="card border-0 shadow-sm rounded-4 bg-white p-3 d-flex flex-row align-items-center gap-3 h-100">
                    <div className="bg-primary-subtle text-primary p-3 rounded-3 fs-4 d-flex align-items-center justify-content-center">
                      <i className="bi bi-person-badge-fill"></i>
                    </div>
                    <div>
                      <small className="text-uppercase text-muted fw-bold d-block" style={{ fontSize: '11px' }}>ROLE</small>
                      <h6 className="fw-bold mb-0 text-dark">Finance Specialist</h6>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-md-4">
                  <div className="card border-0 shadow-sm rounded-4 bg-white p-3 d-flex flex-row align-items-center gap-3 h-100">
                    <div className="bg-success-subtle text-success p-3 rounded-3 fs-4 d-flex align-items-center justify-content-center">
                      <i className="bi bi-telephone-fill"></i>
                    </div>
                    <div>
                      <small className="text-uppercase text-muted fw-bold d-block" style={{ fontSize: '11px' }}>PHONE NUMBER</small>
                      <h6 className="fw-bold mb-0 text-dark text-break">{user.phone || '-'}</h6>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="card border-0 shadow-sm rounded-4 bg-white p-3 d-flex flex-row align-items-center gap-3 h-100">
                    <div className="bg-warning-subtle text-warning p-3 rounded-3 fs-4 d-flex align-items-center justify-content-center">
                      <i className="bi bi-shield-lock-fill"></i>
                    </div>
                    <div>
                      <small className="text-uppercase text-muted fw-bold d-block" style={{ fontSize: '11px' }}>ACCOUNT SECURITY</small>
                      <h6 className="fw-bold mb-0 text-dark">Protected</h6>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Form & Preview */}
              <div className="row g-3 g-md-4">
                {/* Form Edit */}
                <div className="col-12 col-lg-7">
                  <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 h-100">
                    <h5 className="fw-bold text-dark mb-1 fs-5">Edit Profile Information</h5>
                    <p className="text-muted fs-7 mb-4">Perbarui identitas dan kontak akun finance Anda.</p>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary fs-7">Nama Lengkap</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-person"></i></span>
                          <input
                            type="text"
                            name="name"
                            className="form-control bg-light border-start-0 custom-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary fs-7">Alamat Email</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-envelope"></i></span>
                          <input
                            type="email"
                            name="email"
                            className="form-control bg-light border-start-0 custom-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-semibold text-secondary fs-7">No. Telepon / WhatsApp</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-telephone"></i></span>
                          <input
                            type="text"
                            name="phone"
                            className="form-control bg-light border-start-0 custom-input"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Contoh: 08123456789"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary rounded-3 px-4 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto"
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg"></i>
                            <span>Simpan Perubahan</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Summary Card */}
                <div className="col-12 col-lg-5">
                  <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 h-100 text-center d-flex flex-column justify-content-center align-items-center">
                    <div className="bg-primary-subtle text-primary rounded-circle p-3 mb-3 fs-2 d-flex align-items-center justify-content-center" style={{ width: 70, height: 70 }}>
                      <i className="bi bi-gear-wide-connected"></i>
                    </div>
                    <h5 className="fw-bold text-dark mb-1 text-break">{user.name}</h5>
                    <p className="text-muted fs-7 mb-4 text-break">{user.email}</p>

                    <div className="w-100 bg-light p-3 rounded-4 text-start">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white p-2 rounded-3 shadow-sm text-primary flex-shrink-0">
                          <i className="bi bi-check-circle-fill fs-5"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '11px' }}>Role Hak Akses</small>
                          <span className="fw-bold text-dark">Finance Administrator</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <FaceEnrollmentCard guard="finance" />

            </div>
          )}
        </div>
      </div>

      {/* CSS RESPONSIVE KUSTOM */}
      <style>{`
        /* Penyesuaian margin agar konten tidak tertutup Sidebar di Desktop */
        @media (min-width: 768px) {
          .main-content-wrapper {
            margin-left: 250px !important;
            width: calc(100% - 250px) !important;
            min-width: 0;
          }
        }
        @media (max-width: 767.98px) {
          .main-content-wrapper {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
        .custom-input {
          font-size: 14px;
        }
        /* Mencegah iOS Auto Zoom pada input saat fokus di Mobile */
        @media (max-width: 575.98px) {
          .custom-input {
            font-size: 16px !important;
          }
          .w-sm-auto {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FinanceProfilePage;