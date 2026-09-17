import React, { useState, useEffect, useCallback } from 'react';
import {apiFetch} from '../../api/apiFetch';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaExclamationCircle } from 'react-icons/fa';
import PayrollCorrectionFormModal from './PayrollCorrectionFormModal';
import PayrollCorrectionDeleteModal from './PayrollCorrectionDeleteModal';

const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);

const PayrollCorrectionTable = ({ payroll, onRefreshPayroll }) => {
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState(null); // null = tambah, object = edit
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCorrection, setDeletingCorrection] = useState(null);

  const fetchCorrections = useCallback(async () => {
    if (!payroll?.id) return;
    setLoading(true);
    try {
      const res = await apiFetch.get('/finance/payroll-correction', {
        params: { payroll_id: payroll.id },
      });
      setCorrections(res.data.data || []);
    } catch (err) {
      console.error('Error fetching corrections:', err);
      toast.error(err.response?.data?.message || 'Gagal memuat data payroll correction.');
    } finally {
      setLoading(false);
    }
  }, [payroll?.id]);

  useEffect(() => {
    fetchCorrections();
  }, [fetchCorrections]);

  const handleOpenAdd = () => {
    setSelectedCorrection(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedCorrection(item);
    setShowFormModal(true);
  };

  const handleOpenDelete = (item) => {
    setDeletingCorrection(item);
    setShowDeleteModal(true);
  };

  const handleSuccessSave = () => {
    setShowFormModal(false);
    setSelectedCorrection(null);
    fetchCorrections();
    if (onRefreshPayroll) onRefreshPayroll();
  };

  const handleSuccessDelete = () => {
    setShowDeleteModal(false);
    setDeletingCorrection(null);
    fetchCorrections();
    if (onRefreshPayroll) onRefreshPayroll();
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 mt-4 bg-white">
      {/* Header Card */}
      <div className="card-header bg-white border-bottom p-3 d-flex align-items-center justify-content-between rounded-top-4">
        <div>
          <h6 className="fw-bold text-dark m-0">Payroll Correction</h6>
          <small className="text-muted fs-8">Penyesuaian penambahan atau potongan khusus periode ini</small>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-primary rounded-3 px-3 d-flex align-items-center gap-2"
          onClick={handleOpenAdd}
        >
          <FaPlus size={12} />
          <span>Tambah Koreksi</span>
        </button>
      </div>

      {/* Body / Tabel */}
      <div className="card-body p-3">
        {loading ? (
          <div className="text-center py-4 text-muted fs-7">
            <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
            Memuat data koreksi...
          </div>
        ) : corrections.length === 0 ? (
          <div className="text-center py-4 text-muted fs-7 bg-light rounded-3">
            <FaExclamationCircle className="me-1 mb-1 text-secondary" /> Belum ada koreksi pada payroll ini.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 fs-7">
              <thead className="table-light">
                <tr>
                  <th>Tipe</th>
                  <th>Nominal</th>
                  <th>Alasan</th>
                  <th>Dibuat Oleh</th>
                  <th>Tanggal</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {corrections.map((item) => {
                  const isAddition = item.type === 'addition';
                  return (
                    <tr key={item.id}>
                      <td>
                        <span
                          className={`badge px-2 py-1 rounded-2 ${
                            isAddition
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : 'bg-danger-subtle text-danger border border-danger-subtle'
                          }`}
                        >
                          {isAddition ? 'Addition (+)' : 'Deduction (-)'}
                        </span>
                      </td>
                      <td className={`fw-bold ${isAddition ? 'text-success' : 'text-danger'}`}>
                        {isAddition ? `+ ${formatRupiah(item.amount)}` : `- ${formatRupiah(item.amount)}`}
                      </td>
                      <td style={{ maxWidth: '220px' }} className="text-truncate" title={item.reason}>
                        {item.reason}
                      </td>
                      <td>{item.finance?.name || 'Finance'}</td>
                      <td>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary border-0 text-primary hover-bg-light rounded-2 px-2"
                            title="Edit Koreksi"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary border-0 text-danger hover-bg-light rounded-2 px-2"
                            title="Hapus Koreksi"
                            onClick={() => handleOpenDelete(item)}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal (Tambah & Edit) */}
      {showFormModal && (
        <PayrollCorrectionFormModal
          payroll={payroll}
          correctionData={selectedCorrection}
          onClose={() => {
            setShowFormModal(false);
            setSelectedCorrection(null);
          }}
          onSuccess={handleSuccessSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <PayrollCorrectionDeleteModal
          correction={deletingCorrection}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingCorrection(null);
          }}
          onSuccess={handleSuccessDelete}
        />
      )}
    </div>
  );
};

export default PayrollCorrectionTable;