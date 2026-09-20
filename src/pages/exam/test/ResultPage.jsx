import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { examApi } from "../../../utils/examApi";
import { useExamSession } from "../context/ExamSessionContext";
import {
  GhostButton,
  PageHeader,
  PrimaryButton,
  Surface,
} from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

export default function ResultPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const attemptId = params.get("attemptId");
  const { clearSession } = useExamSession();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!attemptId) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const data = await examApi.getResult(attemptId);
        if (alive) setResult(data);
      } catch (error) {
        openSnackbar({ message: error.message, variant: "error" });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading result…" />
      </div>
    );
  }

  if (!attemptId || !result) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="font-semibold text-[#3d1f33]">No result to show</p>
        <GhostButton className="mt-4" onClick={() => navigate("/exam/dashboard")}>
          Dashboard
        </GhostButton>
      </div>
    );
  }

  const done = () => {
    clearSession();
    navigate(
      result.mode === "PRACTICE" ? "/exam/practice" : "/exam/dashboard"
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Result" description={result.title} />

      <Surface className="p-5 sm:p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-[#A77A95]">
          Your score
        </p>
        <p className="mt-2 text-5xl sm:text-6xl font-black text-[#3d1f33] tabular-nums">
          {result.score}
          <span className="text-2xl text-[#735366]/50">%</span>
        </p>
        <p className="mt-3 text-sm text-[#735366]/70">
          {result.correctCount} of {result.totalQuestions} correct ·{" "}
          {result.passed ? "Passed" : "Failed"}
          {result.certificateIssued ? " · Certificate issued" : ""}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
          <div className="rounded-xl bg-[#FAEEE9] px-3 py-3">
            <p className="text-[11px] text-[#735366]/60">Mode</p>
            <p className="text-sm font-bold text-[#3d1f33] capitalize">
              {result.mode?.toLowerCase()}
            </p>
          </div>
          <div className="rounded-xl bg-[#FAEEE9] px-3 py-3">
            <p className="text-[11px] text-[#735366]/60">Answered</p>
            <p className="text-sm font-bold text-[#3d1f33]">
              {result.answered}/{result.totalQuestions}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-2 justify-center">
          <PrimaryButton onClick={done}>Done</PrimaryButton>
          <GhostButton onClick={() => navigate("/exam/results")}>
            All results
          </GhostButton>
        </div>
      </Surface>

      <Surface className="mt-4 overflow-hidden">
        <p className="px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#735366]/60 border-b border-[#f0e4eb]">
          Answer review
        </p>
        <ul className="divide-y divide-[#f0e4eb]">
          {(result.review || []).map((q) => (
            <li key={q.questionId} className="px-4 sm:px-5 py-3.5">
              <p className="text-sm font-semibold text-[#3d1f33]">
                {q.index}. {q.text}
              </p>
              <p
                className={`mt-1 text-xs ${
                  q.isCorrect ? "text-emerald-700" : "text-red-600"
                }`}
              >
                Your answer:{" "}
                {q.selectedIndex != null
                  ? q.options[q.selectedIndex]
                  : "Not answered"}
                {!q.isCorrect && q.correctIndex != null
                  ? ` · Correct: ${q.options[q.correctIndex]}`
                  : ""}
              </p>
              {q.explanation ? (
                <p className="mt-1 text-xs text-[#735366]/65">{q.explanation}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  );
}
