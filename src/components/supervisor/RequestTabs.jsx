import React from 'react';

const RequestTabs = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'cuti', label: 'Cuti', icon: 'bi-calendar-event' },
    { id: 'izin', label: 'Izin', icon: 'bi-calendar2-minus' },
    { id: 'sakit', label: 'Sakit', icon: 'bi-hospital' },
    { id: 'dinas_luar', label: 'Dinas Luar', icon: 'bi-briefcase' },
  ];

  return (
    <div className="bg-white p-2 rounded-4 shadow-sm mb-4 border">
      <ul className="nav nav-pills nav-fill gap-2">
        {tabs.map((tab) => (
          <li className="nav-item" key={tab.id}>
            <button
              type="button"
              className={`nav-link border-0 rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                activeTab === tab.id
                  ? 'active bg-primary text-white shadow-sm'
                  : 'text-secondary bg-transparent hover-bg-light'
              }`}
              onClick={() => onSelectTab(tab.id)}
            >
              <i className={`bi ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RequestTabs;