import React, { useEffect, useMemo, useState } from "react";
import {apiFetch} from "../api/apiFetch";

const EMPTY_FORM = {
  inventory_code: "",
  name: "",
  category: "",
  description: "",
  quantity: 1,
  condition: "good",
  location: "",
  status: "available",
  image: null,
};

const CONDITION_OPTIONS = [
  { value: "good", label: "Baik" },
  { value: "minor_damage", label: "Rusak Ringan" },
  { value: "major_damage", label: "Rusak Berat" },
  { value: "broken", label: "Rusak Total" },
];

const STATUS_OPTIONS = [
  { value: "available", label: "Tersedia" },
  { value: "in_use", label: "Sedang Digunakan" },
  { value: "maintenance", label: "Maintenance" },
  { value: "unavailable", label: "Tidak Tersedia" },
];

export default function InventoryPage() {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [pagination, setPagination] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState(null);

  const [toast, setToast] = useState(null);

  // =====================================================
  // TOAST
  // =====================================================

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchInventories = async (page = 1) => {
    try {
      setLoading(true);

      const response = await apiFetch.get("/admin/inventories", {
        params: {
          page,
          search: search || undefined,
          condition: conditionFilter || undefined,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
        },
      });

      const result = response.data;

      if (result?.data?.data) {
        setInventories(result.data.data);
        setPagination(result.data);
      } else if (Array.isArray(result?.data)) {
        setInventories(result.data);
        setPagination(null);
      } else {
        setInventories([]);
        setPagination(null);
      }
    } catch (error) {
      console.error("Error mengambil inventaris:", error);

      showToast(
        error?.response?.data?.message ||
          "Gagal mengambil data inventaris.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories(1);
  }, [conditionFilter, statusFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventories(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // =====================================================
  // CATEGORY
  // =====================================================

  const categories = useMemo(() => {
    const categoryList = inventories
      .map((item) => item.category)
      .filter(Boolean);

    return [...new Set(categoryList)].sort();
  }, [inventories]);

  // =====================================================
  // FORM
  // =====================================================

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setImagePreview(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (inventory) => {
    setEditingId(inventory.id);

    setForm({
      inventory_code: inventory.inventory_code || "",
      name: inventory.name || "",
      category: inventory.category || "",
      description: inventory.description || "",
      quantity: inventory.quantity ?? 1,
      condition: inventory.condition || "good",
      location: inventory.location || "",
      status: inventory.status || "available",
      image: null,
    });

    if (inventory.image) {
      setImagePreview(getImageUrl(inventory.image));
    } else {
      setImagePreview(null);
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    resetForm();
  };

  // =====================================================
  // INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("File harus berupa gambar.", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Ukuran gambar maksimal 2 MB.", "error");
      return;
    }

    setForm((previous) => ({
      ...previous,
      image: file,
    }));

    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setImagePreview(null);

    setForm((previous) => ({
      ...previous,
      image: null,
    }));
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.inventory_code.trim()) {
      showToast("Kode inventaris wajib diisi.", "error");
      return;
    }

    if (!form.name.trim()) {
      showToast("Nama barang wajib diisi.", "error");
      return;
    }

    if (Number(form.quantity) < 0) {
      showToast("Jumlah barang tidak boleh negatif.", "error");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "inventory_code",
        form.inventory_code.trim(),
      );

      formData.append("name", form.name.trim());

      formData.append("category", form.category.trim());

      formData.append(
        "description",
        form.description.trim(),
      );

      formData.append("quantity", form.quantity);

      formData.append("condition", form.condition);

      formData.append(
        "location",
        form.location.trim(),
      );

      formData.append("status", form.status);

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingId) {
        formData.append("_method", "PUT");

        await apiFetch.post(
          `/admin/inventories/${editingId}`,
          formData,
        );

        showToast("Inventaris berhasil diperbarui.");
      } else {
        await apiFetch.post(
          "/admin/inventories",
          formData,
        );

        showToast("Inventaris berhasil ditambahkan.");
      }

      setModalOpen(false);
      resetForm();

      await fetchInventories(
        pagination?.current_page || 1,
      );
    } catch (error) {
      console.error(
        "Error menyimpan inventaris:",
        error,
      );

      const errors = error?.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors)[0];

        showToast(
          Array.isArray(firstError)
            ? firstError[0]
            : "Data tidak valid.",
          "error",
        );
      } else {
        showToast(
          error?.response?.data?.message ||
            "Gagal menyimpan inventaris.",
          "error",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (inventory) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus "${inventory.name}"?`,
    );

    if (!confirmed) return;

    try {
      setDeleting(inventory.id);

      await apiFetch.delete(
        `/admin/inventories/${inventory.id}`,
      );

      showToast("Inventaris berhasil dihapus.");

      await fetchInventories(
        pagination?.current_page || 1,
      );
    } catch (error) {
      console.error(
        "Error menghapus inventaris:",
        error,
      );

      showToast(
        error?.response?.data?.message ||
          "Gagal menghapus inventaris.",
        "error",
      );
    } finally {
      setDeleting(null);
    }
  };

  // =====================================================
  // DETAIL
  // =====================================================

  const openDetail = (inventory) => {
    setSelectedInventory(inventory);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setSelectedInventory(null);
    setDetailOpen(false);
  };

  // =====================================================
  // HELPER
  // =====================================================

  function getImageUrl(image) {
    if (!image) return null;

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    if (image.startsWith("/storage/")) {
      return `http://127.0.0.1:8000${image}`;
    }

    if (image.startsWith("storage/")) {
      return `http://127.0.0.1:8000/${image}`;
    }

    return `http://127.0.0.1:8000/storage/${image}`;
  }

  const conditionLabel = (value) => {
    return (
      CONDITION_OPTIONS.find(
        (item) => item.value === value,
      )?.label ||
      value ||
      "-"
    );
  };

  const statusLabel = (value) => {
    return (
      STATUS_OPTIONS.find(
        (item) => item.value === value,
      )?.label ||
      value ||
      "-"
    );
  };

  const conditionClass = (value) => {
    switch (value) {
      case "good":
        return "inv-badge success";

      case "minor_damage":
        return "inv-badge warning";

      case "major_damage":
        return "inv-badge danger";

      case "broken":
        return "inv-badge dark";

      default:
        return "inv-badge";
    }
  };

  const statusClass = (value) => {
    switch (value) {
      case "available":
        return "inv-badge success";

      case "in_use":
        return "inv-badge primary";

      case "maintenance":
        return "inv-badge warning";

      case "unavailable":
        return "inv-badge danger";

      default:
        return "inv-badge";
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalInventory =
    pagination?.total ?? inventories.length;

  const totalAvailable = inventories.filter(
    (item) => item.status === "available",
  ).length;

  const totalBroken = inventories.filter(
    (item) =>
      item.condition === "broken" ||
      item.condition === "major_damage",
  ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <style>{`

        /* =================================================
           INVENTORY PAGE
        ================================================= */

        .inventory-page {
          min-height: calc(100vh - 70px);
          background: #f6f8fc;
          color: #1f2937;
        }

        .inventory-content {
          padding: 28px 32px 40px;
        }

        /* =================================================
           HEADER
        ================================================= */

        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 24px;
        }

        .inventory-breadcrumb {
          color: #94a3b8;
          font-size: 12px;
          margin-bottom: 7px;
        }

        .inventory-header h1 {
          margin: 0;
          color: #111827;
          font-size: 27px;
          font-weight: 750;
        }

        .inventory-header p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .inventory-add-btn {
          border: none;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          padding: 11px 16px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          box-shadow: 0 7px 18px rgba(37, 99, 235, 0.18);
        }

        .inventory-add-btn:hover {
          background: #1d4ed8;
        }

        /* =================================================
           STATISTICS
        ================================================= */

        .inventory-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 18px;
        }

        .inventory-stat {
          background: white;
          border: 1px solid #e8edf4;
          border-radius: 14px;
          padding: 17px;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .inventory-stat-icon {
          width: 43px;
          height: 43px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          flex-shrink: 0;
        }

        .inventory-stat-icon.blue {
          background: #eff6ff;
        }

        .inventory-stat-icon.green {
          background: #ecfdf5;
        }

        .inventory-stat-icon.red {
          background: #fef2f2;
        }

        .inventory-stat small {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-bottom: 3px;
        }

        .inventory-stat strong {
          color: #111827;
          font-size: 21px;
        }

        /* =================================================
           FILTER
        ================================================= */

        .inventory-filter {
          background: white;
          border: 1px solid #e8edf4;
          border-radius: 14px;
          padding: 13px;
          display: grid;
          grid-template-columns: 1fr 180px 180px 180px;
          gap: 9px;
          margin-bottom: 18px;
        }

        .inventory-search {
          height: 41px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          display: flex;
          align-items: center;
          padding: 0 11px;
          background: #f8fafc;
        }

        .inventory-search span {
          color: #94a3b8;
          margin-right: 7px;
        }

        .inventory-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 12px;
        }

        .inventory-filter select {
          height: 41px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          padding: 0 10px;
          background: #f8fafc;
          color: #475569;
          font-size: 12px;
          outline: none;
        }

        /* =================================================
           TABLE CARD
        ================================================= */

        .inventory-card {
          background: white;
          border: 1px solid #e8edf4;
          border-radius: 15px;
          overflow: hidden;
        }

        .inventory-card-header {
          padding: 18px 20px;
          border-bottom: 1px solid #edf1f5;
        }

        .inventory-card-header h2 {
          margin: 0;
          font-size: 16px;
          color: #111827;
        }

        .inventory-card-header p {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 11px;
        }

        .inventory-table-wrapper {
          overflow-x: auto;
        }

        .inventory-table {
          width: 100%;
          min-width: 930px;
          border-collapse: collapse;
        }

        .inventory-table th {
          padding: 12px 17px;
          background: #f8fafc;
          color: #64748b;
          font-size: 10px;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .inventory-table td {
          padding: 14px 17px;
          border-top: 1px solid #f0f2f5;
          color: #475569;
          font-size: 12px;
        }

        .inventory-table tbody tr:hover {
          background: #fafcff;
        }

        /* =================================================
           INVENTORY ITEM
        ================================================= */

        .inventory-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .inventory-item-image {
          width: 41px;
          height: 41px;
          border-radius: 9px;
          background: #f1f5f9;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }

        .inventory-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .inventory-item-name strong {
          display: block;
          color: #1e293b;
          font-size: 12px;
        }

        .inventory-item-name small {
          display: block;
          margin-top: 3px;
          color: #94a3b8;
          font-size: 10px;
        }

        /* =================================================
           BADGE
        ================================================= */

        .inv-badge {
          display: inline-flex;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .inv-badge.success {
          color: #15803d;
          background: #ecfdf5;
        }

        .inv-badge.warning {
          color: #c2410c;
          background: #fff7ed;
        }

        .inv-badge.danger {
          color: #dc2626;
          background: #fef2f2;
        }

        .inv-badge.primary {
          color: #1d4ed8;
          background: #eff6ff;
        }

        .inv-badge.dark {
          color: #475569;
          background: #f1f5f9;
        }

        /* =================================================
           ACTIONS
        ================================================= */

        .inventory-actions {
          display: flex;
          gap: 5px;
        }

        .inventory-action {
          width: 31px;
          height: 31px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 7px;
          cursor: pointer;
        }

        .inventory-action:hover {
          background: #f8fafc;
        }

        .inventory-action.delete:hover {
          color: #dc2626;
          background: #fef2f2;
        }

        .inventory-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* =================================================
           EMPTY
        ================================================= */

        .inventory-empty {
          padding: 65px 20px;
          text-align: center;
        }

        .inventory-empty-icon {
          font-size: 34px;
          margin-bottom: 10px;
        }

        .inventory-empty h3 {
          margin: 0;
          font-size: 16px;
          color: #1e293b;
        }

        .inventory-empty p {
          color: #94a3b8;
          font-size: 12px;
        }

        .inventory-empty button {
          border: 0;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          padding: 9px 13px;
          cursor: pointer;
          font-size: 12px;
        }

        /* =================================================
           LOADING
        ================================================= */

        .inventory-loading {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 12px;
        }

        .inventory-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #e2e8f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: inventorySpin 0.8s linear infinite;
        }

        @keyframes inventorySpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =================================================
           PAGINATION
        ================================================= */

        .inventory-pagination {
          padding: 14px 18px;
          border-top: 1px solid #edf1f5;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .inventory-pagination button {
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 7px;
          padding: 7px 10px;
          cursor: pointer;
          font-size: 11px;
        }

        .inventory-pagination button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .inventory-pagination span {
          color: #64748b;
          font-size: 11px;
        }

        /* =================================================
           MODAL
        ================================================= */

        .inventory-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.52);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }

        .inventory-modal {
          width: min(720px, 100%);
          max-height: calc(100vh - 36px);
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 70px rgba(15, 23, 42, 0.22);
        }

        .inventory-modal-header {
          padding: 18px 20px;
          border-bottom: 1px solid #edf1f5;
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .inventory-modal-header h2 {
          margin: 0;
          font-size: 18px;
          color: #111827;
        }

        .inventory-modal-header p {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 11px;
        }

        .inventory-close {
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 8px;
          background: #f8fafc;
          font-size: 20px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .inventory-form {
          padding: 20px;
        }

        .inventory-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .inventory-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .inventory-field.full {
          grid-column: 1 / -1;
        }

        .inventory-field label {
          color: #334155;
          font-size: 11px;
          font-weight: 700;
        }

        .inventory-field label span {
          color: #dc2626;
        }

        .inventory-field input,
        .inventory-field select,
        .inventory-field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #dbe2ea;
          border-radius: 8px;
          padding: 9px 10px;
          outline: none;
          font-family: inherit;
          font-size: 12px;
        }

        .inventory-field input,
        .inventory-field select {
          height: 40px;
        }

        .inventory-field textarea {
          resize: vertical;
        }

        .inventory-field input:focus,
        .inventory-field select:focus,
        .inventory-field textarea:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px #eff6ff;
        }

        /* =================================================
           UPLOAD
        ================================================= */

        .inventory-upload {
          border: 1.5px dashed #cbd5e1;
          border-radius: 10px;
          min-height: 125px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f8fafc;
          cursor: pointer;
          overflow: hidden;
        }

        .inventory-upload input {
          display: none;
        }

        .inventory-upload-content {
          text-align: center;
          color: #64748b;
        }

        .inventory-upload-content strong {
          display: block;
          font-size: 12px;
        }

        .inventory-upload-content small {
          font-size: 10px;
          color: #94a3b8;
        }

        .inventory-preview {
          width: 150px;
          padding: 8px;
          text-align: center;
        }

        .inventory-preview img {
          width: 135px;
          height: 95px;
          object-fit: cover;
          border-radius: 8px;
        }

        .inventory-remove-image {
          border: 0;
          background: #fef2f2;
          color: #dc2626;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 10px;
          cursor: pointer;
          margin-top: 5px;
        }

        /* =================================================
           MODAL FOOTER
        ================================================= */

        .inventory-modal-footer {
          padding: 14px 20px;
          border-top: 1px solid #edf1f5;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .inventory-btn-secondary,
        .inventory-btn-primary {
          border: 0;
          border-radius: 8px;
          padding: 9px 14px;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
        }

        .inventory-btn-secondary {
          background: #f1f5f9;
          color: #475569;
        }

        .inventory-btn-primary {
          background: #2563eb;
          color: white;
        }

        .inventory-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* =================================================
           DETAIL
        ================================================= */

        .inventory-detail {
          width: min(650px, 100%);
          background: white;
          border-radius: 16px;
          overflow: hidden;
        }

        .inventory-detail-body {
          padding: 20px;
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 20px;
        }

        .inventory-detail-image {
          width: 180px;
          height: 180px;
          border-radius: 12px;
          background: #f1f5f9;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 40px;
        }

        .inventory-detail-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .inventory-detail-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .inventory-detail-info small {
          display: block;
          color: #94a3b8;
          font-size: 10px;
          margin-bottom: 4px;
        }

        .inventory-detail-info strong {
          color: #1e293b;
          font-size: 12px;
        }

        .inventory-description {
          grid-column: 1 / -1;
          border-top: 1px solid #edf1f5;
          padding-top: 15px;
        }

        .inventory-description small {
          color: #94a3b8;
          font-size: 10px;
        }

        .inventory-description p {
          margin: 5px 0 0;
          color: #475569;
          font-size: 12px;
          line-height: 1.6;
        }

        /* =================================================
           TOAST
        ================================================= */

        .inventory-toast {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 11000;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 15px;
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.15);
          font-size: 12px;
        }

        .inventory-toast.error {
          color: #dc2626;
        }

        .inventory-toast.success {
          color: #15803d;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1200px) {
          .inventory-stats {
            grid-template-columns: 1fr 1fr;
          }

          .inventory-filter {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .inventory-content {
            padding: 20px 15px 30px;
          }

          .inventory-header {
            flex-direction: column;
            align-items: stretch;
          }

          .inventory-add-btn {
            width: 100%;
          }

          .inventory-stats {
            grid-template-columns: 1fr 1fr;
          }

          .inventory-filter {
            grid-template-columns: 1fr;
          }

          .inventory-form-grid {
            grid-template-columns: 1fr;
          }

          .inventory-field.full {
            grid-column: auto;
          }

          .inventory-detail-body {
            grid-template-columns: 1fr;
          }

          .inventory-detail-image {
            width: 100%;
            height: 210px;
          }
        }

        @media (max-width: 480px) {
          .inventory-stats {
            grid-template-columns: 1fr;
          }

          .inventory-detail-info {
            grid-template-columns: 1fr;
          }

          .inventory-pagination {
            gap: 10px;
          }

          .inventory-pagination span {
            text-align: center;
          }

          .inventory-toast {
            left: 15px;
            right: 15px;
            bottom: 15px;
          }
        }

      `}</style>

      {/* =====================================================
          INVENTORY CONTENT
      ===================================================== */}

      <div className="inventory-page">
        <main className="inventory-content">

          {/* HEADER */}

          <div className="inventory-header">
            <div>
              <div className="inventory-breadcrumb">
                Superadmin / Inventaris
              </div>

              <h1>Manajemen Inventaris</h1>

              <p>
                Kelola alat dan perlengkapan kerja perusahaan.
              </p>
            </div>

            <button
              type="button"
              className="inventory-add-btn"
              onClick={openAddModal}
            >
              + Tambah Inventaris
            </button>
          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="inventory-stats">

            {/* TOTAL */}

            <div className="inventory-stat">
              <div className="inventory-stat-icon blue">
                📦
              </div>

              <div>
                <small>Total Inventaris</small>

                <strong>{totalInventory}</strong>
              </div>
            </div>

            {/* TERSEDIA */}

            <div className="inventory-stat">
              <div className="inventory-stat-icon green">
                ✓
              </div>

              <div>
                <small>Tersedia</small>

                <strong>{totalAvailable}</strong>
              </div>
            </div>

            {/* RUSAK */}

            <div className="inventory-stat">
              <div className="inventory-stat-icon red">
                ⚠
              </div>

              <div>
                <small>Rusak</small>

                <strong>{totalBroken}</strong>
              </div>
            </div>

          </div>

          {/* =================================================
              FILTER
          ================================================= */}

          <div className="inventory-filter">

            <div className="inventory-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Cari kode, nama, kategori, lokasi..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="">
                Semua Kategori
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            <select
              value={conditionFilter}
              onChange={(event) =>
                setConditionFilter(event.target.value)
              }
            >
              <option value="">
                Semua Kondisi
              </option>

              {CONDITION_OPTIONS.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">
                Semua Status
              </option>

              {STATUS_OPTIONS.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="inventory-card">

            <div className="inventory-card-header">
              <h2>Daftar Inventaris</h2>

              <p>
                Data alat dan perlengkapan kerja.
              </p>
            </div>

            {loading ? (
              <div className="inventory-loading">
                <div className="inventory-spinner" />

                <p>
                  Memuat data inventaris...
                </p>
              </div>
            ) : inventories.length === 0 ? (
              <div className="inventory-empty">

                <div className="inventory-empty-icon">
                  📦
                </div>

                <h3>
                  Belum ada inventaris
                </h3>

                <p>
                  Belum ada alat atau perlengkapan
                  yang tercatat.
                </p>

                <button
                  type="button"
                  onClick={openAddModal}
                >
                  + Tambah Inventaris
                </button>

              </div>
            ) : (
              <div className="inventory-table-wrapper">

                <table className="inventory-table">

                  <thead>
                    <tr>
                      <th>Inventaris</th>
                      <th>Kategori</th>
                      <th>Jumlah</th>
                      <th>Kondisi</th>
                      <th>Lokasi</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>

                    {inventories.map((inventory) => (
                      <tr key={inventory.id}>

                        <td>
                          <div className="inventory-item">

                            <div className="inventory-item-image">

                              {getImageUrl(
                                inventory.image,
                              ) ? (
                                <img
                                  src={getImageUrl(
                                    inventory.image,
                                  )}
                                  alt={inventory.name}
                                />
                              ) : (
                                "📦"
                              )}

                            </div>

                            <div className="inventory-item-name">

                              <strong>
                                {inventory.name}
                              </strong>

                              <small>
                                {inventory.inventory_code}
                              </small>

                            </div>

                          </div>
                        </td>

                        <td>
                          {inventory.category || "-"}
                        </td>

                        <td>
                          <strong>
                            {inventory.quantity}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={conditionClass(
                              inventory.condition,
                            )}
                          >
                            {conditionLabel(
                              inventory.condition,
                            )}
                          </span>
                        </td>

                        <td>
                          {inventory.location || "-"}
                        </td>

                        <td>
                          <span
                            className={statusClass(
                              inventory.status,
                            )}
                          >
                            {statusLabel(
                              inventory.status,
                            )}
                          </span>
                        </td>

                        <td>

                          <div className="inventory-actions">

                            <button
                              type="button"
                              className="inventory-action"
                              title="Detail"
                              onClick={() =>
                                openDetail(inventory)
                              }
                            >
                              👁
                            </button>

                            <button
                              type="button"
                              className="inventory-action"
                              title="Edit"
                              onClick={() =>
                                openEditModal(
                                  inventory,
                                )
                              }
                            >
                              ✎
                            </button>

                            <button
                              type="button"
                              className="inventory-action delete"
                              title="Hapus"
                              disabled={
                                deleting ===
                                inventory.id
                              }
                              onClick={() =>
                                handleDelete(
                                  inventory,
                                )
                              }
                            >
                              {deleting ===
                              inventory.id
                                ? "..."
                                : "🗑"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

            {/* PAGINATION */}

            {pagination &&
              pagination.last_page > 1 && (
                <div className="inventory-pagination">

                  <button
                    type="button"
                    disabled={
                      pagination.current_page === 1
                    }
                    onClick={() =>
                      fetchInventories(
                        pagination.current_page - 1,
                      )
                    }
                  >
                    ← Sebelumnya
                  </button>

                  <span>
                    Halaman{" "}
                    <strong>
                      {pagination.current_page}
                    </strong>{" "}
                    dari{" "}
                    <strong>
                      {pagination.last_page}
                    </strong>
                  </span>

                  <button
                    type="button"
                    disabled={
                      pagination.current_page ===
                      pagination.last_page
                    }
                    onClick={() =>
                      fetchInventories(
                        pagination.current_page + 1,
                      )
                    }
                  >
                    Berikutnya →
                  </button>

                </div>
              )}

          </div>

        </main>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {modalOpen && (
        <div
          className="inventory-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="inventory-modal">

            <div className="inventory-modal-header">

              <div>

                <h2>
                  {editingId
                    ? "Edit Inventaris"
                    : "Tambah Inventaris"}
                </h2>

                <p>
                  {editingId
                    ? "Perbarui data inventaris."
                    : "Tambahkan alat atau perlengkapan kerja."}
                </p>

              </div>

              <button
                type="button"
                className="inventory-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              className="inventory-form"
              onSubmit={handleSubmit}
            >

              <div className="inventory-form-grid">

                {/* KODE */}

                <div className="inventory-field">

                  <label>
                    Kode Inventaris{" "}
                    <span>*</span>
                  </label>

                  <input
                    name="inventory_code"
                    value={form.inventory_code}
                    onChange={handleChange}
                    placeholder="INV-00001"
                  />

                </div>

                {/* NAMA */}

                <div className="inventory-field">

                  <label>
                    Nama Barang{" "}
                    <span>*</span>
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Laptop Lenovo"
                  />

                </div>

                {/* KATEGORI */}

                <div className="inventory-field">

                  <label>
                    Kategori
                  </label>

                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Elektronik"
                  />

                </div>

                {/* JUMLAH */}

                <div className="inventory-field">

                  <label>
                    Jumlah{" "}
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                  />

                </div>

                {/* KONDISI */}

                <div className="inventory-field">

                  <label>
                    Kondisi{" "}
                    <span>*</span>
                  </label>

                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                  >

                    {CONDITION_OPTIONS.map(
                      (item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      ),
                    )}

                  </select>

                </div>

                {/* STATUS */}

                <div className="inventory-field">

                  <label>
                    Status{" "}
                    <span>*</span>
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >

                    {STATUS_OPTIONS.map(
                      (item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      ),
                    )}

                  </select>

                </div>

                {/* LOKASI */}

                <div className="inventory-field full">

                  <label>
                    Lokasi
                  </label>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Ruang IT"
                  />

                </div>

                {/* DESKRIPSI */}

                <div className="inventory-field full">

                  <label>
                    Deskripsi
                  </label>

                  <textarea
                    rows="4"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Keterangan barang..."
                  />

                </div>

                {/* IMAGE */}

                <div className="inventory-field full">

                  <label>
                    Foto Barang
                  </label>

                  <label className="inventory-upload">

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />

                    {imagePreview ? (
                      <div className="inventory-preview">

                        <img
                          src={imagePreview}
                          alt="Preview"
                        />

                        <button
                          type="button"
                          className="inventory-remove-image"
                          onClick={removeImage}
                        >
                          Hapus Foto
                        </button>

                      </div>
                    ) : (
                      <div className="inventory-upload-content">

                        <div
                          style={{
                            fontSize: 27,
                            marginBottom: 5,
                          }}
                        >
                          📷
                        </div>

                        <strong>
                          Upload foto barang
                        </strong>

                        <small>
                          JPG, PNG, WEBP ·
                          Maks. 2 MB
                        </small>

                      </div>
                    )}

                  </label>

                </div>

              </div>

              {/* FOOTER */}

              <div className="inventory-modal-footer">

                <button
                  type="button"
                  className="inventory-btn-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="inventory-btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Tambah Inventaris"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {detailOpen &&
        selectedInventory && (
          <div
            className="inventory-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeDetail();
              }
            }}
          >

            <div className="inventory-detail">

              <div className="inventory-modal-header">

                <div>

                  <h2>
                    Detail Inventaris
                  </h2>

                  <p>
                    Informasi lengkap barang.
                  </p>

                </div>

                <button
                  type="button"
                  className="inventory-close"
                  onClick={closeDetail}
                >
                  ×
                </button>

              </div>

              <div className="inventory-detail-body">

                {/* IMAGE */}

                <div className="inventory-detail-image">

                  {getImageUrl(
                    selectedInventory.image,
                  ) ? (
                    <img
                      src={getImageUrl(
                        selectedInventory.image,
                      )}
                      alt={
                        selectedInventory.name
                      }
                    />
                  ) : (
                    "📦"
                  )}

                </div>

                {/* INFO */}

                <div className="inventory-detail-info">

                  <div>
                    <small>
                      Kode Inventaris
                    </small>

                    <strong>
                      {
                        selectedInventory.inventory_code
                      }
                    </strong>
                  </div>

                  <div>
                    <small>
                      Nama
                    </small>

                    <strong>
                      {selectedInventory.name}
                    </strong>
                  </div>

                  <div>
                    <small>
                      Kategori
                    </small>

                    <strong>
                      {selectedInventory.category ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <small>
                      Jumlah
                    </small>

                    <strong>
                      {selectedInventory.quantity}
                    </strong>
                  </div>

                  <div>
                    <small>
                      Kondisi
                    </small>

                    <span
                      className={conditionClass(
                        selectedInventory.condition,
                      )}
                    >
                      {conditionLabel(
                        selectedInventory.condition,
                      )}
                    </span>
                  </div>

                  <div>
                    <small>
                      Status
                    </small>

                    <span
                      className={statusClass(
                        selectedInventory.status,
                      )}
                    >
                      {statusLabel(
                        selectedInventory.status,
                      )}
                    </span>
                  </div>

                  <div>
                    <small>
                      Lokasi
                    </small>

                    <strong>
                      {selectedInventory.location ||
                        "-"}
                    </strong>
                  </div>

                  <div className="inventory-description">

                    <small>
                      Deskripsi
                    </small>

                    <p>
                      {selectedInventory.description ||
                        "Tidak ada deskripsi."}
                    </p>

                  </div>

                </div>

              </div>

              {/* FOOTER */}

              <div className="inventory-modal-footer">

                <button
                  type="button"
                  className="inventory-btn-secondary"
                  onClick={closeDetail}
                >
                  Tutup
                </button>

                <button
                  type="button"
                  className="inventory-btn-primary"
                  onClick={() => {
                    const inventory =
                      selectedInventory;

                    closeDetail();
                    openEditModal(inventory);
                  }}
                >
                  ✎ Edit
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div
          className={`inventory-toast ${toast.type}`}
        >
          {toast.type === "success"
            ? "✓ "
            : "⚠ "}

          {toast.message}
        </div>
      )}
    </>
  );
}