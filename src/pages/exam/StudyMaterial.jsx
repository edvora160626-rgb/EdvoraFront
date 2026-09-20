import { useEffect, useState } from "react";
import { FileText, PlayCircle } from "lucide-react";
import { examApi, formatExamDate } from "../../utils/examApi";
import { EmptyState, PageHeader, Pill, Surface } from "./components/ExamUI";
import EdvoraLoader from "../../common/EdvoraLoader";
import { openSnackbar } from "../../common/snackbar/snackbar";

export default function StudyMaterial() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await examApi.listMaterials();
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
        <EdvoraLoader message="Loading materials…" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Study Material"
        description="Notes and revision content for your subjects."
      />

      {items.length === 0 ? (
        <EmptyState
          title="No materials yet"
          description="Study materials will appear here when published."
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Surface key={item.id} className="p-4 sm:p-5 flex flex-col">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAEEE9] text-[#A77A95]">
                  {item.type === "Video" ? (
                    <PlayCircle size={20} />
                  ) : (
                    <FileText size={20} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-[#3d1f33] leading-snug">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-[#735366]/65">{item.subject}</p>
                </div>
                <Pill>{item.type}</Pill>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-[#735366]/60">
                <span>
                  {item.pages
                    ? `${item.pages} pages`
                    : item.durationMin
                      ? `${item.durationMin} min`
                      : "Resource"}
                </span>
                <span>Updated {formatExamDate(item.updatedAt)}</span>
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-xl border border-[#e0cce0] py-2.5 text-sm font-semibold text-[#735366] hover:bg-[#f3eaf5] transition"
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
              >
                {openId === item.id ? "Hide" : "Open"}
              </button>
              {openId === item.id ? (
                <p className="mt-3 text-sm text-[#735366]/80 leading-relaxed whitespace-pre-wrap">
                  {item.content || item.url || "No content"}
                </p>
              ) : null}
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
