import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";
import { getRoomTimetable } from "../../../utils/timetableApi";
import TimetableGridView from "./TimetableGridView";
import { AcademicYearPicker, useAcademicYear } from "./useAcademicYear";

export default function RoomTimetable() {
  const { roomId } = useParams();
  const { yearId, setYearId, yearOptions, loading: yearLoading } =
    useAcademicYear();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [includeDrafts, setIncludeDrafts] = useState(false);

  useEffect(() => {
    if (!yearId || !roomId) {
      setData(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const result = await getRoomTimetable(yearId, roomId, !includeDrafts);
        if (!cancelled) setData(result);
      } catch (error) {
        if (!cancelled) {
          openSnackbar({
            message:
              error?.response?.data?.message || "Failed to load room timetable",
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
  }, [yearId, roomId, includeDrafts]);

  const workingDays = data?.settings?.workingDays || [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
  ];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/timetable/rooms"
            className="mb-2 inline-flex items-center gap-1 text-sm text-[color:var(--edvora-primary)] hover:underline"
          >
            <ArrowLeft size={14} /> Back to rooms
          </Link>
          <h1 className="text-xl font-semibold text-[color:var(--edvora-ink-strong)] sm:text-2xl">
            {data?.room
              ? `${data.room.name} (${data.room.code})`
              : "Room Timetable"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Room utilization across classes.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <AcademicYearPicker
            yearId={yearId}
            yearOptions={yearOptions}
            onChange={setYearId}
          />
          <label className="flex items-center gap-2 pb-2 text-sm text-[#667085]">
            <input
              type="checkbox"
              checked={includeDrafts}
              onChange={(e) => setIncludeDrafts(e.target.checked)}
            />
            Include drafts
          </label>
        </div>
      </div>

      {yearLoading || loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <EdvoraLoader message="Loading…" />
        </div>
      ) : (
        <TimetableGridView
          workingDays={workingDays}
          slots={data?.slots || []}
          entries={data?.entries || []}
          readOnly
          showClass
        />
      )}
    </div>
  );
}
