import { Link } from "react-router-dom";
import {
  Building2,
  ClipboardList,
  GraduationCap,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  AlertTriangle,
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
  { label: "Requests", icon: ClipboardList, to: "/admin/requests" },
  { label: "School Health", icon: TrendingUp },
  { label: "Staff", icon: UserCheck },
  { label: "Students", icon: GraduationCap },
  { label: "Revenue", icon: IndianRupee },
  { label: "Compliance", icon: ShieldCheck },
  { label: "Campus", icon: Building2 },
];

const SCHOOL_PERF = [
  { label: "VIII", a: 74, b: 96 },
  { label: "IX", a: 71, b: 94 },
  { label: "X", a: 79, b: 98 },
  { label: "XI", a: 76, b: 97 },
  { label: "XII", a: 82, b: 99 },
];

const CAMPUS_RISK = [
  { name: "Science Dept", initials: "SD", reason: "Lab utilization below target", level: "Medium" },
  { name: "Class 8B", initials: "8B", reason: "Attendance dip this week", level: "High" },
  { name: "Transport", initials: "TR", reason: "2 delayed routes reported", level: "Low" },
];

function PrincipalDashboard() {
  const user = getCurrentUser();
  const config = getRoleConfig();
  const { loading, totalPending, actionablePending, recentRequests, stats } =
    usePendingRequests();

  if (loading) return <EdvoraLoader message="Loading principal dashboard…" />;

  return (
    <div className="space-y-6 sm:space-y-7">
      <DashboardHero
        portalTitle={config.portalTitle}
        firstName={user?.firstName}
        summary="School-wide command center — office approvals, academic health, fees, and campus risk."
        ctaLabel="Review Office Requests"
        ctaTo="/admin/requests"
        accentStats={[
          { label: "Campus Pending", value: totalPending },
          { label: "Office Actions", value: actionablePending, highlight: true },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="School Strength" value="1,412" subtitle="Students + staff" icon={Users} spark={[1380, 1390, 1400, 1405, 1410, 1412, 1412]} />
        <StatCard title="Academic Health" value="78%" subtitle="Avg across grades" icon={TrendingUp} accent="#8F6580" spark={[72, 74, 75, 76, 77, 78, 78]} />
        <StatCard title="Fee Realization" value="₹1.2Cr" subtitle="91% of annual target" icon={IndianRupee} accent="#D4B87A" spark={[80, 84, 86, 88, 89, 90, 91]} />
        <StatCard title="Office Pending" value={String(actionablePending)} subtitle="Admins awaiting approval" icon={ShieldCheck} accent="#735366" to="/admin/requests" />
      </div>

      <QuickLinks items={QUICK_LINKS} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5">
        <div className="xl:col-span-8 space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <SectionCard title="Revenue Snapshot" subtitle="Collected vs outstanding">
              <div className="flex items-center gap-5">
                <DonutChart value={91} label="Collected" color="#D4B87A" />
                <div className="space-y-2 text-sm flex-1">
                  <div className="flex justify-between"><span className="text-slate-500">Collected</span><span className="font-semibold text-[#735366]">₹1.20Cr</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Outstanding</span><span className="font-semibold text-amber-600">₹11.8L</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Defaulters</span><span className="font-semibold text-red-500">47</span></div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="School Performance" subtitle="Grade average vs top score">
              <div className="flex items-center gap-4 mb-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#A77A95]" /> Avg</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#F5D69B]" /> Top</span>
              </div>
              <BarChart data={SCHOOL_PERF} />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <RiskAlerts title="Campus Risk Alerts" items={CAMPUS_RISK} />
            <SectionCard title="Request Pipeline" subtitle="Who needs your attention" actionLabel="Open" actionTo="/admin/requests">
              <ul className="space-y-3">
                {stats.map((s) => (
                  <li key={s.role} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#735366]">{ROLE_LABELS[s.role] || s.role}</p>
                      <p className="text-[11px] text-slate-500">
                        {s.actionable ? "Approve / reject" : "Visibility only"}
                      </p>
                    </div>
                    <span className={`text-lg font-bold ${s.actionable ? "text-[#A77A95]" : "text-slate-400"}`}>
                      {s.count}
                    </span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <SectionCard title="Latest Pending" actionLabel="View all" actionTo="/admin/requests">
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
                    {r.actionable ? (
                      <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">No pending pipeline items.</p>
            )}
          </SectionCard>
        </div>

        <aside className="xl:col-span-4 space-y-4 sm:space-y-5">
          <MiniCalendar />
          <ScheduleTimeline
            title="Principal Agenda"
            items={[
              { title: "Leadership huddle", meta: "Board room", time: "09:15", now: true },
              { title: "PTA executive call", meta: "Online", time: "12:00" },
              { title: "Infrastructure walkthrough", meta: "Block C", time: "16:00" },
            ]}
          />
          <RemindersList
            items={[
              { title: "Board pack due", detail: "Q1 academic + finance summary", when: "Friday" },
              { title: "Office approvals", detail: `${actionablePending} admin request(s)`, when: "Today" },
              { title: "Safety drill", detail: "Fire evacuation rehearsal", when: "Next week" },
            ]}
          />
          <Link
            to="/admin/requests"
            className="block rounded-2xl bg-linear-to-br from-[#A77A95] to-[#735366] p-4 text-center text-sm font-semibold text-white shadow-md hover:opacity-95 transition"
          >
            Go to Approval Center →
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default PrincipalDashboard;
