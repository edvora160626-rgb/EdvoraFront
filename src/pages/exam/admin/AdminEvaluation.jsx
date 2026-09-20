import { useEffect, useState } from "react";
import { examApi, formatExamDate } from "../../../utils/examApi";
import { PageHeader, Pill, Surface } from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

export default function AdminEvaluation() {
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await examApi.staffLiveSessions();
        if (alive) setLive(data || []);
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
        <EdvoraLoader message="Loading evaluation…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        module="Reports"
        title="Test Evaluation"
        description="In-progress and recently active attempts awaiting review."
      />
      <Surface className="!p-0 overflow-hidden">
        {live.length === 0 ? (
          <p className="px-5 py-10 text-center rs-body text-[#735366]/65">
            No attempts to evaluate right now.
          </p>
        ) : (
          <ul className="divide-y divide-[#f0e4eb]">
            {live.map((row) => (
              <li
                key={row.id || row.attemptId}
                className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p className="rs-body font-semibold text-[#3d1f33]">
                    {row.testTitle || row.title || "Attempt"}
                  </p>
                  <p className="rs-caption text-[#735366]/65">
                    {row.candidateName || row.email || "Candidate"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone="warn">{row.status || "IN_PROGRESS"}</Pill>
                  <span className="rs-caption text-[#735366]/50">
                    {formatExamDate(row.startedAt || row.updatedAt)}
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
