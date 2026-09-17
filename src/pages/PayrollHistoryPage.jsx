import React, { useState, useEffect } from 'react';
import {apiFetch} from '../api/apiFetch';
import LoadingSpinner from '../components/LoadingSpinner';
import SidebarFinance from '../layouts/SidebarFinance';
import LogoutButton from '../components/LogoutButton';
import PayrollDetailModal from '../components/payroll/PayrollDetailModal';
import { BiInfoCircle } from 'react-icons/bi';
import { FaSearch, FaFilter } from 'react-icons/fa';

const formatRupiah = (num) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);

const PayrollHistoryPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk toggle Sidebar khusus tampilan Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({ employee_id: '', bulan: '', tahun: '', status: '' });
  const [selectedItem, setSelectedItem] = useState(null);

  // Pagination client side
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.employee_id) params.employee_id = filters.employee_id;
      if (filters.bulan) params.bulan = filters.bulan;
      if (filters.tahun) params.tahun = filters.tahun;

      const res = await apiFetch.get('/finance/payroll', { params });
      setData(res.data.data || []);
      setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil riwayat payroll.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filters.employee_id, filters.bulan, filters.tahun]);

  const filteredData = data.filter((item) => {
    return filters.status ? item.status === filters.status : true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getNamaBulan = (val) => {
    if (!val) return 'Semua Bulan';
    return new Date(0, val - 1).toLocaleString('id-ID', { month: 'long' });
  };

  return (
    <div className="d-flex min-vh-100 bg-light position-relative overflow-x-hidden">
      
      {/* SIDEBAR FINANCE COMPONENT */}
      <SidebarFinance 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow-1 min-vw-0 overflow-hidden d-flex flex-column main-content-wrapper">
        
        {/* NAVBAR/HEADER */}
        <header className="bg-white border-bottom px-3 px-md-4 py-2 sticky-top shadow-sm z-3">
          <div className="d-flex align-items-center justify-content-between">
            
            {/* Sisi Kiri: Toggle Mobile + Judul Halaman */}
            <div className="d-flex align-items-center gap-2 gap-md-3">
              <button 
                className="btn btn-light d-md-none border-0 p-1 shadow-none rounded-2"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle Navigation"
              >
                <i className="bi bi-list fs-4"></i>
              </button>

              <h5 className="fw-bold text-dark m-0 fs-6 fs-md-5">
                Riwayat Payroll Employee
              </h5>
            </div>

            {/* Sisi Kanan: Avatar Inisial (FI) + Info Finance Staff */}
            <div className="d-flex align-items-center gap-2 gap-md-3">
              <div 
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                style={{ width: '38px', height: '38px', fontSize: '14px', flexShrink: 0 }}
              >
                FI
              </div>

              <div className="d-none d-sm-block text-start">
                <span className="d-block fw-bold text-dark lh-1" style={{ fontSize: '14px' }}>
                  Finance Staff
                </span>
                <small className="text-muted" style={{ fontSize: '11px' }}>
                  Finance Department
                </small>
              </div>

              <LogoutButton compact className="navbar-logout-btn" />
            </div>

          </div>
        </header>

        {/* Page Body */}
        <div className="container-fluid p-3 p-md-4 flex-grow-1">
          
          {/* FILTER CARD */}
          <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4 bg-white">
            <div className="d-flex align-items-center gap-2 mb-3 text-secondary">
              <FaFilter className="fs-7" />
              <span className="fw-bold fs-7 text-uppercase tracking-wider">Filter Data Payroll</span>
            </div>

            <div className="row g-2 g-md-3">
              <div className="col-12 col-sm-6 col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 py-2"><FaSearch className="text-muted fs-7" /></span>
                  <input
                    type="text"
                    className="form-control bg-light border-0 shadow-none custom-filter-input"
                    placeholder="Filter ID Employee..."
                    value={filters.employee_id}
                    onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
                  />
                </div>
              </div>

              {/* SELECT BULAN */}
              <div className="col-12 col-sm-6 col-md-3">
                <select
                  className="form-select bg-light border-0 shadow-none custom-filter-select"
                  value={filters.bulan}
                  onChange={(e) => setFilters({ ...filters, bulan: e.target.value })}
                >
                  <option value="">Semua Bulan</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* SELECT TAHUN */}
              <div className="col-12 col-sm-6 col-md-3">
                <select
                  className="form-select bg-light border-0 shadow-none custom-filter-select"
                  value={filters.tahun}
                  onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}
                >
                  <option value="">Semua Tahun</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              {/* SELECT STATUS */}
              <div className="col-12 col-sm-6 col-md-3">
                <select
                  className="form-select bg-light border-0 shadow-none custom-filter-select"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Semua Status</option>
                  <option value="generated">Generated</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* MAIN TABLE / STATE CARD */}
          <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="card border-0 bg-danger bg-opacity-10 text-danger rounded-4 p-4 text-center my-2">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                  <span className="fw-semibold">{error}</span>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-5 my-2">
                <div 
                  className="bg-light text-muted rounded-circle mx-auto p-3 d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '60px', height: '60px' }}
                >
                  <i className="bi bi-inbox fs-3"></i>
                </div>
                <h6 className="fw-bold text-dark mb-1">Data Tidak Ditemukan</h6>
                <p className="text-muted fs-7 mb-0">Tidak ada data payroll yang sesuai dengan pencarian atau filter Anda.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 text-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold">Tanggal Generate</th>
                        <th className="fw-semibold">Employee</th>
                        <th className="fw-semibold">Bulan/Tahun</th>
                        <th className="fw-semibold">Take Home Pay</th>
                        <th className="fw-semibold">Status</th>
                        <th className="text-center fw-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.generated_at ? new Date(item.generated_at).toLocaleDateString('id-ID') : '-'}</td>
                          <td className="fw-semibold">{item.employee?.name || `Employee #${item.employee_id}`}</td>
                          <td>{item.bulan}/{item.tahun}</td>
                          <td className="fw-bold text-primary">{formatRupiah(item.take_home_pay)}</td>
                          <td>
                            <span className={`badge rounded-pill px-3 py-2 ${
                              item.status === 'paid' 
                                ? 'bg-success-subtle text-success border border-success-subtle' 
                                : 'bg-primary-subtle text-primary border border-primary-subtle'
                            }`}>
                              {item.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="text-center">
                            <button 
                              className="btn btn-sm btn-outline-info rounded-2 px-2 py-1 fs-7" 
                              onClick={() => setSelectedItem(item)}
                            >
                              <BiInfoCircle size={15} className="me-1" /> Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-4 pt-3 border-top">
                    <span className="small text-muted fs-7">
                      Menampilkan Page <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
                    </span>
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-secondary btn-sm fs-7"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        Prev
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm fs-7"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </main>

      {/* Modal Detail */}
      <PayrollDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Style responsive khusus untuk layout & custom select popup */}
      <style>{`
        @media (min-width: 768px) {
          .main-content-wrapper {
            margin-left: 250px !important;
            width: calc(100% - 250px) !important;
          }
        }
        @media (max-width: 767.98px) {
          .main-content-wrapper {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }

        /* PERBAIKAN POPUP DROPDOWN MOBILE */
        .custom-filter-select, .custom-filter-input {
          font-size: 13px !important;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
          border-radius: 8px !important;
          height: 38px !important;
        }

        /* Mencegah zoom otomatis dan memperkecil viewport picker di iOS/Android */
        @media (max-width: 767px) {
          .custom-filter-select {
            font-size: 14px !important; /* Mencegah auto-zoom Safari Mobile */
            max-height: 200px !important;
          }
          .custom-filter-select option {
            font-size: 12px !important;
            padding: 4px 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PayrollHistoryPage;