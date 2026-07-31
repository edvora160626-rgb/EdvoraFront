import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
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
  deleteHoliday,
  deleteTimeSlot,
  getTimetableSettings,
  listHolidays,
  listTimeSlots,
  setCurrentAcademicYear,
  upsertTimetableSettings,
} from "../../../utils/timetableApi";
import TimetableSubnav from "./TimetableSubnav";
import { AcademicYearPicker, useAcademicYear } from "./useAcademicYear";

const inputClass =
  "w-full h-[42px] rounded-lg border border-[#D0D5DD] bg-white px-3 text-[14px] text-[#344054] outline-none focus:border-[#A77A95]";
const labelClass = "block text-[13px] font-semibold text-[#667085] mb-1.5";
const TABS = ["Academic Year", "Working Days", "Period Template", "Holidays"];

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

  // Year form
  const [yearForm, setYearForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: true,
  });
  const [savingYear, setSavingYear] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    workingDays: ["MON", "TUE", "WED", "THU", "FRI"],
    schoolStart: "08:00",
    schoolEnd: "15:00",
    defaultPeriodMinutes: 45,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Slots
  const [slots, setSlots] = useState([]);
  const [slotForm, setSlotForm] = useState({
    name: "",
    startTime: "08:00",
    endTime: "08:45",
    type: "PERIOD",
  });
  const [savingSlot, setSavingSlot] = useState(false);

  // Holidays
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
          const s = await getTimetableSettings(yearId);
          if (!cancelled && s) setSettings(s);
        } else if (tab === "Period Template") {
          const list = await listTimeSlots(yearId);
          if (!cancelled) setSlots(list);
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

  const toggleDay = (day) => {
    setSettings((prev) => {
      const has = prev.workingDays?.includes(day);
      const workingDays = has
        ? prev.workingDays.filter((d) => d !== day)
        : [...(prev.workingDays || []), day];
      return { ...prev, workingDays };
    });
  };

  const handleAddSlot = async () => {
    if (!yearId || !slotForm.name.trim()) {
      return openSnackbar({
        message: "Slot name is required",
        variant: "warning",
      });
    }
    try {
      setSavingSlot(true);
      const created = await createTimeSlot({
        academicYearId: yearId,
        ...slotForm,
      });
      setSlots((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      setSlotForm({
        name: "",
        startTime: slotForm.endTime,
        endTime: slotForm.endTime,
        type: "PERIOD",
      });
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
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#735366] sm:text-2xl">
            Timetable Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Academic year, working days, period templates, and holidays.
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

      <TimetableSubnav />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === t
                ? "bg-[#A77A95] text-white"
                : "bg-white text-[#735366] border border-[#E8D5CE]"
            }`}
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
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#735366]">
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
              <label className="flex items-center gap-2 text-sm text-[#667085]">
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
                className="h-[42px] rounded-lg bg-[#A77A95] px-4 text-sm font-medium text-white hover:bg-[#8F6580] disabled:opacity-60"
              >
                {savingYear ? "Saving…" : "Create Year"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#735366]">
              Existing Years
            </h2>
            {!years.length ? (
              <p className="text-sm text-slate-500">No years yet.</p>
            ) : (
              <ul className="space-y-2">
                {years.map((y) => (
                  <li
                    key={y._id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-[#735366]">{y.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(y.startDate).toLocaleDateString()} –{" "}
                        {new Date(y.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    {y.isCurrent ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Current
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCurrent(y._id)}
                        className="text-xs font-semibold text-[#A77A95] hover:underline"
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
        <div className="max-w-xl rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          {!yearId ? (
            <p className="text-sm text-amber-700">Select an academic year.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => {
                    const active = settings.workingDays?.includes(d.value);
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => toggleDay(d.value)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          active
                            ? "bg-[#A77A95] text-white"
                            : "border border-[#E8D5CE] bg-white text-[#735366]"
                        }`}
                      >
                        {d.label.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
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
                className="h-[42px] rounded-lg bg-[#A77A95] px-4 text-sm font-medium text-white hover:bg-[#8F6580] disabled:opacity-60"
              >
                {savingSettings ? "Saving…" : "Save Settings"}
              </button>
            </div>
          )}
        </div>
      ) : tab === "Period Template" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#735366]">
              Add Slot
            </h2>
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
              <button
                type="button"
                disabled={savingSlot || !yearId}
                onClick={handleAddSlot}
                className="inline-flex h-[42px] items-center gap-2 rounded-lg bg-[#A77A95] px-4 text-sm font-medium text-white hover:bg-[#8F6580] disabled:opacity-60"
              >
                <Plus size={16} />
                {savingSlot ? "Adding…" : "Add Slot"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#735366]">
              Period Template
            </h2>
            {!slots.length ? (
              <p className="text-sm text-slate-500">No slots yet.</p>
            ) : (
              <ul className="space-y-2">
                {slots.map((s) => (
                  <li
                    key={s._id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-[#735366]">
                        {s.name}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          ({s.type})
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {s.startTime} – {s.endTime}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(s._id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#735366]">
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
                className="h-[42px] rounded-lg bg-[#A77A95] px-4 text-sm font-medium text-white hover:bg-[#8F6580] disabled:opacity-60"
              >
                {savingHoliday ? "Adding…" : "Add"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#735366]">
              Calendar Days
            </h2>
            {!holidays.length ? (
              <p className="text-sm text-slate-500">No holidays listed.</p>
            ) : (
              <ul className="space-y-2">
                {holidays.map((h) => (
                  <li
                    key={h._id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-[#735366]">{h.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(h.date).toLocaleDateString()} · {h.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteHoliday(h._id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
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
