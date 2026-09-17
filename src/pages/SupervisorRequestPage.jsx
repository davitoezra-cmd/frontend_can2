import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {apiFetch} from '../api/apiFetch'; // Ganti dengan path instance Apifetch Anda
import RequestTabs from '../components/supervisor/RequestTabs';
import RequestStats from '../components/supervisor/RequestStats';
import RequestFilter from '../components/supervisor/RequestFilter';
import RequestTable from '../components/supervisor/RequestTable';
import RequestDetailModal from '../components/supervisor/RequestDetailModal';

const SupervisorRequestPage = () => {
  const [activeTab, setActiveTab] = useState('cuti');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rawRequests, setRawRequests] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date: '',
  });

  // Fetch Data dari API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Direct call berdasarkan type tab atau endpoint statistik
      const [resRequests, resStats] = await Promise.all([
    apiFetch.get('/supervisor/requests', {
        params: {
            type: activeTab,
        },
    }),
    apiFetch.get('/supervisor/requests/statistics').catch(() => null),
]);

      if (resRequests.data && resRequests.data.success) {
        setRawRequests(resRequests.data.data || []);
      }

      if (resStats?.data?.success) {
        setStatistics(resStats.data.statistics);
      }
    } catch (err) {
      console.error('Error fetch supervisor requests:', err);
      setError(err.response?.data?.message || 'Gagal memuat data pengajuan karyawan.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler Filter Input
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilter = () => {
    setFilters({ search: '', status: '', date: '' });
  };

  // Filtering data menggunakan useMemo
  const filteredRequests = useMemo(() => {
    return rawRequests.filter((item) => {
      const empName = (item.employee?.name || item.employee_name || '').toLowerCase();
      const matchesSearch = empName.includes(filters.search.toLowerCase());
      
      const itemStatus = (item.status || 'pending').toLowerCase();
      const matchesStatus = filters.status ? itemStatus === filters.status.toLowerCase() : true;

      const itemDate = item.created_at ? item.created_at.split('T')[0] : '';
      const matchesDate = filters.date ? itemDate === filters.date : true;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [rawRequests, filters]);

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container-fluid p-3 p-md-4 bg-light min-vh-100">
      
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark m-0">Pengajuan Karyawan</h4>
          <p className="text-muted small m-0 mt-1">
            Supervisor dapat memonitor seluruh pengajuan karyawan.
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-white text-secondary border px-3 py-2 rounded-pill fw-medium shadow-sm">
            <i className="bi bi-calendar3 me-2 text-primary"></i>
            {formattedDate}
          </span>
          <button
            type="button"
            className="btn btn-primary rounded-3 d-inline-flex align-items-center gap-2 shadow-sm"
            onClick={fetchData}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <RequestStats statistics={statistics} />

      {/* Tabs Switcher */}
      <RequestTabs activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      {/* Filter Component */}
      <RequestFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilter}
      />

      {/* State Handling (Error / Loading / Table) */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-4 shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {loading ? (
        <div className="card border-0 shadow-sm rounded-4 bg-white p-5 text-center my-3">
          <div className="spinner-border text-primary mx-auto mb-3" role="status"></div>
          <p className="text-muted small m-0 fw-semibold">Memuat data pengajuan...</p>
        </div>
      ) : (
        <RequestTable
          requests={filteredRequests}
          activeTab={activeTab}
          onOpenDetail={(item) => setSelectedItem(item)}
        />
      )}

      {/* Modal Detail */}
      {selectedItem && (
        <RequestDetailModal
          item={selectedItem}
          activeTab={activeTab}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Extra Styling for Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SupervisorRequestPage;