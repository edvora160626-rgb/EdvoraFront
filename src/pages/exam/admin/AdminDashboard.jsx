import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpen,
  ClipboardList,
  HelpCircle,
  Users,
} from "lucide-react";
import DashboardHero from "../../admin/dashboards/shared/DashboardHero";
import { examApi } from "../../../utils/examApi";
import { PageHeader, Pill, Surface } from "../components/ExamUI";
import { openSnackbar } from "../../../common/snackbar/snackbar";

export default function AdminDashboard() {
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await examApi.staffOverview();
        if (alive) setStats(data.stats);
      } catch (error) {
        openSnackbar({ message: error.message, variant: "error" });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const s = stats || {};
  const statValue = (n) => (loading ? "…" : n ?? 0);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <DashboardHero
        portalTitle="Exam Admin"
        firstName={user?.firstName}
        summary="Manage question bank, tests, candidates and live exam operations."
        ctaLabel="Question bank"
        ctaTo="/exam/admin/questions"
        accentStats={[
          { label: "Candidates", value: statValue(s.candidates) },
          { label: "Published tests", value: statValue(s.tests) },
          { label: "Questions", value: statValue(s.questions) },
          { label: "Live now", value: statValue(s.liveAttempts), highlight: true },
        ]}
      />

      <PageHeader
        title="Dashboard"
        description="Nextestify-style exam administration — configure tests from the sidebar modules."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            to: "/exam/admin/create-admin",
            label: "Create Admin",
            icon: Users,
            hint: "Admin accounts",
          },
          {
            to: "/exam/admin/questions",
            label: "Question Bank",
            icon: HelpCircle,
            hint: "Create & manage MCQs",
          },
          {
            to: "/exam/admin/tests/configuration",
            label: "Test Configuration",
            icon: BookOpen,
            hint: "Practice & scheduled",
          },
          {
            to: "/exam/admin/reports/results",
            label: "Test Results",
            icon: ClipboardList,
            hint: "Reports",
          },
        ].map(({ to, label, icon: Icon, hint }) => (
          <Link
            key={to}
            to={to}
            replace
            className="rounded-2xl border border-[#e8d5e0] bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAEEE9] text-[#A77A95]">
              <Icon size={18} />
            </span>
            <p className="mt-3 rs-body font-bold text-[#3d1f33]">{label}</p>
            <p className="rs-caption text-[#735366]/60">{hint}</p>
          </Link>
        ))}
      </div>

      <Surface className="!p-4 sm:!p-5">
        <div className="flex flex-wrap gap-2">
          <Pill tone="info">Submitted {s.submitted ?? 0}</Pill>
          <Pill>Materials {s.materials ?? 0}</Pill>
          <Pill tone="warn">Open tickets {s.openTickets ?? 0}</Pill>
          <Pill tone="success">Admins {s.admins ?? 0}</Pill>
        </div>
      </Surface>
    </div>
  );
}
