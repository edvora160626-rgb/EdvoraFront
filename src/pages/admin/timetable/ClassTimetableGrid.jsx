import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  DoorOpen,
  Eraser,
  FlaskConical,
  UserRound,
  X,
} from "lucide-react";
import CustomSelect from "../../../common/CustomSelect";
import CustomTimePicker from "../../../common/CustomTimePicker";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";
import { getActiveStaffBySchool, getClassesByStatus } from "../../../utils/classesApi";
import {
  classLabel,
  deleteScheduleBlock,
  getTimetableByClass,
  listRooms,
  publishTimetable,
  saveScheduleBlock,
  unpublishTimetable,
  upsertTimetableSettings,
} from "../../../utils/timetableApi";
import ScheduleBoard from "./ScheduleBoard";
import { AcademicYearPicker, useAcademicYear } from "./useAcademicYear";

const labelClass =
  "block text-[12px] font-semibold tracking-wide uppercase text-[color:var(--edvora-muted)] mb-1.5";
const glassCard =
  "rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] shadow-[var(--edvora-glass-shadow)] backdrop-blur-[18px] saturate-[165%]";

function AssignModal({
  day,
  slot,
  entry,
  subjects = [],
  allocations = [],
  rooms,
  teachers,
  onClose,
  onSave,
  onClear,
  saving,
}) {
  const [subjectId, setSubjectId] = useState(
    entry?.subjectId?._id || entry?.subjectId || ""
  );
  const [teacherId, setTeacherId] = useState(
    entry?.teacherId?._id || entry?.teacherId || ""
  );
  const [roomId, setRoomId] = useState(
    entry?.roomId?._id || entry?.roomId || ""
  );
  const [isPractical, setIsPractical] = useState(Boolean(entry?.isPractical));

  const subjectOptions = (() => {
    if (subjects.length) {
      return subjects.map((s) => ({
        value: s._id,
        label: s.subjectCode
          ? `${s.subjectName} (${s.subjectCode})`
          : s.subjectName || "Subject",
      }));
    }
    return allocations.map((a) => ({
      value: a.subjectId?._id || a.subjectId,
      label: a.subjectId?.subjectName || "Subject",
    }));
  })();

  const teacherOptions = teachers.map((t) => ({
    value: t._id,
    label: teacherName(t),
  }));

  const roomOptions = [
    { value: "", label: "No room" },
    ...rooms.map((r) => ({
      value: r._id,
      label: `${r.name} (${r.code})`,
    })),
  ];

  const handleSubjectChange = (opt) => {
    const sid = opt?.value || "";
    setSubjectId(sid);
    const alloc = allocations.find(
      (a) => String(a.subjectId?._id || a.subjectId) === String(sid)
    );
    if (alloc?.teacherId) {
      setTeacherId(alloc.teacherId?._id || alloc.teacherId);
    }
  };

  const dayLabel = dayShortLabel?.(day) || String(day || "").slice(0, 3);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[color:var(--edvora-overlay)] backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-[520px] glass-strong rounded-2xl overflow-hidden flex flex-col shadow-[var(--edvora-glass-shadow-lg)]">
        <div className="relative px-5 sm:px-6 pt-5 pb-4 border-b border-[color:var(--edvora-glass-border-soft)]">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-80"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--edvora-primary) 18%, transparent), color-mix(in srgb, var(--edvora-accent) 10%, transparent) 50%, transparent 80%)",
            }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
                <CalendarClock size={20} />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[color:var(--edvora-ink-strong)]">
                  Assign Period
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[color:var(--edvora-primary)]/12 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[color:var(--edvora-primary)]">
                    {dayLabel}
                  </span>
                  <span className="text-xs text-[color:var(--edvora-muted)] truncate">
                    {slot?.name} · {slot?.startTime}–{slot?.endTime}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="relative w-9 h-9 rounded-full bg-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-hover)] text-white flex items-center justify-center shadow-md"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 px-5 sm:px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={12} />
                Subject
              </span>
            </label>
            <CustomSelect
              options={subjectOptions}
              value={subjectId}
              onChange={handleSubjectChange}
              placeholder={
                subjectOptions.length
                  ? "Select subject"
                  : "No subjects assigned to this class"
              }
              isSearchable
            />
            {!subjectOptions.length ? (
              <p className="mt-1.5 text-xs text-amber-700">
                Assign subjects to this class in Subjects.
              </p>
            ) : null}
          </div>

          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <UserRound size={12} />
                Teacher
              </span>
            </label>
            <CustomSelect
              options={teacherOptions}
              value={teacherId}
              onChange={(opt) => setTeacherId(opt?.value || "")}
              placeholder="Select teacher"
              isSearchable
            />
          </div>

          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <DoorOpen size={12} />
                Room
              </span>
            </label>
            <CustomSelect
              options={roomOptions}
              value={roomId}
              onChange={(opt) => setRoomId(opt?.value || "")}
            />
          </div>

          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition ${
              isPractical
                ? "border-[color:var(--edvora-primary)]/35 bg-[color:var(--edvora-primary)]/10"
                : "border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)]"
            }`}
          >
            <input
              type="checkbox"
              checked={isPractical}
              onChange={(e) => setIsPractical(e.target.checked)}
              className="h-4 w-4 accent-[color:var(--edvora-primary)]"
            />
            <span className="flex items-center gap-2 text-sm font-medium text-[color:var(--edvora-ink)]">
              <FlaskConical
                size={15}
                className="text-[color:var(--edvora-primary)]"
              />
              Practical / lab (consecutive periods)
            </span>
          </label>
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-[color:var(--edvora-glass-border-soft)] flex flex-wrap items-center justify-between gap-3 bg-[color:var(--edvora-glass-soft)]">
          <button
            type="button"
            disabled={saving || !entry}
            onClick={onClear}
            className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3.5 text-sm font-semibold text-red-600 hover:bg-red-500/10 disabled:opacity-40"
          >
            <Eraser size={15} />
            Clear
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[42px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] px-4 text-sm font-medium text-[color:var(--edvora-ink)] hover:bg-[color:var(--edvora-glass)]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || !subjectId}
              onClick={() =>
                onSave({
                  subjectId,
                  teacherId,
                  roomId: roomId || null,
                  isPractical,
                  overwrite: true,
                })
              }
              className="h-[42px] rounded-xl theme-btn-primary px-6 text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
      {saving && <EdvoraLoader overlay message="Updating period…" />}
    </div>
  );
}

export default function ClassTimetableGrid() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { yearId, setYearId, yearOptions, loading: yearLoading } =
    useAcademicYear();
  const [payload, setPayload] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schoolStart, setSchoolStart] = useState("08:00");
  const [schoolEnd, setSchoolEnd] = useState("15:00");
  const [savingHours, setSavingHours] = useState(false);

  const load = async () => {
    if (!yearId || !classId) return;
    try {
      setLoading(true);
      const data = await getTimetableByClass(yearId, classId);
      setPayload(data);
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to load timetable",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [roomResult, staffResult, classResult] = await Promise.all([
          listRooms("ACTIVE"),
          getActiveStaffBySchool(),
          getClassesByStatus("ACTIVE"),
        ]);
        setRooms(roomResult.data || []);
        setTeachers(staffResult.staff || []);
        setClasses(classResult.data || []);
      } catch {
        /* optional */
      }
    })();
  }, []);

  useEffect(() => {
    load();
  }, [yearId, classId]);

  const workingDays = useMemo(
    () => payload?.settings?.workingDays || ["MON", "TUE", "WED", "THU", "FRI"],
    [payload]
  );

  useEffect(() => {
    setSchoolStart(payload?.settings?.schoolStart || "08:00");
    setSchoolEnd(payload?.settings?.schoolEnd || "15:00");
  }, [payload?.settings?.schoolStart, payload?.settings?.schoolEnd]);

  const handleApplyHours = async () => {
    if (!yearId) return;
    const start = schoolStart.split(":").map(Number);
    const end = schoolEnd.split(":").map(Number);
    const startMin = start[0] * 60 + (start[1] || 0);
    const endMin = end[0] * 60 + (end[1] || 0);
    if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || endMin <= startMin) {
      openSnackbar({
        message: "School end time must be after the start time",
        variant: "warning",
      });
      return;
    }
    try {
      setSavingHours(true);
      const settings = await upsertTimetableSettings({
        academicYearId: yearId,
        workingDays,
        schoolStart,
        schoolEnd,
      });
      setPayload((prev) => ({
        ...prev,
        settings: settings || {
          ...(prev?.settings || {}),
          schoolStart,
          schoolEnd,
          workingDays,
        },
      }));
      openSnackbar({ message: "School hours saved", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to save school hours",
        variant: "error",
      });
    } finally {
      setSavingHours(false);
    }
  };

  const handleSave = async (form) => {
    try {
      setSaving(true);
      const targetClassId = form.classId || classId;
      const result = await saveScheduleBlock({
        academicYearId: yearId,
        ...form,
        classId: targetClassId,
      });
      if (!result.ok) {
        openSnackbar({
          message:
            result.conflicts?.map((item) => item.message).join(" ") ||
            result.message ||
            "That time overlaps another period",
          variant: "error",
        });
        return false;
      }
      openSnackbar({ message: "Period saved", variant: "success" });
      if (String(targetClassId) !== String(classId)) {
        navigate(`/admin/timetable/class/${targetClassId}`);
        return true;
      }
      setPayload((prev) => ({
        ...prev,
        timetable: result.data,
      }));
      return true;
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to save period",
        variant: "error",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId) => {
    try {
      setSaving(true);
      const data = await deleteScheduleBlock({
        academicYearId: yearId,
        classId,
        entryId,
      });
      setPayload((prev) => ({ ...prev, timetable: data }));
      openSnackbar({ message: "Period deleted", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to delete period",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      const result = await publishTimetable(yearId, classId);
      if (!result.ok) {
        openSnackbar({
          message:
            result.conflicts?.map((c) => c.message).join(" ") ||
            result.message ||
            "Cannot publish",
          variant: "error",
        });
        return;
      }
      setPayload((prev) => ({ ...prev, timetable: result.data }));
      openSnackbar({ message: "Timetable published", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Publish failed",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setSaving(true);
      const data = await unpublishTimetable(yearId, classId);
      setPayload((prev) => ({ ...prev, timetable: data }));
      openSnackbar({ message: "Moved back to draft", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (yearLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading class timetable…" />
      </div>
    );
  }

  const tt = payload?.timetable;
  const status = tt?.status || "DRAFT";

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className={`relative overflow-hidden ${glassCard} p-5 sm:p-6`}>
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--edvora-primary) 28%, transparent), transparent 70%)",
          }}
        />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Link
              to="/admin/timetable"
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--edvora-primary)] hover:underline"
            >
              <ArrowLeft size={14} /> Back to dashboard
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--edvora-glass-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
              <CalendarClock size={13} />
              Class schedule
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--edvora-ink-strong)]">
              {classLabel(tt?.classId) || "Class Timetable"}
            </h1>
            <p className="mt-1.5 text-sm text-[color:var(--edvora-muted)]">
              Set the school day first, then drag any length of time to place a subject.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AcademicYearPicker
              yearId={yearId}
              yearOptions={yearOptions}
              onChange={setYearId}
            />
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${
                status === "PUBLISHED"
                  ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15"
                  : "bg-amber-500/10 text-amber-700 ring-amber-500/15"
              }`}
            >
              {status}
            </span>
            {status === "PUBLISHED" ? (
              <button
                type="button"
                disabled={saving}
                onClick={handleUnpublish}
                className="h-[44px] rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] px-4 text-sm font-semibold text-[color:var(--edvora-ink)]"
              >
                Unpublish
              </button>
            ) : (
              <button
                type="button"
                disabled={saving || !yearId}
                onClick={handlePublish}
                className="h-[44px] rounded-2xl theme-btn-primary px-5 text-sm font-semibold disabled:opacity-60"
              >
                Publish
              </button>
            )}
          </div>
        </div>
      </section>

      {!yearId ? (
        <div className={`${glassCard} p-6 text-sm text-amber-700`}>
          Select an academic year.
        </div>
      ) : (
        <>
          <section className={`${glassCard} p-4 sm:p-5`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[color:var(--edvora-ink-strong)]">
                  School hours
                </h2>
                <p className="mt-1 text-sm text-[color:var(--edvora-muted)]">
                  Periods can only be placed between these times.
                </p>
              </div>
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] lg:max-w-xl">
                <div>
                  <label className={labelClass}>From</label>
                  <CustomTimePicker
                    value={schoolStart}
                    onChange={setSchoolStart}
                    placeholder="School start"
                  />
                </div>
                <div>
                  <label className={labelClass}>To</label>
                  <CustomTimePicker
                    value={schoolEnd}
                    onChange={setSchoolEnd}
                    placeholder="School end"
                  />
                </div>
                <button
                  type="button"
                  disabled={savingHours}
                  onClick={handleApplyHours}
                  className="h-[44px] self-end rounded-xl theme-btn-primary px-5 text-sm font-semibold disabled:opacity-60"
                >
                  {savingHours ? "Saving…" : "Apply"}
                </button>
              </div>
            </div>
          </section>
          <ScheduleBoard
            workingDays={workingDays}
            schoolStart={payload?.settings?.schoolStart || schoolStart}
            schoolEnd={payload?.settings?.schoolEnd || schoolEnd}
            slots={payload?.slots || []}
            entries={tt?.entries || []}
            subjects={payload?.subjects || []}
            teachers={teachers}
            rooms={rooms}
            classes={classes}
            classId={classId}
            saving={saving}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
