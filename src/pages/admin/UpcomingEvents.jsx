import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Plus,
  Users,
  X,
  Clock,
} from "lucide-react";
import CustomDatePicker from "../../common/CustomDatePicker";
import CustomTimePicker from "../../common/CustomTimePicker";
import EdvoraLoader from "../../common/EdvoraLoader";
import { openSnackbar } from "../../common/snackbar/snackbar";
import { getUserRole } from "../../utils/auth";
import {
  createEvent,
  EVENT_STATUSES,
  formatEventDate,
  getEventsByStatus,
} from "../../utils/eventsApi";

const EMPTY_FORM = {
  eventName: "",
  description: "",
  eventDate: "",
  eventTime: "",
  venue: "",
  registrationStartDate: "",
  registrationEndDate: "",
  status: "DRAFT",
};

const inputClass =
  "w-full h-[42px] rounded-lg border border-[#D0D5DD] bg-white px-3 text-[14px] text-[#344054] outline-none focus:border-[color:var(--edvora-primary)]";
const labelClass = "block text-[13px] font-semibold text-[#667085] mb-1.5";

const STATUS_STYLES = {
  DRAFT: "bg-slate-100 text-slate-700",
  PUBLISHED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
};

function AddEventModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.eventName.trim() ||
      !formData.eventDate ||
      !formData.registrationStartDate ||
      !formData.registrationEndDate
    ) {
      return openSnackbar({
        message: "Event name and all registration dates are required",
        variant: "warning",
      });
    }

    try {
      setSubmitting(true);
      const created = await createEvent({
        eventName: formData.eventName.trim(),
        description: formData.description.trim(),
        eventDate: formData.eventDate,
        eventTime: formData.eventTime.trim(),
        venue: formData.venue.trim(),
        registrationStartDate: formData.registrationStartDate,
        registrationEndDate: formData.registrationEndDate,
        status: "DRAFT",
      });

      openSnackbar({
        message: "Event created successfully",
        variant: "success",
      });
      onCreated?.(created);
      onClose();
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to create event",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-[760px] max-h-[90dvh] bg-white rounded-[14px] shadow-2xl overflow-hidden flex flex-col">
        <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]">
              <CalendarDays size={18} />
            </span>
            <h2 className="text-base sm:text-[18px] font-semibold text-[#111827] truncate">
              Create Event
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                placeholder="e.g. Annual Day 2026"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the event"
                className="w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2.5 text-[14px] text-[#344054] outline-none focus:border-[color:var(--edvora-primary)] resize-y min-h-[90px]"
              />
            </div>

            <div>
              <label className={labelClass}>
                Event Date <span className="text-red-500">*</span>
              </label>
              <CustomDatePicker
                value={formData.eventDate}
                onChange={(eventDate) =>
                  setFormData((prev) => ({ ...prev, eventDate }))
                }
                openTo="day"
              />
            </div>

            <div>
              <label className={labelClass}>Event Time</label>
              <CustomTimePicker
                value={formData.eventTime}
                onChange={(eventTime) =>
                  setFormData((prev) => ({ ...prev, eventTime }))
                }
                placeholder="Select event time"
              />
            </div>

            <div>
              <label className={labelClass}>Venue</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. School Auditorium"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Registration Start <span className="text-red-500">*</span>
              </label>
              <CustomDatePicker
                value={formData.registrationStartDate}
                onChange={(registrationStartDate) =>
                  setFormData((prev) => ({ ...prev, registrationStartDate }))
                }
                openTo="day"
              />
            </div>

            <div>
              <label className={labelClass}>
                Registration End <span className="text-red-500">*</span>
              </label>
              <CustomDatePicker
                value={formData.registrationEndDate}
                onChange={(registrationEndDate) =>
                  setFormData((prev) => ({ ...prev, registrationEndDate }))
                }
                openTo="day"
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Events are saved as Draft. Add programs, then publish from the event
            detail page.
          </p>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex justify-end shrink-0">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="h-[42px] px-5 rounded-lg bg-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-hover)] text-white text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:border-[color:var(--edvora-primary)]/40 hover:shadow-md transition"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]">
          <CalendarDays size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 truncate">
              {event.eventName}
            </p>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                STATUS_STYLES[event.status] || STATUS_STYLES.DRAFT
              }`}
            >
              {event.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <CalendarDays size={12} />
            {formatEventDate(event.eventDate)}
            {event.eventTime ? ` · ${event.eventTime}` : ""}
          </p>
          {event.venue ? (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin size={12} />
              {event.venue}
            </p>
          ) : null}
          {event.description ? (
            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
              {event.description}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {event.programCount || 0} programs
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={12} />
              {event.registrationCount || 0} registrations
            </span>
            {typeof event.myRegistrationCount === "number" &&
            event.myRegistrationCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[color:var(--edvora-primary)] font-medium">
                You: {event.myRegistrationCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}

function UpcomingEvents() {
  const navigate = useNavigate();
  const role = getUserRole();
  const canManage = role === "SCHOOL_ADMIN";
  const isStudentOrParent = role === "STUDENT" || role === "PARENT";

  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [counts, setCounts] = useState({
    DRAFT: 0,
    PUBLISHED: 0,
    CANCELLED: 0,
    ALL: 0,
  });
  const [activeStatus, setActiveStatus] = useState(
    isStudentOrParent ? "PUBLISHED" : "ALL"
  );
  const [loading, setLoading] = useState(true);

  const loadEvents = async (status = activeStatus) => {
    try {
      setLoading(true);
      const result = await getEventsByStatus(
        isStudentOrParent ? "PUBLISHED" : status
      );
      setEvents(result.data);
      setCounts(result.counts);
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to load events",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadEvents(activeStatus);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus]);

  const handleCreated = (event) => {
    if (!event) return;
    setCounts((prev) => ({
      ...prev,
      ALL: (prev.ALL || 0) + 1,
      [event.status]: (prev[event.status] || 0) + 1,
    }));
    if (activeStatus === "ALL" || activeStatus === event.status) {
      setEvents((prev) => [event, ...prev]);
    }
    if (event._id) {
      navigate(`/admin/upcoming-events/${event._id}`);
    }
  };

  const statusFilters = isStudentOrParent
    ? [{ value: "PUBLISHED", label: "Published" }]
    : EVENT_STATUSES;

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[color:var(--edvora-ink-strong)]">
            Upcoming Events
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            {canManage
              ? "Create events, add programs, and track student registrations."
              : role === "STUDENT"
                ? "Browse published events and register for eligible programs."
                : role === "PARENT"
                  ? "View school events and your child's program registrations."
                  : "View school events and participant registrations."}
          </p>

          {!isStudentOrParent ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {statusFilters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setActiveStatus(item.value)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    activeStatus === item.value
                      ? "bg-[color:var(--edvora-primary)] text-white"
                      : "bg-white text-[color:var(--edvora-ink-strong)] border border-[color:var(--edvora-border)] hover:border-[color:var(--edvora-primary)]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      activeStatus === item.value
                        ? "bg-white/20 text-white"
                        : "bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-ink-strong)]"
                    }`}
                  >
                    {counts[item.value] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {canManage ? (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 h-[42px] rounded-lg bg-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-hover)] text-white text-sm font-semibold shadow-sm"
          >
            <Plus size={18} />
            Create Event
          </button>
        ) : null}
      </div>

      {loading ? (
        <EdvoraLoader message="Loading events…" />
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center border border-slate-100">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]">
            <CalendarDays size={22} />
          </span>
          <p className="text-slate-700 font-medium">No events found</p>
          <p className="text-slate-500 text-sm mt-1">
            {canManage
              ? 'Click "Create Event" to add your first upcoming event.'
              : "Published events will appear here when available."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 min-[1024px]:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onClick={() => navigate(`/admin/upcoming-events/${event._id}`)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddEventModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

export default UpcomingEvents;
