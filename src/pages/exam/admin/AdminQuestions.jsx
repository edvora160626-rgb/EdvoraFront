import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { examApi } from "../../../utils/examApi";
import { PageHeader, Pill, PrimaryButton, Surface } from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

const TABS = [
  { id: "create", label: "Create Question" },
  { id: "upload", label: "Upload Questions" },
  { id: "logs", label: "Question Logs" },
];

const QUESTION_TYPES = [
  { value: "SCI", label: "Single Choice (MCQ)" },
  { value: "MCU", label: "Multiple Choice" },
  { value: "TRU", label: "True / False" },
];

const LEVELS = ["Easy", "Medium", "Hard"];
const EMPTY_OPTIONS = ["", "", "", ""];

const emptyForm = () => ({
  id: null,
  subjectId: "",
  topic: "",
  questionType: "SCI",
  difficulty: "Medium",
  status: "ACTIVE",
  text: "",
  options: [...EMPTY_OPTIONS],
  correctIndexes: [0],
  explanation: "",
  remarks: "",
  marks: 1,
  timeMin: 2,
});

function letter(i) {
  return String.fromCharCode(65 + i);
}

function QuestionCard({ q, index, onEdit }) {
  const corrects = new Set(
    (q.correctIndexes?.length ? q.correctIndexes : [q.correctIndex]).map(Number)
  );
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-[#e8d5e0] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-[#A77A95]/40"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-[#F5D69B] via-[#A77A95] to-[#735366] opacity-0 transition group-hover:opacity-100" />
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Pill>{q.subject || "Subject"}</Pill>
        <Pill tone="info">{q.topic}</Pill>
        <Pill tone={q.difficulty === "Hard" ? "warn" : "default"}>
          {q.difficulty}
        </Pill>
        <Pill>{q.questionType || "SCI"}</Pill>
        <Pill tone={q.status === "ACTIVE" ? "success" : "warn"}>{q.status}</Pill>
      </div>
      <p className="rs-body font-semibold text-[#3d1f33]">
        {index + 1}. {q.text}
      </p>
      <ul className="mt-2 space-y-1">
        {(q.options || []).map((opt, idx) => (
          <li
            key={`${q.id}-${idx}`}
            className={`rs-caption flex items-center gap-1.5 ${
              corrects.has(idx)
                ? "text-emerald-700 font-semibold"
                : "text-[#735366]/70"
            }`}
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FAEEE9] text-[10px] font-bold text-[#735366]">
              {letter(idx)}
            </span>
            {opt}
            {corrects.has(idx) ? <Check size={14} className="text-emerald-600" /> : null}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onEdit(q)}
          className="rs-caption font-semibold text-[#A77A95] hover:text-[#5c3050] transition"
        >
          Edit question →
        </button>
      </div>
    </article>
  );
}

function OptionRow({
  index,
  value,
  multi,
  selected,
  onChange,
  onToggleCorrect,
  onRemove,
  canRemove,
  disabled,
}) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl border p-2.5 transition duration-200 ${
        selected
          ? "border-emerald-300 bg-emerald-50/70 shadow-sm"
          : "border-[#e8d5e0] bg-[#fdf8fb] hover:border-[#A77A95]/40"
      }`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggleCorrect(index)}
        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
          selected
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-[#e0cce0] bg-white text-[#735366]"
        }`}
        title={multi ? "Mark as correct" : "Select correct answer"}
      >
        {multi ? (selected ? <Check size={14} /> : letter(index)) : letter(index)}
      </button>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={`Option ${letter(index)}`}
        className="rs-body min-w-0 flex-1 rounded-lg border border-transparent bg-white/80 px-3 py-2 outline-none focus:border-[#A77A95]"
      />
      {canRemove ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRemove(index)}
          className="mt-1 rounded-lg p-2 text-[#a77a95] hover:bg-white hover:text-red-500 transition"
          aria-label="Remove option"
        >
          <Trash2 size={16} />
        </button>
      ) : null}
    </div>
  );
}

