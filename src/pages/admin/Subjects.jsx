import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Hash,
  Layers3,
  Pencil,
  Plus,
  Power,
  Trash2,
  Users,
  X,
} from "lucide-react";
import EdvoraLoader from "../../common/EdvoraLoader";
import StatusFilterSwitch from "../../common/StatusFilterSwitch";
import { openSnackbar } from "../../common/snackbar/snackbar";
import { getClassesByStatus } from "../../utils/classesApi";
import {
  addSubject,
  assignSubjectToClasses,
  deleteSubject,
  getSubjectsBySchool,
  updateSubject,
  updateSubjectStatus,
} from "../../utils/subjectsApi";

const inputClass =
  "w-full h-[44px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] backdrop-blur-md px-3.5 text-[14px] text-[color:var(--edvora-ink-strong)] outline-none focus:border-[color:var(--edvora-primary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--edvora-primary)_16%,transparent)]";
const labelClass =
  "block text-[12px] font-semibold tracking-wide uppercase text-[color:var(--edvora-muted)] mb-1.5";
const glassCard =
  "rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] shadow-[var(--edvora-glass-shadow)] backdrop-blur-[18px] saturate-[165%]";

function classLabel(c) {
  if (!c) return "—";
  return c.section ? `${c.className} · Sec ${c.section}` : c.className;
}

