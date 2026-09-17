import React, { useEffect, useState } from 'react';
import {apiFetch} from '../api/apiFetch';
import LoadingSpinner from '../components/LoadingSpinner';
import Swal from 'sweetalert2';
import FaceEnrollmentCard from '../components/face/FaceEnrollmentCard';

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiFetch.get('/admin/profile');
      const u = res.data.data.user;
      setProfile({
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
      });
    } catch (err) {
      // Handled by Interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch.put('/admin/profile', profile);
    } catch (err) {
      // Handled by Interceptor
    } finally {
      setSubmitting(false);
    }
  };

  
  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '1400px', color: '#0f172a' }}>
      
      {/* HEADER HERO CARD */}
      <div 
        className="card border-0 mb-4 overflow-hidden" 
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '24px', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)'
        }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4">
            
            {/* Avatar Bulat Besar */}
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
              style={{ 
                width: 96, 
                height: 96, 
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                fontSize: '2.5rem'
              }}
            >
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
            </div>

            {/* Admin Info */}
            <div className="text-center text-md-start flex-grow-1">
              <div className="d-flex flex-column flex-md-row align-items-center gap-2 mb-1">
                <h2 className="fw-bold mb-0" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                  {profile.name || 'Administrator'}
                </h2>
                <span 
                  className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"
                  style={{ 
                    backgroundColor: '#dcfce7', 
                    color: '#15803d',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <span className="rounded-circle" style={{ width: 6, height: 6, backgroundColor: '#16a34a' }}></span>
                  Super Admin
                </span>
              </div>
              
              <p className="text-secondary mb-3" style={{ fontSize: '0.95rem' }}>
                <i className="bi bi-envelope me-1"></i> {profile.email || 'admin@company.com'}
              </p>

              <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill font-monospace" style={{ borderColor: '#e2e8f0' }}>
                  <i className="bi bi-shield-check text-primary me-1"></i> Full Access Rights
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3 STATS CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div 
            className="card border-0 p-3 d-flex flex-row align-items-center gap-3"
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '20px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)'
            }}
          >
            <div 
              className="rounded-4 p-3 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: '#eff6ff', color: '#2563eb', width: 52, height: 52 }}
            >
              <i className="bi bi-person-badge fs-4"></i>
            </div>
            <div>
              <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.75rem' }}>ROLE</small>
              <span className="fw-bold fs-6" style={{ color: '#0f172a' }}>Administrator</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div 
            className="card border-0 p-3 d-flex flex-row align-items-center gap-3"
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '20px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)'
            }}
          >
            <div 
              className="rounded-4 p-3 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: '#f0fdf4', color: '#16a34a', width: 52, height: 52 }}
            >
              <i className="bi bi-telephone fs-4"></i>
            </div>
            <div>
              <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.75rem' }}>PHONE NUMBER</small>
              <span className="fw-bold fs-6" style={{ color: '#0f172a' }}>{profile.phone || '-'}</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div 
            className="card border-0 p-3 d-flex flex-row align-items-center gap-3"
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '20px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)'
            }}
          >
            <div 
              className="rounded-4 p-3 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: '#f8fafc', color: '#64748b', width: 52, height: 52 }}
            >
              <i className="bi bi-shield-lock fs-4"></i>
            </div>
            <div>
              <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.75rem' }}>ACCOUNT SECURITY</small>
              <span className="fw-bold fs-6" style={{ color: '#0f172a' }}>Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* LAYOUT 2 KOLOM */}
      <div className="row g-4 mb-4">
        
        {/* KOLOM KIRI: FORM EDIT PROFILE */}
        <div className="col-12 col-lg-7">
          <div 
            className="card border-0 p-4 p-md-5 h-100" 
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '24px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div className="mb-4">
              <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Edit Profile Information</h5>
              <p className="text-secondary small mb-0">Perbarui identitas dan kontak administrator sistem Anda.</p>
            </div>

            <form onSubmit={handleUpdate} className="d-flex flex-column justify-content-between flex-grow-1">
              <div>
                {/* Input Nama Lengkap */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary mb-2">
                    Nama Lengkap
                  </label>
                  <div className="input-group">
                    <span 
                      className="input-group-text bg-light text-muted border-end-0 px-3" 
                      style={{ borderColor: '#e2e8f0', borderRadius: '14px 0 0 14px' }}
                    >
                      <i className="bi bi-person fs-5"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light shadow-none border-start-0 px-2"
                      style={{ 
                        height: '52px', 
                        borderColor: '#e2e8f0', 
                        borderRadius: '0 14px 14px 0',
                        fontSize: '0.95rem'
                      }}
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                </div>

                {/* Input Alamat Email */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary mb-2">
                    Alamat Email
                  </label>
                  <div className="input-group">
                    <span 
                      className="input-group-text bg-light text-muted border-end-0 px-3" 
                      style={{ borderColor: '#e2e8f0', borderRadius: '14px 0 0 14px' }}
                    >
                      <i className="bi bi-envelope fs-5"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control bg-light shadow-none border-start-0 px-2"
                      style={{ 
                        height: '52px', 
                        borderColor: '#e2e8f0', 
                        borderRadius: '0 14px 14px 0',
                        fontSize: '0.95rem'
                      }}
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="admin@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Input Nomor Telepon */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary mb-2">
                    Nomor Telepon
                  </label>
                  <div className="input-group">
                    <span 
                      className="input-group-text bg-light text-muted border-end-0 px-3" 
                      style={{ borderColor: '#e2e8f0', borderRadius: '14px 0 0 14px' }}
                    >
                      <i className="bi bi-telephone fs-5"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light shadow-none border-start-0 px-2"
                      style={{ 
                        height: '52px', 
                        borderColor: '#e2e8f0', 
                        borderRadius: '0 14px 14px 0',
                        fontSize: '0.95rem'
                      }}
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="08123456789"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="btn text-white w-100 fw-semibold d-flex align-items-center justify-content-center shadow-sm"
                  style={{ 
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
                    borderRadius: '100px',
                    height: '52px',
                    fontSize: '0.95rem',
                    border: 'none'
                  }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i> Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: PROFILE CARD SUMMARY & DANGER ZONE */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-4">
          
          {/* Summary Card */}
          <div 
            className="card border-0 p-4 p-md-5" 
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '24px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div className="text-center mb-4 pb-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
              <div 
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-primary mb-3"
                style={{ width: 72, height: 72, backgroundColor: '#eff6ff' }}
              >
                <i className="bi bi-person-gear fs-1"></i>
              </div>
              <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>{profile.name || 'Admin Card'}</h5>
              <small className="text-secondary">{profile.email || '-'}</small>
            </div>

            <div className="d-flex flex-column gap-3">
              <div className="p-3 rounded-4 d-flex align-items-center justify-content-between" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-shield-check text-primary fs-5"></i>
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Role</small>
                    <span className="fw-semibold" style={{ color: '#0f172a' }}>Super Administrator</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-4 d-flex align-items-center justify-content-between" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-telephone text-primary fs-5"></i>
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Phone</small>
                    <span className="fw-semibold" style={{ color: '#0f172a' }}>{profile.phone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
            
        </div>

      </div>

      <FaceEnrollmentCard guard="user" />

      {/* ADDITIONAL INFORMATION CARD */}
      <div 
        className="card border-0 p-4 p-md-5 mb-4" 
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '24px', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)'
        }}
      >
        <div className="mb-4">
          <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Additional Information</h5>
          <p className="text-secondary small mb-0">Rincian tambahan mengenai akun dan hak akses sistem.</p>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="p-3 rounded-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <small className="text-secondary d-block mb-1" style={{ fontSize: '0.75rem' }}>FULL NAME</small>
              <span className="fw-bold" style={{ color: '#0f172a' }}>{profile.name || '-'}</span>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="p-3 rounded-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <small className="text-secondary d-block mb-1" style={{ fontSize: '0.75rem' }}>EMAIL ADDRESS</small>
              <span className="fw-semibold text-dark text-truncate d-block">{profile.email || '-'}</span>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="p-3 rounded-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <small className="text-secondary d-block mb-1" style={{ fontSize: '0.75rem' }}>PHONE NUMBER</small>
              <span className="fw-semibold text-dark">{profile.phone || '-'}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;