import React, { useEffect, useState } from 'react';
import {apiFetch} from '../api/apiFetch';
import SidebarEmployee from '../components/SidebarEmployee';
import NavbarEmployee from '../layouts/NavbarEmployee';
import LoadingSpinner from '../components/LoadingSpinner';
import Swal from 'sweetalert2';
import FaceEnrollmentCard from '../components/face/FaceEnrollmentCard';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    employee_code: '',
    phone: '',
    is_active: true,

    nama_bank: '',
   no_rekening: '', 
   nama_rekening: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State untuk Profile Header & Sidebar Toggle (Mobile & Desktop)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 992 : true
  );

  // Auto-close sidebar jika layar berukuran mobile saat pertama kali load
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch data profile dari Backend (GET /employee/profile)
  const fetchProfile = async () => {
    try {
      const res = await apiFetch.get('/employee/profile');
      if (res.data.success) {
        const responseData = res.data.data;
        const emp = responseData.employee || responseData;
        
        setProfile({
          name: emp.name || '',
          email: emp.email || '',
          employee_code: emp.employee_code || '-',
          phone: emp.phone || '-',
          is_active: emp.is_active ?? true,

          nama_bank: emp.nama_bank || '', 
          no_rekening: emp.no_rekening || '', 
          nama_rekening: emp.nama_rekening || '',
        });

        // Simpan juga ke state user untuk NavbarEmployee jika ada properti tambahan
        setUser(emp);
      }
    } catch (err) {
      console.error('Gagal mengambil data profil:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit update profile ke Backend (PUT /employee/profile)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch.put('/employee/profile', {
        name: profile.name,
        email: profile.email,

        nama_bank: profile.nama_bank || '', 
        no_rekening: profile.no_rekening || '', 
        nama_rekening: profile.nama_rekening || '',
      });

      if (res.data.success) {
        const updatedData = res.data.data;
        const updatedEmp = updatedData.employee || updatedData;
        
        // Update local state & user state
        setProfile((prev) => ({
          ...prev,
          name: updatedEmp.name,
          email: updatedEmp.email,
        }));
        setUser(updatedEmp);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: res.data.message || 'Profile berhasil diperbarui',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-4' },
        });
      }
    } catch (err) {
      console.error('Gagal memperbarui profil:', err);
      const errorMsg = err.response?.data?.message || 'Gagal memperbarui profil.';
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: errorMsg,
        customClass: { popup: 'rounded-4' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 position-relative" style={{ backgroundColor: '#F8FAFC', color: '#0f172a' }}>

      {/* Styles Fix Sidebar Full Height, Smooth Slide Animation & Backdrop */}
      <style>{`
        /* Dynamic Overlay Backdrop (Mobile Only) */
        .sidebar-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(3px);
          z-index: 1040;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .sidebar-backdrop.show {
          opacity: 1;
          visibility: visible;
        }

        /* Sidebar Wrapper Fix Full Height */
        .sidebar-container {
          width: 260px;
          height: 100vh !important;
          max-height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          bottom: 0 !important;
          left: 0 !important;
          z-index: 1050;
          background-color: #0f172a;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          overflow-y: auto;
        }

        /* State ketika Sidebar Tertutup (Mobile Only) */
        @media (max-width: 991.98px) {
          .sidebar-container.closed {
            transform: translateX(-100%);
          }
          .sidebar-container.open {
            transform: translateX(0);
          }
          .main-content-wrapper {
            margin-left: 0 !important;
          }
        }

        /* Main Content Transition Shift & Permanent Sidebar on Desktop */
        @media (min-width: 992px) {
          .sidebar-container {
            transform: translateX(0) !important;
          }
          .main-content-wrapper {
            margin-left: 260px !important;
          }
        }

        .main-content-wrapper {
          min-height: 100vh;
          transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Backdrop Gelap saat Sidebar Terbuka di Mobile */}
      <div 
        className={`sidebar-backdrop d-lg-none ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Employee Container (Fixed & Full Height) */}
      <aside className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`}>
        
        {/* Tombol Silang (X) - Hanya Muncul di Mobile (d-lg-none) */}
        <button 
          className="btn btn-sm text-white rounded-circle position-absolute top-0 end-0 m-3 d-flex d-lg-none align-items-center justify-content-center"
          style={{ 
            width: '32px', 
            height: '32px', 
            zIndex: 1060, 
            backgroundColor: 'rgba(255, 255, 255, 0.12)', 
            border: 'none' 
          }}
          onClick={() => setIsSidebarOpen(false)}
          title="Tutup Sidebar"
        >
          <i className="bi bi-x-lg fs-6"></i>
        </button>

        {/* Komponen Utama Sidebar */}
        <SidebarEmployee
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          showBackdrop={false}
          showMobileClose={false}
        />
      </aside>

      {/* Main Content Area */}
      <div className="main-content-wrapper d-flex flex-column min-w-0">
        
        {/* Navbar Layout Atas Konsisten */}
        <div className="sticky-top" style={{ zIndex: 1020 }}>
          <NavbarEmployee
            user={user}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          />
        </div>

        {/* Profile Main Content */}
        <main className="p-3 p-md-4 container-fluid flex-grow-1 overflow-auto" style={{ maxWidth: '1400px' }}>
          {loading ? (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
              <LoadingSpinner />
            </div>
          ) : (
            <>
          {/* PROFILE HEADER CARD */}
          <div 
            className="card border-0 mb-4 position-relative overflow-hidden bg-white" 
            style={{ 
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
                    width: 100, 
                    height: 100, 
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    fontSize: '2.5rem'
                  }}
                >
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'E'}
                </div>

                {/* Main Info */}
                <div className="text-center text-md-start flex-grow-1">
                  <div className="d-flex flex-column flex-md-row align-items-center gap-2 mb-1">
                    <h2 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                      {profile.name || 'Employee Name'}
                    </h2>
                    {/* Badge Status */}
                    <span 
                      className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"
                      style={{ 
                        backgroundColor: profile.is_active ? '#dcfce7' : '#fee2e2', 
                        color: profile.is_active ? '#15803d' : '#b91c1c',
                        fontSize: '0.825rem',
                        fontWeight: 600
                      }}
                    >
                      <span 
                        className="rounded-circle" 
                        style={{ 
                          width: 6, 
                          height: 6, 
                          backgroundColor: profile.is_active ? '#16a34a' : '#dc2626' 
                        }}
                      ></span>
                      {profile.is_active ? 'Active Employee' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-secondary mb-3" style={{ fontSize: '0.95rem' }}>
                    <i className="bi bi-envelope me-1"></i> {profile.email || 'employee@email.com'}
                  </p>

                  <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
                    <span className="badge bg-light text-dark border px-3 py-2 rounded-pill font-monospace" style={{ borderColor: '#e2e8f0' }}>
                      <i className="bi bi-person-badge text-muted me-1"></i> {profile.employee_code}
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
                className="card border-0 p-3 d-flex flex-row align-items-center gap-3 bg-white h-100"
                style={{ 
                  borderRadius: '20px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div 
                  className="rounded-4 p-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#eff6ff', color: '#2563eb', width: 54, height: 54 }}
                >
                  <i className="bi bi-card-heading fs-4"></i>
                </div>
                <div>
                  <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.8rem' }}>EMPLOYEE ID</small>
                  <span className="fw-bold fs-6" style={{ color: '#0f172a' }}>{profile.employee_code}</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div 
                className="card border-0 p-3 d-flex flex-row align-items-center gap-3 bg-white h-100"
                style={{ 
                  borderRadius: '20px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div 
                  className="rounded-4 p-3 d-flex align-items-center justify-content-center"
                  style={{ 
                    backgroundColor: profile.is_active ? '#f0fdf4' : '#fef2f2', 
                    color: profile.is_active ? '#16a34a' : '#dc2626', 
                    width: 54, 
                    height: 54 
                  }}
                >
                  <i className={`bi ${profile.is_active ? 'bi-check-circle' : 'bi-x-circle'} fs-4`}></i>
                </div>
                <div>
                  <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.8rem' }}>ACCOUNT STATUS</small>
                  <span className="fw-bold fs-6" style={{ color: '#0f172a' }}>{profile.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div 
                className="card border-0 p-3 d-flex flex-row align-items-center gap-3 bg-white h-100"
                style={{ 
                  borderRadius: '20px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div 
                  className="rounded-4 p-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#f8fafc', color: '#64748b', width: 54, height: 54 }}
                >
                  <i className="bi bi-telephone fs-4"></i>
                </div>
                <div>
                  <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.8rem' }}>PHONE NUMBER</small>
                  <span className="fw-bold fs-6" style={{ color: '#0f172a' }}>{profile.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* LAYOUT 2 KOLOM */}
          <div className="row g-4 mb-4">
            
            {/* KOLOM KIRI: EDIT PROFILE FORM */}
            <div className="col-12 col-lg-7">
              <div 
                className="card border-0 p-4 p-md-5 h-100 bg-white" 
                style={{ 
                  borderRadius: '24px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)'
                }}
              >
                <div className="mb-4">
                  <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Profile Information</h5>
                  <p className="text-secondary small mb-0">Perbarui informasi profil dan identitas akun Anda di bawah ini.</p>
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

                    {/* Input Email */}
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
                          placeholder="nama@email.com"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
{/* Input Nama Bank */}
<div className="mb-4">
  <label className="form-label small fw-bold text-secondary mb-2">
    Nama Bank
  </label>
  <div className="input-group">
    <span
      className="input-group-text bg-light text-muted border-end-0 px-3"
      style={{
        borderColor: '#e2e8f0',
        borderRadius: '14px 0 0 14px'
      }}
    >
      <i className="bi bi-bank fs-5"></i>
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
      value={profile.nama_bank}
      onChange={(e) =>
        setProfile({
          ...profile,
          nama_bank: e.target.value
        })
      }
      placeholder="Contoh: BCA"
    />
  </div>
</div>

{/* Input Nomor Rekening */}
<div className="mb-4">
  <label className="form-label small fw-bold text-secondary mb-2">
    Nomor Rekening
  </label>
  <div className="input-group">
    <span
      className="input-group-text bg-light text-muted border-end-0 px-3"
      style={{
        borderColor: '#e2e8f0',
        borderRadius: '14px 0 0 14px'
      }}
    >
      <i className="bi bi-credit-card fs-5"></i>
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
      value={profile.no_rekening}
      onChange={(e) =>
        setProfile({
          ...profile,
          no_rekening: e.target.value
        })
      }
      placeholder="Masukkan nomor rekening"
    />
  </div>
</div>

{/* Input Nama Rekening */}
<div className="mb-4">
  <label className="form-label small fw-bold text-secondary mb-2">
    Nama Pemilik Rekening
  </label>
  <div className="input-group">
    <span
      className="input-group-text bg-light text-muted border-end-0 px-3"
      style={{
        borderColor: '#e2e8f0',
        borderRadius: '14px 0 0 14px'
      }}
    >
      <i className="bi bi-person-vcard fs-5"></i>
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
      value={profile.nama_rekening}
      onChange={(e) =>
        setProfile({
          ...profile,
          nama_rekening: e.target.value
        })
      }
      placeholder="Masukkan nama pemilik rekening"
    />
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
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
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

            {/* KOLOM KANAN: EMPLOYEE CARD */}
            <div className="col-12 col-lg-5">
              <div 
                className="card border-0 p-4 p-md-5 h-100 d-flex flex-column justify-content-between bg-white" 
                style={{ 
                  borderRadius: '24px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)'
                }}
              >
                <div>
                  <div className="text-center mb-4 pb-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                    <div 
                      className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-primary mb-3"
                      style={{ width: 72, height: 72, backgroundColor: '#eff6ff' }}
                    >
                      <i className="bi bi-person-circle fs-1"></i>
                    </div>
                    <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>{profile.name || 'Employee Card'}</h5>
                    <small className="text-secondary">{profile.email || '-'}</small>
                  </div>

                  {/* Info List */}
                  <div className="d-flex flex-column gap-3">
                    
                    <div className="p-3 rounded-4 d-flex align-items-center justify-content-between" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <div className="d-flex align-items-center gap-3">
                        <i className="bi bi-shield-lock text-primary fs-5"></i>
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Employee Code</small>
                          <span className="fw-bold font-monospace" style={{ color: '#0f172a' }}>{profile.employee_code}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-4 d-flex align-items-center justify-content-between" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <div className="d-flex align-items-center gap-3">
                        <i className="bi bi-telephone text-primary fs-5"></i>
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Phone</small>
                          <span className="fw-semibold" style={{ color: '#0f172a' }}>{profile.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-4 d-flex align-items-center justify-content-between" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <div className="d-flex align-items-center gap-3">
                        <i className="bi bi-activity text-primary fs-5"></i>
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Status</small>
                          <span className="fw-semibold" style={{ color: profile.is_active ? '#16a34a' : '#dc2626' }}>
                            {profile.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <span 
                        className="rounded-circle" 
                        style={{ width: 10, height: 10, backgroundColor: profile.is_active ? '#22c55e' : '#ef4444' }}
                      ></span>
                    </div>

                  </div>
                </div>

                <div className="mt-4 pt-3 text-center border-top" style={{ borderColor: '#f1f5f9' }}>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    HR & Payroll System • Verified Profile
                  </small>
                </div>
              </div>
            </div>

          </div>

          {/* FACE RECOGNITION / FACE LOGIN */}
          <FaceEnrollmentCard />

          {/* ADDITIONAL INFORMATION CARD */}
          <div 
            className="card border-0 p-4 p-md-5 mb-4 bg-white" 
            style={{ 
              borderRadius: '24px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div className="mb-4">
              <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Additional Information</h5>
              <p className="text-secondary small mb-0">Rincian tambahan mengenai status akun dan identitas sistem.</p>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-3">
                <div className="p-3 rounded-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <small className="text-secondary d-block mb-1" style={{ fontSize: '0.75rem' }}>EMPLOYEE CODE</small>
                  <span className="fw-bold font-monospace" style={{ color: '#0f172a' }}>{profile.employee_code}</span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <div className="p-3 rounded-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <small className="text-secondary d-block mb-1" style={{ fontSize: '0.75rem' }}>PHONE NUMBER</small>
                  <span className="fw-semibold text-dark">{profile.phone}</span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <div className="p-3 rounded-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <small className="text-secondary d-block mb-1" style={{ fontSize: '0.75rem' }}>EMAIL ADDRESS</small>
                  <span className="fw-semibold text-dark text-truncate d-block">{profile.email || '-'}</span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <div className="p-3 rounded-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <small className="text-secondary d-block mb-1" style={{ fontSize: '0.75rem' }}>ACCOUNT STATUS</small>
                  <span className={`fw-bold ${profile.is_active ? 'text-success' : 'text-danger'}`}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export default Profile;