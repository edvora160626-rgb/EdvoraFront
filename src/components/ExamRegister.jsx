import { useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import PhoneInput from "../common/PhoneInput";
import CustomSelect from "../common/CustomSelect";
import { openSnackbar } from "../common/snackbar/snackbar";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const ACCOUNT_TYPE_OPTIONS = [
  {
    value: "CANDIDATE",
    label: "Candidate",
    hint: "Take exams, practice tests, study material",
  },
  {
    value: "ADMIN",
    label: "Admin",
    hint: "Question bank, tests, users, reports",
  },
  {
    value: "PROCTOR",
    label: "Proctor",
    hint: "Live sessions & exam acceptance",
  },
];

function ExamRegisterModal({ onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    userType: "CANDIDATE",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phonecode: "91",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  const setField = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const selectedType =
    ACCOUNT_TYPE_OPTIONS.find((o) => o.value === form.userType) ||
    ACCOUNT_TYPE_OPTIONS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userType) {
      openSnackbar({ message: "Select account type", variant: "warning" });
      return;
    }
    if (
      !form.firstName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password
    ) {
      openSnackbar({
        message: "Please fill all required fields",
        variant: "warning",
      });
      return;
    }
    if (form.password.length < 8) {
      openSnackbar({
        message: "Password must be at least 8 characters",
        variant: "warning",
      });
      return;
    }
    if (form.password !== form.confirmPassword) {
      openSnackbar({
        message: "Passwords do not match",
        variant: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/auth/registerExamCandidate`,
        {
          userType: form.userType,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          phonecode: form.phonecode,
          password: form.password,
          gender: form.gender || undefined,
        }
      );

      if (!data?.success) {
        openSnackbar({
          message: data?.message || "Registration failed",
          variant: "error",
        });
        return;
      }

      openSnackbar({
        message: data.message || "Account created. Please sign in.",
        variant: "success",
      });
      onClose();
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message ||
          "Failed to create examination account",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-11 rounded-xl border border-[#e8d5e0] bg-[#fdf8fb] px-3 text-sm text-[#3d1f33] outline-none focus:border-[#a77a95] focus:ring-2 focus:ring-[#a77a95]/15";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#3d1f33]/45 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
        disabled={submitting}
      />
      <div className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#f0e4eb] bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a77a95]">
              Examination Portal
            </p>
            <h2 className="text-lg font-black text-[#3d1f33]">Create account</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-2 text-[#a77a95] hover:bg-[color:var(--edvora-primary-soft)]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--edvora-ink-strong)]/70 mb-1.5">
              Account type *
            </label>
            <div
              role="tablist"
              aria-label="Account type"
              className="grid grid-cols-3 gap-1 rounded-xl border border-[#e8d5e0] bg-[#fdf8fb] p-1"
            >
              {ACCOUNT_TYPE_OPTIONS.map((opt) => {
                const active = form.userType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    disabled={submitting}
                    onClick={() => setField("userType", opt.value)}
                    className={`rounded-[10px] min-h-[clamp(2.25rem,5vw,2.75rem)] px-1.5 text-[clamp(10px,2.2vw,12px)] font-bold transition disabled:opacity-50 ${
                      active
                        ? "bg-white text-[#5c3050] shadow-sm"
                        : "text-[#a77a95]/80 hover:text-[color:var(--edvora-ink-strong)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-[color:var(--edvora-ink-strong)]/60">
              {selectedType.hint}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--edvora-ink-strong)]/70 mb-1.5">
                First name *
              </label>
              <input
                className={`${inputClass} rs-input !h-auto`}
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                disabled={submitting}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--edvora-ink-strong)]/70 mb-1.5">
                Last name
              </label>
              <input
                className={inputClass}
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                disabled={submitting}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--edvora-ink-strong)]/70 mb-1.5">
              Email *
            </label>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              disabled={submitting}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--edvora-ink-strong)]/70 mb-1.5">
              Phone *
            </label>
            <PhoneInput
              phone={form.phone}
              phoneCode={form.phonecode}
              onPhoneChange={(phone) => setField("phone", phone)}
              onPhoneCodeChange={(code) => setField("phonecode", code)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--edvora-ink-strong)]/70 mb-1.5">
              Gender
            </label>
            <CustomSelect
              options={GENDER_OPTIONS}
              value={
                GENDER_OPTIONS.find((o) => o.value === form.gender) || null
              }
              onChange={(opt) => setField("gender", opt?.value || "")}
              placeholder="Optional"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--edvora-ink-strong)]/70 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`${inputClass} pr-11`}
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                disabled={submitting}
                autoComplete="new-password"
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a77a95]"
                onClick={() => setShowPassword((p) => !p)}
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--edvora-ink-strong)]/70 mb-1.5">
              Confirm password *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className={inputClass}
              value={form.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
              disabled={submitting}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rs-btn rs-btn-primary mt-2 w-full"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" /> Creating…
              </>
            ) : (
              `Create ${selectedType.label.toLowerCase()} account`
            )}
          </button>

          <p className="text-center text-[11px] text-[#a77a95]/55 pb-2">
            Admin, Candidate and Proctor get different screens after login
            (Nextestify-style).
          </p>
        </form>
      </div>
    </div>
  );
}

export default ExamRegisterModal;
