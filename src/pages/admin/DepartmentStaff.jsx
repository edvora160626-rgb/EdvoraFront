import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Plus,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import CustomSelect from "../../common/CustomSelect";
import EdvoraLoader from "../../common/EdvoraLoader";
import PhoneInput from "../../common/PhoneInput";
import { openSnackbar } from "../../common/snackbar/snackbar";
import { formatPhoneDisplay } from "../../utils/phone";
import {
  assignStaffToDepartment,
  createStaffMember,
  getDepartmentsByStatus,
  getTeachersByDepartment,
} from "../../utils/departmentApi";

const labelClass = "block text-[13px] font-semibold text-[#667085] mb-1.5";
const inputClass =
  "w-full h-[42px] rounded-lg border border-[#D0D5DD] bg-white px-3 text-[14px] text-[#344054] outline-none focus:border-[color:var(--edvora-primary)]";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const EMPTY_NEW_STAFF = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  phonecode: "91",
  gender: "Male",
  qualification: "",
  subjects: "",
};

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-green-50 text-green-700",
    INACTIVE: "bg-red-50 text-red-600",
    REQUESTED: "bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-ink-strong)]",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status || "—"}
    </span>
  );
}

function StaffCard({ staff }) {
  const fullName = [staff.firstName, staff.lastName].filter(Boolean).join(" ");
  const employeeId = staff.employeeId || staff.staffId;

  return (
    <div className="bg-white rounded-xl shadow p-4 border border-slate-100">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]">
          <UserRound size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-800 truncate">{fullName}</p>
            <StatusBadge status={staff.status} />
          </div>
          {employeeId ? (
            <p className="text-xs text-slate-500 mt-0.5">ID: {employeeId}</p>
          ) : null}
          <div className="mt-3 space-y-1.5">
            {staff.email ? (
              <p className="flex items-center gap-2 text-sm text-slate-600 truncate">
                <Mail size={14} className="shrink-0 text-[color:var(--edvora-primary)]" />
                {staff.email}
              </p>
            ) : null}
            {staff.phone ? (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="shrink-0 text-[color:var(--edvora-primary)]" />
                {formatPhoneDisplay(staff.phone, staff.phoneCode)}
              </p>
            ) : null}
            {staff.qualification ? (
              <p className="text-sm text-slate-600 mt-1">
                {staff.qualification}
                {staff.experience != null ? ` · ${staff.experience} yrs` : ""}
              </p>
            ) : null}
            {Array.isArray(staff.subjects) && staff.subjects.length > 0 ? (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Subjects: {staff.subjects.join(", ")}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function StaffTable({ staff }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 sm:p-4 text-left text-sm font-semibold text-slate-700">
                Name
              </th>
              <th className="p-3 sm:p-4 text-left text-sm font-semibold text-slate-700">
                Employee ID
              </th>
              <th className="p-3 sm:p-4 text-left text-sm font-semibold text-slate-700">
                Email
              </th>
              <th className="p-3 sm:p-4 text-left text-sm font-semibold text-slate-700">
                Phone
              </th>
              <th className="p-3 sm:p-4 text-left text-sm font-semibold text-slate-700">
                Qualification
              </th>
              <th className="p-3 sm:p-4 text-left text-sm font-semibold text-slate-700">
                Subjects
              </th>
              <th className="p-3 sm:p-4 text-left text-sm font-semibold text-slate-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => {
              const fullName = [member.firstName, member.lastName]
                .filter(Boolean)
                .join(" ");
              const employeeId = member.employeeId || member.staffId || "—";
              const phone = formatPhoneDisplay(
                member.phone,
                member.phoneCode
              );
              const subjects =
                Array.isArray(member.subjects) && member.subjects.length > 0
                  ? member.subjects.join(", ")
                  : "—";

              return (
                <tr key={member._id} className="border-t border-slate-100">
                  <td className="p-3 sm:p-4 text-sm text-slate-800 font-medium">
                    {fullName || "—"}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-slate-600">
                    {employeeId}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-slate-600 max-w-[220px] truncate">
                    {member.email || "—"}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-slate-600 whitespace-nowrap">
                    {phone}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-slate-600">
                    {member.qualification || "—"}
                    {member.experience != null
                      ? ` · ${member.experience} yrs`
                      : ""}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-slate-600 max-w-[200px]">
                    {subjects}
                  </td>
                  <td className="p-3 sm:p-4 text-sm">
                    <StatusBadge status={member.status} />
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

function staffOptionLabel(member) {
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ");
  const id = member.employeeId || member.staffId;
  return id ? `${name} (${id})` : name;
}

function ModeTabs({ mode, onChange, disabled }) {
  const tabs = [
    { id: "existing", label: "Add Existing Staff" },
    { id: "new", label: "Add New Staff" },
  ];

  return (
    <div className="flex rounded-lg border border-[color:var(--edvora-border)] bg-[color:var(--edvora-primary-soft)]/40 p-1 gap-1">
      {tabs.map((tab) => {
        const active = mode === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(tab.id)}
            className={`flex-1 h-9 rounded-md text-sm font-semibold transition-colors disabled:opacity-60 ${
              active
                ? "bg-[color:var(--edvora-primary)] text-white shadow-sm"
                : "text-[color:var(--edvora-ink-strong)] hover:bg-white/70"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function AddStaffModal({
  currentDepartmentId,
  currentDepartmentName,
  currentStaffIds,
  onClose,
  onAssigned,
}) {
  const [mode, setMode] = useState("existing");
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [staffOptions, setStaffOptions] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newStaffForm, setNewStaffForm] = useState(EMPTY_NEW_STAFF);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const result = await getDepartmentsByStatus("ACTIVE");
        if (cancelled) return;

        const options = (result.data || [])
          .filter((dept) => dept._id !== currentDepartmentId)
          .map((dept) => ({
            value: dept._id,
            label: dept.departmentCode
              ? `${dept.departmentName} (${dept.departmentCode})`
              : dept.departmentName,
          }));

        setDepartmentOptions(options);
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message ||
              "Failed to load active departments",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoadingDepartments(false);
      }
    };

    loadDepartments();
    return () => {
      cancelled = true;
    };
  }, [currentDepartmentId]);

  useEffect(() => {
    let cancelled = false;

    const loadStaff = async () => {
      if (!selectedDepartment?.value) {
        setStaffOptions([]);
        setSelectedStaff(null);
        return;
      }

      try {
        setLoadingStaff(true);
        setSelectedStaff(null);
        const result = await getTeachersByDepartment(selectedDepartment.value);
        if (cancelled) return;

        const options = (result.staff || []).map((member) => ({
          value: member._id,
          label: staffOptionLabel(member),
          alreadyAssigned: currentStaffIds.has(String(member._id)),
        }));

        setStaffOptions(options);
      } catch (error) {
        if (!cancelled) {
          setStaffOptions([]);
          openSnackbar({
            message:
              error?.response?.data?.message ||
              "Failed to load staff for selected department",
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
  }, [selectedDepartment, currentStaffIds]);

  const handleNewStaffChange = (e) => {
    const { name, value } = e.target;
    setNewStaffForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignExisting = async () => {
    if (!selectedDepartment?.value) {
      return openSnackbar({
        message: "Please select a department",
        variant: "warning",
      });
    }

    if (!selectedStaff?.value) {
      return openSnackbar({
        message: "Please select a staff member",
        variant: "warning",
      });
    }

    if (currentStaffIds.has(String(selectedStaff.value))) {
      return openSnackbar({
        message: "Staff member is already assigned to this department.",
        variant: "error",
      });
    }

    try {
      setSubmitting(true);
      await assignStaffToDepartment(currentDepartmentId, selectedStaff.value);
      openSnackbar({
        message: "Staff assigned to department successfully",
        variant: "success",
      });
      onAssigned?.();
      onClose();
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message ||
          "Failed to assign staff to department",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNew = async () => {
    const firstName = newStaffForm.firstName.trim();
    const lastName = newStaffForm.lastName.trim();
    const email = newStaffForm.email.trim().toLowerCase();
    const phone = newStaffForm.phone.trim();
    const qualification = newStaffForm.qualification.trim();

    if (!firstName || !lastName || !email || !phone || !newStaffForm.gender) {
      return openSnackbar({
        message: "First name, last name, email, phone and gender are required",
        variant: "warning",
      });
    }

    if (!qualification) {
      return openSnackbar({
        message: "Qualification is required",
        variant: "warning",
      });
    }

    if (!currentDepartmentId) {
      return openSnackbar({
        message: "Department is missing",
        variant: "error",
      });
    }

    const subjects = newStaffForm.subjects
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setSubmitting(true);
      await createStaffMember({
        firstName,
        lastName,
        email,
        phone,
        phonecode: newStaffForm.phonecode,
        gender: newStaffForm.gender,
        department: [currentDepartmentId],
        qualification,
        subjects,
      });
      openSnackbar({
        message: "Staff created and set to Active",
        variant: "success",
      });
      onAssigned?.();
      onClose();
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message || "Failed to create staff member",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "existing") return handleAssignExisting();
    return handleCreateNew();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-[560px] max-h-[90dvh] bg-white rounded-t-[14px] sm:rounded-[14px] shadow-2xl overflow-hidden flex flex-col">
        <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]">
              <UserPlus size={18} />
            </span>
            <h2 className="text-base sm:text-[18px] font-semibold text-[#111827] truncate">
              {mode === "existing" ? "Add Existing Staff" : "Add New Staff"}
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

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5 space-y-4">
          <ModeTabs mode={mode} onChange={setMode} disabled={submitting} />

          {mode === "existing" ? (
            <>
              <div>
                <label className={labelClass}>
                  Department <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={departmentOptions}
                  placeholder={
                    loadingDepartments
                      ? "Loading departments…"
                      : "Select department"
                  }
                  isSearchable
                  isLoading={loadingDepartments}
                  isDisabled={loadingDepartments || submitting}
                  value={selectedDepartment}
                  onChange={(option) => setSelectedDepartment(option)}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Staff <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={staffOptions}
                  placeholder={
                    !selectedDepartment
                      ? "Select a department first"
                      : loadingStaff
                        ? "Loading staff…"
                        : staffOptions.length === 0
                          ? "No staff in this department"
                          : "Select staff member"
                  }
                  isSearchable
                  isLoading={loadingStaff}
                  isDisabled={
                    !selectedDepartment || loadingStaff || submitting
                  }
                  value={selectedStaff}
                  onChange={(option) => setSelectedStaff(option)}
                  formatOptionLabel={(option) => (
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate">{option.label}</span>
                      {option.alreadyAssigned ? (
                        <span className="text-[11px] text-red-500 shrink-0">
                          Already added
                        </span>
                      ) : null}
                    </span>
                  )}
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 rounded-lg border border-[color:var(--edvora-border)] bg-[color:var(--edvora-primary-soft)] px-3.5 py-3">
                <p className="text-sm font-semibold text-[color:var(--edvora-ink-strong)]">
                  New staff will be Active by default
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Assigned to{" "}
                  {currentDepartmentName
                    ? `"${currentDepartmentName}"`
                    : "this department"}
                  . Staff ID is generated automatically.
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={newStaffForm.firstName}
                  onChange={handleNewStaffChange}
                  placeholder="Enter first name"
                  disabled={submitting}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={newStaffForm.lastName}
                  onChange={handleNewStaffChange}
                  placeholder="Enter last name"
                  disabled={submitting}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={newStaffForm.email}
                  onChange={handleNewStaffChange}
                  placeholder="staff@school.com"
                  disabled={submitting}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Phone <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  phone={newStaffForm.phone}
                  phoneCode={newStaffForm.phonecode}
                  onPhoneChange={(phone) =>
                    setNewStaffForm((prev) => ({ ...prev, phone }))
                  }
                  onPhoneCodeChange={(phonecode) =>
                    setNewStaffForm((prev) => ({ ...prev, phonecode }))
                  }
                  placeholder="Mobile number"
                  height={42}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Gender <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={GENDER_OPTIONS}
                  placeholder="Select gender"
                  isSearchable={false}
                  isDisabled={submitting}
                  value={
                    GENDER_OPTIONS.find(
                      (option) => option.value === newStaffForm.gender
                    ) || null
                  }
                  onChange={(option) =>
                    setNewStaffForm((prev) => ({
                      ...prev,
                      gender: option?.value || "Male",
                    }))
                  }
                />
              </div>

              <div>
                <label className={labelClass}>
                  Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={newStaffForm.qualification}
                  onChange={handleNewStaffChange}
                  placeholder="e.g. M.Sc Mathematics"
                  disabled={submitting}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Subjects</label>
                <input
                  type="text"
                  name="subjects"
                  value={newStaffForm.subjects}
                  onChange={handleNewStaffChange}
                  placeholder="Comma-separated, e.g. Maths, Physics"
                  disabled={submitting}
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-[42px] rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 h-[42px] rounded-lg bg-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-hover)] text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? mode === "existing"
                ? "Adding…"
                : "Creating…"
              : mode === "existing"
                ? "Add Staff"
                : "Create Staff"}
          </button>
        </div>
      </div>
      {submitting && (
        <EdvoraLoader
          overlay
          message={
            mode === "existing" ? "Assigning staff…" : "Creating staff…"
          }
        />
      )}
    </div>
  );
}

function DepartmentStaff() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState(null);
  const [staff, setStaff] = useState([]);
  const [totalStaff, setTotalStaff] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const currentStaffIds = useMemo(
    () => new Set(staff.map((member) => String(member._id))),
    [staff]
  );

  const loadStaff = useCallback(async () => {
    if (!departmentId) return;

    const result = await getTeachersByDepartment(departmentId);
    setDepartment(result.department);
    setStaff(result.staff);
    setTotalStaff(result.totalStaff);
  }, [departmentId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!departmentId) return;

      try {
        setLoading(true);
        const result = await getTeachersByDepartment(departmentId);
        if (cancelled) return;
        setDepartment(result.department);
        setStaff(result.staff);
        setTotalStaff(result.totalStaff);
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message ||
              "Failed to load department staff",
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
  }, [departmentId]);

  const handleAssigned = async () => {
    try {
      await loadStaff();
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message ||
          "Staff saved, but failed to refresh the list",
        variant: "warning",
      });
    }
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-start gap-4 min-w-0">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: department?.color || "#4F46E5" }}
            >
              <Building2 size={22} />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-[color:var(--edvora-ink-strong)]">
                {department?.departmentName || "Department Staff"}
              </h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">
                {department?.departmentCode
                  ? `${department.departmentCode} · `
                  : ""}
                Staff members in this department
              </p>
              <p className="text-sm font-semibold text-[color:var(--edvora-ink-strong)] mt-2">
                Total staff: {loading ? "…" : totalStaff}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              disabled={loading || !department}
              className="inline-flex items-center gap-2 px-4 h-[42px] rounded-lg bg-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-hover)] text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Add Staff
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/departments")}
              className="inline-flex items-center gap-2 px-4 h-[42px] rounded-lg bg-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-hover)] text-white text-sm font-semibold shadow-sm"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <EdvoraLoader message="Loading staff…" />
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center border border-slate-100">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]">
            <UserRound size={22} />
          </span>
          <p className="text-slate-700 font-medium">No staff found</p>
          <p className="text-slate-500 text-sm mt-1">
            There are no teachers assigned to this department yet.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {staff.map((member) => (
              <StaffCard key={member._id} staff={member} />
            ))}
          </div>
          <div className="hidden lg:block">
            <StaffTable staff={staff} />
          </div>
        </>
      )}

      {showAddModal && (
        <AddStaffModal
          currentDepartmentId={departmentId}
          currentDepartmentName={department?.departmentName}
          currentStaffIds={currentStaffIds}
          onClose={() => setShowAddModal(false)}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}

export default DepartmentStaff;
