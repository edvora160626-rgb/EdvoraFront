import { useEffect, useState } from "react";
import { examApi, formatExamDate } from "../../../utils/examApi";
import { PageHeader, Pill, Surface } from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

export default function ProctorLive() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  const load = async () => {
    const data = await examApi.staffLiveSessions();
    setSessions(data || []);
  };

  useEffect(() => {
    let alive = true;
    let timer;
    (async () => {
      try {
        await load();
      } catch (error) {
        openSnackbar({ message: error.message, variant: "error" });
      } finally {
        if (alive) setLoading(false);
      }
      timer = setInterval(() => {
        load().catch(() => {});
      }, 15000);
    })();
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading live sessions…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        module="Monitoring"
        title="Live Proctoring"
        description="Auto-refreshes every 15s. Face/webcam proctoring skipped for now."
      />
      <Surface className="overflow-hidden !p-0">
        {sessions.length === 0 ? (
          <p className="px-5 py-10 text-center rs-body text-[#735366]/65">
            No candidates are currently writing an exam.
          </p>
        ) : (
          <ul className="divide-y divide-[#f0e4eb]">
            {sessions.map((s) => (
              <li key={s.id} className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="rs-body font-bold text-[#3d1f33]">{s.title}</p>
                  <Pill tone="warn">IN PROGRESS</Pill>
                  <Pill>{s.type}</Pill>
                </div>
                <p className="mt-1 rs-caption text-[#735366]/70">
                  {s.candidate} ({s.email})
                </p>
                <p className="rs-caption text-[#735366]/55">
                  Progress {s.answered}/{s.totalQuestions} · Started{" "}
                  {formatExamDate(s.startedAt)} · Ends {formatExamDate(s.endsAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </div>
  );
}
