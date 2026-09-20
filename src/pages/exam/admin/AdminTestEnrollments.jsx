import { useEffect, useState } from "react";
import { examApi, formatExamDate } from "../../../utils/examApi";
import { PageHeader, Pill, Surface } from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

export default function AdminTestEnrollments() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await examApi.listTests();
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
        <EdvoraLoader message="Loading enrollments…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        module="Test Setup"
        title="Test Enrollments"
        description="Published tests and candidate enrollment windows."
      />
      <Surface className="!p-0 overflow-hidden">
        {tests.length === 0 ? (
          <p className="px-5 py-10 text-center rs-body text-[#735366]/65">
            No enrollments yet.
          </p>
        ) : (
          <ul className="divide-y divide-[#f0e4eb]">
            {tests.map((t) => (
              <li
                key={t.id}
                className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p className="rs-body font-semibold text-[#3d1f33]">
                    {t.title}
                  </p>
                  <p className="rs-caption text-[#735366]/65">
                    {t.subject || "General"} · {t.questionCount ?? 0} questions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill>{t.type || "TEST"}</Pill>
                  <Pill tone="info">{t.status || "PUBLISHED"}</Pill>
                  <span className="rs-caption text-[#735366]/50">
                    {formatExamDate(t.startsAt || t.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </div>
  );
}
