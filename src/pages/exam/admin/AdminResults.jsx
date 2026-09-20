import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { examApi, formatExamDate } from "../../../utils/examApi";
import { PageHeader, Pill, Surface } from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

export default function AdminResults() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Staff can see own attempts via results; live sessions cover monitoring.
        // For admin overview use live + scheduled endpoints as operational views.
        const [live, scheduled] = await Promise.all([
          examApi.staffLiveSessions(),
          examApi.staffScheduled(),
        ]);
        if (alive) {
          setResults({ live: live || [], scheduled: scheduled || [] });
        }
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
        <EdvoraLoader message="Loading…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        module="Reports"
        title="Test Results"
        description="Live attempts and scheduled exam enrollments."
      />

      <section>
        <h2 className="rs-title text-[#3d1f33] mb-3">Live sessions</h2>
        <Surface className="overflow-hidden !p-0">
          {(results.live || []).length === 0 ? (
            <p className="px-5 py-8 text-center rs-body text-[#735366]/65">
              No candidates currently in an exam.
            </p>
          ) : (
            <ul className="divide-y divide-[#f0e4eb]">
              {results.live.map((s) => (
                <li key={s.id} className="px-4 py-3.5">
                  <p className="rs-body font-semibold text-[#3d1f33]">{s.title}</p>
                  <p className="rs-caption text-[#735366]/65">
                    {s.candidate} · {s.email} · {s.answered}/{s.totalQuestions}{" "}
                    answered
                  </p>
                  <p className="rs-caption text-[#735366]/50">
                    Ends {formatExamDate(s.endsAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </section>

      <section>
        <h2 className="rs-title text-[#3d1f33] mb-3">Scheduled / on-demand</h2>
        <div className="space-y-3">
          {(results.scheduled || []).map((t) => (
            <Surface key={t.id} className="!p-4">
              <div className="flex flex-wrap gap-2 items-center">
                <p className="rs-body font-bold text-[#3d1f33]">{t.title}</p>
                <Pill>{t.type}</Pill>
                <Pill tone={t.windowOpen ? "success" : "warn"}>
                  {t.windowOpen ? "Window open" : "Outside window"}
                </Pill>
              </div>
              <p className="mt-1 rs-caption text-[#735366]/65">
                {t.subject} · {t.enrollments} enrolled · {t.durationMin} min
              </p>
            </Surface>
          ))}
        </div>
      </section>

      <Link to="/exam/admin/dashboard" className="rs-body font-semibold text-[#A77A95]">
        ← Admin dashboard
      </Link>
    </div>
  );
}
