import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { examApi, formatExamDate } from "../../utils/examApi";
import { PageHeader, Pill, Surface } from "./components/ExamUI";
import EdvoraLoader from "../../common/EdvoraLoader";
import { openSnackbar } from "../../common/snackbar/snackbar";

export default function AllTests() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await examApi.listTests();
        if (alive) setTests((data || []).filter((t) => t.type !== "PRACTICE"));
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
        <EdvoraLoader message="Loading tests…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="All available tests"
        description="Scheduled and on-demand assessments."
        action={
          <Link to="/exam/dashboard" className="text-sm font-semibold text-[#A77A95]">
            ← Dashboard
          </Link>
        }
      />
      <div className="space-y-3">
        {tests.map((exam) => (
          <Surface key={exam.id} className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-[#3d1f33] text-sm sm:text-base">
                {exam.title}
              </h2>
              <Pill>{exam.type}</Pill>
            </div>
            <p className="mt-1 text-xs text-[#735366]/65">
              {formatExamDate(exam.startsAt)} · {exam.questionCount} Q ·{" "}
              {exam.durationMin} min
            </p>
          </Surface>
        ))}
      </div>
    </div>
  );
}
