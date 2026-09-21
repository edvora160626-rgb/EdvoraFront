import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, HelpCircle, ListOrdered, Loader2 } from "lucide-react";
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

export default function TestDetails() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const testId = params.get("testId");
  const { prepareSession, loadAttempt } = useExamSession();
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [test, setTest] = useState(null);

  useEffect(() => {
    if (!testId) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const data = await examApi.getTest(testId);
        if (!alive) return;
        setTest(data);
        prepareSession({
          testId: data.id,
          title: data.title,
          mode: data.type === "PRACTICE" ? "practice" : "exam",
          durationMin: data.durationMin,
        });
      } catch (error) {
        openSnackbar({ message: error.message, variant: "error" });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [testId]);

  const start = async () => {
    if (!testId) return;
    setStarting(true);
    try {
      const data = await examApi.start(testId);
      loadAttempt(data);
      navigate("/exam/test-page");
    } catch (error) {
      openSnackbar({ message: error.message, variant: "error" });
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading details…" />
      </div>
    );
  }

  if (!testId || !test) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="font-semibold text-[#3d1f33]">No exam selected</p>
        <GhostButton className="mt-4" onClick={() => navigate("/exam/practice")}>
          Choose a test
        </GhostButton>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Test details"
        description="Review instructions, then begin when you are ready."
      />

      <Surface className="p-4 sm:p-6">
        <h2 className="text-lg font-bold text-[#3d1f33]">{test.title}</h2>
        <p className="mt-1 text-xs uppercase tracking-wider font-semibold text-[#A77A95]">
          {test.type === "PRACTICE" ? "Practice mode" : "Certification exam"}
        </p>
        {test.description ? (
          <p className="mt-2 text-sm text-[#735366]/75">{test.description}</p>
        ) : null}

        <div className="mt-5 grid grid-cols-1 xs:grid-cols-3 gap-3">
          {[
            { icon: Clock, label: "Duration", value: `${test.durationMin} min` },
            {
              icon: ListOrdered,
              label: "Questions",
              value: String(test.questionCount),
            },
            { icon: HelpCircle, label: "Type", value: "MCQ" },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl bg-[#FAEEE9] px-3 py-3 text-center"
            >
              <Icon size={18} className="mx-auto text-[#A77A95]" />
              <p className="mt-1.5 text-[11px] text-[#735366]/60">{label}</p>
              <p className="text-sm font-bold text-[#3d1f33]">{value}</p>
            </div>
          ))}
        </div>

        <ul className="mt-5 space-y-2 text-sm text-[#735366]/80 list-disc pl-5">
          <li>Answer all questions before the timer ends.</li>
          <li>You can navigate between questions freely.</li>
          <li>Submit once — review answers on the result page.</li>
          <li>Face capture is disabled in this build.</li>
          {test.type === "SCHEDULED" && !test.enrolled ? (
            <li className="text-amber-700">
              Enroll from Schedule Test before starting this exam.
            </li>
          ) : null}
        </ul>

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
          <GhostButton
            className="w-full sm:w-auto"
            onClick={() =>
              navigate(
                test.type === "PRACTICE"
                  ? "/exam/practice"
                  : "/exam/schedule-test"
              )
            }
          >
            Back
          </GhostButton>
          <PrimaryButton
            className="w-full sm:flex-1"
            disabled={starting}
            onClick={start}
          >
            {starting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Starting…
              </>
            ) : (
              "Begin test"
            )}
          </PrimaryButton>
        </div>
      </Surface>
    </div>
  );
}
