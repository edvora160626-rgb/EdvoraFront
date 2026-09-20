import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { examApi } from "../../../utils/examApi";
import { useExamSession } from "../context/ExamSessionContext";
import { GhostButton, PrimaryButton, Surface } from "../components/ExamUI";
import { openSnackbar } from "../../../common/snackbar/snackbar";

function formatTime(totalSec) {
  const m = Math.floor(Math.max(0, totalSec) / 60);
  const s = Math.max(0, totalSec) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TestPage() {
  const navigate = useNavigate();
  const { session, setLocalAnswer, clearSession } = useExamSession();
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!session.attemptId || !session.questions?.length) {
      navigate("/exam/dashboard", { replace: true });
      return;
    }
    const end = session.endsAt ? new Date(session.endsAt).getTime() : 0;
    const tick = () => {
      const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0 && !submittedRef.current) {
        finish(true);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.attemptId, session.endsAt]);

  const onSelect = async (questionId, optionIndex) => {
    setLocalAnswer(questionId, optionIndex);
    try {
      await examApi.saveAnswer(session.attemptId, questionId, optionIndex);
    } catch (error) {
      openSnackbar({ message: error.message, variant: "error" });
    }
  };

  const finish = async (auto = false) => {
    if (submittedRef.current || submitting) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      await examApi.submit(session.attemptId);
      navigate(`/exam/result?attemptId=${session.attemptId}`, { replace: true });
    } catch (error) {
      submittedRef.current = false;
      openSnackbar({
        message: error.message || (auto ? "Auto-submit failed" : "Submit failed"),
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!session.attemptId || !session.questions?.length) return null;

  const question = session.questions[index];
  const answered = Object.keys(session.answers).length;
  const lowTime = secondsLeft <= 60;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-3 xs:gap-4 min-h-[calc(100dvh-8rem)]">
      <div className="sticky top-0 z-20 -mx-1 xs:mx-0 pt-1">
        <Surface className="!p-2.5 xs:!p-3 sm:!p-4 flex flex-wrap items-center justify-between gap-2 shadow-md">
          <div className="min-w-0">
            <p className="rs-caption text-[#735366]/60 truncate">
              {session.mode === "practice" ? "Practice" : "Exam"}
            </p>
            <p className="rs-body font-bold text-[#3d1f33] truncate max-w-[min(220px,55vw)] sm:max-w-md">
              {session.title}
            </p>
          </div>
          <div className="flex items-center gap-2 xs:gap-3">
            <span className="rs-caption text-[#735366]/70 hidden sm:inline">
              {answered}/{session.questions.length} answered
            </span>
            <span
              className={`tabular-nums rounded-xl px-2.5 py-1 xs:px-3 xs:py-1.5 rs-body font-bold ${
                lowTime
                  ? "bg-red-50 text-red-700"
                  : "bg-[#FAEEE9] text-[#5c3050]"
              }`}
            >
              {formatTime(secondsLeft)}
            </span>
          </div>
        </Surface>
      </div>

      <div className="grid gap-3 xs:gap-4 lg:grid-cols-[1fr_min(220px,28%)] flex-1">
        <Surface className="!p-3 xs:!p-4 sm:!p-6 flex flex-col">
          <p className="rs-caption font-bold uppercase tracking-wider text-[#A77A95]">
            Question {index + 1} of {session.questions.length}
          </p>
          <h2 className="mt-2 rs-title text-[#3d1f33] !font-semibold leading-snug">
            {question.text}
          </h2>

          <div className="mt-4 xs:mt-5 space-y-2 xs:space-y-2.5 flex-1">
            {question.options.map((opt, optIdx) => {
              const selected = session.answers[question.id] === optIdx;
              return (
                <button
                  key={`${question.id}-${optIdx}`}
                  type="button"
                  disabled={submitting}
                  onClick={() => onSelect(question.id, optIdx)}
                  className={`rs-q-opt w-full text-left border transition ${
                    selected
                      ? "border-[#A77A95] bg-[#FAEEE9] text-[#3d1f33] font-semibold shadow-sm"
                      : "border-[#e8d5e0] bg-white text-[#735366] hover:border-[#a77a95]/50"
                  }`}
                >
                  <span className="mr-2 inline-flex h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] items-center justify-center rounded-md bg-white border border-[#e8d5e0] rs-caption font-bold text-[#A77A95]">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-4 xs:mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-between">
            <GhostButton
              disabled={index === 0 || submitting}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="w-full sm:w-auto"
            >
              Previous
            </GhostButton>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {index < session.questions.length - 1 ? (
                <PrimaryButton
                  className="w-full sm:w-auto"
                  disabled={submitting}
                  onClick={() =>
                    setIndex((i) =>
                      Math.min(session.questions.length - 1, i + 1)
                    )
                  }
                >
                  Next
                </PrimaryButton>
              ) : (
                <PrimaryButton
                  className="w-full sm:w-auto"
                  disabled={submitting}
                  onClick={() => finish(false)}
                >
                  {submitting ? "Submitting…" : "Submit test"}
                </PrimaryButton>
              )}
            </div>
          </div>
        </Surface>

        <Surface className="!p-3 xs:!p-4 h-fit lg:sticky lg:top-20">
          <p className="rs-caption font-bold uppercase tracking-wider text-[#735366]/60 mb-2 xs:mb-3">
            Navigator
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-4 gap-1.5 xs:gap-2">
            {session.questions.map((q, i) => {
              const isCurrent = i === index;
              const isAnswered = session.answers[q.id] != null;
              return (
                <button
                  key={q.id}
                  type="button"
                  disabled={submitting}
                  onClick={() => setIndex(i)}
                  className={`h-[clamp(1.75rem,4vw,2.25rem)] rounded-lg rs-caption font-bold transition ${
                    isCurrent
                      ? "bg-[#5c3050] text-white"
                      : isAnswered
                        ? "bg-[#A77A95]/25 text-[#5c3050]"
                        : "bg-[#FAEEE9] text-[#735366]"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <PrimaryButton
            className="mt-3 xs:mt-4 w-full"
            disabled={submitting}
            onClick={() => finish(false)}
          >
            {submitting ? "Submitting…" : "Submit"}
          </PrimaryButton>
          <GhostButton
            className="mt-2 w-full"
            disabled={submitting}
            onClick={() => {
              clearSession();
              navigate("/exam/dashboard");
            }}
          >
            Exit
          </GhostButton>
        </Surface>
      </div>
    </div>
  );
}
