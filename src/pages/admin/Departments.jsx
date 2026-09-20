import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  DoorClosed,
  Hash,
  Layers3,
  Mail,
  Plus,
  X,
} from "lucide-react";
import CustomSelect from "../../common/CustomSelect";
import EdvoraLoader from "../../common/EdvoraLoader";
import PhoneInput from "../../common/PhoneInput";
import StatusFilterSwitch from "../../common/StatusFilterSwitch";
import { openSnackbar } from "../../common/snackbar/snackbar";
import {
  createDepartment,
  DEPARTMENT_STATUSES,
  getDepartmentsByStatus,
} from "../../utils/departmentApi";

const EMPTY_FORM = {
  departmentName: "",
  description: "",
  email: "",
  phone: "",
  phoneCode: "91",
  roomNumber: "",
  branch: "",
  color: "#4F46E5",
  displayOrder: "",
  status: "ACTIVE",
};

const inputClass =
  "w-full h-[44px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] backdrop-blur-md px-3.5 text-[14px] text-[color:var(--edvora-ink-strong)] outline-none focus:border-[color:var(--edvora-primary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--edvora-primary)_16%,transparent)]";
const labelClass =
  "block text-[12px] font-semibold tracking-wide uppercase text-[color:var(--edvora-muted)] mb-1.5";

function AddDepartmentModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.departmentName.trim()) {
      return openSnackbar({
        message: "Department name is required",
        variant: "warning",
      });
    }

    try {
      setSubmitting(true);

      const payload = {
        departmentName: formData.departmentName.trim(),
        description: formData.description.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        phoneCode: formData.phoneCode,
        roomNumber: formData.roomNumber.trim(),
        branch: formData.branch.trim(),
        color: formData.color,
        displayOrder: Number(formData.displayOrder) || 0,
        status: formData.status,
      };

      const created = await createDepartment(payload);

      openSnackbar({
        message: "Department created successfully",
        variant: "success",
      });

      onCreated?.(created || { ...payload, _id: crypto.randomUUID() });
      onClose();
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message || "Failed to create department",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[color:var(--edvora-overlay)] backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-[720px] max-h-[90dvh] glass-strong rounded-2xl overflow-hidden flex flex-col">
        <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[color:var(--edvora-glass-border-soft)] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
              <Building2 size={18} />
            </span>
            <h2 className="text-base sm:text-[18px] font-semibold text-[color:var(--edvora-ink-strong)] truncate">
              Add Department
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="departmentName"
                value={formData.departmentName}
                onChange={handleChange}
                placeholder="e.g. Mathematics"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-[color:var(--edvora-muted)]">
                A unique department code is generated automatically for this
                school.
              </p>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--edvora-primary)]"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="department@school.com"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Phone</label>
              <PhoneInput
                phone={formData.phone}
                phoneCode={formData.phoneCode}
                onPhoneChange={(phone) =>
                  setFormData((prev) => ({ ...prev, phone }))
                }
                onPhoneCodeChange={(phoneCode) =>
                  setFormData((prev) => ({ ...prev, phoneCode }))
                }
              />
            </div>

            <div>
              <label className={labelClass}>Room Number</label>
              <div className="relative">
                <DoorClosed
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--edvora-primary)]"
                />
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="e.g. B-204"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Branch</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Branch"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                placeholder="0"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <CustomSelect
                options={DEPARTMENT_STATUSES}
                placeholder="Select status"
                isSearchable={false}
                value={
                  DEPARTMENT_STATUSES.find(
                    (option) => option.value === formData.status
                  ) || null
                }
                onChange={(option) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: option?.value || "ACTIVE",
                  }))
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="h-[44px] w-14 rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] p-1 cursor-pointer"
                />
                <span className="text-[13px] font-medium text-[color:var(--edvora-muted)] tabular-nums">
                  {formData.color}
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Short description of the department"
                className="w-full rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] backdrop-blur-md p-3.5 text-[14px] text-[color:var(--edvora-ink-strong)] outline-none resize-none focus:border-[color:var(--edvora-primary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--edvora-primary)_16%,transparent)]"
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
            {submitting ? "Saving..." : "Create Department"}
          </button>
        </div>
      </div>
      {submitting && <EdvoraLoader overlay message="Creating department…" />}
    </div>
  );
}

