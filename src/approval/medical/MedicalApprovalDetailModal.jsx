import React, { useEffect, useState } from 'react';
import {apiFetch} from '../../api/apiFetch';
import LoadingSpinner from '../../components/LoadingSpinner';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';

const MedicalApprovalDetailModal = ({
  id,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // =========================================================
  // BASE URL BACKEND
  // =========================================================

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'http://192.168.100.9:8000/api';

  const BACKEND_URL = API_BASE_URL
    .replace(/\/api\/?$/, '')
    .replace(/\/+$/, '');

  // =========================================================
  // URL DOKUMEN
  // =========================================================

  const getDocumentUrl = (path) => {
    if (!path) return null;

    // Kalau sudah URL lengkap
    if (
      path.startsWith('http://') ||
      path.startsWith('https://')
    ) {
      return path;
    }

    // Hilangkan slash depan
    const cleanPath = String(path).replace(/^\/+/, '');

    // Kalau database menyimpan "storage/..."
    if (cleanPath.startsWith('storage/')) {
      return `${BACKEND_URL}/${cleanPath}`;
    }

    // Kalau database menyimpan "doctor-notes/..."
    return `${BACKEND_URL}/storage/${cleanPath}`;
  };

  // =========================================================
  // FETCH DETAIL
  // =========================================================

  useEffect(() => {
    if (isOpen && id) {
      fetchDetail();
    } else {
      setDetail(null);
    }
  }, [isOpen, id]);

  const fetchDetail = async () => {
    setLoading(true);

    try {
      const response = await apiFetch.get(
        `/admin/medical-leave/${id}`
      );

      if (response.data?.success) {
        setDetail(response.data.data);
      }
    } catch (error) {
      console.error(
        'Gagal mengambil detail medical leave:',
        error
      );

      toast.error(
        'Gagal mengambil detail data.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // APPROVE
  // =========================================================

  const handleApprove = () => {
    Swal.fire({
      title: 'Konfirmasi Approval',
      input: 'textarea',
      inputLabel: 'Catatan Approval',
      inputPlaceholder: 'Tulis catatan untuk employee...',
      inputValue: 'Pengajuan sakit disetujui.',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Approve',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-4',
      },
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      setProcessing(true);

      try {
        const response = await apiFetch.put(
          `/admin/medical-leave/${id}/approve`,
          {
            approval_note: result.value || 'Pengajuan sakit disetujui.',
          }
        );

        if (response.data?.success) {
          toast.success(
            response.data.message ||
            'Pengajuan sakit berhasil disetujui.'
          );

          onSuccess?.();
          onClose?.();
        }
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
          'Gagal memproses approval.'
        );
      } finally {
        setProcessing(false);
      }
    });
  };

  // =========================================================
  // REJECT
  // =========================================================

  const handleReject = () => {

    Swal.fire({
      title: 'Penolakan Pengajuan Sakit',
      input: 'textarea',
      inputLabel: 'Masukkan alasan penolakan',
      inputPlaceholder:
        'Tulis alasan penolakan di sini...',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Tolak Pengajuan',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-4'
      },

      inputValidator: (value) => {

        if (!value) {
          return 'Alasan penolakan wajib diisi!';
        }

        return null;
      }

    }).then(async (result) => {

      if (result.isConfirmed) {

        setProcessing(true);

        try {

          const response =
            await apiFetch.put(
              `/admin/medical-leave/${id}/reject`,
              {
                approval_note:
                  result.value
              }
            );

          if (response.data?.success) {

            toast.success(
              response.data.message ||
              'Pengajuan sakit berhasil ditolak.'
            );

            onSuccess?.();
            onClose?.();
          }

        } catch (error) {

          toast.error(
            error.response?.data?.message ||
            'Gagal memproses penolakan.'
          );

        } finally {
          setProcessing(false);
        }
      }
    });
  };

  // =========================================================
  // MODAL TIDAK DIBUKA
  // =========================================================

  if (!isOpen) return null;

  // =========================================================
  // DOCUMENT URL
  // =========================================================

  const documentUrl = detail?.doctor_note
    ? getDocumentUrl(detail.doctor_note)
    : null;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          BACKDROP
      ===================================================== */}

      <div
        className="modal-backdrop fade show"
        style={{
          zIndex: 1040
        }}
      />

      {/* =====================================================
          MODAL
      ===================================================== */}

      <div
        className="modal d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor:
            'rgba(0,0,0,0.55)',
          zIndex: 1050
        }}
      >

        <div
          className="modal-dialog modal-dialog-centered modal-xl"
          style={{
            width: 'calc(100% - 30px)',
            maxWidth: '1100px',
            margin: '15px auto'
          }}
        >

          <div
            className="modal-content border-0 shadow rounded-4 overflow-hidden"
            style={{
              maxHeight: 'calc(100vh - 30px)'
            }}
          >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="modal-header border-bottom p-3 px-4"
            >

              <div>

                <h5 className="modal-title fw-bold mb-1">
                  Detail Pengajuan Sakit
                </h5>

                <small className="text-muted">
                  Informasi pengajuan dan surat dokter
                </small>

              </div>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={processing}
              />

            </div>

            {/* =================================================
                BODY
            ================================================= */}

            <div
              className="modal-body p-4"
              style={{
                overflowY: 'auto'
              }}
            >

              {loading ? (

                <div className="py-5 text-center">
                  <LoadingSpinner />
                </div>

              ) : detail ? (

                <div className="row g-4">

                  {/* ===========================================
                      INFORMASI PENGAJUAN
                  =========================================== */}

                  <div className="col-12 col-lg-6">

                    <div
                      className="border rounded-4 p-4 h-100"
                      style={{
                        backgroundColor: '#f8fafc'
                      }}
                    >

                      <h6 className="fw-bold mb-4">
                        <i className="bi bi-file-medical me-2 text-primary"></i>
                        Informasi Pengajuan
                      </h6>

                      {/* EMPLOYEE */}

                      <div className="mb-3">

                        <label className="text-muted small d-block mb-1">
                          Nama Employee
                        </label>

                        <div className="fw-semibold">
                          {detail.employee?.name || '-'}
                        </div>

                      </div>

                      {/* STATUS */}

                      <div className="mb-3">

                        <label className="text-muted small d-block mb-1">
                          Status
                        </label>

                        <span className="badge bg-secondary text-capitalize">
                          {detail.status || '-'}
                        </span>

                      </div>

                      {/* CREATED */}

                      <div className="mb-3">

                        <label className="text-muted small d-block mb-1">
                          Tanggal Pengajuan
                        </label>

                        <div className="fw-semibold">

                          {detail.created_at
                            ? new Date(
                                detail.created_at
                              ).toLocaleString(
                                'id-ID'
                              )
                            : '-'}

                        </div>

                      </div>

                      {/* ALASAN */}

                      <div className="mb-3">

                        <label className="text-muted small d-block mb-1">
                          Alasan / Diagnosa
                        </label>

                        <div
                          className="fw-semibold"
                          style={{
                            whiteSpace:
                              'pre-wrap'
                          }}
                        >
                          {detail.reason ||
                            detail.description ||
                            '-'}
                        </div>

                      </div>



                      {/* APPROVED AT */}

                      {detail.approved_at && (

                        <div className="mt-3">

                          <label className="text-muted small d-block mb-1">
                            Approved / Rejected At
                          </label>

                          <div className="fw-semibold">

                            {new Date(
                              detail.approved_at
                            ).toLocaleString(
                              'id-ID'
                            )}

                          </div>

                        </div>

                      )}

                    </div>

                  </div>

                  {/* ===========================================
                      SURAT DOKTER
                  =========================================== */}

                  <div className="col-12 col-lg-6">

                    <div
                      className="border rounded-4 p-4 h-100"
                      style={{
                        backgroundColor: '#f8fafc'
                      }}
                    >

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-file-earmark-medical me-2 text-danger"></i>

                        Surat Dokter

                      </h6>

                      {documentUrl ? (

                        <div>

                          {/* PREVIEW FOTO */}

                          <div
                            className="border rounded-4 overflow-hidden d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor:
                                '#ffffff',
                              minHeight: '300px',
                              maxHeight: '500px',
                              padding: '10px'
                            }}
                          >

                            <img
                              src={documentUrl}
                              alt="Surat Dokter"
                              className="img-fluid"
                              style={{
                                display: 'block',
                                maxWidth: '100%',
                                maxHeight: '470px',
                                width: 'auto',
                                height: 'auto',
                                objectFit:
                                  'contain'
                              }}
                              onLoad={() => {
                                console.log(
                                  'Foto surat dokter berhasil:',
                                  documentUrl
                                );
                              }}
                              onError={(e) => {

                                console.error(
                                  'Foto surat dokter gagal:',
                                  documentUrl
                                );

                                e.currentTarget.style.display =
                                  'none';

                                const errorElement =
                                  e.currentTarget
                                    .parentElement
                                    ?.querySelector(
                                      '.doctor-note-error'
                                    );

                                if (errorElement) {
                                  errorElement.style.display =
                                    'block';
                                }
                              }}
                            />

                            {/* ERROR */}

                            <div
                              className="doctor-note-error text-center text-muted"
                              style={{
                                display: 'none'
                              }}
                            >

                              <i
                                className="bi bi-image"
                                style={{
                                  fontSize:
                                    '40px'
                                }}
                              ></i>

                              <p className="mt-2 mb-0">
                                Foto surat dokter
                                tidak dapat
                                ditampilkan.
                              </p>

                              <small>
                                URL:
                                <br />
                                {documentUrl}
                              </small>

                            </div>

                          </div>

                        </div>

                      ) : (

                        <div
                          className="border rounded-4 d-flex flex-column align-items-center justify-content-center text-muted"
                          style={{
                            minHeight: '300px',
                            backgroundColor:
                              '#ffffff'
                          }}
                        >

                          <i
                            className="bi bi-file-earmark-x"
                            style={{
                              fontSize: '45px'
                            }}
                          ></i>

                          <p className="mt-3 mb-0">
                            Tidak ada surat dokter
                            yang dilampirkan.
                          </p>

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              ) : (

                <p className="text-center text-muted my-3">
                  Data tidak ditemukan.
                </p>

              )}

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div
              className="modal-footer border-top p-3 px-4"
            >

              {detail &&
              detail.status === 'pending' ? (

                <>

                  <button
                    className="btn btn-danger rounded-3 d-inline-flex align-items-center gap-2"
                    onClick={handleReject}
                    disabled={processing}
                  >
                    <FaTimes />
                    Reject
                  </button>

                  <button
                    className="btn btn-success rounded-3 d-inline-flex align-items-center gap-2"
                    onClick={handleApprove}
                    disabled={processing}
                  >
                    <FaCheck />
                    Approve
                  </button>

                </>

              ) : (

                <>

                  <button
                    className="btn btn-success rounded-3"
                    disabled
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-danger rounded-3"
                    disabled
                  >
                    Reject
                  </button>

                </>

              )}

              <button
                className="btn btn-light rounded-3"
                onClick={onClose}
                disabled={processing}
              >
                Tutup
              </button>

            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default MedicalApprovalDetailModal;
