import { useEffect, useState } from "react";
import CustomSelect from "../../../common/CustomSelect";
import { listAcademicYears } from "../../../utils/timetableApi";

const YEAR_KEY = "edvora_timetable_year_id";

/**
 * Loads academic years and keeps the current (or first) selection.
 * Returns { years, yearId, setYearId, yearOptions, loading, reload }
 */
export function useAcademicYear() {
  const [years, setYears] = useState([]);
  const [yearId, setYearIdState] = useState(
    () => sessionStorage.getItem(YEAR_KEY) || ""
  );
  const [loading, setLoading] = useState(true);

  const setYearId = (id) => {
    setYearIdState(id);
    if (id) sessionStorage.setItem(YEAR_KEY, id);
    else sessionStorage.removeItem(YEAR_KEY);
  };

  const reload = async () => {
    setLoading(true);
    try {
      const list = await listAcademicYears();
      setYears(list);
      setYearIdState((prev) => {
        const stored = sessionStorage.getItem(YEAR_KEY) || prev;
        if (stored && list.some((y) => y._id === stored)) {
          return stored;
        }
        const current = list.find((y) => y.isCurrent);
        const next = current?._id || list[0]?._id || "";
        if (next) sessionStorage.setItem(YEAR_KEY, next);
        return next;
      });
    } catch {
      setYears([]);
      setYearIdState("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const yearOptions = years.map((y) => ({
    value: y._id,
    label: y.isCurrent ? `${y.name} (Current)` : y.name,
  }));

  return { years, yearId, setYearId, yearOptions, loading, reload };
}

export function AcademicYearPicker({
  yearId,
  yearOptions,
  onChange,
  className = "",
}) {
  if (!yearOptions?.length) {
    return (
      <p className={`text-sm text-amber-700 ${className}`}>
        No academic year yet — create one in Settings.
      </p>
    );
  }

  return (
    <div className={`min-w-[220px] ${className}`}>
      <CustomSelect
        options={yearOptions}
        value={yearId}
        onChange={(opt) => onChange(opt?.value || "")}
        placeholder="Academic year"
      />
    </div>
  );
}
