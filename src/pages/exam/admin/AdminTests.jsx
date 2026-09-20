import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileCheck2,
  Loader2,
  NotebookPen,
  Plus,
  Search,
  Settings2,
} from "lucide-react";
import { examApi, formatExamDate } from "../../../utils/examApi";
import {
  PageHeader,
  Pill,
  PrimaryButton,
  Surface,
} from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

const STEPS = [
  { id: "basic", label: "Basic Settings", icon: Settings2 },
  { id: "questions", label: "Question Manager", icon: NotebookPen },
  { id: "time", label: "Time Setup", icon: Clock3 },
  { id: "grade", label: "Grading", icon: FileCheck2 },
  { id: "publish", label: "Finalize", icon: Check },
];

const TEST_TYPES = [
  { value: "PRACTICE", label: "Practice", hint: "Anytime mock tests" },
  { value: "SCHEDULED", label: "Scheduled", hint: "Fixed window exam" },
  { value: "ON_DEMAND", label: "On Demand", hint: "Requestable window" },
];

const LEVELS = ["Easy", "Medium", "Hard"];

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyForm() {
  return {
    id: null,
    title: "",
    description: "",
    type: "PRACTICE",
    subjectId: "",
    difficulty: "Medium",
    durationMin: 30,
    passPercent: 40,
    maxAttempts: 0,
    questionIds: [],
    startsAt: "",
    endsAt: "",
    status: "DRAFT",
  };
}

function formFromTest(t) {
  return {
    id: t.id,
    title: t.title || "",
    description: t.description || "",
    type: t.type || "PRACTICE",
    subjectId: t.subjectId || t.subject?.id || "",
    difficulty: t.difficulty || "Medium",
    durationMin: t.durationMin || 30,
    passPercent: t.passPercent ?? 40,
    maxAttempts: t.maxAttempts ?? 0,
    questionIds: t.questionIds || [],
    startsAt: toLocalInput(t.startsAt),
    endsAt: toLocalInput(t.endsAt),
    status: t.status || "DRAFT",
  };
}

