import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import CustomSelect from "../../../common/CustomSelect";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";
import { getActiveStaffBySchool } from "../../../utils/classesApi";
import {
  classLabel,
  clearTimetableEntry,
  getTimetableByClass,
  listRooms,
  publishTimetable,
  teacherName,
  unpublishTimetable,
  upsertTimetableEntry,
} from "../../../utils/timetableApi";
import TimetableGridView from "./TimetableGridView";
import { AcademicYearPicker, useAcademicYear } from "./useAcademicYear";

const labelClass = "block text-[13px] font-semibold text-[#667085] mb-1.5";

function AssignModal({
  day,
  slot,
  entry,
  allocations,
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

  const subjectOptions = allocations.map((a) => ({
    value: a.subjectId?._id || a.subjectId,
    label: a.subjectId?.subjectName || "Subject",
    teacherId: a.teacherId?._id || a.teacherId,
  }));

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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
      <div className="w-full max-w-[460px] rounded-[14px] bg-white shadow-2xl">
        <div className="flex h-14 items-center justify-between border-b px-5">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">
              Assign Period
            </h2>
            <p className="text-xs text-slate-500">
              {day} · {slot?.name} ({slot?.startTime}–{slot?.endTime})
            </p>
          </div>
          <button type="button" onClick={onClose}>
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <label className={labelClass}>Subject</label>
            <CustomSelect
              options={subjectOptions}
              value={subjectId}
              onChange={handleSubjectChange}
              placeholder="Select subject"
            />
          </div>
          <div>
            <label className={labelClass}>Teacher</label>
            <CustomSelect
              options={teacherOptions}
              value={teacherId}
              onChange={(opt) => setTeacherId(opt?.value || "")}
              placeholder="Select teacher"
            />
          </div>
          <div>
            <label className={labelClass}>Room</label>
            <CustomSelect
              options={roomOptions}
              value={roomId}
              onChange={(opt) => setRoomId(opt?.value || "")}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[#667085]">
            <input
              type="checkbox"
              checked={isPractical}
              onChange={(e) => setIsPractical(e.target.checked)}
            />
            Practical / lab (consecutive periods)
          </label>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-t px-5 py-4">
          <button
            type="button"
            disabled={saving || !entry}
            onClick={onClear}
            className="h-[42px] rounded-lg border border-red-200 px-3 text-sm text-red-600 disabled:opacity-40"
          >
            Clear
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[42px] rounded-lg border border-[#D0D5DD] px-4 text-sm"
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
              className="h-[42px] rounded-lg bg-[#A77A95] px-4 text-sm font-medium text-white hover:bg-[#8F6580] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClassTimetableGrid() {
  const { classId } = useParams();
  const { yearId, setYearId, yearOptions, loading: yearLoading } =
    useAcademicYear();
  const [payload, setPayload] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cell, setCell] = useState(null);
  const [saving, setSaving] = useState(false);

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
        const [roomResult, staffResult] = await Promise.all([
          listRooms("ACTIVE"),
          getActiveStaffBySchool(),
        ]);
        setRooms(roomResult.data || []);
        setTeachers(staffResult.staff || []);
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

  const handleSave = async (form) => {
    try {
      setSaving(true);
      const result = await upsertTimetableEntry({
        academicYearId: yearId,
        classId,
        day: cell.day,
        timeSlotId: cell.slot._id,
        ...form,
      });
      if (!result.ok) {
        openSnackbar({
          message:
            result.conflicts?.map((c) => c.message).join(" ") ||
            result.message ||
            "Conflict detected",
          variant: "error",
        });
        return;
      }
      if (result.warnings?.length) {
        openSnackbar({
          message: result.warnings.map((w) => w.message).join(" "),
          variant: "warning",
        });
      } else {
        openSnackbar({ message: "Period assigned", variant: "success" });
      }
      setPayload((prev) => ({
        ...prev,
        timetable: result.data,
      }));
      setCell(null);
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to save",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    try {
      setSaving(true);
      const data = await clearTimetableEntry({
        academicYearId: yearId,
        classId,
        day: cell.day,
        timeSlotId: cell.slot._id,
      });
      setPayload((prev) => ({ ...prev, timetable: data }));
      setCell(null);
      openSnackbar({ message: "Period cleared", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to clear",
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
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            to="/admin/timetable"
            className="mb-2 inline-flex items-center gap-1 text-sm text-[#A77A95] hover:underline"
          >
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <h1 className="text-xl font-semibold text-[#735366] sm:text-2xl">
            {classLabel(tt?.classId) || "Class Timetable"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Click a cell to assign subject, teacher, and room.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AcademicYearPicker
            yearId={yearId}
            yearOptions={yearOptions}
            onChange={setYearId}
          />
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              status === "PUBLISHED"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {status}
          </span>
          {status === "PUBLISHED" ? (
            <button
              type="button"
              disabled={saving}
              onClick={handleUnpublish}
              className="h-[42px] rounded-lg border border-[#E8D5CE] px-4 text-sm font-medium text-[#735366]"
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              disabled={saving || !yearId}
              onClick={handlePublish}
              className="h-[42px] rounded-lg bg-[#A77A95] px-4 text-sm font-medium text-white hover:bg-[#8F6580] disabled:opacity-60"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      {!yearId ? (
        <p className="text-sm text-amber-700">Select an academic year.</p>
      ) : (
        <TimetableGridView
          workingDays={workingDays}
          slots={payload?.slots || []}
          entries={tt?.entries || []}
          readOnly={false}
          onCellClick={setCell}
        />
      )}

      {cell && (
        <AssignModal
          day={cell.day}
          slot={cell.slot}
          entry={cell.entry}
          allocations={payload?.allocations || []}
          rooms={rooms}
          teachers={teachers}
          saving={saving}
          onClose={() => setCell(null)}
          onSave={handleSave}
          onClear={handleClear}
        />
      )}
    </div>
  );
}
