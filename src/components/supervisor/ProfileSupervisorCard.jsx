import React from 'react';

const ProfileSupervisorCard = ({ supervisor, onEditClick }) => {
  return (
    <div className="card border-0 shadow-sm rounded-3 text-center p-4">
      <div className="mb-3 mx-auto" style={{ width: '120px', height: '120px' }}>
        <img
          src={supervisor.photo || "https://via.placeholder.com/150"}
          alt={supervisor.name}
          className="rounded-circle img-thumbnail w-100 h-100 object-fit-cover"
        />
      </div>
      <h5 className="fw-bold mb-1">{supervisor.name}</h5>
      <p className="text-muted mb-3">{supervisor.role || 'Supervisor HR'}</p>

      <div className="text-start border-top pt-3">
        <div className="mb-2">
          <small className="text-muted d-block">Email</small>
          <span className="fw-semibold">{supervisor.email}</span>
        </div>
        <div className="mb-3">
          <small className="text-muted d-block">Nomor HP</small>
          <span className="fw-semibold">{supervisor.phone}</span>
        </div>
      </div>

      <button className="btn btn-outline-primary w-100 mt-2" onClick={onEditClick}>
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileSupervisorCard;