import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { examApi, formatExamDate } from "../../utils/examApi";
import { PageHeader, Pill, Surface } from "./components/ExamUI";
import EdvoraLoader from "../../common/EdvoraLoader";
import { openSnackbar } from "../../common/snackbar/snackbar";

export default function AllResults() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await examApi.listResults();
        if (alive) setResults(data || []);
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
        <EdvoraLoader message="Loading results…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="All test results"
        description="History of practice and certification scores."
        action={
          <Link to="/exam/dashboard" className="text-sm font-semibold text-[#A77A95]">
            ← Dashboard
          </Link>
        }
      />
      <Surface className="overflow-hidden">
        {results.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[#735366]/65">
            No results yet.
          </p>
        ) : (
          <ul className="divide-y divide-[#f0e4eb]">
            {results.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-5"
              >
                <div>
                  <p className="text-sm font-semibold text-[#3d1f33]">{r.title}</p>
                  <p className="text-xs text-[#735366]/60">
                    {formatExamDate(r.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#5c3050]">{r.score}%</span>
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
    </div>
  );
}
