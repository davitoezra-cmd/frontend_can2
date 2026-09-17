import React from 'react';

const AttendanceReportFilter = ({ filter, setFilter, employees, onReset }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label small fw-bold">Pilih Tanggal</label>
            <input
              type="date"
              className="form-control"
              name="date"
              value={filter.date}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-5">
            <label className="form-label small fw-bold">Pilih Karyawan</label>
            <select
              className="form-select"
              name="employee_id"
              value={filter.employee_id}
              onChange={handleChange}
            >
              <option value="">Semua Karyawan</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2 d-grid">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onReset}
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReportFilter;