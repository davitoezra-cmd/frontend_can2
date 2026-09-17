import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {apiFetch} from '../api/apiFetch';

import SidebarFinance from '../layouts/SidebarFinance';
import NavbarFinance from '../layouts/NavbarFinance';

import PayrollSettingStats from '../components/payrollSetting/PayrollSettingStats';
import PayrollSettingFilter from '../components/payrollSetting/PayrollSettingFilter';
import PayrollSettingTable from '../components/payrollSetting/PayrollSettingTable';
import PayrollSettingModal from '../components/payrollSetting/PayrollSettingModal';
import PayrollSettingDetailModal from '../components/payrollSetting/PayrollSettingDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';

const PayrollSettingPage = () => {
  const [settings, setSettings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({ search: '', status: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // State untuk toggling sidebar di tampilan mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch Settings Data
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch.get('/finance/employee-payroll-settings');
      setSettings(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar payroll settings.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Employees Data (untuk dropdown tambah setting)
  const fetchEmployees = async () => {
    try {
      const res = await apiFetch.get('/finance/employees');
      setEmployees(res.data?.data || res.data || []);
    } catch (err) {
      // Fallback
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchEmployees();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (formData) => {
    setActionLoading(true);
    try {
      if (selectedItem) {
        // UPDATE
        const res = await apiFetch.put(
          `/finance/employee-payroll-settings/${selectedItem.id}`,
          formData
        );
        toast.success(res.data?.message || 'Setting payroll berhasil diperbarui');
      } else {
        // STORE
        const res = await apiFetch.post('/finance/employee-payroll-settings', formData);
        toast.success(res.data?.message || 'Setting payroll berhasil dibuat');
      }
      setIsModalOpen(false);
      setSelectedItem(null);
      fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan setting payroll');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah yakin ingin menghapus Payroll Setting ini?')) return;
    try {
      const res = await apiFetch.delete(`/finance/employee-payroll-settings/${id}`);
      toast.success(res.data?.message || 'Setting payroll berhasil dihapus');
      fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  // Filter List Data Client-Side Realtime
  const filteredSettings = settings.filter((item) => {
    const empName = item.employee?.name || '';
    const matchesName = empName.toLowerCase().includes(filters.search.toLowerCase());
    
    let matchesStatus = true;
    if (filters.status === 'aktif') matchesStatus = item.aktif === true || item.aktif === 1;
    if (filters.status === 'nonaktif') matchesStatus = item.aktif === false || item.aktif === 0;

    return matchesName && matchesStatus;
  });

  // Calculate Statistics
  const stats = {
    totalEmployee: settings.length,
    activeCount: settings.filter((s) => s.aktif).length,
    inactiveCount: settings.filter((s) => !s.aktif).length,
    avgGajiHarian:
      settings.length > 0
        ? settings.reduce((acc, curr) => acc + Number(curr.gaji_harian || 0), 0) / settings.length
        : 0,
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar Finance dengan props toggle/responsive */}
      <SidebarFinance isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Content Wrapper */}
      <div 
        className="flex-grow-1 d-flex flex-column min-vh-100 style-content main-content-wrapper" 
        style={{ overflowX: 'hidden' }}
      >
        <NavbarFinance title="Payroll Setting" onToggleSidebar={toggleSidebar} />

        <div className="container-fluid p-3 p-md-4">
          <PayrollSettingStats stats={stats} />

          <PayrollSettingFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onOpenAddModal={() => {
              setSelectedItem(null);
              setIsModalOpen(true);
            }}
          />

          <div className="card border-0 shadow-sm rounded-4 bg-white p-2 p-md-3">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="alert alert-danger mb-0">
                {error}
              </div>
            ) : filteredSettings.length === 0 ? (
              <div className="text-center py-5">
                <h5 className="text-muted">Belum ada Payroll Setting</h5>
                <p className="text-secondary mb-0">
                  Silakan tambahkan payroll setting untuk employee terlebih dahulu.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <PayrollSettingTable
                  data={filteredSettings}
                  onDetail={(item) => setDetailItem(item)}
                  onEdit={(item) => {
                    setSelectedItem(item);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PayrollSettingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleSave}
        selectedItem={selectedItem}
        employees={employees}
        loading={actionLoading}
      />

      <PayrollSettingDetailModal item={detailItem} onClose={() => setDetailItem(null)} />

      {/* CSS Penyesuaian Responsif */}
      <style>{`
        @media (min-width: 768px) {
          .main-content-wrapper {
            margin-left: 250px;
            width: calc(100% - 250px);
            min-width: 0; /* Menyesuaikan lebar Sidebar di desktop */
          }
        }
        @media (max-width: 767.98px) {
          .main-content-wrapper {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PayrollSettingPage;