import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Copy,
  Layers3,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import CustomDatePicker from "../../../common/CustomDatePicker";
import CustomSelect from "../../../common/CustomSelect";
import CustomTimePicker from "../../../common/CustomTimePicker";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";
import {
  DAYS,
  SLOT_TYPES,
  createAcademicYear,
  createHoliday,
  createTimeSlot,
  dayShortLabel,
  deleteHoliday,
  deleteTimeSlot,
  getTimetableSettings,
  listHolidays,
  listTimeSlots,
  setCurrentAcademicYear,
  slotAppliesToDay,
  updateTimeSlot,
  upsertTimetableSettings,
} from "../../../utils/timetableApi";
import TimetableSubnav from "./TimetableSubnav";
import { AcademicYearPicker, useAcademicYear } from "./useAcademicYear";

const inputClass =
  "w-full h-[44px] rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] backdrop-blur-md px-3.5 text-[14px] text-[color:var(--edvora-ink-strong)] outline-none focus:border-[color:var(--edvora-primary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--edvora-primary)_16%,transparent)]";
const labelClass =
  "block text-[12px] font-semibold tracking-wide uppercase text-[color:var(--edvora-muted)] mb-1.5";
const TABS = ["Academic Year", "Working Days", "Period Template", "Holidays"];
const glassCard =
  "rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] p-5 shadow-[var(--edvora-glass-shadow)] backdrop-blur-[18px] saturate-[165%]";

