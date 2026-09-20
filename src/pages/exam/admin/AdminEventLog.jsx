import { useEffect, useState } from "react";
import { examApi, formatExamDate } from "../../../utils/examApi";
import { PageHeader, Pill, Surface } from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

export default function AdminEventLog() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [live, scheduled] = await Promise.all([
          examApi.staffLiveSessions(),
          examApi.staffScheduled(),
        ]);
        if (!alive) return;
        const events = [
          ...(live || []).map((r) => ({
            id: `live-${r.id || r.attemptId}`,
            type: "LIVE",
            title: r.testTitle || r.title || "Live session",
            detail: r.candidateName || r.email || "Candidate",
            at: r.startedAt || r.updatedAt,
          })),
          ...(scheduled || []).map((r) => ({
            id: `sch-${r.id}`,
            type: "SCHEDULE",
            title: r.title || "Scheduled test",
            detail: r.subject || "Window",
            at: r.startsAt || r.createdAt,
          })),
        ].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
        setRows(events);
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
        <EdvoraLoader message="Loading event log…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        module="Reports"
        title="Event Log"
        description="Operational timeline across live sessions and scheduled windows."
      />
      <Surface className="!p-0 overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center rs-body text-[#735366]/65">
            No events recorded yet.
          </p>
        ) : (
          <ul className="divide-y divide-[#f0e4eb]">
            {rows.map((row) => (
              <li
                key={row.id}
                className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p className="rs-body font-semibold text-[#3d1f33]">
                    {row.title}
                  </p>
                  <p className="rs-caption text-[#735366]/65">{row.detail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone={row.type === "LIVE" ? "warn" : "info"}>
                    {row.type}
                  </Pill>
                  <span className="rs-caption text-[#735366]/50">
                    {formatExamDate(row.at)}
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
