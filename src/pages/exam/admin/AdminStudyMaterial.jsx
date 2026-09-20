import { useEffect, useState } from "react";
import { examApi, formatExamDate } from "../../../utils/examApi";
import { PageHeader, Pill, Surface } from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

export default function AdminStudyMaterial() {
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await examApi.listMaterials();
        if (alive) setMaterials(data || []);
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
        <EdvoraLoader message="Loading study material…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        module="Subjects"
        title="Study material"
        description="Learning resources published for candidates."
      />
      <Surface className="!p-0 overflow-hidden">
        {materials.length === 0 ? (
          <p className="px-5 py-10 text-center rs-body text-[#735366]/65">
            No study material published yet.
          </p>
        ) : (
          <ul className="divide-y divide-[#f0e4eb]">
            {materials.map((m) => (
              <li
                key={m.id}
                className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p className="rs-body font-semibold text-[#3d1f33]">
                    {m.title}
                  </p>
                  <p className="rs-caption text-[#735366]/65 line-clamp-2">
                    {m.description || m.subject || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill>{m.type || "DOC"}</Pill>
                  <span className="rs-caption text-[#735366]/50">
                    {formatExamDate(m.updatedAt || m.createdAt)}
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
