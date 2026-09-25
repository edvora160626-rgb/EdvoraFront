import { useEffect, useMemo, useState } from "react";
import CustomSelect from "../../../common/CustomSelect";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";
import { getActiveStaffBySchool } from "../../../utils/classesApi";
import {
  getTeacherTimetable,
  teacherName,
} from "../../../utils/timetableApi";
import ScheduleBoard from "./ScheduleBoard";
import TimetableSubnav from "./TimetableSubnav";
import { AcademicYearPicker, useAcademicYear } from "./useAcademicYear";

const labelClass = "block text-[13px] font-semibold text-[#667085] mb-1.5";

export default function TeacherTimetable() {
  const { yearId, setYearId, yearOptions, loading: yearLoading } =
    useAcademicYear();
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [includeDrafts, setIncludeDrafts] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await getActiveStaffBySchool();
        setTeachers(result.staff || []);
      } catch (error) {
        openSnackbar({
          message: error?.response?.data?.message || "Failed to load teachers",
          variant: "error",
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!yearId || !teacherId) {
      setData(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const result = await getTeacherTimetable(
          yearId,
          teacherId,
          !includeDrafts
        );
        if (!cancelled) setData(result);
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message || "Failed to load timetable",
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
  }, [yearId, teacherId, includeDrafts]);

  const teacherOptions = useMemo(
    () =>
      teachers.map((t) => ({
        value: t._id,
        label: teacherName(t),
      })),
    [teachers]
  );

  const workingDays = data?.settings?.workingDays || [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-[color:var(--edvora-ink-strong)] sm:text-2xl">
          Teacher Timetable
        </h1>
        <p className="mt-1 text-sm text-[color:var(--edvora-muted)]">
          See which subject and class this teacher is assigned to.
        </p>
      </div>

      <TimetableSubnav />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <AcademicYearPicker
          yearId={yearId}
          yearOptions={yearOptions}
          onChange={setYearId}
        />
        <div className="min-w-[240px]">
          <label className={labelClass}>Teacher</label>
          <CustomSelect
            options={teacherOptions}
            value={teacherId}
            onChange={(opt) => setTeacherId(opt?.value || "")}
            placeholder="Select teacher"
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-[color:var(--edvora-muted)]">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[color:var(--edvora-primary)]"
            checked={includeDrafts}
            onChange={(e) => setIncludeDrafts(e.target.checked)}
          />
          Include drafts
        </label>
      </div>

      {yearLoading || loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <EdvoraLoader message="Loading…" />
        </div>
      ) : !teacherId ? (
        <div className="rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] p-8 text-center text-sm text-[color:var(--edvora-muted)]">
          Select a teacher to view their timetable.
        </div>
      ) : (
        <>
          {data?.teacher ? (
            <p className="mb-3 text-sm font-medium text-[color:var(--edvora-ink-strong)]">
              Schedule for {teacherName(data.teacher)}
            </p>
          ) : null}
          {(data?.entries || []).length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] p-8 text-center text-sm text-[color:var(--edvora-muted)]">
              No periods are assigned to this teacher yet.
            </div>
          ) : (
            <ScheduleBoard
              readOnly
              showClass
              workingDays={workingDays}
              schoolStart={data?.settings?.schoolStart || "08:00"}
              schoolEnd={data?.settings?.schoolEnd || "15:00"}
              slots={data?.slots || []}
              entries={data?.entries || []}
            />
          )}
        </>
      )}
    </div>
  );
}
