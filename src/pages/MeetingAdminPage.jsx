import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {apiFetch} from "../api/apiFetch";

const MEETING_URL = "/admin/meetings";
const PARTICIPANT_URL = "/admin/meetings/participants";
const TEAM_URL = "/admin/teams";

const EMPTY_FORM = {
  title: "",
  meeting_date: "",
  start_time: "",
  end_time: "",
  location: "",
  agenda: "",
  minutes: "",
  status: "scheduled",
  participants: [],
  team_id: "",
};

const MeetingAdminPage = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [meetings, setMeetings] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [finances, setFinances] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingMeeting, setEditingMeeting] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [deletingMeeting, setDeletingMeeting] = useState(null);

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    participants: [],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // NORMALIZE PARTICIPANT
  // =========================================================

  const getPersonId = useCallback((person) => {
    if (!person) return null;

    const possibleId =
      person.id ??
      person.employee_id ??
      person.supervisor_id ??
      person.finance_id ??
      person.user_id;

    if (
      possibleId === undefined ||
      possibleId === null ||
      possibleId === ""
    ) {
      return null;
    }

    return Number(possibleId);
  }, []);

  const getPersonName = useCallback(
    (person) => {
      if (!person) return "-";

      return (
        person.name ||
        person.full_name ||
        person.employee_name ||
        person.user?.name ||
        person.user?.full_name ||
        `ID ${getPersonId(person) ?? "-"}`
      );
    },
    [getPersonId]
  );

  // =========================================================
  // LOAD MEETINGS
  // =========================================================

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch.get(MEETING_URL);

      const data = response.data?.data;

      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data rapat:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil data rapat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // LOAD PARTICIPANTS
  // =========================================================

  const fetchParticipants = useCallback(async () => {
    try {
      setError("");

      const response = await apiFetch.get(
        PARTICIPANT_URL
      );

      const data = response.data?.data || {};

      const employeeData = Array.isArray(data.employees)
        ? data.employees
        : [];

      const supervisorData = Array.isArray(data.supervisors)
        ? data.supervisors
        : [];

      const financeData = Array.isArray(data.finances)
        ? data.finances
        : [];

      setEmployees(employeeData);
      setSupervisors(supervisorData);
      setFinances(financeData);

      console.log("Data peserta:", {
        employees: employeeData,
        supervisors: supervisorData,
        finances: financeData,
      });
    } catch (err) {
      console.error("Gagal mengambil peserta:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil daftar peserta rapat."
      );
    }
  }, []);

  // =========================================================
  // LOAD TEAMS
  // =========================================================

  const fetchTeams = useCallback(async () => {
    try {
      setError("");

      const response = await apiFetch.get(
        TEAM_URL
      );

      const data = response.data?.data;

      setTeams(Array.isArray(data) ? data : []);

      console.log("Data team:", data);
    } catch (err) {
      console.error("Gagal mengambil data team:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil daftar team."
      );
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchMeetings();
    fetchParticipants();
    fetchTeams();
  }, [
    fetchMeetings,
    fetchParticipants,
    fetchTeams,
  ]);

  // =========================================================
  // HELPERS
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(date));
    } catch {
      return date;
    }
  };

  const formatTime = (time) => {
    if (!time) return "-";

    return String(time).substring(0, 5);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "scheduled":
        return "Terjadwal";

      case "completed":
        return "Selesai";

      case "cancelled":
        return "Dibatalkan";

      default:
        return status || "-";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-primary-subtle text-primary";

      case "completed":
        return "bg-success-subtle text-success";

      case "cancelled":
        return "bg-danger-subtle text-danger";

      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const getParticipantName = (participant) => {
    if (!participant) return "-";

    const data =
      participant.participant ||
      participant.user ||
      participant.employee ||
      participant.supervisor ||
      participant.finance;

    if (!data) {
      return `ID ${participant.participant_id ?? "-"}`;
    }

    return (
      data.name ||
      data.full_name ||
      data.employee_name ||
      `ID ${participant.participant_id ?? "-"}`
    );
  };

  const getParticipantType = (participant) => {
    if (!participant) return "";

    const type = String(
      participant.participant_type ||
        participant.type ||
        ""
    ).toLowerCase();

    if (type.includes("employee")) {
      return "employee";
    }

    if (type.includes("supervisor")) {
      return "supervisor";
    }

    if (type.includes("finance")) {
      return "finance";
    }

    return "";
  };

  // =========================================================
  // TEAM MEMBER TYPE
  // =========================================================

  const getTeamMemberType = useCallback(
    (teamMember) => {
      if (!teamMember) return "";

      const modelType = String(
        teamMember.member_type ||
          teamMember.member?.member_type ||
          ""
      ).toLowerCase();

      if (modelType.includes("employee")) {
        return "employee";
      }

      if (modelType.includes("supervisor")) {
        return "supervisor";
      }

      if (modelType.includes("finance")) {
        return "finance";
      }

      return "";
    },
    []
  );

  // =========================================================
  // APPLY TEAM PARTICIPANTS
  // =========================================================

  const applyTeamParticipants = useCallback(
    (teamId) => {
      const selectedTeam = teams.find(
        (team) =>
          Number(team.id) === Number(teamId)
      );

      if (!selectedTeam) {
        setForm((prev) => ({
          ...prev,
          team_id: "",
        }));

        return;
      }

      const members = Array.isArray(
        selectedTeam.members
      )
        ? selectedTeam.members
        : [];

      const teamParticipants = members
        .map((teamMember) => {
          const type =
            getTeamMemberType(teamMember);

          const id = Number(
            teamMember.member_id ??
              teamMember.member?.id
          );

          if (
            !type ||
            !Number.isFinite(id)
          ) {
            return null;
          }

          return {
            id,
            type,
          };
        })
        .filter(Boolean);

      setForm((prev) => {
        /*
         * Team otomatis mengatur Employee dan Supervisor.
         * Finance yang sebelumnya dipilih manual tetap dipertahankan.
         */
        const financeParticipants =
          prev.participants.filter(
            (participant) =>
              String(
                participant.type
              ).toLowerCase() === "finance"
          );

        const combinedParticipants = [
          ...teamParticipants,
          ...financeParticipants,
        ];

        const uniqueParticipants =
          combinedParticipants.filter(
            (participant, index, array) =>
              index ===
              array.findIndex(
                (item) =>
                  Number(item.id) ===
                    Number(participant.id) &&
                  String(
                    item.type
                  ).toLowerCase() ===
                    String(
                      participant.type
                    ).toLowerCase()
              )
          );

        return {
          ...prev,
          team_id: String(teamId),
          participants:
            uniqueParticipants,
        };
      });

      setError("");
    },
    [teams, getTeamMemberType]
  );

  // =========================================================
  // FILTER MEETINGS
  // =========================================================

  const filteredMeetings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return meetings.filter((meeting) => {
      const matchesSearch =
        !keyword ||
        meeting.title?.toLowerCase().includes(keyword) ||
        meeting.location?.toLowerCase().includes(keyword) ||
        meeting.agenda?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        meeting.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [meetings, search, statusFilter]);

  // =========================================================
  // FORM INPUT
  // =========================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // TEAM INPUT
  // =========================================================

  const handleTeamChange = (event) => {
    const { value } = event.target;

    if (!value) {
      setForm((prev) => ({
        ...prev,
        team_id: "",
      }));

      return;
    }

    applyTeamParticipants(value);
  };

  // =========================================================
  // OPEN CREATE
  // =========================================================

  const openCreateModal = () => {
    setEditingMeeting(null);

    setForm({
      ...EMPTY_FORM,
      participants: [],
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEditModal = (meeting) => {
    setEditingMeeting(meeting);

    const participants =
      Array.isArray(meeting.participants)
        ? meeting.participants
            .map((participant) => {
              const id = Number(
                participant.participant_id ??
                  participant.id ??
                  participant.participant?.id
              );

              const type =
                getParticipantType(participant);

              if (
                !Number.isFinite(id) ||
                !type
              ) {
                return null;
              }

              return {
                id,
                type,
              };
            })
            .filter(Boolean)
        : [];

    setForm({
      title: meeting.title || "",

      meeting_date: meeting.meeting_date
        ? String(meeting.meeting_date).substring(0, 10)
        : "",

      start_time: formatTime(meeting.start_time),

      end_time: meeting.end_time
        ? formatTime(meeting.end_time)
        : "",

      location: meeting.location || "",
      agenda: meeting.agenda || "",
      minutes: meeting.minutes || "",
      status: meeting.status || "scheduled",

      /*
       * Meeting saat ini belum menyimpan team_id.
       * Jadi ketika edit, team dikosongkan dan
       * peserta lama tetap dipertahankan.
       */
      team_id: "",

      participants,
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =========================================================
  // CLOSE FORM MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingMeeting(null);

    setForm({
      ...EMPTY_FORM,
      participants: [],
    });
  };

  // =========================================================
  // CHECK SELECTED
  // =========================================================

  const isParticipantSelected = useCallback(
    (id, type) => {
      const numericId = Number(id);

      if (!Number.isFinite(numericId)) {
        return false;
      }

      return form.participants.some(
        (item) =>
          Number(item.id) === numericId &&
          String(item.type).toLowerCase() ===
            String(type).toLowerCase()
      );
    },
    [form.participants]
  );

  // =========================================================
  // TOGGLE SINGLE PARTICIPANT
  // =========================================================

  const toggleParticipant = (person, type) => {
    const id = getPersonId(person);

    if (id === null) {
      console.warn(
        "Peserta tidak memiliki ID:",
        person
      );
      return;
    }

    const normalizedType = String(type).toLowerCase();

    setForm((prev) => {
      const exists = prev.participants.some(
        (item) =>
          Number(item.id) === Number(id) &&
          String(item.type).toLowerCase() ===
            normalizedType
      );

      if (exists) {
        return {
          ...prev,

          participants:
            prev.participants.filter(
              (item) =>
                !(
                  Number(item.id) === Number(id) &&
                  String(item.type).toLowerCase() ===
                    normalizedType
                )
            ),
        };
      }

      return {
        ...prev,

        participants: [
          ...prev.participants,
          {
            id: Number(id),
            type: normalizedType,
          },
        ],
      };
    });
  };

  // =========================================================
  // REMOVE PARTICIPANT
  // =========================================================

  const removeParticipant = (id, type) => {
    setForm((prev) => ({
      ...prev,

      participants:
        prev.participants.filter(
          (item) =>
            !(
              Number(item.id) === Number(id) &&
              String(item.type).toLowerCase() ===
                String(type).toLowerCase()
            )
        ),
    }));
  };

  // =========================================================
  // TOGGLE ALL PARTICIPANTS
  // =========================================================

  const toggleAllParticipants = (data, type) => {
    if (!Array.isArray(data) || data.length === 0) {
      return;
    }

    const normalizedType =
      String(type).toLowerCase();

    const validPeople = data
      .map((person) => ({
        person,
        id: getPersonId(person),
      }))
      .filter(
        (item) =>
          item.id !== null &&
          Number.isFinite(item.id)
      );

    if (validPeople.length === 0) {
      console.warn(
        `Tidak ada ID valid untuk ${normalizedType}`,
        data
      );

      setError(
        `Data ${normalizedType} tidak memiliki ID peserta yang valid.`
      );

      return;
    }

    setForm((prev) => {
      const allSelected = validPeople.every(
        ({ id }) =>
          prev.participants.some(
            (selected) =>
              Number(selected.id) === Number(id) &&
              String(
                selected.type
              ).toLowerCase() === normalizedType
          )
      );

      if (allSelected) {
        return {
          ...prev,

          participants:
            prev.participants.filter(
              (selected) =>
                String(
                  selected.type
                ).toLowerCase() !== normalizedType
            ),
        };
      }

      const otherParticipants =
        prev.participants.filter(
          (selected) =>
            String(
              selected.type
            ).toLowerCase() !== normalizedType
        );

      const newParticipants =
        validPeople.map(({ id }) => ({
          id: Number(id),
          type: normalizedType,
        }));

      return {
        ...prev,

        participants: [
          ...otherParticipants,
          ...newParticipants,
        ],
      };
    });
  };

  // =========================================================
  // COUNT SELECTED BY TYPE
  // =========================================================

  const getSelectedCountByType = (type) => {
    return form.participants.filter(
      (item) =>
        String(item.type).toLowerCase() ===
        String(type).toLowerCase()
    ).length;
  };

  // =========================================================
  // CHECK ALL SELECTED
  // =========================================================

  const isAllSelected = (data, type) => {
    if (!Array.isArray(data) || data.length === 0) {
      return false;
    }

    const validPeople = data
      .map((person) => getPersonId(person))
      .filter(
        (id) =>
          id !== null &&
          Number.isFinite(id)
      );

    if (validPeople.length === 0) {
      return false;
    }

    return validPeople.every((id) =>
      form.participants.some(
        (selected) =>
          Number(selected.id) === Number(id) &&
          String(
            selected.type
          ).toLowerCase() ===
            String(type).toLowerCase()
      )
    );
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Judul rapat wajib diisi.");
      return;
    }

    if (!form.meeting_date) {
      setError("Tanggal rapat wajib diisi.");
      return;
    }

    if (!form.start_time) {
      setError("Jam mulai wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      /*
       * team_id hanya digunakan di frontend
       * untuk memilih anggota Team.
       *
       * Backend MeetingController tetap menerima
       * peserta dalam bentuk participants seperti sebelumnya.
       */
      const payload = {
        title: form.title.trim(),
        meeting_date: form.meeting_date,
        start_time: form.start_time,
        end_time: form.end_time || null,
        location:
          form.location.trim() || null,
        agenda:
          form.agenda.trim() || null,
        minutes:
          form.minutes.trim() || null,
        status: form.status,

        participants:
          form.participants.map((item) => ({
            id: Number(item.id),
            type: item.type,
          })),
      };

      console.log(
        "Payload meeting:",
        payload
      );

      if (editingMeeting) {
        await apiFetch.put(
          `${MEETING_URL}/${editingMeeting.id}`,
          payload
        );

        setSuccess(
          "Rapat berhasil diperbarui."
        );
      } else {
        await apiFetch.post(
          MEETING_URL,
          payload
        );

        setSuccess(
          "Rapat berhasil dibuat."
        );
      }

      setShowModal(false);
      setEditingMeeting(null);

      setForm({
        ...EMPTY_FORM,
        participants: [],
      });

      await fetchMeetings();
    } catch (err) {
      console.error(
        "Gagal menyimpan rapat:",
        err
      );

      const validationErrors =
        err.response?.data?.errors;

      if (validationErrors) {
        const firstError =
          Object.values(
            validationErrors
          )[0]?.[0];

        setError(
          firstError ||
            "Data rapat tidak valid."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Gagal menyimpan rapat."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // OPEN DELETE CONFIRMATION MODAL
  // =========================================================

  const openDeleteModal = (meeting) => {
    if (deleting) return;

    setError("");
    setSuccess("");

    setDeletingMeeting(meeting);
    setShowDeleteModal(true);
  };

  // =========================================================
  // CLOSE DELETE CONFIRMATION MODAL
  // =========================================================

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setDeletingMeeting(null);
  };

  // =========================================================
  // DELETE MEETING
  // =========================================================

  const handleDelete = async () => {
    if (!deletingMeeting?.id) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await apiFetch.delete(
        `${MEETING_URL}/${deletingMeeting.id}`
      );

      setShowDeleteModal(false);
      setDeletingMeeting(null);

      setSuccess(
        "Rapat berhasil dihapus."
      );

      await fetchMeetings();
    } catch (err) {
      console.error(
        "Gagal menghapus rapat:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Gagal menghapus rapat."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // DETAIL
  // =========================================================

  const openDetailModal = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedMeeting(null);
    setShowDetailModal(false);
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    return {
      total: meetings.length,

      scheduled: meetings.filter(
        (item) =>
          item.status === "scheduled"
      ).length,

      completed: meetings.filter(
        (item) =>
          item.status === "completed"
      ).length,

      cancelled: meetings.filter(
        (item) =>
          item.status === "cancelled"
      ).length,
    };
  }, [meetings]);

  // =========================================================
  // RENDER PARTICIPANT CATEGORY
  // =========================================================

  const renderParticipantCategory = (
    title,
    data,
    type
  ) => {
    const allSelected =
      isAllSelected(data, type);

    const selectedCount =
      getSelectedCountByType(type);

    return (
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <div className="fw-semibold text-dark">
              {title}
            </div>

            <div className="text-secondary small">
              {selectedCount} dipilih dari{" "}
              {data.length} orang
            </div>
          </div>

          <button
            type="button"
            className={`btn btn-sm ${
              allSelected
                ? "btn-outline-danger"
                : "btn-outline-primary"
            }`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              toggleAllParticipants(
                data,
                type
              );
            }}
            disabled={data.length === 0}
          >
            {allSelected
              ? "Batal Semua"
              : "Pilih Semua"}
          </button>
        </div>

        {data.length === 0 ? (
          <div className="border rounded-3 p-3 text-secondary small">
            Tidak ada {title.toLowerCase()}.
          </div>
        ) : (
          <div className="row g-2">
            {data.map((person, index) => {
              const id =
                getPersonId(person);

              const selected =
                id !== null &&
                isParticipantSelected(
                  id,
                  type
                );

              return (
                <div
                  className="col-12 col-md-6"
                  key={`${type}-${id ?? index}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleParticipant(
                        person,
                        type
                      )
                    }
                    className={`w-100 text-start border rounded-3 p-2 d-flex align-items-center gap-2 ${
                      selected
                        ? "border-primary bg-primary-subtle"
                        : "bg-white"
                    }`}
                    style={{
                      transition:
                        "all .15s ease",
                    }}
                  >
                    <span
                      className={`rounded d-flex align-items-center justify-content-center ${
                        selected
                          ? "bg-primary text-white"
                          : "bg-white border text-transparent"
                      }`}
                      style={{
                        width: 22,
                        height: 22,
                        minWidth: 22,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {selected ? "✓" : ""}
                    </span>

                    <span
                      className="text-truncate small fw-medium"
                      style={{
                        color: "#334155",
                      }}
                    >
                      {getPersonName(person)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="container-fluid py-3 py-md-4 px-2 px-md-4">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">
            Rapat
          </h3>

          <p className="text-secondary small mb-0">
            Kelola jadwal dan kegiatan rapat
            internal perusahaan.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary rounded-3 px-3 shadow-sm"
          onClick={openCreateModal}
        >
          <span className="me-2">+</span>
          Buat Rapat
        </button>
      </div>

      {/* =====================================================
          ALERT
      ====================================================== */}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show small"
          role="alert"
        >
          <strong>Error:</strong>{" "}
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show small"
          role="alert"
        >
          <strong>Berhasil:</strong>{" "}
          {success}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          />
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Rapat",
            value: statistics.total,
            color: "primary",
          },
          {
            label: "Terjadwal",
            value: statistics.scheduled,
            color: "info",
          },
          {
            label: "Selesai",
            value: statistics.completed,
            color: "success",
          },
          {
            label: "Dibatalkan",
            value: statistics.cancelled,
            color: "danger",
          },
        ].map((item) => (
          <div
            className="col-6 col-xl-3"
            key={item.label}
          >
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body p-3 p-md-4">
                <div className="text-secondary small fw-semibold">
                  {item.label}
                </div>

                <div className="fs-3 fw-bold text-dark mt-2">
                  {item.value}
                </div>

                <div className="mt-3">
                  <div
                    className={`bg-${item.color} rounded-pill`}
                    style={{
                      height: 3,
                      width: 30,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          FILTER
      ====================================================== */}

      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-12 col-md">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  🔎
                </span>

                <input
                  type="text"
                  className="form-control border-start-0 shadow-none"
                  placeholder="Cari judul, lokasi, atau agenda..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="col-12 col-md-auto">
              <select
                className="form-select shadow-none"
                style={{
                  minWidth: 180,
                }}
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  Semua Status
                </option>

                <option value="scheduled">
                  Terjadwal
                </option>

                <option value="completed">
                  Selesai
                </option>

                <option value="cancelled">
                  Dibatalkan
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
            />

            <div className="text-secondary small">
              Memuat data rapat...
            </div>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div
              className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: 55,
                height: 55,
                fontSize: 23,
              }}
            >
              📅
            </div>

            <h6 className="fw-semibold mb-1">
              Belum ada data rapat
            </h6>

            <p className="text-secondary small mb-0">
              Belum terdapat rapat yang sesuai
              dengan filter.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3 py-3 small text-secondary">
                    Rapat
                  </th>

                  <th className="py-3 small text-secondary">
                    Tanggal
                  </th>

                  <th className="py-3 small text-secondary">
                    Waktu
                  </th>

                  <th className="py-3 small text-secondary">
                    Lokasi
                  </th>

                  <th className="py-3 small text-secondary">
                    Peserta
                  </th>

                  <th className="py-3 small text-secondary">
                    Status
                  </th>

                  <th className="py-3 small text-secondary text-end pe-3">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMeetings.map(
                  (meeting) => (
                    <tr key={meeting.id}>
                      <td className="px-3">
                        <div className="fw-semibold text-dark">
                          {meeting.title}
                        </div>

                        {meeting.agenda && (
                          <div
                            className="text-secondary small text-truncate mt-1"
                            style={{
                              maxWidth: 260,
                            }}
                          >
                            {meeting.agenda}
                          </div>
                        )}
                      </td>

                      <td className="small text-nowrap">
                        {formatDate(
                          meeting.meeting_date
                        )}
                      </td>

                      <td className="small text-nowrap">
                        {formatTime(
                          meeting.start_time
                        )}

                        {meeting.end_time &&
                          ` - ${formatTime(
                            meeting.end_time
                          )}`}
                      </td>

                      <td>
                        <div
                          className="small text-truncate"
                          style={{
                            maxWidth: 160,
                          }}
                        >
                          {meeting.location ||
                            "-"}
                        </div>
                      </td>

                      <td className="small text-nowrap">
                        👥{" "}
                        {meeting.participants
                          ?.length || 0}
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill ${getStatusBadge(
                            meeting.status
                          )}`}
                        >
                          {getStatusLabel(
                            meeting.status
                          )}
                        </span>
                      </td>

                      <td className="text-end pe-3">
                        <div className="d-flex justify-content-end gap-1">
                          {/* DETAIL */}

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-2"
                            onClick={() =>
                              openDetailModal(
                                meeting
                              )
                            }
                            title="Detail"
                          >
                            👁
                          </button>

                          {/* EDIT */}

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning rounded-2"
                            onClick={() =>
                              openEditModal(
                                meeting
                              )
                            }
                            title="Edit"
                            disabled={deleting}
                          >
                            ✏️
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-2"
                            onClick={() =>
                              openDeleteModal(
                                meeting
                              )
                            }
                            title="Hapus"
                            disabled={deleting}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor:
              "rgba(15, 23, 42, .55)",
            zIndex: 1055,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            style={{
              maxWidth: "900px",
              width: "calc(100% - 24px)",
              margin: "12px auto",
            }}
          >
            <div
              className="modal-content border-0 shadow-lg rounded-4 overflow-hidden"
              style={{
                maxHeight: "90vh",
              }}
            >
              {/* HEADER */}

              <div className="modal-header px-3 px-md-4 py-3 border-bottom">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                    style={{
                      width: 42,
                      height: 42,
                    }}
                  >
                    📅
                  </div>

                  <div>
                    <h5 className="modal-title fw-bold mb-0">
                      {editingMeeting
                        ? "Edit Rapat"
                        : "Buat Rapat"}
                    </h5>

                    <div className="text-secondary small">
                      {editingMeeting
                        ? "Perbarui informasi rapat"
                        : "Buat jadwal rapat baru"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={saving}
                />
              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="d-flex flex-column"
                style={{
                  minHeight: 0,
                }}
              >
                <div
                  className="modal-body px-3 px-md-4"
                  style={{
                    overflowY: "auto",
                    maxHeight:
                      "calc(90vh - 145px)",
                  }}
                >
                  {/* BASIC */}

                  <div className="row g-3">

                    {/* TITLE */}

                    <div className="col-12">
                      <label className="form-label small fw-semibold">
                        Judul Rapat *
                      </label>

                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={form.title}
                        onChange={
                          handleInputChange
                        }
                        placeholder="Contoh: Rapat Evaluasi Payroll"
                        required
                      />
                    </div>

                    {/* DATE */}

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">
                        Tanggal *
                      </label>

                      <input
                        type="date"
                        name="meeting_date"
                        className="form-control"
                        value={
                          form.meeting_date
                        }
                        onChange={
                          handleInputChange
                        }
                        required
                      />
                    </div>

                    {/* START */}

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">
                        Jam Mulai *
                      </label>

                      <input
                        type="time"
                        name="start_time"
                        className="form-control"
                        value={
                          form.start_time
                        }
                        onChange={
                          handleInputChange
                        }
                        required
                      />
                    </div>

                    {/* END */}

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">
                        Jam Selesai
                      </label>

                      <input
                        type="time"
                        name="end_time"
                        className="form-control"
                        value={
                          form.end_time
                        }
                        onChange={
                          handleInputChange
                        }
                      />
                    </div>

                    {/* STATUS */}

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">
                        Status *
                      </label>

                      <select
                        name="status"
                        className="form-select"
                        value={form.status}
                        onChange={
                          handleInputChange
                        }
                      >
                        <option value="scheduled">
                          Terjadwal
                        </option>

                        <option value="completed">
                          Selesai
                        </option>

                        <option value="cancelled">
                          Dibatalkan
                        </option>
                      </select>
                    </div>

                    {/* LOCATION */}

                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold">
                        Lokasi
                      </label>

                      <input
                        type="text"
                        name="location"
                        className="form-control"
                        value={
                          form.location
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="Contoh: Ruang Meeting Lt. 2"
                      />
                    </div>

                    {/* AGENDA */}

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">
                        Agenda
                      </label>

                      <textarea
                        name="agenda"
                        className="form-control"
                        rows="3"
                        value={form.agenda}
                        onChange={
                          handleInputChange
                        }
                        placeholder="Tuliskan agenda rapat..."
                      />
                    </div>

                    {/* MINUTES */}

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">
                        Notulen
                      </label>

                      <textarea
                        name="minutes"
                        className="form-control"
                        rows="3"
                        value={form.minutes}
                        onChange={
                          handleInputChange
                        }
                        placeholder="Catatan hasil rapat..."
                      />
                    </div>
                  </div>

                  {/* PARTICIPANTS */}

                  <div className="border-top mt-4 pt-4">

                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                      <div>
                        <h6 className="fw-bold mb-1">
                          Peserta Rapat
                        </h6>

                        <small className="text-secondary">
                          Pilih Team atau pilih peserta
                          secara manual.
                        </small>
                      </div>

                      <span className="badge bg-primary rounded-pill align-self-start">
                        {form.participants.length}{" "}
                        dipilih
                      </span>
                    </div>

                    {/* =================================================
                        TEAM
                    ================================================== */}

                    <div className="border rounded-3 p-3 mb-4 bg-light">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2">
                        <div>
                          <div className="fw-semibold text-dark">
                            Pilih Team
                          </div>

                          <div className="text-secondary small">
                            Anggota Employee dan Supervisor
                            dalam Team akan otomatis dipilih.
                          </div>
                        </div>

                        {form.team_id && (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                            Team dipilih
                          </span>
                        )}
                      </div>

                      <select
                        className="form-select"
                        value={form.team_id}
                        onChange={
                          handleTeamChange
                        }
                        disabled={
                          saving ||
                          teams.length === 0
                        }
                      >
                        <option value="">
                          -- Pilih Team --
                        </option>

                        {teams
                          .filter(
                            (team) =>
                              team.is_active !==
                              false
                          )
                          .map((team) => (
                            <option
                              key={team.id}
                              value={team.id}
                            >
                              {team.name}
                            </option>
                          ))}
                      </select>

                      {teams.length === 0 && (
                        <div className="text-secondary small mt-2">
                          Belum ada Team aktif yang
                          tersedia.
                        </div>
                      )}

                      {form.team_id && (
                        <div className="small text-secondary mt-2">
                          Memilih Team akan mengganti
                          Employee dan Supervisor yang
                          dipilih sebelumnya. Finance
                          tetap dipertahankan.
                        </div>
                      )}
                    </div>

                    {/* EMPLOYEE */}

                    {renderParticipantCategory(
                      "Employee",
                      employees,
                      "employee"
                    )}

                    {/* SUPERVISOR */}

                    {renderParticipantCategory(
                      "Supervisor",
                      supervisors,
                      "supervisor"
                    )}

                    {/* FINANCE */}

                    {renderParticipantCategory(
                      "Finance",
                      finances,
                      "finance"
                    )}

                    {/* SELECTED */}

                    <div className="border-top pt-3 mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="small fw-semibold text-dark">
                          Peserta Terpilih
                        </div>

                        <span className="small text-secondary">
                          {
                            form
                              .participants
                              .length
                          }{" "}
                          orang
                        </span>
                      </div>

                      {form.participants.length ===
                      0 ? (
                        <div className="border rounded-3 p-3 text-secondary small text-center bg-light">
                          Belum ada peserta
                          yang dipilih.
                        </div>
                      ) : (
                        <div className="d-flex flex-wrap gap-2">
                          {form.participants.map(
                            (
                              selected,
                              index
                            ) => {
                              let person =
                                null;

                              if (
                                selected.type ===
                                "employee"
                              ) {
                                person =
                                  employees.find(
                                    (
                                      item
                                    ) =>
                                      Number(
                                        getPersonId(
                                          item
                                        )
                                      ) ===
                                      Number(
                                        selected.id
                                      )
                                  );
                              }

                              if (
                                selected.type ===
                                "supervisor"
                              ) {
                                person =
                                  supervisors.find(
                                    (
                                      item
                                    ) =>
                                      Number(
                                        getPersonId(
                                          item
                                        )
                                      ) ===
                                      Number(
                                        selected.id
                                      )
                                  );
                              }

                              if (
                                selected.type ===
                                "finance"
                              ) {
                                person =
                                  finances.find(
                                    (
                                      item
                                    ) =>
                                      Number(
                                        getPersonId(
                                          item
                                        )
                                      ) ===
                                      Number(
                                        selected.id
                                      )
                                  );
                              }

                              return (
                                <div
                                  key={`${selected.type}-${selected.id}-${index}`}
                                  className="badge bg-primary-subtle text-primary border border-primary-subtle d-flex align-items-center gap-2 px-2 py-2"
                                >
                                  <span>
                                    {getPersonName(
                                      person
                                    )}
                                  </span>

                                  <span className="text-secondary">
                                    (
                                    {
                                      selected.type
                                    }
                                    )
                                  </span>

                                  <button
                                    type="button"
                                    className="btn btn-sm p-0 border-0 text-danger"
                                    onClick={() =>
                                      removeParticipant(
                                        selected.id,
                                        selected.type
                                      )
                                    }
                                    title="Hapus peserta"
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="modal-footer px-3 px-md-4 py-3 border-top bg-white">
                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />

                        Menyimpan...
                      </>
                    ) : editingMeeting ? (
                      "Simpan Perubahan"
                    ) : (
                      "Buat Rapat"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAIL MODAL
      ====================================================== */}

      {showDetailModal &&
        selectedMeeting && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{
              backgroundColor:
                "rgba(15, 23, 42, .55)",
              zIndex: 1060,
            }}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              style={{
                maxWidth: "760px",
                width: "calc(100% - 24px)",
              }}
            >
              <div
                className="modal-content border-0 shadow-lg rounded-4 overflow-hidden"
                style={{
                  maxHeight: "90vh",
                }}
              >
                {/* HEADER */}

                <div className="modal-header">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                      style={{
                        width: 42,
                        height: 42,
                      }}
                    >
                      ℹ
                    </div>

                    <div>
                      <h5 className="modal-title fw-bold mb-0">
                        Detail Rapat
                      </h5>

                      <small className="text-secondary">
                        Informasi lengkap rapat
                      </small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={
                      closeDetailModal
                    }
                  />
                </div>

                {/* BODY */}

                <div
                  className="modal-body"
                  style={{
                    overflowY: "auto",
                  }}
                >
                  {/* TITLE */}

                  <div className="bg-light rounded-4 p-3 p-md-4 mb-3">
                    <h5 className="fw-bold mb-1">
                      {selectedMeeting.title}
                    </h5>

                    <div className="text-secondary small">
                      Dibuat oleh{" "}
                      {selectedMeeting
                        .creator?.name ||
                        "-"}
                    </div>
                  </div>

                  {/* INFO */}

                  <div className="row g-2 mb-4">
                    <div className="col-12 col-md-6">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="text-secondary small fw-semibold mb-1">
                          Tanggal
                        </div>

                        <div className="fw-medium small">
                          {formatDate(
                            selectedMeeting.meeting_date
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="text-secondary small fw-semibold mb-1">
                          Waktu
                        </div>

                        <div className="fw-medium small">
                          {formatTime(
                            selectedMeeting.start_time
                          )}

                          {" - "}

                          {selectedMeeting.end_time
                            ? formatTime(
                                selectedMeeting.end_time
                              )
                            : "-"}
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="text-secondary small fw-semibold mb-1">
                          Lokasi
                        </div>

                        <div className="fw-medium small">
                          {selectedMeeting.location ||
                            "-"}
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="text-secondary small fw-semibold mb-1">
                          Status
                        </div>

                        <span
                          className={`badge rounded-pill ${getStatusBadge(
                            selectedMeeting.status
                          )}`}
                        >
                          {getStatusLabel(
                            selectedMeeting.status
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AGENDA */}

                  <div className="border rounded-3 p-3 mb-3">
                    <div className="fw-semibold small mb-2">
                      Agenda
                    </div>

                    <div className="text-secondary small">
                      {selectedMeeting.agenda ||
                        "-"}
                    </div>
                  </div>

                  {/* MINUTES */}

                  <div className="border rounded-3 p-3 mb-4">
                    <div className="fw-semibold small mb-2">
                      Notulen
                    </div>

                    <div
                      className="text-secondary small"
                      style={{
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {selectedMeeting.minutes ||
                        "-"}
                    </div>
                  </div>

                  {/* PARTICIPANTS */}

                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">
                        Peserta Rapat
                      </h6>

                      <span className="badge bg-light text-secondary border">
                        {selectedMeeting
                          .participants
                          ?.length || 0}{" "}
                        orang
                      </span>
                    </div>

                    {selectedMeeting
                      .participants
                      ?.length > 0 ? (
                      <div className="row g-2">
                        {selectedMeeting.participants.map(
                          (
                            participant,
                            index
                          ) => (
                            <div
                              className="col-12"
                              key={
                                participant.id ??
                                index
                              }
                            >
                              <div className="border rounded-3 p-2 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                                    style={{
                                      width: 32,
                                      height: 32,
                                      fontSize: 13,
                                    }}
                                  >
                                    👤
                                  </div>

                                  <span className="small fw-semibold">
                                    {getParticipantName(
                                      participant
                                    )}
                                  </span>
                                </div>

                                <span className="badge bg-light text-secondary border">
                                  {getParticipantType(
                                    participant
                                  )}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-secondary small border rounded-3 p-3">
                        Tidak ada peserta.
                      </div>
                    )}
                  </div>
                </div>

                {/* FOOTER */}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={
                      closeDetailModal
                    }
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {showDeleteModal &&
        deletingMeeting && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{
              backgroundColor:
                "rgba(15, 23, 42, .55)",
              zIndex: 1070,
            }}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              style={{
                maxWidth: "460px",
                width: "calc(100% - 24px)",
              }}
            >
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

                {/* HEADER */}

                <div className="modal-header border-0 pb-2 px-4 pt-4">
                  <div className="d-flex align-items-center gap-3">

                    <div
                      className="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center"
                      style={{
                        width: 48,
                        height: 48,
                        minWidth: 48,
                        fontSize: 22,
                      }}
                    >
                      🗑️
                    </div>

                    <div>
                      <h5 className="modal-title fw-bold mb-1">
                        Hapus Rapat?
                      </h5>

                      <div className="text-secondary small">
                        Konfirmasi penghapusan rapat
                      </div>
                    </div>

                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeDeleteModal}
                    disabled={deleting}
                  />
                </div>

                {/* BODY */}

                <div className="modal-body px-4 pt-2 pb-3">

                  <p className="text-secondary mb-3">
                    Apakah Anda yakin ingin
                    menghapus rapat berikut?
                  </p>

                  <div className="border rounded-3 p-3 bg-light">

                    <div className="fw-bold text-dark mb-1">
                      {deletingMeeting.title}
                    </div>

                    <div className="small text-secondary">
                      {formatDate(
                        deletingMeeting.meeting_date
                      )}
                    </div>

                    <div className="small text-secondary">
                      {formatTime(
                        deletingMeeting.start_time
                      )}

                      {deletingMeeting.end_time &&
                        ` - ${formatTime(
                          deletingMeeting.end_time
                        )}`}
                    </div>

                    {deletingMeeting.location && (
                      <div className="small text-secondary mt-1">
                        📍{" "}
                        {deletingMeeting.location}
                      </div>
                    )}
                  </div>

                  <div className="alert alert-warning small mt-3 mb-0">
                    <strong>Perhatian:</strong>{" "}
                    Data rapat yang dihapus tidak
                    dapat dikembalikan.
                  </div>
                </div>

                {/* FOOTER */}

                <div className="modal-footer border-0 px-4 pb-4 pt-2">

                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={closeDeleteModal}
                    disabled={deleting}
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger px-4"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />

                        Menghapus...
                      </>
                    ) : (
                      <>
                        🗑️ Hapus Rapat
                      </>
                    )}
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default MeetingAdminPage;