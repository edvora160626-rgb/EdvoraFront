import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CalendarClock,
  DoorOpen,
  FileEdit,
  Settings2,
  Users,
} from "lucide-react";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";
import { listTimetableDashboard } from "../../../utils/timetableApi";
import TimetableSubnav from "./TimetableSubnav";
import { AcademicYearPicker, useAcademicYear } from "./useAcademicYear";

function StatCard({ label, value, icon: Icon, tone = "default" }) {
  const tones = {
    default: "bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[color:var(--edvora-ink-strong)]">{value}</p>
    </div>
  );
}

export default function TimetableDashboard() {
  const navigate = useNavigate();
  const { yearId, setYearId, yearOptions, loading: yearLoading } =
    useAcademicYear();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!yearId) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const result = await listTimetableDashboard(yearId);
        if (!cancelled) setData(result);
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message || "Failed to load dashboard",
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
  }, [yearId]);

  if (yearLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading timetable…" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[color:var(--edvora-ink-strong)] sm:text-2xl">
            Timetable
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage periods, rooms, allocations, and weekly class grids.
          </p>
        </div>
        <AcademicYearPicker
          yearId={yearId}
          yearOptions={yearOptions}
          onChange={setYearId}
        />
      </div>

      <TimetableSubnav />

      {!yearId ? (
        <div className="rounded-xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <CalendarClock className="mx-auto text-[color:var(--edvora-primary)]" size={36} />
          <p className="mt-3 text-[color:var(--edvora-ink-strong)] font-medium">
            Set up an academic year to begin
          </p>
          <Link
            to="/admin/timetable/settings"
            className="mt-4 inline-flex h-[42px] items-center rounded-lg bg-[color:var(--edvora-primary)] px-4 text-sm font-medium text-white hover:bg-[color:var(--edvora-primary-hover)]"
          >
            Go to Settings
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Published"
              value={data?.counts?.PUBLISHED || 0}
              icon={BookOpen}
              tone="green"
            />
            <StatCard
              label="Drafts"
              value={data?.counts?.DRAFT || 0}
              icon={FileEdit}
              tone="amber"
            />
            <StatCard
              label="Active Rooms"
              value={data?.rooms || 0}
              icon={DoorOpen}
            />
            <StatCard
              label="Period Slots"
              value={data?.slots || 0}
              icon={Settings2}
            />
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <Link
              to="/admin/timetable/settings"
              className="inline-flex h-[42px] items-center gap-2 rounded-lg border border-[color:var(--edvora-border)] bg-white px-4 text-sm font-medium text-[color:var(--edvora-ink-strong)] hover:border-[color:var(--edvora-primary)]/50"
            >
              <Settings2 size={16} /> Settings
            </Link>
            <Link
              to="/admin/timetable/rooms"
              className="inline-flex h-[42px] items-center gap-2 rounded-lg border border-[color:var(--edvora-border)] bg-white px-4 text-sm font-medium text-[color:var(--edvora-ink-strong)] hover:border-[color:var(--edvora-primary)]/50"
            >
              <DoorOpen size={16} /> Rooms
            </Link>
            <Link
              to="/admin/timetable/allocations"
              className="inline-flex h-[42px] items-center gap-2 rounded-lg border border-[color:var(--edvora-border)] bg-white px-4 text-sm font-medium text-[color:var(--edvora-ink-strong)] hover:border-[color:var(--edvora-primary)]/50"
            >
              <Users size={16} /> Allocations
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-[color:var(--edvora-ink-strong)]">
                Class Timetables
              </h2>
              {!data?.classes?.length ? (
                <p className="text-sm text-slate-500">
                  No active classes found. Create classes first.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.classes.map((cls) => (
                    <button
                      key={cls._id}
                      type="button"
                      onClick={() =>
                        navigate(`/admin/timetable/class/${cls._id}`)
                      }
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-left transition hover:border-[color:var(--edvora-primary)]/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]">
                          <BookOpen size={18} />
                        </span>
                        <div>
                          <p className="font-medium text-[color:var(--edvora-ink-strong)]">
                            {cls.className} {cls.section}
                          </p>
                          <p className="text-xs text-slate-500">
                            {cls.timetableStatus
                              ? cls.timetableStatus === "PUBLISHED"
                                ? "Published"
                                : "Draft"
                              : "Not started"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          cls.timetableStatus === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700"
                            : cls.timetableStatus === "DRAFT"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cls.timetableStatus || "NEW"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-[color:var(--edvora-ink-strong)]">
                Recent Drafts
              </h2>
              {!data?.drafts?.length ? (
                <p className="text-sm text-slate-500">No draft timetables.</p>
              ) : (
                <ul className="space-y-2">
                  {data.drafts.map((d) => (
                    <li key={d._id}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/timetable/class/${d.classId?._id || d.classId}`
                          )
                        }
                        className="w-full rounded-lg border border-slate-100 px-3 py-2 text-left text-sm hover:border-[color:var(--edvora-primary)]/40"
                      >
                        <span className="font-medium text-[color:var(--edvora-ink-strong)]">
                          {d.classId
                            ? `${d.classId.className} ${d.classId.section}`
                            : "Class"}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-450 text-slate-500">
                          Updated{" "}
                          {d.updatedAt
                            ? new Date(d.updatedAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
