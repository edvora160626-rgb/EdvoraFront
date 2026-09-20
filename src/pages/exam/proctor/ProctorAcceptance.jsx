import { useEffect, useState } from "react";
import { examApi, formatExamDate } from "../../../utils/examApi";
import { PageHeader, Pill, Surface } from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

export default function ProctorAcceptance() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await examApi.staffScheduled();
        if (alive) setTests(data || []);
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
        <EdvoraLoader message="Loading acceptance list…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        module="Test Setup"
        title="Proctor Acceptance"
        description="Review scheduled and on-demand exam windows assigned for monitoring."
      />
      <div className="space-y-3">
        {tests.length === 0 ? (
          <Surface className="!p-8 text-center rs-body text-[#735366]/65">
            No scheduled exams found.
          </Surface>
        ) : (
          tests.map((t) => (
            <Surface key={t.id} className="!p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="rs-body font-bold text-[#3d1f33]">{t.title}</h2>
                <Pill>{t.type}</Pill>
                <Pill tone={t.windowOpen ? "success" : "warn"}>
                  {t.windowOpen ? "Accept / monitor" : "Upcoming / closed"}
                </Pill>
              </div>
              <p className="mt-1 rs-caption text-[#735366]/65">
                {t.subject} · {t.enrollments} enrolled · {t.durationMin} min
              </p>
              <p className="rs-caption text-[#735366]/55">
                {formatExamDate(t.startsAt)} → {formatExamDate(t.endsAt)}
              </p>
            </Surface>
          ))
        )}
      </div>
    </div>
  );
}
