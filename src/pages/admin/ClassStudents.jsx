import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Hash,
  Mail,
  Phone,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import CustomSelect from "../../common/CustomSelect";
import EdvoraLoader from "../../common/EdvoraLoader";
import { openSnackbar } from "../../common/snackbar/snackbar";
import { formatPhoneDisplay } from "../../utils/phone";
import {
  assignStaffToClass,
  getActiveStaffBySchool,
  getStudentsByClass,
} from "../../utils/classesApi";
import { getSubjectsByClass } from "../../utils/subjectsApi";

const labelClass =
  "block text-[12px] font-semibold tracking-wide uppercase text-[color:var(--edvora-muted)] mb-1.5";
const glassCard =
  "rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] shadow-[var(--edvora-glass-shadow)] backdrop-blur-[18px] saturate-[165%]";

function StatusBadge({ status }) {
  const inactive = status === "INACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ring-1 ${
        inactive
          ? "bg-red-500/10 text-red-600 ring-red-500/15"
          : "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          inactive ? "bg-red-500" : "bg-emerald-500"
        }`}
      />
      {inactive ? "Inactive" : "Active"}
    </span>
  );
}

function staffOptionLabel(member) {
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ");
  const id = member.staffId;
  return id ? `${name}(${id})` : name;
}

function StudentCard({ student }) {
  const fullName = [student.firstName, student.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${glassCard} p-4`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
          <UserRound size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[color:var(--edvora-ink-strong)] truncate">
              {fullName}
            </p>
            <StatusBadge status={student.status} />
          </div>
          {student.admissionNumber ? (
            <p className="text-xs text-[color:var(--edvora-muted)] mt-0.5">
              Admission: {student.admissionNumber}
            </p>
          ) : null}
          <div className="mt-3 space-y-1.5">
            {student.rollNumber ? (
              <p className="text-sm text-[color:var(--edvora-ink)]">
                Roll No: {student.rollNumber}
              </p>
            ) : null}
            {student.email ? (
              <p className="flex items-center gap-2 text-sm text-[color:var(--edvora-ink)] truncate">
                <Mail size={14} className="shrink-0 text-[color:var(--edvora-primary)]" />
                {student.email}
              </p>
            ) : null}
            {student.phone ? (
              <p className="flex items-center gap-2 text-sm text-[color:var(--edvora-ink)]">
                <Phone size={14} className="shrink-0 text-[color:var(--edvora-primary)]" />
                {formatPhoneDisplay(student.phone, student.phoneCode)}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentTable({ students }) {
  return (
    <div className={`${glassCard} w-full min-w-0 max-w-full overflow-hidden`}>
      <div className="table-scroll w-full max-w-full">
        <table className="w-full min-w-[960px] border-collapse">
          <thead className="bg-[color:var(--edvora-glass-soft)]">
            <tr>
              {[
                "Name",
                "Admission No",
                "Roll No",
                "Email",
                "Phone",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="p-3 sm:p-4 text-left text-sm font-semibold text-[color:var(--edvora-muted)] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const fullName = [student.firstName, student.lastName]
                .filter(Boolean)
                .join(" ");
              const phone = formatPhoneDisplay(
                student.phone,
                student.phoneCode
              );

              return (
                <tr
                  key={student._id}
                  className="border-t border-[color:var(--edvora-glass-border-soft)]"
                >
                  <td className="p-3 sm:p-4 text-sm text-[color:var(--edvora-ink-strong)] font-medium whitespace-nowrap">
                    {fullName || "—"}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-[color:var(--edvora-ink)] whitespace-nowrap">
                    {student.admissionNumber || "—"}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-[color:var(--edvora-ink)] whitespace-nowrap">
                    {student.rollNumber || "—"}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-[color:var(--edvora-ink)] whitespace-nowrap">
                    {student.email || "—"}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-[color:var(--edvora-ink)] whitespace-nowrap">
                    {phone}
                  </td>
                  <td className="p-3 sm:p-4 text-sm whitespace-nowrap">
                    <StatusBadge status={student.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AssignStaffModal({
  classId,
  currentTeacherId,
  currentTeacherLabel,
  onClose,
  onAssigned,
}) {
  const [staffOptions, setStaffOptions] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const isUpdate = Boolean(currentTeacherId);

  useEffect(() => {
    let cancelled = false;

    const loadStaff = async () => {
      try {
        setLoadingStaff(true);
        const result = await getActiveStaffBySchool();
        if (cancelled) return;

        const options = (result.staff || []).map((member) => ({
          value: member._id,
          label: staffOptionLabel(member),
        }));

        setStaffOptions(options);

        if (currentTeacherId) {
          const current = options.find(
            (option) => String(option.value) === String(currentTeacherId)
          );
          if (current) setSelectedStaff(current);
        }
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message || "Failed to load staff list",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoadingStaff(false);
      }
    };

    loadStaff();
    return () => {
      cancelled = true;
    };
  }, [currentTeacherId]);

  const handleSubmit = async () => {
    if (!selectedStaff?.value) {
      return openSnackbar({
        message: "Please select a staff member",
        variant: "warning",
      });
    }

    if (
      isUpdate &&
      String(selectedStaff.value) === String(currentTeacherId)
    ) {
      return openSnackbar({
        message: "This staff member is already assigned to this class",
        variant: "warning",
      });
    }

    try {
      setSubmitting(true);
      const result = await assignStaffToClass(classId, selectedStaff.value);
      openSnackbar({
        message: isUpdate
          ? "Assigned staff updated successfully"
          : "Staff assigned to class successfully",
        variant: "success",
      });
      onAssigned?.(result);
      onClose();
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message ||
          (isUpdate
            ? "Failed to update assigned staff"
            : "Failed to assign staff to class"),
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-[color:var(--edvora-overlay)] backdrop-blur-md p-0 sm:p-4">
      <div className="w-full max-w-[520px] glass-strong rounded-t-2xl sm:rounded-2xl overflow-visible flex flex-col">
        <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[color:var(--edvora-glass-border-soft)] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)]">
              <UserPlus size={18} />
            </span>
            <h2 className="text-base sm:text-[18px] font-semibold text-[color:var(--edvora-ink-strong)] truncate">
              {isUpdate ? "Update Assigned Staff" : "Assign Staff"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-hover)] text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-5 space-y-4 overflow-visible">
          {currentTeacherLabel ? (
            <div className="rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] px-3.5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--edvora-primary)]">
                Currently assigned
              </p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--edvora-ink-strong)]">
                {currentTeacherLabel}
              </p>
            </div>
          ) : null}

          <div className="relative z-10">
            <label className={labelClass}>
              {isUpdate ? "New staff" : "Staff"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              options={staffOptions}
              placeholder={
                loadingStaff
                  ? "Loading staff…"
                  : staffOptions.length === 0
                    ? "No active staff found"
                    : isUpdate
                      ? "Select new staff member"
                      : "Select staff member"
              }
              isSearchable
              isLoading={loadingStaff}
              isDisabled={loadingStaff || submitting}
              value={selectedStaff}
              onChange={(option) => setSelectedStaff(option)}
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-[color:var(--edvora-glass-border-soft)] flex justify-end gap-3 shrink-0 bg-[color:var(--edvora-glass-soft)]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-[42px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] text-[color:var(--edvora-ink)] text-sm font-medium hover:bg-[color:var(--edvora-glass)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || loadingStaff}
            className="px-6 h-[42px] rounded-xl theme-btn-primary text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? isUpdate
                ? "Updating…"
                : "Assigning…"
              : isUpdate
                ? "Update Staff"
                : "Assign Staff"}
          </button>
        </div>
      </div>
      {submitting && (
        <EdvoraLoader
          overlay
          message={isUpdate ? "Updating staff…" : "Assigning staff…"}
        />
      )}
    </div>
  );
}


function ClassSubjectsPanel({ classId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const result = await getSubjectsByClass(classId, "ACTIVE");
        if (!cancelled) setSubjects(result.data || []);
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message || "Failed to load subjects",
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
  }, [classId]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[color:var(--edvora-muted)]">
          Subjects assigned to this class from the Subjects module.
        </p>
        <button
          type="button"
          onClick={() => navigate("/admin/subjects")}
          className="inline-flex items-center gap-2 px-4 h-[44px] rounded-2xl theme-btn-primary text-sm font-semibold"
        >
          <ExternalLink size={16} />
          Manage Subjects
        </button>
      </div>

      {loading ? (
        <EdvoraLoader message="Loading subjects…" />
      ) : subjects.length === 0 ? (
        <div className={`${glassCard} p-12 text-center`}>
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)]">
            <BookOpen size={24} />
          </span>
          <p className="font-semibold text-[color:var(--edvora-ink-strong)] text-lg">
            No subjects assigned
          </p>
          <p className="text-sm text-[color:var(--edvora-muted)] mt-2 max-w-md mx-auto">
            Create subjects in the Subjects module and add this class to them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 min-[1100px]:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <article key={subject._id} className={`${glassCard} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)]">
                  <BookOpen size={20} />
                </span>
                <StatusBadge status={subject.status} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[color:var(--edvora-ink-strong)] truncate">
                {subject.subjectName}
              </h3>
              <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--edvora-muted)]">
                <Hash size={12} />
                {subject.subjectCode}
              </p>
              {subject.description ? (
                <p className="mt-3 text-sm text-[color:var(--edvora-muted)] line-clamp-2">
                  {subject.description}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ClassStudents() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("students");
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!classId) return;

      try {
        setLoading(true);
        const result = await getStudentsByClass(classId);
        if (cancelled) return;
        setClassInfo(result.classInfo);
        setStudents(result.students);
        setTotalStudents(result.totalStudents);
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message ||
              "Failed to load class students",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  const assignedTeacherLabel = classInfo?.classTeacher
    ? staffOptionLabel(classInfo.classTeacher)
    : null;
  const hasAssignedStaff = Boolean(classInfo?.classTeacherId);

  return (
    <div className="w-full min-w-0 max-w-full space-y-5 sm:space-y-6">
      <section className={`relative overflow-hidden ${glassCard} p-5 sm:p-6`}>
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--edvora-primary) 28%, transparent), transparent 70%)",
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-start gap-4 min-w-0">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--edvora-primary)] text-white shadow-md">
              <BookOpen size={22} />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--edvora-ink-strong)]">
                {classInfo?.className || "Class"}
              </h1>
              <p className="text-[color:var(--edvora-muted)] mt-1 text-sm sm:text-base">
                {classInfo?.section ? `Section ${classInfo.section}` : "Class detail"}
                {" · "}
                Students and subjects for this class
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <span className="font-semibold text-[color:var(--edvora-ink-strong)]">
                  Students: {loading ? "…" : totalStudents}
                </span>
                <span className="text-[color:var(--edvora-muted)]">
                  Staff:{" "}
                  <span className="font-medium text-[color:var(--edvora-ink)]">
                    {loading
                      ? "…"
                      : assignedTeacherLabel || "Not assigned"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tab === "students" && (
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
                disabled={loading || !classInfo}
                className="inline-flex items-center gap-2 px-4 h-[44px] rounded-2xl theme-btn-primary text-sm font-semibold disabled:opacity-60"
              >
                <UserPlus size={16} />
                {hasAssignedStaff ? "Update Staff" : "Assign Staff"}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/admin/classes")}
              className="inline-flex items-center gap-2 px-4 h-[44px] rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] text-sm font-semibold text-[color:var(--edvora-ink)]"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        </div>
      </section>

      <div className="inline-flex rounded-2xl bg-[color:var(--edvora-glass-soft)] p-1 ring-1 ring-[color:var(--edvora-glass-border-soft)]">
        <button
          type="button"
          onClick={() => setTab("students")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === "students"
              ? "bg-[color:var(--edvora-primary)] text-white shadow-md"
              : "text-[color:var(--edvora-ink)] hover:bg-[color:var(--edvora-glass)]"
          }`}
        >
          Students
        </button>
        <button
          type="button"
          onClick={() => setTab("subjects")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === "subjects"
              ? "bg-[color:var(--edvora-primary)] text-white shadow-md"
              : "text-[color:var(--edvora-ink)] hover:bg-[color:var(--edvora-glass)]"
          }`}
        >
          Subjects
        </button>
      </div>

      {tab === "students" ? (
        loading ? (
          <EdvoraLoader message="Loading students…" />
        ) : students.length === 0 ? (
          <div className={`${glassCard} p-10 text-center`}>
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)]">
              <UserRound size={22} />
            </span>
            <p className="text-[color:var(--edvora-ink-strong)] font-medium">
              No students found
            </p>
            <p className="text-[color:var(--edvora-muted)] text-sm mt-1">
              There are no students enrolled in this class yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {students.map((student) => (
                <StudentCard key={student._id} student={student} />
              ))}
            </div>
            <div className="hidden lg:block w-full min-w-0 max-w-full">
              <StudentTable students={students} />
            </div>
          </>
        )
      ) : (
        <ClassSubjectsPanel classId={classId} />
      )}

      {showAssignModal && (
        <AssignStaffModal
          classId={classId}
          currentTeacherId={classInfo?.classTeacherId}
          currentTeacherLabel={assignedTeacherLabel}
          onClose={() => setShowAssignModal(false)}
          onAssigned={(result) => {
            setClassInfo((prev) => ({
              ...prev,
              classTeacherId:
                result?.class?.classTeacherId || result?.classTeacher?._id,
              classTeacher: result?.classTeacher || null,
            }));
          }}
        />
      )}
    </div>
  );
}

export default ClassStudents;
