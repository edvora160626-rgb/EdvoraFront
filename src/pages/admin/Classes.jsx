import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
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
import {
  addClass,
  deleteClass,
  getClassesByStatus,
  updateClass,
  updateClassStatus,
} from "../../utils/classesApi";

const EMPTY_FORM = {
  className: "",
  section: "",
};

/** Letters, numbers, and spaces only (no special characters). */
const ALPHANUMERIC_SPACE = /[^a-zA-Z0-9\s]/g;
const VALID_CLASS_FIELD = /^[a-zA-Z0-9]+(?:\s+[a-zA-Z0-9]+)*$/;

function sanitizeAlphanumeric(value, { allowSpace = true } = {}) {
  const cleaned = String(value || "").replace(
    allowSpace ? ALPHANUMERIC_SPACE : /[^a-zA-Z0-9]/g,
    ""
  );
  return allowSpace ? cleaned.replace(/\s{2,}/g, " ") : cleaned;
}

const inputClass =
  "w-full h-[44px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] backdrop-blur-md px-3.5 text-[14px] text-[color:var(--edvora-ink-strong)] outline-none focus:border-[color:var(--edvora-primary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--edvora-primary)_16%,transparent)]";
const labelClass =
  "block text-[12px] font-semibold tracking-wide uppercase text-[color:var(--edvora-muted)] mb-1.5";

