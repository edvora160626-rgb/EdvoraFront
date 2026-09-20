import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Library,
  Sparkles,
  Users,
} from "lucide-react";
import { getCurrentUser } from "../../../utils/auth";
import { ROLE_LABELS, getRoleConfig } from "../../../utils/rolePermissions";
import EdvoraLoader from "../../../common/EdvoraLoader";
import MiniCalendar from "./shared/MiniCalendar";
import usePendingRequests from "./shared/usePendingRequests";

const QUICK_LINKS = [
  { label: "Departments", icon: Building2, to: "/admin/departments" },
  { label: "Classes", icon: BookOpen, to: "/admin/classes" },
  { label: "Subjects", icon: Library, to: "/admin/subjects" },
  { label: "Timetable", icon: CalendarClock, to: "/admin/timetable" },
  { label: "Attendance", icon: ClipboardCheck, to: "/admin/teacher-attendance" },
  { label: "Events", icon: CalendarDays, to: "/admin/upcoming-events" },
  { label: "Requests", icon: ClipboardList, to: "/admin/requests" },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const glass =
  "rounded-3xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] shadow-[var(--edvora-glass-shadow)] backdrop-blur-[18px] saturate-[165%]";

function SchoolAdminDashboard() {
  const user = getCurrentUser();
  const config = getRoleConfig();
  const { sidebarOpen = true } = useOutletContext() || {};
  const wide = !sidebarOpen;
  const { loading, totalPending, actionablePending, recentRequests, stats } =
    usePendingRequests();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const pulseItems = [
    {
      label: "Pending overview",
      value: totalPending,
      hint: "Across all roles",
    },
    {
      label: "Teacher approvals",
      value: actionablePending,
      hint: "Needs your decision",
      to: "/admin/requests",
    },
    {
      label: "Quick actions",
      value: QUICK_LINKS.length,
      hint: "Modules ready",
    },
  ];

  if (loading) {
    return <EdvoraLoader message="Loading school admin dashboard…" />;
  }

  return (
    <div
      className={`space-y-6 sm:space-y-8 transition-[gap] duration-300 ${
        wide ? "space-y-7 sm:space-y-9" : ""
      }`}
      data-layout={wide ? "full" : "sidebar"}
    >
      {/* Hero — expands into a two-column composition when sidebar is compressed */}
      <section className={`relative overflow-hidden ${glass} p-6 sm:p-8 lg:p-10`}>
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--edvora-primary) 32%, transparent), transparent 68%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-28 left-10 h-56 w-56 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--edvora-accent) 28%, transparent), transparent 70%)",
          }}
        />

        <div
          className={`relative grid gap-8 ${
            wide
              ? "lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end"
              : ""
          }`}
        >
          <div className={wide ? "max-w-none" : "max-w-3xl"}>
            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--edvora-glass-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border-soft)]">
              <Sparkles size={13} />
              {config.portalTitle}
            </div>

            <h1
              className={`mt-5 font-bold tracking-tight text-[color:var(--edvora-ink-strong)] ${
                wide ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"
              }`}
            >
              Edvora
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-[color:var(--edvora-ink)]">
              {greeting()}
              {user?.firstName ? `, ${user.firstName}` : ""}
            </p>
            <p
              className={`mt-2 text-sm sm:text-base text-[color:var(--edvora-muted)] leading-relaxed ${
                wide ? "max-w-2xl" : "max-w-xl"
              }`}
            >
              Run your school day from one place — classes, subjects, timetable,
              and approvals.
            </p>
            <p className="mt-3 text-xs font-medium text-[color:var(--edvora-muted)]">
              {today}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/admin/requests"
                className="inline-flex h-[46px] items-center gap-2 rounded-2xl theme-btn-primary px-5 text-sm font-semibold"
              >
                Review requests
                <ArrowUpRight size={16} />
              </Link>
              <Link
                to="/admin/timetable"
                className="inline-flex h-[46px] items-center gap-2 rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] px-5 text-sm font-semibold text-[color:var(--edvora-ink)] hover:border-[color:var(--edvora-primary)]/35"
              >
                Open timetable
              </Link>
            </div>
          </div>

          {wide ? (
            <div className="grid grid-cols-3 gap-3">
              {pulseItems.map((item) => {
                const inner = (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--edvora-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-[color:var(--edvora-ink-strong)] tabular-nums">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[11px] text-[color:var(--edvora-muted)]">
                      {item.hint}
                    </p>
                  </>
                );
                const className =
                  "rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] p-4 transition hover:border-[color:var(--edvora-primary)]/35";
                return item.to ? (
                  <Link key={item.label} to={item.to} className={className}>
                    {inner}
                  </Link>
                ) : (
                  <div key={item.label} className={className}>
                    {inner}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      {/* Pulse strip — only when sidebar is open (otherwise in hero) */}
      {!wide ? (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {pulseItems.map((item) => {
            const inner = (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--edvora-muted)]">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[color:var(--edvora-ink-strong)] tabular-nums">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-[color:var(--edvora-muted)]">
                  {item.hint}
                </p>
              </>
            );
            const className = `${glass} p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--edvora-primary)]/30`;
            return item.to ? (
              <Link key={item.label} to={item.to} className={className}>
                {inner}
              </Link>
            ) : (
              <div key={item.label} className={className}>
                {inner}
              </div>
            );
          })}
        </section>
      ) : null}

      {/* Navigate */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[color:var(--edvora-ink-strong)]">
              Navigate
            </h2>
            <p className="text-sm text-[color:var(--edvora-muted)]">
              Jump into the modules you use most.
            </p>
          </div>
        </div>
        <div
          className={`grid gap-3 ${
            wide
              ? "grid-cols-2 sm:grid-cols-4 xl:grid-cols-7"
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-7"
          }`}
        >
          {QUICK_LINKS.map(({ label, icon: Icon, to }) => (
            <Link
              key={label}
              to={to}
              className={`group ${glass} flex flex-col items-start gap-4 p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--edvora-primary)]/35 ${
                wide ? "sm:p-5" : ""
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-primary)] ring-1 ring-[color:var(--edvora-glass-border-soft)] transition group-hover:bg-[color:var(--edvora-primary)] group-hover:text-white">
                <Icon size={18} />
              </span>
              <span className="text-sm font-semibold text-[color:var(--edvora-ink-strong)]">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Ops + calendar — fuller split when compressed */}
      <section
        className={`grid grid-cols-1 gap-4 sm:gap-5 ${
          wide ? "xl:grid-cols-12" : "xl:grid-cols-12"
        }`}
      >
        <div className={`${wide ? "xl:col-span-8" : "xl:col-span-7"} ${glass} p-5 sm:p-6`}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-[color:var(--edvora-ink-strong)]">
                Approvals
              </h2>
              <p className="text-sm text-[color:var(--edvora-muted)]">
                Pending by role — teacher actions first.
              </p>
            </div>
            <Link
              to="/admin/requests"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--edvora-primary)] hover:underline"
            >
              Manage <ArrowUpRight size={14} />
            </Link>
          </div>

          <div
            className={`grid gap-3 mb-6 ${
              wide ? "grid-cols-1 sm:grid-cols-3 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {stats.map((s) => (
              <Link
                key={s.role}
                to="/admin/requests"
                className={`rounded-2xl border p-4 transition hover:border-[color:var(--edvora-primary)]/35 ${
                  s.actionable
                    ? "border-[color:var(--edvora-primary)]/25 bg-[color:var(--edvora-primary)]/8"
                    : "border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)]"
                }`}
              >
                <p className="text-xs text-[color:var(--edvora-muted)]">
                  {ROLE_LABELS[s.role] || s.role}
                </p>
                <p className="mt-1 text-2xl font-bold text-[color:var(--edvora-ink-strong)]">
                  {s.count}
                </p>
                <p className="mt-1 text-[11px] font-medium text-[color:var(--edvora-primary)]">
                  {s.actionable ? "Can approve" : "View only"}
                </p>
              </Link>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-[color:var(--edvora-ink-strong)] mb-3">
            Recent requests
          </h3>
          {recentRequests.length ? (
            <ul
              className={`gap-2 ${
                wide
                  ? "grid grid-cols-1 md:grid-cols-2"
                  : "space-y-2"
              }`}
            >
              {recentRequests.map((r) => (
                <li
                  key={r._id}
                  className="flex items-center gap-3 rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] px-3 py-2.5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--edvora-primary)]/12 text-xs font-bold text-[color:var(--edvora-primary)]">
                    {r.firstName?.[0]}
                    {r.lastName?.[0] || ""}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[color:var(--edvora-ink-strong)] truncate">
                      {r.firstName} {r.lastName}
                    </p>
                    <p className="text-xs text-[color:var(--edvora-muted)]">
                      {ROLE_LABELS[r.role] || r.role}
                    </p>
                  </div>
                  <Users size={14} className="text-[color:var(--edvora-muted)]" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-[color:var(--edvora-glass-border-soft)] px-4 py-8 text-center text-sm text-[color:var(--edvora-muted)]">
              Inbox clear — no pending requests.
            </p>
          )}
        </div>

        <aside className={`${wide ? "xl:col-span-4" : "xl:col-span-5"} space-y-4 sm:space-y-5`}>
          <div className={`${glass} p-2 overflow-hidden`}>
            <MiniCalendar />
          </div>
          <div className={`${glass} p-5`}>
            <h2 className="text-lg font-bold text-[color:var(--edvora-ink-strong)]">
              Today
            </h2>
            <p className="text-sm text-[color:var(--edvora-muted)] mb-4">
              Suggested focus for school ops.
            </p>
            <ul className="space-y-3">
              {[
                {
                  title: "Teacher attendance",
                  detail: "Confirm staff presence before 10 AM",
                  to: "/admin/teacher-attendance",
                },
                {
                  title: "Timetable drafts",
                  detail: "Publish class grids for the week",
                  to: "/admin/timetable",
                },
                {
                  title: "Subject coverage",
                  detail: "Assign subjects to new sections",
                  to: "/admin/subjects",
                },
              ].map((item) => (
                <li key={item.title}>
                  <Link
                    to={item.to}
                    className="block rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)] px-3.5 py-3 transition hover:border-[color:var(--edvora-primary)]/35"
                  >
                    <p className="text-sm font-semibold text-[color:var(--edvora-ink-strong)]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[color:var(--edvora-muted)]">
                      {item.detail}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default SchoolAdminDashboard;
