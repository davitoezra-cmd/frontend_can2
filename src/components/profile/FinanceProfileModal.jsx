import React, { useState, useEffect } from 'react';

const FinanceProfileModal = ({ isOpen, onClose, profile, onUpdate, loading }) => {
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    if (profile) {
      setFormData({ name: profile.name || '', email: profile.email || '' });
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div 
      className="modal fade show d-block p-2 p-sm-0" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      {/* modal-dialog-centered & p-0 di mobile agar pas di layar */}
      <div className="modal-dialog modal-dialog-centered my-auto">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          
          {/* Header Modal */}
          <div className="modal-header border-0 pb-0 pt-3 pt-sm-4 px-3 px-sm-4 align-items-start">
            <div className="d-flex align-items-center gap-2 gap-sm-3 pe-2">
              {/* Avatar Inisial */}
              <div 
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                style={{ width: '38px', height: '38px', fontSize: '14px', flexShrink: 0 }}
              >
                FI
              </div>
              <div className="lh-sm">
                <h5 className="modal-title fw-bold text-dark m-0 fs-6 fs-sm-5">Edit Profile Finance</h5>
                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Perbarui informasi akun finance Anda</small>
              </div>
            </div>
            
            <button 
              type="button" 
              className="btn-close shadow-none p-2" 
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-3 p-sm-4">
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark fs-7 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control bg-light border-0 shadow-none rounded-3 py-2 px-3 custom-input"
                  placeholder="Masukkan nama lengkap..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-1">
                <label className="form-label fw-semibold text-dark fs-7 mb-1">Email Address</label>
                <input
                  type="email"
                  className="form-control bg-light border-0 shadow-none rounded-3 py-2 px-3 custom-input"
                  placeholder="nama@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Footer Modal (Responsive Buttons) */}
            <div className="modal-footer border-0 pt-0 pb-3 pb-sm-4 px-3 px-sm-4 d-flex flex-column-reverse flex-sm-row gap-2">
              <button 
                type="button" 
                className="btn btn-light rounded-3 px-3 py-2 fs-7 fw-medium text-secondary border-0 w-100 w-sm-auto" 
                onClick={onClose}
                disabled={loading}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="btn btn-primary rounded-3 px-4 py-2 fs-7 fw-semibold d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto m-0" 
                disabled={loading}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                )}
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Style khusus mobile input & breakpoint */}
      <style>{`
        .custom-input {
          font-size: 14px;
        }
        @media (max-width: 575.98px) {
          .custom-input {
            font-size: 16px !important; /* Mencegah auto-zoom di browser HP */
          }
          .w-sm-auto {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FinanceProfileModal;