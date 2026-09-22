import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import ConfirmModal from "../../common/ConfirmModal";
import CustomDatePicker from "../../common/CustomDatePicker";
import CustomMultiSelect from "../../common/CustomMultiSelect";
import CustomSelect from "../../common/CustomSelect";
import CustomTimePicker from "../../common/CustomTimePicker";
import EdvoraLoader from "../../common/EdvoraLoader";
import { openSnackbar } from "../../common/snackbar/snackbar";
import { getUserRole } from "../../utils/auth";
import { getClassesByStatus } from "../../utils/classesApi";
import {
  addProgram,
  cancelEvent,
  cancelRegistration,
  deleteEvent,
  deleteProgram,
  formatEventDate,
  getEventById,
  getParticipants,
  publishEvent,
  registerForProgram,
  toDateInputValue,
  updateEvent,
  updateProgram,
} from "../../utils/eventsApi";

const inputClass =
  "w-full h-[46px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] backdrop-blur-md px-3.5 text-[14px] text-[color:var(--edvora-ink-strong)] outline-none transition focus:border-[color:var(--edvora-primary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--edvora-primary)_16%,transparent)] placeholder:text-[color:var(--edvora-muted)]";
const labelClass =
  "block text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--edvora-muted)] mb-1.5";
const textareaClass =
  "w-full rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] backdrop-blur-md px-3.5 py-2.5 text-[14px] text-[color:var(--edvora-ink-strong)] outline-none transition focus:border-[color:var(--edvora-primary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--edvora-primary)_16%,transparent)] resize-none";

const STATUS_STYLES = {
  DRAFT: "bg-slate-100 text-slate-700",
  PUBLISHED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
};

const EMPTY_PROGRAM = {
  programName: "",
  description: "",
  programDate: "",
  programTime: "",
  venue: "",
  maxParticipants: "",
  eligibleClasses: [],
  registrationDeadline: "",
  registrationStatus: "OPEN",
};

