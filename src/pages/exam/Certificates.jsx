import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { examApi, formatExamDate } from "../../utils/examApi";
import { EmptyState, PageHeader, Surface } from "./components/ExamUI";
import EdvoraLoader from "../../common/EdvoraLoader";
import { openSnackbar } from "../../common/snackbar/snackbar";

export default function Certificates() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await examApi.listCertificates();
        if (alive) setItems(data || []);
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
        <EdvoraLoader message="Loading certificates…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="My Certificates"
        description="Issued when you pass a scheduled or on-demand exam."
      />
      {items.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Pass a certification exam to earn a certificate."
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <Surface key={c.id} className="p-5 flex flex-col">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#F5D69B] to-[#A77A95] text-white shadow">
                <Award size={22} />
              </span>
              <h2 className="mt-4 font-bold text-[#3d1f33] text-sm leading-snug">
                {c.title}
              </h2>
              <p className="mt-2 text-xs text-[#735366]/65">
                Issued {formatExamDate(c.issuedOn)} · Score {c.score}%
              </p>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
