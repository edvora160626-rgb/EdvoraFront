import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  CloudUpload,
  Download,
  FileSpreadsheet,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react";
import CustomSelect from "../../common/CustomSelect";
import { openSnackbar } from "../../common/snackbar/snackbar";
import {
  ATTENDANCE_STATUSES,
  bulkUploadAttendance,
  getAssignedClassesForAttendance,
  getMonthAttendance,
  getStudentsForAttendance,
  getTeachersForAttendance,
  normalizeBulkRows,
  parseCsv,
  todayISO,
} from "../../utils/attendanceApi";
import {
  clampMonthKey,
  currentMonthKey,
  getMonthDays,
  monthKeyFromDate,
  monthLabel,
} from "../../utils/attendanceMonth";
import {
  downloadStudentAttendanceTemplate,
  downloadTeacherAttendanceTemplate,
  parseExcelAttendanceFile,
} from "../../utils/attendanceTemplate";
import { getUserRole } from "../../utils/auth";

const STATUS_OPTIONS = [
  { value: "", label: "—" },
  ...ATTENDANCE_STATUSES.map((item) => ({
    value: item.value,
    label: item.short,
    title: item.label,
  })),
];

function personName(person) {
  return [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
}

function rosterIdentity(person, type) {
  if (type === "STUDENT") {
    return person.admissionNumber || person.rollNumber || person.email || "";
  }
  return person.employeeId || person.staffId || person.email || "";
}

function peopleFromRoster(list, type, existingMarks = {}) {
  return (list || []).map((person) => {
    const days = {};
    Object.entries(existingMarks).forEach(([key, status]) => {
      const [id, iso] = key.split("|");
      if (String(id) === String(person._id) && status) days[iso] = status;
    });
    return {
      id: person._id,
      identifier: rosterIdentity(person, type),
      name: personName(person),
      extra:
        type === "STUDENT"
          ? person.rollNumber || ""
          : person.department || "",
      days,
    };
  });
}

function mergeParsedRows(currentPeople, parsedRows, monthDays) {
  const allowed = new Set(monthDays.filter((day) => !day.isFuture).map((day) => day.iso));
  const byId = new Map(
    currentPeople.map((person) => [String(person.identifier).toLowerCase(), { ...person, days: { ...person.days } }])
  );

  parsedRows.forEach((row) => {
    const key = String(row.identifier || "").trim().toLowerCase();
    if (!key) return;
    if (!byId.has(key)) {
      byId.set(key, {
        id: "",
        identifier: row.identifier,
        name: row.staffName || "",
        extra: row.department || "",
        days: {},
      });
    }
    const person = byId.get(key);
    if (row.staffName) person.name = row.staffName;
    if (row.date && allowed.has(row.date) && row.status) {
      const match = ATTENDANCE_STATUSES.find(
        (item) =>
          item.value === String(row.status).toUpperCase().replace(/[\s-]+/g, "_") ||
          item.short === String(row.status).toUpperCase()
      );
      person.days[row.date] = match?.value || String(row.status).toUpperCase();
    }
  });

  return Array.from(byId.values());
}

function gridToUploadRows(people) {
  const rows = [];
  people.forEach((person) => {
    Object.entries(person.days || {}).forEach(([date, status]) => {
      if (!status) return;
      rows.push({
        identifier: person.identifier,
        date,
        status,
      });
    });
  });
  return rows;
}

function BulkAttendanceUpload({ type: typeProp }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = getUserRole();
  const type = typeProp || (role === "TEACHER" ? "STUDENT" : "TEACHER");
  const backPath =
    type === "TEACHER"
      ? "/admin/teacher-attendance"
      : "/admin/student-attendance";
  const isStaff = type === "TEACHER";

  const [month, setMonth] = useState(() =>
    clampMonthKey(monthKeyFromDate(searchParams.get("date") || todayISO()))
  );
  const [classId, setClassId] = useState(searchParams.get("classId") || "");
  const [classes, setClasses] = useState([]);
  const [fileName, setFileName] = useState("");
  const [people, setPeople] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const monthDays = useMemo(() => getMonthDays(month), [month]);
  const writableDays = monthDays.filter((day) => !day.isFuture);
  const selectedClass = classes.find((item) => String(item._id) === String(classId));

  useEffect(() => {
    if (type !== "STUDENT") return;
    let cancelled = false;
    const load = async () => {
      try {
        const anchor = writableDays.at(-1)?.iso || `${month}-01`;
        const res = await getAssignedClassesForAttendance(anchor);
        if (cancelled) return;
        const list = res.classes || [];
        setClasses(list);
        if (!classId && list[0]?._id) setClassId(list[0]._id);
        if (classId && list.length && !list.some((item) => String(item._id) === String(classId))) {
          setClassId(list[0]?._id || "");
        }
      } catch (error) {
        openSnackbar({
          message:
            error?.response?.data?.message ||
            "Failed to load your assigned classes",
          variant: "error",
        });
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [type, month]); // eslint-disable-line react-hooks/exhaustive-deps

  const classOptions = classes.map((item) => ({
    value: item._id,
    label: `${item.className} · Sec ${item.section}`,
  }));

  const markedCount = useMemo(
    () =>
      people.reduce(
        (sum, person) =>
          sum + Object.values(person.days || {}).filter(Boolean).length,
        0
      ),
    [people]
  );

  const loadRoster = async ({ silent = false } = {}) => {
    if (type === "STUDENT" && !classId) {
      if (!silent) {
        openSnackbar({
          message: "Select a class before loading the roster",
          variant: "warning",
        });
      }
      return [];
    }

    setLoadingRoster(true);
    try {
      const anchor = writableDays.at(-1)?.iso || todayISO();
      const [roster, monthData] = await Promise.all([
        type === "STUDENT"
          ? getStudentsForAttendance(classId, anchor)
          : getTeachersForAttendance(anchor),
        getMonthAttendance({ type, month, classId: type === "STUDENT" ? classId : null }).catch(
          () => ({ marks: {} })
        ),
      ]);
      const list = type === "STUDENT" ? roster.students || [] : roster.teachers || [];
      if (!list.length) {
        if (!silent) {
          openSnackbar({
            message: isStaff
              ? "No active staff found"
              : "No active students found in this class",
            variant: "warning",
          });
        }
        setPeople([]);
        return [];
      }
      const next = peopleFromRoster(list, type, monthData.marks || {});
      setPeople(next);
      setResult(null);
      if (!silent) {
        openSnackbar({
          message: `Loaded ${next.length} ${isStaff ? "staff" : "students"} for ${monthLabel(month)}`,
          variant: "success",
        });
      }
      return next;
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to load roster",
        variant: "error",
      });
      return [];
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleFiles = async (fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    const isCsv = /\.(csv|txt)$/i.test(file.name);
    if (!isExcel && !isCsv) {
      return openSnackbar({
        message: "Please upload a .xlsx or .csv file",
        variant: "warning",
      });
    }

    try {
      let parsedFile = { rows: [], monthKey: "" };
      if (isExcel) {
        parsedFile = parseExcelAttendanceFile(await file.arrayBuffer());
      } else {
        parsedFile = parseCsv(await file.text());
      }

      const fileMonth = clampMonthKey(parsedFile.monthKey || month);
      if (fileMonth !== month) setMonth(fileMonth);
      const days = getMonthDays(fileMonth);
      const parsed = normalizeBulkRows(parsedFile.rows, type, fileMonth);
      if (!parsed.length) {
        return openSnackbar({
          message: "File has no attendance marks to import",
          variant: "warning",
        });
      }

      let base = people;
      if (!base.length) {
        base = await loadRoster({ silent: true });
      }
      setPeople(mergeParsedRows(base, parsed, days));
      setFileName(file.name);
      setResult(null);
      openSnackbar({
        message: `${parsed.length} marks loaded — you can still edit them on this screen`,
        variant: "success",
      });
    } catch {
      openSnackbar({
        message: "Could not read the attendance file",
        variant: "error",
      });
    }
  };

  const clearFile = () => {
    setFileName("");
    setPeople([]);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const roster = await loadRoster({ silent: true });
      const source = roster.length ? roster : people;
      if (!source.length) {
        openSnackbar({
          message: isStaff
            ? "No active staff found to include in the template"
            : "Select a class with students before downloading the template",
          variant: "warning",
        });
        return;
      }

      if (type === "STUDENT") {
        const data = await getStudentsForAttendance(
          classId,
          writableDays.at(-1)?.iso || todayISO()
        );
        await downloadStudentAttendanceTemplate(
          data.students || [],
          month,
          data.classInfo || selectedClass
        );
      } else {
        const data = await getTeachersForAttendance(
          writableDays.at(-1)?.iso || todayISO()
        );
        await downloadTeacherAttendanceTemplate(data.teachers || [], month);
      }

      openSnackbar({
        message: `Excel template ready for ${monthLabel(month)} with dropdowns`,
        variant: "success",
      });
    } catch (error) {
      openSnackbar({
        message:
          error?.response?.data?.message ||
          "Failed to build attendance template",
        variant: "error",
      });
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const setDayStatus = (identifier, iso, status) => {
    setPeople((prev) =>
      prev.map((person) =>
        person.identifier === identifier
          ? { ...person, days: { ...person.days, [iso]: status } }
          : person
      )
    );
  };

  const handleUpload = async () => {
    if (type === "STUDENT" && !classId) {
      return openSnackbar({
        message: "Select a class before uploading",
        variant: "warning",
      });
    }
    const rows = gridToUploadRows(people);
    if (!rows.length) {
      return openSnackbar({
        message: "Mark at least one day before uploading",
        variant: "warning",
      });
    }

    try {
      setUploading(true);
      const data = await bulkUploadAttendance({
        type,
        date: writableDays.at(-1)?.iso || todayISO(),
        classId: type === "STUDENT" ? classId : null,
        rows,
      });
      setResult(data);
      openSnackbar({
        message: data?.message || "Bulk attendance uploaded",
        variant: "success",
      });
    } catch (error) {
      const payload = error?.response?.data;
      if (payload?.errors) setResult(payload);
      openSnackbar({
        message: payload?.message || "Bulk upload failed",
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[color:var(--edvora-ink-strong)]">
            Bulk Attendance Upload
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mark the full current month for {isStaff ? "staff" : "students"} — Excel dropdown or on-screen entry.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-soft)]"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <section className="rounded-[24px] border border-[#E8D9D0] bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 text-[color:var(--edvora-primary)] mb-3">
          <ClipboardList size={18} />
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            Instructions
          </h2>
        </div>
        <ol className="space-y-2 text-sm text-slate-600 list-decimal pl-5">
          <li>
            Choose the month. Only the <span className="font-medium text-[color:var(--edvora-ink-strong)]">current or a past month</span> is allowed.
          </li>
          <li>
            {isStaff
              ? "The template includes every active staff member."
              : "Select your class — only that roster is included."}
          </li>
          <li>
            Download the Excel sheet. It has <span className="font-medium text-[color:var(--edvora-ink-strong)]">one column for every day</span> in {monthLabel(month)}.
          </li>
          <li>
            Use the Excel dropdown — <span className="font-medium text-[color:var(--edvora-ink-strong)]">P Present, A Absent, L Late, HD Half Day, LV Leave</span>. You can also type those codes.
          </li>
          <li>
            Grey columns are <span className="font-medium text-[color:var(--edvora-ink-strong)]">future dates</span> and cannot be marked.
          </li>
          <li>
            Upload the file, or skip Excel and click <span className="font-medium text-[color:var(--edvora-ink-strong)]">Load roster</span> to mark attendance on this screen.
          </li>
        </ol>
      </section>

      <section className="relative overflow-hidden rounded-[28px] border border-[#E8D9D0] bg-linear-to-br from-[#FAEEE9] via-white to-[#F8F4F7] p-6 sm:p-8 shadow-sm">
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--edvora-primary)] mb-2">
              Step 1 · Month
            </p>
            <input
              type="month"
              value={month}
              max={currentMonthKey()}
              onChange={(e) => {
                setMonth(clampMonthKey(e.target.value));
                setPeople([]);
                setFileName("");
                setResult(null);
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-[color:var(--edvora-ink-strong)] outline-none focus:border-[color:var(--edvora-primary)]"
            />
            <p className="mt-2 text-xs text-slate-500">
              {writableDays.length} markable day{writableDays.length === 1 ? "" : "s"} · {monthDays.length - writableDays.length} future day{monthDays.length - writableDays.length === 1 ? "" : "s"} locked
            </p>
          </div>

          {type === "STUDENT" ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--edvora-primary)] mb-2">
                Step 2 · Class
              </p>
              <CustomSelect
                options={classOptions}
                value={classOptions.find((opt) => opt.value === classId) || null}
                onChange={(opt) => {
                  setClassId(opt?.value || "");
                  setPeople([]);
                  setFileName("");
                }}
                placeholder={
                  classOptions.length ? "Select assigned class" : "No assigned classes"
                }
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E8D9D0] bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--edvora-primary)]">
                Target
              </p>
              <p className="mt-2 text-sm font-semibold text-[color:var(--edvora-ink-strong)]">
                All active staff
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Match by employeeId, staffId, or email
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-[#E8D9D0] bg-white/70 p-4">
            <div className="flex items-center gap-2 text-[color:var(--edvora-primary)]">
              <Sparkles size={16} />
              <p className="text-xs font-semibold uppercase tracking-wider">
                Status codes
              </p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {ATTENDANCE_STATUSES.map((item) => `${item.short} ${item.label}`).join(" · ")}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`relative overflow-hidden rounded-[24px] border-2 border-dashed p-6 sm:p-8 transition ${
            dragging
              ? "border-[color:var(--edvora-primary)] bg-[color:var(--edvora-primary-soft)]"
              : "border-[#D8C4CE] bg-white"
          }`}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#F5D69B] via-[#A77A95] to-[#735366]" />
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)] shadow-inner">
              <CloudUpload size={28} />
            </span>
            <h2 className="mt-4 text-xl font-bold text-[color:var(--edvora-ink-strong)]">
              Drop monthly Excel here
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md">
              Template columns: identity plus every day of {monthLabel(month)}. Future dates stay empty.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-hover)] px-5 h-11 text-sm font-semibold text-white"
              >
                <UploadCloud size={16} />
                Choose File
              </button>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate || (type === "STUDENT" && !classId)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 h-11 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <Download size={16} />
                {downloadingTemplate ? "Preparing…" : "Download Template"}
              </button>
              <button
                type="button"
                onClick={() => loadRoster()}
                disabled={loadingRoster || (type === "STUDENT" && !classId)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 h-11 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <Users size={16} />
                {loadingRoster ? "Loading…" : "Load roster"}
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {fileName ? (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#E8D9D0] bg-[color:var(--edvora-primary-soft)] px-4 py-3 text-left w-full max-w-md">
                <FileSpreadsheet className="text-[color:var(--edvora-primary)] shrink-0" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[color:var(--edvora-ink-strong)] truncate">
                    {fileName}
                  </p>
                  <p className="text-xs text-slate-500">{markedCount} marks on this screen</p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-2 rounded-lg text-rose-500 hover:bg-white"
                  aria-label="Clear file"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-[color:var(--edvora-ink-strong)]">
            Upload checklist
          </h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              One column per calendar day of the selected month.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              Excel dropdowns for P / A / L / HD / LV, or type the same codes.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              {isStaff
                ? "Matching uses employeeId (or staffId / email)."
                : "Matching uses admissionNumber (or roll / email)."}
            </li>
            <li className="flex gap-2">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              Future dates are blocked. Empty cells are skipped. Existing marks for filled days are updated.
            </li>
          </ul>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="rounded-xl bg-[color:var(--edvora-primary-soft)] px-3 py-3 text-center">
              <p className="text-xs text-[color:var(--edvora-ink-strong)]/80">People</p>
              <p className="text-xl font-bold text-[color:var(--edvora-ink-strong)]">
                {people.length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-3 text-center">
              <p className="text-xs text-emerald-700/80">Marks</p>
              <p className="text-xl font-bold text-emerald-700">{markedCount}</p>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-3 text-center">
              <p className="text-xs text-amber-700/80">Days open</p>
              <p className="text-xl font-bold text-amber-700">{writableDays.length}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !markedCount}
            className="w-full h-12 rounded-xl bg-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-hover)] text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading…" : "Validate & Upload"}
          </button>
        </div>
      </section>

      {people.length > 0 ? (
        <section className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-[color:var(--edvora-ink-strong)]">
              Monthly grid
            </h3>
            <p className="text-sm text-slate-500">
              Edit any cell here — dropdown or typed codes both work. Grey days are in the future.
            </p>
          </div>
          <div className="table-scroll">
            <table className="w-full min-w-[920px] border-collapse">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 text-left text-xs font-semibold text-slate-700 sticky left-0 bg-slate-100 z-10">
                    {isStaff ? "Staff" : "Student"}
                  </th>
                  <th className="p-2 text-left text-xs font-semibold text-slate-700">
                    ID
                  </th>
                  {monthDays.map((day) => (
                    <th
                      key={day.iso}
                      className={`p-1 text-center text-[10px] font-semibold ${
                        day.isFuture ? "text-slate-400 bg-slate-50" : "text-slate-700"
                      }`}
                    >
                      <div>{day.day}</div>
                      <div className="font-medium opacity-70">{day.weekday}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.identifier} className="border-t border-slate-100">
                    <td className="p-2 text-sm font-medium text-slate-800 sticky left-0 bg-white z-10 min-w-[140px]">
                      {person.name || "—"}
                    </td>
                    <td className="p-2 text-xs text-slate-500 whitespace-nowrap">
                      {person.identifier || <span className="text-rose-500">Missing</span>}
                    </td>
                    {monthDays.map((day) => (
                      <td key={`${person.identifier}-${day.iso}`} className="p-1">
                        {day.isFuture ? (
                          <div className="h-8 rounded-md bg-slate-100 text-center text-[10px] leading-8 text-slate-400">
                            —
                          </div>
                        ) : (
                          <select
                            value={person.days?.[day.iso] || ""}
                            onChange={(e) =>
                              setDayStatus(person.identifier, day.iso, e.target.value)
                            }
                            title={day.iso}
                            className="h-8 w-14 rounded-md border border-slate-200 bg-white text-center text-[11px] font-semibold text-slate-700 outline-none focus:border-[color:var(--edvora-primary)]"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value || "blank"} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {result ? (
        <section className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600" size={18} />
            <h3 className="text-lg font-semibold text-[color:var(--edvora-ink-strong)]">
              Upload result
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-emerald-50 px-3 py-3">
              <p className="text-xs text-emerald-700">Valid marks</p>
              <p className="text-xl font-bold text-emerald-700">
                {result?.summary?.valid ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-rose-50 px-3 py-3">
              <p className="text-xs text-rose-700">Invalid</p>
              <p className="text-xl font-bold text-rose-700">
                {result?.summary?.invalid ?? result?.errors?.length ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-[color:var(--edvora-primary-soft)] px-3 py-3">
              <p className="text-xs text-[color:var(--edvora-ink-strong)]">Days saved</p>
              <p className="text-xl font-bold text-[color:var(--edvora-ink-strong)]">
                {result?.summary?.days ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-3">
              <p className="text-xs text-amber-700">Absent</p>
              <p className="text-xl font-bold text-amber-700">
                {result?.summary?.ABSENT ?? 0}
              </p>
            </div>
          </div>

          {Array.isArray(result.errors) && result.errors.length > 0 ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
              <p className="text-sm font-semibold text-rose-700 mb-2">
                Row issues ({result.errors.length})
              </p>
              <ul className="space-y-1 max-h-40 overflow-y-auto text-sm text-rose-700">
                {result.errors.slice(0, 20).map((err, idx) => (
                  <li key={`${err.line}-${idx}`}>
                    Line {err.line}
                    {err.date ? ` (${err.date})` : ""}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-hover)] px-5 h-11 text-sm font-semibold text-white"
          >
            Back to attendance
          </button>
        </section>
      ) : null}
    </div>
  );
}

export default BulkAttendanceUpload;
