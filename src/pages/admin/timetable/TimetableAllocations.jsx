import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import CustomSelect from "../../../common/CustomSelect";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";
import { getActiveClasses, getActiveStaffBySchool } from "../../../utils/classesApi";
import {
  ROOM_TYPES,
  createAllocation,
  deleteAllocation,
  listAllocationsByClass,
  listSubjectsByClass,
  teacherName,
} from "../../../utils/timetableApi";
import TimetableSubnav from "./TimetableSubnav";
import { AcademicYearPicker, useAcademicYear } from "./useAcademicYear";

const inputClass =
  "w-full h-[42px] rounded-lg border border-[#D0D5DD] bg-white px-3 text-[14px] text-[#344054] outline-none focus:border-[color:var(--edvora-primary)]";
const labelClass = "block text-[13px] font-semibold text-[#667085] mb-1.5";

export default function TimetableAllocations() {
  const { yearId, setYearId, yearOptions, loading: yearLoading } =
    useAcademicYear();
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [allocations, setAllocations] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    subjectId: "",
    teacherId: "",
    periodsPerWeek: 5,
    preferredRoomType: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [classResult, staffResult] = await Promise.all([
          getActiveClasses(),
          getActiveStaffBySchool(),
        ]);
        const list = classResult?.data || [];
        setClasses(Array.isArray(list) ? list : []);
        setTeachers(staffResult?.staff || []);
      } catch (error) {
        openSnackbar({
          message: error?.response?.data?.message || "Failed to load classes",
          variant: "error",
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!yearId || !classId) {
      setAllocations([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [allocs, subs] = await Promise.all([
          listAllocationsByClass(yearId, classId),
          listSubjectsByClass(classId),
        ]);
        if (!cancelled) {
          setAllocations(allocs);
          setSubjects(subs);
        }
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message || "Failed to load allocations",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [yearId, classId]);

  const classOptions = classes.map((c) => ({
    value: c._id,
    label: `${c.className} ${c.section}`,
  }));
  const subjectOptions = subjects.map((s) => ({
    value: s._id,
    label: `${s.subjectName} (${s.subjectCode})`,
  }));
  const teacherOptions = teachers.map((t) => ({
    value: t._id,
    label: teacherName(t),
  }));
  const roomTypeOptions = [
    { value: "", label: "Any" },
    ...ROOM_TYPES,
  ];

  const handleCreate = async () => {
    if (!form.subjectId || !form.teacherId) {
      return openSnackbar({
        message: "Subject and teacher are required",
        variant: "warning",
      });
    }
    try {
      setSubmitting(true);
      const created = await createAllocation({
        academicYearId: yearId,
        classId,
        ...form,
        preferredRoomType: form.preferredRoomType || "",
      });
      setAllocations((prev) => [...prev, created]);
      setShowModal(false);
      setForm({
        subjectId: "",
        teacherId: "",
        periodsPerWeek: 5,
        preferredRoomType: "",
      });
      openSnackbar({ message: "Allocation created", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to create",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAllocation(id);
      setAllocations((prev) => prev.filter((a) => a._id !== id));
      openSnackbar({ message: "Allocation removed", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to delete",
        variant: "error",
      });
    }
  };

  if (yearLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading…" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[color:var(--edvora-ink-strong)] sm:text-2xl">
            Subject Allocation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Assign teachers and weekly periods per class subject.
          </p>
        </div>
        <button
          type="button"
          disabled={!yearId || !classId}
          onClick={() => setShowModal(true)}
          className="inline-flex h-[42px] items-center gap-2 rounded-lg bg-[color:var(--edvora-primary)] px-4 text-sm font-medium text-white hover:bg-[color:var(--edvora-primary-hover)] disabled:opacity-50"
        >
          <Plus size={16} /> Add Allocation
        </button>
      </div>

      <TimetableSubnav />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <AcademicYearPicker
          yearId={yearId}
          yearOptions={yearOptions}
          onChange={setYearId}
        />
        <div className="min-w-[220px]">
          <label className={labelClass}>Class</label>
          <CustomSelect
            options={classOptions}
            value={classId}
            onChange={(opt) => setClassId(opt?.value || "")}
            placeholder="Select class"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <EdvoraLoader message="Loading allocations…" />
        </div>
      ) : !classId ? (
        <div className="rounded-xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">Select a class to continue.</p>
        </div>
      ) : !allocations.length ? (
        <div className="rounded-xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            No allocations yet
            {subjects.length === 0
              ? " — add subjects for this class first."
              : "."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-[color:var(--edvora-primary-soft)]/60 text-[#667085]">
              <tr>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Teacher</th>
                <th className="px-4 py-3 font-semibold">Periods/Week</th>
                <th className="px-4 py-3 font-semibold">Room Type</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => (
                <tr key={a._id} className="border-b border-slate-50">
                  <td className="px-4 py-3 text-[color:var(--edvora-ink-strong)]">
                    {a.subjectId?.subjectName || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {teacherName(a.teacherId)}
                  </td>
                  <td className="px-4 py-3">{a.periodsPerWeek}</td>
                  <td className="px-4 py-3">{a.preferredRoomType || "Any"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(a._id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
          <div className="w-full max-w-[480px] rounded-[14px] bg-white shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b px-5">
              <h2 className="text-base font-semibold text-[#111827]">
                Add Allocation
              </h2>
              <button type="button" onClick={() => setShowModal(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <label className={labelClass}>Subject</label>
                <CustomSelect
                  options={subjectOptions}
                  value={form.subjectId}
                  onChange={(opt) =>
                    setForm((p) => ({ ...p, subjectId: opt?.value || "" }))
                  }
                  placeholder="Select subject"
                />
              </div>
              <div>
                <label className={labelClass}>Teacher</label>
                <CustomSelect
                  options={teacherOptions}
                  value={form.teacherId}
                  onChange={(opt) =>
                    setForm((p) => ({ ...p, teacherId: opt?.value || "" }))
                  }
                  placeholder="Select teacher"
                />
              </div>
              <div>
                <label className={labelClass}>Periods per week</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className={inputClass}
                  value={form.periodsPerWeek}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      periodsPerWeek: Number(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Preferred room type</label>
                <CustomSelect
                  options={roomTypeOptions}
                  value={form.preferredRoomType}
                  onChange={(opt) =>
                    setForm((p) => ({
                      ...p,
                      preferredRoomType: opt?.value || "",
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-[42px] rounded-lg border border-[#D0D5DD] px-4 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCreate}
                className="h-[42px] rounded-lg bg-[color:var(--edvora-primary)] px-4 text-sm font-medium text-white hover:bg-[color:var(--edvora-primary-hover)] disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