function DepartmentCard({ department, onClick }) {
  const isInactive = department.status === "INACTIVE";
  const accent = department.color || "#A77A95";
  const staffCount =
    department.teacherids?.length ??
    department.teachers?.length ??
    department.staffCount ??
    null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] p-5 text-left shadow-[var(--edvora-glass-shadow)] backdrop-blur-[18px] saturate-[165%] transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--edvora-primary)]/35 hover:shadow-[var(--edvora-glass-shadow-lg)]"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-90"
        style={{
          background: isInactive
            ? "linear-gradient(135deg, color-mix(in srgb, #ef4444 14%, transparent), transparent 72%)"
            : `linear-gradient(135deg, color-mix(in srgb, ${accent} 22%, transparent), color-mix(in srgb, var(--edvora-primary) 10%, transparent) 50%, transparent 78%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ring-1 ring-white/25"
          style={{ backgroundColor: accent }}
        >
          <Building2 size={22} />
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

      <div className="relative mt-4 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[1.2rem] font-bold tracking-tight text-[color:var(--edvora-ink-strong)]">
            {department.departmentName}
          </h3>
          <ArrowUpRight
            size={16}
            className="shrink-0 text-[color:var(--edvora-muted)] opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0"
          />
        </div>

        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--edvora-glass-soft)] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[color:var(--edvora-ink)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
          <Hash size={11} className="text-[color:var(--edvora-primary)]" />
          {department.departmentCode}
        </div>

        {department.description ? (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[color:var(--edvora-muted)]">
            {department.description}
          </p>
        ) : (
          <p className="mt-3 text-sm text-[color:var(--edvora-muted)]/70 italic">
            No description yet
          </p>
        )}
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-2">
        {department.roomNumber ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--edvora-glass-soft)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--edvora-ink)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
            <DoorClosed size={12} className="text-[color:var(--edvora-primary)]" />
            {department.roomNumber}
          </span>
        ) : null}
        {department.email ? (
          <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-[color:var(--edvora-glass-soft)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--edvora-ink)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
            <Mail size={12} className="shrink-0 text-[color:var(--edvora-primary)]" />
            <span className="truncate">{department.email}</span>
          </span>
        ) : null}
        {staffCount != null ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--edvora-glass-soft)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--edvora-ink)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
            {staffCount} {staffCount === 1 ? "staff" : "staff"}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function Departments() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [counts, setCounts] = useState({ ACTIVE: 0, INACTIVE: 0 });
  const [activeStatus, setActiveStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const result = await getDepartmentsByStatus(activeStatus);
        if (cancelled) return;
        setDepartments(result.data);
        setTotalDepartments(result.totalDepartments);
        setCounts(result.counts);
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message || "Failed to load departments",
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

  const handleCreated = (department) => {
    if (!department) return;

    setTotalDepartments((prev) => prev + 1);
    setCounts((prev) => ({
      ...prev,
      ACTIVE: (prev.ACTIVE || 0) + 1,
    }));

    if (activeStatus === "ACTIVE") {
      setDepartments((prev) => [department, ...prev]);
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
              Organization
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-[color:var(--edvora-ink-strong)]">
              Departments
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[color:var(--edvora-muted)] leading-relaxed">
              Create and manage the departments in your school.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--edvora-glass-strong)] px-3.5 py-2 ring-1 ring-[color:var(--edvora-glass-border-soft)]">
                <span className="text-xs font-medium text-[color:var(--edvora-muted)]">
                  Total
                </span>
                <span className="text-lg font-bold text-[color:var(--edvora-ink-strong)] tabular-nums">
                  {loading ? "…" : totalDepartments}
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
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 h-[46px] rounded-2xl theme-btn-primary text-sm font-semibold"
          >
            <Plus size={18} />
            Add Department
          </button>
        </div>
      </section>

      {loading ? (
        <EdvoraLoader message="Loading departments…" />
      ) : departments.length === 0 ? (
        <div className="glass-strong rounded-3xl p-12 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
            <Building2 size={24} />
          </span>
          <p className="text-[color:var(--edvora-ink-strong)] font-semibold text-lg">
            No {statusLabel} departments
          </p>
          <p className="text-[color:var(--edvora-muted)] text-sm mt-2 max-w-sm mx-auto">
            {activeStatus === "ACTIVE"
              ? 'Click "Add Department" to create your first one.'
              : "No inactive departments found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 min-[1100px]:grid-cols-3 gap-4 sm:gap-5">
          {departments.map((department) => (
            <DepartmentCard
              key={department._id || department.departmentCode}
              department={department}
              onClick={() =>
                navigate(`/admin/departments/${department._id}`)
              }
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddDepartmentModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

export default Departments;
