import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { examApi } from "../../utils/examApi";
import { useExamSession } from "./context/ExamSessionContext";
import { PageHeader, Pill, PrimaryButton, Surface } from "./components/ExamUI";
import EdvoraLoader from "../../common/EdvoraLoader";
import { openSnackbar } from "../../common/snackbar/snackbar";

const difficultyTone = {
  Easy: "success",
  Medium: "info",
  Hard: "warn",
};

export default function PracticeTests() {
  const navigate = useNavigate();
  const { prepareSession } = useExamSession();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await examApi.listTests("PRACTICE");
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

  const startPractice = (test) => {
    prepareSession({
      testId: test.id,
      title: test.title,
      mode: "practice",
      durationMin: test.durationMin,
    });
    navigate(`/exam/test-details?testId=${test.id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading practice tests…" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Practice Tests"
        description="Topic-wise mocks. Results and answer review unlock after submit."
      />

      {tests.length === 0 ? (
        <Surface className="p-8 text-center text-sm text-[#735366]/70">
          No practice tests published yet.
        </Surface>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {tests.map((test) => (
            <Surface key={test.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-[#3d1f33] text-sm sm:text-base">
                    {test.title}
                  </p>
                  <p className="mt-1 text-xs text-[#735366]/65">
                    {test.subject?.name || "Subject"} · {test.questionCount} Q ·{" "}
                    {test.durationMin} min
                  </p>
                </div>
                <Pill tone={difficultyTone[test.difficulty] || "default"}>
                  {test.difficulty}
                </Pill>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-[#FAEEE9] px-3 py-2">
                  <p className="text-[#735366]/60">Attempts</p>
                  <p className="font-bold text-[#3d1f33]">{test.attempts || 0}</p>
                </div>
                <div className="rounded-xl bg-[#FAEEE9] px-3 py-2">
                  <p className="text-[#735366]/60">Best score</p>
                  <p className="font-bold text-[#3d1f33]">
                    {test.bestScore != null ? `${test.bestScore}%` : "—"}
                  </p>
                </div>
              </div>

              <PrimaryButton
                className="mt-4 w-full"
                onClick={() => startPractice(test)}
              >
                Start practice
              </PrimaryButton>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