export default function AdminQuestions() {
  const [tab, setTab] = useState("create");
  const [mode, setMode] = useState("list"); // list | form
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [showPreview, setShowPreview] = useState(true);
  const [filters, setFilters] = useState({
    status: "ACTIVE",
    subjectId: "ALL",
    topic: "ALL",
    difficulty: "ALL",
    questionType: "ALL",
    search: "",
  });
  const [searchInput, setSearchInput] = useState("");

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === form.subjectId),
    [subjects, form.subjectId]
  );

  const filterTopics = useMemo(() => {
    if (filters.subjectId === "ALL") {
      return [...new Set(subjects.flatMap((s) => s.topics || []))].sort();
    }
    return (
      subjects.find((s) => s.id === filters.subjectId)?.topics || []
    ).slice();
  }, [subjects, filters.subjectId]);

  const formTopics = useMemo(() => {
    const base = selectedSubject?.topics || [];
    if (form.topic && !base.includes(form.topic)) return [...base, form.topic];
    return base;
  }, [selectedSubject, form.topic]);

  const loadSubjects = useCallback(async () => {
    const data = await examApi.staffSubjects();
    setSubjects(data || []);
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        status: filters.status,
        subjectId: filters.subjectId !== "ALL" ? filters.subjectId : undefined,
        topic: filters.topic !== "ALL" ? filters.topic : undefined,
        difficulty:
          filters.difficulty !== "ALL" ? filters.difficulty : undefined,
        questionType:
          filters.questionType !== "ALL" ? filters.questionType : undefined,
        search: filters.search || undefined,
      };
      const data = await examApi.staffQuestions(params);
      const items = Array.isArray(data) ? data : data?.items || [];
      setQuestions(items);
      setTotal(Array.isArray(data) ? data.length : data?.total ?? items.length);
    } catch (error) {
      openSnackbar({ message: error.message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadSubjects().catch((error) =>
      openSnackbar({ message: error.message, variant: "error" })
    );
  }, [loadSubjects]);

  useEffect(() => {
    if (tab === "create" && mode === "list") loadQuestions();
  }, [tab, mode, loadQuestions]);

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput.trim() }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setForm(emptyForm());
    setMode("form");
  };

  const openEdit = (q) => {
    setForm({
      id: q.id,
      subjectId: q.subjectId || "",
      topic: q.topic || "",
      questionType: q.questionType || "SCI",
      difficulty: q.difficulty || "Medium",
      status: q.status || "ACTIVE",
      text: q.text || "",
      options:
        q.questionType === "TRU"
          ? ["True", "False"]
          : q.options?.length
            ? [...q.options]
            : [...EMPTY_OPTIONS],
      correctIndexes: q.correctIndexes?.length
        ? [...q.correctIndexes]
        : [q.correctIndex ?? 0],
      explanation: q.explanation || "",
      remarks: q.remarks || "",
      marks: q.marks ?? 1,
      timeMin: q.timeMin ?? 2,
    });
    setMode("form");
  };

  const backToList = () => {
    setForm(emptyForm());
    setMode("list");
  };

  const onTypeChange = (type) => {
    if (type === "TRU") {
      setForm((prev) => ({
        ...prev,
        questionType: type,
        options: ["True", "False"],
        correctIndexes: [0],
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      questionType: type,
      options: prev.options.length >= 2 ? prev.options : [...EMPTY_OPTIONS],
      correctIndexes: [prev.correctIndexes[0] ?? 0],
    }));
  };

  const updateOption = (index, value) => {
    setForm((prev) => {
      const options = [...prev.options];
      options[index] = value;
      return { ...prev, options };
    });
  };

  const toggleCorrect = (index) => {
    setForm((prev) => {
      if (prev.questionType === "MCU") {
        const set = new Set(prev.correctIndexes);
        if (set.has(index)) set.delete(index);
        else set.add(index);
        return { ...prev, correctIndexes: [...set].sort((a, b) => a - b) };
      }
      return { ...prev, correctIndexes: [index] };
    });
  };

  const addOption = () => {
    setForm((prev) => {
      if (prev.options.length >= 5) return prev;
      return { ...prev, options: [...prev.options, ""] };
    });
  };

  const removeOption = (index) => {
    setForm((prev) => {
      if (prev.options.length <= 2) return prev;
      const options = prev.options.filter((_, i) => i !== index);
      const correctIndexes = prev.correctIndexes
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i));
      return {
        ...prev,
        options,
        correctIndexes: correctIndexes.length ? correctIndexes : [0],
      };
    });
  };

  const addSubjectQuick = async () => {
    const name = window.prompt("New subject name");
    if (!name?.trim()) return;
    try {
      const created = await examApi.createSubject({ name: name.trim() });
      await loadSubjects();
      setField("subjectId", created.id);
      openSnackbar({ message: "Subject created", variant: "success" });
    } catch (error) {
      if (error.message?.includes("already exists")) {
        await loadSubjects();
      }
      openSnackbar({ message: error.message, variant: "error" });
    }
  };

  const validate = () => {
    if (!form.subjectId) return "Subject is required";
    if (!form.topic.trim()) return "Topic is required";
    if (!form.text.trim()) return "Question text is required";
    if (!form.explanation.trim()) return "Explanation is required";
    if (!Number(form.marks) || Number(form.marks) <= 0) {
      return "Score must be greater than 0";
    }
    if (!Number(form.timeMin) || Number(form.timeMin) <= 0) {
      return "Question time must be greater than 0";
    }
    const opts = form.options.map((o) => o.trim()).filter(Boolean);
    if (form.questionType !== "TRU" && opts.length < 2) {
      return "At least 2 options are required";
    }
    if (form.questionType !== "TRU" && opts.length !== form.options.length) {
      return "Fill all option fields or remove empty ones";
    }
    if (!form.correctIndexes.length) return "Select the correct answer";
    if (
      form.questionType === "MCU" &&
      form.correctIndexes.length < 1
    ) {
      return "Select at least one correct option";
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      openSnackbar({ message: err, variant: "warning" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        subjectId: form.subjectId,
        topic: form.topic.trim(),
        questionType: form.questionType,
        difficulty: form.difficulty,
        status: form.status,
        text: form.text.trim(),
        options:
          form.questionType === "TRU"
            ? ["True", "False"]
            : form.options.map((o) => o.trim()),
        correctIndex: form.correctIndexes[0],
        correctIndexes: form.correctIndexes,
        explanation: form.explanation.trim(),
        remarks: form.remarks.trim(),
        marks: Number(form.marks),
        timeMin: Number(form.timeMin),
      };

      if (form.id) {
        await examApi.updateQuestion(form.id, payload);
        openSnackbar({
          message: "Question updated successfully",
          variant: "success",
        });
      } else {
        await examApi.createQuestion(payload);
        openSnackbar({
          message: "Question & answer saved successfully",
          variant: "success",
        });
      }

      setFilters((f) => ({
        ...f,
        status: form.status,
        subjectId: form.subjectId,
        topic: form.topic,
        difficulty: form.difficulty,
        questionType: form.questionType,
      }));
      await loadSubjects();
      setMode("list");
      setForm(emptyForm());
    } catch (error) {
      openSnackbar({ message: error.message, variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const isMulti = form.questionType === "MCU";
  const isTrueFalse = form.questionType === "TRU";

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <PageHeader
        module="Question Bank"
        title="Question Bank"
        description="Build MCQs like Nextestify — subject, topic, type, options and save to the live bank."
        action={
          mode === "list" && tab === "create" ? (
            <PrimaryButton onClick={openCreate} className="gap-2">
              <Plus size={16} /> Add Questions
            </PrimaryButton>
          ) : mode === "form" ? (
            <button
              type="button"
              onClick={backToList}
              className="rs-btn rs-btn-ghost"
            >
              View Questions
            </button>
          ) : null
        }
      />

      <div className="mb-4 grid grid-cols-3 gap-1 rounded-2xl border border-[#e8d5e0] bg-[#fdf8fb] p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              if (t.id === "create") setMode("list");
            }}
            className={`rounded-xl min-h-10 text-[12px] sm:text-sm font-bold transition ${
              tab === t.id
                ? "bg-white text-[#5c3050] shadow-sm"
                : "text-[#a77a95] hover:text-[#5c3050]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <Surface className="text-center py-14">
          <Upload className="mx-auto text-[#A77A95]" size={28} />
          <p className="mt-3 rs-body font-semibold text-[#3d1f33]">
            Upload Questions
          </p>
          <p className="rs-caption text-[#735366]/65 mt-1">
            Excel bulk upload will plug in next — use Create Question for now.
          </p>
        </Surface>
      ) : null}

      {tab === "logs" ? (
        <Surface className="text-center py-14">
          <Filter className="mx-auto text-[#A77A95]" size={28} />
          <p className="mt-3 rs-body font-semibold text-[#3d1f33]">
            Question Logs
          </p>
          <p className="rs-caption text-[#735366]/65 mt-1">
            Upload / edit audit trail coming soon.
          </p>
        </Surface>
      ) : null}

      {tab === "create" && mode === "list" ? (
        <div className="space-y-4">
          <Surface className="!p-3 sm:!p-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#A77A95]" />
                <p className="rs-body font-bold text-[#3d1f33]">
                  Total Questions{" "}
                  <span className="text-[#A77A95]">{total}</span>
                </p>
              </div>
              <div className="relative w-full lg:max-w-xs">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a77a95]"
                />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search question text…"
                  className="rs-body w-full rounded-xl border border-[#e8d5e0] bg-white py-2.5 pl-9 pr-3 outline-none focus:border-[#A77A95]"
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
              {[
                {
                  key: "status",
                  options: [
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                    { value: "ALL", label: "All status" },
                  ],
                },
                {
                  key: "subjectId",
                  options: [
                    { value: "ALL", label: "All subjects" },
                    ...subjects.map((s) => ({ value: s.id, label: s.name })),
                  ],
                },
                {
                  key: "topic",
                  options: [
                    { value: "ALL", label: "All topics" },
                    ...filterTopics.map((t) => ({ value: t, label: t })),
                  ],
                },
                {
                  key: "difficulty",
                  options: [
                    { value: "ALL", label: "All levels" },
                    ...LEVELS.map((l) => ({ value: l, label: l })),
                  ],
                },
                {
                  key: "questionType",
                  options: [
                    { value: "ALL", label: "All types" },
                    ...QUESTION_TYPES.map((t) => ({
                      value: t.value,
                      label: t.label,
                    })),
                  ],
                },
              ].map((field) => (
                <select
                  key={field.key}
                  value={filters[field.key]}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      [field.key]: e.target.value,
                      ...(field.key === "subjectId" ? { topic: "ALL" } : null),
                    }))
                  }
                  className="rs-caption rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95]"
                >
                  {field.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </Surface>

          {loading ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <EdvoraLoader message="Loading question bank…" />
            </div>
          ) : questions.length === 0 ? (
            <Surface className="text-center py-12">
              <p className="rs-body font-semibold text-[#3d1f33]">
                No questions found
              </p>
              <p className="rs-caption text-[#735366]/65 mt-1">
                Click Add Questions to create your first MCQ.
              </p>
              <PrimaryButton onClick={openCreate} className="mt-4 gap-2">
                <Plus size={16} /> Add Questions
              </PrimaryButton>
            </Surface>
          ) : (
            <div className="space-y-3 animate-[fadeIn_0.35s_ease]">
              {questions.map((q, i) => (
                <QuestionCard key={q.id} q={q} index={i} onEdit={openEdit} />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === "create" && mode === "form" ? (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
          <Surface className="!p-4 sm:!p-5 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="rs-caption font-semibold text-[#A77A95]">
                  Question Bank {">>"} {form.id ? "Edit Question" : "Create Question"}
                </p>
                <h2 className="rs-title text-[#3d1f33]">
                  {form.id ? "Edit Question" : "Create Question"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="xl:hidden rs-btn rs-btn-ghost gap-1"
              >
                <Eye size={14} /> Preview
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="rs-caption font-bold text-[#735366]/80 uppercase tracking-wide">
                  Subject *
                </span>
                <div className="mt-1.5 flex gap-2">
                  <select
                    value={form.subjectId}
                    onChange={(e) => {
                      setField("subjectId", e.target.value);
                      setField("topic", "");
                    }}
                    className="rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95]"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addSubjectQuick}
                    className="shrink-0 rounded-xl border border-[#e8d5e0] bg-[#FAEEE9] px-3 text-[#A77A95] font-bold hover:bg-white transition"
                    title="Add subject"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="rs-caption font-bold text-[#735366]/80 uppercase tracking-wide">
                  Topic *
                </span>
                <input
                  list="qb-topics"
                  value={form.topic}
                  onChange={(e) => setField("topic", e.target.value)}
                  placeholder="e.g. Algebra"
                  className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95]"
                />
                <datalist id="qb-topics">
                  {formTopics.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </label>

              <label className="block">
                <span className="rs-caption font-bold text-[#735366]/80 uppercase tracking-wide">
                  Question Type *
                </span>
                <select
                  value={form.questionType}
                  onChange={(e) => onTypeChange(e.target.value)}
                  className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95]"
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="rs-caption font-bold text-[#735366]/80 uppercase tracking-wide">
                  Question Level *
                </span>
                <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl border border-[#e8d5e0] bg-[#fdf8fb] p-1">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setField("difficulty", level)}
                      className={`rounded-lg min-h-9 text-xs font-bold transition ${
                        form.difficulty === level
                          ? "bg-white text-[#5c3050] shadow-sm"
                          : "text-[#a77a95]"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block sm:col-span-2">
                <span className="rs-caption font-bold text-[#735366]/80 uppercase tracking-wide">
                  Question Status *
                </span>
                <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-xl border border-[#e8d5e0] bg-[#fdf8fb] p-1 max-w-sm">
                  {["ACTIVE", "INACTIVE"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setField("status", st)}
                      className={`rounded-lg min-h-9 text-xs font-bold transition ${
                        form.status === st
                          ? "bg-white text-[#5c3050] shadow-sm"
                          : "text-[#a77a95]"
                      }`}
                    >
                      {st === "ACTIVE" ? "Active" : "Inactive"}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <label className="block">
              <span className="rs-caption font-bold text-[#735366]/80 uppercase tracking-wide">
                Question *
              </span>
              <textarea
                value={form.text}
                onChange={(e) => setField("text", e.target.value)}
                rows={4}
                placeholder="Type the question here…"
                className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-3 outline-none focus:border-[#A77A95] resize-y"
              />
            </label>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="rs-caption font-bold text-[#735366]/80 uppercase tracking-wide">
                  Answer / Options *{" "}
                  <span className="normal-case font-medium text-[#a77a95]">
                    (select the correct one{isMulti ? "s" : ""})
                  </span>
                </p>
                {!isTrueFalse && form.options.length < 5 ? (
                  <button
                    type="button"
                    onClick={addOption}
                    className="rs-caption font-bold text-[#A77A95] hover:text-[#5c3050] flex items-center gap-1"
                  >
                    <Plus size={14} /> Add option
                  </button>
                ) : null}
              </div>
              <div className="space-y-2">
                {form.options.map((opt, idx) => (
                  <OptionRow
                    key={idx}
                    index={idx}
                    value={opt}
                    multi={isMulti}
                    selected={form.correctIndexes.includes(idx)}
                    onChange={updateOption}
                    onToggleCorrect={toggleCorrect}
                    onRemove={removeOption}
                    canRemove={!isTrueFalse && form.options.length > 2}
                    disabled={isTrueFalse}
                  />
                ))}
              </div>
            </div>

            <label className="block">
              <span className="rs-caption font-bold text-[#735366]/80 uppercase tracking-wide">
                Explanation *
              </span>
              <textarea
                value={form.explanation}
                onChange={(e) => setField("explanation", e.target.value)}
                rows={3}
                placeholder="Why is this the correct answer?"
                className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-3 outline-none focus:border-[#A77A95] resize-y"
              />
            </label>

            <label className="block">
              <span className="rs-caption font-bold text-[#735366]/80 uppercase tracking-wide">
                Remarks
              </span>
              <textarea
                value={form.remarks}
                onChange={(e) => setField("remarks", e.target.value)}
                rows={2}
                placeholder="Optional internal notes"
                className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-3 outline-none focus:border-[#A77A95] resize-y"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="rs-caption font-bold text-[#735366]/80 uppercase tracking-wide">
                  Score / Points *
                </span>
                <input
                  type="number"
                  min={1}
                  value={form.marks}
                  onChange={(e) => setField("marks", e.target.value)}
                  className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95]"
                />
              </label>
              <label className="block">
                <span className="rs-caption font-bold text-[#735366]/80 uppercase tracking-wide">
                  Time (minutes) *
                </span>
                <input
                  type="number"
                  min={1}
                  value={form.timeMin}
                  onChange={(e) => setField("timeMin", e.target.value)}
                  className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95]"
                />
              </label>
            </div>

            <div className="sticky bottom-0 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 border-t border-[#f0e4eb] bg-white/95 backdrop-blur flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => setForm(emptyForm())}
                className="rs-btn rs-btn-ghost"
              >
                Clear
              </button>
              <PrimaryButton
                disabled={saving}
                onClick={handleSave}
                className="gap-2 min-w-[140px]"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    Save <ChevronRight size={16} />
                  </>
                )}
              </PrimaryButton>
            </div>
          </Surface>

          <aside
            className={`${
              showPreview ? "block" : "hidden"
            } xl:block xl:sticky xl:top-4`}
          >
            <div className="rounded-2xl border border-[#e8d5e0] bg-linear-to-br from-[#FAEEE9] via-white to-[#F5D69B]/30 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="rs-caption font-bold uppercase tracking-wide text-[#735366]/70">
                  Live preview
                </p>
                <button
                  type="button"
                  className="xl:hidden p-1 text-[#a77a95]"
                  onClick={() => setShowPreview(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Pill>{selectedSubject?.name || "Subject"}</Pill>
                <Pill tone="info">{form.topic || "Topic"}</Pill>
                <Pill>{form.difficulty}</Pill>
                <Pill>{form.questionType}</Pill>
              </div>
              <p className="rs-body font-semibold text-[#3d1f33] min-h-[3rem]">
                {form.text || "Your question appears here…"}
              </p>
              <ul className="mt-3 space-y-1.5">
                {form.options.map((opt, idx) => {
                  const selected = form.correctIndexes.includes(idx);
                  return (
                    <li
                      key={idx}
                      className={`rounded-lg px-2.5 py-2 text-sm transition ${
                        selected
                          ? "bg-emerald-100 text-emerald-800 font-semibold"
                          : "bg-white/70 text-[#735366]"
                      }`}
                    >
                      {letter(idx)}. {opt || "—"}
                      {selected ? " ✓" : ""}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 rs-caption text-[#735366]/65">
                {form.marks || 0} pt · {form.timeMin || 0} min
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