function StatusBadge({ status }) {
  const inactive = status === "INACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ring-1 ${
        inactive ? "theme-status-inactive" : "theme-status-active"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          inactive
            ? "bg-[color:var(--edvora-danger)]"
            : "bg-[color:var(--edvora-success)]"
        }`}
      />
      {inactive ? "Inactive" : "Active"}
    </span>
  );
}

function ClassChecklist({ classes, selected, onChange }) {
  const selectedSet = useMemo(() => new Set(selected.map(String)), [selected]);

  const toggle = (id) => {
    const next = new Set(selectedSet);
    const key = String(id);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange([...next]);
  };

  if (!classes.length) {
    return (
      <p className="text-sm text-[color:var(--edvora-muted)]">
        No active classes yet. Create classes first, then assign subjects.
      </p>
    );
  }

  return (
    <div className="max-h-52 overflow-y-auto rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] p-2 space-y-1">
      {classes.map((c) => {
        const id = String(c._id);
        const checked = selectedSet.has(id);
        return (
          <label
            key={id}
            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              checked
                ? "bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-ink-strong)]"
                : "text-[color:var(--edvora-ink)] hover:bg-[color:var(--edvora-glass)]"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(id)}
              className="h-4 w-4 accent-[color:var(--edvora-primary)]"
            />
            <span className="font-medium">{classLabel(c)}</span>
          </label>
        );
      })}
    </div>
  );
}

function SubjectFormModal({ initial, classes, onClose, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState({
    subjectName: initial?.subjectName || "",
    description: initial?.description || "",
    classIds: (initial?.assignedClassIds ||
      initial?.classIds?.map((c) => c._id || c) ||
      [])
      .map(String)
      .filter(Boolean),
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.subjectName.trim()) {
      return openSnackbar({
        message: "Subject name is required",
        variant: "warning",
      });
    }

    try {
      setSubmitting(true);
      if (isEdit) {
        const updated = await updateSubject({
          subjectId: initial._id,
          subjectName: form.subjectName,
          description: form.description,
        });
        const assigned = await assignSubjectToClasses(
          initial._id,
          form.classIds
        );
        openSnackbar({ message: "Subject updated", variant: "success" });
        onSaved?.(assigned || updated);
      } else {
        const created = await addSubject({
          subjectName: form.subjectName,
          description: form.description,
          classIds: form.classIds,
        });
        openSnackbar({ message: "Subject created", variant: "success" });
        onSaved?.(created);
      }
      onClose();
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message ||
          (isEdit ? "Failed to update subject" : "Failed to create subject"),
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[color:var(--edvora-overlay)] backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-[560px] max-h-[90dvh] glass-strong rounded-2xl overflow-hidden flex flex-col">
        <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[color:var(--edvora-glass-border-soft)] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)]">
              {isEdit ? <Pencil size={18} /> : <BookOpen size={18} />}
            </span>
            <h2 className="text-base sm:text-[18px] font-semibold text-[color:var(--edvora-ink-strong)] truncate">
              {isEdit ? "Edit Subject" : "Add Subject"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[color:var(--edvora-primary)] text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              value={form.subjectName}
              onChange={(e) =>
                setForm((p) => ({ ...p, subjectName: e.target.value }))
              }
              placeholder="e.g. Mathematics"
            />
            <p className="mt-1.5 text-xs text-[color:var(--edvora-muted)]">
              A unique code is generated automatically for this school.
            </p>
          </div>

          {isEdit && initial?.subjectCode ? (
            <div>
              <label className={labelClass}>Subject Code</label>
              <div className="flex h-[44px] items-center gap-2 rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] px-3.5 text-sm font-semibold text-[color:var(--edvora-ink)]">
                <Hash size={14} className="text-[color:var(--edvora-primary)]" />
                {initial.subjectCode}
              </div>
            </div>
          ) : null}

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] p-3.5 text-[14px] text-[color:var(--edvora-ink-strong)] outline-none resize-none focus:border-[color:var(--edvora-primary)]"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Optional short description"
            />
          </div>

          <div>
            <label className={labelClass}>Add to classes</label>
            <ClassChecklist
              classes={classes}
              selected={form.classIds}
              onChange={(classIds) => setForm((p) => ({ ...p, classIds }))}
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-[color:var(--edvora-glass-border-soft)] flex justify-end gap-3 shrink-0 bg-[color:var(--edvora-glass-soft)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-[42px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] text-sm font-medium text-[color:var(--edvora-ink)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="px-6 h-[42px] rounded-xl theme-btn-primary text-sm font-semibold disabled:opacity-60"
          >
            {submitting
              ? "Saving…"
              : isEdit
                ? "Save Changes"
                : "Create Subject"}
          </button>
        </div>
      </div>
      {submitting && (
        <EdvoraLoader
          overlay
          message={isEdit ? "Updating subject…" : "Creating subject…"}
        />
      )}
    </div>
  );
}

function AssignClassesModal({ subject, classes, onClose, onSaved }) {
  const [classIds, setClassIds] = useState(
    (subject?.assignedClassIds ||
      subject?.classIds?.map((c) => c._id || c) ||
      [])
      .map(String)
      .filter(Boolean)
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const updated = await assignSubjectToClasses(subject._id, classIds);
      openSnackbar({ message: "Classes updated", variant: "success" });
      onSaved?.(updated);
      onClose();
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message || "Failed to assign classes",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[color:var(--edvora-overlay)] backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-[520px] glass-strong rounded-2xl overflow-hidden flex flex-col">
        <div className="h-14 px-5 flex items-center justify-between border-b border-[color:var(--edvora-glass-border-soft)]">
          <div>
            <h2 className="font-semibold text-[color:var(--edvora-ink-strong)]">
              Assign classes
            </h2>
            <p className="text-xs text-[color:var(--edvora-muted)]">
              {subject.subjectName} ({subject.subjectCode})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[color:var(--edvora-primary)] text-white flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <ClassChecklist
            classes={classes}
            selected={classIds}
            onChange={setClassIds}
          />
        </div>
        <div className="px-5 py-4 border-t border-[color:var(--edvora-glass-border-soft)] flex justify-end gap-3 bg-[color:var(--edvora-glass-soft)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-[42px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="px-5 h-[42px] rounded-xl theme-btn-primary text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save Classes"}
          </button>
        </div>
      </div>
      {submitting && <EdvoraLoader overlay message="Updating classes…" />}
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  confirmLabel,
  tone = "danger",
  loading,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[color:var(--edvora-overlay)] backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-[420px] glass-strong rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <h3 className="text-lg font-semibold text-[color:var(--edvora-ink-strong)]">
            {title}
          </h3>
          <p className="text-sm text-[color:var(--edvora-muted)] mt-2 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="px-5 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 h-[40px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] text-sm font-medium disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 h-[40px] rounded-xl text-white text-sm font-semibold disabled:opacity-60 ${
              tone === "warning"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
      {loading && <EdvoraLoader overlay message="Updating…" />}
    </div>
  );
}

function Subjects() {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [counts, setCounts] = useState({ ACTIVE: 0, INACTIVE: 0 });
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [filter, setFilter] = useState("ACTIVE");
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const reload = async (status = filter) => {
    const result = await getSubjectsBySchool(status);
    setSubjects(result.data || []);
    setCounts(result.counts || { ACTIVE: 0, INACTIVE: 0 });
    setTotalSubjects(result.totalSubjects || 0);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [subj, classResult] = await Promise.all([
          getSubjectsBySchool(filter),
          getClassesByStatus("ACTIVE"),
        ]);
        if (cancelled) return;
        setSubjects(subj.data || []);
        setCounts(subj.counts || { ACTIVE: 0, INACTIVE: 0 });
        setTotalSubjects(subj.totalSubjects || 0);
        setClasses(classResult.data || []);
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
  }, [filter]);

  const handleConfirmStatus = async () => {
    if (!statusTarget) return;
    const next =
      statusTarget.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
    try {
      setActionLoading(true);
      await updateSubjectStatus(statusTarget._id, next);
      openSnackbar({
        message:
          next === "INACTIVE"
            ? "Subject marked inactive"
            : "Subject marked active",
        variant: "success",
      });
      setStatusTarget(null);
      await reload(filter);
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message || "Failed to update status",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await deleteSubject(deleteTarget._id);
      openSnackbar({ message: "Subject deleted", variant: "success" });
      setDeleteTarget(null);
      await reload(filter);
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message || "Failed to delete subject",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className={`relative overflow-hidden ${glassCard} p-5 sm:p-7`}>
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--edvora-primary) 28%, transparent), transparent 70%)",
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--edvora-glass-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
              <Layers3 size={13} />
              Curriculum
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-[color:var(--edvora-ink-strong)]">
              Subjects
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[color:var(--edvora-muted)] leading-relaxed">
              Create school subjects once, then add them to the classes that
              teach them.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--edvora-glass-strong)] px-3.5 py-2 ring-1 ring-[color:var(--edvora-glass-border-soft)]">
                <span className="text-xs font-medium text-[color:var(--edvora-muted)]">
                  Total
                </span>
                <span className="text-lg font-bold text-[color:var(--edvora-ink-strong)] tabular-nums">
                  {loading ? "…" : totalSubjects}
                </span>
              </div>

              <StatusFilterSwitch
                value={filter}
                onChange={setFilter}
                counts={counts}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-5 h-[46px] rounded-2xl theme-btn-primary text-sm font-semibold"
          >
            <Plus size={18} />
            Add Subject
          </button>
        </div>
      </section>

      {loading ? (
        <EdvoraLoader message="Loading subjects…" />
      ) : subjects.length === 0 ? (
        <div className={`${glassCard} p-12 text-center`}>
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)]">
            <BookOpen size={24} />
          </span>
          <p className="font-semibold text-[color:var(--edvora-ink-strong)] text-lg">
            No {filter === "ACTIVE" ? "active" : "inactive"} subjects
          </p>
          <p className="text-sm text-[color:var(--edvora-muted)] mt-2 max-w-md mx-auto">
            Create a subject for your school, then assign it to one or more
            classes for timetable and allocations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 min-[1100px]:grid-cols-3 gap-4 sm:gap-5">
          {subjects.map((subject) => {
            const inactive = subject.status === "INACTIVE";
            const assigned =
              subject.classIds?.filter?.(Boolean) ||
              [];
            const classCount =
              subject.classCount ??
              subject.assignedClassIds?.length ??
              assigned.length;

            return (
              <article
                key={subject._id}
                className={`${glassCard} flex flex-col overflow-hidden`}
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)]">
                      <BookOpen size={22} />
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

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setAssignTarget(subject)}
                      className="inline-flex items-center gap-2 rounded-full bg-[color:var(--edvora-glass-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--edvora-ink)] ring-1 ring-[color:var(--edvora-glass-border-soft)] hover:border-[color:var(--edvora-primary)]"
                    >
                      <Users size={13} className="text-[color:var(--edvora-primary)]" />
                      {classCount} class{classCount === 1 ? "" : "es"}
                    </button>
                    {assigned.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {assigned.slice(0, 4).map((c) => (
                          <span
                            key={c._id || c}
                            className="rounded-md bg-[color:var(--edvora-glass-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--edvora-muted)]"
                          >
                            {typeof c === "object" ? classLabel(c) : "Class"}
                          </span>
                        ))}
                        {assigned.length > 4 ? (
                          <span className="text-[10px] text-[color:var(--edvora-muted)]">
                            +{assigned.length - 4}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-[color:var(--edvora-muted)]">
                        Not assigned to any class yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1 border-t border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)]/80 p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(subject);
                      setShowForm(true);
                    }}
                    className="flex h-10 items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-[color:var(--edvora-ink)] hover:bg-[color:var(--edvora-glass-strong)]"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignTarget(subject)}
                    className="flex h-10 items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary)]/10"
                  >
                    <Users size={12} />
                    Classes
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusTarget(subject)}
                    className={`flex h-10 items-center justify-center gap-1 rounded-xl text-[11px] font-semibold ${
                      inactive
                        ? "text-[color:var(--edvora-success-ink)] hover:bg-[color:var(--edvora-success-soft)]"
                        : "text-[color:var(--edvora-warning-ink)] hover:bg-[color:var(--edvora-warning-soft)]"
                    }`}
                  >
                    <Power size={12} />
                    {inactive ? "On" : "Off"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(subject)}
                    className="flex h-10 items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 size={12} />
                    Del
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {(showForm || editing) && (
        <SubjectFormModal
          initial={editing}
          classes={classes}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={async () => {
            await reload(filter);
          }}
        />
      )}

      {assignTarget && (
        <AssignClassesModal
          subject={assignTarget}
          classes={classes}
          onClose={() => setAssignTarget(null)}
          onSaved={async () => {
            await reload(filter);
          }}
        />
      )}

      {statusTarget && (
        <ConfirmModal
          title={
            statusTarget.status === "INACTIVE"
              ? "Activate subject?"
              : "Deactivate subject?"
          }
          description={`"${statusTarget.subjectName}" (${statusTarget.subjectCode}) will be marked ${
            statusTarget.status === "INACTIVE" ? "active" : "inactive"
          }.`}
          confirmLabel={
            statusTarget.status === "INACTIVE" ? "Activate" : "Deactivate"
          }
          tone={
            statusTarget.status === "INACTIVE" ? "warning" : "danger"
          }
          loading={actionLoading}
          onClose={() => setStatusTarget(null)}
          onConfirm={handleConfirmStatus}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete subject?"
          description={`Delete "${deleteTarget.subjectName}" (${deleteTarget.subjectCode})? Blocked if used in timetable allocations or schedules.`}
          confirmLabel="Delete"
          tone="danger"
          loading={actionLoading}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

export default Subjects;
