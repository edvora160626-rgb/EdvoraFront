import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Eye, ShieldCheck } from "lucide-react";
import DashboardHero from "../../admin/dashboards/shared/DashboardHero";
import { examApi, formatExamDate } from "../../../utils/examApi";
import { PageHeader, Pill, Surface } from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

export default function ProctorDashboard() {
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [live, setLive] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [overview, sessions] = await Promise.all([
          examApi.staffOverview(),
          examApi.staffLiveSessions(),
        ]);
        if (!alive) return;
        setStats(overview.stats);
        setLive(sessions || []);
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

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading proctor dashboard…" />
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <DashboardHero
        portalTitle="Proctor Portal"
        firstName={user?.firstName}
        summary="Monitor live exams and review scheduled exam windows (Nextestify-style)."
        ctaLabel="Live proctoring"
        ctaTo="/exam/proctor/live"
        accentStats={[
          { label: "Live now", value: s.liveAttempts ?? 0, highlight: true },
          { label: "Candidates", value: s.candidates ?? 0 },
          { label: "Tests", value: s.tests ?? 0 },
          { label: "Submitted", value: s.submitted ?? 0 },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/exam/proctor/live"
          replace
          className="rounded-2xl border border-[#e8d5e0] bg-white p-4 shadow-sm hover:shadow-md"
        >
          <Eye className="text-[#A77A95]" size={20} />
          <p className="mt-3 rs-body font-bold text-[#3d1f33]">Live proctoring</p>
          <p className="rs-caption text-[#735366]/60">
            Watch in-progress attempts
          </p>
        </Link>
        <Link
          to="/exam/proctor/acceptance"
          replace
          className="rounded-2xl border border-[#e8d5e0] bg-white p-4 shadow-sm hover:shadow-md"
        >
          <ShieldCheck className="text-[#A77A95]" size={20} />
          <p className="mt-3 rs-body font-bold text-[#3d1f33]">
            Proctor acceptance
          </p>
          <p className="rs-caption text-[#735366]/60">
            Scheduled & on-demand windows
          </p>
        </Link>
      </div>

      <PageHeader title="Live right now" />
      <Surface className="overflow-hidden !p-0">
        {live.length === 0 ? (
          <p className="px-5 py-8 text-center rs-body text-[#735366]/65">
            No active exam sessions.
          </p>
        ) : (
          <ul className="divide-y divide-[#f0e4eb]">
            {live.slice(0, 5).map((s) => (
              <li key={s.id} className="px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="rs-body font-semibold text-[#3d1f33]">{s.title}</p>
                  <Pill tone="warn">LIVE</Pill>
                </div>
                <p className="rs-caption text-[#735366]/65">
                  {s.candidate} · {s.answered}/{s.totalQuestions} · ends{" "}
                  {formatExamDate(s.endsAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </div>
  );
}
