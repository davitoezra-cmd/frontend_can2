import React, { useState, useEffect } from 'react';
import {apiFetch} from '../api/apiFetch';
import {
  Users,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  UserCheck,
  UserX,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2
} from 'lucide-react';

export default function FinancePage() {
  const [finances, setFinances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedFinance, setSelectedFinance] = useState(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch User Finance Data
  const fetchFinances = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get('/admin/finances');
      if (response.data?.success) {
        setFinances(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setFinances(response.data);
      }
    } catch (err) {
      console.error('Error fetching finances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  // Handlers Modal Add/Edit
  const openAddModal = () => {
    setModalMode('add');
    setSelectedFinance(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      is_active: true
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setSelectedFinance(item);
    setFormData({
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || '',
      password: '',
      is_active: Boolean(item.is_active)
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    // Filter payload agar password kosong tidak terkirim saat edit
    const payload = { ...formData };
    if (modalMode === 'edit' && !payload.password) {
      delete payload.password;
    }

    try {
      if (modalMode === 'add') {
        await apiFetch.post('/admin/finances', payload);
      } else {
        await apiFetch.put(`/admin/finances/${selectedFinance.id}`, payload);
      }
      setIsModalOpen(false);
      fetchFinances();
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        alert(err.response?.data?.message || 'Terjadi kesalahan pada server');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch.delete(`/admin/finances/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchFinances();
    } catch (err) {
      alert('Gagal menghapus user finance');
    } finally {
      setDeleting(false);
    }
  };

  // Filter Search berdasarkan field User Finance
  const filteredFinances = finances.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      (item.name || '').toLowerCase().includes(keyword) ||
      (item.email || '').toLowerCase().includes(keyword) ||
      (item.phone || '').toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="finance-page min-vh-100 overflow-hidden" style={{ backgroundColor: '#f5f4f1' }}>
      <style>{`
        .finance-page .card { border: 1px solid #e6e2d8; }
        .finance-page .table-row-hover:hover { background-color: #faf9f6; }
        .finance-page .btn-brand {
          background-color: #1c1b19; border-color: #1c1b19; color: #fff;
        }
        .finance-page .btn-brand:hover { background-color: #333029; border-color: #333029; color: #fff; }
        .finance-page .text-brand-amber { color: #b8791f; }

        /* Modal Custom Styling - Slightly Elevated Center */
        .modal-backdrop-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          padding-bottom: 5vh; /* Geser posisi modal sedikit ke atas */
          z-index: 9999;
          overflow-y: auto;
        }
        .modal-scroll { max-height: 65vh; overflow-y: auto; }

        @media (max-width: 575.98px) {
          .finance-page-container {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
          .modal-backdrop-custom {
            padding: 0.75rem;
            padding-bottom: 3vh;
          }
        }
      `}</style>

      <div className="finance-page-container container-fluid py-3 py-md-4 px-3 px-md-5">

        {/* Header Responsive */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-2 gap-sm-3 w-100 w-sm-auto">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
              style={{ width: 42, height: 42, backgroundColor: '#b8791f' }}
            >
              <Users size={20} color="#fff" />
            </div>
            <div className="flex-grow-1 min-w-0">
              <div className="text-uppercase fw-semibold text-brand-amber mb-0" style={{ letterSpacing: '0.1em', fontSize: '0.65rem' }}>
                Manajemen Akses
              </div>
              <h1 className="h5 h3-md fw-bold mb-0 text-dark text-truncate">Finance Management</h1>
              <p className="text-secondary small mb-0 d-none d-sm-block" style={{ maxWidth: 480 }}>
                Kelola data akun dan hak akses tim Finance perusahaan.
              </p>
            </div>

            {/* Tombol Mobile */}
            <button 
              onClick={openAddModal} 
              className="btn btn-brand d-sm-none d-inline-flex align-items-center justify-content-center gap-1 px-2 py-2 shadow-sm flex-shrink-0"
              style={{ height: '38px' }}
            >
              <PlusCircle size={16} />
              <span className="small fw-semibold" style={{ fontSize: '0.8rem' }}>Tambah</span>
            </button>
          </div>

          {/* Tombol Tablet/Desktop */}
          <button 
            onClick={openAddModal} 
            className="btn btn-brand d-none d-sm-inline-flex align-items-center justify-content-center gap-2 px-3 px-md-4 py-2 shadow-sm"
          >
            <PlusCircle size={18} />
            <span>Tambah User Finance</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="card rounded-4 shadow-sm mb-3 mb-md-4">
          <div className="card-body p-3 p-md-4">
            <div className="input-group w-100" style={{ maxWidth: 380 }}>
              <span className="input-group-text bg-white border-end-0">
                <Search size={16} className="text-secondary" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Cari nama, email, no HP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Data */}
        <div className="card rounded-4 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ minWidth: 600 }}>
              <thead className="table-light">
                <tr className="text-uppercase text-secondary" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  <th className="py-3 px-3" style={{ width: '50px' }}>No</th>
                  <th className="py-3 px-3">Nama</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">No HP</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center text-secondary py-5">
                      <div className="spinner-border spinner-border-sm text-warning mb-2" role="status"></div>
                      <div className="small">Memuat data user finance...</div>
                    </td>
                  </tr>
                ) : filteredFinances.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-secondary py-5">
                      <UserX size={28} className="text-secondary mb-2" />
                      <div className="small">Tidak ada data user finance yang ditemukan.</div>
                    </td>
                  </tr>
                ) : (
                  filteredFinances.map((item, index) => (
                    <tr key={item.id} className="table-row-hover">
                      <td className="py-3 px-3 text-secondary small fw-semibold">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="fw-semibold text-dark text-break small">{item.name}</div>
                      </td>
                      <td className="py-3 px-3 text-secondary small text-break">
                        {item.email}
                      </td>
                      <td className="py-3 px-3 text-secondary small font-monospace">
                        {item.phone || '-'}
                      </td>
                      <td className="py-3 px-3">
                        {item.is_active ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-medium rounded-pill d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                            <UserCheck size={11} /> Active
                          </span>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fw-medium rounded-pill d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                            <UserX size={11} /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-end">
                        <button
                          onClick={() => openEditModal(item)}
                          className="btn btn-sm btn-outline-secondary border-0 p-1 me-1"
                          title="Edit User Finance"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="btn btn-sm btn-outline-danger border-0 p-1"
                          title="Hapus User Finance"
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setIsModalOpen(false)}>
          <div
            className="bg-white rounded-4 shadow-lg w-100 overflow-hidden"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="d-flex align-items-center justify-content-between px-3 px-md-4 py-3 border-bottom" style={{ backgroundColor: '#faf9f6' }}>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                  style={{ width: 32, height: 32, backgroundColor: '#b8791f' }}
                >
                  {modalMode === 'add' ? <PlusCircle size={15} color="#fff" /> : <Edit3 size={15} color="#fff" />}
                </div>
                <h2 className="h6 fw-bold mb-0 text-dark">
                  {modalMode === 'add' ? 'Tambah User Finance' : 'Edit User Finance'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-sm btn-light border-0">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="modal-scroll p-3 p-md-4">
              <div className="row g-3">
                {/* Nama */}
                <div className="col-12">
                  <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                    <User size={13} className="text-secondary" /> Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Masukkan nama lengkap"
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                </div>

                {/* Email */}
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                    <Mail size={13} className="text-secondary" /> Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="nama@email.com"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
                </div>

                {/* No HP */}
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                    <Phone size={13} className="text-secondary" /> No HP
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="08xxxxxxxxxx"
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone[0]}</div>}
                </div>

                {/* Password */}
                <div className="col-12">
                  <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                    <Lock size={13} className="text-secondary" /> Password {modalMode === 'add' ? '*' : '(Kosongkan jika tidak diubah)'}
                  </label>
                  <input
                    type="password"
                    required={modalMode === 'add'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder={modalMode === 'add' ? 'Minimal 6 karakter' : 'Isi untuk memperbarui password'}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}
                </div>

                {/* Status */}
                <div className="col-12">
                  <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                    <CheckCircle2 size={13} className="text-secondary" /> Status Akun
                  </label>
                  <select
                    value={formData.is_active ? '1' : '0'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === '1' })}
                    className={`form-select ${errors.is_active ? 'is-invalid' : ''}`}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                  {errors.is_active && <div className="invalid-feedback">{errors.is_active[0]}</div>}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="d-flex justify-content-end gap-2 pt-3 mt-3 border-top">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-light flex-fill flex-sm-grow-0">
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="btn btn-brand d-inline-flex align-items-center justify-content-center gap-2 flex-fill flex-sm-grow-0">
                  {submitting && <span className="spinner-border spinner-border-sm"></span>}
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div className="modal-backdrop-custom" onClick={() => setDeleteTarget(null)}>
          <div
            className="bg-white rounded-4 shadow-lg w-100 overflow-hidden"
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
              <h3 className="h6 fw-bold text-dark mb-2">Hapus User Finance?</h3>
              <p className="small text-secondary mb-0">
                Akun finance atas nama <span className="fw-semibold text-dark">{deleteTarget.name}</span> ({deleteTarget.email}) akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="d-flex justify-content-end gap-2 px-3 py-3 border-top" style={{ backgroundColor: '#faf9f6' }}>
              <button onClick={() => setDeleteTarget(null)} className="btn btn-light flex-fill flex-sm-grow-0">
                Batal
              </button>
              <button onClick={executeDelete} disabled={deleting} className="btn btn-danger d-inline-flex align-items-center justify-content-center gap-2 flex-fill flex-sm-grow-0">
                {deleting && <span className="spinner-border spinner-border-sm"></span>}
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}