function ProgramModal({
  mode = "add",
  initial = EMPTY_PROGRAM,
  classOptions,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(initial);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (
      !formData.programName.trim() ||
      !formData.programDate ||
      !formData.registrationDeadline
    ) {
      return openSnackbar({
        message: "Program name, date and registration deadline are required",
        variant: "warning",
      });
    }

    try {
      setSubmitting(true);
      await onSubmit({
        programName: formData.programName.trim(),
        description: formData.description.trim(),
        programDate: formData.programDate,
        programTime: formData.programTime.trim(),
        venue: formData.venue.trim(),
        maxParticipants: formData.maxParticipants,
        eligibleClasses: formData.eligibleClasses || [],
        registrationDeadline: formData.registrationDeadline,
        registrationStatus: formData.registrationStatus,
      });
      onClose();
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message ||
          `Failed to ${mode === "edit" ? "update" : "add"} program`,
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[color:var(--edvora-overlay)] backdrop-blur-md p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog"
        onClick={submitting ? undefined : onClose}
      />

      <div className="relative w-full max-w-[760px] max-h-[90dvh] glass-strong rounded-3xl overflow-hidden flex flex-col shadow-[var(--edvora-glass-shadow-lg)]">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full blur-3xl opacity-70"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--edvora-primary) 35%, transparent), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-10 h-40 w-40 rounded-full blur-3xl opacity-60"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--edvora-accent) 28%, transparent), transparent 70%)",
          }}
        />

        <div className="relative h-14 sm:h-16 px-5 sm:px-6 flex items-center justify-between border-b border-[color:var(--edvora-glass-border-soft)] shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--edvora-primary)]">
              Event program
            </p>
            <h2 className="text-base sm:text-lg font-bold text-[color:var(--edvora-ink-strong)] truncate">
              {mode === "edit" ? "Edit Program" : "Add Program"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--edvora-primary)] text-white shadow-md hover:bg-[color:var(--edvora-primary-hover)] disabled:opacity-60"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="sm:col-span-2">
              <label className={labelClass}>
                Program Name <span className="text-[color:var(--edvora-danger)]">*</span>
              </label>
              <input
                className={inputClass}
                value={formData.programName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, programName: e.target.value }))
                }
                placeholder="e.g. Classical Dance"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                rows={3}
                className={textareaClass}
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Optional details for participants"
              />
            </div>

            <div>
              <label className={labelClass}>
                Program Date <span className="text-[color:var(--edvora-danger)]">*</span>
              </label>
              <CustomDatePicker
                value={formData.programDate}
                onChange={(programDate) =>
                  setFormData((p) => ({ ...p, programDate }))
                }
                openTo="day"
              />
            </div>
            <div>
              <label className={labelClass}>Program Time</label>
              <CustomTimePicker
                value={formData.programTime}
                onChange={(programTime) =>
                  setFormData((p) => ({ ...p, programTime }))
                }
                placeholder="Select program time"
              />
            </div>

            <div>
              <label className={labelClass}>Venue</label>
              <input
                className={inputClass}
                value={formData.venue}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, venue: e.target.value }))
                }
                placeholder="Hall / outdoor / virtual"
              />
            </div>
            <div>
              <label className={labelClass}>Max Participants</label>
              <input
                type="number"
                min="1"
                className={inputClass}
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    maxParticipants: e.target.value,
                  }))
                }
                placeholder="Optional"
              />
            </div>

            <div>
              <label className={labelClass}>
                Registration Deadline{" "}
                <span className="text-[color:var(--edvora-danger)]">*</span>
              </label>
              <CustomDatePicker
                value={formData.registrationDeadline}
                onChange={(registrationDeadline) =>
                  setFormData((p) => ({ ...p, registrationDeadline }))
                }
                openTo="day"
              />
            </div>
            <div>
              <label className={labelClass}>Registration Status</label>
              <CustomSelect
                options={[
                  { value: "OPEN", label: "Open" },
                  { value: "CLOSED", label: "Closed" },
                ]}
                value={formData.registrationStatus}
                onChange={(opt) =>
                  setFormData((p) => ({
                    ...p,
                    registrationStatus: opt?.value || "OPEN",
                  }))
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Eligible Classes</label>
              <CustomMultiSelect
                options={classOptions}
                value={formData.eligibleClasses || []}
                onChange={(eligibleClasses) =>
                  setFormData((p) => ({ ...p, eligibleClasses }))
                }
                placeholder="Select one or more classes…"
                emptyHint="Empty = all classes eligible"
                menuPlacement="top"
                isSearchable
              />
              <p className="mt-2 text-[11px] text-[color:var(--edvora-muted)]">
                {(formData.eligibleClasses || []).length === 0
                  ? "No selection — every active class can register."
                  : `${formData.eligibleClasses.length} class${
                      formData.eligibleClasses.length === 1 ? "" : "es"
                    } selected.`}
              </p>
            </div>
          </div>
        </div>

        <div className="relative px-5 sm:px-6 py-4 border-t border-[color:var(--edvora-glass-border-soft)] flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 bg-[color:var(--edvora-glass-soft)]/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-[44px] px-4 rounded-xl border border-[color:var(--edvora-glass-border-soft)] text-sm font-semibold text-[color:var(--edvora-ink)] hover:bg-[color:var(--edvora-glass)] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="h-[44px] px-6 rounded-xl theme-btn-primary text-sm font-semibold disabled:opacity-60"
          >
            {submitting
              ? "Saving…"
              : mode === "edit"
                ? "Save Changes"
                : "Add Program"}
          </button>
        </div>
      </div>

      {submitting ? (
        <EdvoraLoader
          overlay
          message={mode === "edit" ? "Updating program…" : "Adding program…"}
        />
      ) : null}
    </div>
  );
}

