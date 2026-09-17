import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { apiFetch } from '../api/apiFetch';
import LoadingSpinner from '../components/LoadingSpinner';
import Swal from 'sweetalert2';

// =====================================================
// ACTION DROPDOWN
// =====================================================

const ActionDropdown = ({
  item,
  onPreview,
  onDownload,
  onRegenerate,
  onToggleActive,
  onSetExpired,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
  });

  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const toggleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuWidth = 180;

      const calculatedLeft = Math.max(
        10,
        Math.min(
          rect.right + window.scrollX - menuWidth,
          window.innerWidth - menuWidth - 10
        )
      );

      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: calculatedLeft,
      });
    }

    setOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    const handleScroll = () => setOpen(false);

    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );

      window.removeEventListener(
        'scroll',
        handleScroll,
        true
      );
    };
  }, []);

  const closeAndRun = (fn) => {
    setOpen(false);
    fn();
  };

  return (
    <div className="dropdown-custom">
      <button
        ref={btnRef}
        type="button"
        className="btn btn-light btn-sm rounded-circle"
        onClick={toggleOpen}
        aria-label="Menu aksi"
      >
        <i className="bi bi-three-dots-vertical"></i>
      </button>

      {open &&
        createPortal(
          <ul
            ref={menuRef}
            className="dropdown-menu-custom dropdown-menu-end rounded-3 shadow-sm border-0 show"
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
              zIndex: 9999,
              minWidth: '180px',
              backgroundColor: '#ffffff',
              padding: '0.5rem 0',
            }}
          >
            <li>
              <button
                type="button"
                className="dropdown-item small"
                onClick={() =>
                  closeAndRun(() => onPreview(item.id))
                }
              >
                <i className="bi bi-eye me-2"></i>
                Preview
              </button>
            </li>

            <li>
              <button
                type="button"
                className="dropdown-item small"
                onClick={() =>
                  closeAndRun(() => onDownload(item.id))
                }
              >
                <i className="bi bi-download me-2"></i>
                Download
              </button>
            </li>

            <li>
              <button
                type="button"
                className="dropdown-item small"
                onClick={() =>
                  closeAndRun(() => onRegenerate(item.id))
                }
              >
                <i className="bi bi-arrow-repeat me-2"></i>
                Regenerate
              </button>
            </li>

            <li>
              <button
                type="button"
                className="dropdown-item small"
                onClick={() =>
                  closeAndRun(() =>
                    onToggleActive(
                      item.id,
                      item.is_active
                    )
                  )
                }
              >
                <i
                  className={`bi bi-${
                    item.is_active
                      ? 'pause'
                      : 'play'
                  }-circle me-2`}
                ></i>

                {item.is_active
                  ? 'Deactivate'
                  : 'Activate'}
              </button>
            </li>

            <li>
              <button
                type="button"
                className="dropdown-item small"
                onClick={() =>
                  closeAndRun(() =>
                    onSetExpired(item.id)
                  )
                }
              >
                <i className="bi bi-clock me-2"></i>
                Set Expired
              </button>
            </li>

            <li>
              <hr className="dropdown-divider" />
            </li>

            <li>
              <button
                type="button"
                className="dropdown-item small text-danger"
                onClick={() =>
                  closeAndRun(() =>
                    onDelete(item.id)
                  )
                }
              >
                <i className="bi bi-trash me-2"></i>
                Hapus
              </button>
            </li>
          </ul>,
          document.body
        )}
    </div>
  );
};

// =====================================================
// MAIN PAGE
// =====================================================

