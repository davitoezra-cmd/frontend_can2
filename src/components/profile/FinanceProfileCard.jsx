import React from 'react';
import { BiEditAlt, BiEnvelope, BiShieldQuarter } from 'react-icons/bi';

const FinanceProfileCard = ({ profile, onEditClick }) => {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
      
      {/* Avatar Profile */}
      <div className="mb-3 d-flex justify-content-center">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Finance Staff')}&background=0D6EFD&color=fff&size=128&font-size=0.4`}
          alt="Avatar"
          className="rounded-circle shadow-sm border border-2 border-white"
          width="96"
          height="96"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Info Utama */}
      <h5 className="fw-bold text-dark mb-1 fs-5">
        {profile?.name || 'Finance Staff'}
      </h5>
      
      <p className="text-muted fs-7 mb-3 d-flex align-items-center justify-content-center gap-2">
        <BiEnvelope className="fs-6 text-secondary" /> 
        <span>{profile?.email || 'finance@company.com'}</span>
      </p>

      {/* Role Badge */}
      <div className="d-flex justify-content-center mb-4">
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 fw-semibold fs-7 d-inline-flex align-items-center gap-1">
          <BiShieldQuarter className="fs-6" /> Role: Finance
        </span>
      </div>

      {/* Action Button */}
      <div>
        <button 
          className="btn btn-primary rounded-3 px-4 py-2 fs-7 fw-semibold shadow-sm d-inline-flex align-items-center gap-2" 
          onClick={onEditClick}
        >
          <BiEditAlt className="fs-6" /> Edit Profile
        </button>
      </div>

    </div>
  );
};

export default FinanceProfileCard;