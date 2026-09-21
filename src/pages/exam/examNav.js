/** Nextestify-aligned exam portal navigation (modules → sub-modules). */

import {
  Award,
  BookOpen,
  CalendarCheck2,
  ChartColumn,
  CircleHelp,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  NotebookPen,
  Users,
} from "lucide-react";

export const ADMIN_NAV = [
  {
    id: "dashboards",
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/exam/admin/dashboard",
    end: true,
  },
  {
    id: "admin",
    label: "Admin",
    icon: Users,
    children: [
      { to: "/exam/admin/create-admin", label: "Create Admin" },
      { to: "/exam/admin/candidates", label: "Candidate" },
    ],
  },
  {
    id: "question-bank",
    label: "Question Bank",
    icon: HelpCircle,
    to: "/exam/admin/questions",
  },
  {
    id: "test-setup",
    label: "Test Setup",
    icon: NotebookPen,
    children: [
      { to: "/exam/admin/tests/configuration", label: "Test Configuration" },
      {
        to: "/exam/admin/tests/exam-windows",
        label: "Exam Windows",
      },
      { to: "/exam/admin/tests/enrollments", label: "Test Enrollments" },
    ],
  },
  {
    id: "subjects",
    label: "Subjects",
    icon: BookOpen,
    children: [
      { to: "/exam/admin/subjects", label: "All subjects", end: true },
      {
        to: "/exam/admin/subjects/study-material",
        label: "Study material",
      },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: ChartColumn,
    children: [
      { to: "/exam/admin/reports/evaluation", label: "Test Evaluation" },
      { to: "/exam/admin/reports/results", label: "Test Results" },
      { to: "/exam/admin/reports/event-log", label: "Event Log" },
      { to: "/exam/admin/reports/support", label: "Support" },
    ],
  },
];

export const CANDIDATE_NAV = [
  { to: "/exam/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/exam/study-material", label: "Study Material", icon: BookOpen },
  { to: "/exam/practice", label: "Practice Tests", icon: NotebookPen },
  { to: "/exam/schedule-test", label: "Schedule Test", icon: CalendarCheck2 },
  { to: "/exam/certificates", label: "Certificates", icon: Award },
  { to: "/exam/forum", label: "Forum", icon: MessageSquare },
  { to: "/exam/support", label: "Support", icon: ClipboardList },
  { to: "/exam/help", label: "Help", icon: CircleHelp },
];