export default function AdminTests() {
  const [mode, setMode] = useState("list");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tests, setTests] = useState([]);
  const [total, setTotal] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({
    status: "ALL",
    type: "ALL",
    subjectId: "ALL",
    search: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [qSearch, setQSearch] = useState("");

  const needsWindow = form.type === "SCHEDULED" || form.type === "ON_DEMAND";
  const typeLocked = form.status === "PUBLISHED";

  const loadSubjects = useCallback(async () => {
    const data = await examApi.staffSubjects();
    setSubjects(data || []);
  }, []);

  const loadTests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await examApi.staffTests({
        status: filters.status,
        type: filters.type,
        subjectId: filters.subjectId !== "ALL" ? filters.subjectId : undefined,
        search: filters.search || undefined,
      });
      const items = data?.items || [];
      setTests(items);
      setTotal(data?.total ?? items.length);
    } catch (error) {
      openSnackbar({ message: error.message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadBank = useCallback(async (subjectId) => {
    if (!subjectId) {
      setBankQuestions([]);
      return;
    }
    const data = await examApi.staffQuestions({
      subjectId,
      status: "ACTIVE",
    });
    setBankQuestions(Array.isArray(data) ? data : data?.items || []);
  }, []);

  useEffect(() => {
    loadSubjects().catch((e) =>
      openSnackbar({ message: e.message, variant: "error" })
    );
  }, [loadSubjects]);

  useEffect(() => {
    if (mode === "list") loadTests();
  }, [mode, loadTests]);

  useEffect(() => {
    const t = setTimeout(
      () => setFilters((f) => ({ ...f, search: searchInput.trim() })),
      400
    );
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (mode === "wizard" && form.subjectId) {
      loadBank(form.subjectId).catch((e) =>
        openSnackbar({ message: e.message, variant: "error" })
      );
    }
  }, [mode, form.subjectId, loadBank]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setForm(emptyForm());
    setStep(0);
    setMode("wizard");
  };

  const openEdit = async (test) => {
    try {
      const full = await examApi.getStaffTest(test.id);
      setForm(formFromTest(full));
      setStep(0);
      setMode("wizard");
    } catch (error) {
      openSnackbar({ message: error.message, variant: "error" });
    }
  };

  const backToList = () => {
    setMode("list");
    setForm(emptyForm());
    setStep(0);
  };

  const filteredBank = useMemo(() => {
    const q = qSearch.trim().toLowerCase();
    if (!q) return bankQuestions;
    return bankQuestions.filter(
      (item) =>
        item.text?.toLowerCase().includes(q) ||
        item.topic?.toLowerCase().includes(q)
    );
  }, [bankQuestions, qSearch]);

  const toggleQuestion = (id) => {
    setForm((prev) => {
      const set = new Set(prev.questionIds);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, questionIds: [...set] };
    });
  };

  const validateStep = (idx) => {
    if (idx === 0) {
      if (!form.title.trim()) return "Test name is required";
      if (!form.subjectId) return "Subject is required";
      if (!form.type) return "Test type is required";
    }
    if (idx === 1) {
      if (!form.questionIds.length) return "Select at least one question";
    }
    if (idx === 2) {
      if (!Number(form.durationMin) || Number(form.durationMin) < 1) {
        return "Duration must be at least 1 minute";
      }
      if (needsWindow) {
        if (!form.startsAt || !form.endsAt) {
          return "Set activation and end window";
        }
        if (new Date(form.endsAt) <= new Date(form.startsAt)) {
          return "End time must be after start time";
        }
      }
    }
    if (idx === 3) {
      const p = Number(form.passPercent);
      if (Number.isNaN(p) || p < 0 || p > 100) {
        return "Pass mark must be between 0 and 100";
      }
    }
    return null;
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type,
    subjectId: form.subjectId,
    difficulty: form.difficulty,
    durationMin: Number(form.durationMin),
    passPercent: Number(form.passPercent),
    maxAttempts: Number(form.maxAttempts) || 0,
    questionIds: form.questionIds,
    startsAt: needsWindow && form.startsAt ? new Date(form.startsAt).toISOString() : null,
    endsAt: needsWindow && form.endsAt ? new Date(form.endsAt).toISOString() : null,
  });

  const saveProgress = async ({ publish = false } = {}) => {
    const err = validateStep(Math.min(step, 3));
    if (err && publish) {
      openSnackbar({ message: err, variant: "warning" });
      return null;
    }
    // always validate basic before any save
    const basicErr = validateStep(0);
    if (basicErr) {
      openSnackbar({ message: basicErr, variant: "warning" });
      return null;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      let saved;
      if (form.id) {
        saved = await examApi.updateTest(form.id, payload);
      } else {
        saved = await examApi.createTest({ ...payload, status: "DRAFT" });
      }

      if (publish) {
        const qErr = validateStep(1);
        const tErr = validateStep(2);
        const gErr = validateStep(3);
        if (qErr || tErr || gErr) {
          openSnackbar({ message: qErr || tErr || gErr, variant: "warning" });
          setForm(formFromTest(saved));
          return null;
        }
        saved = await examApi.publishTest(saved.id);
        openSnackbar({ message: "Test published successfully", variant: "success" });
      } else {
        openSnackbar({
          message: form.id ? "Test updated" : "Test created",
          variant: "success",
        });
      }

      setForm(formFromTest(saved));
      return saved;
    } catch (error) {
      openSnackbar({ message: error.message, variant: "error" });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    const err = validateStep(step);
    if (err) {
      openSnackbar({ message: err, variant: "warning" });
      return;
    }
    // Persist when leaving basic / after questions
    if (step === 0 || step === 1 || step === 2 || step === 3) {
      const saved = await saveProgress();
      if (!saved) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handlePublish = async () => {
    for (let i = 0; i <= 3; i += 1) {
      const err = validateStep(i);
      if (err) {
        openSnackbar({ message: err, variant: "warning" });
        setStep(i);
        return;
      }
    }
    const saved = await saveProgress({ publish: true });
    if (saved) {
      backToList();
      loadTests();
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <PageHeader
        module="Test Setup"
        title="Test Configuration"
        description="Create practice, scheduled and on-demand exams — Nextestify-style wizard."
        action={
          mode === "list" ? (
            <PrimaryButton onClick={openCreate} className="gap-2">
              <Plus size={16} /> Create Test
            </PrimaryButton>
          ) : (
            <button type="button" onClick={backToList} className="rs-btn rs-btn-ghost">
              View Tests
            </button>
          )
        }
      />

      {mode === "list" ? (
        <div className="space-y-4">
          <Surface className="!p-3 sm:!p-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <p className="rs-body font-bold text-[#3d1f33]">
                Total Tests <span className="text-[#A77A95]">{total}</span>
              </p>
              <div className="relative w-full lg:max-w-xs">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a77a95]"
                />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search test name…"
                  className="rs-body w-full rounded-xl border border-[#e8d5e0] bg-white py-2.5 pl-9 pr-3 outline-none focus:border-[#A77A95]"
                />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
                className="rs-caption rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5"
              >
                <option value="ALL">All status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, type: e.target.value }))
                }
                className="rs-caption rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5"
              >
                <option value="ALL">All types</option>
                {TEST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.subjectId}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, subjectId: e.target.value }))
                }
                className="rs-caption rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5"
              >
                <option value="ALL">All subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </Surface>

          {loading ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <EdvoraLoader message="Loading tests…" />
            </div>
          ) : tests.length === 0 ? (
            <Surface className="text-center py-12">
              <p className="rs-body font-semibold text-[#3d1f33]">No tests yet</p>
              <p className="rs-caption text-[#735366]/65 mt-1">
                Click Create Test to configure your first exam.
              </p>
              <PrimaryButton onClick={openCreate} className="mt-4 gap-2">
                <Plus size={16} /> Create Test
              </PrimaryButton>
            </Surface>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tests.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => openEdit(t)}
                  className="text-left rounded-2xl border border-[#e8d5e0] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-[#A77A95]/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="rs-body font-bold text-[#3d1f33]">{t.title}</h2>
                    <Pill>{t.type}</Pill>
                    <Pill tone="info">{t.difficulty}</Pill>
                    <Pill
                      tone={
                        t.status === "PUBLISHED"
                          ? "success"
                          : t.status === "DRAFT"
                            ? "warn"
                            : "default"
                      }
                    >
                      {t.status}
                    </Pill>
                  </div>
                  <p className="mt-1 rs-caption text-[#735366]/65">
                    {t.subject?.name} · {t.questionCount} Q · {t.durationMin} min ·
                    Pass {t.passPercent}%
                  </p>
                  {(t.startsAt || t.endsAt) && (
                    <p className="mt-1 rs-caption text-[#735366]/55">
                      {formatExamDate(t.startsAt)} → {formatExamDate(t.endsAt)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {mode === "wizard" ? (
        <div className="space-y-4">
          <Surface className="!p-3">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {STEPS.map((s, idx) => {
                const Icon = s.icon;
                const active = idx === step;
                const done = idx < step;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStep(idx)}
                    className={`flex min-w-[140px] flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                      active
                        ? "bg-[#A77A95] text-white shadow-md"
                        : done
                          ? "bg-[#FAEEE9] text-[#5c3050]"
                          : "bg-[#fdf8fb] text-[#a77a95]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        active ? "bg-white/20" : "bg-white"
                      }`}
                    >
                      <Icon size={14} />
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold leading-tight">
                      {idx + 1}. {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Surface>

          <Surface className="!p-4 sm:!p-5 space-y-4">
            {step === 0 ? (
              <>
                <h2 className="rs-title text-[#3d1f33]">Basic Settings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {TEST_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      disabled={typeLocked}
                      onClick={() => setField("type", t.value)}
                      className={`rounded-xl border p-3 text-left transition ${
                        form.type === t.value
                          ? "border-[#A77A95] bg-[#FAEEE9] shadow-sm"
                          : "border-[#e8d5e0] bg-white hover:border-[#A77A95]/40"
                      } disabled:opacity-60`}
                    >
                      <p className="rs-body font-bold text-[#3d1f33]">{t.label}</p>
                      <p className="rs-caption text-[#735366]/65">{t.hint}</p>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block sm:col-span-2">
                    <span className="rs-caption font-bold uppercase tracking-wide text-[#735366]/80">
                      Test name *
                    </span>
                    <input
                      value={form.title}
                      onChange={(e) => setField("title", e.target.value)}
                      maxLength={100}
                      className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95]"
                      placeholder="e.g. Algebra Fundamentals Mock"
                    />
                  </label>

                  <label className="block">
                    <span className="rs-caption font-bold uppercase tracking-wide text-[#735366]/80">
                      Subject *
                    </span>
                    <select
                      value={form.subjectId}
                      disabled={typeLocked}
                      onChange={(e) => {
                        setField("subjectId", e.target.value);
                        setField("questionIds", []);
                      }}
                      className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95] disabled:opacity-60"
                    >
                      <option value="">Select subject</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="rs-caption font-bold uppercase tracking-wide text-[#735366]/80">
                      Level *
                    </span>
                    <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl border border-[#e8d5e0] bg-[#fdf8fb] p-1">
                      {LEVELS.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setField("difficulty", level)}
                          className={`rounded-lg min-h-9 text-xs font-bold ${
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
                    <span className="rs-caption font-bold uppercase tracking-wide text-[#735366]/80">
                      Description
                    </span>
                    <textarea
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                      maxLength={250}
                      rows={3}
                      className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-3 outline-none focus:border-[#A77A95]"
                      placeholder="Short summary for candidates"
                    />
                  </label>
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="rs-title text-[#3d1f33]">Question Manager</h2>
                    <p className="rs-caption text-[#735366]/65">
                      Selected {form.questionIds.length} question(s) from bank
                    </p>
                  </div>
                  <input
                    value={qSearch}
                    onChange={(e) => setQSearch(e.target.value)}
                    placeholder="Filter questions…"
                    className="rs-body rounded-xl border border-[#e8d5e0] bg-white px-3 py-2 outline-none focus:border-[#A77A95] sm:max-w-xs w-full"
                  />
                </div>
                {!form.subjectId ? (
                  <p className="rs-body text-[#735366]/65">
                    Select a subject in Basic Settings first.
                  </p>
                ) : filteredBank.length === 0 ? (
                  <p className="rs-body text-[#735366]/65">
                    No active questions for this subject. Create questions in
                    Question Bank first.
                  </p>
                ) : (
                  <ul className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
                    {filteredBank.map((q) => {
                      const checked = form.questionIds.includes(q.id);
                      return (
                        <li key={q.id}>
                          <button
                            type="button"
                            onClick={() => toggleQuestion(q.id)}
                            className={`w-full text-left rounded-xl border px-3 py-3 transition ${
                              checked
                                ? "border-emerald-300 bg-emerald-50/70"
                                : "border-[#e8d5e0] bg-white hover:border-[#A77A95]/40"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                  checked
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-[#d8c4d4] bg-white"
                                }`}
                              >
                                {checked ? <Check size={12} /> : null}
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap gap-1.5 mb-1">
                                  <Pill tone="info">{q.topic}</Pill>
                                  <Pill>{q.difficulty}</Pill>
                                  <Pill>{q.questionType || "SCI"}</Pill>
                                </div>
                                <p className="rs-body font-medium text-[#3d1f33] line-clamp-2">
                                  {q.text}
                                </p>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            ) : null}

            {step === 2 ? (
              <>
                <h2 className="rs-title text-[#3d1f33]">Time Setup</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="rs-caption font-bold uppercase tracking-wide text-[#735366]/80">
                      Duration (minutes) *
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={form.durationMin}
                      onChange={(e) => setField("durationMin", e.target.value)}
                      className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95]"
                    />
                  </label>
                  {needsWindow ? (
                    <>
                      <label className="block">
                        <span className="rs-caption font-bold uppercase tracking-wide text-[#735366]/80">
                          Activation / Start *
                        </span>
                        <input
                          type="datetime-local"
                          value={form.startsAt}
                          onChange={(e) => setField("startsAt", e.target.value)}
                          className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95]"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="rs-caption font-bold uppercase tracking-wide text-[#735366]/80">
                          End / Expiry *
                        </span>
                        <input
                          type="datetime-local"
                          value={form.endsAt}
                          onChange={(e) => setField("endsAt", e.target.value)}
                          className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95]"
                        />
                      </label>
                    </>
                  ) : (
                    <p className="rs-caption text-[#735366]/65 self-end pb-2">
                      Practice tests have no schedule window — candidates can
                      attempt anytime.
                    </p>
                  )}
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <h2 className="rs-title text-[#3d1f33]">Grading Setup</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="rs-caption font-bold uppercase tracking-wide text-[#735366]/80">
                      Pass mark (%) *
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.passPercent}
                      onChange={(e) => setField("passPercent", e.target.value)}
                      className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95]"
                    />
                  </label>
                  <label className="block">
                    <span className="rs-caption font-bold uppercase tracking-wide text-[#735366]/80">
                      Max attempts (0 = unlimited)
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={form.maxAttempts}
                      onChange={(e) => setField("maxAttempts", e.target.value)}
                      className="mt-1.5 rs-body w-full rounded-xl border border-[#e8d5e0] bg-white px-3 py-2.5 outline-none focus:border-[#A77A95]"
                    />
                  </label>
                </div>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <h2 className="rs-title text-[#3d1f33]">Finalize Test</h2>
                <div className="rounded-2xl border border-[#e8d5e0] bg-[#fdf8fb] p-4 space-y-2">
                  <p className="rs-body font-bold text-[#3d1f33]">{form.title || "—"}</p>
                  <div className="flex flex-wrap gap-2">
                    <Pill>{form.type}</Pill>
                    <Pill tone="info">{form.difficulty}</Pill>
                    <Pill>
                      {subjects.find((s) => s.id === form.subjectId)?.name ||
                        "Subject"}
                    </Pill>
                    <Pill>{form.questionIds.length} questions</Pill>
                    <Pill>{form.durationMin} min</Pill>
                    <Pill>Pass {form.passPercent}%</Pill>
                    <Pill tone={form.status === "PUBLISHED" ? "success" : "warn"}>
                      {form.status}
                    </Pill>
                  </div>
                  {needsWindow ? (
                    <p className="rs-caption text-[#735366]/65">
                      Window: {form.startsAt || "—"} → {form.endsAt || "—"}
                    </p>
                  ) : null}
                  <p className="rs-caption text-[#735366]/70">
                    Publish to make this test available to candidates.
                  </p>
                </div>
              </>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f0e4eb]">
              <button
                type="button"
                disabled={step === 0 || saving}
                onClick={goBack}
                className="rs-btn rs-btn-ghost gap-1 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex flex-wrap gap-2">
                {step < STEPS.length - 1 ? (
                  <>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => saveProgress()}
                      className="rs-btn rs-btn-ghost"
                    >
                      {saving ? "Saving…" : "Save draft"}
                    </button>
                    <PrimaryButton
                      disabled={saving}
                      onClick={goNext}
                      className="gap-1"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          Next <ChevronRight size={16} />
                        </>
                      )}
                    </PrimaryButton>
                  </>
                ) : (
                  <PrimaryButton
                    disabled={saving || form.status === "PUBLISHED"}
                    onClick={handlePublish}
                    className="gap-2 min-w-[160px]"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Publishing…
                      </>
                    ) : form.status === "PUBLISHED" ? (
                      "Already published"
                    ) : (
                      <>
                        <Check size={16} /> Publish Test
                      </>
                    )}
                  </PrimaryButton>
                )}
              </div>
            </div>
          </Surface>
        </div>
      ) : null}
    </div>
  );
}