const AttendanceQrPage = () => {
  const [qrs, setQrs] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
  });

  const [loading, setLoading] = useState(true);

  // =====================================================
  // MODAL STATES
  // =====================================================

  const [generateName, setGenerateName] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [expiredDateTime, setExpiredDateTime] =
    useState('');

  // =====================================================
  // FETCH ALL DATA
  // =====================================================

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);

    try {
      const [resList, resStats] = await Promise.all([
        apiFetch.get('/admin/attendance-qr'),
        apiFetch.get('/admin/attendance-qr/statistics'),
      ]);

      setQrs(
        resList.data?.data?.data ||
          resList.data?.data ||
          resList.data ||
          []
      );

      setStats(
        resStats.data?.data ||
          resStats.data || {
            total: 0,
            active: 0,
            inactive: 0,
            expired: 0,
          }
      );
    } catch (err) {
      console.error(
        'Gagal memuat data QR:',
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GENERATE
  // =====================================================

  const handleGenerate = async (e) => {
    e.preventDefault();

    try {
      await apiFetch.post(
        '/admin/attendance-qr/generate',
        {
          name: generateName,
        }
      );

      setGenerateName('');

      const modalElement =
        document.getElementById(
          'generateModal'
        );

      if (
        modalElement &&
        window.bootstrap
      ) {
        const modal =
          window.bootstrap.Modal.getInstance(
            modalElement
          );

        modal?.hide();
      }

      await fetchAllData();
    } catch (err) {
      console.error(
        'Generate QR gagal:',
        err
      );
    }
  };

  // =====================================================
  // DOWNLOAD
  // =====================================================

  const handleDownload = async (id) => {
    try {
        const response =
            await apiFetch.get(
                `/admin/attendance-qr/${id}/download`,
                {
                    responseType: 'blob',
                }
            );

        if (!(response.data instanceof Blob)) {
            throw new Error(
                'Response download QR bukan Blob.'
            );
        }

        if (response.data.size === 0) {
            throw new Error(
                'File QR Code kosong.'
            );
        }

        const blob =
            response.data;

        const url =
            window.URL.createObjectURL(
                blob
            );

        const link =
            document.createElement('a');

        link.href = url;
        link.download =
            `QR-${id}.png`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {
            window.URL.revokeObjectURL(
                url
            );
        }, 1000);

    } catch (error) {
        console.error(
            'Download QR gagal:',
            error
        );

        Swal.fire({
            icon: 'error',
            title: 'Download gagal',
            text:
                error?.message ||
                'QR Code tidak dapat didownload.',
            customClass: {
                popup: 'rounded-4',
            },
        });
    }
};

  // =====================================================
  // REGENERATE
  // =====================================================

  const handleRegenerate = async (id) => {
    const res =
      await Swal.fire({
        title: 'Regenerate QR Code?',
        text:
          'QR Code baru akan dibuat dan QR Code lama akan dinonaktifkan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText:
          'Ya, Regenerate',
        cancelButtonText: 'Batal',
        customClass: {
          popup: 'rounded-4',
        },
      });

    if (!res.isConfirmed) {
      return;
    }

    try {
      await apiFetch.put(
        `/admin/attendance-qr/${id}/regenerate`
      );

      await fetchAllData();
    } catch (err) {
      console.error(
        'Regenerate QR gagal:',
        err
      );
    }
  };

  // =====================================================
  // TOGGLE ACTIVE
  // =====================================================

  const handleToggleActive = async (
    id,
    isActive
  ) => {
    const endpoint = isActive
      ? `/admin/attendance-qr/${id}/deactivate`
      : `/admin/attendance-qr/${id}/activate`;

    try {
      await apiFetch.put(endpoint);

      await fetchAllData();
    } catch (err) {
      console.error(
        'Update status QR gagal:',
        err
      );
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const res =
      await Swal.fire({
        title: 'Hapus QR Code?',
        text:
          'Data yang dihapus tidak dapat dikembalikan!',
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText:
          'Ya, Hapus',
        cancelButtonText: 'Batal',
        customClass: {
          popup: 'rounded-4',
        },
      });

    if (!res.isConfirmed) {
      return;
    }

    try {
      await apiFetch.delete(
        `/admin/attendance-qr/${id}`
      );

      await fetchAllData();
    } catch (err) {
      console.error(
        'Hapus QR gagal:',
        err
      );
    }
  };

  // =====================================================
  // PREVIEW QR CODE
  // =====================================================

  const handleShowPreview = async (id) => {
    try {
        setPreviewImage(null);

        const modalElement =
            document.getElementById(
                'previewModal'
            );

        if (
            modalElement &&
            window.bootstrap
        ) {
            const modal =
                window.bootstrap.Modal.getOrCreateInstance(
                    modalElement
                );

            modal.show();
        }

        const response =
            await apiFetch.get(
                `/admin/attendance-qr/${id}/image`,
                {
                    responseType: 'blob',
                }
            );

        if (!(response.data instanceof Blob)) {
            throw new Error(
                'Response gambar QR bukan Blob.'
            );
        }

        if (response.data.size === 0) {
            throw new Error(
                'File gambar QR kosong.'
            );
        }

        const imageUrl =
            window.URL.createObjectURL(
                response.data
            );

        setPreviewImage(imageUrl);

    } catch (err) {
        console.error(
            'Preview QR gagal:',
            err
        );

        setPreviewImage(null);

        Swal.fire({
            icon: 'error',
            title: 'Preview QR gagal',
            text:
                err?.message ||
                'Gambar QR Code tidak dapat dimuat.',
            customClass: {
                popup: 'rounded-4',
            },
        });
    }
};

  // =====================================================
  // OPEN EXPIRED MODAL
  // =====================================================

  const handleOpenExpiredModal = (
    id
  ) => {
    setSelectedId(id);
    setExpiredDateTime('');

    const modalElement =
      document.getElementById(
        'expiredModal'
      );

    if (
      modalElement &&
      window.bootstrap
    ) {
      const modal =
        window.bootstrap.Modal.getOrCreateInstance(
          modalElement
        );

      modal.show();
    }
  };

  // =====================================================
  // SET EXPIRED
  // =====================================================

  const handleSetExpired = async (
    e
  ) => {
    e.preventDefault();

    if (!selectedId) {
      return;
    }

    try {
      await apiFetch.put(
        `/admin/attendance-qr/${selectedId}/expired`,
        {
          expired_at:
            expiredDateTime,
        }
      );

      const modalElement =
        document.getElementById(
          'expiredModal'
        );

      if (
        modalElement &&
        window.bootstrap
      ) {
        const modal =
          window.bootstrap.Modal.getInstance(
            modalElement
          );

        modal?.hide();
      }

      setSelectedId(null);
      setExpiredDateTime('');

      await fetchAllData();
    } catch (err) {
      console.error(
        'Update expired QR gagal:',
        err
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <LoadingSpinner />;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <style>
        {`
          /* =================================================
             MODAL QR
          ================================================= */

          .qr-modal-dialog {
            width: calc(100% - 32px) !important;
            max-width: 430px !important;
            margin: 1.75rem auto !important;
          }

          .qr-modal-dialog.preview-dialog {
            max-width: 450px !important;
          }

          .qr-modal-content {
            width: 100% !important;
            background: #ffffff !important;
            border: 1px solid rgba(0, 0, 0, 0.08) !important;
            border-radius: 16px !important;
            box-shadow: 0 15px 45px rgba(0, 0, 0, 0.18) !important;
            overflow: hidden !important;
          }

          .qr-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 18px !important;
            background: #ffffff !important;
            border-bottom: 1px solid #eeeeee !important;
          }

          .qr-modal-header .modal-title {
            margin: 0;
          }

          .qr-modal-body {
            padding: 18px !important;
            background: #ffffff !important;
          }

          .qr-modal-footer {
            display: flex;
            padding: 0 18px 18px !important;
            background: #ffffff !important;
            border-top: 0 !important;
          }

          .qr-modal-footer .btn {
            min-height: 42px;
          }

          .qr-modal-content form {
            margin: 0;
            padding: 0;
            background: #ffffff;
          }

          .qr-form-control {
            min-height: 42px;
            border-radius: 9px !important;
          }

          .qr-form-control:focus {
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.12);
          }

          /* =================================================
             PREVIEW IMAGE
          ================================================= */

          .qr-preview-body {
            padding: 20px !important;
            background: #ffffff !important;
            text-align: center;
          }

          .qr-preview-image {
            display: block;
            width: auto;
            max-width: 100%;
            max-height: 280px;
            margin: 0 auto;
            object-fit: contain;
          }

          /* =================================================
             MOBILE
          ================================================= */

          @media (max-width: 575.98px) {

            .qr-modal-dialog {
              width: calc(100% - 20px) !important;
              max-width: 420px !important;
              margin: 0.75rem auto !important;
            }

            .qr-modal-dialog.preview-dialog {
              max-width: 420px !important;
            }

            .qr-modal-content {
              border-radius: 14px !important;
            }

            .qr-modal-header {
              padding: 14px 15px !important;
            }

            .qr-modal-body {
              padding: 15px !important;
            }

            .qr-modal-footer {
              padding: 0 15px 15px !important;
            }

            .qr-preview-body {
              padding: 15px !important;
            }

            .qr-preview-image {
              max-height: 240px;
            }
          }
        `}
      </style>

      <div className="container-fluid px-2 px-md-4 py-3">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="d-flex align-items-center justify-content-between gap-2 mb-4">

          <div>
            <h4 className="fw-bold mb-1 fs-5 fs-md-4">
              Manajemen QR Code
            </h4>

            <p className="text-muted small mb-0 d-none d-sm-block">
              Kelola QR Code untuk absensi pegawai
            </p>
          </div>

          <button
            type="button"
            className="btn btn-custom-primary d-inline-flex align-items-center justify-content-center gap-1 gap-md-2 px-3 py-2 flex-shrink-0"
            data-bs-toggle="modal"
            data-bs-target="#generateModal"
          >
            <i className="bi bi-plus-lg"></i>

            <span className="d-none d-sm-inline">
              Generate QR Code
            </span>

            <span className="d-inline d-sm-none small fw-semibold">
              Generate
            </span>
          </button>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="row g-2 g-md-3 mb-4">

          <div className="col-6 col-md-3">
            <div className="card card-custom p-2 p-md-3">
              <small
                className="text-muted"
                style={{
                  fontSize: '0.75rem',
                }}
              >
                Total QR
              </small>

              <h5 className="fw-bold mb-0 mt-1 fs-6 fs-md-5">
                {stats.total}
              </h5>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card card-custom p-2 p-md-3">
              <small
                className="text-muted"
                style={{
                  fontSize: '0.75rem',
                }}
              >
                Aktif
              </small>

              <h5 className="fw-bold text-success mb-0 mt-1 fs-6 fs-md-5">
                {stats.active}
              </h5>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card card-custom p-2 p-md-3">
              <small
                className="text-muted"
                style={{
                  fontSize: '0.75rem',
                }}
              >
                Nonaktif
              </small>

              <h5 className="fw-bold text-secondary mb-0 mt-1 fs-6 fs-md-5">
                {stats.inactive}
              </h5>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card card-custom p-2 p-md-3">
              <small
                className="text-muted"
                style={{
                  fontSize: '0.75rem',
                }}
              >
                Expired
              </small>

              <h5 className="fw-bold text-danger mb-0 mt-1 fs-6 fs-md-5">
                {stats.expired}
              </h5>
            </div>
          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="card card-custom overflow-hidden">

          <div className="table-responsive">

            <table
              className="table table-hover align-middle mb-0"
              style={{
                minWidth: '550px',
              }}
            >

              <thead className="table-light">

                <tr
                  style={{
                    fontSize: '0.8rem',
                  }}
                >

                  <th className="ps-3 ps-md-4">
                    Nama
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Expired At
                  </th>

                  <th>
                    Created At
                  </th>

                  <th className="text-end pe-3 pe-md-4">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody
                style={{
                  fontSize: '0.85rem',
                }}
              >

                {qrs.map((item) => (

                  <tr key={item.id}>

                    <td className="ps-3 ps-md-4 fw-semibold text-break">
                      {item.name}
                    </td>

                    <td>
                      {item.is_active ? (

                        <span
                          className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 px-md-3 py-1"
                          style={{
                            fontSize: '0.7rem',
                          }}
                        >
                          Aktif
                        </span>

                      ) : (

                        <span
                          className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 px-md-3 py-1"
                          style={{
                            fontSize: '0.7rem',
                          }}
                        >
                          Nonaktif
                        </span>

                      )}
                    </td>

                    <td className="small text-muted">
                      {item.expired_at ||
                        'Tidak Diatur'}
                    </td>

                    <td className="small text-muted">
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleDateString()
                        : '-'}
                    </td>

                    <td className="text-end pe-3 pe-md-4">

                      <ActionDropdown
                        item={item}
                        onPreview={
                          handleShowPreview
                        }
                        onDownload={
                          handleDownload
                        }
                        onRegenerate={
                          handleRegenerate
                        }
                        onToggleActive={
                          handleToggleActive
                        }
                        onSetExpired={
                          handleOpenExpiredModal
                        }
                        onDelete={
                          handleDelete
                        }
                      />

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =================================================
          GENERATE MODAL
      ================================================= */}

      <div
        className="modal fade"
        id="generateModal"
        tabIndex="-1"
        aria-labelledby="generateModalLabel"
        aria-hidden="true"
      >

        <div className="modal-dialog modal-dialog-centered qr-modal-dialog">

          <div className="modal-content qr-modal-content">

            <div className="modal-header qr-modal-header">

              <h5
                id="generateModalLabel"
                className="modal-title fw-bold fs-6"
              >
                Generate QR Code
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Tutup"
              ></button>

            </div>

            <form onSubmit={handleGenerate}>

              <div className="modal-body qr-modal-body">

                <div className="mb-2">

                  <label className="form-label small fw-semibold">
                    Nama QR Code
                  </label>

                  <input
                    type="text"
                    className="form-control qr-form-control form-control-custom"
                    placeholder="Contoh: QR Utama Kantor Pusat"
                    value={generateName}
                    onChange={(e) =>
                      setGenerateName(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>

              <div className="modal-footer qr-modal-footer">

                <button
                  type="submit"
                  className="btn btn-custom-primary w-100 py-2 rounded-3"
                >
                  Simpan & Generate
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

      {/* =================================================
          PREVIEW MODAL
      ================================================= */}

      <div
        className="modal fade"
        id="previewModal"
        tabIndex="-1"
        aria-labelledby="previewModalLabel"
        aria-hidden="true"
      >

        <div className="modal-dialog modal-dialog-centered qr-modal-dialog preview-dialog">

          <div className="modal-content qr-modal-content">

            <div className="modal-header qr-modal-header">

              <h5
                id="previewModalLabel"
                className="modal-title fw-bold fs-6"
              >
                Preview QR Code
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Tutup"
              ></button>

            </div>

            <div className="modal-body qr-preview-body">

              {previewImage ? (

                <img
                  src={previewImage}
                  alt="QR Preview"
                  className="img-fluid rounded-3 border p-2 qr-preview-image"
                  onError={(e) => {
                    console.error(
                      'Gambar QR tidak dapat dimuat:',
                      e.currentTarget.src
                    );
                  }}
                />

              ) : (

                <LoadingSpinner text="Memuat Gambar QR..." />

              )}

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          EXPIRED MODAL
      ================================================= */}

      <div
        className="modal fade"
        id="expiredModal"
        tabIndex="-1"
        aria-labelledby="expiredModalLabel"
        aria-hidden="true"
      >

        <div className="modal-dialog modal-dialog-centered qr-modal-dialog">

          <div className="modal-content qr-modal-content">

            <div className="modal-header qr-modal-header">

              <h5
                id="expiredModalLabel"
                className="modal-title fw-bold fs-6"
              >
                Atur Masa Berlaku
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Tutup"
              ></button>

            </div>

            <form onSubmit={handleSetExpired}>

              <div className="modal-body qr-modal-body">

                <div className="mb-2">

                  <label className="form-label small fw-semibold">
                    Tanggal & Waktu Kedaluwarsa
                  </label>

                  <input
                    type="datetime-local"
                    className="form-control qr-form-control form-control-custom"
                    value={expiredDateTime}
                    onChange={(e) =>
                      setExpiredDateTime(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>

              <div className="modal-footer qr-modal-footer">

                <button
                  type="submit"
                  className="btn btn-custom-primary w-100 py-2 rounded-3"
                >
                  Update Kedaluwarsa
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </>
  );
};

export default AttendanceQrPage;

