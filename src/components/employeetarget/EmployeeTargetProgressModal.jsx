import React, { useState, useEffect } from 'react';

const EmployeeTargetProgressModal = ({
  show,
  onClose,
  data,
  onSubmit,
  submitting
}) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (data) {
      setCurrentValue(data.current_value || 0);
    }
  }, [data]);

  if (!show || !data) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data.id, Number(currentValue));
  };

  const targetValue = Number(data.target_value) || 1;
  const current = Number(currentValue) || 0;

  const computedPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round((current / targetValue) * 100)
    )
  );

  return (
    <>
      {/* BACKDROP */}
      <div
        className="modal-backdrop fade show"
        style={{
          zIndex: 1050,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)'
        }}
      />

      {/* MODAL */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{
          zIndex: 1055
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md px-2 px-sm-0">
          <div
            className="modal-content border-0 shadow-lg overflow-hidden"
            style={{
              borderRadius: '18px'
            }}
          >

            {/* =====================================================
                HEADER
            ===================================================== */}
            <div
              className="modal-header border-0 px-4 py-3"
              style={{
                background:
                  'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)'
              }}
            >
              <div className="d-flex align-items-center gap-3 text-white">

                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: 'rgba(255,255,255,0.18)'
                  }}
                >
                  <i className="bi bi-pencil-square fs-5"></i>
                </div>

                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    Update Progress Target
                  </h5>

                  <small className="opacity-75">
                    Perbarui pencapaian kerja Anda saat ini
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                disabled={submitting}
                aria-label="Close"
              />
            </div>

            {/* =====================================================
                FORM
            ===================================================== */}
            <form onSubmit={handleSubmit}>

              <div className="modal-body p-4">

                {/* TARGET INFO */}
                <div
                  className="p-3 rounded-3 mb-4"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-2"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#EEF2FF',
                        color: '#4F46E5'
                      }}
                    >
                      <i className="bi bi-bullseye"></i>
                    </div>

                    <span className="small fw-semibold text-muted">
                      Target Kinerja
                    </span>
                  </div>

                  <h6 className="fw-bold text-dark mb-0">
                    {data.title || data.judul || '-'}
                  </h6>
                </div>

                {/* TARGET SUMMARY */}
                <div className="row g-3 mb-4">

                  <div className="col-6">
                    <div
                      className="p-3 rounded-3 text-center h-100"
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <small className="text-muted d-block mb-1">
                        Target
                      </small>

                      <div className="fw-bold fs-5 text-dark">
                        {data.target_value}
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className="p-3 rounded-3 text-center h-100"
                      style={{
                        backgroundColor: '#EEF2FF',
                        border: '1px solid #C7D2FE'
                      }}
                    >
                      <small className="text-muted d-block mb-1">
                        Progress Saat Ini
                      </small>

                      <div className="fw-bold fs-5 text-primary">
                        {current}
                      </div>
                    </div>
                  </div>

                </div>

                {/* INPUT */}
                <div className="mb-4">

                  <label className="form-label fw-semibold text-dark mb-2">
                    Current Value
                  </label>

                  <div className="input-group input-group-lg">

                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                      required
                      disabled={submitting}
                      style={{
                        borderRight: 'none',
                        boxShadow: 'none'
                      }}
                    />

                    <span
                      className="input-group-text bg-light text-muted fw-medium"
                    >
                      / {data.target_value}
                    </span>

                  </div>

                  <small className="text-muted d-block mt-2">
                    Masukkan angka pencapaian Anda saat ini.
                  </small>

                </div>

                {/* PROGRESS PREVIEW */}
                <div
                  className="p-3 rounded-3"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0'
                  }}
                >

                  <div className="d-flex justify-content-between align-items-center mb-2">

                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-graph-up text-primary"></i>

                      <span className="small fw-semibold text-dark">
                        Estimasi Progress
                      </span>
                    </div>

                    <span className="fw-bold text-primary">
                      {computedPercent}%
                    </span>

                  </div>

                  <div
                    className="progress rounded-pill"
                    style={{
                      height: '10px',
                      backgroundColor: '#E2E8F0'
                    }}
                  >
                    <div
                      className="progress-bar bg-primary rounded-pill"
                      role="progressbar"
                      style={{
                        width: `${computedPercent}%`,
                        transition: 'width 0.3s ease'
                      }}
                      aria-valuenow={computedPercent}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>

                  <div className="d-flex justify-content-between mt-2">
                    <small className="text-muted">
                      {current} tercapai
                    </small>

                    <small className="text-muted">
                      Target {data.target_value}
                    </small>
                  </div>

                </div>

              </div>

              {/* =====================================================
                  FOOTER
              ===================================================== */}
              <div
                className="modal-footer border-0 px-4 py-3"
                style={{
                  backgroundColor: '#F8FAFC'
                }}
              >

                <button
                  type="button"
                  className="btn btn-light rounded-3 px-4"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="btn btn-primary rounded-3 px-4 d-flex align-items-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>

                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>
                      <span>Simpan Progress</span>
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(EmployeeTargetProgressModal);