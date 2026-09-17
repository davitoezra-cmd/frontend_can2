import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM untuk Portal
import {apiFetch} from '../api/apiFetch';
import {
  Users,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  X,
  AlertCircle,
  IdCard,
  KeyRound,
} from 'lucide-react';

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    employee_code: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    is_active: false
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Lock scroll background saat modal terbuka
  useEffect(() => {
    if (isModalOpen || deleteTarget) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, deleteTarget]);

  // Fetch Employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get(`/admin/employees`);
      if (response.data.success) {
        setEmployees(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Helper: pastikan modal muncul tepat di tengah viewport aktif (khusus mobile)
  const resetScrollForModal = () => {
    // Scroll halaman ke atas dulu supaya perhitungan center tidak terpengaruh
    // posisi scroll sebelumnya (penting di HP karena address bar bisa collapse/expand)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Auto-scroll input yang sedang fokus ke tengah layar (mengatasi keyboard HP menutupi field)
  const handleFocusScroll = (e) => {
    const target = e.target;
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  // Form Handlers
  const openAddModal = () => {
    resetScrollForModal();
    setModalMode('add');
    setSelectedEmployee(null);
    setFormData({
      employee_code: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      email: '',
      phone: '',
      password: '',
        is_active: false
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    resetScrollForModal();
    setModalMode('edit');
    setSelectedEmployee(emp);
    setFormData({
      employee_code: emp.employee_code || '',
      name: emp.name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      password: '',
      is_active: Boolean(emp.is_active)
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const payload = { ...formData };
    if (modalMode === 'edit' && !payload.password) {
      delete payload.password;
    }
    if (modalMode === 'edit') {
      // Status aktif dikelola melalui Employee Lifecycle, bukan form profil.
      delete payload.is_active;
    }

    try {
      if (modalMode === 'add') {
        await apiFetch.post(`/admin/employees`, payload);
      } else {
        await apiFetch.put(`/admin/employees/${selectedEmployee.id}`, payload);
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        alert('Terjadi kesalahan pada server');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch.delete(`/admin/employees/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      alert('Gagal menghapus pegawai');
    } finally {
      setDeleting(false);
    }
  };

  // Safe Filtering
  const filteredEmployees = employees.filter((emp) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      (emp.name || '').toLowerCase().includes(searchLower) ||
      (emp.employee_code || '').toLowerCase().includes(searchLower) ||
      (emp.email || '').toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? Boolean(emp.is_active)
        : !emp.is_active;

    return matchesSearch && matchesStatus;
  });

  const totalCount = employees.length;
  const activeCount = employees.filter((e) => Boolean(e.is_active)).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="emp-page min-vh-100" style={{ backgroundColor: '#f5f4f1' }}>
      <style>{`
        .emp-page .card { border: 1px solid #e6e2d8; }
        .emp-page .avatar-circle {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
        }
        .emp-page .table-row-hover:hover { background-color: #faf9f6; }
        .emp-page .btn-brand {
          background-color: #1c1b19; border-color: #1c1b19; color: #fff;
        }
        .emp-page .btn-brand:hover { background-color: #333029; border-color: #333029; color: #fff; }
        .emp-page .text-brand-amber { color: #b8791f; }
        .emp-page .bg-teal-soft { background-color: #e4f2f0; color: #1f6f64; }
        
        /* Modal Backdrop Presisi Mengisi Seluruh Viewport & Auto Center (fix mobile) */
        .modal-backdrop-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100dvh; /* dynamic viewport height: mengikuti ukuran layar asli HP */
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto; /* backdrop bisa discroll sendiri saat keyboard HP muncul */
          -webkit-overflow-scrolling: touch;
          padding: 1rem;
          z-index: 999999;
        }

        .modal-card-custom {
          background: #fff;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 550px;
          max-height: 90dvh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          margin: auto; /* auto-center vertikal & horizontal di dalam backdrop flex */
        }

        .modal-scroll-custom {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        @media (min-width: 576px) {
          .modal-scroll-custom {
            padding: 1.5rem;
          }
        }

        @media (max-width: 575.98px) {
          .emp-page-container {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
          .emp-page .btn-filter-group {
            width: 100%;
            display: flex;
          }
          .emp-page .btn-filter-group .btn {
            flex: 1;
            padding-left: 0.25rem;
            padding-right: 0.25rem;
          }

          /* Di HP, modal dibuat menempel rapi & tidak terlalu mepet ke tepi */
          .modal-backdrop-custom {
            padding: 0.75rem;
            align-items: flex-start; /* card mulai dari atas kalau kontennya panjang + keyboard muncul */
            padding-top: 2.5rem;
          }
          .modal-card-custom {
            max-height: 85dvh;
          }
        }
      `}</style>

      <div className="emp-page-container container-fluid py-3 py-md-4 px-3 px-md-5">

        {/* Header Responsive */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-2 gap-sm-3 w-100 w-sm-auto">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
              style={{ width: 42, height: 42, backgroundColor: '#b8791f' }}
            >
              <Clock size={20} color="#fff" />
            </div>
            <div className="flex-grow-1 min-w-0">
              <div className="text-uppercase fw-semibold text-brand-amber mb-0" style={{ letterSpacing: '0.1em', fontSize: '0.65rem' }}>
                Presensi &amp; SDM
              </div>
              <h1 className="h5 h3-md fw-bold mb-0 text-dark text-truncate">Manajemen Pegawai</h1>
              <p className="text-secondary small mb-0 d-none d-sm-block" style={{ maxWidth: 480 }}>
                Kelola identitas dan status pegawai. Jam kerja diatur melalui Shift Schedules.
              </p>
            </div>

            <button 
              onClick={openAddModal} 
              className="btn btn-brand d-sm-none d-inline-flex align-items-center justify-content-center gap-1 px-2 py-2 shadow-sm flex-shrink-0"
              style={{ height: '38px' }}
            >
              <UserPlus size={16} />
              <span className="small fw-semibold" style={{ fontSize: '0.8rem' }}>Tambah</span>
            </button>
          </div>

          <button 
            onClick={openAddModal} 
            className="btn btn-brand d-none d-sm-inline-flex align-items-center justify-content-center gap-2 px-3 px-md-4 py-2 shadow-sm"
          >
            <UserPlus size={18} />
            <span>Tambah Pegawai</span>
          </button>
        </div>

        {/* Stat Summary */}
        <div className="row g-2 g-md-3 mb-3 mb-md-4">
          <div className="col-12 col-sm-4">
            <div className="card rounded-4 shadow-sm h-100">
              <div className="card-body p-3 p-md-4">
                <div className="text-uppercase small text-secondary fw-semibold mb-1" style={{ fontSize: '0.68rem' }}>Total Pegawai</div>
                <div className="fs-4 fs-md-3 fw-bold text-dark">{totalCount}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-sm-4">
            <div className="card rounded-4 shadow-sm h-100">
              <div className="card-body p-3 p-md-4">
                <div className="text-uppercase small fw-semibold mb-1" style={{ fontSize: '0.68rem', color: '#1f6f64' }}>Aktif</div>
                <div className="fs-4 fs-md-3 fw-bold" style={{ color: '#1f6f64' }}>{activeCount}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-sm-4">
            <div className="card rounded-4 shadow-sm h-100">
              <div className="card-body p-3 p-md-4">
                <div className="text-uppercase small text-secondary fw-semibold mb-1" style={{ fontSize: '0.68rem' }}>Non-Aktif</div>
                <div className="fs-4 fs-md-3 fw-bold text-secondary">{inactiveCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="card rounded-4 shadow-sm mb-3 mb-md-4">
          <div className="card-body p-3 p-md-4 d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-2 gap-md-3">
            <div className="input-group w-100" style={{ maxWidth: 360 }}>
              <span className="input-group-text bg-white border-end-0">
                <Search size={16} className="text-secondary" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Cari NIP, nama, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="btn-group btn-filter-group" role="group">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`btn btn-sm ${statusFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`btn btn-sm ${statusFilter === 'active' ? 'btn-success' : 'btn-outline-secondary'}`}
              >
                Aktif
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={`btn btn-sm ${statusFilter === 'inactive' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              >
                Non-Aktif
              </button>
            </div>
          </div>
        </div>

        {/* Table Data */}
        <div className="card rounded-4 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ minWidth: 600 }}>
              <thead className="table-light">
                <tr className="text-uppercase text-secondary" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  <th className="py-3 px-3">Pegawai</th>
                  <th className="py-3 px-3">Kontak</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center text-secondary py-5">
                      <div className="spinner-border spinner-border-sm text-warning mb-2" role="status"></div>
                      <div className="small">Memuat data pegawai...</div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-secondary py-5">
                      <AlertCircle size={24} className="text-secondary mb-2" />
                      <div className="small">Tidak ada data pegawai.</div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="table-row-hover">
                      <td className="py-3 px-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="avatar-circle"
                            style={{ backgroundColor: emp.is_active ? '#1f6f64' : '#9c9890' }}
                          >
                            {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark text-break small">{emp.name}</div>
                            <div className="text-secondary font-monospace" style={{ fontSize: '0.75rem' }}>{emp.employee_code}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="d-flex align-items-center gap-1 text-secondary text-nowrap" style={{ fontSize: '0.8rem' }}>
                          <Mail size={12} className="flex-shrink-0" />
                          <span>{emp.email}</span>
                        </div>

                        {emp.phone && (
                          <div className="d-flex align-items-center gap-1 text-secondary text-nowrap mt-1" style={{ fontSize: '0.8rem' }}>
                            <Phone size={12} className="flex-shrink-0" />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {emp.is_active ? (
                          <span className="badge rounded-pill bg-teal-soft d-inline-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: '0.7rem' }}>
                            <CheckCircle2 size={11} /> Aktif
                          </span>
                        ) : (
                          <span className="badge rounded-pill bg-light text-secondary border d-inline-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: '0.7rem' }}>
                            <XCircle size={11} /> Non-Aktif
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-end">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="btn btn-sm btn-outline-secondary border-0 p-1 me-1"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          className="btn btn-sm btn-outline-danger border-0 p-1"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RENDER MODAL VIA PORTAL DIRECTLY TO BODY */}
      {isModalOpen && ReactDOM.createPortal(
        <div className="modal-backdrop-custom" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-card-custom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Fixed */}
            <div className="d-flex align-items-center justify-content-between px-3 px-md-4 py-3 border-bottom flex-shrink-0" style={{ backgroundColor: '#faf9f6' }}>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                  style={{ width: 32, height: 32, backgroundColor: '#b8791f' }}
                >
                  {modalMode === 'add' ? <UserPlus size={15} color="#fff" /> : <Edit3 size={15} color="#fff" />}
                </div>
                <h2 className="h6 fw-bold mb-0 text-dark">
                  {modalMode === 'add' ? 'Tambah Pegawai Baru' : 'Edit Data Pegawai'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-sm btn-light border-0">
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Content Scrollable */}
            <form onSubmit={handleSubmit} className="d-flex flex-column flex-grow-1 overflow-hidden">
              <div className="modal-scroll-custom">
                <div className="row g-2 g-md-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold d-flex align-items-center gap-1 mb-1">
                      <IdCard size={13} className="text-secondary" /> Kode Pegawai *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.employee_code}
                      onChange={(e) => handleInputChange('employee_code', e.target.value)}
                      onFocus={handleFocusScroll}
                      className={`form-control form-control-sm ${errors.employee_code ? 'is-invalid' : ''}`}
                      style={{ fontFamily: 'monospace' }}
                    />
                    {errors.employee_code && <div className="invalid-feedback">{errors.employee_code[0]}</div>}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold d-flex align-items-center gap-1 mb-1">
                      <Users size={13} className="text-secondary" /> Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onFocus={handleFocusScroll}
                      className={`form-control form-control-sm ${errors.name ? 'is-invalid' : ''}`}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold d-flex align-items-center gap-1 mb-1">
                      <Mail size={13} className="text-secondary" /> Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onFocus={handleFocusScroll}
                      className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold d-flex align-items-center gap-1 mb-1">
                      <Phone size={13} className="text-secondary" /> No. HP
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onFocus={handleFocusScroll}
                      className={`form-control form-control-sm ${errors.phone ? 'is-invalid' : ''}`}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone[0]}</div>}
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold d-flex align-items-center gap-1 mb-1">
                      <KeyRound size={13} className="text-secondary" /> Password
                    </label>
                    <input
                      type="password"
                      required={modalMode === 'add'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onFocus={handleFocusScroll}
                      className={`form-control form-control-sm ${errors.password ? 'is-invalid' : ''}`}
                      placeholder={modalMode === 'edit' ? 'Kosongkan jika tak diubah' : '••••••••'}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}
                  </div>
                </div>

                <div className={`alert ${modalMode === 'add' ? 'alert-info border-info-subtle' : 'alert-secondary border'} small mt-3 mb-0`}>
                  {modalMode === 'add' ? (
                    <>Employee baru dibuat <strong>nonaktif</strong>. Aktivasi akun dilakukan setelah proses onboarding selesai melalui menu <strong>Employee Lifecycle</strong>.</>
                  ) : (
                    <>Status aktif employee dikelola melalui <strong>Employee Lifecycle</strong> dan tidak dapat diubah manual dari form edit.</>
                  )}
                </div>
              </div>

              {/* Modal Footer Fixed At Bottom */}
              <div className="d-flex justify-content-end gap-2 px-3 px-md-4 py-3 border-top bg-light flex-shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-sm btn-light flex-fill flex-sm-grow-0">
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="btn btn-sm btn-brand d-inline-flex align-items-center justify-content-center gap-2 flex-fill flex-sm-grow-0">
                  {submitting && <span className="spinner-border spinner-border-sm"></span>}
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* RENDER MODAL HAPUS VIA PORTAL */}
      {deleteTarget && ReactDOM.createPortal(
        <div className="modal-backdrop-custom" onClick={() => setDeleteTarget(null)}>
          <div
            className="modal-card-custom"
            style={{ maxWidth: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                style={{ width: 40, height: 40, backgroundColor: '#fbeaea' }}
              >
                <AlertCircle size={20} color="#dc3545" />
              </div>
              <h3 className="h6 fw-bold text-dark mb-2">Hapus pegawai ini?</h3>
              <p className="small text-secondary mb-0">
                <span className="fw-semibold text-dark">{deleteTarget.name}</span> ({deleteTarget.employee_code}) akan dihapus secara permanen.
              </p>
            </div>
            <div className="d-flex justify-content-end gap-2 px-3 py-3 border-top" style={{ backgroundColor: '#faf9f6' }}>
              <button onClick={() => setDeleteTarget(null)} className="btn btn-sm btn-light flex-fill flex-sm-grow-0">
                Batal
              </button>
              <button onClick={executeDelete} disabled={deleting} className="btn btn-sm btn-danger d-inline-flex align-items-center justify-content-center gap-2 flex-fill flex-sm-grow-0">
                {deleting && <span className="spinner-border spinner-border-sm"></span>}
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}