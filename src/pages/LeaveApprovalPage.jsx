import React, { useEffect, useState } from 'react';
import LeaveApprovalStats from '../approval/leave/LeaveApprovalStats';
import LeaveApprovalFilter from '../approval/leave/LeaveApprovalFilter';
import LeaveApprovalTable from '../approval/leave/LeaveApprovalTable';
import LeaveApprovalDetailModal from '../approval/leave/LeaveApprovalDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import {apiFetch} from '../api/apiFetch';
import { toast } from 'react-toastify';
import { FaSync } from 'react-icons/fa';

const LeaveApprovalPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get('/admin/leave');
      if (response.data?.success) {
        setLeaves(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengambil data pengajuan cuti.');
    } finally {
      setLoading(false);
    }
  };

  // Safe Filtering (mencegah error jika employee/name bernilai null)
  const filteredLeaves = leaves.filter((item) => {
    const employeeName = item.employee?.name || '';
    const nameMatch = employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'Semua' || item.status === statusFilter;
    return nameMatch && statusMatch;
  });

  return (
    <div className="container-fluid px-2 px-md-4 py-3">
      {/* Dynamic CSS untuk Spinner & Mencegah Teks Tanggal Bertindih */}
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

        /* Mencegah teks tanggal dan badge bertindih di layar mobile */
        .responsive-table-wrapper table th,
        .responsive-table-wrapper table td {
          white-space: nowrap;
          vertical-align: middle;
        }
      `}</style>

      {/* Header Section */}
      <div className="d-flex align-items-center justify-content-between gap-2 mb-3 mb-md-4">
        <div>
          <h4 className="fw-bold text-dark mb-1 fs-5 fs-md-4">Approval Pengajuan Cuti</h4>
          <p className="text-muted small mb-0 d-none d-sm-block">Kelola seluruh pengajuan cuti dari karyawan.</p>
        </div>
        
        {/* Tombol Refresh Responsive */}
        <button
          className="btn btn-outline-primary rounded-3 px-3 py-2 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm flex-shrink-0"
          onClick={fetchLeaves}
          disabled={loading}
        >
          <FaSync className={loading ? 'spin' : ''} />
          <span className="d-none d-sm-inline">Refresh</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 gap-md-4">
          <LeaveApprovalStats data={leaves} />
          
          <LeaveApprovalFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
          
          {/* Card Wrapper yang Rapi dan Membatasi Overflow Tabel */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="responsive-table-wrapper">
              <LeaveApprovalTable
                data={filteredLeaves}
                onDetail={(id) => {
                  setSelectedDetailId(id);
                  setIsDetailModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <LeaveApprovalDetailModal
        id={selectedDetailId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSuccess={fetchLeaves}
      />
    </div>
  );
};

export default LeaveApprovalPage;