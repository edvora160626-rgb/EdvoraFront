import { useEffect, useMemo, useState } from "react";
import { examApi } from "../../../utils/examApi";
import { PageHeader, Pill, Surface } from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

export default function AdminSubjects() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await examApi.staffQuestions();
        const items = Array.isArray(data) ? data : data?.items || [];
        if (alive) setQuestions(items);
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

  const subjects = useMemo(() => {
    const map = new Map();
    questions.forEach((q) => {
      const subject = q.subject || "General";
      const entry = map.get(subject) || { subject, count: 0, topics: new Set() };
      entry.count += 1;
      if (q.topic) entry.topics.add(q.topic);
      map.set(subject, entry);
    });
    return [...map.values()].map((s) => ({
      ...s,
      topics: [...s.topics],
    }));
  }, [questions]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading subjects…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        module="Subjects"
        title="All subjects"
        description="Subjects and topics derived from the question bank."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subjects.map((s) => (
          <Surface key={s.subject}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="rs-body font-bold text-[#3d1f33]">{s.subject}</p>
                <p className="rs-caption text-[#735366]/65 mt-1">
                  {s.topics.length
                    ? s.topics.slice(0, 4).join(", ")
                    : "No topics tagged"}
                  {s.topics.length > 4 ? "…" : ""}
                </p>
              </div>
              <Pill tone="info">{s.count} Qs</Pill>
            </div>
          </Surface>
        ))}
        {subjects.length === 0 ? (
          <Surface className="sm:col-span-2">
            <p className="text-center rs-body text-[#735366]/65 py-6">
              No subjects found. Add questions first.
            </p>
          </Surface>
        ) : null}
      </div>
    </div>
  );
}
