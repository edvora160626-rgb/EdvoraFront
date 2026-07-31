import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CloudUpload,
  GraduationCap,
  ScrollText,
  Sparkles,
  Users,
} from "lucide-react";
import CustomDatePicker from "../../common/CustomDatePicker";
import { openSnackbar } from "../../common/snackbar/snackbar";
import {
  ATTENDANCE_STATUSES,
  getAssignedClassesForAttendance,
  todayISO,
} from "../../utils/attendanceApi";

function StatPill({ label, value, tone }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${tone}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function StudentAttendance() {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayISO());
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await getAssignedClassesForAttendance(date);
        if (!cancelled) setClasses(data.classes || []);
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message ||
              "Failed to load your assigned classes",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, classes.length ? 180 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    import("./StudentAttendanceMark");
    import("./BulkAttendanceUpload");
    import("./AttendanceLogs");
  }, []);

  const totals = useMemo(() => {
    return classes.reduce(
      (acc, cls) => {
        acc.students += cls.totalStudents || 0;
        acc.markedClasses += cls.isMarked ? 1 : 0;
        acc.present += cls.summary?.PRESENT || 0;
        return acc;
      },
      { students: 0, markedClasses: 0, present: 0 }
    );
  }, [classes]);

  const presentRate =
    totals.students > 0
      ? Math.round((totals.present / totals.students) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] bg-linear-to-br from-[#735366] via-[#8F6580] to-[#A77A95] text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-[#F5D69B]/25 blur-2xl" />
          <div className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute top-1/2 right-1/3 h-24 w-24 rounded-full bg-[#C3C3D5]/20" />
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#F5D69B]">
                <Sparkles size={14} />
                Class Teacher · Student Attendance
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
                Student Attendance
              </h1>
              <p className="mt-2 text-sm sm:text-base text-white/80 max-w-xl">
                Mark daily attendance for each class assigned to you — same
                roll-call flow as teacher attendance, scoped to your classes.
              </p>
            </div>

            <div className="w-full max-w-xs rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                <CalendarDays size={14} />
                Attendance Date
              </label>
              <div className="rounded-xl bg-white overflow-hidden">
                <CustomDatePicker
                  value={date}
                  onChange={setDate}
                  openTo="day"
                  maxDate={todayISO()}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatPill
              label="My Classes"
              value={classes.length}
              tone="bg-white/10 border-white/15 text-white"
            />
            <StatPill
              label="Students"
              value={totals.students || "—"}
              tone="bg-white/10 border-white/15 text-white"
            />
            <StatPill
              label="Classes Marked"
              value={`${totals.markedClasses}/${classes.length || 0}`}
              tone="bg-emerald-400/15 border-emerald-300/30 text-white"
            />
            <StatPill
              label="Present Rate"
              value={`${presentRate}%`}
              tone="bg-[#F5D69B]/20 border-[#F5D69B]/40 text-white"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/student-attendance/logs"
          className="group rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-[#A77A95]/35 transition"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAEEE9] text-[#A77A95] group-hover:scale-105 transition">
              <ScrollText size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-[#735366]">View Logs</h2>
              <p className="mt-1 text-sm text-slate-500">
                Browse mark history and bulk-upload audit trails for your
                classes.
              </p>
              <p className="mt-4 text-sm font-semibold text-[#A77A95]">
                Open logs →
              </p>
            </div>
          </div>
        </Link>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAEEE9] text-[#A77A95]">
              <BookOpen size={22} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#735366]">
                How it works
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Only classes where you are the assigned class teacher appear
                below. Open a class to mark or bulk-upload attendance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#735366]">
              My Classes
            </h3>
            <p className="text-sm text-slate-500">
              Day sheets for {date.split("-").reverse().join("-")}
            </p>
          </div>
          <span className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAEEE9] text-[#A77A95]">
            <GraduationCap size={18} />
          </span>
        </div>

        {!loading && classes.length === 0 ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-5 py-8 text-center">
            <Users className="mx-auto text-amber-600" size={28} />
            <p className="mt-3 text-base font-semibold text-[#735366]">
              No classes assigned to you
            </p>
            <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
              Ask your school admin to assign you as class teacher for a class.
              Then you can mark student attendance here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const counts = cls.summary || {};
              const presentPct =
                cls.totalStudents > 0
                  ? Math.round(
                      ((counts.PRESENT || 0) / cls.totalStudents) * 100
                    )
                  : 0;

              return (
                <div
                  key={cls._id}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#A77A95]/35 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-lg font-semibold text-[#735366] truncate">
                        {cls.className}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Section {cls.section} · {cls.totalStudents} students
                      </p>
                    </div>
                    {cls.isMarked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 shrink-0">
                        <CheckCircle2 size={12} />
                        Saved
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 shrink-0">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-emerald-50 px-2.5 py-2 text-center">
                      <p className="text-[10px] font-semibold text-emerald-700">
                        Present
                      </p>
                      <p className="text-sm font-bold text-emerald-800">
                        {counts.PRESENT || 0}
                      </p>
                    </div>
                    <div className="rounded-xl bg-rose-50 px-2.5 py-2 text-center">
                      <p className="text-[10px] font-semibold text-rose-700">
                        Absent
                      </p>
                      <p className="text-sm font-bold text-rose-800">
                        {counts.ABSENT || 0}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#FAEEE9] px-2.5 py-2 text-center">
                      <p className="text-[10px] font-semibold text-[#735366]">
                        Rate
                      </p>
                      <p className="text-sm font-bold text-[#735366]">
                        {presentPct}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/student-attendance/mark/${cls._id}?date=${date}`
                        )
                      }
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#A77A95] hover:bg-[#8F6580] px-3 h-10 text-sm font-semibold text-white"
                    >
                      <ClipboardCheck size={15} />
                      Mark
                    </button>
                    <Link
                      to={`/admin/student-attendance/bulk-upload?date=${date}&classId=${cls._id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 h-10 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <CloudUpload size={15} />
                      Bulk
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {classes.some((cls) => cls.isMarked) ? (
        <section className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#735366]">
                Status Legend
              </h3>
              <p className="text-sm text-slate-500">
                Same statuses as teacher attendance
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ATTENDANCE_STATUSES.map((status) => (
              <div
                key={status.value}
                className={`rounded-xl border px-3 py-3 ${status.color}`}
              >
                <p className="text-xs font-semibold">{status.label}</p>
                <p className="mt-1 text-sm font-bold">{status.short}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {loading ? (
        <div className="fixed bottom-4 right-4 z-40 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#735366] shadow-lg border border-slate-100">
          Updating…
        </div>
      ) : null}
    </div>
  );
}

export default StudentAttendance;
