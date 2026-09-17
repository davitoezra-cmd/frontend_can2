import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {apiFetch} from '../api/apiFetch';
import SidebarFinance from '../layouts/SidebarFinance';
import LogoutButton from '../components/LogoutButton';
import LoadingSpinner from '../components/LoadingSpinner';

import CashAdvanceStats from '../components/cashAdvanceFinance/CashAdvanceStats';
import CashAdvanceFilter from '../components/cashAdvanceFinance/CashAdvanceFilter';
import CashAdvanceTable from '../components/cashAdvanceFinance/CashAdvanceTable';
import CashAdvanceDetailModal from '../components/cashAdvanceFinance/CashAdvanceDetailModal';

const CashAdvanceFinancePage = () => {
  const [cashAdvances, setCashAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payLoadingId, setPayLoadingId] = useState(null);

  // State untuk toggle Sidebar khusus tampilan Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');

  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchCashAdvances = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get('/finance/cash-advance');
      if (response.data?.success) {
        setCashAdvances(response.data.data || []);
      } else {
        toast.error(response.data?.message || 'Gagal mengambil data kasbon.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashAdvances();
  }, []);

  const handlePay = async (id) => {
    const isConfirmed = window.confirm('Yakin ingin mencairkan kasbon ini?');
    if (!isConfirmed) return;

    setPayLoadingId(id);
    try {
      const response = await apiFetch.put(`/finance/cash-advance/${id}/pay`);
      if (response.data?.success) {
        toast.success(response.data?.message || 'Kasbon berhasil dicairkan.');
        fetchCashAdvances();
      } else {
        toast.error(response.data?.message || 'Gagal mencairkan kasbon.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mencairkan kasbon.');
    } finally {
      setPayLoadingId(null);
    }
  };

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
    setIsDetailOpen(false);
  };

  // Filter Logic
  const filteredData = cashAdvances.filter((item) => {
    const empName = item.employee?.name || '';
    const matchesSearch = empName.toLowerCase().includes(search.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'approved') {
      matchesStatus = item.status === 'approved';
    } else if (statusFilter === 'paid') {
      matchesStatus = Boolean(item.is_paid);
    } else if (statusFilter === 'unpaid') {
      matchesStatus = !item.is_paid;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="d-flex min-vh-100 bg-light position-relative overflow-x-hidden">
      {/* Sidebar */}
      <SidebarFinance 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <main className="flex-grow-1 min-vw-0 overflow-hidden d-flex flex-column main-content-wrapper">
        
        {/* HEADER / NAVBAR */}
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
                Pencairan Kasbon
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
          {/* Statistics */}
          <CashAdvanceStats data={cashAdvances} />

          {/* Filter */}
          <CashAdvanceFilter
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          {/* Table / Loading */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <LoadingSpinner />
            </div>
          ) : (
            <CashAdvanceTable
              data={filteredData}
              onDetail={handleOpenDetail}
              onPay={handlePay}
              payLoadingId={payLoadingId}
            />
          )}
        </div>
      </main>

      {/* Modal Detail */}
      <CashAdvanceDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        data={selectedItem}
      />

      {/* Style responsive & perbaikan dropdown mobile */}
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

        /* OVERRIDE DROPDOWN / SELECT DI CASH ADVANCE FILTER */
        .container-fluid select, 
        .container-fluid input {
          font-size: 13px !important;
          border-radius: 8px !important;
        }

        @media (max-width: 767px) {
          .container-fluid select {
            font-size: 14px !important; /* Mencegah auto-zoom Safari/Chrome Mobile */
            height: 38px !important;
            padding-top: 6px !important;
            padding-bottom: 6px !important;
          }
          .container-fluid select option {
            font-size: 12px !important;
            padding: 4px 8px !important;
            background-color: #ffffff;
            color: #212529;
          }
        }
      `}</style>
    </div>
  );
};

export default CashAdvanceFinancePage;