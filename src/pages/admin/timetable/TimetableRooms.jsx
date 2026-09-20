import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DoorOpen, Plus, X } from "lucide-react";
import CustomSelect from "../../../common/CustomSelect";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";
import {
  ROOM_TYPES,
  createRoom,
  listRooms,
  updateRoom,
} from "../../../utils/timetableApi";
import TimetableSubnav from "./TimetableSubnav";

const inputClass =
  "w-full h-[42px] rounded-lg border border-[#D0D5DD] bg-white px-3 text-[14px] text-[#344054] outline-none focus:border-[color:var(--edvora-primary)]";
const labelClass = "block text-[13px] font-semibold text-[#667085] mb-1.5";
const EMPTY = { name: "", type: "CLASSROOM", capacity: 40 };

function RoomModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name || "",
          type: initial.type || "CLASSROOM",
          capacity: initial.capacity || 40,
        }
      : EMPTY
  );
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initial?._id);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      return openSnackbar({
        message: "Name is required",
        variant: "warning",
      });
    }
    try {
      setSubmitting(true);
      const payload = {
        name: form.name,
        type: form.type,
        capacity: form.capacity,
      };
      const saved = isEdit
        ? await updateRoom({ roomId: initial._id, ...payload })
        : await createRoom(payload);
      openSnackbar({
        message: isEdit ? "Room updated" : "Room created",
        variant: "success",
      });
      onSaved?.(saved);
      onClose();
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to save room",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
      <div className="w-full max-w-[480px] rounded-[14px] bg-white shadow-2xl">
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]">
              <DoorOpen size={18} />
            </span>
            <h2 className="text-base font-semibold text-[#111827]">
              {isEdit ? "Edit Room" : "Add Room"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          {isEdit && initial?.code ? (
            <div>
              <label className={labelClass}>Code</label>
              <div className="flex h-[42px] items-center justify-between rounded-lg border border-[#D0D5DD] bg-[#F9FAFB] px-3 text-sm font-semibold text-[color:var(--edvora-ink-strong)]">
                <span>{initial.code}</span>
                <span className="text-[11px] font-medium text-[#98A2B3]">
                  Auto-generated
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#667085]">
              A unique room code will be generated automatically for this school.
            </p>
          )}
          <div>
            <label className={labelClass}>Type</label>
            <CustomSelect
              options={ROOM_TYPES}
              value={form.type}
              onChange={(opt) =>
                setForm((p) => ({ ...p, type: opt?.value || "CLASSROOM" }))
              }
            />
          </div>
          <div>
            <label className={labelClass}>Capacity</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={form.capacity}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  capacity: Number(e.target.value) || 1,
                }))
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] rounded-lg border border-[#D0D5DD] px-4 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="h-[42px] rounded-lg bg-[color:var(--edvora-primary)] px-4 text-sm font-medium text-white hover:bg-[color:var(--edvora-primary-hover)] disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TimetableRooms() {
  const [rooms, setRooms] = useState([]);
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async (st = status) => {
    try {
      setLoading(true);
      const result = await listRooms(st);
      setRooms(result.data);
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to load rooms",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(status);
  }, [status]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[color:var(--edvora-ink-strong)] sm:text-2xl">
            Rooms
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Classrooms, labs, and shared spaces for timetable booking.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal(EMPTY)}
          className="inline-flex h-[42px] items-center gap-2 rounded-lg bg-[color:var(--edvora-primary)] px-4 text-sm font-medium text-white hover:bg-[color:var(--edvora-primary-hover)]"
        >
          <Plus size={16} /> Add Room
        </button>
      </div>

      <TimetableSubnav />

      <div className="mb-4 flex gap-2">
        {["ACTIVE", "INACTIVE"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              status === s
                ? "bg-[color:var(--edvora-primary)] text-white"
                : "border border-[color:var(--edvora-border)] bg-white text-[color:var(--edvora-ink-strong)]"
            }`}
          >
            {s === "ACTIVE" ? "Active" : "Inactive"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <EdvoraLoader message="Loading rooms…" />
        </div>
      ) : !rooms.length ? (
        <div className="rounded-xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">No rooms found.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-[color:var(--edvora-primary)]/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]">
                    <DoorOpen size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-[color:var(--edvora-ink-strong)]">{room.name}</p>
                    <p className="text-xs text-slate-500">
                      {room.code} · {room.type} · Cap {room.capacity}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModal(room)}
                  className="rounded-lg border border-[color:var(--edvora-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--edvora-ink-strong)]"
                >
                  Edit
                </button>
                <Link
                  to={`/admin/timetable/room/${room._id}`}
                  className="rounded-lg border border-[color:var(--edvora-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--edvora-primary)]"
                >
                  View schedule
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <RoomModal
          initial={modal._id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={() => load(status)}
        />
      )}
    </div>
  );
}
