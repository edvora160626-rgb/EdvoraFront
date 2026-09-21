import { useEffect, useState } from "react";
import { examApi, formatExamDate } from "../../../utils/examApi";
import { getExamRoleLabel } from "../../../utils/portalMode";
import { PageHeader, Pill, Surface } from "../components/ExamUI";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";

const FILTERS = [
  { value: "", label: "All" },
  { value: "EXAM_CANDIDATE", label: "Candidate" },
  { value: "EXAM_ADMIN", label: "Admin" },
];

export default function AdminUsers({
  lockedRole = "",
  module = "Admin",
  title = "Users",
  description = "Manage examination portal accounts.",
  showFilters = true,
}) {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(lockedRole);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setFilter(lockedRole);
  }, [lockedRole]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const role = lockedRole || filter || undefined;
        const data = await examApi.staffUsers(role);
        if (alive) setUsers(data || []);
      } catch (error) {
        openSnackbar({ message: error.message, variant: "error" });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [filter, lockedRole]);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader module={module} title={title} description={description} />

      {showFilters && !lockedRole ? (
        <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl border border-[#e8d5e0] bg-[#fdf8fb] p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value || "all"}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-lg min-h-9 text-[11px] sm:text-xs font-bold transition ${
                filter === f.value
                  ? "bg-white text-[#5c3050] shadow-sm"
                  : "text-[#a77a95] hover:text-[#5c3050]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <EdvoraLoader message="Loading users…" />
        </div>
      ) : (
        <Surface className="overflow-hidden !p-0">
          {users.length === 0 ? (
            <p className="px-5 py-10 text-center rs-body text-[#735366]/65">
              No users found.
            </p>
          ) : (
            <ul className="divide-y divide-[#f0e4eb]">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <p className="rs-body font-semibold text-[#3d1f33]">
                      {[u.firstName, u.lastName].filter(Boolean).join(" ")}
                    </p>
                    <p className="rs-caption text-[#735366]/65">
                      {u.email} · {u.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Pill>{getExamRoleLabel(u.role)}</Pill>
                    <Pill tone={u.status === "ACTIVE" ? "success" : "warn"}>
                      {u.status}
                    </Pill>
                    <span className="rs-caption text-[#735366]/50">
                      {formatExamDate(u.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      )}
    </div>
  );
}
