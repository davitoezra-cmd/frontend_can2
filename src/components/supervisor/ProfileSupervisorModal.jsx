import React, { useState, useEffect } from 'react';

const ProfileSupervisorModal = ({ show, onClose, supervisor, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: ''
  });

  useEffect(() => {
    if (supervisor) {
      setFormData({
        name: supervisor.name || '',
        email: supervisor.email || '',
        phone: supervisor.phone || '',
        photo: supervisor.photo || ''
      });
    }
  }, [supervisor]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal show d-block tab-index='-1'" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow rounded-3">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">Edit Profile Supervisor</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nomor HP</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-light" onClick={onClose}>Batal</button>
              <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSupervisorModal;