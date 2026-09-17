import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers3,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { apiFetch } from "../api/apiFetch";
import WorkShiftManagerModal from "../components/shift/WorkShiftManagerModal";

const EMPTY_FORM = {
  employee_id: "",
  shift_id: "",
  work_date: "",
  status: "work",
  notes: "",
};

const EMPTY_BULK_FORM = {
  employee_ids: [],
  shift_id: "",
  work_date: "",
  status: "work",
  notes: "",
};

const normalizeList = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const uniqueById = (items) => {
  const map = new Map();

  items.forEach((item) => {
    if (item?.id != null) {
      map.set(String(item.id), item);
    }
  });

  return [...map.values()];
};

const extractShiftOptions = (payload, schedules) => {
  const candidates = [
    payload?.shifts,
    payload?.meta?.shifts,
    payload?.data?.shifts,
    payload?.data?.meta?.shifts,
  ].find(Array.isArray);

  if (candidates?.length) {
    return uniqueById(candidates);
  }

  return uniqueById(
    schedules
      .map(
        (item) =>
          item?.shift ||
          item?.work_shift ||
          item?.workShift,
      )
      .filter(Boolean),
  );
};

const getEmployee = (schedule) => schedule?.employee || {};

const getShift = (schedule) =>
  schedule?.shift ||
  schedule?.work_shift ||
  schedule?.workShift ||
  {};

const formatTime = (value) => {
  if (!value) return "-";
  return String(value).slice(0, 5);
};

const formatDate = (value) => {
  if (!value) return "-";

  const text = String(value).slice(0, 10);
  const date = new Date(`${text}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const scheduleStatus = (value) =>
  String(value || "").toLowerCase();

/*
|--------------------------------------------------------------------------
| MODAL FRAME
|--------------------------------------------------------------------------
*/

const ModalFrame = ({
  title,
  subtitle,
  onClose,
  children,
  size = "lg",
}) => (
  <div
    className="shift-modal-backdrop"
    role="presentation"
  >
    <div
      className={`shift-modal-card shift-modal-${size}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="shift-modal-header">
        <div className="min-w-0">
          <h5 className="fw-bold mb-1">{title}</h5>

          {subtitle ? (
            <p className="text-muted small mb-0">
              {subtitle}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          className="btn btn-light rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: 38,
            height: 38,
          }}
          onClick={onClose}
          aria-label="Tutup"
        >
          <X size={18} />
        </button>
      </div>

      {children}
    </div>
  </div>
);

const AdminShiftSchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [formMode, setFormMode] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [selectedSchedule, setSelectedSchedule] =
    useState(null);

  const [detailLoading, setDetailLoading] = useState(false);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkForm, setBulkForm] =
    useState(EMPTY_BULK_FORM);
  const [bulkErrors, setBulkErrors] = useState({});
  const [bulkSubmitting, setBulkSubmitting] =
    useState(false);

  const [employeeSearch, setEmployeeSearch] =
    useState("");

  const [shiftManagerOpen, setShiftManagerOpen] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | FETCH WORK SHIFTS
  |--------------------------------------------------------------------------
  */

  const fetchWorkShifts = async () => {
    try {
      const response = await apiFetch.get(
        "/admin/work-shifts",
        {
          params: {
            active_only: 1,
          },
        },
      );

      setShiftOptions(
        uniqueById(normalizeList(response.data)),
      );
    } catch (err) {
      console.error(
        "Error fetching work shifts:",
        err,
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH EMPLOYEES
  |--------------------------------------------------------------------------
  */

  const fetchEmployees = async () => {
    try {
      const response = await apiFetch.get(
        "/admin/employees",
      );

      setEmployees(
        normalizeList(response.data),
      );
    } catch (err) {
      console.error(
        "Error fetching employees for shift schedule form:",
        err,
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH SCHEDULES
  |--------------------------------------------------------------------------
  */

  const fetchSchedules = async () => {
    setLoading(true);
    setError("");

    const params = {};

    if (statusFilter) {
      params.status = statusFilter;
    }

    if (shiftFilter) {
      params.shift_id = shiftFilter;
    }

    if (dateFilter) {
      params.start_date = dateFilter;
      params.end_date = dateFilter;
    }

    try {
      const response = await apiFetch.get(
        "/admin/shift-schedules",
        {
          params,
        },
      );

      const items = normalizeList(response.data);

      setSchedules(items);

      setShiftOptions((current) =>
        uniqueById([
          ...current,
          ...extractShiftOptions(
            response.data,
            items,
          ),
        ]),
      );
    } catch (err) {
      console.error(
        "Error fetching shift schedules:",
        err,
      );

      setError(
        err.response?.data?.message ||
          err.data?.message ||
          "Data shift schedule gagal dimuat. Silakan coba kembali.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchEmployees();
    fetchWorkShifts();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [
    statusFilter,
    shiftFilter,
    dateFilter,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    shiftFilter,
    dateFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | LOCK BODY SCROLL WHEN MODAL OPEN
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const modalOpen =
      formMode ||
      bulkOpen ||
      selectedSchedule ||
      shiftManagerOpen;

    if (modalOpen) {
      document.body.classList.add(
        "shift-modal-open",
      );
    } else {
      document.body.classList.remove(
        "shift-modal-open",
      );
    }

    return () => {
      document.body.classList.remove(
        "shift-modal-open",
      );
    };
  }, [
    formMode,
    bulkOpen,
    selectedSchedule,
    shiftManagerOpen,
  ]);

  /*
  |--------------------------------------------------------------------------
  | EMPLOYEE OPTIONS
  |--------------------------------------------------------------------------
  */

  const relationEmployees = useMemo(
    () =>
      uniqueById(
        schedules
          .map(getEmployee)
          .filter((item) => item?.id),
      ),
    [schedules],
  );

  const employeeOptions = useMemo(
    () =>
      uniqueById([
        ...employees,
        ...relationEmployees,
      ]),
    [employees, relationEmployees],
  );

  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredSchedules = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return schedules;
    }

    return schedules.filter((item) => {
      const employee = getEmployee(item);

      const haystack = [
        employee?.name,
        employee?.employee_code,
        employee?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [schedules, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredSchedules.length / pageSize,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginatedSchedules =
    filteredSchedules.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );

  /*
  |--------------------------------------------------------------------------
  | CREATE / EDIT
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
    });

    setFormErrors({});
  };

  const openCreate = () => {
    resetForm();

    setSelectedSchedule(null);
    setFormMode("create");
  };

  const closeForm = () => {
    setFormMode(null);
    setSelectedSchedule(null);

    resetForm();
  };

  /*
  |--------------------------------------------------------------------------
  | DETAIL
  |--------------------------------------------------------------------------
  */

  const readScheduleDetail = async (
    schedule,
    mode = "view",
  ) => {
    setDetailLoading(true);
    setSelectedSchedule(schedule);

    try {
      const response = await apiFetch.get(
        `/admin/shift-schedules/${schedule.id}`,
      );

      const detail =
        response.data?.data ?? schedule;

      setSelectedSchedule(detail);

      const relatedShift = getShift(detail);

      if (relatedShift?.id) {
        setShiftOptions((current) =>
          uniqueById([
            ...current,
            relatedShift,
          ]),
        );
      }

      if (mode === "edit") {
        setForm({
          employee_id: String(
            detail.employee_id ??
              getEmployee(detail)?.id ??
              "",
          ),

          shift_id: String(
            detail.shift_id ??
              relatedShift?.id ??
              "",
          ),

          work_date: String(
            detail.work_date ||
              detail.date ||
              "",
          ).slice(0, 10),

          status:
            detail.status || "work",

          notes:
            detail.notes || "",
        });

        setFormErrors({});
        setFormMode("edit");
      }
    } catch (err) {
      console.error(
        "Error fetching shift schedule detail:",
        err,
      );

      setSelectedSchedule(null);
    } finally {
      setDetailLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateForm = (data) => {
    const errors = {};

    if (!data.employee_id) {
      errors.employee_id = [
        "Employee wajib dipilih.",
      ];
    }

    if (!data.work_date) {
      errors.work_date = [
        "Tanggal kerja wajib dipilih.",
      ];
    }

    if (!data.status) {
      errors.status = [
        "Status wajib dipilih.",
      ];
    }

    if (
      data.status === "work" &&
      !data.shift_id
    ) {
      errors.shift_id = [
        "Work shift wajib dipilih untuk status work.",
      ];
    }

    return errors;
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT SINGLE
  |--------------------------------------------------------------------------
  */

  const submitForm = async (event) => {
    event.preventDefault();

    const localErrors =
      validateForm(form);

    if (Object.keys(localErrors).length) {
      setFormErrors(localErrors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    const payload = {
      employee_id: Number(
        form.employee_id,
      ),

      shift_id:
        form.status === "off"
          ? null
          : Number(form.shift_id),

      work_date: form.work_date,

      status: form.status,

      notes:
        form.notes.trim() || null,
    };

    try {
      if (formMode === "create") {
        await apiFetch.post(
          "/admin/shift-schedules",
          payload,
        );
      } else {
        await apiFetch.put(
          `/admin/shift-schedules/${selectedSchedule.id}`,
          payload,
        );
      }

      closeForm();

      await fetchSchedules();
    } catch (err) {
      if (
        err.response?.status === 422
      ) {
        setFormErrors(
          err.response?.data?.errors || {},
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const deleteSchedule = async (
    schedule,
  ) => {
    const employee =
      getEmployee(schedule);

    const shift =
      getShift(schedule);

    const confirmation =
      await Swal.fire({
        title: "Hapus shift schedule?",

        html: `
          <div class="text-muted">
            Jadwal <strong>${
              employee?.name ||
              "employee"
            }</strong>
            pada
            <strong>${formatDate(
              schedule.work_date,
            )}</strong>
            ${
              shift?.name
                ? ` (${shift.name})`
                : ""
            }
            akan dihapus.
          </div>
        `,

        icon: "warning",

        showCancelButton: true,

        confirmButtonText:
          "Ya, Hapus",

        cancelButtonText:
          "Batal",

        confirmButtonColor:
          "#dc3545",

        reverseButtons: true,

        customClass: {
          popup: "rounded-4",
        },
      });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      await apiFetch.delete(
        `/admin/shift-schedules/${schedule.id}`,
      );

      await fetchSchedules();
    } catch (err) {
      console.error(
        "Error deleting shift schedule:",
        err,
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | BULK
  |--------------------------------------------------------------------------
  */

  const openBulk = () => {
    setBulkForm({
      ...EMPTY_BULK_FORM,
      employee_ids: [],
    });

    setBulkErrors({});
    setEmployeeSearch("");
    setBulkOpen(true);
  };

  const toggleBulkEmployee = (
    employeeId,
  ) => {
    const id = String(employeeId);

    setBulkForm((prev) => ({
      ...prev,

      employee_ids:
        prev.employee_ids.includes(id)
          ? prev.employee_ids.filter(
              (item) => item !== id,
            )
          : [
              ...prev.employee_ids,
              id,
            ],
    }));
  };

  const submitBulk = async (
    event,
  ) => {
    event.preventDefault();

    const errors = {};

    if (
      !bulkForm.employee_ids.length
    ) {
      errors.employee_ids = [
        "Pilih minimal satu employee.",
      ];
    }

    if (!bulkForm.work_date) {
      errors.work_date = [
        "Tanggal kerja wajib dipilih.",
      ];
    }

    if (
      bulkForm.status === "work" &&
      !bulkForm.shift_id
    ) {
      errors.shift_id = [
        "Work shift wajib dipilih untuk status work.",
      ];
    }

    if (Object.keys(errors).length) {
      setBulkErrors(errors);
      return;
    }

    const mappings =
      bulkForm.employee_ids.map(
        (employeeId) => ({
          employee_id:
            Number(employeeId),

          shift_id:
            bulkForm.status === "off"
              ? null
              : Number(
                  bulkForm.shift_id,
                ),

          work_date:
            bulkForm.work_date,

          status:
            bulkForm.status,

          notes:
            bulkForm.notes.trim() ||
            null,
        }),
      );

    setBulkSubmitting(true);
    setBulkErrors({});

    try {
      await apiFetch.post(
        "/admin/shift-schedules/bulk",
        {
          mappings,
        },
      );

      setBulkOpen(false);

      setBulkForm({
        ...EMPTY_BULK_FORM,
        employee_ids: [],
      });

      await fetchSchedules();
    } catch (err) {
      if (
        err.response?.status === 422
      ) {
        setBulkErrors(
          err.response?.data?.errors || {},
        );
      }
    } finally {
      setBulkSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | VISIBLE EMPLOYEES
  |--------------------------------------------------------------------------
  */

  const visibleEmployees = useMemo(() => {
    const keyword =
      employeeSearch
        .trim()
        .toLowerCase();

    if (!keyword) {
      return employeeOptions;
    }

    return employeeOptions.filter(
      (employee) =>
        [
          employee.name,
          employee.employee_code,
          employee.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword),
    );
  }, [
    employeeOptions,
    employeeSearch,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SHIFT FIELD
  |--------------------------------------------------------------------------
  */

  const renderShiftField = (
    data,
    setter,
    errors,
    disabled = false,
  ) => {
    if (data.status === "off") {
      return (
        <div>
          <label className="form-label fw-semibold">
            Work Shift
          </label>

          <input
            className="form-control"
            value="Tidak diperlukan untuk status OFF"
            disabled
          />
        </div>
      );
    }

    if (shiftOptions.length) {
      return (
        <div>
          <label className="form-label fw-semibold">
            Work Shift
          </label>

          <select
            className={`form-select ${
              errors.shift_id
                ? "is-invalid"
                : ""
            }`}
            value={data.shift_id}
            disabled={disabled}
            onChange={(event) =>
              setter((prev) => ({
                ...prev,
                shift_id:
                  event.target.value,
              }))
            }
          >
            <option value="">
              Pilih shift
            </option>

            {shiftOptions.map(
              (shift) => (
                <option
                  key={shift.id}
                  value={shift.id}
                >
                  {shift.name ||
                    shift.code ||
                    `Shift #${shift.id}`}

                  {shift.jam_masuk &&
                  shift.jam_pulang
                    ? ` — ${formatTime(
                        shift.jam_masuk,
                      )}-${formatTime(
                        shift.jam_pulang,
                      )}`
                    : ""}
                </option>
              ),
            )}
          </select>

          {errors.shift_id ? (
            <div className="invalid-feedback d-block">
              {errors.shift_id[0]}
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div>
        <label className="form-label fw-semibold">
          Work Shift
        </label>

        <div className="alert alert-warning mb-0">
          Belum ada work shift aktif.
          Buat master shift terlebih
          dahulu melalui tombol{" "}
          <strong>
            Master Work Shift
          </strong>
          .
        </div>
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RETURN
  |--------------------------------------------------------------------------
  */

  return (
    <div className="shift-admin-page">

      <style>{`
        /* =========================================================
           MAIN PAGE
        ========================================================= */

        .shift-admin-page .surface-card {
          border: 1px solid #e6e8ec;
          border-radius: 16px;
          background: #fff;
        }

        .shift-admin-page
          .table
          > :not(caption)
          > *
          > * {
          padding: 0.9rem 0.85rem;
          vertical-align: middle;
        }

        .shift-admin-page
          .employee-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          background: #eef2ff;
          color: #4f46e5;
          flex-shrink: 0;
        }

        .shift-admin-page .filter-control {
          min-height: 42px;
        }

        /* =========================================================
           BODY LOCK
        ========================================================= */

        body.shift-modal-open {
          overflow: hidden !important;
        }

        /* =========================================================
           MODAL BACKDROP
        ========================================================= */

        .shift-modal-backdrop {
          position: fixed;
          inset: 0;

          /*
           * Lebih tinggi daripada sidebar/navbar
           * tetapi tidak menggunakan angka berlebihan.
           */
          z-index: 9999;

          background: rgba(
            15,
            23,
            42,
            0.58
          );

          backdrop-filter: blur(3px);

          /*
           * Padding aman supaya modal tidak
           * menempel ke tepi layar.
           */
          padding: 24px;

          overflow-y: auto;

          display: flex;

          align-items: center;
          justify-content: center;

          box-sizing: border-box;
        }

        /* =========================================================
           MODAL CARD
        ========================================================= */

        .shift-modal-card {
          position: relative;

          width: 100%;

          /*
           * Modal tidak boleh melebihi layar.
           */
          max-height: calc(100dvh - 48px);

          background: #fff;

          border-radius: 18px;

          box-shadow:
            0 24px 60px
            rgba(
              15,
              23,
              42,
              0.22
            );

          display: flex;
          flex-direction: column;

          overflow: hidden;

          /*
           * Jangan biarkan flex item
           * membuat modal keluar viewport.
           */
          min-height: 0;

          margin: auto;
        }

        .shift-modal-lg {
          max-width: 760px;
        }

        .shift-modal-xl {
          max-width: 980px;
        }

        /* =========================================================
           MODAL HEADER
        ========================================================= */

        .shift-modal-header {
          flex: 0 0 auto;

          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 16px;

          border-bottom: 1px solid #e9ecef;

          padding: 16px 20px;

          background: #fff;

          /*
           * Header selalu berada di atas
           * ketika body modal melakukan scroll.
           */
          position: relative;
          z-index: 2;
        }

        /* =========================================================
           MODAL BODY
        ========================================================= */

        .shift-modal-body {
          flex: 1 1 auto;

          min-height: 0;

          overflow-y: auto;

          overflow-x: hidden;

          padding: 16px 20px;

          -webkit-overflow-scrolling: touch;
        }

        /* =========================================================
           MODAL FOOTER
        ========================================================= */

        .shift-modal-footer {
          flex: 0 0 auto;

          border-top: 1px solid #e9ecef;

          padding: 16px 20px;

          background: #f8f9fa;

          position: relative;

          z-index: 2;
        }

        /* =========================================================
           FORM DI DALAM MODAL
        ========================================================= */

        .shift-modal-card form {
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .shift-modal-card form
          .shift-modal-body {
          min-height: 0;
        }

        /* =========================================================
           MOBILE
        ========================================================= */

        @media (max-width: 767.98px) {
          .shift-modal-backdrop {
            padding: 12px;
            align-items: center;
          }

          .shift-modal-card {
            max-height: calc(100dvh - 24px);
            border-radius: 16px;
          }

          .shift-modal-header {
            padding: 14px 16px;
          }

          .shift-modal-body {
            padding: 14px 16px;
          }

          .shift-modal-footer {
            padding: 14px 16px;
          }
        }

        /* =========================================================
           VERY SMALL SCREEN
        ========================================================= */

        @media (max-height: 650px) {
          .shift-modal-backdrop {
            align-items: flex-start;
          }

          .shift-modal-card {
            margin-top: 12px;
            margin-bottom: 12px;
          }
        }
      `}</style>

      {/* =========================================================
          PAGE HEADER
      ========================================================= */}

      <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3 mb-4">

        <div>
          <p className="text-primary fw-semibold small mb-1">
            Super Admin
          </p>

          <h3 className="fw-bold mb-1">
            Shift Schedules
          </h3>

          <p className="text-muted mb-0">
            Kelola mapping shift employee
            berdasarkan tanggal kerja.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">

          <button
            type="button"
            className="btn btn-outline-secondary rounded-3"
            onClick={fetchSchedules}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className="me-2"
            />

            Refresh
          </button>

          <button
            type="button"
            className="btn btn-outline-dark rounded-3"
            onClick={() =>
              setShiftManagerOpen(true)
            }
          >
            <Settings
              size={17}
              className="me-2"
            />

            Master Work Shift
          </button>

          <button
            type="button"
            className="btn btn-outline-primary rounded-3"
            onClick={openBulk}
          >
            <Layers3
              size={17}
              className="me-2"
            />

            Bulk Assign
          </button>

          <button
            type="button"
            className="btn btn-primary rounded-3"
            onClick={openCreate}
          >
            <Plus
              size={17}
              className="me-2"
            />

            Create Schedule
          </button>
        </div>
      </div>

      {/* =========================================================
          FILTER
      ========================================================= */}

      <div className="surface-card p-3 p-lg-4 mb-4 shadow-sm">

        <div className="row g-3">

          <div className="col-12 col-lg-5">
            <label className="form-label small fw-semibold text-muted">
              Search Employee
            </label>

            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search
                  size={17}
                  className="text-muted"
                />
              </span>

              <input
                type="search"
                className="form-control border-start-0 filter-control"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Nama, employee code, atau email"
              />
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-2">
            <label className="form-label small fw-semibold text-muted">
              Shift
            </label>

            <select
              className="form-select filter-control"
              value={shiftFilter}
              onChange={(event) =>
                setShiftFilter(
                  event.target.value,
                )
              }
            >
              <option value="">
                Semua shift
              </option>

              {shiftOptions.map(
                (shift) => (
                  <option
                    value={shift.id}
                    key={shift.id}
                  >
                    {shift.name ||
                      shift.code ||
                      `Shift #${shift.id}`}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="col-12 col-sm-6 col-lg-2">
            <label className="form-label small fw-semibold text-muted">
              Tanggal
            </label>

            <input
              type="date"
              className="form-control filter-control"
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="col-12 col-sm-6 col-lg-2">
            <label className="form-label small fw-semibold text-muted">
              Status
            </label>

            <select
              className="form-select filter-control"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
            >
              <option value="">
                Semua status
              </option>

              <option value="work">
                Work
              </option>

              <option value="off">
                OFF
              </option>
            </select>
          </div>

          <div className="col-12 col-sm-6 col-lg-1 d-flex align-items-end">

            <button
              type="button"
              className="btn btn-light border w-100 filter-control"
              onClick={() => {
                setSearch("");
                setShiftFilter("");
                setDateFilter("");
                setStatusFilter("");
              }}
              title="Reset filter"
            >
              <X size={17} />
            </button>

          </div>

        </div>
      </div>

      {/* =========================================================
          TABLE
      ========================================================= */}

      <div className="surface-card shadow-sm overflow-hidden">

        {loading ? (
          <div className="py-5 text-center">

            <div
              className="spinner-border text-primary mb-3"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <div className="fw-semibold">
              Memuat shift schedules...
            </div>
          </div>

        ) : error ? (
          <div className="text-center py-5 px-3">

            <div className="text-danger fs-2 mb-2">
              <i className="bi bi-exclamation-triangle" />
            </div>

            <h6 className="fw-bold">
              Data tidak dapat dimuat
            </h6>

            <p className="text-muted mb-3">
              {error}
            </p>

            <button
              className="btn btn-primary"
              onClick={fetchSchedules}
            >
              Coba Lagi
            </button>

          </div>

        ) : !filteredSchedules.length ? (
          <div className="text-center py-5 px-3">

            <CalendarDays
              size={48}
              className="text-secondary mb-3"
            />

            <h6 className="fw-bold">
              Belum ada shift schedule
            </h6>

            <p className="text-muted mb-3">
              {search ||
              statusFilter ||
              shiftFilter ||
              dateFilter
                ? "Tidak ada data yang sesuai dengan filter saat ini."
                : "Buat mapping shift pertama untuk employee."}
            </p>

            {!search &&
            !statusFilter &&
            !shiftFilter &&
            !dateFilter ? (
              <button
                className="btn btn-primary"
                onClick={openCreate}
              >
                <Plus
                  size={17}
                  className="me-2"
                />

                Create Schedule
              </button>
            ) : null}

          </div>

        ) : (
          <>
            <div className="table-responsive">

              <table className="table table-hover mb-0 align-middle">

                <thead className="table-light">
                  <tr>
                    <th>
                      Employee
                    </th>

                    <th>
                      Work Shift
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Start Time
                    </th>

                    <th>
                      End Time
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {paginatedSchedules.map(
                    (schedule) => {
                      const employee =
                        getEmployee(
                          schedule,
                        );

                      const shift =
                        getShift(
                          schedule,
                        );

                      const status =
                        scheduleStatus(
                          schedule.status,
                        );

                      const isOff =
                        status === "off" ||
                        status === "libur";

                      return (
                        <tr
                          key={
                            schedule.id
                          }
                        >

                          <td>
                            <div className="d-flex align-items-center gap-2">

                              <div className="employee-avatar">
                                {(
                                  employee?.name ||
                                  "E"
                                )
                                  .charAt(
                                    0,
                                  )
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">

                                <div className="fw-semibold text-dark">
                                  {employee?.name ||
                                    `Employee #${schedule.employee_id}`}
                                </div>

                                <small className="text-muted">
                                  {employee?.employee_code ||
                                    employee?.email ||
                                    "-"}
                                </small>

                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="fw-semibold">
                              {isOff
                                ? "OFF"
                                : shift?.name ||
                                  shift?.code ||
                                  `Shift #${
                                    schedule.shift_id ||
                                    "-"
                                  }`}
                            </div>

                            {!isOff &&
                            shift?.code &&
                            shift?.name ? (
                              <small className="text-muted">
                                {
                                  shift.code
                                }
                              </small>
                            ) : null}
                          </td>

                          <td>
                            {formatDate(
                              schedule.work_date ||
                                schedule.date,
                            )}
                          </td>

                          <td>
                            {isOff
                              ? "-"
                              : formatTime(
                                  shift?.jam_masuk ||
                                    shift?.start_time,
                                )}
                          </td>

                          <td>
                            {isOff
                              ? "-"
                              : formatTime(
                                  shift?.jam_pulang ||
                                    shift?.end_time,
                                )}
                          </td>

                          <td>
                            <span
                              className={`badge rounded-pill px-3 py-2 ${
                                isOff
                                  ? "bg-secondary-subtle text-secondary"
                                  : "bg-success-subtle text-success"
                              }`}
                            >
                              {isOff
                                ? "OFF"
                                : schedule.status ||
                                  "work"}
                            </span>
                          </td>

                          <td>
                            <div className="d-flex justify-content-end gap-1">

                              <button
                                type="button"
                                className="btn btn-sm btn-light border"
                                onClick={() =>
                                  readScheduleDetail(
                                    schedule,
                                    "view",
                                  )
                                }
                                title="View"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-light border"
                                onClick={() =>
                                  readScheduleDetail(
                                    schedule,
                                    "edit",
                                  )
                                }
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  deleteSchedule(
                                    schedule,
                                  )
                                }
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    },
                  )}

                </tbody>
              </table>
            </div>

            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 border-top px-3 px-lg-4 py-3">

              <small className="text-muted">
                Menampilkan{" "}
                {(currentPage - 1) *
                  pageSize +
                  1}
                -
                {Math.min(
                  currentPage *
                    pageSize,
                  filteredSchedules.length,
                )}{" "}
                dari{" "}
                {
                  filteredSchedules.length
                }{" "}
                schedule
              </small>

              {totalPages > 1 ? (
                <div className="d-flex align-items-center gap-2">

                  <button
                    className="btn btn-sm btn-light border"
                    disabled={
                      currentPage <= 1
                    }
                    onClick={() =>
                      setPage(
                        (prev) =>
                          Math.max(
                            1,
                            prev - 1,
                          ),
                      )
                    }
                  >
                    <ChevronLeft
                      size={16}
                    />
                  </button>

                  <span className="small fw-semibold">
                    {currentPage} /{" "}
                    {totalPages}
                  </span>

                  <button
                    className="btn btn-sm btn-light border"
                    disabled={
                      currentPage >=
                      totalPages
                    }
                    onClick={() =>
                      setPage(
                        (prev) =>
                          Math.min(
                            totalPages,
                            prev + 1,
                          ),
                      )
                    }
                  >
                    <ChevronRight
                      size={16}
                    />
                  </button>

                </div>
              ) : null}

            </div>
          </>
        )}

      </div>

      {/* =========================================================
          CREATE / EDIT MODAL
      ========================================================= */}

      {formMode ? (
        <ModalFrame
          title={
            formMode === "create"
              ? "Create Shift Schedule"
              : "Edit Shift Schedule"
          }
          subtitle="Field mengikuti contract EmployeeShiftSchedule backend."
          onClose={closeForm}
        >

          <form onSubmit={submitForm}>

            <div className="shift-modal-body">

              <div className="row g-3">

                <div className="col-12">

                  <label className="form-label fw-semibold">
                    Employee
                  </label>

                  <select
                    className={`form-select ${
                      formErrors.employee_id
                        ? "is-invalid"
                        : ""
                    }`}
                    value={
                      form.employee_id
                    }
                    onChange={(event) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          employee_id:
                            event.target
                              .value,
                        }),
                      )
                    }
                  >

                    <option value="">
                      Pilih employee
                    </option>

                    {employeeOptions.map(
                      (employee) => (
                        <option
                          key={
                            employee.id
                          }
                          value={
                            employee.id
                          }
                        >
                          {employee.name ||
                            `Employee #${employee.id}`}

                          {employee.employee_code
                            ? ` — ${employee.employee_code}`
                            : ""}
                        </option>
                      ),
                    )}

                  </select>

                  {formErrors.employee_id ? (
                    <div className="invalid-feedback d-block">
                      {
                        formErrors
                          .employee_id[0]
                      }
                    </div>
                  ) : null}

                </div>

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Date
                  </label>

                  <input
                    type="date"
                    className={`form-control ${
                      formErrors.work_date
                        ? "is-invalid"
                        : ""
                    }`}
                    value={
                      form.work_date
                    }
                    onChange={(event) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          work_date:
                            event.target
                              .value,
                        }),
                      )
                    }
                  />

                  {formErrors.work_date ? (
                    <div className="invalid-feedback d-block">
                      {
                        formErrors
                          .work_date[0]
                      }
                    </div>
                  ) : null}

                </div>

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Status
                  </label>

                  <select
                    className={`form-select ${
                      formErrors.status
                        ? "is-invalid"
                        : ""
                    }`}
                    value={
                      form.status
                    }
                    onChange={(event) =>
                      setForm(
                        (prev) => ({
                          ...prev,

                          status:
                            event.target
                              .value,

                          shift_id:
                            event.target
                              .value ===
                            "off"
                              ? ""
                              : prev.shift_id,
                        }),
                      )
                    }
                  >

                    <option value="work">
                      Work
                    </option>

                    <option value="off">
                      OFF
                    </option>

                  </select>

                </div>

                <div className="col-12">

                  {renderShiftField(
                    form,
                    setForm,
                    formErrors,
                    submitting,
                  )}

                </div>

                <div className="col-12">

                  <label className="form-label fw-semibold">
                    Notes
                  </label>

                  <textarea
                    rows="3"
                    className="form-control"
                    value={
                      form.notes
                    }
                    onChange={(event) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          notes:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder="Catatan opsional"
                    maxLength={255}
                  />

                </div>

              </div>

            </div>

            <div className="shift-modal-footer d-flex justify-content-end gap-2">

              <button
                type="button"
                className="btn btn-light border"
                onClick={
                  closeForm
                }
                disabled={
                  submitting
                }
              >
                Batal
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  submitting
                }
              >

                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Menyimpan...
                  </>
                ) : formMode ===
                  "create" ? (
                  "Create Schedule"
                ) : (
                  "Save Changes"
                )}

              </button>

            </div>

          </form>

        </ModalFrame>
      ) : null}

      {/* =========================================================
          BULK MODAL
      ========================================================= */}

      {bulkOpen ? (
        <ModalFrame
          title="Bulk Shift Schedule"
          subtitle="Pilih beberapa employee lalu kirim sebagai mappings[] ke bulk API."
          size="xl"
          onClose={() =>
            !bulkSubmitting &&
            setBulkOpen(false)
          }
        >

          <form onSubmit={submitBulk}>

            <div className="shift-modal-body">

              <div className="row g-4">

                {/* EMPLOYEES */}

                <div className="col-12 col-lg-6">

                  <label className="form-label fw-semibold">
                    Employees
                  </label>

                  <div className="input-group mb-2">

                    <span className="input-group-text bg-white border-end-0">
                      <Search size={16} />
                    </span>

                    <input
                      className="form-control border-start-0"
                      placeholder="Cari employee"
                      value={
                        employeeSearch
                      }
                      onChange={(event) =>
                        setEmployeeSearch(
                          event.target
                            .value,
                        )
                      }
                    />

                  </div>

                  <div
                    className="border rounded-3 p-2"
                    style={{
                      maxHeight: 285,
                      overflowY:
                        "auto",
                    }}
                  >

                    {!visibleEmployees.length ? (
                      <div className="text-muted small text-center py-4">
                        Employee tidak
                        ditemukan.
                      </div>
                    ) : (
                      visibleEmployees.map(
                        (employee) => {
                          const id =
                            String(
                              employee.id,
                            );

                          const checked =
                            bulkForm.employee_ids.includes(
                              id,
                            );

                          return (
                            <label
                              key={
                                employee.id
                              }
                              className="d-flex align-items-center gap-3 p-2 rounded-3 border-bottom"
                              style={{
                                cursor:
                                  "pointer",
                              }}
                            >

                              <input
                                type="checkbox"
                                className="form-check-input mt-0"
                                checked={
                                  checked
                                }
                                onChange={() =>
                                  toggleBulkEmployee(
                                    id,
                                  )
                                }
                              />

                              <div>

                                <div className="fw-semibold small">
                                  {employee.name ||
                                    `Employee #${employee.id}`}
                                </div>

                                <div
                                  className="text-muted"
                                  style={{
                                    fontSize:
                                      12,
                                  }}
                                >
                                  {employee.employee_code ||
                                    employee.email ||
                                    "-"}
                                </div>

                              </div>

                            </label>
                          );
                        },
                      )
                    )}

                  </div>

                  <div className="d-flex justify-content-between mt-2">

                    <small className="text-muted">
                      {
                        bulkForm
                          .employee_ids
                          .length
                      }{" "}
                      employee dipilih
                    </small>

                    {employeeOptions.length ? (
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-decoration-none"
                        onClick={() =>
                          setBulkForm(
                            (prev) => ({
                              ...prev,

                              employee_ids:
                                prev
                                  .employee_ids
                                  .length ===
                                employeeOptions.length
                                  ? []
                                  : employeeOptions.map(
                                      (
                                        employee,
                                      ) =>
                                        String(
                                          employee.id,
                                        ),
                                    ),
                            }),
                          )
                        }
                      >
                        {bulkForm
                          .employee_ids
                          .length ===
                        employeeOptions.length
                          ? "Clear all"
                          : "Select all"}
                      </button>
                    ) : null}

                  </div>

                  {bulkErrors.employee_ids ? (
                    <div className="text-danger small mt-1">
                      {
                        bulkErrors
                          .employee_ids[0]
                      }
                    </div>
                  ) : null}

                </div>

                {/* FORM BULK */}

                <div className="col-12 col-lg-6">

                  <div className="row g-3">

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Date
                      </label>

                      <input
                        type="date"
                        className={`form-control ${
                          bulkErrors.work_date
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          bulkForm.work_date
                        }
                        onChange={(event) =>
                          setBulkForm(
                            (prev) => ({
                              ...prev,
                              work_date:
                                event.target
                                  .value,
                            }),
                          )
                        }
                      />

                      {bulkErrors.work_date ? (
                        <div className="invalid-feedback d-block">
                          {
                            bulkErrors
                              .work_date[0]
                          }
                        </div>
                      ) : null}

                    </div>

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Status
                      </label>

                      <select
                        className="form-select"
                        value={
                          bulkForm.status
                        }
                        onChange={(event) =>
                          setBulkForm(
                            (prev) => ({
                              ...prev,

                              status:
                                event.target
                                  .value,

                              shift_id:
                                event.target
                                  .value ===
                                "off"
                                  ? ""
                                  : prev.shift_id,
                            }),
                          )
                        }
                      >

                        <option value="work">
                          Work
                        </option>

                        <option value="off">
                          OFF
                        </option>

                      </select>

                    </div>

                    <div className="col-12">

                      {renderShiftField(
                        bulkForm,
                        setBulkForm,
                        bulkErrors,
                        bulkSubmitting,
                      )}

                    </div>

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Notes
                      </label>

                      <textarea
                        rows="3"
                        className="form-control"
                        value={
                          bulkForm.notes
                        }
                        onChange={(event) =>
                          setBulkForm(
                            (prev) => ({
                              ...prev,
                              notes:
                                event.target
                                  .value,
                            }),
                          )
                        }
                        maxLength={255}
                        placeholder="Catatan opsional untuk seluruh mapping"
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* BULK FOOTER */}

            <div className="shift-modal-footer d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">

              <small className="text-muted">
                Payload:{" "}
                {
                  bulkForm
                    .employee_ids
                    .length
                }{" "}
                item dalam{" "}
                <code>
                  mappings[]
                </code>
              </small>

              <div className="d-flex justify-content-end gap-2">

                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() =>
                    setBulkOpen(
                      false,
                    )
                  }
                  disabled={
                    bulkSubmitting
                  }
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    bulkSubmitting
                  }
                >

                  {bulkSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Menyimpan...
                    </>
                  ) : (
                    "Save Bulk Schedule"
                  )}

                </button>

              </div>

            </div>

          </form>

        </ModalFrame>
      ) : null}

      {/* =========================================================
          DETAIL MODAL
      ========================================================= */}

      {selectedSchedule &&
      !formMode ? (
        <ModalFrame
          title="Shift Schedule Detail"
          subtitle={`Schedule #${selectedSchedule.id}`}
          onClose={() =>
            setSelectedSchedule(
              null,
            )
          }
        >

          <div className="shift-modal-body">

            {detailLoading ? (
              <div className="text-center py-5">

                <div className="spinner-border text-primary" />

              </div>
            ) : (
              (() => {
                const employee =
                  getEmployee(
                    selectedSchedule,
                  );

                const shift =
                  getShift(
                    selectedSchedule,
                  );

                const status =
                  scheduleStatus(
                    selectedSchedule.status,
                  );

                const isOff =
                  status === "off" ||
                  status === "libur";

                return (
                  <div className="row g-3">

                    <div className="col-12">

                      <div className="d-flex align-items-center gap-3 border rounded-4 p-3">

                        <div className="employee-avatar">
                          {(
                            employee?.name ||
                            "E"
                          )
                            .charAt(
                              0,
                            )
                            .toUpperCase()}
                        </div>

                        <div>

                          <small className="text-muted">
                            Employee
                          </small>

                          <div className="fw-bold">
                            {employee?.name ||
                              `Employee #${selectedSchedule.employee_id}`}
                          </div>

                          <small className="text-muted">
                            {employee?.employee_code ||
                              employee?.email ||
                              "-"}
                          </small>

                        </div>

                      </div>

                    </div>

                    <div className="col-12 col-md-6">

                      <div className="border rounded-4 p-3 h-100">

                        <small className="text-muted d-block mb-1">
                          Date
                        </small>

                        <div className="fw-semibold">
                          {formatDate(
                            selectedSchedule.work_date ||
                              selectedSchedule.date,
                          )}
                        </div>

                      </div>

                    </div>

                    <div className="col-12 col-md-6">

                      <div className="border rounded-4 p-3 h-100">

                        <small className="text-muted d-block mb-1">
                          Status
                        </small>

                        <span
                          className={`badge ${
                            isOff
                              ? "bg-secondary-subtle text-secondary"
                              : "bg-success-subtle text-success"
                          }`}
                        >
                          {isOff
                            ? "OFF"
                            : selectedSchedule.status ||
                              "work"}
                        </span>

                      </div>

                    </div>

                    <div className="col-12">

                      <div className="border rounded-4 p-3">

                        <small className="text-muted d-block mb-1">
                          Work Shift
                        </small>

                        <div className="fw-bold fs-5">
                          {isOff
                            ? "OFF"
                            : shift?.name ||
                              shift?.code ||
                              `Shift #${
                                selectedSchedule.shift_id ||
                                "-"
                              }`}
                        </div>

                        {!isOff ? (
                          <div className="text-muted mt-1">
                            {formatTime(
                              shift?.jam_masuk ||
                                shift?.start_time,
                            )}{" "}
                            -{" "}
                            {formatTime(
                              shift?.jam_pulang ||
                                shift?.end_time,
                            )}
                          </div>
                        ) : null}

                      </div>

                    </div>

                    {selectedSchedule.notes ? (
                      <div className="col-12">

                        <div className="border rounded-4 p-3 bg-light-subtle">

                          <small className="text-muted d-block mb-1">
                            Notes
                          </small>

                          <div>
                            {
                              selectedSchedule.notes
                            }
                          </div>

                        </div>

                      </div>
                    ) : null}

                  </div>
                );
              })()
            )}

          </div>

          <div className="shift-modal-footer d-flex justify-content-end gap-2">

            <button
              className="btn btn-light border"
              onClick={() =>
                setSelectedSchedule(
                  null,
                )
              }
            >
              Tutup
            </button>

            <button
              className="btn btn-primary"
              onClick={() =>
                readScheduleDetail(
                  selectedSchedule,
                  "edit",
                )
              }
            >
              <Pencil
                size={16}
                className="me-2"
              />

              Edit
            </button>

          </div>

        </ModalFrame>
      ) : null}

      {/* =========================================================
          MASTER WORK SHIFT
      ========================================================= */}

      <WorkShiftManagerModal
        open={shiftManagerOpen}
        onClose={() =>
          setShiftManagerOpen(
            false,
          )
        }
        onChanged={async () => {
          await fetchWorkShifts();
          await fetchSchedules();
        }}
      />

    </div>
  );
};

export default AdminShiftSchedulesPage;

