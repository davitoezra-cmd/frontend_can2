import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

const SelfieCard = ({ selfieImage, setSelfieImage }) => {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setSelfieImage(imageSrc);
  }, [webcamRef, setSelfieImage]);

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4 text-center">
        <h6 className="fw-bold text-dark mb-3">Selfie Verification</h6>
        
        <div className="position-relative bg-dark rounded-4 overflow-hidden mb-3 d-flex align-items-center justify-content-center" style={{ minHeight: '220px' }}>
          {selfieImage ? (
            <img src={selfieImage} alt="Selfie preview" className="w-100 h-100 object-fit-cover" />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-100 h-100 object-fit-cover"
            />
          )}
        </div>

        {selfieImage ? (
          <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={() => setSelfieImage(null)}>
            <i className="bi bi-camera me-1"></i> Foto Ulang
          </button>
        ) : (
          <button className="btn btn-primary btn-sm rounded-3 px-4" onClick={capture}>
            <i className="bi bi-camera-fill me-1"></i> Ambil Foto
          </button>
        )}
      </div>
    </div>
  );
};

export default SelfieCard;