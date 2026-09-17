import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QrScannerCard = ({ onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Inisialisasi Html5Qrcode instance
  const getQrInstance = () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
    }
    return html5QrCodeRef.current;
  };

  // 1. Fungsi Scan via Kamera
  const startScanner = async () => {
    try {
      const qrScanner = getQrInstance();
      setIsScanning(true);

      await qrScanner.start(
        { facingMode: "environment" }, // Kamera belakang
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        async (decodedText) => {
          await stopScanner();
          onScanSuccess(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error("Gagal membuka kamera:", err);
      setIsScanning(false);
      alert("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Gagal menghentikan scanner:", err);
      }
    }
  };

  // 2. Fungsi Scan via Upload File Gambar
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Jika kamera sedang aktif, matikan dulu
    if (isScanning) {
      await stopScanner();
    }

    setIsProcessingFile(true);
    try {
      const qrScanner = getQrInstance();
      // Menggunakan API bawaan html5-qrcode untuk scan file gambar
      const decodedText = await qrScanner.scanFile(file, true);
      
      // Kirim hasil scan ke parent (otomatis memicu Check In/Check Out)
      onScanSuccess(decodedText);
    } catch (err) {
      console.error("Gagal membaca QR dari gambar:", err);
      alert("QR Code tidak terdeteksi pada gambar tersebut. Coba gunakan gambar yang lebih jelas.");
    } finally {
      setIsProcessingFile(false);
      // Reset input file agar bisa memilih file yang sama lagi jika perlu
      e.target.value = null;
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch((err) => console.error(err));
      }
    };
  }, []);

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4 text-center">
        <h6 className="fw-bold text-dark mb-1">
          <i className="bi bi-qr-code-scan me-2 text-primary"></i> Scan QR Absensi
        </h6>
        <p className="text-muted small mb-3">
          Arahkan kamera ke QR Code atau unggah foto gambar QR
        </p>

        {/* Viewport Kamera */}
        <div 
          id="qr-reader" 
          className="mx-auto rounded-3 overflow-hidden border mb-3"
          style={{ maxWidth: '320px', minHeight: isScanning ? '250px' : '0px' }}
        ></div>

        {/* Hidden Input File */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="d-none" 
          onChange={handleFileUpload} 
        />

        {/* Tombol Aksi */}
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
          {!isScanning ? (
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
              onClick={startScanner}
              disabled={isProcessingFile}
            >
              <i className="bi bi-camera me-2"></i> Buka Kamera
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm rounded-pill px-3 py-2"
              onClick={stopScanner}
            >
              <i className="bi bi-x-circle me-1"></i> Matikan Kamera
            </button>
          )}

          {/* Tombol Upload Gambar */}
          <button
            type="button"
            className="btn btn-light border rounded-pill px-4 py-2 fw-semibold shadow-sm"
            onClick={() => fileInputRef.current.click()}
            disabled={isProcessingFile}
          >
            {isProcessingFile ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Membaca Gambar...
              </>
            ) : (
              <>
                <i className="bi bi-image me-2 text-success"></i> Upload Gambar QR
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default QrScannerCard;