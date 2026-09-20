import { useEffect, useState } from "react";
import { examApi, formatExamDate } from "../../utils/examApi";
import { PageHeader, Pill, PrimaryButton, Surface } from "./components/ExamUI";
import EdvoraLoader from "../../common/EdvoraLoader";
import { openSnackbar } from "../../common/snackbar/snackbar";

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await examApi.listSupport();
    setTickets(data || []);
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

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      openSnackbar({
        message: "Please fill subject and message",
        variant: "warning",
      });
      return;
    }
    setSaving(true);
    try {
      await examApi.createSupport({ subject, message });
      openSnackbar({ message: "Support ticket submitted", variant: "success" });
      setSubject("");
      setMessage("");
      await load();
    } catch (error) {
      openSnackbar({ message: error.message, variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading support…" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <PageHeader
        title="Support"
        description="Raise a ticket for exam access or technical issues."
      />
      <Surface className="p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#735366]/70 mb-1.5">
            Subject
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full h-11 rounded-xl border border-[#e8d5e0] bg-[#fdf8fb] px-3 text-sm text-[#3d1f33] outline-none focus:border-[#a77a95] focus:ring-2 focus:ring-[#a77a95]/15"
            placeholder="Brief issue title"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#735366]/70 mb-1.5">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-[#e8d5e0] bg-[#fdf8fb] px-3 py-2.5 text-sm text-[#3d1f33] outline-none focus:border-[#a77a95] focus:ring-2 focus:ring-[#a77a95]/15 resize-y min-h-[120px]"
            placeholder="Describe what went wrong…"
          />
        </div>
        <PrimaryButton className="w-full sm:w-auto" disabled={saving} onClick={submit}>
          {saving ? "Submitting…" : "Submit ticket"}
        </PrimaryButton>
      </Surface>

      <Surface className="overflow-hidden">
        <p className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#735366]/60 border-b border-[#f0e4eb]">
          My tickets
        </p>
        {tickets.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#735366]/65">
            No tickets yet.
          </p>
        ) : (
          <ul className="divide-y divide-[#f0e4eb]">
            {tickets.map((t) => (
              <li key={t.id} className="px-4 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#3d1f33]">{t.subject}</p>
                  <Pill>{t.status}</Pill>
                </div>
                <p className="mt-1 text-sm text-[#735366]/75">{t.message}</p>
                <p className="mt-1 text-[11px] text-[#735366]/50">
                  {formatExamDate(t.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </div>
  );
}
