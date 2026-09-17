import React, { useState, useEffect } from 'react';
import {apiFetch} from '../api/apiFetch';
import LoadingSpinner from '../components/LoadingSpinner';
import CashAdvanceApprovalStats from '../approval/cashAdvance/CashAdvanceApprovalStats';
import CashAdvanceApprovalFilter from '../approval/cashAdvance/CashAdvanceApprovalFilter';
import CashAdvanceApprovalTable from '../approval/cashAdvance/CashAdvanceApprovalTable';
import CashAdvanceApprovalDetailModal from '../approval/cashAdvance/CashAdvanceApprovalDetailModal';

import { FaSync } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const CashAdvanceApprovalPage = () => {
  const [cashAdvances, setCashAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Fetch All Data
  const fetchCashAdvances = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get('/admin/cash-advance');
      if (response.data?.success) {
        setCashAdvances(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengambil data pengajuan kasbon.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashAdvances();
  }, []);

  // Fetch Single Detail
  const handleDetail = async (id) => {
    try {
      const response = await apiFetch.get(`/admin/cash-advance/${id}`);
      if (response.data?.success) {
        setSelectedDetail(response.data.data);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat detail pengajuan.');
    }
  };

  // Approve Process
  const handleApprove = (id) => {
    Swal.fire({
      title: 'Persetujuan Kasbon',
      text: 'Yakin ingin menyetujui pengajuan kasbon ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Setujui',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch.put(`/admin/cash-advance/${id}/approve`, {
            approval_note: 'Kasbon disetujui.',
          });
          if (response.data?.success) {
            toast.success(response.data.message || 'Pengajuan kasbon berhasil disetujui.');
            setIsDetailModalOpen(false);
            setSelectedDetail(null);
            fetchCashAdvances();
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Gagal menyetujui pengajuan.');
        }
      }
    });
  };

  // Reject Process
  const handleReject = (id) => {
    Swal.fire({
      title: 'Penolakan Kasbon',
      text: 'Masukkan alasan penolakan pengajuan kasbon:',
      input: 'textarea',
      inputPlaceholder: 'Tuliskan alasan penolakan...',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Alasan penolakan wajib diisi!';
        }
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Tolak Pengajuan',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch.put(`/admin/cash-advance/${id}/reject`, {
            approval_note: result.value,
          });
          if (response.data?.success) {
            toast.success(response.data.message || 'Pengajuan kasbon berhasil ditolak.');
            setIsDetailModalOpen(false);
            setSelectedDetail(null);
            fetchCashAdvances();
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Gagal menolak pengajuan.');
        }
      }
    });
  };

  // Filter Logic
  const filteredData = cashAdvances.filter((item) => {
    const employeeName = item.employee?.name || '';
    const matchesSearch = employeeName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'Semua' ? true : item.status === filterStatus;
    return matchesSearch && matchesStatus;
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

        /* Mencegah teks tanggal, nominal, dan badge bertindih di layar mobile */
        .responsive-table-wrapper table th,
        .responsive-table-wrapper table td {
          white-space: nowrap;
          vertical-align: middle;
        }
      `}</style>

      {/* Header Section */}
      <div className="d-flex align-items-center justify-content-between gap-2 mb-3 mb-md-4">
        <div>
          <h4 className="fw-bold text-dark mb-1 fs-5 fs-md-4">Approval Kasbon</h4>
          <p className="text-muted small mb-0 d-none d-sm-block">Kelola seluruh pengajuan kasbon dari karyawan dan lakukan proses persetujuan.</p>
        </div>
        
        {/* Tombol Refresh Responsive */}
        <button
          className="btn btn-outline-primary rounded-3 px-3 py-2 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm flex-shrink-0"
          onClick={fetchCashAdvances}
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
          <CashAdvanceApprovalStats data={cashAdvances} />

          <CashAdvanceApprovalFilter
            search={search}
            setSearch={setSearch}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />

          {/* Card Pembungkus Tabel yang Rapi & Anti Overlap */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="responsive-table-wrapper">
              <CashAdvanceApprovalTable
                data={filteredData}
                onDetail={handleDetail}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail & Action Modal */}
      <CashAdvanceApprovalDetailModal
        detailData={selectedDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetail(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default CashAdvanceApprovalPage;