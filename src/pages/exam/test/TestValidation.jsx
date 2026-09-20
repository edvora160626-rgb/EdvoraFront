import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Monitor, Shield, Wifi } from "lucide-react";
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

const ICONS = { browser: Monitor, network: Wifi, identity: Shield };

export default function TestValidation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const testId = params.get("testId");
  const { prepareSession, markVerified, session } = useExamSession();
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState([]);
  const [test, setTest] = useState(null);

  useEffect(() => {
    if (!testId) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const data = await examApi.precheck(testId);
        if (!alive) return;
        setTest(data.test);
        setChecks(data.checks || []);
        prepareSession({
          testId: data.test.id,
          title: data.test.title,
          mode: data.test.type === "PRACTICE" ? "practice" : "exam",
          durationMin: data.test.durationMin,
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

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Running checks…" />
      </div>
    );
  }

  if (!testId || !test) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="font-semibold text-[#3d1f33]">No exam selected</p>
        <GhostButton className="mt-4" onClick={() => navigate("/exam/dashboard")}>
          Back to dashboard
        </GhostButton>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Pre-exam checks"
        description={test.title || session.title}
      />

      <Surface className="p-4 sm:p-6 space-y-3">
        {checks.map((c) => {
          const Icon = ICONS[c.key] || Monitor;
          return (
            <div
              key={c.key}
              className="flex gap-3 rounded-xl border border-[#e8d5e0] bg-[#fdf8fb] p-3.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#A77A95] border border-[#e8d5e0]">
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#3d1f33] flex items-center gap-2">
                  {c.title}
                  {c.ok ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : null}
                </p>
                <p className="text-xs text-[#735366]/70 mt-0.5">{c.detail}</p>
              </div>
            </div>
          );
        })}

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <GhostButton
            className="w-full sm:w-auto"
            onClick={() => navigate("/exam/dashboard")}
          >
            Cancel
          </GhostButton>
          <PrimaryButton
            className="w-full sm:flex-1"
            onClick={() => {
              markVerified();
              navigate(`/exam/test-details?testId=${testId}`);
            }}
          >
            Continue to details
          </PrimaryButton>
        </div>
      </Surface>
    </div>
  );
}
