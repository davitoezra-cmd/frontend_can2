import React, { useState, useEffect } from 'react';

const EmployeeTargetProgressModal = ({ isOpen, onClose, onSubmit, data }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (data) {
      setCurrentValue(data.current_value || 0);
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const targetValue = data.target_value || 1;
  const percent = Math.min(100, Math.round(((currentValue || 0) / targetValue) * 100));
  const isAchieved = currentValue >= targetValue;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data.id, Number(currentValue));
  };

  return (
    <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold">Update Progress Target</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body py-3">
              <div className="mb-3 bg-light p-3 rounded-3">
                <small className="text-muted d-block">Target:</small>
                <span className="fw-bold text-dark">{data.title}</span>
                <div className="small text-muted mt-1">
                  Pegawai: <strong>{data.employee?.name}</strong>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Current Value (Capaian Saat Ini)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-lg fw-bold text-primary"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  required
                />
                <div className="form-text">Target Maksimal: {targetValue}</div>
              </div>

              {/* Live Preview Progress */}
              <div className="border rounded-3 p-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted fw-semibold">Preview Persentase:</span>
                  <span className="fw-bold text-dark fs-5">{percent}%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className={`progress-bar ${percent <= 30 ? 'bg-danger' : percent <= 70 ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                {isAchieved && (
                  <div className="alert alert-success py-2 px-3 mb-0 mt-3 small d-flex align-items-center gap-2">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Status otomatis akan diperbarui menjadi <strong>Achieved</strong>.</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer border-top-0">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary px-4">
                Simpan Progress
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EmployeeTargetProgressModal);