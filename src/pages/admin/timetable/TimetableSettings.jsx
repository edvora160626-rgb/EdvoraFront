import { useEffect, useState } from "react";
import { CalendarDays, Pencil, X } from "lucide-react";
import CustomDatePicker from "../../../common/CustomDatePicker";
import CustomSelect from "../../../common/CustomSelect";
import CustomTimePicker from "../../../common/CustomTimePicker";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";
import {
  DAYS,
  createAcademicYear,
  createHoliday,
  deleteHoliday,
  getTimetableSettings,
  listHolidays,
  setCurrentAcademicYear,
  updateAcademicYear,
  upsertTimetableSettings,
} from "../../../utils/timetableApi";
import TimetableSubnav from "./TimetableSubnav";
import { AcademicYearPicker, useAcademicYear } from "./useAcademicYear";

const inputClass =
  "w-full h-[44px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] backdrop-blur-md px-3.5 text-[14px] text-[color:var(--edvora-ink-strong)] outline-none focus:border-[color:var(--edvora-primary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--edvora-primary)_16%,transparent)]";
const labelClass =
  "block text-[12px] font-semibold tracking-wide uppercase text-[color:var(--edvora-muted)] mb-1.5";
const TABS = ["Academic Year", "Working Days", "Holidays"];
const glassCard =
  "rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] p-5 shadow-[var(--edvora-glass-shadow)] backdrop-blur-[18px] saturate-[165%]";