function EditEventModal({ event, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    eventName: event.eventName || "",
    description: event.description || "",
    eventDate: toDateInputValue(event.eventDate),
    eventTime: event.eventTime || "",
    venue: event.venue || "",
    registrationStartDate: toDateInputValue(event.registrationStartDate),
    registrationEndDate: toDateInputValue(event.registrationEndDate),
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const updated = await updateEvent(event._id, formData);
      openSnackbar({ message: "Event updated", variant: "success" });
      onSaved?.(updated);
      onClose();
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to update event",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[color:var(--edvora-overlay)] backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-[720px] max-h-[90dvh] glass-strong rounded-3xl shadow-[var(--edvora-glass-shadow-lg)] overflow-hidden flex flex-col">
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-[color:var(--edvora-glass-border-soft)]">
          <h2 className="font-semibold text-[color:var(--edvora-ink-strong)]">
            Edit Event
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[color:var(--edvora-primary)] text-white flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Event Name</label>
            <input
              className={inputClass}
              value={formData.eventName}
              onChange={(e) =>
                setFormData((p) => ({ ...p, eventName: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              className={textareaClass}
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelClass}>Event Date</label>
            <CustomDatePicker
              value={formData.eventDate}
              onChange={(eventDate) =>
                setFormData((p) => ({ ...p, eventDate }))
              }
              openTo="day"
            />
          </div>
          <div>
            <label className={labelClass}>Event Time</label>
            <CustomTimePicker
              value={formData.eventTime}
              onChange={(eventTime) =>
                setFormData((p) => ({ ...p, eventTime }))
              }
              placeholder="Select event time"
            />
          </div>
          <div>
            <label className={labelClass}>Venue</label>
            <input
              className={inputClass}
              value={formData.venue}
              onChange={(e) =>
                setFormData((p) => ({ ...p, venue: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelClass}>Registration Start</label>
            <CustomDatePicker
              value={formData.registrationStartDate}
              onChange={(registrationStartDate) =>
                setFormData((p) => ({ ...p, registrationStartDate }))
              }
              openTo="day"
            />
          </div>
          <div>
            <label className={labelClass}>Registration End</label>
            <CustomDatePicker
              value={formData.registrationEndDate}
              onChange={(registrationEndDate) =>
                setFormData((p) => ({ ...p, registrationEndDate }))
              }
              openTo="day"
            />
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 border-t border-[color:var(--edvora-glass-border-soft)] flex justify-end gap-3 bg-[color:var(--edvora-glass-soft)]/80">
          <button
            type="button"
            onClick={onClose}
            className="h-[44px] px-4 rounded-xl border border-[color:var(--edvora-glass-border-soft)] text-sm font-semibold text-[color:var(--edvora-ink)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="h-[44px] px-5 rounded-xl theme-btn-primary text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const role = getUserRole();
  const canManage = role === "SCHOOL_ADMIN";
  const canViewParticipants = [
    "SCHOOL_ADMIN",
    "SUPER_ADMIN",
    "TEACHER",
    "PARENT",
  ].includes(role);
  const isStudent = role === "STUDENT";

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteEventConfirmOpen, setDeleteEventConfirmOpen] = useState(false);
  const [cancelEventConfirmOpen, setCancelEventConfirmOpen] = useState(false);
  const [deleteProgramTarget, setDeleteProgramTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filterProgramId, setFilterProgramId] = useState("");
  const [activeTab, setActiveTab] = useState("programs");

  const loadDetail = async () => {
    const data = await getEventById(eventId);
    setEvent(data.event);
    setPrograms(data.programs || []);
  };

  const loadParticipants = async () => {
    if (!canViewParticipants) return;
    const result = await getParticipants({
      eventId,
      programId: filterProgramId || undefined,
      search: search.trim() || undefined,
    });
    setParticipants(result.data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await loadDetail();
        if (canManage) {
          const classes = await getClassesByStatus("ACTIVE");
          if (!cancelled) {
            setClassOptions(
              (classes.data || []).map((c) => ({
                value: c._id,
                label: `${c.className} - ${c.section}`,
              }))
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message: error?.response?.data?.message || "Failed to load event",
            variant: "error",
          });
          navigate("/admin/upcoming-events");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    if (activeTab !== "participants" || !canViewParticipants) return;
    let cancelled = false;
    (async () => {
      try {
        await loadParticipants();
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message || "Failed to load participants",
            variant: "error",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filterProgramId, search]);

  const handlePublish = async () => {
    try {
      setActionLoading(true);
      const updated = await publishEvent(eventId);
      setEvent(updated);
      openSnackbar({ message: "Event published", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to publish",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancelEvent = async () => {
    try {
      setActionLoading(true);
      const updated = await cancelEvent(eventId);
      setEvent(updated);
      await loadDetail();
      setCancelEventConfirmOpen(false);
      openSnackbar({ message: "Event cancelled", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to cancel event",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeleteEvent = async () => {
    try {
      setActionLoading(true);
      await deleteEvent(eventId);
      setDeleteEventConfirmOpen(false);
      openSnackbar({ message: "Event deleted", variant: "success" });
      navigate("/admin/upcoming-events");
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to delete event",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegister = async (programId) => {
    try {
      setActionLoading(true);
      await registerForProgram(programId);
      await loadDetail();
      openSnackbar({ message: "Registered successfully", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Registration failed",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async (programId) => {
    try {
      setActionLoading(true);
      await cancelRegistration(programId);
      await loadDetail();
      openSnackbar({ message: "Registration cancelled", variant: "success" });
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message || "Failed to cancel registration",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeleteProgram = async () => {
    if (!deleteProgramTarget) return;
    try {
      setActionLoading(true);
      await deleteProgram(deleteProgramTarget);
      await loadDetail();
      setDeleteProgramTarget(null);
      openSnackbar({ message: "Program deleted", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to delete program",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <EdvoraLoader message="Loading event…" />;
  }

  if (!event) return null;

  const programFilterOptions = [
    { value: "", label: "All programs" },
    ...programs.map((p) => ({ value: p._id, label: p.programName })),
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/admin/upcoming-events")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--edvora-ink-strong)] hover:text-[color:var(--edvora-primary)] mb-4"
      >
        <ArrowLeft size={16} />
        Back to events
      </button>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-[color:var(--edvora-ink-strong)]">
                {event.eventName}
              </h1>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  STATUS_STYLES[event.status]
                }`}
              >
                {event.status}
              </span>
            </div>
            {event.description ? (
              <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-3xl">
                {event.description}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                {formatEventDate(event.eventDate)}
                {event.eventTime ? ` · ${event.eventTime}` : ""}
              </span>
              {event.venue ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} />
                  {event.venue}
                </span>
              ) : null}
              <span>
                Registration: {formatEventDate(event.registrationStartDate)} –{" "}
                {formatEventDate(event.registrationEndDate)}
              </span>
            </div>
          </div>

          {canManage && event.status !== "CANCELLED" ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowEditEvent(true)}
                className="h-[38px] px-3 rounded-lg border border-slate-200 text-sm font-semibold"
              >
                Edit
              </button>
              {event.status === "DRAFT" ? (
                <>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handlePublish}
                    className="h-[38px] px-3 rounded-lg bg-green-600 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    Publish
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setDeleteEventConfirmOpen(true)}
                    className="h-[38px] px-3 rounded-lg bg-red-50 text-red-600 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </>
              ) : null}
              {event.status === "PUBLISHED" ? (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setCancelEventConfirmOpen(true)}
                  className="h-[38px] px-3 rounded-lg bg-red-50 text-red-600 text-sm font-semibold"
                >
                  Cancel Event
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("programs")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            activeTab === "programs"
              ? "bg-[color:var(--edvora-primary)] text-white"
              : "bg-white border border-slate-200 text-slate-700"
          }`}
        >
          Programs ({programs.length})
        </button>
        {canViewParticipants ? (
          <button
            type="button"
            onClick={() => setActiveTab("participants")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              activeTab === "participants"
                ? "bg-[color:var(--edvora-primary)] text-white"
                : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            Participants
          </button>
        ) : null}
      </div>

      {activeTab === "programs" ? (
        <div>
          {canManage && event.status !== "CANCELLED" ? (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditingProgram(null);
                  setShowProgramModal(true);
                }}
                className="inline-flex items-center gap-2 h-[40px] px-4 rounded-lg bg-[color:var(--edvora-primary)] text-white text-sm font-semibold"
              >
                <Plus size={16} />
                Add Program
              </button>
            </div>
          ) : null}

          {programs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 p-10 text-center">
              <p className="text-slate-700 font-medium">No programs yet</p>
              <p className="text-slate-500 text-sm mt-1">
                {canManage
                  ? "Add programs such as dance, singing, or quiz under this event."
                  : "Programs will appear once the school adds them."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {programs.map((program) => (
                <div
                  key={program._id}
                  className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800">
                          {program.programName}
                        </h3>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            program.registrationStatus === "OPEN"
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {program.registrationStatus}
                        </span>
                        {program.isRegistered ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]">
                            Registered
                          </span>
                        ) : null}
                      </div>
                      {program.description ? (
                        <p className="text-sm text-slate-600 mt-1">
                          {program.description}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>
                          {formatEventDate(program.programDate)}
                          {program.programTime
                            ? ` · ${program.programTime}`
                            : ""}
                        </span>
                        {program.venue ? <span>{program.venue}</span> : null}
                        <span className="inline-flex items-center gap-1">
                          <Users size={12} />
                          {program.registeredCount || 0}
                          {program.maxParticipants
                            ? ` / ${program.maxParticipants}`
                            : ""}{" "}
                          registered
                        </span>
                        <span>
                          Deadline:{" "}
                          {formatEventDate(program.registrationDeadline)}
                        </span>
                      </div>
                      {program.eligibleClasses?.length ? (
                        <p className="mt-2 text-xs text-slate-500">
                          Eligible:{" "}
                          {program.eligibleClasses
                            .map((c) =>
                              c.className
                                ? `${c.className}-${c.section}`
                                : "Class"
                            )
                            .join(", ")}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-slate-500">
                          Eligible: All classes
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isStudent && program.canRegister ? (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleRegister(program._id)}
                          className="h-[36px] px-3 rounded-lg bg-[color:var(--edvora-primary)] text-white text-sm font-semibold disabled:opacity-60"
                        >
                          Register
                        </button>
                      ) : null}
                      {isStudent && program.canCancel ? (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() =>
                            handleCancelRegistration(program._id)
                          }
                          className="h-[36px] px-3 rounded-lg border border-red-200 text-red-600 text-sm font-semibold"
                        >
                          Cancel Registration
                        </button>
                      ) : null}
                      {canManage && event.status !== "CANCELLED" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProgram(program);
                              setShowProgramModal(true);
                            }}
                            className="h-[36px] px-3 rounded-lg border text-sm font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteProgramTarget(program._id)}
                            className="h-[36px] w-[36px] rounded-lg border border-red-100 text-red-600 flex items-center justify-center"
                            aria-label="Delete program"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className={`${inputClass} pl-9`}
                placeholder="Search student, admission no, program…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[220px]">
              <CustomSelect
                options={programFilterOptions}
                value={filterProgramId}
                onChange={(opt) => setFilterProgramId(opt?.value || "")}
                placeholder="Filter by program"
              />
            </div>
          </div>

          {participants.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">
              No participants found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-3 font-semibold">Student</th>
                    <th className="py-2 pr-3 font-semibold">Admission No</th>
                    <th className="py-2 pr-3 font-semibold">Class</th>
                    <th className="py-2 pr-3 font-semibold">Program</th>
                    <th className="py-2 pr-3 font-semibold">Registered</th>
                    <th className="py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((row) => (
                    <tr key={row._id} className="border-b border-slate-50">
                      <td className="py-2.5 pr-3 font-medium text-slate-800">
                        {row.studentName}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600">
                        {row.admissionNumber || "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600">
                        {[row.className, row.section]
                          .filter(Boolean)
                          .join(" - ") || "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600">
                        {row.programName}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600">
                        {formatEventDate(row.registeredAt)}
                      </td>
                      <td className="py-2.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showProgramModal ? (
        <ProgramModal
          mode={editingProgram ? "edit" : "add"}
          classOptions={classOptions}
          initial={
            editingProgram
              ? {
                  programName: editingProgram.programName || "",
                  description: editingProgram.description || "",
                  programDate: toDateInputValue(editingProgram.programDate),
                  programTime: editingProgram.programTime || "",
                  venue: editingProgram.venue || "",
                  maxParticipants:
                    editingProgram.maxParticipants != null
                      ? String(editingProgram.maxParticipants)
                      : "",
                  eligibleClasses: (editingProgram.eligibleClasses || []).map(
                    (c) => c._id || c
                  ),
                  registrationDeadline: toDateInputValue(
                    editingProgram.registrationDeadline
                  ),
                  registrationStatus:
                    editingProgram.registrationStatus || "OPEN",
                }
              : EMPTY_PROGRAM
          }
          onClose={() => {
            setShowProgramModal(false);
            setEditingProgram(null);
          }}
          onSubmit={async (payload) => {
            if (editingProgram) {
              await updateProgram(editingProgram._id, payload);
              openSnackbar({ message: "Program updated", variant: "success" });
            } else {
              await addProgram(eventId, payload);
              openSnackbar({ message: "Program added", variant: "success" });
            }
            await loadDetail();
          }}
        />
      ) : null}

      {showEditEvent ? (
        <EditEventModal
          event={event}
          onClose={() => setShowEditEvent(false)}
          onSaved={(updated) => setEvent(updated)}
        />
      ) : null}

      <ConfirmModal
        open={deleteEventConfirmOpen}
        title="Delete draft event?"
        description={`"${event.eventName}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        loading={actionLoading}
        onCancel={() => setDeleteEventConfirmOpen(false)}
        onConfirm={handleConfirmDeleteEvent}
      />

      <ConfirmModal
        open={cancelEventConfirmOpen}
        title="Cancel this event?"
        description={`"${event.eventName}" will be marked cancelled and registrations will be closed.`}
        confirmLabel="Cancel Event"
        tone="warning"
        loading={actionLoading}
        onCancel={() => setCancelEventConfirmOpen(false)}
        onConfirm={handleConfirmCancelEvent}
      />

      <ConfirmModal
        open={Boolean(deleteProgramTarget)}
        title="Delete program?"
        description={
          deleteProgramTarget
            ? `Remove "${
                programs.find((p) => p._id === deleteProgramTarget)
                  ?.programName || "this program"
              }" from "${event.eventName}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        tone="danger"
        loading={actionLoading}
        onCancel={() => setDeleteProgramTarget(null)}
        onConfirm={handleConfirmDeleteProgram}
      />
    </div>
  );
}

export default EventDetail;
