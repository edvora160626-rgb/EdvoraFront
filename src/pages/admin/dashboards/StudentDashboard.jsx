import {
  BookOpen,
  Bot,
  CalendarDays,
  FileText,
  Flame,
  GraduationCap,
  Sparkles,
  Trophy,
  ClipboardCheck,
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

const QUICK_LINKS = [
  { label: "Assignments", icon: FileText },
  { label: "Study Hub", icon: BookOpen },
  { label: "Exams", icon: GraduationCap },
  { label: "Events", icon: CalendarDays, to: "/admin/upcoming-events" },
  { label: "Timetable", icon: CalendarDays },
  { label: "Attendance", icon: ClipboardCheck },
  { label: "AI Tutor", icon: Bot },
  { label: "Achievements", icon: Trophy },
];

const SUBJECTS = [
  { label: "Eng", a: 82, b: 92 },
  { label: "Math", a: 76, b: 96 },
  { label: "Sci", a: 88, b: 98 },
  { label: "CS", a: 91, b: 99 },
];

const QUESTS = [
  { title: "Finish Math worksheet", xp: "+40 XP", done: false },
  { title: "Revise Chapter 4 notes", xp: "+25 XP", done: true },
  { title: "Submit Science lab report", xp: "+60 XP", done: false },
];

function StudentDashboard() {
  const user = getCurrentUser();
  const config = getRoleConfig();

  return (
    <div className="space-y-6 sm:space-y-7">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        <div className="xl:col-span-2">
          <DashboardHero
            portalTitle={config.portalTitle}
            firstName={user?.firstName}
            summary="3 classes left today · 2 assignments due · keep your 5-day study streak alive!"
            ctaLabel="Open Study Hub"
            accentStats={[
              { label: "Study Streak", value: "5🔥" },
              { label: "XP Today", value: "120", highlight: true },
            ]}
          />
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-[#A77A95]">Level progress</p>
              <p className="text-xl font-bold text-[#735366] mt-1">Explorer · Lvl 7</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#F5D69B] to-[#D4B87A] text-[#735366]">
              <Trophy size={20} />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
              <span>840 / 1000 XP</span>
              <span>160 to Lvl 8</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#FAEEE9] overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#A77A95] to-[#F5D69B] transition-all duration-700"
                style={{ width: "84%" }}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <Flame size={14} className="text-orange-500" />
            5-day streak — don’t break it today
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Assignments Due" value="2" subtitle="Math & Science" icon={FileText} spark={[5, 4, 3, 4, 3, 2, 2]} />
        <StatCard title="Attendance" value="96%" subtitle="Great this month" icon={ClipboardCheck} accent="#8F6580" spark={[94, 95, 95, 96, 96, 96, 96]} />
        <StatCard title="Avg Score" value="84%" subtitle="Up 3% vs last term" icon={GraduationCap} accent="#D4B87A" spark={[78, 79, 80, 81, 82, 83, 84]} />
        <StatCard title="Study Hours" value="6.5h" subtitle="This week" icon={BookOpen} accent="#735366" spark={[4, 5, 4.5, 6, 5.5, 6, 6.5]} />
      </div>

      <QuickLinks items={QUICK_LINKS} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5">
        <div className="xl:col-span-8 space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <SectionCard title="My Subject Scores" subtitle="You vs class top">
              <div className="flex items-center gap-4 mb-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#A77A95]" /> You</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#F5D69B]" /> Top</span>
              </div>
              <BarChart data={SUBJECTS} />
            </SectionCard>

            <SectionCard title="Weekly Goals" subtitle="Homework & revision">
              <div className="flex items-center gap-5">
                <DonutChart value={67} label="Complete" />
                <ul className="space-y-2 flex-1 text-sm">
                  {QUESTS.map((q) => (
                    <li key={q.title} className="flex items-start gap-2">
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                          q.done ? "bg-emerald-500" : "bg-[#C3C3D5]"
                        }`}
                      />
                      <span className="min-w-0">
                        <span className={`block font-medium ${q.done ? "text-slate-400 line-through" : "text-[#735366]"}`}>
                          {q.title}
                        </span>
                        <span className="text-[11px] text-[#A77A95]">{q.xp}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Upcoming Assignments" subtitle="Stay ahead of deadlines">
            <ul className="space-y-3">
              {[
                { subject: "Mathematics", title: "Quadratic equations worksheet", due: "Tonight · 8 PM", tone: "bg-amber-50 text-amber-700" },
                { subject: "Science", title: "Lab report — Optics", due: "Jul 29", tone: "bg-[#FAEEE9] text-[#8F6580]" },
                { subject: "English", title: "Essay: Climate & Community", due: "Aug 1", tone: "bg-slate-100 text-slate-600" },
              ].map((a) => (
                <li key={a.title} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-[#A77A95]">{a.subject}</p>
                    <p className="text-sm font-semibold text-[#735366] truncate">{a.title}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${a.tone}`}>
                    {a.due}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <div className="rounded-2xl border border-[#C3C3D5] bg-linear-to-br from-[#FAEEE9] to-white p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#A77A95] to-[#735366] text-white shrink-0">
              <Sparkles size={22} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#735366]">AI Study Buddy</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Stuck on Math? Get a step-by-step hint without spoiling the answer.
              </p>
            </div>
            <button
              type="button"
              className="rounded-xl bg-[#A77A95] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8F6580] transition shrink-0"
            >
              Ask AI Tutor
            </button>
          </div>
        </div>

        <aside className="xl:col-span-4 space-y-4 sm:space-y-5">
          <MiniCalendar markedDates={[new Date(), new Date(Date.now() + 86400000)]} />
          <ScheduleTimeline
            title="My Timetable"
            items={[
              { title: "Computer Science", meta: "Lab 3", time: "08:40 – 09:30", now: true },
              { title: "Mathematics", meta: "Room 12", time: "09:40 – 10:30" },
              { title: "Physical Education", meta: "Ground", time: "11:20 – 12:10" },
            ]}
          />
          <RemindersList
            items={[
              { title: "Math worksheet", detail: "Submit before 8 PM", when: "Today" },
              { title: "Club meeting", detail: "Robotics club · Lab 3", when: "3:30 PM" },
              { title: "Unit test", detail: "Science Chapter 5–6", when: "Aug 2" },
            ]}
          />
        </aside>
      </div>
    </div>
  );
}

export default StudentDashboard;
