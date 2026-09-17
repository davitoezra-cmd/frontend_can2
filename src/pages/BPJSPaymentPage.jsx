import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {apiFetch} from "../api/apiFetch";

import SidebarFinance from "../layouts/SidebarFinance";
import NavbarFinance from "../layouts/NavbarFinance";

import BPJSPaymentStats from "../components/finance/BPJSPaymentStats";
import BPJSPaymentFilter from "../components/finance/BPJSPaymentFilter";
import BPJSPaymentTable from "../components/finance/BPJSPaymentTable";
import BPJSPaymentFormModal from "../components/finance/BPJSPaymentFormModal";
import BPJSPaymentDetailModal from "../components/finance/BPJSPaymentDetailModal";
import LoadingSpinner from "../components/LoadingSpinner";

const BPJSPaymentPage = () => {
  // =====================================================
  // STATE DATA
  // =====================================================

  const [proofs, setProofs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // FILTER
  // =====================================================

  const [filters, setFilters] = useState({
    search: "",
    bpjs_type: "",
    period: "",
  });

  // =====================================================
  // MODAL
  // =====================================================

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedData, setSelectedData] = useState(null);

  // =====================================================
  // SIDEBAR
  // =====================================================

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchData = async () => {
    setLoading(true);

    try {
      // -------------------------------------------------
      // BPJS
      // -------------------------------------------------

      try {
        const bpjsRes = await apiFetch.get(
          "/finance/bpjs-payment-proofs"
        );

        const rawBpjsData =
          bpjsRes.data?.data || bpjsRes.data;

        setProofs(
          Array.isArray(rawBpjsData)
            ? rawBpjsData
            : []
        );
      } catch (bpjsErr) {
        console.error(
          "Gagal mengambil data BPJS:",
          bpjsErr
        );

        toast.error(
          "Gagal memuat data bukti BPJS."
        );

        setProofs([]);
      }

      // -------------------------------------------------
      // EMPLOYEES
      // -------------------------------------------------

      try {
        const employeeRes = await apiFetch.get(
          "/finance/employees"
        );

        const rawEmpData =
          employeeRes.data?.data ||
          employeeRes.data;

        setEmployees(
          Array.isArray(rawEmpData)
            ? rawEmpData
            : []
        );
      } catch (empErr) {
        console.warn(
          "Endpoint /finance/employees belum tersedia."
        );

        setEmployees([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // SAFE DATA
  // =====================================================

  const safeProofs = Array.isArray(proofs)
    ? proofs
    : [];

  // =====================================================
  // FILTER
  // =====================================================

  const filteredData = safeProofs.filter((item) => {
    if (!item) return false;

    const searchKeyword = (
      filters.search || ""
    )
      .toLowerCase()
      .trim();

    const employeeName =
      item.employee?.name ||
      item.employee_name ||
      "";

    const matchSearch =
      employeeName
        .toLowerCase()
        .includes(searchKeyword);

    const matchType = filters.bpjs_type
      ? item.bpjs_type === filters.bpjs_type
      : true;

    const matchPeriod = filters.period
      ? item.period === filters.period
      : true;

    return (
      matchSearch &&
      matchType &&
      matchPeriod
    );
  });

  // =====================================================
  // RESET FILTER
  // =====================================================

  const handleResetFilter = () => {
    setFilters({
      search: "",
      bpjs_type: "",
      period: "",
    });
  };

  // =====================================================
  // MODAL HANDLERS
  // =====================================================

  const handleOpenAddModal = () => {
    setSelectedData(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (item) => {
    setSelectedData(item);
    setShowFormModal(true);
  };

  const handleOpenDetailModal = (item) => {
    setSelectedData(item);
    setShowDetailModal(true);
  };

  const handleOpenDeleteModal = (item) => {
    setSelectedData(item);
    setShowDeleteModal(true);
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const handleFormSubmit = async (formData) => {
    try {
      const dataPayload = new FormData();

      Object.keys(formData).forEach((key) => {
        if (
          formData[key] !== null &&
          formData[key] !== undefined
        ) {
          dataPayload.append(
            key,
            formData[key]
          );
        }
      });

      if (selectedData) {
        dataPayload.append(
          "_method",
          "PUT"
        );

        const res =
          await apiFetch.post(
            `/finance/bpjs-payment-proofs/${selectedData.id}`,
            dataPayload,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        toast.success(
          res.data?.message ||
            "Bukti pembayaran BPJS berhasil diperbarui!"
        );
      } else {
        const res =
          await apiFetch.post(
            "/finance/bpjs-payment-proofs",
            dataPayload,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        toast.success(
          res.data?.message ||
            "Bukti pembayaran BPJS berhasil diupload!"
        );
      }

      setShowFormModal(false);
      setSelectedData(null);

      await fetchData();
    } catch (error) {
      console.error(
        "Gagal menyimpan data BPJS:",
        error?.response?.data ||
          error?.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Gagal menyimpan data BPJS."
      );
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeleteConfirm = async () => {
    if (!selectedData?.id) return;

    try {
      const res =
        await apiFetch.delete(
          `/finance/bpjs-payment-proofs/${selectedData.id}`
        );

      toast.success(
        res.data?.message ||
          "Data BPJS berhasil dihapus."
      );

      setShowDeleteModal(false);
      setSelectedData(null);

      await fetchData();
    } catch (error) {
      console.error(
        "Gagal menghapus data BPJS:",
        error?.response?.data ||
          error?.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Gagal menghapus data BPJS."
      );
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="bpjs-payment-page">

      {/* =================================================
          STYLE
      ================================================= */}

      <style>{`
        .bpjs-payment-page {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .bpjs-main-content {
          width: 100%;
          min-height: 100vh;
          min-width: 0;
          overflow-x: hidden;
        }

        @media (min-width: 768px) {
          .bpjs-main-content {
            margin-left: 250px;
            width: calc(100% - 250px);
          }
        }

        @media (max-width: 767.98px) {
          .bpjs-main-content {
            margin-left: 0;
            width: 100%;
          }
        }

        .bpjs-content {
          width: 100%;
          min-width: 0;
        }

        .bpjs-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .bpjs-table-wrapper table {
          min-width: 700px;
        }

        .bpjs-table-wrapper th,
        .bpjs-table-wrapper td {
          white-space: nowrap;
          vertical-align: middle;
        }

        @keyframes bpjsSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .bpjs-spin {
          animation: bpjsSpin 0.8s linear infinite;
        }
      `}</style>

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <SidebarFinance
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="bpjs-main-content">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <NavbarFinance
          title="Bukti Pembayaran BPJS"
          onToggleSidebar={toggleSidebar}
        />

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="p-3 p-md-4">

          <div className="bpjs-content">

            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                d-flex
                flex-column
                flex-md-row
                justify-content-between
                align-items-start
                align-items-md-center
                gap-3
                mb-4
              "
            >

              <div>

                <h4 className="fw-bold text-dark mb-1">
                  Bukti Pembayaran BPJS
                </h4>

                <p className="text-muted small mb-0">
                  Kelola bukti pembayaran BPJS
                  yang akan dikirim kepada pegawai.
                </p>

              </div>

              <button
                type="button"
                className="
                  btn
                  btn-primary
                  d-flex
                  align-items-center
                  gap-2
                  shadow-sm
                  px-3
                  py-2
                  rounded-3
                  flex-shrink-0
                "
                onClick={handleOpenAddModal}
              >
                <i className="bi bi-plus-lg"></i>

                <span className="fw-medium">
                  Upload Bukti BPJS
                </span>
              </button>

            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center">

                <LoadingSpinner />

              </div>

            ) : (

              <div className="d-flex flex-column gap-3 gap-md-4">

                {/* =================================================
                    STATISTICS
                ================================================= */}

                <BPJSPaymentStats
                  proofs={filteredData}
                />

                {/* =================================================
                    FILTER
                ================================================= */}

                <BPJSPaymentFilter
                  filters={filters}
                  setFilters={setFilters}
                  onReset={handleResetFilter}
                />

                {/* =================================================
                    TABLE
                ================================================= */}

                <div
                  className="
                    card
                    border-0
                    shadow-sm
                    rounded-4
                    overflow-hidden
                  "
                >

                  <div className="bpjs-table-wrapper">

                    {filteredData.length === 0 ? (

                      <div className="text-center text-muted py-5">

                        Tidak ada data bukti
                        pembayaran BPJS yang ditemukan.

                      </div>

                    ) : (

                      <BPJSPaymentTable
                        proofs={filteredData}
                        onDetail={
                          handleOpenDetailModal
                        }
                        onEdit={
                          handleOpenEditModal
                        }
                        onDelete={
                          handleOpenDeleteModal
                        }
                      />

                    )}

                  </div>

                </div>

              </div>

            )}

          </div>

        </main>

      </div>

      {/* =================================================
          FORM MODAL
      ================================================= */}

      <BPJSPaymentFormModal
        show={showFormModal}
        onClose={() =>
          setShowFormModal(false)
        }
        onSubmit={handleFormSubmit}
        editData={selectedData}
        employees={employees}
      />

      {/* =================================================
          DETAIL MODAL
      ================================================= */}

      <BPJSPaymentDetailModal
        show={showDetailModal}
        onClose={() =>
          setShowDetailModal(false)
        }
        data={selectedData}
      />

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {showDeleteModal &&
        selectedData && (
          <div
            className="
              modal
              fade
              show
              d-block
            "
            tabIndex="-1"
            style={{
              backgroundColor:
                "rgba(0,0,0,0.5)",
              zIndex: 1060,
            }}
          >

            <div
              className="
                modal-dialog
                modal-dialog-centered
                modal-sm
              "
            >

              <div
                className="
                  modal-content
                  border-0
                  shadow-lg
                  rounded-3
                  text-center
                  p-3
                "
              >

                <div className="modal-body">

                  <div className="text-danger mb-3">

                    <i
                      className="
                        bi
                        bi-exclamation-triangle
                        fs-1
                      "
                    ></i>

                  </div>

                  <h5 className="fw-bold mb-2">
                    Hapus Data?
                  </h5>

                  <p className="text-muted small mb-4">

                    Apakah Anda yakin ingin
                    menghapus bukti pembayaran{" "}

                    <strong>
                      {
                        selectedData.document_name ||
                        selectedData.employee?.name ||
                        "ini"
                      }
                    </strong>
                    ?

                    Tindakan ini tidak dapat
                    dibatalkan.

                  </p>

                  <div className="d-flex justify-content-center gap-2">

                    <button
                      type="button"
                      className="btn btn-light px-3 w-50"
                      onClick={() =>
                        setShowDeleteModal(false)
                      }
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger px-3 w-50"
                      onClick={
                        handleDeleteConfirm
                      }
                    >
                      Hapus
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default BPJSPaymentPage;