function DayChipToggle({ days, selected, onToggle, size = "md" }) {
  return (
    <div className="flex flex-wrap gap-2">
      {days.map((d) => {
        const active = selected.includes(d.value);
        const pad = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm";
        return (
          <button
            key={d.value}
            type="button"
            onClick={() => onToggle(d.value)}
            className={`rounded-xl font-semibold transition ${pad} ${
              active ? "theme-chip-on" : "theme-chip-off"
            }`}
          >
            {d.label.slice(0, 3)}
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

  const [yearForm, setYearForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: true,
  });
  const [savingYear, setSavingYear] = useState(false);

  const [settings, setSettings] = useState({
    workingDays: ["MON", "TUE", "WED", "THU", "FRI"],
    schoolStart: "08:00",
    schoolEnd: "15:00",
    defaultPeriodMinutes: 45,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const [slots, setSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState("MON");
  const [slotForm, setSlotForm] = useState({
    name: "",
    startTime: "08:00",
    endTime: "08:45",
    type: "PERIOD",
    days: ["MON"],
  });
  const [savingSlot, setSavingSlot] = useState(false);
  const [copyFromDay, setCopyFromDay] = useState("");
  const [copyingDay, setCopyingDay] = useState(false);

  const [holidays, setHolidays] = useState([]);
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: "",
    type: "HOLIDAY",
  });
  const [savingHoliday, setSavingHoliday] = useState(false);

  const workingDayOptions = useMemo(
    () => DAYS.filter((d) => (settings.workingDays || []).includes(d.value)),
    [settings.workingDays]
  );

  useEffect(() => {
    if (!yearId || tab === "Academic Year") return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        if (tab === "Working Days") {
          const s = await getTimetableSettings(yearId);
          if (!cancelled && s) setSettings(s);
        } else if (tab === "Period Template") {
          const [s, list] = await Promise.all([
            getTimetableSettings(yearId),
            listTimeSlots(yearId),
          ]);
          if (cancelled) return;
          if (s) setSettings(s);
          setSlots(list);
          const wd = s?.workingDays?.length
            ? s.workingDays
            : ["MON", "TUE", "WED", "THU", "FRI"];
          setSelectedDay((prev) => (wd.includes(prev) ? prev : wd[0]));
          setSlotForm((prev) => ({
            ...prev,
            days: prev.days?.length
              ? prev.days.filter((d) => wd.includes(d))
              : [wd[0]],
          }));
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

  useEffect(() => {
    setSlotForm((prev) => {
      if (prev.days?.length === 1 && prev.days[0] !== selectedDay) {
        return { ...prev, days: [selectedDay] };
      }
      if (!prev.days?.includes(selectedDay) && prev.days?.length <= 1) {
        return { ...prev, days: [selectedDay] };
      }
      return prev;
    });
  }, [selectedDay]);

  const daySlots = useMemo(
    () =>
      slots
        .filter((s) => slotAppliesToDay(s, selectedDay))
        .sort(
          (a, b) =>
            a.order - b.order ||
            String(a.startTime).localeCompare(String(b.startTime))
        ),
    [slots, selectedDay]
  );

  const handleCreateYear = async () => {
    if (!yearForm.name.trim() || !yearForm.startDate || !yearForm.endDate) {
      return openSnackbar({
        message: "Name and dates are required",
        variant: "warning",
      });
    }
    try {
      setSavingYear(true);
      await createAcademicYear(yearForm);
      openSnackbar({ message: "Academic year created", variant: "success" });
      setYearForm({ name: "", startDate: "", endDate: "", isCurrent: true });
      await reload();
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to create year",
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

  const handleSaveSettings = async () => {
    if (!yearId) return;
    try {
      setSavingSettings(true);
      await upsertTimetableSettings({ academicYearId: yearId, ...settings });
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

  const toggleWorkingDay = (day) => {
    setSettings((prev) => {
      const has = prev.workingDays?.includes(day);
      const workingDays = has
        ? prev.workingDays.filter((d) => d !== day)
        : [...(prev.workingDays || []), day];
      return { ...prev, workingDays };
    });
  };

  const toggleSlotDay = (day) => {
    setSlotForm((prev) => {
      const has = prev.days?.includes(day);
      const days = has
        ? prev.days.filter((d) => d !== day)
        : [...(prev.days || []), day];
      return { ...prev, days };
    });
  };

  const selectAllWorkingDays = () => {
    setSlotForm((prev) => ({
      ...prev,
      days: [...(settings.workingDays || [])],
    }));
  };

  const handleAddSlot = async () => {
    if (!yearId || !slotForm.name.trim()) {
      return openSnackbar({
        message: "Slot name is required",
        variant: "warning",
      });
    }
    if (!slotForm.days?.length) {
      return openSnackbar({
        message: "Select at least one day for this slot",
        variant: "warning",
      });
    }
    try {
      setSavingSlot(true);
      const created = await createTimeSlot({
        academicYearId: yearId,
        name: slotForm.name,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        type: slotForm.type,
        days: slotForm.days,
      });
      setSlots((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      setSlotForm((prev) => ({
        name: "",
        startTime: prev.endTime,
        endTime: prev.endTime,
        type: "PERIOD",
        days: [selectedDay],
      }));
      openSnackbar({ message: "Period added", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to add slot",
        variant: "error",
      });
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await deleteTimeSlot(id);
      setSlots((prev) => prev.filter((s) => s._id !== id));
      openSnackbar({ message: "Slot deleted", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to delete",
        variant: "error",
      });
    }
  };

  const handleRemoveFromDay = async (slot) => {
    const days = Array.isArray(slot.days) ? slot.days : [];
    if (!days.length) {
      const nextDays = (settings.workingDays || []).filter(
        (d) => d !== selectedDay
      );
      if (!nextDays.length) {
        return handleDeleteSlot(slot._id);
      }
      try {
        const updated = await updateTimeSlot({
          timeSlotId: slot._id,
          days: nextDays,
        });
        setSlots((prev) =>
          prev.map((s) => (String(s._id) === String(slot._id) ? updated : s))
        );
        openSnackbar({
          message: `Removed from ${dayShortLabel(selectedDay)}`,
          variant: "success",
        });
      } catch (error) {
        openSnackbar({
          message: error?.response?.data?.message || "Failed to update",
          variant: "error",
        });
      }
      return;
    }

    const nextDays = days.filter((d) => d !== selectedDay);
    if (!nextDays.length) {
      return handleDeleteSlot(slot._id);
    }

    try {
      const updated = await updateTimeSlot({
        timeSlotId: slot._id,
        days: nextDays,
      });
      setSlots((prev) =>
        prev.map((s) => (String(s._id) === String(slot._id) ? updated : s))
      );
      openSnackbar({
        message: `Removed from ${dayShortLabel(selectedDay)}`,
        variant: "success",
      });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to update",
        variant: "error",
      });
    }
  };

  const handleCopyDay = async () => {
    if (!yearId || !copyFromDay || copyFromDay === selectedDay) {
      return openSnackbar({
        message: "Pick a different source day to copy from",
        variant: "warning",
      });
    }

    const sourceSlots = slots.filter((s) =>
      slotAppliesToDay(s, copyFromDay)
    );
    if (!sourceSlots.length) {
      return openSnackbar({
        message: `No slots on ${dayShortLabel(copyFromDay)} to copy`,
        variant: "warning",
      });
    }

    try {
      setCopyingDay(true);
      for (const src of sourceSlots) {
        if (slotAppliesToDay(src, selectedDay)) continue;

        const srcDays =
          Array.isArray(src.days) && src.days.length
            ? src.days
            : settings.workingDays || [];

        if (!srcDays.includes(selectedDay)) {
          await updateTimeSlot({
            timeSlotId: src._id,
            days: [...srcDays, selectedDay],
          });
        }
      }

      const list = await listTimeSlots(yearId);
      setSlots(list);
      openSnackbar({
        message: `Copied ${dayShortLabel(copyFromDay)} → ${dayShortLabel(selectedDay)}`,
        variant: "success",
      });
      setCopyFromDay("");
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to copy day",
        variant: "error",
      });
    } finally {
      setCopyingDay(false);
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
        ...holidayForm,
      });
      setHolidays((prev) =>
        [...prev, created].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        )
      );
      setHolidayForm({ name: "", date: "", type: "HOLIDAY" });
      openSnackbar({ message: "Holiday added", variant: "success" });
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to add",
        variant: "error",
      });
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await deleteHoliday(id);
      setHolidays((prev) => prev.filter((h) => h._id !== id));
      openSnackbar({ message: "Holiday removed", variant: "success" });
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
        <EdvoraLoader message="Loading settings…" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] p-5 sm:p-6 shadow-[var(--edvora-glass-shadow)] backdrop-blur-[20px] saturate-[165%]">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--edvora-primary) 28%, transparent), transparent 70%)",
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--edvora-glass-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
              <Clock3 size={13} />
              Schedule
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--edvora-ink-strong)]">
              Timetable Settings
            </h1>
            <p className="mt-1.5 text-sm text-[color:var(--edvora-muted)]">
              Academic year, working days, day-wise period templates, and
              holidays.
            </p>
          </div>
          {tab !== "Academic Year" && (
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
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`theme-segment-btn ${tab === t ? "is-active" : ""}`}
          >
            {t}
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
            <h2 className="mb-4 text-base font-semibold text-[color:var(--edvora-ink-strong)]">
              Add Academic Year
            </h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  className={inputClass}
                  value={yearForm.name}
                  onChange={(e) =>
                    setYearForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="2026-2027"
                />
              </div>
              <div>
                <label className={labelClass}>Start Date</label>
                <CustomDatePicker
                  value={yearForm.startDate}
                  onChange={(v) =>
                    setYearForm((p) => ({ ...p, startDate: v }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <CustomDatePicker
                  value={yearForm.endDate}
                  onChange={(v) => setYearForm((p) => ({ ...p, endDate: v }))}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[color:var(--edvora-muted)]">
                <input
                  type="checkbox"
                  checked={yearForm.isCurrent}
                  onChange={(e) =>
                    setYearForm((p) => ({
                      ...p,
                      isCurrent: e.target.checked,
                    }))
                  }
                />
                Set as current year
              </label>
              <button
                type="button"
                disabled={savingYear}
                onClick={handleCreateYear}
                className="h-[44px] rounded-xl theme-btn-primary px-5 text-sm font-semibold disabled:opacity-60"
              >
                {savingYear ? "Saving…" : "Create Year"}
              </button>
            </div>
          </div>

          <div className={glassCard}>
            <h2 className="mb-4 text-base font-semibold text-[color:var(--edvora-ink-strong)]">
              Existing Years
            </h2>
            {!years.length ? (
              <p className="text-sm text-[color:var(--edvora-muted)]">
                No years yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {years.map((y) => (
                  <li
                    key={y._id}
                    className="flex items-center justify-between rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] px-3 py-2.5"
                  >
                    <div>
                      <p className="font-medium text-[color:var(--edvora-ink-strong)]">
                        {y.name}
                      </p>
                      <p className="text-xs text-[color:var(--edvora-muted)]">
                        {new Date(y.startDate).toLocaleDateString()} –{" "}
                        {new Date(y.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    {y.isCurrent ? (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-500/15">
                        Current
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCurrent(y._id)}
                        className="text-xs font-semibold text-[color:var(--edvora-primary)] hover:underline"
                      >
                        Make current
                      </button>
                    )}
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
                    onChange={(v) =>
                      setSettings((p) => ({ ...p, schoolStart: v }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>School End</label>
                  <CustomTimePicker
                    value={settings.schoolEnd}
                    onChange={(v) =>
                      setSettings((p) => ({ ...p, schoolEnd: v }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Default Period (minutes)</label>
                <input
                  type="number"
                  min={15}
                  max={180}
                  className={inputClass}
                  value={settings.defaultPeriodMinutes || 45}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      defaultPeriodMinutes: Number(e.target.value) || 45,
                    }))
                  }
                />
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
      ) : tab === "Period Template" ? (
        <div className="space-y-5">
          {!yearId ? (
            <div className={glassCard}>
              <p className="text-sm text-amber-700">Select an academic year.</p>
            </div>
          ) : (
            <>
              <div className={glassCard}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--edvora-primary)]">
                      <CalendarDays size={13} />
                      Day schedule
                    </div>
                    <p className="mt-1 text-sm text-[color:var(--edvora-muted)]">
                      Each weekday can have its own periods, breaks, and times.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CustomSelect
                      options={workingDayOptions
                        .filter((d) => d.value !== selectedDay)
                        .map((d) => ({
                          value: d.value,
                          label: `Copy from ${d.label}`,
                        }))}
                      placeholder="Copy from…"
                      isSearchable={false}
                      value={copyFromDay || null}
                      onChange={(opt) => setCopyFromDay(opt?.value || "")}
                    />
                    <button
                      type="button"
                      disabled={copyingDay || !copyFromDay}
                      onClick={handleCopyDay}
                      className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] px-3 text-sm font-semibold text-[color:var(--edvora-ink)] hover:border-[color:var(--edvora-primary)]/40 disabled:opacity-50"
                    >
                      <Copy size={14} />
                      {copyingDay ? "Copying…" : "Apply"}
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <DayChipToggle
                    days={workingDayOptions.length ? workingDayOptions : DAYS}
                    selected={[selectedDay]}
                    onToggle={(day) => setSelectedDay(day)}
                  />
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className={glassCard}>
                  <h2 className="mb-1 text-base font-semibold text-[color:var(--edvora-ink-strong)]">
                    Add Slot
                  </h2>
                  <p className="mb-4 text-xs text-[color:var(--edvora-muted)]">
                    Creating for{" "}
                    <span className="font-semibold text-[color:var(--edvora-ink)]">
                      {DAYS.find((d) => d.value === selectedDay)?.label ||
                        selectedDay}
                    </span>
                    — pick more days below if this slot repeats.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        className={inputClass}
                        value={slotForm.name}
                        onChange={(e) =>
                          setSlotForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="Period 1"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Type</label>
                      <CustomSelect
                        options={SLOT_TYPES}
                        value={slotForm.type}
                        onChange={(opt) =>
                          setSlotForm((p) => ({
                            ...p,
                            type: opt?.value || "PERIOD",
                          }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Start</label>
                        <CustomTimePicker
                          value={slotForm.startTime}
                          onChange={(v) =>
                            setSlotForm((p) => ({ ...p, startTime: v }))
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>End</label>
                        <CustomTimePicker
                          value={slotForm.endTime}
                          onChange={(v) =>
                            setSlotForm((p) => ({ ...p, endTime: v }))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <label className={`${labelClass} !mb-0`}>
                          Applies to
                        </label>
                        <button
                          type="button"
                          onClick={selectAllWorkingDays}
                          className="text-[11px] font-semibold text-[color:var(--edvora-primary)] hover:underline"
                        >
                          All working days
                        </button>
                      </div>
                      <DayChipToggle
                        days={
                          workingDayOptions.length ? workingDayOptions : DAYS
                        }
                        selected={slotForm.days || []}
                        onToggle={toggleSlotDay}
                        size="sm"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={savingSlot || !yearId}
                      onClick={handleAddSlot}
                      className="inline-flex h-[44px] items-center gap-2 rounded-xl theme-btn-primary px-5 text-sm font-semibold disabled:opacity-60"
                    >
                      <Plus size={16} />
                      {savingSlot ? "Adding…" : "Add Slot"}
                    </button>
                  </div>
                </div>

                <div className={glassCard}>
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h2 className="text-base font-semibold text-[color:var(--edvora-ink-strong)]">
                      {dayShortLabel(selectedDay)} template
                    </h2>
                    <span className="rounded-full bg-[color:var(--edvora-glass-soft)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--edvora-muted)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
                      {daySlots.length} slot{daySlots.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {!daySlots.length ? (
                    <div className="rounded-xl border border-dashed border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)]/50 px-4 py-8 text-center">
                      <Layers3
                        size={22}
                        className="mx-auto mb-2 text-[color:var(--edvora-primary)]"
                      />
                      <p className="text-sm font-medium text-[color:var(--edvora-ink)]">
                        No slots for {dayShortLabel(selectedDay)}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--edvora-muted)]">
                        Add periods for this day, or copy from another day.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {daySlots.map((s) => {
                        const applies =
                          Array.isArray(s.days) && s.days.length
                            ? s.days
                            : settings.workingDays || [];
                        return (
                          <li
                            key={s._id}
                            className="flex items-start justify-between gap-3 rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-[color:var(--edvora-ink-strong)]">
                                {s.name}{" "}
                                <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--edvora-muted)]">
                                  {s.type}
                                </span>
                              </p>
                              <p className="text-xs text-[color:var(--edvora-muted)]">
                                {s.startTime} – {s.endTime}
                              </p>
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {applies.map((d) => (
                                  <span
                                    key={d}
                                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                      d === selectedDay
                                        ? "bg-[color:var(--edvora-primary)]/15 text-[color:var(--edvora-primary)]"
                                        : "bg-[color:var(--edvora-glass)] text-[color:var(--edvora-muted)]"
                                    }`}
                                  >
                                    {dayShortLabel(d)}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromDay(s)}
                              title={`Remove from ${dayShortLabel(selectedDay)}`}
                              className="rounded-lg p-2 text-[color:var(--edvora-muted)] hover:bg-red-500/10 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </>
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
                  onChange={(e) =>
                    setHolidayForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Independence Day"
                />
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <CustomDatePicker
                  value={holidayForm.date}
                  onChange={(v) =>
                    setHolidayForm((p) => ({ ...p, date: v }))
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
                  onChange={(opt) =>
                    setHolidayForm((p) => ({
                      ...p,
                      type: opt?.value || "HOLIDAY",
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
                {holidays.map((h) => (
                  <li
                    key={h._id}
                    className="flex items-center justify-between rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] px-3 py-2.5"
                  >
                    <div>
                      <p className="font-medium text-[color:var(--edvora-ink-strong)]">
                        {h.name}
                      </p>
                      <p className="text-xs text-[color:var(--edvora-muted)]">
                        {new Date(h.date).toLocaleDateString()} · {h.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteHoliday(h._id)}
                      className="rounded-lg p-2 text-[color:var(--edvora-muted)] hover:bg-red-500/10 hover:text-red-600"
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
