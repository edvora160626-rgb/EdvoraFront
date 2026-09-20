import {
  BookOpen,
  CalendarDays,
  CreditCard,
  MessageSquare,
  TrendingUp,
  UserRound,
  ClipboardCheck,
  Bell,
} from "lucide-react";
import { getCurrentUser } from "../../../utils/auth";
import { getRoleConfig } from "../../../utils/rolePermissions";
import DashboardHero from "./shared/DashboardHero";
import StatCard from "./shared/StatCard";
import QuickLinks from "./shared/QuickLinks";
import MiniCalendar from "./shared/MiniCalendar";
import ScheduleTimeline from "./shared/ScheduleTimeline";
import SectionCard from "./shared/SectionCard";
import DonutChart from "./shared/DonutChart";
import BarChart from "./shared/BarChart";
import RemindersList from "./shared/RemindersList";
import RiskAlerts from "./shared/RiskAlerts";

const QUICK_LINKS = [
  { label: "My Child", icon: UserRound },
  { label: "Attendance", icon: ClipboardCheck },
  { label: "Events", icon: CalendarDays, to: "/admin/upcoming-events" },
  { label: "Fees", icon: CreditCard },
  { label: "Messages", icon: MessageSquare },
  { label: "Timetable", icon: CalendarDays },
  { label: "Homework", icon: BookOpen },
  { label: "Progress", icon: TrendingUp },
];

const SUBJECTS = [
  { label: "Eng", a: 78, b: 92 },
  { label: "Math", a: 71, b: 96 },
  { label: "Sci", a: 84, b: 98 },
  { label: "Hist", a: 76, b: 90 },
  { label: "CS", a: 88, b: 99 },
];

const CHILD_ALERTS = [
  { name: "Math Quiz", initials: "MQ", reason: "Score dipped vs last unit test", level: "Medium" },
  { name: "Attendance", initials: "AT", reason: "1 leave day this week", level: "Low" },
];

function ParentDashboard() {
  const user = getCurrentUser();
  const config = getRoleConfig();
  const childName = "Aanya";

  return (
    <div className="space-y-6 sm:space-y-7">
      <DashboardHero
        portalTitle={config.portalTitle}
        firstName={user?.firstName}
        summary={`${childName} has school today · 1 homework due · fee installment open.`}
        ctaLabel="Message Class Teacher"
        accentStats={[
          { label: "Attendance", value: "94%" },
          { label: "Fee Due", value: "₹8.2K", highlight: true },
        ]}
      />

      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-[#A77A95] to-[#735366] text-white flex items-center justify-center text-lg font-bold shadow-md">
            A
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[color:var(--edvora-primary)]">Linked child</p>
            <p className="text-lg font-bold text-[color:var(--edvora-ink-strong)]">Aanya Sharma · Class 8A</p>
            <p className="text-xs text-slate-500">Roll 24 · Homeroom: Ms. Ria</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="rounded-xl bg-[color:var(--edvora-primary-soft)] px-3 py-2 text-center">
            <p className="text-[10px] text-slate-500">Rank</p>
            <p className="text-sm font-bold text-[color:var(--edvora-ink-strong)]">#6</p>
          </div>
          <div className="rounded-xl bg-[color:var(--edvora-primary-soft)] px-3 py-2 text-center">
            <p className="text-[10px] text-slate-500">GPA</p>
            <p className="text-sm font-bold text-[color:var(--edvora-ink-strong)]">3.7</p>
          </div>
          <div className="rounded-xl bg-[color:var(--edvora-primary-soft)] px-3 py-2 text-center">
            <p className="text-[10px] text-slate-500">Conduct</p>
            <p className="text-sm font-bold text-[color:var(--edvora-ink-strong)]">A</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Attendance" value="94%" subtitle="18 / 19 days present" icon={ClipboardCheck} spark={[90, 91, 92, 93, 92, 94, 94]} />
        <StatCard title="Homework" value="2" subtitle="1 due tonight" icon={BookOpen} accent="#8F6580" spark={[4, 3, 2, 3, 2, 2, 2]} />
        <StatCard title="Fee Balance" value="₹8,200" subtitle="Due Aug 5" icon={CreditCard} accent="#D4B87A" spark={[12, 11, 10, 9, 9, 8.5, 8.2]} />
        <StatCard title="Unread Messages" value="3" subtitle="From teacher & office" icon={Bell} accent="#735366" spark={[1, 2, 1, 3, 2, 4, 3]} />
      </div>

      <QuickLinks items={QUICK_LINKS} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5">
        <div className="xl:col-span-8 space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <SectionCard title="Subject Progress" subtitle="Term average vs class top">
              <div className="flex items-center gap-4 mb-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[color:var(--edvora-primary)]" /> Aanya</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#F5D69B]" /> Class top</span>
              </div>
              <BarChart data={SUBJECTS} />
            </SectionCard>

            <SectionCard title="Homework Completion" subtitle="This month">
              <div className="flex items-center gap-5">
                <DonutChart value={88} label="On time" />
                <div className="space-y-2 text-sm flex-1">
                  <div className="flex justify-between"><span className="text-slate-500">Submitted</span><span className="font-semibold text-[color:var(--edvora-ink-strong)]">22</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Pending</span><span className="font-semibold text-amber-600">2</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Late</span><span className="font-semibold text-red-500">1</span></div>
                </div>
              </div>
            </SectionCard>
          </div>

          <RiskAlerts title="Parent Insights" items={CHILD_ALERTS} />

          <SectionCard title="Fee & Payments" subtitle="Current academic year">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--edvora-ink-strong)]">Term 2 Tuition</p>
                  <p className="text-xs text-slate-500">Due Aug 5, 2026</p>
                </div>
                <span className="text-sm font-bold text-amber-600">₹8,200 due</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--edvora-ink-strong)]">Transport</p>
                  <p className="text-xs text-slate-500">Paid Jul 1</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">Paid</span>
              </div>
              <button
                type="button"
                className="w-full rounded-xl bg-linear-to-r from-[#A77A95] to-[#735366] py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-95 transition"
              >
                Pay outstanding fees
              </button>
            </div>
          </SectionCard>
        </div>

        <aside className="xl:col-span-4 space-y-4 sm:space-y-5">
          <MiniCalendar markedDates={[new Date(Date.now() + 86400000 * 3)]} />
          <ScheduleTimeline
            title={`${childName}'s Day`}
            items={[
              { title: "English Literature", meta: "Room 12", time: "08:40 – 09:30", now: true },
              { title: "Mathematics", meta: "Room 12", time: "09:40 – 10:30" },
              { title: "Science Lab", meta: "Lab 1", time: "11:20 – 12:10" },
            ]}
          />
          <RemindersList
            items={[
              { title: "Science project", detail: "Submit model photos", when: "Tonight" },
              { title: "PTM slot", detail: "Book 10-min slot with Ms. Ria", when: "Jul 30" },
              { title: "Fee reminder", detail: "Term 2 installment", when: "Aug 5" },
            ]}
          />
        </aside>
      </div>
    </div>
  );
}

export default ParentDashboard;
