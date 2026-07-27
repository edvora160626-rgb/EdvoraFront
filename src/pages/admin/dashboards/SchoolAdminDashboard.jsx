import { Link } from "react-router-dom";
import {
  BookOpen,
  Building2,
  ClipboardCheck,
  ClipboardList,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { getCurrentUser } from "../../../utils/auth";
import { ROLE_LABELS, getRoleConfig } from "../../../utils/rolePermissions";
import EdvoraLoader from "../../../common/EdvoraLoader";
import DashboardHero from "./shared/DashboardHero";
import StatCard from "./shared/StatCard";
import QuickLinks from "./shared/QuickLinks";
import MiniCalendar from "./shared/MiniCalendar";
import ScheduleTimeline from "./shared/ScheduleTimeline";
import SectionCard from "./shared/SectionCard";
import DonutChart from "./shared/DonutChart";
import BarChart from "./shared/BarChart";
import RemindersList from "./shared/RemindersList";
import usePendingRequests from "./shared/usePendingRequests";

const QUICK_LINKS = [
  { label: "Departments", icon: Building2, to: "/admin/departments" },
  { label: "Classes", icon: BookOpen, to: "/admin/classes" },
  { label: "Teacher Attendance", icon: ClipboardCheck, to: "/admin/teacher-attendance" },
  { label: "Requests", icon: ClipboardList, to: "/admin/requests" },
  { label: "Staff", icon: UserCheck },
  { label: "Fees", icon: IndianRupee },
  { label: "Reports", icon: TrendingUp },
];

const STAFF_ATTENDANCE = [
  { label: "Mon", a: 92, b: 98 },
  { label: "Tue", a: 88, b: 96 },
  { label: "Wed", a: 94, b: 99 },
  { label: "Thu", a: 90, b: 97 },
  { label: "Fri", a: 86, b: 95 },
];

function SchoolAdminDashboard() {
  const user = getCurrentUser();
  const config = getRoleConfig();
  const { loading, totalPending, actionablePending, recentRequests, stats } =
    usePendingRequests();

  if (loading) return <EdvoraLoader message="Loading school admin dashboard…" />;

  return (
    <div className="space-y-6 sm:space-y-7">
      <DashboardHero
        portalTitle={config.portalTitle}
        firstName={user?.firstName}
        summary="Operations pulse: staff attendance, teacher approvals, classes, and fee collection."
        ctaLabel="Review Teacher Requests"
        ctaTo="/admin/requests"
        accentStats={[
          { label: "Pending Overview", value: totalPending },
          { label: "Teacher Approvals", value: actionablePending, highlight: true },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Active Teachers" value="64" subtitle="2 on leave today" icon={UserCheck} spark={[58, 60, 61, 62, 63, 64, 64]} />
        <StatCard title="Students Enrolled" value="1,248" subtitle="+18 this month" icon={Users} accent="#8F6580" spark={[1180, 1200, 1210, 1225, 1235, 1240, 1248]} />
        <StatCard title="Fee Collection" value="86%" subtitle="₹42.6L of ₹49.5L" icon={IndianRupee} accent="#D4B87A" spark={[70, 74, 78, 80, 82, 84, 86]} />
        <StatCard title="Teacher Requests" value={String(actionablePending)} subtitle="Awaiting your decision" icon={ShieldCheck} accent="#735366" to="/admin/requests" />
      </div>

      <QuickLinks items={QUICK_LINKS} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5">
        <div className="xl:col-span-8 space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <SectionCard title="Staff Attendance Today" subtitle="Present vs expected" actionLabel="Open" actionTo="/admin/teacher-attendance">
              <div className="flex items-center gap-5">
                <DonutChart value={91} label="Present" color="#8F6580" />
                <div className="space-y-2 text-sm flex-1">
                  <div className="flex justify-between"><span className="text-slate-500">Present</span><span className="font-semibold text-[#735366]">58</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">On leave</span><span className="font-semibold text-amber-600">4</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Absent</span><span className="font-semibold text-red-500">2</span></div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Weekly Staff Trend" subtitle="Attendance % · Target %">
              <div className="flex items-center gap-4 mb-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#A77A95]" /> Actual</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#F5D69B]" /> Target</span>
              </div>
              <BarChart data={STAFF_ATTENDANCE} />
            </SectionCard>
          </div>

          <SectionCard title="Pending by Category" subtitle="Teacher approvals first — then parent & student views" actionLabel="Manage" actionTo="/admin/requests">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stats.map((s) => (
                <Link
                  key={s.role}
                  to="/admin/requests"
                  className={`rounded-xl border p-4 hover:shadow-md transition ${
                    s.actionable ? "border-[#C3C3D5] bg-[#FAEEE9]/50" : "border-slate-100 bg-white"
                  }`}
                >
                  <p className="text-xs text-slate-500">{ROLE_LABELS[s.role] || s.role}</p>
                  <p className="text-2xl font-bold text-[#735366] mt-1">{s.count}</p>
                  <p className="text-[11px] mt-1 font-medium text-[#A77A95]">
                    {s.actionable ? "Can approve / reject" : "View only"}
                  </p>
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recent Requests" actionLabel="View all" actionTo="/admin/requests">
            {recentRequests.length ? (
              <ul className="space-y-2.5">
                {recentRequests.map((r) => (
                  <li key={r._id} className="flex items-center gap-3 rounded-xl bg-slate-50/80 border border-slate-100 p-3">
                    <div className="h-9 w-9 rounded-full bg-[#FAEEE9] text-[#A77A95] flex items-center justify-center text-xs font-bold">
                      {r.firstName?.[0]}{r.lastName?.[0] || ""}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#735366] truncate">{r.firstName} {r.lastName}</p>
                      <p className="text-xs text-slate-500">{ROLE_LABELS[r.role] || r.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">Inbox clear — no pending requests.</p>
            )}
          </SectionCard>
        </div>

        <aside className="xl:col-span-4 space-y-4 sm:space-y-5">
          <MiniCalendar />
          <ScheduleTimeline
            title="Ops Calendar"
            items={[
              { title: "Staff briefing", meta: "Conference room", time: "09:00", now: true },
              { title: "Department review", meta: "Science wing", time: "11:30" },
              { title: "Fee follow-up call", meta: "Accounts desk", time: "15:00" },
            ]}
          />
          <RemindersList
            items={[
              { title: "Mark teacher attendance", detail: "Open attendance before 10 AM", when: "Today" },
              { title: "New class sections", detail: "Confirm 8C & 9D capacity", when: "This week" },
              { title: "Fee defaulters", detail: "14 families overdue > 30 days", when: "Priority" },
            ]}
          />
        </aside>
      </div>
    </div>
  );
}

export default SchoolAdminDashboard;