const EMPTY_YEAR_FORM = {
  name: "",
  startDate: "",
  endDate: "",
  isCurrent: true,
};

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function DayChipToggle({ days, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {days.map((day) => {
        const active = selected.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            onClick={() => onToggle(day.value)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              active ? "theme-chip-on" : "theme-chip-off"
            }`}
          >
            {day.label.slice(0, 3)}
          </button>
        );
      })}
    </div>
  );
}

export default function TimetableSettings() {
  const {
    years,
    yearId,
    setYearId,
    yearOptions,
    loading: yearLoading,
    reload,
  } = useAcademicYear();
  const [tab, setTab] = useState(TABS[0]);
  const [loading, setLoading] = useState(false);

  const [yearForm, setYearForm] = useState({ ...EMPTY_YEAR_FORM });
  const [editingYearId, setEditingYearId] = useState(null);
  const [savingYear, setSavingYear] = useState(false);

  const [settings, setSettings] = useState({
    workingDays: ["MON", "TUE", "WED", "THU", "FRI"],
    schoolStart: "08:00",
    schoolEnd: "15:00",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const [holidays, setHolidays] = useState([]);
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: "",
    type: "HOLIDAY",
  });
  const [savingHoliday, setSavingHoliday] = useState(false);

  useEffect(() => {
    if (!yearId || tab === "Academic Year") return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        if (tab === "Working Days") {
          const saved = await getTimetableSettings(yearId);
          if (!cancelled && saved) setSettings(saved);
        } else if (tab === "Holidays") {
          const list = await listHolidays(yearId);
          if (!cancelled) setHolidays(list);
        }
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message: error?.response?.data?.message || "Failed to load",
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
  }, [yearId, tab]);

  const resetYearForm = () => {
    setEditingYearId(null);
    setYearForm({ ...EMPTY_YEAR_FORM });
  };

  const handleEditYear = (year) => {
    setEditingYearId(year._id);
    setYearForm({
      name: year.name || "",
      startDate: toDateInputValue(year.startDate),
      endDate: toDateInputValue(year.endDate),
      isCurrent: Boolean(year.isCurrent),
    });
    setTab("Academic Year");
  };

  const handleSaveYear = async () => {
    if (!yearForm.name.trim() || !yearForm.startDate || !yearForm.endDate) {
      return openSnackbar({
        message: "Name and dates are required",
        variant: "warning",
      });
    }
    try {
      setSavingYear(true);
      if (editingYearId) {
        await updateAcademicYear({
          academicYearId: editingYearId,
          name: yearForm.name.trim(),
          startDate: yearForm.startDate,
          endDate: yearForm.endDate,
          isCurrent: yearForm.isCurrent,
        });
        openSnackbar({ message: "Academic year updated", variant: "success" });
        if (yearForm.isCurrent) setYearId(editingYearId);
      } else {
        await createAcademicYear(yearForm);
        openSnackbar({ message: "Academic year created", variant: "success" });
      }
      resetYearForm();
      await reload();
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message ||
          (editingYearId ? "Failed to update year" : "Failed to create year"),
        variant: "error",
      });
    } finally {
      setSavingYear(false);
    }
  };

  const handleSetCurrent = async (id) => {
    try {
      await setCurrentAcademicYear(id);
      openSnackbar({ message: "Current year updated", variant: "success" });
      await reload();
      setYearId(id);
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to update",
        variant: "error",
      });
    }
  };

  const toggleWorkingDay = (day) => {
    setSettings((prev) => {
      const has = prev.workingDays?.includes(day);
      const workingDays = has
        ? prev.workingDays.filter((item) => item !== day)
        : [...(prev.workingDays || []), day];
      return { ...prev, workingDays };
    });
  };

  const handleSaveSettings = async () => {
    if (!yearId) return;
    try {
      setSavingSettings(true);
      await upsertTimetableSettings({
        academicYearId: yearId,
        workingDays: settings.workingDays,
        schoolStart: settings.schoolStart,
        schoolEnd: settings.schoolEnd,
      });
      openSnackbar({ message: "Settings saved", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to save",
        variant: "error",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!yearId || !holidayForm.name.trim() || !holidayForm.date) {
      return openSnackbar({
        message: "Name and date are required",
        variant: "warning",
      });
    }
    try {
      setSavingHoliday(true);
      const created = await createHoliday({
        academicYearId: yearId,
        name: holidayForm.name.trim(),
        date: holidayForm.date,
        type: holidayForm.type,
      });
      setHolidays((prev) => [...prev, created]);
      setHolidayForm({ name: "", date: "", type: "HOLIDAY" });
      openSnackbar({ message: "Holiday added", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to add holiday",
        variant: "error",
      });
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    try {
      await deleteHoliday(holidayId);
      setHolidays((prev) => prev.filter((item) => item._id !== holidayId));
      openSnackbar({ message: "Holiday removed", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to remove holiday",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-5">
      <section className={glassCard}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--edvora-primary)]">
              <CalendarDays size={13} />
              Schedule
            </div>
            <h1 className="mt-2 text-2xl font-bold text-[color:var(--edvora-ink-strong)]">
              Timetable Settings
            </h1>
            <p className="mt-1 text-sm text-[color:var(--edvora-muted)]">
              Academic year, working days, and holidays. Place periods on the class timetable.
            </p>
          </div>
          {yearLoading ? null : (
            <AcademicYearPicker
              yearId={yearId}
              yearOptions={yearOptions}
              onChange={setYearId}
            />
          )}
        </div>
      </section>

      <TimetableSubnav />

      <div className="theme-segment flex-wrap">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`theme-segment-btn ${tab === item ? "is-active" : ""}`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <EdvoraLoader message="Loading…" />
        </div>
      ) : tab === "Academic Year" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className={glassCard}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-[color:var(--edvora-ink-strong)]">
                {editingYearId ? "Edit Academic Year" : "Add Academic Year"}
              </h2>
              {editingYearId ? (
                <button
                  type="button"
                  onClick={resetYearForm}
                  className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-[color:var(--edvora-muted)]"
                >
                  <X size={14} />
                  Cancel
                </button>
              ) : null}
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  className={inputClass}
                  value={yearForm.name}
                  onChange={(event) =>
                    setYearForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="2026-2027"
                />
              </div>
              <div>
                <label className={labelClass}>Start Date</label>
                <CustomDatePicker
                  value={yearForm.startDate}
                  onChange={(value) =>
                    setYearForm((prev) => ({ ...prev, startDate: value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <CustomDatePicker
                  value={yearForm.endDate}
                  onChange={(value) =>
                    setYearForm((prev) => ({ ...prev, endDate: value }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[color:var(--edvora-muted)]">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[color:var(--edvora-primary)]"
                  checked={yearForm.isCurrent}
                  onChange={(event) =>
                    setYearForm((prev) => ({
                      ...prev,
                      isCurrent: event.target.checked,
                    }))
                  }
                />
                Set as current year
              </label>
              <button
                type="button"
                disabled={savingYear}
                onClick={handleSaveYear}
                className="h-[44px] rounded-xl theme-btn-primary px-5 text-sm font-semibold disabled:opacity-60"
              >
                {savingYear
                  ? "Saving…"
                  : editingYearId
                    ? "Save Changes"
                    : "Create Year"}
              </button>
            </div>
          </div>

          <div className={glassCard}>
            <h2 className="mb-4 text-base font-semibold text-[color:var(--edvora-ink-strong)]">
              Existing Years
            </h2>
            {!years.length ? (
              <p className="text-sm text-[color:var(--edvora-muted)]">No years yet.</p>
            ) : (
              <ul className="space-y-2">
                {years.map((year) => (
                  <li
                    key={year._id}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                      editingYearId === year._id
                        ? "border-[color:var(--edvora-primary)]/40 bg-[color:var(--edvora-primary)]/8"
                        : "border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[color:var(--edvora-ink-strong)]">
                        {year.name}
                      </p>
                      <p className="text-xs text-[color:var(--edvora-muted)]">
                        {new Date(year.startDate).toLocaleDateString()} –{" "}
                        {new Date(year.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {year.isCurrent ? (
                        <span className="rounded-full bg-[color:var(--edvora-success-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[color:var(--edvora-success-ink)]">
                          Current
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCurrent(year._id)}
                          className="text-xs font-semibold text-[color:var(--edvora-primary)] hover:underline"
                        >
                          Make current
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEditYear(year)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--edvora-glass-border-soft)] text-[color:var(--edvora-primary)]"
                        aria-label={`Edit ${year.name}`}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : tab === "Working Days" ? (
        <div className={`max-w-xl ${glassCard}`}>
          {!yearId ? (
            <p className="text-sm text-amber-700">Select an academic year.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Working Days</label>
                <DayChipToggle
                  days={DAYS}
                  selected={settings.workingDays || []}
                  onToggle={toggleWorkingDay}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>School Start</label>
                  <CustomTimePicker
                    value={settings.schoolStart}
                    onChange={(value) =>
                      setSettings((prev) => ({ ...prev, schoolStart: value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>School End</label>
                  <CustomTimePicker
                    value={settings.schoolEnd}
                    onChange={(value) =>
                      setSettings((prev) => ({ ...prev, schoolEnd: value }))
                    }
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={savingSettings}
                onClick={handleSaveSettings}
                className="h-[44px] rounded-xl theme-btn-primary px-5 text-sm font-semibold disabled:opacity-60"
              >
                {savingSettings ? "Saving…" : "Save Settings"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className={glassCard}>
            <h2 className="mb-4 text-base font-semibold text-[color:var(--edvora-ink-strong)]">
              Add Holiday / Special Day
            </h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  className={inputClass}
                  value={holidayForm.name}
                  onChange={(event) =>
                    setHolidayForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Independence Day"
                />
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <CustomDatePicker
                  value={holidayForm.date}
                  onChange={(value) =>
                    setHolidayForm((prev) => ({ ...prev, date: value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <CustomSelect
                  options={[
                    { value: "HOLIDAY", label: "Holiday" },
                    { value: "SPECIAL_WORKING", label: "Special Working Day" },
                  ]}
                  value={holidayForm.type}
                  onChange={(option) =>
                    setHolidayForm((prev) => ({
                      ...prev,
                      type: option?.value || "HOLIDAY",
                    }))
                  }
                />
              </div>
              <button
                type="button"
                disabled={savingHoliday || !yearId}
                onClick={handleAddHoliday}
                className="h-[44px] rounded-xl theme-btn-primary px-5 text-sm font-semibold disabled:opacity-60"
              >
                {savingHoliday ? "Adding…" : "Add"}
              </button>
            </div>
          </div>

          <div className={glassCard}>
            <h2 className="mb-4 text-base font-semibold text-[color:var(--edvora-ink-strong)]">
              Calendar Days
            </h2>
            {!holidays.length ? (
              <p className="text-sm text-[color:var(--edvora-muted)]">
                No holidays listed.
              </p>
            ) : (
              <ul className="space-y-2">
                {holidays.map((holiday) => (
                  <li
                    key={holiday._id}
                    className="flex items-center justify-between rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] px-3 py-2.5"
                  >
                    <div>
                      <p className="font-medium text-[color:var(--edvora-ink-strong)]">
                        {holiday.name}
                      </p>
                      <p className="text-xs text-[color:var(--edvora-muted)]">
                        {new Date(holiday.date).toLocaleDateString()} · {holiday.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteHoliday(holiday._id)}
                      className="rounded-lg p-2 text-[color:var(--edvora-muted)] hover:bg-red-500/10 hover:text-red-600"
                      aria-label={`Remove ${holiday.name}`}
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
