import React, { useEffect, useState } from 'react';
import { FaSyncAlt } from 'react-icons/fa';
import {apiFetch} from '../api/apiFetch';
import LoadingSpinner from '../components/LoadingSpinner';
import BusinessTripApprovalStats from '../approval/businessTrip/BusinessTripApprovalStats';
import BusinessTripApprovalFilter from '../approval/businessTrip/BusinessTripApprovalFilter';
import BusinessTripApprovalTable from '../approval/businessTrip/BusinessTripApprovalTable';
import BusinessTripApprovalDetailModal from '../approval/businessTrip/BusinessTripApprovalDetailModal';

const BusinessTripApprovalPage = () => {
  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [activeItem, setActiveItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchBusinessTrips = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get('/admin/business-trip');
      const allData = response.data?.data || response.data || [];
      setDataList(allData);
    } catch (error) {
      console.error('Error fetching business trip approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessTrips();
  }, []);

  // Filter Data untuk Table
  const filteredData = dataList.filter((item) => {
    const matchStatus = filterStatus === 'ALL' ? true : item.status === filterStatus;
    const empName = item.employee?.name || item.employee_name || '';
    const destination = item.destination || '';
    const purpose = item.purpose || '';

    const matchSearch =
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purpose.toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
    <div className="container-fluid px-2 px-md-4 py-3">
      {/* CSS Dynamic untuk Spinner Refresh & Responsif Tabel */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }

        /* Memastikan tabel dapat di-scroll horizontal secara halus tanpa merusak layout card */
        .responsive-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* Mencegah teks tanggal, tujuan, dan badge bertindih di layar mobile */
        .responsive-table-wrapper table th,
        .responsive-table-wrapper table td {
          white-space: nowrap;
          vertical-align: middle;
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between gap-2 mb-3 mb-md-4">
        <div>
          <h4 className="fw-bold text-dark mb-1 fs-5 fs-md-4">Pengajuan Dinas</h4>
          <p className="text-muted small mb-0 d-none d-sm-block">
            Kelola dan lakukan persetujuan pengajuan dinas luar karyawan.
          </p>
        </div>

        {/* Tombol Refresh Responsive */}
        <button
          className="btn btn-outline-primary rounded-3 px-3 py-2 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm flex-shrink-0"
          onClick={fetchBusinessTrips}
          disabled={loading}
        >
          <FaSyncAlt className={loading ? 'spin' : ''} />
          <span className="d-none d-sm-inline">Refresh</span>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 gap-md-4">
          {/* SUMMARY CARDS */}
          <BusinessTripApprovalStats dataList={dataList} />

          {/* FILTER SECTION */}
          <BusinessTripApprovalFilter
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {/* TABLE SECTION */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="responsive-table-wrapper">
              <BusinessTripApprovalTable
                data={filteredData}
                onOpenDetail={(item) => {
                  setActiveItem(item);
                  setShowDetailModal(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      <BusinessTripApprovalDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={activeItem}
        onSuccess={fetchBusinessTrips}
      />
    </div>
  );
};

export default BusinessTripApprovalPage;