import { Link } from "react-router-dom";
import {
  BookOpen,
  Bot,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutGrid,
  Sparkles,
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
import RiskAlerts from "./shared/RiskAlerts";
import RemindersList from "./shared/RemindersList";
import usePendingRequests from "./shared/usePendingRequests";

const QUICK_LINKS = [
  { label: "Attendance", icon: ClipboardCheck, to: "/admin/student-attendance" },
  { label: "Requests", icon: ClipboardList, to: "/admin/requests" },
  { label: "Class Roster", icon: Users },
  { label: "Lesson Plans", icon: BookOpen },
  { label: "Assignments", icon: FileText },
  { label: "Results", icon: GraduationCap },
  { label: "AI Quiz", icon: Bot },
];

const SCHEDULE = [
  { title: "Class 9C — Physics", meta: "Lab 2 · Wave Optics", time: "08:30 – 09:20", now: true },
  { title: "Class 10A — Physics", meta: "Room 204 · Thermodynamics", time: "10:00 – 10:50" },
  { title: "Class 11B — Physics", meta: "Room 118 · Electrostatics", time: "12:10 – 13:00" },
];

const ACTIVITIES = [
  { date: "Jul 28", title: "Physics Practical", meta: "Class 10A · 10:00 AM" },
  { date: "Jul 29", title: "Parent Meet Slot", meta: "Online · 4:00 PM" },
  { date: "Jul 30", title: "Unit Test Review", meta: "Class 9C · 9:00 AM" },
  { date: "Aug 01", title: "Science Fair Prep", meta: "Hall B · 2:00 PM" },
];

const RISK = [
  { name: "Arjun Mehta", initials: "AM", reason: "Declining in Physics & Maths", level: "High" },
  { name: "Sara Khan", initials: "SK", reason: "3 absences this fortnight", level: "Medium" },
  { name: "Leo Fernandes", initials: "LF", reason: "Homework lag — 2 overdue", level: "Low" },
];

const PERFORMANCE = [
  { label: "9C", a: 72, b: 94 },
  { label: "10A", a: 78, b: 97 },
  { label: "10B", a: 69, b: 91 },
  { label: "11B", a: 81, b: 98 },
];

function TeacherDashboard() {
  const user = getCurrentUser();
  const config = getRoleConfig();
  const { loading, totalPending, actionablePending, recentRequests } = usePendingRequests();

  if (loading) return <EdvoraLoader message="Loading teacher dashboard…" />;

  return (
    <div className="space-y-6 sm:space-y-7">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        <div className="xl:col-span-2">
          <DashboardHero
            portalTitle={config.portalTitle}
            firstName={user?.firstName}
            summary="You have 3 classes today and pending student & parent requests to review."
            ctaLabel="Mark Attendance"
            ctaTo="/admin/student-attendance"
            accentStats={[
              { label: "Pending Requests", value: totalPending },
              { label: "Needs Action", value: actionablePending, highlight: true },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#A77A95] to-[#735366] text-white">
              <BookOpen size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#735366]">AI Lesson Planner</p>
              <p className="text-xs text-slate-500">Draft next week’s physics plan</p>
            </div>
            <Sparkles size={16} className="ml-auto text-[#D4B87A]" />
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#F5D69B] to-[#D4B87A] text-[#735366]">
              <Bot size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#735366]">AI Content Generator</p>
              <p className="text-xs text-slate-500">Worksheets, quizzes & summaries</p>
            </div>
            <LayoutGrid size={16} className="ml-auto text-[#A77A95]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Today's Classes" value="3" subtitle="Next at 10:00 AM" icon={BookOpen} spark={[3, 4, 2, 5, 3, 4, 3]} />
        <StatCard title="Student Count" value="128" subtitle="Across 4 classes" icon={Users} accent="#8F6580" spark={[110, 118, 120, 122, 125, 126, 128]} />
        <StatCard title="To Grade" value="12" subtitle="Due within 3 days" icon={FileText} accent="#D4B87A" spark={[8, 10, 9, 14, 11, 13, 12]} />
        <StatCard title="Pending Requests" value={String(actionablePending)} subtitle="Students & parents" icon={ClipboardList} accent="#735366" to="/admin/requests" spark={[2, 4, 3, 5, 4, 6, actionablePending || 2]} />
      </div>

      <QuickLinks items={QUICK_LINKS} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5">
        <div className="xl:col-span-8 space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <SectionCard title="Upcoming Activities" subtitle="This week’s highlights">
              <ul className="space-y-3">
                {ACTIVITIES.map((a) => (
                  <li key={a.title} className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#FAEEE9] text-[#8F6580] text-[10px] font-bold leading-tight">
                      {a.date.split(" ")[0]}
                      <span className="text-sm">{a.date.split(" ")[1]}</span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#735366] truncate">{a.title}</p>
                      <p className="text-xs text-slate-500">{a.meta}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Homework Submissions" subtitle="Last 7 days across your classes">
              <div className="flex items-center gap-5">
                <DonutChart value={76} />
                <div className="space-y-2 text-sm flex-1">
                  <div className="flex justify-between"><span className="text-slate-500">Assigned</span><span className="font-semibold text-[#735366]">48</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Submitted</span><span className="font-semibold text-[#A77A95]">36</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Overdue</span><span className="font-semibold text-amber-600">7</span></div>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <RiskAlerts items={RISK} />
            <SectionCard title="Student Performance" subtitle="Class average vs top score">
              <div className="flex items-center gap-4 mb-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#A77A95]" /> Avg %</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#F5D69B]" /> Top %</span>
              </div>
              <BarChart data={PERFORMANCE} />
            </SectionCard>
          </div>

          <SectionCard title="Recent Registration Requests" subtitle="Students & parents awaiting review" actionLabel="View all" actionTo="/admin/requests">
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
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#FAEEE9] text-[#8F6580]">
                      {r.actionable ? "Action" : "View"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">No pending requests right now.</p>
            )}
          </SectionCard>
        </div>

        <aside className="xl:col-span-4 space-y-4 sm:space-y-5">
          <MiniCalendar markedDates={[new Date(), new Date(Date.now() + 86400000 * 2)]} />
          <ScheduleTimeline items={SCHEDULE} />
          <RemindersList
            items={[
              { title: "Upcoming Lecture", detail: "Class 10A — Thermodynamics", when: "In 15 minutes" },
              { title: "Pending Evaluations", detail: "12 assignments waiting for grades", when: "Due this week" },
              { title: "Attendance Reminder", detail: "Mark Class 9C attendance", when: "Before 9:30 AM" },
            ]}
          />
          <Link
            to="/admin/student-attendance"
            className="block rounded-2xl bg-linear-to-br from-[#FAEEE9] to-white border border-[#C3C3D5] p-4 text-center text-sm font-semibold text-[#8F6580] hover:shadow-md transition"
          >
            Open Student Attendance →
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default TeacherDashboard;