function ClassFormModal({ mode = "add", initial, onClose, onSaved }) {
  const [formData, setFormData] = useState(
    initial
      ? {
          className: sanitizeAlphanumeric(initial.className || ""),
          section: sanitizeAlphanumeric(initial.section || "", {
            allowSpace: false,
          }),
        }
      : EMPTY_FORM
  );
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === "edit";

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next =
      name === "section"
        ? sanitizeAlphanumeric(value, { allowSpace: false })
        : sanitizeAlphanumeric(value, { allowSpace: true });
    setFormData((prev) => ({ ...prev, [name]: next }));
  };

  const handleSubmit = async () => {
    const className = formData.className.trim();
    const section = formData.section.trim();

    if (!className || !section) {
      return openSnackbar({
        message: "Class name and section are required",
        variant: "warning",
      });
    }

    if (!VALID_CLASS_FIELD.test(className) || !VALID_CLASS_FIELD.test(section)) {
      return openSnackbar({
        message: "Only letters and numbers are allowed (no special characters)",
        variant: "warning",
      });
    }

    try {
      setSubmitting(true);

      if (isEdit) {
        const updated = await updateClass({
          classId: initial._id,
          className,
          section,
        });
        openSnackbar({
          message: "Class updated successfully",
          variant: "success",
        });
        onSaved?.(updated || { ...initial, className, section });
      } else {
        const created = await addClass({
          className,
          section,
        });
        openSnackbar({
          message: "Class created successfully",
          variant: "success",
        });
        onSaved?.(
          created || {
            className,
            section: section.toUpperCase(),
            strength: 0,
            status: "ACTIVE",
            _id: crypto.randomUUID(),
          }
        );
      }
      onClose();
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message ||
          (isEdit ? "Failed to update class" : "Failed to create class"),
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[color:var(--edvora-overlay)] backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-[520px] max-h-[90dvh] glass-strong rounded-2xl overflow-hidden flex flex-col">
        <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[color:var(--edvora-glass-border-soft)] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
              {isEdit ? <Pencil size={18} /> : <BookOpen size={18} />}
            </span>
            <h2 className="text-base sm:text-[18px] font-semibold text-[color:var(--edvora-ink-strong)] truncate">
              {isEdit ? "Edit Class" : "Add Class"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-hover)] text-white flex items-center justify-center shadow-md"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="className"
                value={formData.className}
                onChange={handleChange}
                placeholder="e.g. Grade 1, Class 10, LKG"
                inputMode="text"
                autoComplete="off"
                pattern="[A-Za-z0-9 ]+"
                title="Only letters and numbers"
                className={inputClass}
              />
              <p className="mt-1.5 text-[11px] text-[color:var(--edvora-muted)]">
                Letters and numbers only — no special characters.
              </p>
            </div>

            <div>
              <label className={labelClass}>
                Section <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="e.g. A, B, C"
                maxLength={5}
                inputMode="text"
                autoComplete="off"
                pattern="[A-Za-z0-9]+"
                title="Only letters and numbers"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-[color:var(--edvora-glass-border-soft)] flex justify-end gap-3 shrink-0 bg-[color:var(--edvora-glass-soft)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-[42px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] text-[color:var(--edvora-ink)] text-sm font-medium hover:bg-[color:var(--edvora-glass)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 h-[42px] rounded-xl theme-btn-primary text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Create Class"}
          </button>
        </div>
      </div>
      {submitting && (
        <EdvoraLoader
          overlay
          message={isEdit ? "Updating class…" : "Creating class…"}
        />
      )}
    </div>
  );
}

function ConfirmActionModal({
  title,
  description,
  confirmLabel,
  confirmTone = "danger",
  onClose,
  onConfirm,
  loading,
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
            className="px-4 h-[40px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] text-[color:var(--edvora-ink)] text-sm font-medium hover:bg-[color:var(--edvora-glass)] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 h-[40px] rounded-xl text-white text-sm font-semibold disabled:opacity-60 shadow-md ${
              confirmTone === "warning"
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

function ClassCard({ classItem, onOpen, onEdit, onToggleStatus, onDelete }) {
  const isInactive = classItem.status === "INACTIVE";
  const studentCount = classItem.strength ?? 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] shadow-[var(--edvora-glass-shadow)] backdrop-blur-[18px] saturate-[165%] transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--edvora-primary)]/35 hover:shadow-[var(--edvora-glass-shadow-lg)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-80"
        style={{
          background: isInactive
            ? "linear-gradient(135deg, color-mix(in srgb, #ef4444 12%, transparent), transparent 70%)"
            : "linear-gradient(135deg, color-mix(in srgb, var(--edvora-primary) 18%, transparent), color-mix(in srgb, var(--edvora-accent) 10%, transparent) 45%, transparent 75%)",
        }}
      />

      <button
        type="button"
        onClick={onOpen}
        className="relative w-full flex-1 text-left p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border)] shadow-sm">
            <BookOpen size={22} />
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ring-1 ${
              isInactive ? "theme-status-inactive" : "theme-status-active"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isInactive
                  ? "bg-[color:var(--edvora-danger)]"
                  : "bg-[color:var(--edvora-success)]"
              }`}
            />
            {isInactive ? "Inactive" : "Active"}
          </span>
        </div>

        <div className="mt-4 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[1.35rem] font-bold tracking-tight text-[color:var(--edvora-ink-strong)] truncate">
              {classItem.className}
            </h3>
            <ArrowUpRight
              size={16}
              className="shrink-0 text-[color:var(--edvora-muted)] opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0"
            />
          </div>
          <p className="mt-1 text-sm text-[color:var(--edvora-muted)]">
            Section{" "}
            <span className="font-semibold text-[color:var(--edvora-ink)]">
              {classItem.section}
            </span>
          </p>
        </div>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--edvora-glass-soft)] px-3 py-1.5 text-xs font-medium text-[color:var(--edvora-ink)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
          <Users size={13} className="text-[color:var(--edvora-primary)]" />
          <span>
            {studentCount} {studentCount === 1 ? "student" : "students"}
          </span>
        </div>
      </button>

      <div className="relative grid grid-cols-3 gap-1.5 border-t border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)]/80 p-2 backdrop-blur-md">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-[12px] font-semibold text-[color:var(--edvora-ink)] transition hover:bg-[color:var(--edvora-glass-strong)] hover:text-[color:var(--edvora-primary-deep)]"
        >
          <Pencil size={13} />
          Edit
        </button>
        <button
          type="button"
          onClick={onToggleStatus}
          className={`flex h-10 items-center justify-center gap-1.5 rounded-xl text-[12px] font-semibold transition ${
            isInactive
              ? "text-[color:var(--edvora-success-ink)] hover:bg-[color:var(--edvora-success-soft)]"
              : "text-[color:var(--edvora-warning-ink)] hover:bg-[color:var(--edvora-warning-soft)]"
          }`}
        >
          <Power size={13} />
          {isInactive ? "Activate" : "Deactivate"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-[12px] font-semibold text-red-600 transition hover:bg-red-500/10"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </article>
  );
}

function Classes() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [counts, setCounts] = useState({ ACTIVE: 0, INACTIVE: 0 });
  const [activeStatus, setActiveStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(true);

  const reload = async (status = activeStatus) => {
    const result = await getClassesByStatus(status);
    const list = result.data || [];
    const nextCounts = {
      ACTIVE: result.counts?.ACTIVE || 0,
      INACTIVE: result.counts?.INACTIVE || 0,
    };
    setClasses(list);
    setTotalClasses(
      result.totalClasses || nextCounts.ACTIVE + nextCounts.INACTIVE
    );
    setCounts(nextCounts);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const result = await getClassesByStatus(activeStatus);
        if (cancelled) return;

        const list = result.data || [];
        const nextCounts = {
          ACTIVE:
            result.counts?.ACTIVE ||
            (activeStatus === "ACTIVE" ? list.length : 0),
          INACTIVE:
            result.counts?.INACTIVE ||
            (activeStatus === "INACTIVE" ? list.length : 0),
        };

        setClasses(list);
        setTotalClasses(
          result.totalClasses || nextCounts.ACTIVE + nextCounts.INACTIVE
        );
        setCounts(nextCounts);
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message || "Failed to load classes",
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
  }, [activeStatus]);

  const handleStatusClick = (status) => {
    if (status === activeStatus) return;
    setActiveStatus(status);
  };

  const handleCreated = (classItem) => {
    if (!classItem) return;

    setTotalClasses((prev) => prev + 1);
    setCounts((prev) => ({
      ...prev,
      ACTIVE: (prev.ACTIVE || 0) + 1,
    }));

    if (activeStatus === "ACTIVE") {
      setClasses((prev) => [classItem, ...prev]);
    }
  };

  const handleUpdated = (updated) => {
    if (!updated?._id) return;
    setClasses((prev) =>
      prev.map((item) =>
        String(item._id) === String(updated._id)
          ? { ...item, ...updated }
          : item
      )
    );
  };

  const handleConfirmStatus = async () => {
    if (!statusTarget) return;
    const nextStatus =
      statusTarget.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";

    try {
      setActionLoading(true);
      await updateClassStatus(statusTarget._id, nextStatus);
      openSnackbar({
        message:
          nextStatus === "INACTIVE"
            ? "Class marked as inactive"
            : "Class marked as active",
        variant: "success",
      });
      setStatusTarget(null);
      await reload(activeStatus);
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message ||
          "Failed to update class status",
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
      await deleteClass(deleteTarget._id);
      openSnackbar({
        message: "Class deleted successfully",
        variant: "success",
      });
      setDeleteTarget(null);
      await reload(activeStatus);
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message || "Failed to delete class",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const statusLabel = activeStatus === "ACTIVE" ? "active" : "inactive";

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] p-5 sm:p-7 shadow-[var(--edvora-glass-shadow)] backdrop-blur-[20px] saturate-[165%]">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--edvora-primary) 28%, transparent), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--edvora-accent) 24%, transparent), transparent 70%)",
          }}
        />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--edvora-glass-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
              <Layers3 size={13} />
              School structure
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-[color:var(--edvora-ink-strong)]">
              Classes
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[color:var(--edvora-muted)] leading-relaxed">
              Create and manage classes and sections for your school.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--edvora-glass-strong)] px-3.5 py-2 ring-1 ring-[color:var(--edvora-glass-border-soft)]">
                <span className="text-xs font-medium text-[color:var(--edvora-muted)]">
                  Total
                </span>
                <span className="text-lg font-bold text-[color:var(--edvora-ink-strong)] tabular-nums">
                  {loading ? "…" : totalClasses}
                </span>
              </div>

              <StatusFilterSwitch
                value={activeStatus}
                onChange={handleStatusClick}
                counts={counts}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 h-[46px] rounded-2xl theme-btn-primary text-sm font-semibold"
          >
            <Plus size={18} />
            Add Class
          </button>
        </div>
      </section>

      {loading ? (
        <EdvoraLoader message="Loading classes…" />
      ) : classes.length === 0 ? (
        <div className="glass-strong rounded-3xl p-12 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
            <BookOpen size={24} />
          </span>
          <p className="text-[color:var(--edvora-ink-strong)] font-semibold text-lg">
            No {statusLabel} classes
          </p>
          <p className="text-[color:var(--edvora-muted)] text-sm mt-2 max-w-sm mx-auto">
            {activeStatus === "ACTIVE"
              ? 'Click "Add Class" to create your first one.'
              : "No inactive classes found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 min-[1100px]:grid-cols-3 gap-4 sm:gap-5">
          {classes.map((classItem) => (
            <ClassCard
              key={
                classItem._id ||
                `${classItem.className}-${classItem.section}`
              }
              classItem={classItem}
              onOpen={() => navigate(`/admin/classes/${classItem._id}`)}
              onEdit={() => setEditingClass(classItem)}
              onToggleStatus={() => setStatusTarget(classItem)}
              onDelete={() => setDeleteTarget(classItem)}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <ClassFormModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSaved={handleCreated}
        />
      )}

      {editingClass && (
        <ClassFormModal
          mode="edit"
          initial={editingClass}
          onClose={() => setEditingClass(null)}
          onSaved={handleUpdated}
        />
      )}

      {statusTarget && (
        <ConfirmActionModal
          title={
            statusTarget.status === "INACTIVE"
              ? "Make class active?"
              : "Make class inactive?"
          }
          description={
            statusTarget.status === "INACTIVE"
              ? `"${statusTarget.className}" (Section ${statusTarget.section}) will appear under Active classes again.`
              : `"${statusTarget.className}" (Section ${statusTarget.section}) can only be deactivated if it has no related students, attendance, timetable, subjects, or events.`
          }
          confirmLabel={
            statusTarget.status === "INACTIVE" ? "Make Active" : "Make Inactive"
          }
          confirmTone={
            statusTarget.status === "INACTIVE" ? "warning" : "danger"
          }
          loading={actionLoading}
          onClose={() => setStatusTarget(null)}
          onConfirm={handleConfirmStatus}
        />
      )}

      {deleteTarget && (
        <ConfirmActionModal
          title="Delete class?"
          description={`Delete "${deleteTarget.className}" (Section ${deleteTarget.section})? This is only allowed when the class has no related data in other modules.`}
          confirmLabel="Delete"
          confirmTone="danger"
          loading={actionLoading}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

export default Classes;
