import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import {apiFetch} from '../api/apiFetch'; // Sesuaikan path jika berbeda

const CheckOutModal = ({ show, onClose, item, onSuccess }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(false);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            toast.error(
              'Gagal mengambil lokasi GPS. Pastikan izin lokasi diaktifkan.'
            );
            console.error(error);
          }
        );
      } else {
        toast.error('Browser tidak mendukung Geolocation.');
      }
    }
  }, [webcamRef]);

  const handleRetake = () => {
    setImgSrc(null);
    setCoords({
      latitude: null,
      longitude: null,
    });
  };

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async () => {
    if (!imgSrc || !coords.latitude || !coords.longitude) {
      toast.error(
        'Foto dan lokasi GPS wajib ada untuk melakukan Check Out!'
      );
      return;
    }

    setLoading(true);

    try {
      const photoFile = dataURLtoFile(
        imgSrc,
        `checkout-${item.id}.jpg`
      );

      const formData = new FormData();

      formData.append('photo', photoFile);
      formData.append('latitude', coords.latitude);
      formData.append('longitude', coords.longitude);

      await apiFetch.post(
        `/employee/business-trip/${item.id}/check-out`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Berhasil melakukan Check Out Dinas!');

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Gagal melakukan Check Out.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <style>{`
        /* =====================================================
           CHECK OUT MODAL
        ===================================================== */

        .checkout-overlay {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;

          background: rgba(15, 23, 42, 0.55);

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 16px;

          z-index: 2000;

          overflow-y: auto;
        }

        .checkout-modal {
          width: 100%;
          max-width: 560px;

          max-height: calc(100vh - 32px);
          max-height: calc(100dvh - 32px);

          background: #ffffff;

          border-radius: 18px;

          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.22);

          display: flex;
          flex-direction: column;

          overflow: hidden;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .checkout-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 17px 20px;

          border-bottom: 1px solid #e5e7eb;

          flex-shrink: 0;
        }

        .checkout-title {
          margin: 0;

          font-size: 17px;
          font-weight: 700;

          color: #111827;
        }

        .checkout-subtitle {
          margin: 3px 0 0;

          font-size: 12px;

          color: #6b7280;
        }

        .checkout-close {
          width: 34px;
          height: 34px;

          border: none;

          border-radius: 9px;

          background: #f3f4f6;

          color: #6b7280;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .checkout-close:hover {
          background: #e5e7eb;
          color: #111827;
        }

        /* =====================================================
           BODY
        ===================================================== */

        .checkout-body {
          padding: 18px 20px;

          overflow-y: auto;

          min-height: 0;

          flex: 1;
        }

        /* =====================================================
           CAMERA
        ===================================================== */

        .checkout-camera-wrapper {
          width: 100%;

          background: #000000;

          border-radius: 14px;

          overflow: hidden;

          position: relative;

          margin-bottom: 14px;

          display: flex;
          align-items: center;
          justify-content: center;

          aspect-ratio: 4 / 3;

          max-height: 330px;
        }

        .checkout-camera-wrapper video {
          width: 100% !important;
          height: 100% !important;

          object-fit: cover;
        }

        .checkout-preview {
          width: 100%;

          max-height: 330px;

          aspect-ratio: 4 / 3;

          object-fit: cover;

          border-radius: 14px;

          border: 1px solid #e5e7eb;

          display: block;

          margin-bottom: 14px;
        }

        /* =====================================================
           PHOTO ACTION
        ===================================================== */

        .checkout-photo-actions {
          display: flex;

          justify-content: center;

          gap: 8px;

          margin-bottom: 14px;
        }

        .checkout-photo-btn {
          min-height: 38px;

          padding: 8px 20px;

          border-radius: 9px;

          font-size: 13px;

          font-weight: 600;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .checkout-photo-btn.primary {
          border: none;

          background: #4f46e5;

          color: #ffffff;
        }

        .checkout-photo-btn.primary:hover {
          background: #4338ca;
        }

        .checkout-photo-btn.secondary {
          border: 1px solid #d1d5db;

          background: #ffffff;

          color: #4b5563;
        }

        .checkout-photo-btn.secondary:hover {
          background: #f9fafb;
        }

        /* =====================================================
           GPS
        ===================================================== */

        .checkout-gps {
          padding: 12px 14px;

          background: #f8fafc;

          border: 1px solid #e5e7eb;

          border-radius: 11px;

          font-size: 12px;

          color: #4b5563;
        }

        .checkout-gps-title {
          display: flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 7px;

          font-size: 12px;

          font-weight: 700;

          color: #374151;
        }

        .checkout-gps-row {
          display: flex;

          justify-content: space-between;

          gap: 12px;

          padding: 3px 0;
        }

        .checkout-gps-label {
          color: #6b7280;
        }

        .checkout-gps-value {
          color: #111827;

          font-weight: 500;

          text-align: right;

          word-break: break-all;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .checkout-footer {
          display: flex;

          justify-content: flex-end;

          align-items: center;

          gap: 8px;

          padding: 13px 20px;

          border-top: 1px solid #e5e7eb;

          background: #ffffff;

          flex-shrink: 0;
        }

        .checkout-footer-btn {
          min-height: 38px;

          padding: 8px 18px;

          border-radius: 9px;

          font-size: 13px;

          font-weight: 600;

          border: none;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .checkout-footer-btn.cancel {
          background: #f3f4f6;

          color: #374151;
        }

        .checkout-footer-btn.cancel:hover {
          background: #e5e7eb;
        }

        .checkout-footer-btn.submit {
          background: #2563eb;

          color: #ffffff;
        }

        .checkout-footer-btn.submit:hover {
          background: #1d4ed8;
        }

        .checkout-footer-btn:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 575.98px) {

          .checkout-overlay {
            padding: 10px;
          }

          .checkout-modal {
            max-width: 100%;

            max-height: calc(100vh - 20px);
            max-height: calc(100dvh - 20px);

            border-radius: 15px;
          }

          .checkout-header {
            padding: 14px 16px;
          }

          .checkout-title {
            font-size: 15px;
          }

          .checkout-subtitle {
            font-size: 11px;
          }

          .checkout-body {
            padding: 14px 16px;
          }

          .checkout-camera-wrapper,
          .checkout-preview {
            aspect-ratio: 4 / 3;

            max-height: 260px;

            border-radius: 12px;
          }

          .checkout-gps-row {
            display: block;
          }

          .checkout-gps-value {
            text-align: left;

            margin-top: 2px;
          }

          .checkout-footer {
            padding: 11px 16px;
          }

          .checkout-footer-btn {
            flex: 1;
          }
        }
      `}</style>

      {/* =====================================================
          OVERLAY
      ===================================================== */}

      <div
        className="checkout-overlay"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => {
          if (
            e.target === e.currentTarget &&
            !loading
          ) {
            onClose();
          }
        }}
      >

        {/* ===================================================
            MODAL
        =================================================== */}

        <div className="checkout-modal">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="checkout-header">

            <div>
              <h5 className="checkout-title">
                Business Trip Check Out
              </h5>

              <p className="checkout-subtitle">
                Ambil foto dan lokasi untuk melakukan check out
              </p>
            </div>

            <button
              type="button"
              className="checkout-close"
              onClick={onClose}
              disabled={loading}
              title="Tutup"
            >
              <i className="bi bi-x-lg"></i>
            </button>

          </div>

          {/* =================================================
              BODY
          ================================================= */}

          <div className="checkout-body">

            {/* CAMERA / PREVIEW */}

            {!imgSrc ? (
              <div className="checkout-camera-wrapper">

                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  videoConstraints={{
                    facingMode: 'user',
                  }}
                />

              </div>
            ) : (
              <img
                src={imgSrc}
                alt="Preview"
                className="checkout-preview"
              />
            )}

            {/* PHOTO ACTION */}

            <div className="checkout-photo-actions">

              {!imgSrc ? (
                <button
                  type="button"
                  className="checkout-photo-btn primary"
                  onClick={capturePhoto}
                  disabled={loading}
                >
                  <i className="bi bi-camera me-2"></i>
                  Ambil Foto
                </button>
              ) : (
                <button
                  type="button"
                  className="checkout-photo-btn secondary"
                  onClick={handleRetake}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Foto Ulang
                </button>
              )}

            </div>

            {/* GPS */}

            <div className="checkout-gps">

              <div className="checkout-gps-title">
                <i className="bi bi-geo-alt-fill text-danger"></i>
                Koordinat Lokasi GPS
              </div>

              <div className="checkout-gps-row">

                <span className="checkout-gps-label">
                  Latitude
                </span>

                <span className="checkout-gps-value">
                  {coords.latitude !== null
                    ? coords.latitude
                    : 'Menunggu foto...'}
                </span>

              </div>

              <div className="checkout-gps-row">

                <span className="checkout-gps-label">
                  Longitude
                </span>

                <span className="checkout-gps-value">
                  {coords.longitude !== null
                    ? coords.longitude
                    : 'Menunggu foto...'}
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="checkout-footer">

            <button
              type="button"
              className="checkout-footer-btn cancel"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="button"
              className="checkout-footer-btn submit"
              onClick={handleSubmit}
              disabled={
                loading ||
                !imgSrc ||
                !coords.latitude
              }
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Mengirim...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Kirim Check Out
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </>
  );
};

export default CheckOutModal;