import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { examApi, formatExamDate } from "../../utils/examApi";
import { useExamSession } from "./context/ExamSessionContext";
import { PageHeader, Pill, PrimaryButton, Surface } from "./components/ExamUI";
import EdvoraLoader from "../../common/EdvoraLoader";
import { openSnackbar } from "../../common/snackbar/snackbar";

export default function ScheduleTest() {
  const navigate = useNavigate();
  const { prepareSession } = useExamSession();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const [scheduled, onDemand] = await Promise.all([
      examApi.listTests("SCHEDULED"),
      examApi.listTests("ON_DEMAND"),
    ]);
    setTests([...(scheduled || []), ...(onDemand || [])]);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await load();
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

  const enroll = async (exam) => {
    setBusyId(exam.id);
    try {
      await examApi.enroll(exam.id);
      openSnackbar({
        message: `Enrolled for “${exam.title}”`,
        variant: "success",
      });
      await load();
    } catch (error) {
      openSnackbar({ message: error.message, variant: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const start = (exam) => {
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
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading exams…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Schedule / Enroll Test"
        description="Enroll for scheduled exams, then enter when the window is open."
      />

      {tests.length === 0 ? (
        <Surface className="p-8 text-center text-sm text-[#735366]/70">
          No scheduled or on-demand exams available.
        </Surface>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {tests.map((exam) => (
            <Surface key={exam.id} className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-[#3d1f33] text-sm sm:text-base">
                      {exam.title}
                    </h2>
                    <Pill tone={exam.enrolled ? "success" : "info"}>
                      {exam.enrolled ? "Enrolled" : exam.type}
                    </Pill>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-[#735366]/70">
                    {formatExamDate(exam.startsAt)} → {formatExamDate(exam.endsAt)}
                  </p>
                  <p className="mt-1 text-xs text-[#735366]/55">
                    {exam.subject?.name} · {exam.questionCount} questions ·{" "}
                    {exam.durationMin} minutes
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                  {exam.type === "SCHEDULED" && !exam.enrolled ? (
                    <button
                      type="button"
                      disabled={busyId === exam.id}
                      onClick={() => enroll(exam)}
                      className="rounded-xl border border-[#e0cce0] px-4 py-2.5 text-sm font-semibold text-[#735366] hover:bg-[#f3eaf5] disabled:opacity-50"
                    >
                      {busyId === exam.id ? "Enrolling…" : "Enroll"}
                    </button>
                  ) : null}
                  <PrimaryButton onClick={() => start(exam)}>
                    Enter exam
                  </PrimaryButton>
                </div>
              </div>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
