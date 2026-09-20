import { useEffect, useState } from "react";
import { examApi, formatExamDate } from "../../../utils/examApi";
import { PageHeader, Pill, Surface } from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

export default function AdminSupportTickets() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await examApi.listSupport();
        if (alive) setTickets(data || []);
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
        <EdvoraLoader message="Loading support tickets…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        module="Reports"
        title="Support"
        description="Candidate support tickets for the examination portal."
      />
      <Surface className="!p-0 overflow-hidden">
        {tickets.length === 0 ? (
          <p className="px-5 py-10 text-center rs-body text-[#735366]/65">
            No support tickets yet.
          </p>
        ) : (
          <ul className="divide-y divide-[#f0e4eb]">
            {tickets.map((t) => (
              <li
                key={t.id}
                className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p className="rs-body font-semibold text-[#3d1f33]">
                    {t.subject || t.title || "Ticket"}
                  </p>
                  <p className="rs-caption text-[#735366]/65 line-clamp-2">
                    {t.message || t.description || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill
                    tone={
                      String(t.status).toUpperCase() === "OPEN"
                        ? "warn"
                        : "success"
                    }
                  >
                    {t.status || "OPEN"}
                  </Pill>
                  <span className="rs-caption text-[#735366]/50">
                    {formatExamDate(t.createdAt)}
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
