import React, { useState } from "react";

const PayrollGenerateModal = ({
  isOpen,
  onClose,
  onGenerate,
  loading,
}) => {
  const currentYear = new Date().getFullYear();

  const [tahun, setTahun] = useState(currentYear);
  const [bulan, setBulan] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const yearNumber = Number(tahun);

    // Validasi tahun
    if (!yearNumber || yearNumber < 1900 || yearNumber > 2100) {
      alert("Tahun harus berada antara 1900 sampai 2100.");
      return;
    }

    if (!bulan) {
      alert("Silakan pilih bulan terlebih dahulu.");
      return;
    }

    onGenerate({
      bulan,
      tahun: yearNumber,
    });
  };

  const handleClose = () => {
    if (loading) return;

    setBulan("");
    setTahun(currentYear);
    onClose();
  };

  return (
    <>
      {/* =====================================================
          BACKDROP
      ===================================================== */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          zIndex: 1050,
        }}
        onClick={loading ? undefined : handleClose}
      />

      {/* =====================================================
          MODAL WRAPPER
      ===================================================== */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          zIndex: 1055,
          padding: "12px",
          pointerEvents: "none",
          overflowY: "auto",
        }}
      >
        {/* =====================================================
            MODAL
        ===================================================== */}
        <div
          className="bg-white shadow-lg d-flex flex-column payroll-generate-modal"
          style={{
            width: "100%",
            maxWidth: "460px",
            maxHeight: "calc(100vh - 24px)",
            borderRadius: "16px",
            overflow: "hidden",
            pointerEvents: "auto",
            boxShadow: "0 10px 40px rgba(0,0,0,0.18)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* =================================================
              HEADER
          ================================================= */}
          <div
            className="d-flex align-items-center justify-content-between flex-shrink-0"
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid #e9ecef",
            }}
          >
            <div>
              <h5
                className="fw-bold mb-1"
                style={{
                  fontSize: "18px",
                  color: "#212529",
                }}
              >
                Generate Payroll
              </h5>

              <small className="text-muted">
                Generate payroll berdasarkan periode
              </small>
            </div>

            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
            />
          </div>

          {/* =================================================
              FORM
          ================================================= */}
          <form
            onSubmit={handleSubmit}
            className="d-flex flex-column"
            style={{
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {/* =================================================
                BODY
            ================================================= */}
            <div
              style={{
                padding: "20px",
                overflowY: "auto",
                minHeight: 0,
              }}
            >
              {/* =================================================
                  PERIODE
              ================================================= */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "14px",
                }}
              >
                {/* =================================================
                    BULAN
                ================================================= */}
                <div className="mb-3">
                  <label
                    className="form-label fw-semibold mb-2"
                    htmlFor="payroll-bulan"
                  >
                    Bulan
                  </label>

                  <select
                    id="payroll-bulan"
                    name="bulan"
                    className="form-select"
                    value={bulan}
                    onChange={(e) =>
                      setBulan(e.target.value)
                    }
                    style={{
                      height: "44px",
                      borderRadius: "10px",
                    }}
                    required
                    disabled={loading}
                  >
                    <option value="">
                      Pilih bulan
                    </option>

                    <option value="1">Januari</option>
                    <option value="2">Februari</option>
                    <option value="3">Maret</option>
                    <option value="4">April</option>
                    <option value="5">Mei</option>
                    <option value="6">Juni</option>
                    <option value="7">Juli</option>
                    <option value="8">Agustus</option>
                    <option value="9">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>
                </div>

                {/* =================================================
                    TAHUN
                ================================================= */}
                <div className="mb-3">
                  <label
                    className="form-label fw-semibold mb-2"
                    htmlFor="payroll-tahun"
                  >
                    Tahun
                  </label>

                  <input
                    id="payroll-tahun"
                    name="tahun"
                    type="number"
                    className="form-control"
                    value={tahun}
                    onChange={(e) =>
                      setTahun(e.target.value)
                    }
                    min="1900"
                    max="2100"
                    step="1"
                    inputMode="numeric"
                    placeholder="Contoh: 2026"
                    style={{
                      height: "44px",
                      borderRadius: "10px",
                    }}
                    required
                    disabled={loading}
                  />

                  <small
                    className="text-muted d-block mt-1"
                    style={{
                      fontSize: "10px",
                    }}
                  >
                    Masukkan tahun sesuai periode payroll.
                  </small>
                </div>
              </div>

              {/* =================================================
                  PREVIEW PERIODE
              ================================================= */}
              {bulan && tahun && (
                <div
                  style={{
                    marginTop: "4px",
                    marginBottom: "14px",
                    padding: "13px 14px",
                    backgroundColor: "#f8f9ff",
                    border: "1px solid #e3e1ff",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#7c8191",
                      fontWeight: 600,
                      marginBottom: "3px",
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Periode Payroll
                  </div>

                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#4f46c8",
                    }}
                  >
                    {[
                      "Januari",
                      "Februari",
                      "Maret",
                      "April",
                      "Mei",
                      "Juni",
                      "Juli",
                      "Agustus",
                      "September",
                      "Oktober",
                      "November",
                      "Desember",
                    ][Number(bulan) - 1]}{" "}
                    {tahun}
                  </div>
                </div>
              )}

              {/* =================================================
                  INFO
              ================================================= */}
              <div
                className="d-flex align-items-start gap-2"
                style={{
                  padding: "12px 14px",
                  backgroundColor: "#eef6ff",
                  border: "1px solid #cfe2ff",
                  borderRadius: "10px",
                  color: "#0d6efd",
                }}
              >
                <i
                  className="bi bi-info-circle-fill"
                  style={{
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                />

                <div
                  className="small"
                  style={{
                    lineHeight: "1.5",
                  }}
                >
                  Payroll akan dibuat berdasarkan bulan dan
                  tahun yang dipilih. Tahun dapat diisi secara
                  bebas sesuai periode payroll.
                </div>
              </div>

              {/* =================================================
                  WARNING
              ================================================= */}
              <div
                className="d-flex align-items-start gap-2"
                style={{
                  marginTop: "12px",
                  padding: "11px 14px",
                  backgroundColor: "#fff8e8",
                  border: "1px solid #ffe3a3",
                  borderRadius: "10px",
                  color: "#946200",
                }}
              >
                <i
                  className="bi bi-exclamation-triangle-fill"
                  style={{
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                />

                <div
                  className="small"
                  style={{
                    lineHeight: "1.5",
                  }}
                >
                  Pastikan periode yang dipilih belum memiliki
                  payroll yang sudah dibuat agar tidak terjadi
                  duplikasi data.
                </div>
              </div>
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}
            <div
              className="d-flex justify-content-end gap-2 flex-shrink-0"
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #e9ecef",
                backgroundColor: "#f8f9fa",
              }}
            >
              {/* BATAL */}
              <button
                type="button"
                className="btn btn-light border"
                style={{
                  minWidth: "90px",
                  height: "40px",
                  borderRadius: "9px",
                }}
                onClick={handleClose}
                disabled={loading}
              >
                Batal
              </button>

              {/* GENERATE */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  minWidth: "160px",
                  height: "40px",
                  borderRadius: "9px",
                }}
                disabled={
                  loading ||
                  !bulan ||
                  !tahun
                }
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />

                    Generating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-calculator me-2" />

                    Generate Payroll
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* =====================================================
          RESPONSIVE STYLE
      ===================================================== */}
      <style>
        {`
          .payroll-generate-modal {
            animation: payrollModalIn 0.18s ease-out;
          }

          @keyframes payrollModalIn {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.98);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          #payroll-tahun::-webkit-inner-spin-button,
          #payroll-tahun::-webkit-outer-spin-button {
            opacity: 1;
          }

          @media (max-width: 576px) {
            .payroll-generate-modal {
              max-width: 100% !important;
              border-radius: 14px !important;
            }

            .payroll-generate-modal > div:first-child {
              padding: 15px 16px !important;
            }

            .payroll-generate-modal form > div:first-child {
              padding: 16px !important;
            }

            .payroll-generate-modal form > div:first-child > div:first-child {
              grid-template-columns: 1fr !important;
              gap: 0 !important;
            }

            .payroll-generate-modal form > div:last-child {
              padding: 12px 16px !important;
            }

            .payroll-generate-modal form > div:last-child button {
              flex: 1;
              min-width: 0 !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default PayrollGenerateModal;

