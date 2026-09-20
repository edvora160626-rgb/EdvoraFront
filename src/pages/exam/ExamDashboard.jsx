import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardCheck,
  NotebookPen,
} from "lucide-react";
import DashboardHero from "../admin/dashboards/shared/DashboardHero";
import { examApi, formatExamDate } from "../../utils/examApi";
import { useExamSession } from "./context/ExamSessionContext";
import { PageHeader, Pill, PrimaryButton, Surface } from "./components/ExamUI";
import EdvoraLoader from "../../common/EdvoraLoader";
import { openSnackbar } from "../../common/snackbar/snackbar";

export default function ExamDashboard() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { prepareSession } = useExamSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await examApi.getDashboard();
        if (alive) setData(res);
      } catch (error) {
        openSnackbar({
          message: error.message || "Failed to load dashboard",
          variant: "error",
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const beginExam = (exam) => {
    prepareSession({
      testId: exam.id,
      title: exam.title,
      mode: "exam",
      durationMin: exam.durationMin,
    });
    navigate(`/exam/test-validation?testId=${exam.id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <EdvoraLoader message="Loading dashboard…" />
      </div>
    );
  }

  const stats = data?.stats || {
    upcoming: 0,
    practiceDone: 0,
    avgScore: 0,
    certificates: 0,
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      <DashboardHero
        portalTitle="Examination Portal"
        firstName={user?.firstName}
        summary="Practice mocks, take scheduled exams, track results and certificates — all in one place."
        ctaLabel="Browse practice tests"
        ctaTo="/exam/practice"
        accentStats={[
          { label: "Upcoming", value: stats.upcoming },
          { label: "Practice done", value: stats.practiceDone },
          { label: "Avg score", value: `${stats.avgScore}%` },
          { label: "Certificates", value: stats.certificates },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
        {[
          { to: "/exam/practice", label: "Practice", icon: NotebookPen, hint: "Mocks & drills" },
          { to: "/exam/schedule-test", label: "Schedule", icon: ClipboardCheck, hint: "Enroll exams" },
          { to: "/exam/study-material", label: "Materials", icon: BookOpen, hint: "Notes & videos" },
          { to: "/exam/certificates", label: "Certificates", icon: Award, hint: "Achievements" },
        ].map(({ to, label, icon: Icon, hint }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-xl xs:rounded-2xl border border-[#e8d5e0] bg-white p-3 xs:p-4 shadow-sm hover:shadow-md hover:border-[#a77a95]/40 transition"
          >
            <span className="flex w-[clamp(2rem,5vw,2.5rem)] h-[clamp(2rem,5vw,2.5rem)] items-center justify-center rounded-xl bg-[#FAEEE9] text-[#A77A95] group-hover:bg-[#A77A95] group-hover:text-white transition">
              <Icon className="w-[1em] h-[1em] text-[clamp(14px,3.2vw,18px)]" />
            </span>
            <p className="mt-2 xs:mt-3 rs-body font-bold text-[#3d1f33]">{label}</p>
            <p className="rs-caption text-[#735366]/60">{hint}</p>
          </Link>
        ))}
      </div>

      <section>
        <PageHeader
          title="Upcoming & available exams"
          description="Enroll if required, then start when the window is open."
          action={
            <Link
              to="/exam/tests"
              className="text-sm font-semibold text-[#A77A95] hover:text-[#5c3050] inline-flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          }
        />
        {(data?.upcoming || []).length === 0 ? (
          <Surface className="p-6 text-sm text-[#735366]/70">
            No scheduled exams right now. Try practice tests.
          </Surface>
        ) : (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {data.upcoming.map((exam) => (
              <Surface key={exam.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-[#3d1f33] text-sm sm:text-base leading-snug">
                      {exam.title}
                    </p>
                    <p className="mt-1 text-xs text-[#735366]/65">
                      {exam.subject?.name || "Subject"} · {exam.questionCount} Q ·{" "}
                      {exam.durationMin} min
                    </p>
                  </div>
                  <Pill tone={exam.type === "ON_DEMAND" ? "success" : "info"}>
                    {exam.type}
                  </Pill>
                </div>
                <p className="mt-3 text-xs text-[#735366]/70">
                  Window: {formatExamDate(exam.startsAt)} —{" "}
                  {formatExamDate(exam.endsAt)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <PrimaryButton
                    className="w-full sm:w-auto"
                    onClick={() => beginExam(exam)}
                  >
                    Start exam
                  </PrimaryButton>
                  <Link
                    to={`/exam/test-details?testId=${exam.id}`}
                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-[#e0cce0] px-4 py-2.5 text-sm font-semibold text-[#735366] hover:bg-[#f3eaf5]"
                    onClick={() =>
                      prepareSession({
                        testId: exam.id,
                        title: exam.title,
                        mode: "exam",
                        durationMin: exam.durationMin,
                      })
                    }
                  >
                    Details
                  </Link>
                </div>
              </Surface>
            ))}
          </div>
        )}
      </section>

      <section>
        <PageHeader
          title="Recent results"
          action={
            <Link
              to="/exam/results"
              className="text-sm font-semibold text-[#A77A95] hover:text-[#5c3050] inline-flex items-center gap-1"
            >
              All results <ArrowRight size={14} />
            </Link>
          }
        />
        <Surface className="overflow-hidden">
          {(data?.recentResults || []).length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#735366]/65 text-center">
              No results yet. Take a practice test to get started.
            </p>
          ) : (
            <ul className="divide-y divide-[#f0e4eb]">
              {data.recentResults.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#3d1f33] truncate">
                      {r.title}
                    </p>
                    <p className="text-xs text-[#735366]/60">
                      {formatExamDate(r.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#5c3050]">
                      {r.score}%
                    </span>
                    <Pill tone={r.passed ? "success" : "warn"}>{r.status}</Pill>
                    <Link
                      to={`/exam/result?attemptId=${r.id}`}
                      className="text-xs font-semibold text-[#A77A95]"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </section>
    </div>
  );
}
