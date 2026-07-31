import { useEffect, useState } from "react";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";
import { getUserRole } from "../../../utils/auth";
import { classLabel, getMyTimetable } from "../../../utils/timetableApi";
import TimetableGridView from "./TimetableGridView";

export default function MyTimetable() {
  const role = getUserRole();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const result = await getMyTimetable();
        if (!cancelled) setData(result);
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message || "Failed to load timetable",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading your timetable…" />
      </div>
    );
  }

  const workingDays = data?.settings?.workingDays || [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
  ];

  const context = data?.context;
  let subtitle = "Your published weekly schedule.";
  if (role === "TEACHER") {
    subtitle = "Your teaching schedule across classes.";
  } else if (context?.class) {
    subtitle = `Class: ${classLabel(context.class)}`;
    if (context.child) {
      subtitle = `${[context.child.firstName, context.child.lastName]
        .filter(Boolean)
        .join(" ")} · ${subtitle}`;
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-[#735366] sm:text-2xl">
          My Timetable
        </h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      {!data?.slots?.length && !data?.entries?.length ? (
        <div className="rounded-xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            {data?.message ||
              "No published timetable is available yet. Check back after your school publishes schedules."}
          </p>
        </div>
      ) : (
        <TimetableGridView
          workingDays={workingDays}
          slots={data?.slots || []}
          entries={
            data?.entries ||
            data?.timetable?.entries ||
            []
          }
          readOnly
          showClass={role === "TEACHER"}
        />
      )}
    </div>
  );
}
